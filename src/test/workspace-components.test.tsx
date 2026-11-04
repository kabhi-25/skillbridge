import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Route } from "../routes/index";
import { DEMO_CREDENTIALS } from "../lib/auth";

describe("SkillBridge Full Workspace Integration Tests", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const Component = Route.options.component!;

  it("renders the gated login screen when unauthenticated", async () => {
    render(<Component />);

    expect(await screen.findByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@university.edu/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/minimum 6 characters/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /use demo account/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in to skillbridge/i })).toBeInTheDocument();
  });

  it("switches to registration view and validates fields", async () => {
    render(<Component />);

    const registerLink = await screen.findByRole("button", { name: /register here/i });
    fireEvent.click(registerLink);

    expect(screen.getByRole("heading", { name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. Alex Chen/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/re-enter your password/i)).toBeInTheDocument();

    // Click register with empty input
    const submitBtn = screen.getByRole("button", { name: /create student account/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
  });

  it("logs in via autofill and renders the authenticated dashboard overview", async () => {
    render(<Component />);

    const autofillBtn = await screen.findByRole("button", { name: /use demo account/i });
    fireEvent.click(autofillBtn);

    const emailInput = screen.getByPlaceholderText(/name@university.edu/i) as HTMLInputElement;
    expect(emailInput.value).toBe(DEMO_CREDENTIALS.email);

    const submitBtn = screen.getByRole("button", { name: /sign in to skillbridge/i });
    fireEvent.click(submitBtn);

    // Dashboard metrics must appear
    expect(await screen.findByText(/best role match/i)).toBeInTheDocument();
    expect(screen.getByText(/current target goal/i)).toBeInTheDocument();
    expect(screen.getByText(/roadmap momentum/i)).toBeInTheDocument();
    expect(screen.getByText(DEMO_CREDENTIALS.name)).toBeInTheDocument();
  });

  it("navigates to Explore Roles, filters by category, and searches with Esc clear", async () => {
    render(<Component />);

    // Login first
    fireEvent.click(await screen.findByRole("button", { name: /use demo account/i }));
    fireEvent.click(screen.getByRole("button", { name: /sign in to skillbridge/i }));
    await screen.findByText(/best role match/i);

    // Navigate to Explore Roles
    const exploreBtn = screen.getByRole("button", { name: /explore roles/i });
    fireEvent.click(exploreBtn);

    expect(
      screen.getByRole("heading", { name: /explore early-career possibilities/i }),
    ).toBeInTheDocument();

    // Filter by category Full-Stack
    const fullstackPill = screen.getByRole("tab", { name: /full-stack/i });
    fireEvent.click(fullstackPill);

    expect(screen.getByText(/1 role profile/i)).toBeInTheDocument();

    // Switch back to All
    const allPill = screen.getByRole("tab", { name: /all/i });
    fireEvent.click(allPill);

    // Search for "frontend"
    const searchInput = screen.getByPlaceholderText(/search by role title/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "frontend" } });
    expect(searchInput.value).toBe("frontend");

    // Press Escape to clear
    fireEvent.keyDown(searchInput, { key: "Escape" });
    expect(searchInput.value).toBe("");
  });

  it("navigates to My Skills, updates a proficiency level, and reflects changes", async () => {
    render(<Component />);

    // Login
    fireEvent.click(await screen.findByRole("button", { name: /use demo account/i }));
    fireEvent.click(screen.getByRole("button", { name: /sign in to skillbridge/i }));
    await screen.findByText(/best role match/i);

    // Navigate to My Skills
    fireEvent.click(screen.getByRole("button", { name: /^my skills$/i }));
    expect(
      screen.getByRole("heading", { name: /start with what you honestly know/i }),
    ).toBeInTheDocument();

    // Rate "Testing" skill from "Not yet" to "Learning"
    const testingLearningRadio = screen.getByRole("radio", {
      name: /testing: level 1 - learning/i,
    });
    fireEvent.click(testingLearningRadio);

    expect(testingLearningRadio).toHaveAttribute("aria-checked", "true");
  });

  it("navigates to Your Roadmap, marks an activity complete, and opens project guide", async () => {
    render(<Component />);

    // Login
    fireEvent.click(await screen.findByRole("button", { name: /use demo account/i }));
    fireEvent.click(screen.getByRole("button", { name: /sign in to skillbridge/i }));
    await screen.findByText(/best role match/i);

    // Navigate to Your Roadmap
    fireEvent.click(screen.getByRole("button", { name: /^your roadmap/i }));
    expect(
      screen.getByRole("heading", { name: /one focused project at a time/i }),
    ).toBeInTheDocument();

    // Find and click "Mark complete" on the first activity
    const markCompleteBtns = screen.getAllByRole("button", { name: /mark complete/i });
    expect(markCompleteBtns.length).toBeGreaterThan(0);
    fireEvent.click(markCompleteBtns[0]!);

    // Should now say "Completed"
    expect(screen.getByRole("button", { name: /completed/i })).toBeInTheDocument();

    // Open project guide modal
    const guideBtns = screen.getAllByRole("button", {
      name: /view full exercise specification/i,
    });
    fireEvent.click(guideBtns[0]!);

    expect(screen.getByText(/hands-on portfolio task:/i)).toBeInTheDocument();

    // Close modal
    const closeBtns = screen.getAllByRole("button", { name: /close/i });
    fireEvent.click(closeBtns[0]!);
  });

  it("performs logout and returns to login view", async () => {
    render(<Component />);

    // Login
    fireEvent.click(await screen.findByRole("button", { name: /use demo account/i }));
    fireEvent.click(screen.getByRole("button", { name: /sign in to skillbridge/i }));
    await screen.findByText(/best role match/i);

    // Click Sign out in sidebar
    const signoutBtn = screen.getByRole("button", { name: /sign out of skillbridge/i });
    fireEvent.click(signoutBtn);

    // Confirm dialog
    expect(screen.getByRole("heading", { name: /sign out of skillbridge\?/i })).toBeInTheDocument();
    const confirmSignout = screen.getByRole("button", { name: /^sign out$/i });
    fireEvent.click(confirmSignout);

    // Should return to Welcome back login screen
    expect(await screen.findByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
  });
});
