import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const envPath = path.resolve(currentDir, '..', '.env');

dotenv.config({ path: envPath });

const parseBoolean = (value, defaultValue) => {
  if (value == null || value === '') {
    return defaultValue;
  }

  return value.toLowerCase() === 'true';
};

const parseOrigins = (value) => {
  if (!value?.trim()) {
    return ['http://localhost:5173'];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const parseNumber = (value, defaultValue) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

export const config = {
  port: Number(process.env.PORT || 3000),
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
  authMode: process.env.AUTH_MODE === 'session' ? 'session' : 'jwt',
  jwtSecret: process.env.JWT_SECRET || 'troque-esta-chave-em-producao',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  sessionSecret: process.env.SESSION_SECRET || 'troque-esta-chave-em-producao',
  ldap: {
    url: process.env.LDAP_URL || '',
    baseDn: process.env.LDAP_BASE_DN || '',
    bindDn: process.env.LDAP_BIND_DN || '',
    bindPassword: process.env.LDAP_BIND_PASSWORD || '',
    upnSuffix: process.env.LDAP_UPN_SUFFIX || '',
    netbiosDomain: process.env.LDAP_NETBIOS_DOMAIN || '',
    searchFilter: process.env.LDAP_SEARCH_FILTER || '(&(objectClass=user)(sAMAccountName={{username}}))',
    rejectUnauthorized: parseBoolean(process.env.LDAP_REJECT_UNAUTHORIZED, true),
  },
  testAuth: {
    enabled: parseBoolean(process.env.TEST_AUTH_ENABLED, false),
    username: (process.env.TEST_AUTH_USERNAME || '').trim(),
    password: process.env.TEST_AUTH_PASSWORD || '',
    displayName: (process.env.TEST_AUTH_DISPLAY_NAME || 'Usuario de Teste').trim(),
    email: (process.env.TEST_AUTH_EMAIL || 'teste@uniodontopoa.com.br').trim(),
  },
    sqlServer: {
      server: (process.env.SQL_SERVER_HOST || '').trim(),
      port: parseNumber(process.env.SQL_SERVER_PORT, 1433),
      database: (process.env.SQL_SERVER_DATABASE || '').trim(),
      user: (process.env.SQL_SERVER_USER || '').trim(),
      password: process.env.SQL_SERVER_PASSWORD || '',
      encrypt: parseBoolean(process.env.SQL_SERVER_ENCRYPT, false),
      trustServerCertificate: parseBoolean(process.env.SQL_SERVER_TRUST_CERT, true),
    },
};

export const getSqlServerConfigErrors = () => {
  const missing = [];

  if (!config.sqlServer.server) {
    missing.push('SQL_SERVER_HOST');
  }

  if (!config.sqlServer.database) {
    missing.push('SQL_SERVER_DATABASE');
  }

  if (!config.sqlServer.user) {
    missing.push('SQL_SERVER_USER');
  }

  if (!config.sqlServer.password) {
    missing.push('SQL_SERVER_PASSWORD');
  }

  return missing;
};

export const getSafeConfigSummary = () => {
  return {
    port: config.port,
    authMode: config.authMode,
    corsOrigins: config.corsOrigins,
    ldap: {
      url: config.ldap.url,
      baseDn: config.ldap.baseDn,
      bindDnConfigured: Boolean(config.ldap.bindDn),
      bindPasswordConfigured: Boolean(config.ldap.bindPassword),
      upnSuffix: config.ldap.upnSuffix,
      netbiosDomain: config.ldap.netbiosDomain,
      searchFilter: config.ldap.searchFilter,
      rejectUnauthorized: config.ldap.rejectUnauthorized,
    },
    testAuth: {
      enabled: config.testAuth.enabled,
      usernameConfigured: Boolean(config.testAuth.username),
      passwordConfigured: Boolean(config.testAuth.password),
    },
    sqlServer: {
      serverConfigured: Boolean(config.sqlServer.server),
      port: config.sqlServer.port,
      databaseConfigured: Boolean(config.sqlServer.database),
      userConfigured: Boolean(config.sqlServer.user),
      passwordConfigured: Boolean(config.sqlServer.password),
      encrypt: config.sqlServer.encrypt,
      trustServerCertificate: config.sqlServer.trustServerCertificate,
    },
  };
};

export const validateConfig = () => {
  const missing = [];

  if (!config.ldap.url) {
    missing.push('LDAP_URL');
  }

  if (!config.ldap.baseDn) {
    missing.push('LDAP_BASE_DN');
  }

  if (config.authMode === 'jwt' && !process.env.JWT_SECRET) {
    missing.push('JWT_SECRET');
  }

  if (config.authMode === 'session' && !process.env.SESSION_SECRET) {
    missing.push('SESSION_SECRET');
  }

  if (missing.length > 0) {
    throw new Error(`Variáveis obrigatórias ausentes: ${missing.join(', ')}`);
  }
};