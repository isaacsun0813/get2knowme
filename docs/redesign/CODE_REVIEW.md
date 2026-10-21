# Local code review and cleanup

What this change does: It preserves the flyable globe and journal while fixing
confirmed geometry/audio bugs and reducing startup work. It shares repeated UI
and graphics behavior and gives the source a repeatable formatting check.

Reviewed the uncommitted application, its callers, asset generation, package
configuration and browser checks. Assumed load: a public static portfolio, with
each visitor running an independent browser scene; there is no application
backend or shared writable state here. Applied ponytail-review, the local Claude
code-review/pr-review checklist, a separate test review, and relevant React
performance rules. All findings below have been addressed locally.

## Must fix — resolved

1. **Expanded yard retained its original geometry bounds**
   ([codi.ts](../../my-site/src/app/world/codi.ts)).
   - **What this is:** Codi's yard and adjoining house/gate geometry are stretched and shifted at load time.
   - **Problem:** Their stored boxes and spheres still described the original vertices. The actual model had shifted vertices outside those bounds, which Three.js uses for visibility and click rejection.
   - **Fix:** Recompute both bounds immediately after editing positions. The original-geometry test now checks every affected vertex before any test helper can recompute the bounds.
   - **If we skip it:** Visible parts of the shifted landmark can be culled or reject clicks near the old limits.

2. **Keyboard-first flight skipped wind activation**
   ([WorldExperience.tsx](../../my-site/src/app/WorldExperience.tsx)).
   - **What this is:** W and the arrow keys can enter flight directly from the globe.
   - **Problem:** That path never created the audio context. It stayed silent unless a button had activated sound first.
   - **Fix:** Activate wind from the keyboard gesture when entering or actively flying. Keep movement keys from waking audio during paused flight. Keyboard entry also clears a previous pause.
   - **If we skip it:** Keyboard visitors get silent flight, or a paused movement gesture can leave a silent audio graph running.

## Should fix — resolved

3. **Night-light placement blocked startup with deterministic raycasts**
   ([NightLights.tsx](../../my-site/src/app/world/NightLights.tsx),
   [builder](../../my-site/scripts/build-night-lights.mjs)).
   - **What this is:** Lights must sit on the original land surface.
   - **Problem:** The browser performed thousands of synchronous raycasts during rendering. Three runs against the actual model took 1,022–1,056 ms on this host; a remount repeated the work.
   - **Fix:** Build a 98,000-byte asset offline, using the shared world data and original GLB. All 24,500 Float32 values match the old generator. Runtime loads the attributes; both shaders are unchanged. Retry clears the new loader cache too.
   - **If we skip it:** Every visitor repeats about a second of avoidable main-thread work on this machine; slower hardware can take longer. The measured saving excludes network fetch and GPU upload.

4. **An animation dependency served one short entrance**
   ([globals.css](../../my-site/src/app/globals.css),
   [package.json](../../my-site/package.json)).
   - **What this is:** A journal fades and rises 14 pixels when opened.
   - **Problem:** Framer Motion was included for that single effect.
   - **Fix:** Use a 220 ms CSS entrance with the existing reduced-motion rule. Remove the runtime dependency. Next's reported first-load JavaScript fell from 149 kB to 113 kB, approximately 24%; the lazy Three.js scene still loads separately.
   - **If we skip it:** The initial route downloads an unnecessary animation library.

5. **Repeated lifecycle code could drift**
   ([Modal](../../my-site/src/app/Modal.tsx),
   [SceneErrorBoundary](../../my-site/src/app/SceneErrorBoundary.tsx),
   [context-loss hook](../../my-site/src/app/world/useWebGLContextLoss.ts)).
   - **What this is:** Three dialogs and two 3D scenes need the same browser lifecycle rules.
   - **Problem:** Each carried its own dialog, capability-probe or error-listener implementation. A fix in one place could leave the other behavior behind.
   - **Fix:** Share the native dialog, WebGL support probe, context-loss subscription and error-boundary class. Keep separate boundary instances for the world and board. Move help content to ExplorationGuide and the globe drawing to InkDrawings. Memoize the canvas and ignore unchanged status reports so telemetry does not repeatedly reconcile the scene. Standardize source formatting with a pinned development-only Prettier command.
   - **If we skip it:** Future fixes require multiple coordinated edits, and idle telemetry continues causing unnecessary React work.

## Tests

The wind probe previously connected its own silent output path. That could let a
missing production destination connection pass. It now attaches only when the
production gain connects to the actual destination. New checks cover keyboard
entry, audio staying suspended while paused, updated yard bounds, and recovery
after the new light asset fails. Existing flight, Codi, navigation, dialogs,
reduced motion, GPU fallback and accessibility checks remain.

## Validation

Production build, ESLint, TypeScript, formatting and the deterministic light-asset
check pass. All four board/prop GLBs validate without errors or warnings.
The final production browser matrix passes all 78 checks across Chromium, WebKit
and an emulated Pixel phone. Visual captures are recorded in REVIEW.md.

Verdict: Ship. Local review only; nothing committed or deployed.

Not checked: physical mobile hardware, publication infrastructure or long-running field performance. Startup timings are host measurements, not a browser-wide speed guarantee.

A subsequent lower-resource pass adds automatic economy resolution, cached
world shadows, hidden-tab suspension and smaller board textures. Measurements,
limits and reproduction commands are in REVIEW.md under “Lower-resource rendering pass.”
The Earth and pilot source meshes remain unchanged.
