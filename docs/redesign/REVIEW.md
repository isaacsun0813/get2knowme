# Isaac's World — local review

Prepared 15 October 2026. The production preview is at
<http://127.0.0.1:3107>. All work is local and uncommitted on
`local/isaacs-world-redesign`; no PR, push, merge, or deployment was performed.

## A good first pass

1. Let the hand-drawn atlas opening fade into the centered globe. Turn it by
   dragging; scroll or pinch to look closer. Daylight follows the live UTC sun.
2. Select **Take flight**. Hold W/↑ to move, A/D or ←/→ to steer, S/↓ to slow.
   Phone-sized layouts have holdable arrow buttons. P pauses; Escape returns
   to the overview. The help button explains the controls.
3. Open **Explore → Visit a place on the globe → Saratoga** to watch Codi trot through
   the yard, pause, look around, wag and turn back. Scroll closer for his leg motion.
   The front yard is wider and Codi follows a smooth oval with a steadier head.
   A/D banking eases into the turn, leans toward the turn correctly, and settles
   after release or reversal.
4. Open **Explore** in the header to open any of the five pages directly.
   Optional globe visits live under **Visit a place on the globe**.
   Use E while flying to look closer, then **Open** to read the page.
5. Inspect Zurich, choose **Land in the meadow**, then **Take off again**.
6. Open all five notes. Move the clipped photos, basketball, charm and snack bag
   on the Adventure board; release and they settle. Select a photo to see the
   gallery, or a project sketch to read the project details. Escape closes those details
   first, leaving the page open.
7. Scroll Career to the next knot and open the folded goals list. Check the
   letter and About composition, including the Substack link.
8. Take flight to hear the wind rise with speed. Try muting it with the speaker;
   pause, landing or notes fade it out. The soundtrack is removed.

