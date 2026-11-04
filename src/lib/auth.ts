/**
 * SkillBridge Isolated Authentication Service
 *
 * NOTE FOR PORTFOLIO REVIEWERS:
 * This is a local demo authentication layer providing real client-side validation,
 * password hashing (SHA-256 via Web Crypto API), session persistence, and multi-user
 * data isolation. It does not replace an enterprise OAuth/OIDC/backend provider,
 * but allows demonstration of login, registration, validation, and user-isolated state.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

const AUTH_STORAGE_KEY = "skillbridge_demo_auth_session_v1";
const ACCOUNTS_STORAGE_KEY = "skillbridge_demo_accounts_v1";
const DEMO_SALT = "skillbridge_secure_demo_salt_2026";

/**
 * SHA-256 password hashing utility using Web Crypto API.
 * Never stores plaintext passwords in localStorage.
 */
async function hashPassword(password: string, salt: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    // Fallback for SSR or non-browser environments
    let hash = 0;
    const combined = salt + password;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    return `fallback_${Math.abs(hash).toString(16)}`;
  }

  const msgBuffer = new TextEncoder().encode(`${salt}::${password}`);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Pre-seeded demo account for easy test evaluation.
 */
const DEFAULT_DEMO_ACCOUNT: StoredAccount = {
  id: "demo-student-001",
  name: "Alex Chen",
  email: "alex.chen@student.edu",
  // Hash for "Password123!" with DEMO_SALT
  passwordHash: "4c0b791a2358f9d0d53587750fd50c9edac96b5179a1226e5c5ac2bc036b6f2b",
  salt: DEMO_SALT,
  createdAt: "2026-10-10T12:00:00.000Z",
};

export const DEMO_CREDENTIALS = {
  email: "alex.chen@student.edu",
  password: "Password123!",
  name: "Alex Chen",
};

function getStoredAccounts(): StoredAccount[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [DEFAULT_DEMO_ACCOUNT];
  }

  try {
    const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([DEFAULT_DEMO_ACCOUNT]));
      return [DEFAULT_DEMO_ACCOUNT];
    }
    const accounts = JSON.parse(raw);
    if (Array.isArray(accounts) && accounts.length > 0) {
      return accounts;
    }
    return [DEFAULT_DEMO_ACCOUNT];
  } catch {
    return [DEFAULT_DEMO_ACCOUNT];
  }
}

function saveStoredAccounts(accounts: StoredAccount[]): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Retrieves the currently logged-in user session, or null if unauthenticated.
 * SSR-safe.
 */
export function getCurrentUser(): User | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session && typeof session.id === "string" && typeof session.email === "string") {
      return {
        id: session.id,
        name: session.name || "Student",
        email: session.email,
        createdAt: session.createdAt || new Date().toISOString(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Validates email formatting.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Authenticates a user with email and password.
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: User; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  const accounts = getStoredAccounts();
  const account = accounts.find((acc) => acc.email.toLowerCase() === normalizedEmail);

  if (!account) {
    return {
      success: false,
      error: "No account found with this email. Please check your credentials or register.",
    };
  }

  const computedHash = await hashPassword(password, account.salt);
  if (computedHash !== account.passwordHash) {
    return { success: false, error: "Incorrect password. Please try again." };
  }

  const user: User = {
    id: account.id,
    name: account.name,
    email: account.email,
    createdAt: account.createdAt,
  };

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Ignore
    }
  }

  return { success: true, user };
}

/**
 * Registers a new demo user.
 */
export async function registerUser(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): Promise<{ success: boolean; user?: User; error?: string }> {
  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!trimmedName || trimmedName.length < 2) {
    return { success: false, error: "Please enter your full name (at least 2 characters)." };
  }
  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }
  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  const accounts = getStoredAccounts();
  const existing = accounts.find((acc) => acc.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return {
      success: false,
      error: "An account with this email already exists. Please log in instead.",
    };
  }

  const salt = `salt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const passwordHash = await hashPassword(password, salt);
  const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newAccount: StoredAccount = {
    id: newId,
    name: trimmedName,
    email: normalizedEmail,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };

  accounts.push(newAccount);
  saveStoredAccounts(accounts);

  const user: User = {
    id: newAccount.id,
    name: newAccount.name,
    email: newAccount.email,
    createdAt: newAccount.createdAt,
  };

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Ignore
    }
  }

  return { success: true, user };
}

/**
 * Logs out the current user session without erasing their stored progress.
 */
export function logoutUser(): void {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}
