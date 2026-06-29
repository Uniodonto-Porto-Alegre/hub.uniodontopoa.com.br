export type LoginPayload = {
  username: string;
  password: string;
};

export type AuthenticatedUser = {
  username: string;
  displayName?: string;
  email?: string;
  groups?: string[];
};

export type LoginResult = {
  token: string;
  user: AuthenticatedUser;
};

type CurrentUserResponse = {
  user?: ApiLoginResponse['user'];
  profile?: ApiLoginResponse['user'];
  usuario?: ApiLoginResponse['user'];
  authMode?: 'jwt' | 'session';
  message?: string;
  error?: string;
};

type ApiLoginResponse = {
  token?: string;
  access_token?: string;
  jwt?: string;
  id_token?: string;
  user?: {
    username?: string;
    login?: string;
    samAccountName?: string;
    sAMAccountName?: string;
    displayName?: string;
    display_name?: string;
    name?: string;
    fullName?: string;
    nome?: string;
    cn?: string;
    given_name?: string;
    givenName?: string;
    family_name?: string;
    surname?: string;
    sn?: string;
    upn?: string;
    preferred_username?: string;
    unique_name?: string;
    email?: string;
    mail?: string;
  };
  data?: ApiLoginResponse;
  result?: ApiLoginResponse;
  payload?: ApiLoginResponse;
  profile?: ApiLoginResponse['user'];
  usuario?: ApiLoginResponse['user'];
  username?: string;
  login?: string;
  samAccountName?: string;
  sAMAccountName?: string;
  displayName?: string;
  display_name?: string;
  name?: string;
  fullName?: string;
  nome?: string;
  cn?: string;
  given_name?: string;
  givenName?: string;
  family_name?: string;
  surname?: string;
  sn?: string;
  upn?: string;
  preferred_username?: string;
  unique_name?: string;
  email?: string;
  mail?: string;
  message?: string;
  error?: string;
};

type TokenClaims = {
  name?: string;
  displayName?: string;
  display_name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  unique_name?: string;
  upn?: string;
  email?: string;
  mail?: string;
  samaccountname?: string;
  sAMAccountName?: string;
  [key: string]: unknown;
};

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL?.trim() || '/api/auth/login';
const AUTH_ME_URL = AUTH_API_URL.replace(/\/login\/?$/, '/me');
const AUTH_LOGOUT_URL = AUTH_API_URL.replace(/\/login\/?$/, '/logout');

const firstNonEmpty = (...values: Array<string | undefined>) => {
  return values.find((value) => value?.trim())?.trim();
};

const buildNameFromParts = (...values: Array<string | undefined>) => {
  const parts = values.map((value) => value?.trim()).filter(Boolean);

  return parts.length ? parts.join(' ') : undefined;
};

const buildFirstAndLastName = (
  firstName?: string,
  alternateFirstName?: string,
  lastName?: string,
  alternateLastName?: string,
  fallbackLastName?: string,
) => {
  return buildNameFromParts(
    firstNonEmpty(firstName, alternateFirstName),
    firstNonEmpty(lastName, alternateLastName, fallbackLastName),
  );
};

const decodeJwtClaims = (token: string): TokenClaims | null => {
  const segments = token.split('.');

  if (segments.length < 2) {
    return null;
  }

  try {
    const payloadSegment = segments[1];

    if (!payloadSegment) {
      return null;
    }

    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);

    return JSON.parse(json) as TokenClaims;
  } catch {
    return null;
  }
};

const unwrapResponse = (response: ApiLoginResponse): ApiLoginResponse => {
  return response.data ?? response.result ?? response.payload ?? response;
};

