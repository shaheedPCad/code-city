# CLAUDE.md

This file is the engineering contract for Code City. All contributors (human and AI) must follow these rules.

---

## Project Goal

Code City is a dark dystopia dashboard featuring a real-time city simulation. Thousands of agents move through a procedural cityscape while a dashboard displays live metrics, alerts, and KPIs. The aesthetic is grim, utilitarian, and data-dense.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Build | Vite |
| UI Framework | React + TypeScript |
| Styling | Tailwind CSS |
| Graphics | PixiJS (WebGL) |
| Simulation | Web Worker |
| State (UI only) | Zustand |
| Charts | Recharts |

Do not introduce additional frameworks without explicit approval.

---

## Architecture Rules

1. **Simulation runs in a Web Worker** at a fixed 20 Hz timestep. The worker owns all agent state.
2. **Renderer is PixiJS** on the main thread. It receives data from the worker and draws frames.
3. **React is UI only.** No per-agent state in React or Zustand. Zustand holds UI state (selected view, filters, theme).
4. **Data transfer uses typed arrays:**
   - Positions: `Float32Array` (x, y pairs)
   - Flags/status: `Uint8Array`
   - Metrics: small JSON object
5. **UI updates (charts, KPIs) run at 2–5 Hz max**, not every simulation tick.
6. **No blocking the main thread.** Heavy computation stays in the worker.

---

## Repository Structure

```
src/
  ui/          # React components (dashboard, cards, alerts)
  render/      # PixiJS renderer, sprites, camera
  sim/         # Pure simulation logic (agents, city grid, rules)
  worker/      # Web Worker entry and message handling
  shared/      # Types, constants, message schemas
```

Keep each module focused. If a file exceeds ~200 lines, consider splitting.

---

## Coding Style

- **Small, clearly named modules.** One concept per file.
- **No `any` types** unless absolutely unavoidable (document why).
- **Prefer pure functions** in the sim layer—input in, output out, no side effects.
- **Comments only where intent is non-obvious.** Code should be self-documenting.
- **Use TypeScript strict mode.** Fix all type errors before committing.

---

## Visual Style (Dark Dystopia Dashboard)

- **Background:** Dark charcoal (`#1a1a1a` or similar)
- **Borders:** Subtle, low-contrast (`#2a2a2a`)
- **Accents:** Limited—muted red for alerts, dim cyan for highlights
- **Typography:** Monospace or industrial sans-serif, small sizes
- **Layout:**
  - Top or side: KPI cards (population, incidents, power grid %)
  - Left or bottom: Alerts feed (scrolling log of events)
  - Center: PixiJS canvas (the city simulation)
- **No bright colors.** Everything should feel surveilled, oppressive, utilitarian.

---

## Definition of Done

A feature is complete when:

1. **Builds and runs locally** (`npm run dev`, `npm run build`)
2. **No console errors or warnings** (except known vendor noise)
3. **No main-thread blocking** (simulation stays in worker, UI stays responsive)
4. **Clear file list** in commit/PR description
5. **Brief usage note** explaining how to test or see the feature

---

## Plan Mode Workflow

When implementing a feature, follow this process:

1. **Summarize the plan in bullets** — What will change? What is the goal?
2. **List files to create or edit** — Be specific: path and purpose.
3. **Implement** — Write the code following the rules above.
4. **Quick test/run checklist:**
   - [ ] `npm run dev` starts without errors
   - [ ] Feature is visible/functional in browser
   - [ ] No console errors
   - [ ] `npm run build` succeeds
   - [ ] No TypeScript errors (`tsc --noEmit`)
