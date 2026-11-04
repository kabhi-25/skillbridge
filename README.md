# SkillBridge — Student Skill-to-Role Matching Workspace

> A front-end, SSR React application designed for Computer Science and Engineering (CSE) students to evaluate technical proficiencies against curated industry role benchmarks, identify skill gaps, and follow structured learning activities.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing-green?logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Live Demo**: <!-- TODO: Add live deployment URL once deployed --> `https://your-deployment-url.here`

---

## 🎯 Problem Statement

Early-career engineering students often struggle to understand how university coursework and personal coding projects align with industry role expectations:

1. **Vague Job Descriptions**: Postings contain buzzword-heavy requirements that make it hard to tell what skills are strictly necessary versus optional.
2. **Ambiguous Proficiency**: Students don't know where their self-taught or university knowledge lands relative to entry-level industry expectations.
3. **Action Paralysis**: After realizing a skill gap, students often lack an actionable, project-based curriculum to systematically close it.

**SkillBridge** provides an interactive, client-side evaluation workspace. It compares self-reported proficiencies against curated industry benchmarks, calculates normalized match scores with clear explanations, and generates ordered project-based learning roadmaps.

---

## ✨ Key Features

- **📊 Overview Workspace**:
  - Metric snapshots: Best role match %, target goal gaps, and roadmap completion progress.
  - Ranked role cards dynamically ordered by match percentage.
  - "Strongest Opportunities" highlighting top skill gaps with one-click transitions to skill rating.
  - Immediate preview of upcoming practical learning milestones.

- **🧭 Explore Roles Workspace**:
  - Curated engineering benchmarks: Frontend Developer, Full-Stack Developer, UI Engineer, Backend Developer.
  - Real-time search across role title, engineering team, work style, and technical requirements.
  - Filter pills by engineering discipline (*All*, *Frontend*, *Full-Stack*, *Backend*).
  - One-click target goal selection immediately updating metrics across all views.

- **🔐 Gated Authentication & User Isolation (Demo)**:
  - Client-side authentication module (`src/lib/auth.ts`) utilizing Web Crypto PBKDF2 (HMAC-SHA-256, 100,000 iterations, random 16-byte salt per user).
  - Multi-user data isolation: separate student accounts have independent skill levels, goals, and roadmaps stored under isolated LocalStorage keys.
  - Pre-seeded demo account seeded dynamically at runtime (`alex.chen@student.edu` / `Password123!`) with a 1-click "Use demo account" button.

- **🎛️ My Skills Workspace & Skill Management**:
  - Categorized CSE technical skills across *Frontend*, *Tools & practices*, and *Backend*.
  - Standardized 4-tier proficiency model:
    - `0 — Not yet (Beginner)`: No exposure or fundamentals only.
    - `1 — Learning (Developing)`: Understands concepts; completes guided tutorials.
    - `2 — Comfortable (Intermediate)`: Builds independently; resolves typical bugs.
    - `3 — Confident (Advanced)`: Deep architectural grasp; writes clean tests.
  - **Custom Skill Creator**: Add arbitrary engineering skills and categories.
  - **Extended Catalogue Modal**: Choose from optional skills (Tailwind, Next.js, Docker, Python, PostgreSQL, GraphQL).

- **🗺️ Personalized Learning Roadmap**:
  - Dynamically generated activities specifically targeting the student's gaps for their selected target role.
  - Detailed task breakdown: estimated duration, core learning objectives, practical exercise instructions, and documentation links.
  - Step-by-step modal guide for hands-on portfolio implementation.
  - Interactive completion tracking with progress bars.

- **💾 SSR-Safe Local Persistence**:
  - User state persisted in browser `localStorage` with versioned migrations (`v2`).
  - Client mount guard prevents hydration mismatches during server-side rendering.

---

## 🏛️ System Architecture & Data Flow

```mermaid
flowchart TD
    User([Student / Evaluator]) --> Auth[Gated AuthScreen]
    Auth -->|Validates Session (PBKDF2)| Storage[(LocalStorage: Isolated User State)]
    Storage --> Workspace[SkillBridge Workspace Shell]
    
    subgraph Core Logic
        Catalogue[(Roles & Skills Catalogue)]
        Matching[Matching Engine: calculateRoleMatch]
        Roadmap[Roadmap Generator: generateRoadmapActivities]
    end
    
    Workspace --> Matching
    Catalogue --> Matching
    Storage --> Matching
    
    Matching -->|Normalized Score 0..100| Overview[Overview Dashboard]
    Matching -->|Ranked Benchmarks| Explore[Explore Roles View]
    Matching -->|Identified Gaps| Roadmap
    
    Roadmap -->|Ordered Projects| RoadmapView[Your Roadmap View]
    Workspace --> SkillsView[My Skills Management View]
    SkillsView -->|Update Proficiency| Storage
```

---

## 🧮 Matching Engine Formula

The match scoring algorithm (`src/lib/matching.ts`) is deterministic, transparent, and educational:

$$\text{Score} = \text{round}\left( \frac{\sum_{i=1}^{N} \min\left(\text{CurrentLevel}_i, \text{RequiredLevel}_i\right) / \text{RequiredLevel}_i}{N} \times 100 \right)$$

