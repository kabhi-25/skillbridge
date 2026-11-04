import { useState } from "react";
import { Eye, EyeOff, Info, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_CREDENTIALS, loginUser, registerUser, type User } from "@/lib/auth";

export interface AuthScreenProps {
  view: "login" | "register";
  onSwitchView: (view: "login" | "register") => void;
  onLoginSuccess: (user: User) => void;
}

export function AuthScreen({ view, onSwitchView, onLoginSuccess }: AuthScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleFillDemo() {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setErrorMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (view === "login") {
        const result = await loginUser(email, password);
        if (result.success && result.user) {
          onLoginSuccess(result.user);
        } else {
          setErrorMessage(result.error || "Invalid email or password.");
        }
      } else {
        const result = await registerUser(name, email, password, confirmPassword);
        if (result.success && result.user) {
          onLoginSuccess(result.user);
        } else {
          setErrorMessage(result.error || "Registration failed. Please check your input.");
        }
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card" role="main" aria-labelledby="auth-heading">
        <header className="auth-header">
          <div className="wordmark">
            <span className="wordmark-icon" aria-hidden="true">
              <Target size={19} />
            </span>
            <span>
              skillbridge<span className="wordmark-period">.</span>
            </span>
          </div>
          <h1 id="auth-heading">{view === "login" ? "Welcome back" : "Create your account"}</h1>
          <p>
            {view === "login"
              ? "Sign in to access your skill-to-role matching portfolio and roadmap."
              : "Register to track your technical proficiency and early-career goals."}
          </p>
        </header>

        {/* Demo Account Quick-Fill Hint */}
        {view === "login" && (
          <div className="auth-demo-hint">
            <div className="auth-demo-hint-title">
              <span>Demo Student Account</span>
              <button
                type="button"
                onClick={handleFillDemo}
                style={{
                  background: "transparent",
                  border: 0,
                  color: "var(--primary)",
                  cursor: "pointer",
                  fontSize: "9px",
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                Use demo account
              </button>
            </div>
            <div className="auth-demo-hint-text">
              Email: <code>alex.chen@student.edu</code> · Pass: <code>Password123!</code>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="auth-error-banner" role="alert">
            <Info size={14} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {view === "register" && (
            <div className="auth-field">
              <label htmlFor="reg-name">Full name</label>
              <div className="auth-input-wrapper">
                <input
                  id="reg-name"
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Alex Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Student email address</label>
            <div className="auth-input-wrapper">
              <input
                id="auth-email"
                type="email"
                className="auth-input"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <div className="auth-input-wrapper">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={view === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {view === "register" && (
            <div className="auth-field">
              <label htmlFor="reg-confirm-password">Confirm password</label>
              <div className="auth-input-wrapper">
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                  }
                  title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            style={{ marginTop: "6px" }}
          >
            {isLoading
              ? "Authenticating..."
              : view === "login"
                ? "Sign in to SkillBridge"
                : "Create student account"}
          </Button>
        </form>

        <footer className="auth-footer">
          {view === "login" ? (
            <span>
              Don't have a profile yet?{" "}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  onSwitchView("register");
                }}
              >
                Register here
              </button>
            </span>
          ) : (
            <span>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  onSwitchView("login");
                }}
              >
                Sign in to your account
              </button>
            </span>
          )}
        </footer>
      </div>
    </div>
  );
}
