/**
 * ============================================================================
 * CLIENT-SIDE DEMO AUTHENTICATION ONLY — NOT FOR PRODUCTION USE
 * ============================================================================
 * This module is a client-side authentication simulation engineered solely for
 * local evaluation, UI state demonstration, and multi-user data isolation.
 *
 * In a production system:
 * 1. Passwords must never be verified in the browser or exposed to client memory.
 * 2. Authentication must be handled by a secure backend or an identity provider
 *    (e.g., OAuth 2.0 / OIDC, Auth0, Clerk, Supabase Auth).
 * 3. Sessions must be managed via secure, HttpOnly, SameSite cookies or signed JWTs.
 * ============================================================================
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
const PBKDF2_ITERATIONS = 100_000;

/**
 * Pre-seeded demo account constants.
 * Seeded dynamically at runtime with a fresh PBKDF2 salt and hash.
 */
export const DEMO_CREDENTIALS = {
  email: "alex.chen@student.edu",
  password: "Password123!",
  name: "Alex Chen",
};

/**
 * Derives a PBKDF2 hash using HMAC-SHA-256 with 100,000 iterations.
 * Fails safely if Web Crypto API is unavailable.
 */
async function hashPassword(password: string, saltHex: string): Promise<string> {
  const subtle = typeof window !== "undefined" ? window.crypto?.subtle : globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error(
      "Web Crypto API (crypto.subtle) is required for password hashing but is unavailable.",
    );
  }

  const saltBytes = new Uint8Array(
    saltHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? [],
  );

  const enc = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const derivedBits = await subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    256, // 32 bytes (256 bits)
  );

  return Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generates a cryptographically random 16-byte salt as a hex string.
 * Fails safely if crypto.getRandomValues is unavailable.
 */
function generateSalt(): string {
  const cryptoObj = typeof window !== "undefined" ? window.crypto : globalThis.crypto;
  if (!cryptoObj?.getRandomValues) {
    throw new Error("Cryptographically secure random number generation is unavailable.");
  }
  const array = new Uint8Array(16);
  cryptoObj.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Generates a UUID for new users using crypto.randomUUID().
 */
function generateUserId(): string {
  const cryptoObj = typeof window !== "undefined" ? window.crypto : globalThis.crypto;
  if (typeof cryptoObj?.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }
  throw new Error("crypto.randomUUID is not supported in this environment.");
}

function getStoredAccounts(): StoredAccount[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return [];
    const accounts = JSON.parse(raw);
    return Array.isArray(accounts) ? accounts : [];
  } catch {
    return [];
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
 * Ensures the demo student account exists at runtime, seeded dynamically from constants.
 */
async function ensureDemoAccount(): Promise<StoredAccount[]> {
  const accounts = getStoredAccounts();
  const existing = accounts.find(
    (acc) => acc.email.toLowerCase() === DEMO_CREDENTIALS.email.toLowerCase(),
  );

  if (existing) {
    return accounts;
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(DEMO_CREDENTIALS.password, salt);
  const demoAccount: StoredAccount = {
    id: "demo-student-001",
    name: DEMO_CREDENTIALS.name,
    email: DEMO_CREDENTIALS.email.toLowerCase(),
    passwordHash,
    salt,
    createdAt: "2026-10-10T12:00:00.000Z",
  };

  accounts.unshift(demoAccount);
  saveStoredAccounts(accounts);
  return accounts;
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
 * Returns a single generic error on failure to prevent username enumeration.
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: User; error?: string }> {
  const GENERIC_ERROR = "Invalid email or password.";
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !isValidEmail(normalizedEmail) || normalizedEmail.length > 100) {
    return { success: false, error: GENERIC_ERROR };
  }
  if (!password || password.length < 6 || password.length > 128) {
    return { success: false, error: GENERIC_ERROR };
  }

  const accounts = await ensureDemoAccount();
  const account = accounts.find((acc) => acc.email.toLowerCase() === normalizedEmail);

  if (!account) {
    return { success: false, error: GENERIC_ERROR };
  }

  try {
    const computedHash = await hashPassword(password, account.salt);
    if (computedHash !== account.passwordHash) {
      return { success: false, error: GENERIC_ERROR };
    }
  } catch {
    return { success: false, error: GENERIC_ERROR };
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

  if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 70) {
    return { success: false, error: "Please enter your full name (at least 2 characters)." };
  }
  if (!normalizedEmail || !isValidEmail(normalizedEmail) || normalizedEmail.length > 100) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!password || password.length < 6 || password.length > 128) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }
  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  const accounts = await ensureDemoAccount();
  const existing = accounts.find((acc) => acc.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return {
      success: false,
      error: "An account with this email already exists. Please log in instead.",
    };
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const newId = generateUserId();

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
