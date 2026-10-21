# Redesign toolkit

The local redesign is now implemented. Start with [REVIEW.md](REVIEW.md) for
the running preview, supplied brief, review choices, and verification results.

Prepared 15 October 2026 for isaacsun.net. This is a working project toolkit,
not a claim that adding skills automatically produces good design.

## What is installed and usable

| Need | Selected capability | How it is used |
| --- | --- | --- |
| Art direction and critique | Local `isaac-design` skill + Anthropic `frontend-design` | Ground composition in Isaac's brief; compare rendered work to references |
| Dynamic browser inspection | Playwright + installed Chromium | Navigate, click, type, emulate phones, inspect DOM and console, capture screenshots and traces |
| Accessibility review | `@axe-core/playwright` | WCAG-tagged findings in inspection JSON; supplement with keyboard/focus review |
| 3D export validation | Khronos `gltf-validator` | Validate all checked-in GLBs or named incoming files |
| Real 3D smoke tests | Playwright on the actual R3F site | Entry interaction, live WebGL context, screenshots, missing-WebGL behavior |
| React/Next.js maintenance | Vercel `vercel-react-best-practices` + Ponytail available in this environment | Apply relevant performance guidance and keep the implementation small |
| Browser workflow reference | Anthropic `webapp-testing` | Reconnaissance guidance; use this repo's Node runner instead of a second Python runtime |
| Repeatable handoff | Root `AGENTS.md`, `CLAUDE.md`, this guide, design direction | Carry decisions into future Codex/Claude sessions |

Upstream skills are vendored under `.agents/skills/`. Exact upstream commits
are in [skill-sources.json](skill-sources.json). Claude uses the same files
through `.claude/skills/`. These are readable agent instructions, not a promise
that Claude's native plugin runtime runs inside Codex. No upstream installer,
hook, or background daemon was executed. New project tooling is dev-only.

## Daily commands

Run from `my-site/` with Node 22+:

```sh
npm ci
npx playwright install chromium
npm run dev -- --hostname 127.0.0.1 --port 3107
```

In another terminal:

```sh
npm run inspect
npm run test:e2e
npm run typecheck
npm run lint
npm run validate:models
```

`inspect` requires an already running local server. It writes ignored PNGs and
JSON under `artifacts/inspection/`. It reports findings without failing on
pre-existing accessibility problems; `test:e2e` provides behavioral assertions.
The E2E runner starts the local server automatically when `BASE_URL` is absent.

Inspect a deployment or reference site:

```sh
npm run inspect -- https://isaacsun.net artifacts/live-baseline
CLICK_DESKTOP_BUTTON='Take Flight' CLICK_MOBILE_BUTTON='Mobile Portfolio' npm run inspect -- https://isaacsun.net artifacts/live-interactions
BASE_URL=https://isaacsun.net npm run test:e2e
npm run validate:models -- public/models/paraglider-isaac.glb
```

`HEADED=1 npm run inspect` opens the browser visibly. `npm run test:e2e:ui`
opens Playwright's UI. `npx playwright show-report` displays the last HTML report.
Failure traces and screenshots are in `test-results/`. `CLICK_BUTTON` applies
one entry action to both device classes; use the device-specific variables for
this site's different entry screens. The inspector's brief post-click delay is
for reconnaissance captures; regression tests should wait for explicit state.

The tests now cover the redesigned experience in desktop Chromium, an emulated
phone, and WebKit: navigation, flight and landing, dialogs, history, reduced
motion, accessibility, and WebGL/model failure recovery.

## How we will actually test Three.js

Validation has three separate jobs:

1. **Asset correctness:** Khronos validation catches malformed GLBs. Inspect
   node names, materials, animation clips, axes, scale, and texture size too.
2. **Interaction correctness:** browser tests exercise meaningful input, scene
   transitions, content navigation, loading/error behavior, and fallback.
   When a new scene needs assertions on transforms or raycasting, add narrowly
   scoped R3F test-renderer tests compatible with the installed Fiber version.
3. **Rendered correctness:** compare browser captures to Blender reference
   renders and the design board. A context can be valid while displaying an
   empty or incorrect scene. Headless frame rate is not a real-device GPU benchmark.

For visual regression, choose a deterministic camera/animation state first,
then use [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots).
Review goldens visually before committing. Browser, OS, fonts, and GPU differences
affect pixel comparisons. Do not mask the main artwork to make a test pass.

