import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { getCurrentAuthenticatedUser } from '../services/auth';

type AuthSession = {
	token: string;
	username: string;
	displayName?: string;
	email?: string;
};

const TOKEN_KEY = 'user_token';
const SESSION_KEY = 'user_session';

const normalizeDisplayName = (value?: string) => {
	if (!value?.trim()) {
		return '';
	}

	return value
		.trim()
		.split(/\s+/)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
		.join(' ');
};

const formatUsernameAsName = (username: string) => {
	return username
		.trim()
		.replace(/[._-]+/g, ' ')
		.split(/\s+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
		.join(' ');
};

const readPersistedSession = (): AuthSession | null => {
	const token = sessionStorage.getItem(TOKEN_KEY);
	const rawSession = sessionStorage.getItem(SESSION_KEY);

	if (!token) {
		return null;
	}

	if (!rawSession) {
		return {
			token,
			username: '',
		};
	}

	try {
		const parsed = JSON.parse(rawSession) as Partial<AuthSession>;

		return {
			token,
			username: parsed.username?.trim() ?? '',
			displayName: normalizeDisplayName(parsed.displayName),
			email: parsed.email?.trim() ?? '',
		};
	} catch {
		return {
			token,
			username: '',
		};
	}
};

export const useAuthStore = defineStore('auth', () => {
	const persistedSession = readPersistedSession();
	const token = ref(persistedSession?.token ?? '');
	const username = ref(persistedSession?.username ?? '');
	const displayName = ref(persistedSession?.displayName ?? '');
	const email = ref(persistedSession?.email ?? '');

	const isAuthenticated = computed(() => Boolean(token.value));

	const effectiveDisplayName = computed(() => {
		if (displayName.value) {
			return displayName.value;
		}

		if (username.value) {
			return formatUsernameAsName(username.value);
		}

		return 'Usuário';
	});

	const userInitials = computed(() => {
		return effectiveDisplayName.value
			.split(/\s+/)
			.filter(Boolean)
			.map((part) => part[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	});

	const persistSession = () => {
		if (!token.value) {
			sessionStorage.removeItem(TOKEN_KEY);
			sessionStorage.removeItem(SESSION_KEY);
			return;
		}

		sessionStorage.setItem(TOKEN_KEY, token.value);
		sessionStorage.setItem(
			SESSION_KEY,
			JSON.stringify({
				token: token.value,
				username: username.value,
				displayName: displayName.value,
				email: email.value,
			}),
		);
	};

	const hydrateFromSession = () => {
		const session = readPersistedSession();

		token.value = session?.token ?? '';
		username.value = session?.username ?? '';
		displayName.value = session?.displayName ?? '';
		email.value = session?.email ?? '';
	};

	const validateSession = async () => {
		if (!token.value) {
			logout();
			return false;
		}

		try {
			const currentUser = await getCurrentAuthenticatedUser(token.value);

			if (!currentUser?.username) {
				logout();
				return false;
			}

			username.value = currentUser.username.trim();
			displayName.value = normalizeDisplayName(currentUser.displayName);
			email.value = currentUser.email?.trim() ?? '';
			persistSession();

			return true;
		} catch {
			logout();
			return false;
		}
	};

	const login = (session: AuthSession) => {
		token.value = session.token;
		username.value = session.username.trim();
		displayName.value = normalizeDisplayName(session.displayName);
		email.value = session.email?.trim() ?? '';
		persistSession();
	};

	const logout = () => {
		token.value = '';
		username.value = '';
		displayName.value = '';
		email.value = '';
		persistSession();
	};

	return {
		token,
		username,
		displayName,
		email,
		isAuthenticated,
		effectiveDisplayName,
		userInitials,
		hydrateFromSession,
		validateSession,
		login,
		logout,
	};
});
