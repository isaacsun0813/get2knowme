# Travel board assets

Open `travel-board.blend` for the complete editable canvas assembly. `basketball.blend`,
`hot-cheetos.blend`, and `jean-kirstein.blend` contain the individual props with
a review camera and lighting. Sources embed their required textures and fonts. The original photographs and physical props are reused in a larger, uneven collage.

The website loads `my-site/public/models/travel-board.glb` only when Adventure
opens. Individual basketball, XXTRA Hot bag, and Jean GLB exports live beside the
Blender sources. No external texture host, decoder, Blender server, or new npm
dependency is needed at runtime.

## Editing and regeneration

Run from the repository root with Blender 4.5 LTS:

```sh
/path/to/Blender --background --factory-startup --python-exit-code 1 \
  --python assets/blender/travel-board/build.py -- --render
```

Omit `--render` to skip reference images. The script recreates the models, so
save manual Blender edits separately before regenerating. The generator retains
separate parts in the main source, then joins meshes by material within each
interactive root for the browser export. It exports tangent vectors for normal
mapping and embeds all web textures in the GLB. Photographs use 512px web
textures; packaging, canvas weave, and basketball maps are local assets. Original
source images and the main packed Blender scene retain their full resolution.
The board export stays below the 8 MiB project budget.

`my-site/src/app/journal/board-layout.json` defines the nine photos, their order,
desktop/phone placements, accessible hit areas, frame dimensions, and top mounts.
For a prop with `topMount`, its center sits that many units below the canvas's
top edge in both layouts; its stored placement supplies the X coordinate.
The plant uses the same rule. The Blender generator
and React scene share these measurements, so moving a mount only needs one edit.
Remaining photographs stay in the existing 17-photo
gallery. `BoardScene.tsx` owns rendering and bounded object motion;
`TravelBoard.tsx` owns accessible buttons, pointer input, and fallback.

## Scene conventions

- Coordinates are X right, Y up, Z toward the viewer, matching the website.
  Blender sources intentionally use this orientation; exports keep it unchanged.
- One authored unit represents 10 cm. The composition follows the reference
  proportions rather than a product measurement drawing.
- The board origin is its center. `CanvasBoard` contains separate 10.3 × 7.25
  desktop and 5.8 × 17.3 phone forms. Each has a thick oak stretcher, modeled
  fabric face, woven color texture, wrapped edge, and corner tacks.
- The nine named `Photo_*` roots pivot at
  their upper clip. Each has a curved paper mesh, a photograph surface, a modeled
  caption, and a wooden clip with a metal spring.
- `Basketball` contains a true sphere with pebbled leather and recessed channel
  shading. Its front texture carries the TF-1000 ZK markings from a 29.5-inch
  product photograph; the generated back and normal maps preserve its volume.
  `SnackBag` contains
  front/back foil surfaces, crimped seals, authentic XXTRA Hot front artwork,
  a matte black reverse and a clip.
- `Charm` is an original modeled Jean Kirstein keychain with Survey Corps outfit,
  harness, boots, gear, hair and facial details. `jean.py` builds its geometry.
- `Succulent` and `Vine` remain separate object roots.
  `Wall` receives shadows; its browser material becomes transparent shadow-only
  so the board sits naturally against the page background.
- The Blender review camera is frontal at `(0, 0, 15)`, orthographic
  width 11.5 on desktop and height 18.6 on phones. Broad window and room-fill lights provide the reference lighting.
  Browser lighting uses ambient and direct lights with soft variance
  shadows and matte materials, without an environment reflection map; it approximates the Cycles render rather than baking that render in.
- There are no animation clips. Photos sway about their clips; mounted props
  get a Three.js pivot at the frame edge so the top stays attached during sway.
  hover/keyboard focus lifts and slightly enlarges a print, and a small tug eases
  back to its home position. Ambient updates are capped at 24 Hz (12 on limited
  hardware), with cached shadows refreshed at 12/6 Hz. Animation pauses outside
  the viewport, in hidden tabs, and behind the photo dialog. Reduced motion
  disables sway, lift, scaling and tugs.
- Photograph surfaces use emission-only shading, preserving the original photo
  colors independently of the room lights. Paper, canvas, clips and props retain
  their physical shading. Main and standalone Blender/GLB sources are rebuilt.

The two Blender renders in `my-site/public/photos/board/` are the desktop and
phone fallbacks. Gallery controls work while loading and after missing assets,
missing WebGL, or board context loss.

## Sources

- Travel images: the existing `my-site/public/photos/adventure/` originals.
- Packaging: [PepsiCo SmartLabel XXTRA Flamin' Hot product](https://smartlabel.pepsico.info/028400091534-0015-en-US/index.html),
  whose photographed front is retained as `textures/cheetos-xxtra-front.jpg`.
  Cheetos artwork and trademarks remain their respective owners' property.
- Basketball: [Spalding TF-1000 ZK 29.5-inch product listing](https://www.americateamsports.com/index.php?controller=product&id_product=11)
  supplied by Isaac. That retailer's page blocked direct image access, so the
  front texture uses a [29.5-inch Classic ZK product photograph](https://i5.walmartimages.com/seo/Spalding-TF-1000-Classic-ZK-Basketball_807b12aa-a3c7-4a69-b965-07a079ac458d_4.4d3c33222935f837aed82fda0ca0be67.jpeg)
  of the same model family. The reference JPEG stays in `references/`. Product
  photography and Spalding marks remain with their respective rights holders.
- Jean: original geometry informed by [Good Smile's official Jean figure](https://www.goodsmile.com/en/product/11350/Nendoroid+Jean+Kirstein).
  No downloaded character mesh is used. Attack on Titan rights remain with their owners.
- Captions: [Patrick Hand from Google Fonts](https://github.com/google/fonts/tree/main/ofl/patrickhand),
  matching the site's upright handwriting. Its OFL license is retained in
  `my-site/public/fonts/PatrickHand-OFL.txt`.
- Other meshes and leather maps: generated by the included Blender script.

Validate exports from `my-site/`:

```sh
npm run validate:models -- public/models/travel-board.glb \
  ../assets/blender/travel-board/basketball.glb \
  ../assets/blender/travel-board/hot-cheetos.glb \
  ../assets/blender/travel-board/jean-kirstein.glb
```

Verify that the Blender files reopen with their camera, packed textures and
editable board captions, from the repository root:

```sh
/path/to/Blender --background --python-exit-code 1 \
  --python assets/blender/travel-board/verify.py
```