Direct links: [About](http://127.0.0.1:3107/#about),
[Adventure](http://127.0.0.1:3107/#adventure),
[Projects](http://127.0.0.1:3107/#projects),
[Career](http://127.0.0.1:3107/#career),
[Vibes](http://127.0.0.1:3107/#vibes).

## What was built

The latest feedback restores the original vivid Earth materials and free flight,
keeps the quieter interface, and asks for stronger handwriting and drawn details.
The [supplied handoff](HANDOFF.md) supplies the page references. Current renders were
used; superseded Adventure and Career concepts were excluded.

The home shows the atlas lettering and drawings while the models load, then
fades automatically into the centered globe without a click-through gate. The
large persistent note tabs and duplicate navigation are replaced by one Field
notes menu. Pages fill the space below the header. It uses the actual house/Codi, Golden Gate, N/Bean,
Shanghai tower, Zurich Alps/meadow and rigged paraglider. Flight follows a
spherical surface; the imported Glide clip and wind streamers activate during
movement. Sun position follows UTC and seasonal declination using the
[NOAA approximation](https://gml.noaa.gov/grad/solcalc/solareqns.PDF), creating a
geographical day/night boundary. Camera inspection is explicitly requested.
Night lights are a single additive point layer with warm clusters on the actual
land surface and occasional soft starbursts. They fade through dusk using the
same live sun vector. Their distribution is a stylized sketch of settlements,
not satellite imagery or live population data. The slow shimmer follows the scene clock; reduced motion keeps it static. Rendering
stops behind open notes and while paused. No Blender export or bloom dependency
is needed for this layer.

About uses live text and the selected photo-led composition. Adventure has a
physical wire board with nine featured photos and a 17-photo viewer. Projects
uses a loose handwritten sheet with illustrated project objects, selectable
notes, and the original descriptions/statuses. Career
has six detailed, grounded chapters on a knotted cord, plus the original climate
interests and personal goals. Vibes keeps the original story verbatim.

The Adventure board uses an actual Blender GLB, replacing the CSS silhouettes.
The physical rack, wires, lighting bulbs, Jean Kirstein charm, plants, wooden spring
clips, curled photo prints and handwritten captions are modeled geometry.
The basketball uses pebbled leather and channel normal mapping; the foil Cheetos
bag has XXTRA Hot front packaging and matte black reverse, crimped seals, volume and wrinkles.
Small tugs lift, turn and move the real objects, then ease them back to rest.
The scene renders on demand, keeps motion off for reduced-motion preferences,
and rearranges the same roots into a portrait composition on phones.
The nine featured images and 17-photo viewer remain intact. HTML buttons
preserve keyboard/touch access even over the matching rendered still when a
model, WebGL, or the board GPU context fails. That failure is isolated from Earth.
Editable board, TF-1000 basketball, XXTRA Hot bag and Jean `.blend` sources, individual GLBs, reference
renders and the generator are in
[the Blender asset folder](../../assets/blender/travel-board/README.md).

Projects follows Isaac's explicit preference for a hand-drawn sketchbook over
matching the shelf render. A ruled sheet holds unevenly placed pen-drawn project
objects, handwritten subtitles and marker accents. Sketches flow on phones;
semantic buttons open the existing project details and links. Its styles are
separate from Adventure. The globe remains actual WebGL, with original material
colors and a solar directional light, neutral night fill, terrain/landmark shadows,
and a daylight-sensitive atmospheric rim. Plain compact location actions replace
the taped flight card; the scenic-route badge is removed. Ocean geometry keeps its shape but
gets radial normals at runtime to avoid face seams in the terminator. The
overview starts near the current daylight edge; free flight is preserved. The project drawings
remain editable SVG paths. See the
[optional asset brief](BLENDER_ASSET_BRIEF.md) for future illustrated props.

## Wind, flight distance and background

The soundtrack is removed, including its served MP3. Flight uses filtered noise
from Web Audio: a quiet air rush that grows with speed, activated by the flight
button. The speaker controls wind, and the sound fades out for pause, landing,
notes, menus and background tabs. No downloaded sound or new dependency is needed.

The camera pulls back modestly while aiming at the same visual center: radius
53 on desktop and 66 on phones. The globe backdrop changes to warm stone
(`#e8e2d8`, light `#f4efe5`, outer `#ddd6ca`), with existing ink `#2e4053` and
paper `#faf8f1`. This complements the vivid blue/lime model; Earth materials,
handwriting and composition stay intact. The bottom control fade uses the same
stone hue. Desktop and phone previews were inspected in `warm-world-*` and `wider-flight-*`
captures. Native Web Audio output was measured in Chromium, WebKit and phone
emulation: gesture activation, speed response, mute and pause fading all pass.
Speaker/headphone loudness remains a listening review.

## Latest flight centering

Flight now aims at the transformed visual bounds center of the canopy and pilot,
rather than the Earth beneath them. The opening scale animation was removed:
R3F measured its .96 ancestor scale and retained a canvas 4% too small even after
the CSS animation finished. The opening retains its fade, and the canvas fills
the actual stage. A browser assertion protects its width and height.
Desktop/phone captures are `flight-centered-{desktop,phone}.png` under ignored
review artifacts. The affected loading, flight and camera paths are rechecked
in all three browser profiles, including the full regression pass below.

## Living globe and camera travel

Codi's original sideways head pose is corrected at the neck. During each pause
he looks clearly to both sides; his chest bandana stays with the torso. Head
weights and phase-boundary continuity are checked against the original geometry.

Entering and leaving flight, and inspecting landmarks, use an eased 1.8-second
camera journey. Position follows a spherical arc outside the Earth; orientation
keeps the globe in view while blending the roll. The endpoint can track the
moving pilot. New requests start from the current pose, and reduced motion skips
the journey. Flight now frames the paraglider closer. Overview returns outward
from the current side of the globe.

Imported clouds and Chicago's N animate in overview and inspection as well as
flight. A gentle breeze sways Saratoga's redwood, flutters Zurich's windsock and
moves the bridge water surface, keeping its attachment and bed fixed. Ambient
refresh requests run at 20fps when outside flight. Notes, menus, pauses and live
reduced-motion changes stop ambient movement. These use the existing geometry
and clips; no dependencies or replacement assets are added. Recordings and
screenshots are in `my-site/artifacts/review/living-world-final/` and the adjacent
`camera-in-*`, `camera-out-*`, `flight-close-*`, and `codi-looking-*` captures.

## Latest globe review

The latest screenshot rejects the near-black night side and artificial paper UI
over the globe. Preserve the original GLB palette with broad neutral fill and
a softer live solar key. Use quieter, smaller night lights. Keep Patrick Hand
and Gochi Hand, ink `#2e4053`, sky `#dde8e7`, paper `#faf8f1`, blue `#527dab`,
and the original blue/lime model materials. The globe stays the central object:
plain back action at top left, compact city/actions at bottom left, flight
controls along the bottom. On phones the city/actions wrap above touch controls.
Night remains darker, but uses neutral ambient and hemispherical fill instead
of near-black lighting. City glows are smaller and less intense. Same-camera
Shanghai comparisons are saved as `soft-shanghai-{day,night}-{desktop,phone}.png`
in the ignored review artifacts. The pixel regression checks visible pale-gold
lights and caps near-black coverage on the visible night side.

Remove the scenic-route badge, tape, tilted panels and redundant location copy;
keep navigation inside the existing disclosure, without paper-card styling.

## Latest composition direction

Isaac's private handwritten letter is a visual reference only. Its private text,
images and document instructions are not website content. Reference renders
stay outside the repository and served assets.

- Upright Patrick Hand for the writing, Gochi Hand for marker lettering. No
  italic faces or synthesized italics.
- Ink `#292e32`, blue `#155eaf`, violet `#8650a0`, leaf `#398652`,
  highlighter `#f5ee80`, ruled paper `#faf9ef`.
- Projects becomes a loose sheet of sketches: uneven positions, different
  object sizes, annotations around the objects, no equal quadrants or spine.
- About and Vibes use uneven prose blocks, inline drawings and marker accents.
  Public portfolio wording remains intact. Career keeps its chronological cord
  but relaxes the repeated tag proportions; Adventure keeps its physical board.
- The Earth, free flight, live sun and night lights remain central and unchanged.
- Desktop uses deliberate offsets; phone layouts keep those offsets in normal
  reading flow instead of shrinking a large canvas.

## Choices still worth your taste pass

- Lettering uses self-hosted Patrick Hand for notes/body and Gochi Hand for headings.
  The paraglider and project subjects have custom pen-stroke SVG drawings.
- The board now has an original Jean Kirstein figure, TF-1000 ball and XXTRA Hot
  Cheetos. Ticino, Zermatt and Wicker Park bring it to nine featured photos; all
  17 remain in the viewer. The bottom is intentionally empty; Isaac plans to link a Substack post about his travel philosophy later.
- About's sunset image is visually cropped from the supplied reference. Its
  original high-resolution photograph was absent, so it is visibly softer than
  the forest portrait. Replace the source photo before final publication.
- Meta's exact dates and work details were not invented. Foxglove says only
  software engineer, 2026–now, robotics developer tools. Career stops can be
  reduced or reordered after your review.
- Wind includes a quiet speed-responsive air rush. The music is removed.
- The home now follows the latest feedback: atlas opening, Earth as the focus,
  live day/night lighting, and a single notes menu. Review its timing and contrast.

## Engineering and verification

The upright lettering and loose composition pass was inspected in Chromium and
WebKit at desktop and phone sizes, plus Chromium at 820px. The tablet sketches
and prose stay within the viewport. Updated captures are in
`my-site/artifacts/review/`, including `tablet-projects.png` and `tablet-vibes.png`.
Real-device touch and subjective typography still deserve Isaac's review.


The production build, TypeScript and ESLint pass without source warnings.
**90 checks pass against the production preview** across desktop Chromium,
an emulated Pixel phone, and WebKit. The matrix includes eighteen browser scenarios, four flight/sun math checks,
one source-geometry Codi rig check, one camera-path check, one wind/surface
geometry check and one Blender asset structure check per profile. It covers the delayed-model opening, menu keyboard focus/dismissal, noon vs
midnight daylight updates and actual warm night-light pixels, navigation, direct
links/back, dialogs, keyboard close, flight/steering/pause, landing/takeoff,
reduced motion, model-load retry, GPU context loss, and no-WebGL access to notes.
Hash navigation uses the Next router so framework URL updates cannot race the
browser Back action. Twelve repeated Back-navigation checks passed across all
three profiles. Notes replace immediately with an entry fade. Returning from paused flight restores
overview interaction, verified by orbiting the actual rendered canvas.
Codi's route, source-vertex skin weights and bounds, live reduced-motion stop/resume,
and bank easing/reversal are included. A rendered yard recording is retained in
`my-site/artifacts/review/codi-motion-v2/`. His rig and motion are procedural;
individual paw planting remains approximate.
All six main views pass the automated WCAG-tagged axe scan in those profiles.
This supplements, rather than replaces, manual accessibility review.

The new board and all three individual prop GLBs validate with zero errors and zero
warnings. The board export is about 7.5 MiB and loads only in Adventure; it uses
embedded textures and local lighting without an external decoder or asset host.
The source verifier reopens all four regular Blender projects, checks their
review cameras and packed textures, and verifies nine editable handwritten
captions in the board source. Desktop and phone renders were inspected against
the Blender references. Browser checks compare real rendered pixels during a
ball/photo tug and after settling, test live reduced-motion changes, verify
keyboard/touch gallery access, and isolate board asset/GPU failures from Earth.
The globe and board share the existing live motion-preference subscription.

Both supplied GLBs have zero validation errors. The paraglider retains 14
skinned-mesh hierarchy warnings and the globe two tangent-generation warnings;
actual imported rendering was exercised in Chromium and WebKit. Original
source assets were preserved; this pass did not rewrite their geometry.

Production `npm audit --omit=dev` reports zero advisories. Five remaining high
advisories are in the development-only Next ESLint plugin's glob dependency
chain; the suggested automatic fix would downgrade its framework configuration,
so no force-fix was applied. Review upstream fixes during future maintenance.
The unused legacy gltfjsx generator and 267 dependencies were removed; compatible
security fixes and patch overrides were applied.

Duplicate input, camera and mobile-page systems and dead components were
removed. Each journal page owns its scoped styling; the world presentation is
separate from flight/rendering, and scene motion stays in refs rather than
per-frame React state.
The Next build reports 149 kB initial first-load JS versus the earlier 428 kB;
3D and journal bundles load separately, so this is not a total transfer budget.

The retired public globe asset containing sensitive metadata was removed from
the served tree. Its history/live predecessor is outside this local change:
revoke/rotate any credential previously embedded there before publication.

Real phone hardware, assistive technologies and sustained low-power GPU
profiling were not tested. The source model warnings and provisional art/content
choices above remain visible review items. No production deployment is authorized.

## Screenshots and rerunning

The world/page captures are in `my-site/artifacts/review/`:
Chromium and WebKit × desktop and phone viewport × six views. The latest 3D
board captures are `board-personal-desktop.png` and `board-personal-phone.png`;
these supersede the earlier CSS-board images. Additional
landmark/landing captures are alongside them. They are deliberately ignored by
Git. Test output is in `my-site/test-results/` and `my-site/playwright-report/`.

If the local preview has stopped:

```sh
cd /Users/isaac/Downloads/Github/get2knowme/my-site
npm run start -- --hostname 127.0.0.1 --port 3107
```

After changing source, run `npm run build` before `start`, or use the dev command
in [the app README](../../my-site/README.md). `BASE_URL=http://127.0.0.1:3107 npm run test:e2e`
checks an existing preview; `npm run review:capture` regenerates the screenshots.
The preview uses `noindex`; review that setting only when publication is authorized.

The latest board pass removes environment reflections and the page lighting wash.
Separate portrait and landscape racks keep the light cord and bulbs unstretched.
There is no about-me blurb below the board. Leave it empty until Isaac supplies
a Substack post about his travel philosophy.

Photo activation waits for the completed click so a touch release cannot open
the dialog and send the following click through to its backdrop. Dragging stays
separate from photo activation. Newly featured photographs are exercised by
name in the browser suite. Pixel motion comparisons blur keyboard focus first
and wait for the object to settle instead of counting focus outlines as motion.

## Engineering cleanup

The local code-review pass is recorded in [CODE_REVIEW.md](CODE_REVIEW.md).
Shared native dialogs, independent scene error boundaries, WebGL capability checks
and context-loss handling now have one implementation each. The exploration guide
and globe drawing have explicit component homes. Formatting uses the pinned
Prettier development dependency; `npm run format:check` and ESLint pass.

The journal entrance uses CSS instead of Framer Motion. Next reports 113 kB first-load
JavaScript versus 149 kB before this pass. This is a bundle measurement, not a full
page-load time: the 3D code and assets still load separately.
Night-light surface coordinates are precomputed into a 98,000-byte binary.
All 24,500 float attributes match the original generator, and both shaders are
unchanged. This removes approximately one second of synchronous host CPU work
from each initial mount; fetch and GPU upload remain. Use `build:night-lights`
after changing source geometry/world scale/landmarks, and `check:night-lights`
to detect stale output.

The final production matrix passes 78 checks across desktop Chromium, WebKit
and an emulated Pixel phone. Added coverage protects keyboard-first audio,
paused audio suspension, edited yard bounds and retrying a failed night-light
asset. Production build, TypeScript, ESLint, formatting, deterministic asset
validation and all four board/prop GLB validations pass. Review screenshots
are `my-site/artifacts/review/refactor-{desktop,phone}-{world,board,project-dialog}.png`.
All changes remain local and uncommitted.

## Lower-resource rendering pass

Rendering keeps the original Earth, geometry, palette, pilot, Codi and controls.
Limited hardware hints (up to four CPU threads or 4 GB reported memory) select
one canvas pixel per CSS pixel. Missing hints retain normal quality; sustained
flight below 35 FPS can also select economy rendering. Demand/idle rendering
is excluded from that decision. Shadow maps are 2048px/1024px for the world
and 1024px/512px for the board in normal/economy modes. World shadows update
at 12/6 Hz while the sun requests an immediate update when it changes. The
main flight loop remains continuous. Hidden tabs stop scene drawing entirely.

The board's web photographs are 512px and packaging is 1024px. Full originals
remain available in the photo viewer and source files; the main editable Blender
scene retains original images. Regenerated individual sources embed their web
textures and pass the reopen verifier. All four GLBs validate without errors
or warnings. The board's regression budget is now 8 MiB.

A local WebGL-call profile used Chromium, a 1280×800 viewport and device scale 2.
Each steady flight sample lasted about three seconds. Results are one local
comparison, not a guarantee for another CPU/GPU or a statistically exhaustive
benchmark. The CPU-throttled sample also supplied four-thread/4-GB hints.

| Measurement | Before | After (adaptive economy) | After (4× CPU throttling, economy) |
| --- | ---: | ---: | ---: |
| Flight rendered frames / second | 18.3 | 42.7 | 37.3 |
| Flight shadow draw calls / frame | 48 | 6.75 | 7.71 |
| World framebuffer | 2048×1139 | 1280×712 | 1280×712 |
| World shadow target | 2048² | 1024² | 1024² |
| Board framebuffer | 1167×761 | 1167×761 (normal) | 666×434 |
| Board shadow target | 1024² | 1024² (normal) | 512² |
| Estimated board RGBA8 texture bytes, before mipmaps | 69.33 MiB | 18.75 MiB | 18.75 MiB |
| Board GLB | 9.66 MiB | 7.54 MiB | 7.54 MiB |

The board and paused globe produced zero draw calls during the board idle sample.
World overview shadow passes fell from every rendered frame to 12 per second.
The adaptive profile used approximately 61% fewer world framebuffer pixels.
CPU throttling simulates slower JavaScript execution; it does not emulate an
old GPU, limited bandwidth or actual low-memory pressure.

Reproduce with `npm run profile:rendering`, optionally adding `CPU_RATE=4
LOW_POWER=1`. Ignored evidence is in `my-site/artifacts/performance/`:
`before.json`, `after.json`, `limited-cpu.json`. The shared probe counts actual
WebGL draw calls and offscreen target sizes without synchronously querying GPU
state. New checks exercise hardware policy, actual target/texture limits,
shadow refresh budgets and hidden-tab stop/resume.

The final lower-resource production matrix passes all 90 checks across desktop
Chromium, WebKit and an emulated Pixel phone. Build, lint, type checks, formatting,
all four GLB validations, deterministic lights and packed Blender-source reopening
pass. The new screenshots are `performance-{normal-desktop,economy-desktop,
economy-phone}-{world,board}.png` under the ignored review artifact folder.
Physical older computers/GPUs remain untested; CPU throttling is only a simulation.

## Globe navigation and drawing follow-up

The approved SVG drawings are retained. Two new code-native doodles, a small bird
and a looping arrow, accompany the offset Take flight action. The bird responds
to hover/focus without adding a render loop; reduced motion suppresses the transition.
This follows Isaac's clarification that he wants more of the existing SVG energy,
not replacement drawings or literal copies of his private letter. No letter content
was used. Patrick Hand/Gochi Hand and the original blue/lime Earth are unchanged.

The background is a flat pale blue-gray (`#edf2f3`). Removed the beige radial wash
and the bottom gradient that was covering the Earth. Flight controls now have
space outside the canvas instead of relying on fog to make text readable. Explore
replaces Field notes: main choices open pages directly; optional geographic camera
visits are grouped in a disclosure. Existing flight, inspection, Codi, landing,
and keyboard controls remain available. Closing a page preserves its opener for
focus restoration rather than replacing it with the closing button.

Added an iPhone 13 WebKit touch project, plus compact (375×667), standard (390×844),
large (430×932), and landscape (844×390) layout cases. Landscape no longer inherits
a minimum world height that pushes controls below the screen. Phone hints say
pinch instead of scroll. These are browser/device emulations, not physical iPhone
Safari address-bar, safe-area, or thermal/GPU measurements.

Validation for this follow-up: production build, lint, TypeScript and formatting
checks pass. The final production-preview Playwright run passed **124 checks** in
7 minutes across desktop Safari/WebKit, desktop Chromium, Android/Pixel 7 and
iPhone 13/WebKit. Twelve skips are the four iPhone-only size cases excluded from
each of the other three projects. Accessibility, flight/camera/banking/Codi,
landing, lighting, audio, WebGL recovery, board/photo interactions and rendering
budgets remain green. The board drag test now measures pointer coordinates after
canvas screenshots, since screenshots can scroll the phone viewport; mobile
photo interactions use the mobile fixture rather than a specific project name.

Viewed desktop world/flight/menu captures and iPhone world/flight captures in
portrait and landscape. The glider is centered in its render area, controls fit
the viewport, and the original blue/lime palette remains clear. Review captures
are in `my-site/artifacts/review/playful-desktop-*.png` and
`my-site/artifacts/review/playful-iphone-*.png`. Physical iPhone Safari browser
chrome, notches and GPU behavior still require a device review. The local
production preview remains at http://127.0.0.1:3107; nothing was committed, pushed,
published or made into a PR.

## Bottom strip removal and flight page shortcut

Isaac rejected the reserved bottom area and the added bird. Removed the bird
component and its styles, removed the bottom orbit/zoom hint line, and restored
a full-height canvas in overview, flight and inspection, including phone and
landscape layouts. The looping arrow and all older approved SVGs remain. Flight
page/location actions sit near the top left; desktop flight controls also float
near that corner instead of sitting over the ocean at the bottom. Touch controls
stay within reach at the bottom with legible individual buttons. There is no
reserved footer strip or gradient covering the Earth.

Enter opens the nearest page while flying. The page button advertises Enter on
keyboard layouts, and the guide explains it. E retains geographic inspection.
The shortcut ignores editable fields, modified/repeating keystrokes, open menus
and dialogs, and focused interactive controls, so native Enter activation works.

Build, lint and TypeScript checks pass. Eight targeted browser checks pass: Enter
on desktop Chromium, desktop Safari/WebKit, Android and iPhone; and compact,
standard, large and landscape iPhone layouts. Twelve skips are those iPhone-only
cases excluded from other projects. The earlier full 124-check run is recorded
above; it was not repeated for this small follow-up. Latest screenshots use
`my-site/artifacts/review/full-scene-*.png`. All changes remain local/uncommitted.

## Career copy and chronology

Replaced dense resume metrics with short descriptions from Isaac's latest account:
Lumentum testing/MATLAB visualizations; Relativity DevOps/dashboarding/observability/
APIs; Intel full-stack internal tools; Meta Ads Serving retrieval and ad-format
optimizations; Foxglove ML tooling for roboticists. PrizeSole and Northwestern
remain, with broader descriptions. Northwestern's graduation now appears after
Intel rather than ahead of the earlier jobs; Foxglove is the latest chapter.
The future-work paragraph reflects robotics and climate solutions.

Lumentum is an undated early chapter, following the sequence Isaac supplied; its
exact dates are pending his reply. The repository resume PDF has invalid binary
content and PDFKit cannot read it; the same corruption exists in HEAD. The linked
Drive resume was not accessible through the web reader. Dates for other existing
entries come from the prior handoff; Meta retains the honest relative label
Before Foxglove rather than inventing employment dates. No resume file was altered.

Production build, lint and TypeScript pass. Desktop Chromium and iPhone WebKit
checks verify chapter order, existing dates, new descriptions, goals disclosure,
no horizontal overflow and no page errors. Viewed start/current-role captures at
`my-site/artifacts/review/career-general-*.png`. Preview remains local and uncommitted.

## Career simplification

Isaac explicitly prefers no career dates, so removed date fields and display
styles while preserving the role sequence. Northwestern's detail is now only
A semester at ETH Zurich. Removed the diffusion-model research reference.
The next knot is now solely Find where robotics and climate solutions align;
removed its older climate-tech/personal-goals disclosure and unused styles.
Updated the existing career navigation check to verify the simplified content.
This supersedes the earlier pending-date note; no dates need confirmation.

Validation: production build, lint and TypeScript pass; four targeted career
content/navigation checks pass across desktop Chromium, desktop Safari/WebKit,
Android and iPhone. Viewed desktop/phone captures of the undated timeline and
single goal (`career-no-dates-*.png`, `career-goal-*.png` in the review artifacts).
The local preview is running; changes remain uncommitted.

## Pilot-facing opening and space background

The first overview camera now uses the paraglider's starting surface normal,
independent of the solar direction. The return-to-overview camera still follows
the visitor's current viewing direction and retains the spherical transition.
Compared plain black (`#000000`), deep navy (`#080f1b`) and muted purple (`#17131c`)
against the same fixed-time scene. Selected black, following Isaac's Google Earth
reference. Comparison captures are `space-{black,navy,plum}-comparison.png` in
the ignored review artifacts. World controls/intro use light ink; journal pages,
Explore menu and dialogs keep the readable paper palette. Small text shadows
keep world labels readable when a pale cloud passes behind them. No new stars,
background animation, theme selector or render loop was added.

Large angular dark patches in the ocean were shadows cast by the oversized
decorative cloud meshes. Those clouds no longer cast shadows; landmarks still
cast theirs. Earth material colors and geometry are unchanged. Solar light, rim
and city-light masking still share one live UTC sun vector. Checked the existing
algorithm against NOAA's solar equations:
https://gml.noaa.gov/grad/solcalc/solareqns.PDF
The Earth is a stylized mesh; this does not turn its coastlines into a precision map.

Added a camera/pilot alignment assertion to the opening check and expanded solar
math coverage for day/night at the starting location. Lighting screenshots now
use Bay Area daytime (20:00 UTC) and nighttime (08:00 UTC). Pixel checks sample
inside the Earth, excluding the new black background, and distinguish warm lights
from yellow-green daylight terrain. The source GLBs still validate with zero
errors; their pre-existing skinned-mesh/tangent-space warnings remain.

Validation: 28 targeted checks pass across desktop Safari/WebKit, Chromium,
Android and iPhone (12 skips exclude iPhone-only cases from other projects).
Coverage includes start alignment, UTC lighting, camera travel/reduced motion,
fallback navigation, all-page axe checks, and four iPhone sizes/orientations.
Viewed fixed-time desktop daytime/nighttime captures; the night retains visible
blue/green with city lights and daytime no longer has giant cloud-shadow patches.
Lint, TypeScript, formatting and production build pass. Physical iPhone remains
unverified. Work stays local and uncommitted.

### Chicago landmark refinement

Chicago now loads a standalone editable Blender landmark while preserving the
original Earth file and anchor placement. The Northwestern athletic N uses the
retained source vector silhouette and official purple, a thin white border and
gentle bounded motion. The Bean has a smooth asymmetric shell, a real arch and a
small static reflection map. The original base/plaza are reused. Chicago's
inspection camera sits lower to expose the arch. Source and rebuild instructions:
`assets/blender/chicago/README.md`.

Inspected desktop Chrome and iPhone WebKit renders; no browser errors in either
capture. New GLB: 137 KiB, zero validator errors/warnings. The reflection JPEG is
12 KiB. Production build, lint, typecheck and night-light determinism passed.
Targeted desktop/iPhone regression checks: 10 passed, covering bounded logo
motion, opening alignment, flight/landing, Earth/GPU failure recovery, Chicago
asset retry and inspection-to-Career navigation.

### Adventure: a larger, moving photo collage

The review rejected the small static rack, dull pictures and red/brown basketball.
The new composition keeps the supplied photographs and modeled props, using
larger, uneven prints and thinner wirework. The board now fills up to 1340px
instead of shrinking to fit a viewport-height formula. On phones it becomes a
taller two-column collection so the photos remain legible while scrolling.

The page retains upright Patrick Hand/Gochi Hand. Its palette is warm wall
#f0ebdf, off-white paper #faf7f0, graphite #49483e, orange leather #d46629,
and existing green plants; the photos supply the strongest blue/green colors.
Existing looping-arrow SVG language accompanies the heading. The footer only
opens the 17-photo gallery; no biography/travel-philosophy text is added.

Photo surfaces now export as unlit materials and bypass browser tone mapping,
preserving original photograph colors. Paper/props keep their depth and lighting.
The ball's procedural leather map is orange. Both layouts, still fallbacks, native
Blender sources and standalone prop assets are regenerated by the source builder.

Small clip-centered sway and ball/charm rotation make the collection alive before
interaction. Hover/focus raises and slightly enlarges a print; tugs still spring
home. Motion is capped at 24 Hz/12 Hz on limited hardware, with cached shadows at
12/6 Hz. It pauses offscreen, in hidden tabs and behind an open photograph;
reduced motion disables movement. No animation/physics dependency was added.

Validation for this iteration: the 20 board checks across Chrome desktop,
Safari/WebKit desktop, Pixel/mobile Chrome and iPhone/WebKit pass, covering
asset structure, photo opening, drag/settle, keyboard access, reduced motion,
ambient motion, asset failures and context loss. Six additional desktop/iPhone
checks pass for accessibility, low-end render targets, cached variance shadows,
no board draws behind a photograph and no draws in a hidden tab. Production
build, lint, typecheck and formatting pass; all four board/prop GLBs validate
with zero errors/warnings. Desktop and iPhone screenshot captures report no
browser errors and are in `artifacts/review/board-redesign-*.png` under `my-site/`.
Phone checks use browser emulation; no physical iPhone was available.

### Clicks feel like picking things up

Followed the user-linked Web Animation Design skill (Vercel's open-agents,
based on Emil Kowalski's course):
https://mcpservers.org/agent-skills/vercel/web-animation-design
Original instructions read from
https://github.com/vercel-labs/open-agents/blob/main/.agents/skills/web-animation-design/SKILL.md.

Shared native dialogs now travel from the selected print/sketch into their
reading position in 280 ms, and ease back in 220 ms. Backdrops share their timing
and easing. The implementation uses the browser Web Animations API with only
transform/opacity, retains dialog content until its exit finishes, and cancels
or retargets an in-progress animation. Native modal focus/inertness remains;
known pointer origins explicitly receive focus after closing on iPhone Safari.
Pointer-opened dialogs avoid a large autofocus outline; keyboard interaction
restores visible focus. Keyboard opening/closing and reduced motion skip travel.

Adventure paging turns the image and caption together in 200 ms while keeping
navigation controls still. Static Next.js image imports provide tiny built-in
previews so the photo remains recognizable while the full image loads, without
new packages or a separate thumbnail build pipeline. Full images load eagerly
inside the viewer. Reduced motion also disables placeholder transitions.
The source photos, Blender assets, board tugs and ambient animation are preserved.

### Canvas, basketball, and frame attachments

The wire grid and light cord are replaced with an editable 3D canvas: olive
cotton weave, a thick oak stretcher, visible wrapped edges, and corner tacks.
The existing prints, XXTRA Hot Cheetos, Jean, and plants remain physical meshes.
Desktop and phone stills match the new source assembly.

The ball now carries photographed Spalding TF-1000 Classic ZK lettering and
leather grain on a real sphere, with a procedural reverse and normal map. The
user's retailer blocked direct image access; a retained 29.5-inch Classic ZK
product image supplies the front. This is a matching model-family reference,
not a verified copy of that retailer's exact product photograph. Source links
and regeneration instructions are in `assets/blender/travel-board/README.md`.

Frame dimensions and top attachment offsets now live in `board-layout.json`.
Blender, the browser scene, and accessible hit areas derive positions from the
same values. The ball stud and Jean chain meet the top edge in both layouts;
the plant sits on a short oak shelf instead of a cord extending above the frame.
Mounted props sway from a pivot at their attachment. A shared data file and
small placement helpers keep positioning maintainable.

The board camera explicitly keeps its authored projection; React Three Fiber
does not replace those bounds during automatic updates. This addresses the
tiny-board result found in desktop WebKit during rapid gallery interactions.
The pause test waits for dialog entry to finish before checking frozen drawing.
The production build remains 114 kB of initial route JavaScript, and the board
GLB is 7.37 MiB with zero validator errors or warnings.

Final verification: the eight dialog-motion cases pass across desktop Chrome,
desktop WebKit, Android Chrome, and iPhone WebKit. Four focused Safari/Chrome
drag/pause checks pass after the camera fix. The final 14 desktop/iPhone checks
pass for board movement, project/photo dialogs, all-page axe scans, reduced
motion, limited-hardware rendering, and paused/hidden-tab drawing. Build, lint,
TypeScript, and formatting pass. All four native Blender files reopen with
packed assets; all four board/prop GLBs validate without errors or warnings.

Viewed final browser captures in `my-site/artifacts/review/canvas-*.png`:
desktop composition, iPhone top/bottom, and open photographs. Neither capture
session reported a browser error. Phone verification uses emulation, not a
physical iPhone. The preview remains local at `http://127.0.0.1:3107/#adventure`;
work remains uncommitted.
