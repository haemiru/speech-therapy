# Speech-Therapy — 소리야 놀자!

발달장애 아동(3~10세) 대상 웹 기반 언어치료 게임 서비스.

## Commands

```bash
npm run dev      # Next.js dev server (port 3000)
npm run build    # Production build → .next/
npm run start    # Serve production build
```

No test runner configured yet.

## Tech Stack

- **Next.js 15** (App Router, `src/` directory)
- **TypeScript** strict mode
- **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **Zustand 5** + persist middleware → localStorage
- **@mediapipe/tasks-vision** — Face Landmarker (jawOpen blendshape)
- **Deployment**: Vercel (https://speech-therapy-ten-theta.vercel.app/)

## Architecture

### Folder Structure
```
src/
├── app/               # Next.js App Router pages
│   ├── (game)/        # Game route group (shared layout with HydrationGuard)
│   │   ├── home/      # Home screen
│   │   ├── mouth-opening/      # Camera permission
│   │   │   └── play/           # Game 1 play screen (core)
│   │   ├── result/    # Result/reward screen
│   │   └── puppy/     # Puppy detail screen
│   └── globals.css    # Tailwind + keyframe animations
├── components/
│   ├── ui/            # Button, Card, ProgressBar, StarDisplay, Modal, etc.
│   ├── game/          # GameHeader, CameraView, GaugeOverlay, etc.
│   ├── puppy/         # PuppyAvatar, PuppyWidget, GrowthProgress
│   ├── reward/        # ConfettiEffect, ResultCard
│   └── shared/        # HydrationGuard, PermissionPrompt, ErrorBoundary
├── hooks/
│   ├── sensors/       # useFaceLandmarker, useMouthMetrics
│   ├── game/          # useGameSession, useGameTimer, useSuccessJudgment, useReward
│   ├── useCamera.ts
│   └── useSound.ts
├── stores/            # Zustand (persist → localStorage, skipHydration)
├── types/             # TypeScript type definitions
├── constants/         # Game configs, puppy stages, thresholds
├── utils/             # cn(), faceGeometry helpers
├── services/          # localStorageService (Phase 2 → Supabase)
└── lib/               # mediapipe config
```

### Key Patterns

1. **Game Pipeline**: Sensor → Real-time Feedback → Success Judgment → Reward → Store
2. **Zustand SSR**: All persist stores use `skipHydration: true` + `HydrationGuard` component
3. **MediaPipe**: Dynamic import, GPU delegate, CDN model load, `detectForVideo()` in rAF loop
4. **Puppy Growth**: Stars never decrease. 5 stages: 🥚→🐣→🐕→🐶→👑

### Clinical Principles

- No penalties, no leaderboards, only positive feedback
- Puppy never gets sick or sad (no regression)
- Camera data is processed locally (edge AI), never sent to server
- Large touch targets (48px minimum), child-friendly UI

## UI Language

All UI text is in **Korean**. The app targets Korean-speaking children and parents.

## Design References

- `docs/design/prototype.html` — Interactive UI prototype
- `docs/design/ui-wireframes.md` — Wireframe specifications
- `docs/design/puppy-growth-system.md` — Puppy growth rules