- **Equal Weighting**: Every requirement in a role contributes $1/N$ of the total score.
- **Proportional Credit**: Partial proficiency earns proportional credit (e.g., Level 1 toward a Level 2 requirement grants 50% credit for that skill).
- **Safety**: Robust against empty requirement sets, missing catalog entries, and out-of-range user input.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) | Full-stack React SSR & type-safe client routing |
| **Language** | [TypeScript 5.8](https://www.typescriptlang.org/) | Strict type checking, interfaces, and discriminated unions |
| **UI Library** | [React 19](https://react.dev/) | Component architecture, custom hooks, and state management |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern utility styling with OKLCH CSS variable design tokens |
| **Icons** | [Lucide React](https://lucide.dev/) | Consistent iconography |
| **Primitives** | [Radix UI](https://www.radix-ui.com/) | Accessible dialogs, alert confirmations, and modal focus traps |
| **Testing** | [Vitest 4](https://vitest.dev/) + React Testing Library | Unit and integration test suites |
| **Code Quality** | ESLint 9 + Prettier | Style guide compliance and code formatting |

---

## 📸 Screenshots

<!-- TODO: Add actual screenshot of Overview Dashboard -->
*Overview Dashboard Screenshot Placeholder*

<!-- TODO: Add actual screenshot of Explore Roles View -->
*Explore Roles Screenshot Placeholder*

<!-- TODO: Add actual screenshot of My Skills Workspace -->
*My Skills Workspace Screenshot Placeholder*

<!-- TODO: Add actual screenshot of Learning Roadmap -->
*Personalized Learning Roadmap Screenshot Placeholder*

---

## 🚀 Installation & Local Setup

### Prerequisites
- **Node.js**: `v20.0.0` or higher (tested on `v26.8.1`)
- **npm**: `v10.0.0` or higher

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kabhi-25/skillbridge.git
   cd skillbridge
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:8080` (or `http://localhost:5173`) in your browser.

5. **Demo Quick-Login**:
   - On the login screen, click **"Use demo account"** to populate the pre-seeded account:
     - **Email**: `alex.chen@student.edu`
     - **Password**: `Password123!`

---

## 🧪 Testing & Verification

Run the automated test suite covering authentication, algorithms, persistence, and UI flows:

```bash
# Run all unit and integration tests (44 tests)
npm test

# Run test coverage report
npm test -- --coverage

# Run ESLint check
npm run lint

# Format code with Prettier
npm run format

# Production build
npm run build
```

---

## ⚠️ Honest Limitations

1. **Local-Only Storage**: All user state (skill ratings, custom skills, goal selections, completed roadmap milestones) is persisted solely in the browser's `localStorage`. Progress does not synchronize across devices or browsers.
2. **Client-Side Demo Authentication**: The authentication module (`src/lib/auth.ts`) is a client-side simulation using PBKDF2 (`crypto.subtle`) and `localStorage`. It is intended solely for local demonstration and UI state isolation. It lacks a server-side authentication layer, secure HttpOnly cookies, session revocation, or OAuth/OIDC identity integration.
3. **No External Backend or Database**: The application does not connect to a remote database (e.g., PostgreSQL) or REST API server. All data operations are in-memory and local.
4. **Static Educational Benchmarks**: Roles and skill requirements are curated CSE educational benchmarks for personal career navigation, not live job vacancies or guaranteed hiring criteria.

---

## 💡 Engineering Challenges & Solutions

### 1. SSR Hydration Mismatches with Dynamic Local Storage
- **Challenge**: Reading browser `localStorage` on initial server-side render causes hydration mismatches or layout shifts.
- **Solution**: Implemented an SSR-safe container check (`isClientReady` flag) combined with versioned sanitization (`src/lib/storage.ts`) so the initial HTML matches exactly, then hydrates smoothly on the client.

### 2. Multi-Account Data Isolation Without a Remote Backend
- **Challenge**: Demonstrating login/registration workflows for evaluators without standing up an external database.
- **Solution**: Built an isolated client authentication service using Web Crypto PBKDF2 (100,000 iterations, 16-byte random salt per user). Each student's progress is saved under an isolated key (`skillbridge_student_state_v2_{userId}`), preventing data cross-contamination between accounts.

### 3. Transparent, Deterministic Matching Algorithm
- **Challenge**: Many matching systems use opaque black-box scoring that confuses students about what to study.
- **Solution**: Created a fully transparent mathematical formula that gives proportional credit for partial competencies and generates plain-English explanations showing met, in-progress, and unstarted skills.

---

## 🔮 Future Improvements

- [ ] **Backend & OAuth 2.0 Integration**: Replace client-side auth with an actual backend server or Auth0 / Supabase Auth with Google and GitHub login.
- [ ] **Cloud Database Persistence**: Sync user profiles and progress to a PostgreSQL database via a secure REST/GraphQL API.
- [ ] **Resume / Portfolio Export**: Generate downloadable PDF and Markdown reports of completed roadmap projects.
- [ ] **Custom Role Builder**: Allow students or professors to paste job descriptions or syllabus requirements to create custom role benchmarks.

---

## 👤 Author & Contact

**Abhishek (kabhi-25)**
- **GitHub**: [@kabhi-25](https://github.com/kabhi-25)
- **Repository**: [https://github.com/kabhi-25/skillbridge](https://github.com/kabhi-25/skillbridge)
- **LinkedIn**: [Connect on LinkedIn](https://www.linkedin.com)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
