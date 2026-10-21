# Optional illustrated-prop handoff

Isaac chose a hand-drawn sketchbook for Projects. The working implementation
uses editable SVG drawings in `my-site/src/app/InkDrawings.tsx`; no Blender scene
is needed for this layout. Do not rebuild the earlier shelf unless he requests it.

If his asset bot makes richer illustrations, retain the same subjects:

| Project | Object | Treatment |
| --- | --- | --- |
| Carbon-aware | Leaf with a small compute tile | Muted green wash, graphite-green pen |
| Grey market | Sneaker | Pale blue wash, blue-grey pen |
| PrizeSole | Trophy | Pale ochre wash, brown pen |
| Verdra | Laptop with a leaf on screen | Sage wash, graphite-green pen |

Keep uneven, confident outlines and a small number of meaningful details. Match
the existing hand-drawn Earth and paraglider. Avoid glossy materials, heavy
outlines, gradients on the objects, and photorealistic shading. Lettering stays
live in HTML using the self-hosted Patrick Hand font; do not bake project copy into art.

Prefer editable SVG for this flat artwork. If building the objects in Blender,
provide the packed `.blend`, a transparent reference render, and a separate GLB
only if interactive depth is requested. Record scale, axes, camera and lights;
use named roots `Prop_Carbon`, `Prop_Grey`, `Prop_PrizeSole`, `Prop_Verdra`.

Keep the existing Earth and paraglider intact. Their original material palette,
geography and free flight are explicitly requested by Isaac. Add lighting in
the web scene rather than recoloring their materials.

## Codi animation

The current Codi is animated directly from the existing Earth export; no Blender
installation or replacement model is required. `world/codi.ts` extracts the four
material groups `LM_dog`, `LM_dogNose`, `LM_tongue`, and `LM_bandana` beneath
`Saratoga_Pin`. It converts their cloned geometry into a body frame, assigns a
small skeleton (body, head, tail, four legs), and generates spatial skin weights.
The imported GLB is unchanged.

The front yard gains .55 local units of width, with the base, grass, wall and
gate extended together while the house stays in place. The 20-second oval route
alternates eased walking arcs with standing and gentle head/tail movement.
Head weights blend through the neck into a rigid face region. The baked sideways
look is corrected at the neck, and each pause includes a clear look to both sides.
The bandana stays with the torso. Walking/resting head poses remain continuous. Skinning keeps the face and bandana attached. The
route is checked against actual deformed source vertices, including yard bounds
and paw height. Codi updates only when nearby and on screen. Ambient scene motion
requests 20fps outside flight; notes, menus, pause and reduced-motion preference
stop it.

If replacing the house export, preserve those material groups or update the
extractor and its asset-backed test together. This is a compact procedural rig;
a future authored Blender rig would improve individual paw planting and replace
the spatial weights. Close-up pose captures and an in-world motion recording
are retained in the ignored review artifacts.
