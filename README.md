# SkillBridge — Student Skill-to-Role Matching Workspace

> An interactive, data-driven skill evaluation and career roadmap workspace designed for Computer Science and Engineering (CSE) students. Compare self-reported technical proficiencies against realistic early-career roles, pinpoint skill gaps, and follow structured learning activities.

---

## 🎯 Problem Statement

Early-career engineering students often struggle to understand how university coursework and personal coding projects align with industry role expectations. Job descriptions are frequently ambiguous or overwhelming, making it difficult to determine:

1. Which technical skills are mandatory versus optional for specific roles.
2. Where the student's current proficiency stands relative to entry-level expectations.
3. What concrete, practical project or exercise to build next to close the gap.

**SkillBridge** solves this by providing a quiet, transparent, local-first evaluation workspace. It compares current proficiencies against curated industry benchmarks, calculates normalized match scores with clear explanations, and generates ordered project-based learning roadmaps.

---

## ✨ Main Features

- **📊 Data-Driven Overview Workspace**:
  - Live metric snapshots: best role match %, target goal gaps, and roadmap momentum.
  - Ranked role cards dynamically ordered by match percentage.
  - "Strongest Opportunities" highlighting top skill gaps with one-click transitions to skill rating.
  - Preview of upcoming personalized learning activities.

- **🧭 Explore Roles Workspace**:
  - Curated, realistic engineering benchmarks (Frontend Developer, Full-Stack Developer, UI Engineer, Backend Developer).
  - Search by role title, engineering team, work style, or technical stack.
  - Filter pills by engineering discipline (All, Frontend, Full-Stack, Backend).
  - Explicit disclaimer identifying roles as curated benchmarks rather than unverified live vacancies.
  - One-click target goal selection immediately updating metrics across all workspaces.

- **🔐 Login & Registration Experience**:
  - Gated student dashboard requiring authentication before workspace access.
  - Login view with email, password, and show/hide password toggles.
  - Registration view with full name, student email, password, and password confirmation checks.
  - Client-side validation and responsive error banners.
  - "Auto-fill credentials" button for 1-click evaluation of the pre-seeded student account.
  - Multi-user data isolation: separate student accounts have independent skill levels, goals, and roadmaps.
  - Isolated authentication module (`src/lib/auth.ts`) utilizing Web Crypto SHA-256 password hashing (passwords are never stored in plaintext).
  - Clean logout action with confirmation modal.

- **🎛️ My Skills Workspace & Skill Management**:
  - Categorized CSE technical skills in _Frontend_, _Tools & practices_, and _Backend_.
  - **Add Skill Modal**:
    - Searchable selection from an extended catalogue of skills (e.g. Tailwind CSS, Next.js, Docker, Python & FastAPI, PostgreSQL, GraphQL, etc.).
    - Custom skill creator allowing students to add arbitrary engineering skills and categories.
    - Initial proficiency rating selector.
    - Duplicate prevention check (cannot add skills already in profile).
  - **Remove Skill Action**:
    - Accessible remove button on each skill row with an `AlertDialog` confirmation.
    - Immediately recalculates role match scores, skill gaps, and roadmap activities upon removal.
  - Consistent 4-tier proficiency model:
    - **0 — Not yet (Beginner)**: Little to no exposure.
    - **1 — Learning (Developing)**: Fundamental concepts understood; follows guided tutorials.
    - **2 — Comfortable (Intermediate)**: Builds independently; troubleshoots routine issues.
    - **3 — Confident (Advanced)**: Deep architectural understanding; writes tests and explains trade-offs.
  - Filter tabs: _All profile skills_, _Required for goal_, and _Skills needing focus_.
  - Confirmation dialog to reset skills to demo baseline.

- **🗺️ Personalized Learning Roadmap**:
  - Dynamically generated activities specifically addressing the student's skill gaps for the selected target role.
  - Each activity includes:
    - Current vs target level badge.
    - Estimated duration (e.g., 2–3 hours).
    - Structured learning objectives (bullet points).
    - Practical, project-based portfolio exercise.
    - Curated curriculum reading / documentation recommendation (no broken external links).
    - "Full Project Guide" modal detailing step-by-step guidance.
  - Interactive completion toggle with progress bar tracking.
  - Empty state with guidance when all requirements are fully satisfied.
  - Roadmap restart action with confirmation dialog.

- **💾 Multi-User Local Storage Persistence**:
  - All user state (selected role, skill levels, active skills, custom skills, completed roadmap milestones) is isolated per user under `skillbridge_student_state_v2_{userId}` in browser `localStorage`.
  - SSR hydration-safe with zero flash of unstyled content or hydration mismatch.
  - Complete "Reset demo data" action with modal confirmation.

---

## 🧮 Transparent Matching Engine

The match scoring algorithm (`src/lib/matching.ts`) is deterministic, transparent, and educational:

$$\text{Score} = \text{round}\left( \frac{\sum_{i=1}^{N} \min\left(\text{CurrentLevel}_i, \text{RequiredLevel}_i\right) / \text{RequiredLevel}_i}{N} \times 100 \right)$$

### Key Properties:

