---
name: isaac-design
description: Design and critique Isaac Sun's portfolio using his reference board and Blender assets, with browser verification and a maintainable Next.js/React Three Fiber implementation. Use for this repository's redesign and subsequent visual changes.
---

# Isaac's portfolio

Read `docs/redesign/DESIGN_DIRECTION.md` and the user's latest brief before making
visual decisions. Use `docs/redesign/TOOLKIT.md` for commands and verified tool
status. Pinterest-like and PostHog-like are clues, not an approved palette or an
instruction to copy either site. The supplied design plan wins.

Before implementation, extract decisions from the references: subject, mood,
composition, type hierarchy, material, density, interaction, and mobile behavior.
Record which reference supports each important choice. Distinguish approved
choices from assumptions. Establish one coherent direction using real content
and one representative desktop/phone composition before propagating it.

Keep the memorable object or artwork central. Use semantic HTML for content and
navigation; use WebGL where depth or interaction contributes to the experience.
Carry the same material, color, light, and illustration language across Blender
assets and CSS. Do not replace a specified tactile aesthetic with a generic
minimalist landing page during cleanup.

For Blender handoff, retain the source file, export a separate GLB, record object
names, scale, origin, orientation, camera, baked textures, and animation clips.
Validate exports with `npm run validate:models`. Compare the imported scene to a
Blender reference render. Preserve named nodes needed for interactions when
optimizing. Confirm any compression decoder is actually configured at runtime.
Blender is not installed in the initial toolkit environment: verify availability
before promising direct `.blend` edits.

Keep rendering, UI navigation, and per-frame input/motion in understandable
components. Use refs and frame deltas for continuous movement; avoid React state
updates every frame. Avoid speculative wrappers, generic engines, and global
state for local concerns. Read only the relevant Vercel performance rules.

Review the rendered result against the references at desktop and phone sizes.
Exercise keyboard and touch paths, modal close/focus behavior, reduced motion,
slow/failed assets, and missing WebGL as applicable. Inspect console/network
errors and axe findings. Add regression checks for changed behavior. For a
visual golden, use a deterministic scene state and the same browser/platform;
do not mask the main artwork or approve diffs without viewing them.

Judge visual quality by identity, composition, typography, material cohesion,
content usefulness, and interaction clarity. Fix concrete mismatches together,
then confirm the affected states. Passing tests does not establish design quality.
Leave a short handoff identifying changes, screenshots, checks, and remaining gaps.