For performance, record asset transfer sizes and renderer draw calls/triangles,
and profile input/frame timing. Measure a production build on representative
hardware before setting firm budgets. Use [R3F's performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)
for instancing, reuse, and demand rendering where the scene can rest. Do not
force demand rendering on continuously animated scenes without invalidation.

## Blender pipeline

Blender was absent during initial setup. The Adventure asset pass downloaded
official Blender 4.5.13 LTS into a temporary mounted image and verified headless
modeling, packed `.blend` sources, GLB exports and Cycles renders. The executable
is `/private/tmp/isaac-blender-volume/Blender.app/Contents/MacOS/Blender` for this
session; it is not a permanent application install. Sources, individual props,
shared layout data and repeatable commands are documented in
[the Blender handoff](../../assets/blender/travel-board/README.md).

Retain the original `.blend`, textures, and a reference render. Export a separate
GLB; record intended size, axes, origin, object names, baked lighting, and clips.
Use [Blender's glTF export documentation](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html)
for material/export limitations. Validate, render, compare, then optimize a copy.

[glTF Transform](https://gltf-transform.dev/cli) is the selected optional asset
inspection/optimization tool. Install a pinned version when the incoming assets
need it; it is not installed by this preparation. Inspect before selecting
compression, simplification, or texture resizing. Optimization can change
names/precision and break picking or artwork; compare before and after.
The unused legacy `@react-three/gltfjsx` dependency was removed during the
redesign, along with its dependency tree. Evaluate current
[gltfjsx](https://github.com/pmndrs/gltfjsx) only if generated mesh components are
needed; loading a GLB with Drei may be simpler.

## Evaluated integrations and skills

| Candidate | Decision and reason |
| --- | --- |
| [Anthropic frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | Installed. Direct, readable guidance; the actual brief takes precedence over its generic anti-pattern list. |
| [Vercel agent skills](https://github.com/vercel-labs/agent-skills) | React guidance installed. Read relevant rules rather than treating every optimization as mandatory. |
| [Impeccable](https://github.com/pbakaus/impeccable) | Reviewed version 4.5.2; optional, not installed. Its critique/polish workflow is useful, but its current launcher and broader runtime overlap with this smaller project toolkit. |
| [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp) | Useful optional interactive MCP adapter. Direct Playwright scripts already work in this session; no MCP restart or second browser service is needed. |
| Figma | Optional plugin suggested, not connected during setup. Useful for editable boards and supplied Figma frames. The toolkit does not depend on it. |
| [MCP for Blender](https://github.com/ahujasid/mcp-for-blender) | Evaluated, not installed or connected. Requires a running Blender application/add-on. Prefer ordinary local export automation when that covers the task. |
| Third-party Three.js skill collections | Discovered, not installed. Prefer version-matched official Three.js/R3F/Drei guidance and actual tests over a large unverified instruction pack. |
| Broad UI prompt packs and template/component generators | Not part of the core. Their style defaults can conflict with Isaac's particular references. Add a component library only for a demonstrated behavior need. |
| Image generation | Available separately when original bitmap artwork is requested. User-provided photos/Blender work should guide the identity; do not regenerate source art unnecessarily. |

Popularity is a discovery signal, not validation. At lookup, GitHub reported
181,161 stars for Anthropic skills, 32,429 for Vercel agent-skills, and 81,215 for
Impeccable. All three primary repositories were read; recommendations are not
based on those counts alone. Counts are a dated snapshot.

## Design research and its implications

The design process is in [DESIGN_DIRECTION.md](DESIGN_DIRECTION.md). The key
choice is to establish a visual world from Isaac's real references and objects,
then use skills for composition and critique within it.

- [PostHog brand foundations](https://posthog.com/handbook/brand/foundations):
  intentional, human details provide a better reference than a broad request
  for polish. Apply that to Isaac's content and artwork.
- [PostHog assets and illustration](https://posthog.com/handbook/brand/assets):
  consistent illustration rules and a defined palette make a playful identity
  coherent. Study the system; use original personal assets.
- [Reddit: frontend-design skill discussion](https://www.reddit.com/r/ClaudeAI/comments/1v1v713/any_good_claude_frontenddesign_skills/):
  several contributors favor explicit references and a design system over
  adding more prompt packs. This is anecdotal practitioner feedback.
- [Reddit: PostHog/personality discussion](https://www.reddit.com/r/UXDesign/comments/1ol2env/im_glad_to_see_designs_with_personality_making_a/):
  useful qualitative feedback about its OS metaphor and personality; not
  evidence that the same metaphor suits this portfolio.
- [Reddit: frontend skill rewrite](https://www.reddit.com/r/ClaudeAI/comments/1q7rnpk/i_rewrote_anthropics_frontenddesign_skill_and/):
  a reminder to evaluate instructions for clarity and observable results.
- The [skills directory](https://www.skills.sh/) was checked for discovery,
  followed by inspection of upstream sources.

Instagram queries returned little useful indexed evidence and opening the
[Awwwards Instagram profile](https://www.instagram.com/awwwards/) failed here.
No reels were watched and no visual conclusions are attributed to them. A
provided Instagram/Pinterest reference needs an accessible image or video for
faithful visual analysis; a caption or URL alone is insufficient.

## Maintainability approach for the redesign

Preserve the existing Next.js/React/R3F/Drei/Motion stack initially. Establish
the new composition before extracting reusable pieces. Keep content as simple
typed data where that removes duplication; avoid a generic schema-driven page
engine. Extract scene orchestration, controls, and DOM UI only where their
responsibilities separate cleanly. Prefer one useful responsive content model
over unrelated phone/desktop copies where the brief allows it.

Clean up dead code and error suppression when replacing the affected areas,
with behavioral checks. Keep continuous motion out of React state. Lazy-load
heavy optional 3D code where it helps access to content. Use one shared token
source, a few real primitives, and a short dependency list.

Before handing off the redesign, leave desktop/phone captures, model validation,
affected E2E results, type/lint/build results, and any measured performance gaps.
Record unresolved decisions in a progress note so a later session can resume.
The local redesign is documented in REVIEW.md. No scheduled task was created
and nothing was published.

## Baseline evidence

See [BASELINE.md](BASELINE.md) for the checks performed during toolkit setup.
Generated screenshots, JSON, and reports stay under ignored `my-site/artifacts/`,
`test-results/`, and `playwright-report/` directories rather than inflating source.
