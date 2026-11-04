import { beforeEach, describe, expect, it } from "vitest";
import {
  getCurrentUser,
  isValidEmail,
  loginUser,
  logoutUser,
  registerUser,
  DEMO_CREDENTIALS,
} from "../lib/auth";

describe("Isolated Authentication Service", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("validates email formats correctly", () => {
    expect(isValidEmail("student@university.edu")).toBe(true);
    expect(isValidEmail("invalid-email")).toBe(false);
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("test@domain")).toBe(false);
  });

  it("logs in with pre-seeded demo credentials", async () => {
    const result = await loginUser(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.email).toBe(DEMO_CREDENTIALS.email);

    // Verify session is active
    const session = getCurrentUser();
    expect(session?.email).toBe(DEMO_CREDENTIALS.email);
  });

  it("rejects login with incorrect password", async () => {
    const result = await loginUser(DEMO_CREDENTIALS.email, "WrongPassword999!");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Incorrect password");
  });

  it("registers a new student account with validation and password hashing", async () => {
    const regResult = await registerUser(
      "Sarah Connor",
      "sarah.c@tech.edu",
      "Secret123!",
      "Secret123!",
    );

    expect(regResult.success).toBe(true);
    expect(regResult.user?.name).toBe("Sarah Connor");
    expect(regResult.user?.email).toBe("sarah.c@tech.edu");

    // Verify plaintext password is NEVER stored in localStorage
    const rawStorage = JSON.stringify(window.localStorage);
    expect(rawStorage).not.toContain("Secret123!");

    // Verify user can now log in
    logoutUser();
    expect(getCurrentUser()).toBeNull();

    const loginRes = await loginUser("sarah.c@tech.edu", "Secret123!");
    expect(loginRes.success).toBe(true);
    expect(loginRes.user?.name).toBe("Sarah Connor");
  });

  it("prevents duplicate account registration with the same email", async () => {
    const first = await registerUser(
      "User One",
      "duplicate@test.edu",
      "Password123!",
      "Password123!",
    );
    expect(first.success).toBe(true);

    const duplicate = await registerUser(
      "User Two",
      "duplicate@test.edu",
      "Password123!",
      "Password123!",
    );
    expect(duplicate.success).toBe(false);
    expect(duplicate.error).toContain("already exists");
  });

  it("rejects registration when confirm password does not match", async () => {
    const mismatch = await registerUser(
      "Jane Doe",
      "jane@test.edu",
      "Password123!",
      "DifferentPassword!",
    );
    expect(mismatch.success).toBe(false);
    expect(mismatch.error).toContain("do not match");
  });

  it("clears user session on logout without erasing account data", async () => {
    await loginUser(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
    expect(getCurrentUser()).not.toBeNull();

    logoutUser();
    expect(getCurrentUser()).toBeNull();

    // Re-login succeeds
    const reLogin = await loginUser(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
    expect(reLogin.success).toBe(true);
  });

  it("prevents password bypass: newly registered user cannot be accessed with demo password", async () => {
    const regResult = await registerUser(
      "Marcus Brody",
      "marcus@university.edu",
      "MarcusUniquePass99!",
      "MarcusUniquePass99!",
    );
    expect(regResult.success).toBe(true);

    logoutUser();

    // Attempting login with default demo password must FAIL
    const breachAttempt = await loginUser("marcus@university.edu", "Password123!");
    expect(breachAttempt.success).toBe(false);
    expect(breachAttempt.error).toContain("Incorrect password");

    // Login with actual password succeeds
    const legitLogin = await loginUser("marcus@university.edu", "MarcusUniquePass99!");
    expect(legitLogin.success).toBe(true);
  });

  it("validates empty and short input values for login and registration", async () => {
    const emptyEmail = await loginUser("", "Password123!");
    expect(emptyEmail.success).toBe(false);

    const shortPass = await loginUser("valid@test.edu", "123");
    expect(shortPass.success).toBe(false);
    expect(shortPass.error).toContain("at least 6 characters");

    const shortName = await registerUser("A", "valid@test.edu", "Password123!", "Password123!");
    expect(shortName.success).toBe(false);
    expect(shortName.error).toContain("at least 2 characters");
  });

  it("rejects oversized input to prevent memory bloat", async () => {
    const longName = "A".repeat(80);
    const result = await registerUser(longName, "valid@test.edu", "Password123!", "Password123!");
    expect(result.success).toBe(false);
  });
});
