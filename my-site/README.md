# Isaac's World

A local review build of Isaac Sun's personal atlas: a flyable Three.js globe
and five illustrated field notes. Nothing has been deployed.

## Run locally

Node 22 or newer is required.

```sh
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3107
```

Open <http://127.0.0.1:3107>. Each field note also supports a direct link:
`/#about`, `/#adventure`, `/#projects`, `/#career`, `/#vibes`.

For the production preview:

```sh
npm run build
npm run start -- --hostname 127.0.0.1 --port 3107
```

## Verify

```sh
npx playwright install chromium webkit
npm run format:check
npm run lint
npm run typecheck
npm run validate:models
npm run check:night-lights
npm run test:e2e
```

The E2E runner starts the dev server when necessary. To test an already running
production preview, use `BASE_URL=http://127.0.0.1:3107 npm run test:e2e`.
`npm run review:capture` saves desktop/phone screenshots from Chromium and WebKit
under ignored `artifacts/review/`; it needs an already running server.

Run `npm run format` after editing to apply the shared formatting rules.

Night-light positions are generated ahead of time from the original Earth geometry
and the shared landmark data. After changing either, run `npm run build:night-lights`.
`check:night-lights` detects a stale binary; browsers only load the 98 kB result,
then apply the live sun and shimmer shaders.

## Source map

- `src/app/WorldExperience.tsx`: navigation, world/journal shell, input, sound.
- `src/app/Modal.tsx`: native dialogs with shared opening, Escape and backdrop behavior.
- `src/app/SceneErrorBoundary.tsx`: independently isolates world and board rendering failures.
- `src/app/ExplorationGuide.tsx`: exploration instructions and help dialog.
- `src/app/world/WorldCanvas.tsx`: scene, GLB loading, lighting, inspection and landing.
- `src/app/world/flight.ts`: spherical flight, eased bank/steering, and UTC sun position.
- `src/app/world/codi.ts`: Codi's generated joints, skin weights, yard route and idle motion.
- `src/app/world/camera-motion.ts`: eased camera arcs and continuous framing.
- `src/app/world/useFlightWind.ts`: gesture-activated filtered wind and mute/fade lifecycle.
- `src/app/useReducedMotionPreference.ts`: shared live motion-preference subscription.
- `src/app/world/ambient-motion.ts`: redwood breeze, windsock flutter and bridge water.
- `src/app/world/NightLights.tsx`: precomputed land-attached lights, live dusk mask and shimmer.
- `src/app/world/data.ts`: five places, model coordinates and flight types.
- `src/app/journal/`: five independent page compositions with scoped styles.
- `src/app/journal/projects-sketchbook.css`: loose project sketches and project details.
- `src/app/InkDrawings.tsx`: editable pen drawings for the glider and projects.
- `src/app/globals.css`: shared paper/ink language and responsive shell.
- `src/app/world-presentation.css`: atlas opening, centered globe, and Explore menu.
- `public/fonts/`: self-hosted handwriting fonts and licenses.

The Adventure board and world use actual R3F/Three.js. The board loads a local
Blender GLB with nine physical photo prints, clips, a Spalding TF-1000 basketball,
a crinkled XXTRA Hot Cheetos bag, plants, Jean Kirstein and lights. Separate
portrait geometry keeps wires and bulbs unstretched, with matte ambient/direct lighting. Bounded tugs move and tilt the actual
objects; reduced motion keeps them still. Gallery controls remain usable over
matching desktop/phone stills if the asset or WebGL fails. Editable sources,
individual prop files and regeneration instructions are in
[the Blender asset folder](../assets/blender/travel-board/README.md).
Wind audio starts from the flight gesture, follows speed, and fades out when
paused, landed, in notes or in a background tab. The speaker mutes it. There is
no soundtrack or served music file.

See [review notes](../docs/redesign/REVIEW.md) for what to try and the remaining
provisional choices, and [the toolkit](../docs/redesign/TOOLKIT.md) for research.
This preview sets `noindex`; review that setting when publication is authorized.

About and Vibes share `src/app/journal/loose-notes.css` for upright handwriting,
uneven prose placement and inline drawings.

## Rendering budgets

Four or fewer reported CPU threads or 4 GB or less reported memory selects
economy rendering. Missing hints keep normal quality. Sustained flight below
35 FPS also lowers world rendering once per scene session; idle/demand frames
are not used to judge performance. Economy uses one canvas pixel per CSS pixel,
1024px world shadows and 512px board shadows. HTML typography stays at the
display’s native resolution. World shadows refresh at 12 Hz normally or 6 Hz
in economy mode; the live sun forces an immediate refresh. Hidden tabs stop
both scene render loops.

`npm run profile:rendering` records actual WebGL draw calls and target sizes in
`artifacts/performance/rendering.json`. Use `CPU_RATE=4 LOW_POWER=1 npm run
profile:rendering` to exercise CPU throttling and limited hardware hints. This
is a repeatable local comparison, not a substitute for testing an older GPU.
Board web textures are limited to 512px photographs and 1024px packaging; full
photographs remain available in the viewer and original images stay in the
Blender source folder. The board export has an 8 MiB regression budget.

`npx playwright test --project=iphone` runs the Safari/WebKit iPhone touch profile,
including compact, standard, large, and landscape navigation/control checks.
These emulate device/browser behavior and do not replace physical iPhone testing.