1. **Normalized Range**: Always outputs an integer between 0 and 100.
2. **Proportional Credit**: Partial proficiency earns partial credit (e.g., Level 1 toward a Level 2 requirement grants 50% credit for that skill).
3. **Equal Skill Weighting**: Every requirement in a role contributes $1/N$ of the total score.
4. **Resilient Edge Case Handling**: Safe against division-by-zero (empty requirements yield 100%), unknown skill IDs, and out-of-range ratings.
5. **Clear Explanation**: Generates plain-English breakdowns (e.g., _"7 of 9 skills fully met, 2 in progress, and 0 to begin"_).

> **Note**: The match score is an educational navigation benchmark to guide study priorities, not a hiring prediction or probability of employment.

---

## 🛠️ Technology Stack

| Layer            | Technology                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------- |
| **Framework**    | [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) |
| **Language**     | [TypeScript 5.8](https://www.typescriptlang.org/) (Strict mode, strict null checks)           |
| **UI Library**   | [React 19](https://react.dev/)                                                                |
| **Styling**      | [Tailwind CSS v4](https://tailwindcss.com/) + CSS Design Tokens (`oklch` palette)             |
| **Icons**        | [Lucide React](https://lucide.dev/)                                                           |
| **Primitives**   | [Radix UI](https://www.radix-ui.com/) (`AlertDialog`, `Dialog`, accessible overlays)          |
| **Testing**      | [Vitest 4](https://vitest.dev/) + React Testing Library + JSDOM                               |
| **Code Quality** | ESLint 9 + Prettier                                                                           |

---

## 📁 Project Structure

```
├── src/
│   ├── assets/              # Static assets (student-workspace photo)
│   ├── components/ui/       # Radix UI primitives & controls (alert-dialog, button, dialog)
│   ├── data/
│   │   └── catalogue.ts     # Typed CSE skills, roles catalogue, and proficiency metadata
│   ├── lib/
│   │   ├── auth.ts          # Demo auth service with Web Crypto SHA-256 password hashing
│   │   ├── matching.ts      # Transparent matching engine & gap analyzer
│   │   ├── roadmap.ts       # Dynamic roadmap activity generator & practical tasks
│   │   ├── storage.ts       # SSR-safe versioned LocalStorage persistence
│   │   └── utils.ts         # Class merging & utility helpers
│   ├── routes/
│   │   ├── __root.tsx       # Root document layout, metadata, and error boundary
│   │   └── index.tsx        # SkillBridge interactive workspace shell & page views
│   ├── styles.css           # Global design tokens, OKLCH palette, and component classes
│   └── test/
│       ├── app-routing.test.tsx        # Route matching tests
│       ├── auth.test.ts               # Authentication & password hashing tests
│       ├── matching.test.ts           # Matching algorithm edge-case tests
│       ├── roadmap.test.ts            # Roadmap generation tests
│       ├── setup.ts                   # JSDOM test environment mocks
│       ├── sidebar-navigation.test.ts # Sidebar collapse preference & transitions tests
│       ├── skills-management.test.ts  # Add & remove skills tests
│       └── storage.test.ts            # Persistence & fallback tests
├── .env.example             # Optional environment variable template
├── package.json             # Dependencies and npm scripts
├── tsconfig.json            # TypeScript configuration (strict checks)
├── vite.config.ts           # Vite + TanStack Start configuration
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v20+ (tested on Node v26)
- npm v10+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd skillbridge

# Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

The application will start at `http://localhost:3000` (or `http://localhost:5173` depending on port availability).

### Running Tests

```bash
npm test
```

### Type Checking & Linting

```bash
# Validate TypeScript
npx tsc --noEmit

# Run ESLint
npm run lint

# Check Prettier formatting
npm run format
```

### Production Build

```bash
npm run build
```

---

## 🔒 Local Persistence, Authentication & Privacy

- **Development / Demo Authentication**: SkillBridge provides an isolated client-side authentication service (`src/lib/auth.ts`) with SHA-256 Web Crypto hashing. Passwords are never stored in plaintext. This allows complete local demonstration of login, registration, validation, and multi-user data isolation without requiring third-party cloud credentials or paid APIs.
- **Account Data Isolation**: Each student account maintains an isolated storage record (`skillbridge_student_state_v2_{userId}`). User progress is not accidentally merged or overwritten across accounts.
- **Privacy First**: No telemetry, tracking pixels, or remote databases are used.
- To reset your workspace to fresh demo defaults, click **Reset demo data** in the sidebar.

---

## ⚠️ Known Limitations

1. **Demo Authentication Boundary**: The current authentication layer runs locally in the client browser with Web Crypto hashing. It is designed for local portfolio evaluation and is isolated so it can be swapped for a production OAuth 2.0 / OIDC provider (e.g. Auth0, Clerk, or Supabase Auth) in production.
2. **Device-Local Storage**: Because state is persisted in `localStorage`, student progress is local to the current browser and machine.
3. **Curated Catalogue**: Roles and skills are curated CSE benchmarks designed for educational alignment, not live job vacancies.

---

## 🔮 Future Roadmap Enhancements

- [ ] Export portfolio summary to PDF / Markdown for resume attachments.
- [ ] Custom role builder allowing students to paste custom course syllabi or job requirements.
- [ ] Integration with GitHub REST API to automatically detect project repositories related to roadmap tasks.
- [ ] Multi-profile support for tracking different career trajectories (e.g. Frontend vs DevOps).
