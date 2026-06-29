import { Client } from 'ldapts';
import { config } from './config.js';

const LDAP_ATTRIBUTES = ['displayName', 'mail', 'cn', 'sAMAccountName', 'memberOf'];

const buildFriendlyLdapError = (error) => {
  if (!(error instanceof Error)) {
    return 'Falha ao autenticar no Active Directory.';
  }

  const message = error.message || '';
  const code = error.code;

  if (code === 49 || /49|0x31|invalidcredentials|invalid credentials|credential|52e|data 52/i.test(message)) {
    return 'Usuário ou senha inválidos.';
  }

  if (/no such object|32/i.test(message)) {
    return 'LDAP_BASE_DN ou LDAP_SEARCH_FILTER não localizaram o usuário no Active Directory.';
  }

  if (/self.?signed|unable to verify|certificate/i.test(message)) {
    return 'Falha no certificado LDAPS. Verifique LDAP_URL ou ajuste LDAP_REJECT_UNAUTHORIZED para false apenas no ambiente interno de teste.';
  }

  if (/getaddrinfo|enotfound/i.test(message)) {
    return 'Não foi possível resolver o host do Active Directory. Verifique LDAP_URL e DNS.';
  }

  if (/timeout|timed out|etimedout/i.test(message)) {
    return 'Tempo excedido ao conectar no Active Directory. Verifique rede, firewall e porta LDAP/LDAPS.';
  }

  if (/econnrefused|connect error/i.test(message)) {
    return 'Conexão recusada pelo servidor LDAP/LDAPS. Verifique host, porta e protocolo.';
  }

  if (/operations error|1/i.test(message)) {
    return 'O Active Directory exigiu bind de serviço para pesquisar o usuário. Preencha LDAP_BIND_DN e LDAP_BIND_PASSWORD.';
  }

  if (/strongerAuthRequired|8/i.test(message)) {
    return 'O servidor LDAP exige conexão segura. Use LDAPS em LDAP_URL.';
  }

  return message;
};

const escapeLdapValue = (value) => {
  return value.replace(/[*()\\\0]/g, (character) => {
    switch (character) {
      case '*':
        return '\\2a';
      case '(':
        return '\\28';
      case ')':
        return '\\29';
      case '\\':
        return '\\5c';
      case '\0':
        return '\\00';
      default:
        return character;
    }
  });
};

const createClient = () => {
  const isLdaps = config.ldap.url.toLowerCase().startsWith('ldaps://');
  return new Client({
    url: config.ldap.url,
    timeout: 5000,
    connectTimeout: 5000,
    ...(isLdaps && {
      tlsOptions: {
        rejectUnauthorized: config.ldap.rejectUnauthorized,
      },
    }),
  });
};

const normalizeUsername = (username) => {
  const trimmed = username.trim();

  if (trimmed.includes('\\')) {
    return trimmed.split('\\').pop() || trimmed;
  }

  if (trimmed.includes('@')) {
    return trimmed.split('@')[0] || trimmed;
  }

  return trimmed;
};

const buildPrincipalCandidates = (username) => {
  const trimmed = username.trim();

  if (trimmed.includes('\\') || trimmed.includes('@')) {
    return [trimmed];
  }

  const candidates = [];

  if (config.ldap.upnSuffix) {
    candidates.push(`${trimmed}@${config.ldap.upnSuffix}`);
  }

  if (config.ldap.netbiosDomain) {
    candidates.push(`${config.ldap.netbiosDomain}\\${trimmed}`);
  }

  candidates.push(trimmed);

  return [...new Set(candidates)];
};

const buildSearchFilter = (username) => {
  return config.ldap.searchFilter.replace('{{username}}', escapeLdapValue(normalizeUsername(username)));
};

const firstValue = (value) => {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' ? first : undefined;
  }

  return typeof value === 'string' ? value : undefined;
};

const parseGroups = (memberOf) => {
  const values = Array.isArray(memberOf) ? memberOf : memberOf ? [memberOf] : [];

  return values
    .map((dn) => {
      if (typeof dn !== 'string') {
        return null;
      }

      const match = dn.match(/CN=([^,]+)/i);
      return match?.[1] || null;
    })
    .filter(Boolean);
};

const mapEntryToUser = (entry, fallbackUsername) => {
  const displayName = firstValue(entry.displayName) || firstValue(entry.cn) || normalizeUsername(fallbackUsername);
  const username = firstValue(entry.sAMAccountName) || normalizeUsername(fallbackUsername);
  const email = firstValue(entry.mail);
  const groups = parseGroups(entry.memberOf);

  return {
    username,
    displayName,
    email,
    groups,
  };
};

const findUser = async (client, username) => {
  const { searchEntries } = await client.search(config.ldap.baseDn, {
    scope: 'sub',
    filter: buildSearchFilter(username),
    attributes: LDAP_ATTRIBUTES,
  });

  const entry = searchEntries[0];

  if (!entry) {
    throw new Error('Usuário ou senha inválidos.');
  }

  return entry;
};

const tryBind = async (principal, password) => {
  const client = createClient();
  try {
    await client.bind(principal, password);
    return client;
  } catch (error) {
    await client.unbind().catch(() => {});
    throw error;
  }
};

export const authenticateWithAd = async ({ username, password }) => {
  if (!username?.trim() || !password?.trim()) {
    throw new Error('Usuário e senha são obrigatórios.');
  }

  try {
    if (config.ldap.bindDn && config.ldap.bindPassword) {
      const serviceClient = createClient();
      let authClient;

      try {
        await serviceClient.bind(config.ldap.bindDn, config.ldap.bindPassword);
        const entry = await findUser(serviceClient, username);

        if (!entry.dn) {
          throw new Error('Não foi possível localizar o DN do usuário no Active Directory.');
        }

        authClient = await tryBind(entry.dn, password);
        return mapEntryToUser(entry, username);
      } finally {
        await Promise.allSettled([
          serviceClient.unbind(),
          authClient?.unbind(),
        ]);
      }
    }

    const principalCandidates = buildPrincipalCandidates(username);
    let authClient = null;
    let lastBindError = null;

    for (const principal of principalCandidates) {
      try {
        authClient = await tryBind(principal, password);
        break;
      } catch (error) {
        lastBindError = error;
      }
    }

    if (!authClient) {
      throw lastBindError || new Error('Usuário ou senha inválidos.');
    }

    try {
      const entry = await findUser(authClient, username);
      return mapEntryToUser(entry, username);
    } catch {
      return { username: normalizeUsername(username), displayName: undefined, email: undefined, groups: [] };
    } finally {
      await authClient.unbind().catch(() => {});
    }
  } catch (error) {
    throw new Error(buildFriendlyLdapError(error));
  }
};