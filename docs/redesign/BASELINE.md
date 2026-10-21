# Toolkit verification baseline

15 October 2026. This is evidence from toolkit preparation, not a full site audit.

## Browser inspection of isaacsun.net

Chromium loaded `https://isaacsun.net`, redirected to `www.isaacsun.net`, and
returned HTTP 200 for desktop and emulated Pixel 7 sessions. Desktop entry,
the world after Take Flight, phone entry, and the Mobile Portfolio screen were
captured and viewed. The world capture visibly contains the low-poly Earth,
clouds, and flight-control UI. A real WebGL context was present and not lost.

No JavaScript/console errors were recorded in those live inspection windows.
The initial screens had no WCAG-tagged axe findings. After desktop entry,
axe reported `button-name` for two controls. This is one violation category,
two affected elements; it is not a complete accessibility assessment.

Artifacts are local and ignored:

- `my-site/artifacts/live-baseline/`: entry screenshots and diagnostics.
- `my-site/artifacts/live-interactions/`: desktop world and phone portfolio
  screenshots and diagnostics after their respective entry actions.
- `my-site/artifacts/references/posthog/`: reference captures. Desktop viewed;
  its scan is reference reconnaissance, not an audit of that external site.

## Local verification

- Three behavioral checks pass: desktop entry into a live WebGL canvas;
  phone portfolio → About → Escape close; missing-WebGL explanation and retry.
  The matrix reports three passes and three intentional device-class skips.
- TypeScript check passes, including the new Playwright tests/config.
- `npm run lint` passes. The script now runs `eslint src` against the existing
  flat config; the previous command was `next lint`.
- Both Node tooling scripts pass syntax checks.
- The project-specific skill passes the skill-creator validator, and the
  Codex/Claude skill paths resolve.
- All four existing GLBs pass Khronos validation with zero errors.
  `sickEarthFile2.glb` has two generated-tangent-space warnings, on meshes 9
  and 10. An invalid GLB was also passed to the validator and rejected.

`npm run build` passes: compilation, integrated lint/type checks, static page
generation, and trace collection complete. Next reports 428 kB first-load JS
for `/`; this is a build output measurement, not a runtime performance score.

The first E2E attempt reused another application on port 3000 and failed to
find this site's controls. The harness now uses port 3107 and passed against
the actual repo. The other application was left running.

## Dependency maintenance

`npm audit` reports 44 advisories: 6 low, 9 moderate, 24 high, 5 critical.
Its complete local output is `my-site/artifacts/dependency-audit.json`.
Direct dependencies implicated by the report include Next 15.2.8,
`eslint-config-next`, the old `@react-three/gltfjsx` package, and ESLint.
An advisory count is not a finding that each vulnerability is exploitable in
this site. Review runtime exposure and update/remove affected packages during
the redesign before deployment; automatic force-fixes were not applied.

## Refactor context

`Experience.tsx` is 424 lines and coordinates scene state, input, responsive
behavior, intro transitions, and UI. `IntroScreen.tsx` includes an explicitly
unused garden component. Mobile currently gates access through a separate
portfolio implementation. The layout and error boundaries suppress some errors.
These are starting points to inspect when replacing the affected behavior,
not a completed code-quality review or reasons to rewrite every file.

## Limits

Chromium and an emulated Android phone were exercised. Safari, Firefox, real
touch devices, GPU benchmarks, all landmark pages, audio behavior, and
reduced-motion compliance have not been exhaustively tested. The tests do not
assert airplane physics, camera transforms, raycasting, or animation fidelity.
Visual regression goldens await a deterministic state in the redesigned scene.
Blender is not installed/verified, Figma is optional and unconnected, and
Instagram videos could not be accessed. The site's UI was not redesigned or
deployed during toolkit preparation.
