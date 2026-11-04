# Skill-to-role matching workspace

## Product experience

- Replace the template home screen with a practical student-facing skills dashboard for comparing current skills with curated early-career technical roles.
- Add interactive skill-level controls, role selection, match scoring, identified gaps, and a personalized weekly learning roadmap.
- Clearly present role listings as representative examples, not live scraped job listings; use an authored local dataset with no backend or external job claims.

## Visual direction

- Give the experience a polished career-workspace identity with a quiet light canvas, vivid blue actions, crisp charcoal typography, skill-level colors, and a real student-workspace photograph.
- Keep it responsive and accessible, use existing UI primitives for controls, and define appearance in the shared semantic style system.

## Implementation details

- Implement the first screen at `/` in `src/routes/index.tsx`; give that route complete app-specific head metadata.
- Extend semantic tokens in `src/styles.css`; preserve the existing TanStack Start app shell and avoid new routes or services.
- Record the dashboard’s initial modular organization in the root `AGENTS.md`.
