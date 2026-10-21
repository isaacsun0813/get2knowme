# Website redesign

The application is in `my-site/`. Read `docs/redesign/REVIEW.md` for the current
implementation and review choices, `docs/redesign/HANDOFF.md` for the supplied
design brief, and `docs/redesign/TOOLKIT.md` for tools and research. The supplied
handoff and the user's latest feedback take priority over the original provisional
direction in DESIGN_DIRECTION.md.

Isaac's latest review explicitly preserves the original Earth palette and free
flight. Keep the vivid blue ocean and yellow-green land from the GLB; add lighting
without replacing its material colors. He likes the quieter interface, wants
stronger handwriting, and likes the hand-drawn Earth motif. Projects uses a loose
hand-drawn sheet with illustrated project objects, following his explicit
choice over the shelf. He dislikes italic or naturally slanted lettering: use
upright Patrick Hand with Gochi Hand headings. Prefer uneven placements and
small drawings over repeated cards and rigid visual hierarchy. His private
letter is visual inspiration only; keep its wording and images out of the site. Keep it readable and interactive on phones.
The latest home direction is an atlas drawing/lettering loading moment that fades
automatically into a centered Earth. Keep direct page navigation in the single Explore
menu; optional globe visits live in its disclosure. The latest globe review rejects near-black shading and paper overlays.
Use broad neutral fill and a softer live sun, retaining visible blue/green night
colors. Keep flight/location actions as small plain text; no taped cards,
scenic-route badge or tilted paper controls. Lighting follows the live sun; the overview initially faces the paraglider’s starting position, independent of the live sun. Nighttime should have
warm, subtle city-light clusters and occasional sparkly glints, fading out in
daylight. Keep night visibly dimmer than day without crushing the palette. Reduced-motion mode keeps the lights steady.

Codi uses the original Saratoga dog geometry with a procedural skeleton and yard
route in `world/codi.ts`. Preserve its four source material groups and check
actual deformed vertex bounds if changing the route or rig. Banking and steering
ease through `FlightState.bank`; the model rolls by its negative to lean into
the turn. Do not restore input-driven instantaneous roll. The front yard is
expanded independently of the house, and Codi's head motion must remain continuous
when his walking/resting phases change. Preserve the visible left/right head scan.
Flight framing aims at the transformed visual center of the full paraglider.
Do not scale the Canvas ancestor during the opening: R3F measures the scaled
bounds and leaves the render smaller than the viewport. Use the opacity fade.
Camera entry/exit and landmark inspection use a spherical travel arc with continuous
framing; reduced motion skips it. Clouds, Chicago's N, redwood breeze, windsock
and water should remain gently alive outside flight, pausing behind notes/menus.

The soundtrack is removed. Flight uses quiet speed-responsive Web Audio wind,
started by a flight gesture and muted by the header speaker. Fade it out when
paused, landed, viewing notes/menus, or in a hidden tab. Keep the black space
backdrop separate from the original Earth materials and the centered glider.

Adventure uses a real Blender/Three.js board. Its editable sources, standalone
basketball/Cheetos/Jean props and generator are in `assets/blender/travel-board/`.
Keep the nine featured photo textures and 17-photo dialog. Share placements and
captions through `journal/board-layout.json`; preserve named GLB object roots,
bounded 3D tugs, reduced-motion behavior, phone composition and accessible HTML
photo buttons. Matching rendered stills keep the gallery usable if WebGL or the
board asset fails. Isolate that failure from the Earth scene.

Use the project skills in `.agents/skills/` as needed:

- `isaac-design`: the site's design process, critique, and Blender/Three.js handoff.
- `frontend-design`: visual composition and typography.
- `vercel-react-best-practices`: relevant React/Next.js performance rules.
- `webapp-testing`: browser reconnaissance guidance. This repo uses the existing
  Node Playwright commands; installing Python Playwright is unnecessary.

Keep the existing stack unless a concrete requirement justifies a change. Make
refactors in working slices; keep content, rendering, and input responsibilities
readable. Do not apply performance rules speculatively or introduce a component
framework just to obtain a style. Preserve actual portfolio facts and links.

For UI changes, inspect desktop and phone screenshots and exercise the affected
interaction. For 3D changes, validate the GLB files and inspect real rendering;
a valid canvas context alone does not prove scene correctness. Record what ran
and any remaining gaps. Keep generated reports in the ignored artifact folders.

The user requested a local, uncommitted review build. Do not commit, create a
PR, push, or deploy unless a later user instruction authorizes that action.

Keep the night-light binary reproducible: after changing Earth geometry, world scale
or landmark positions, run `npm run build:night-lights` in `my-site/` and verify
with `npm run check:night-lights`. Do not move surface raycasting back into render.
Use `npm run format` / `npm run format:check` for source styling. Dialog lifecycle
and graphics error isolation are shared in `Modal` and `SceneErrorBoundary`;
keep the board and globe as separate boundary instances.

Keep adaptive quality measurements limited to continuous, unpaused flight.
Overview and board use demand rendering, so their intentional idle frame rates
must not trigger quality changes. Preserve live sun invalidation when caching
world shadows. Keep the original Earth geometry and materials in economy mode.

Isaac likes the existing code-drawn SVGs: preserve them and add restrained touches
in that same style rather than replacing them with copies of his letter. Remove the added bird doodle. Keep
Take flight off-center over a full-height canvas; do not reserve a bottom strip or
cover the Earth with a gradient. Enter opens the nearest page while flying,
except when focus belongs to an interactive control.
Test iPhone WebKit touch layouts in portrait and landscape when changing controls.

Career keeps roles in sequence without dates. Northwestern mentions only the ETH
Zurich semester alongside the degree; do not restore diffusion-model research.
The next knot is only: Find where robotics and climate solutions align.
Do not restore the former career/personal goals disclosure.

The latest globe direction uses plain black space with light world controls and
cream journal pages. Keep the first overview camera on the paraglider's surface
normal, rather than rotating it with the sun. Floating decorative cloud meshes
do not cast ground/ocean shadows; their oversized shadows were mistaken for
night shading. Live sunlight, atmospheric rim and city lights share one sun vector.