const mapResponseToLoginResult = (
  response: ApiLoginResponse,
  fallbackUsername: string,
): LoginResult => {
  const unwrappedResponse = unwrapResponse(response);
  const token = firstNonEmpty(
    unwrappedResponse.token,
    unwrappedResponse.access_token,
    unwrappedResponse.jwt,
    unwrappedResponse.id_token,
  );

  if (!token) {
    throw new Error('A autenticação foi concluída sem token de acesso.');
  }

  const tokenClaims = decodeJwtClaims(token);
  const user = unwrappedResponse.user ?? unwrappedResponse.profile ?? unwrappedResponse.usuario;
  const username = firstNonEmpty(
    user?.username,
    user?.login,
    user?.samAccountName,
    user?.sAMAccountName,
    user?.preferred_username,
    user?.unique_name,
    user?.upn,
    unwrappedResponse.username,
    unwrappedResponse.login,
    unwrappedResponse.samAccountName,
    unwrappedResponse.sAMAccountName,
    unwrappedResponse.preferred_username,
    unwrappedResponse.unique_name,
    unwrappedResponse.upn,
    typeof tokenClaims?.preferred_username === 'string' ? tokenClaims.preferred_username : undefined,
    typeof tokenClaims?.unique_name === 'string' ? tokenClaims.unique_name : undefined,
    typeof tokenClaims?.upn === 'string' ? tokenClaims.upn : undefined,
    typeof tokenClaims?.samaccountname === 'string' ? tokenClaims.samaccountname : undefined,
    typeof tokenClaims?.sAMAccountName === 'string' ? tokenClaims.sAMAccountName : undefined,
    fallbackUsername,
  );

  if (!username) {
    throw new Error('A resposta de autenticação não informou o usuário autenticado.');
  }

  return {
    token,
    user: {
      username,
      displayName: firstNonEmpty(
        user?.displayName,
        user?.display_name,
        user?.name,
        user?.fullName,
        user?.nome,
        user?.cn,
        buildFirstAndLastName(user?.given_name, user?.givenName, user?.family_name, user?.surname, user?.sn),
        unwrappedResponse.displayName,
        unwrappedResponse.display_name,
        unwrappedResponse.name,
        unwrappedResponse.fullName,
        unwrappedResponse.nome,
        unwrappedResponse.cn,
        buildFirstAndLastName(
          unwrappedResponse.given_name,
          unwrappedResponse.givenName,
          unwrappedResponse.family_name,
          unwrappedResponse.surname,
          unwrappedResponse.sn,
        ),
        typeof tokenClaims?.displayName === 'string' ? tokenClaims.displayName : undefined,
        typeof tokenClaims?.display_name === 'string' ? tokenClaims.display_name : undefined,
        typeof tokenClaims?.name === 'string' ? tokenClaims.name : undefined,
        buildFirstAndLastName(
          typeof tokenClaims?.given_name === 'string' ? tokenClaims.given_name : undefined,
          undefined,
          typeof tokenClaims?.family_name === 'string' ? tokenClaims.family_name : undefined,
          undefined,
          undefined,
        ),
      ),
      email: firstNonEmpty(
        user?.email,
        user?.mail,
        unwrappedResponse.email,
        unwrappedResponse.mail,
        typeof tokenClaims?.email === 'string' ? tokenClaims.email : undefined,
        typeof tokenClaims?.mail === 'string' ? tokenClaims.mail : undefined,
      ),
    },
  };
};

export const loginWithAd = async ({ username, password }: LoginPayload): Promise<LoginResult> => {
  const response = await fetch(AUTH_API_URL, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  let body: ApiLoginResponse | null = null;

  try {
    body = (await response.json()) as ApiLoginResponse;
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message = firstNonEmpty(body?.message, body?.error) || 'Não foi possível autenticar com o Active Directory.';
    throw new Error(message);
  }

  if (!body) {
    throw new Error('O backend retornou uma resposta vazia para a autenticação.');
  }

  return mapResponseToLoginResult(body, username);
};

export const getCurrentAuthenticatedUser = async (token?: string): Promise<AuthenticatedUser | null> => {
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(AUTH_ME_URL, {
    method: 'GET',
    credentials: 'include',
    headers,
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Não foi possível validar a sessão atual.');
  }

  const body = (await response.json()) as CurrentUserResponse;
  const user = body.user ?? body.profile ?? body.usuario;

  if (!user) {
    return null;
  }

  return {
    username: firstNonEmpty(user.username, user.login, user.samAccountName, user.sAMAccountName, user.upn) || '',
    displayName: firstNonEmpty(
      user.displayName,
      user.display_name,
      user.name,
      user.fullName,
      user.nome,
      user.cn,
      buildFirstAndLastName(user.given_name, user.givenName, user.family_name, user.surname, user.sn),
    ),
    email: firstNonEmpty(user.email, user.mail),
  };
};

export const logoutFromAd = async (token?: string) => {
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  await fetch(AUTH_LOGOUT_URL, {
    method: 'POST',
    credentials: 'include',
    headers,
  }).catch(() => undefined);
};

export const authApiConfig = {
  loginUrl: AUTH_API_URL,
  meUrl: AUTH_ME_URL,
  logoutUrl: AUTH_LOGOUT_URL,
};