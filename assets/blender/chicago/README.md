# Chicago landmark

The N uses the Northwestern Wildcats vector outline, including its cutouts and
white border. The purple is Northwestern's official #4E2A84, converted from sRGB
to linear for Blender/glTF. The Bean has an asymmetric rounded shell with a
boolean-cut walk-through arch and a polished stainless material.

References:

- [Northwestern Athletics logo source](https://commons.wikimedia.org/wiki/File:Northwestern_Wildcats_logo.svg), attributed to Northwestern Athletics. The retained SVG is in `references/`.
- [Northwestern official colors](https://www.northwestern.edu/brand/visual-identity/color-palettes/).
- [Cloud Gate photographs](https://www.choosechicago.com/articles/tours-and-attractions/the-bean-chicago/).

The athletic mark was selected for the globe; the university's serif academic N
is a separate identity. Academic reference images are retained for comparison.

## Rebuild

Run Blender 4.5 with:

```sh
blender --background --factory-startup --python-exit-code 1 --python assets/blender/chicago/build.py
```

The generator writes editable `chicago.blend`, a Blender reference `preview.png`,
`my-site/public/models/chicago-landmark.glb`, and a 512×256 JPEG reflection map.
The map is generated from a deterministic sky/skyline pattern, packed in the
Blender world, and used only by the Bean material on the website. There is no
per-frame reflection capture. No external textures are required by the GLB itself.

`Chicago_Pin` is an identity root in local landmark coordinates. Runtime copies
the original Earth anchor's position, quaternion and scale before replacing it.
The original Earth file remains unchanged. Base and plaza meshes are reused from
that file. GLB Y is up, the logo faces +Z and leans back 20 degrees. Blender Z is
up. The original anchor scale is 0.05, inside the world's scale of 25.

`Chicago_N` parents the purple face and white outline. `Chicago_Bean` uses
`LM_bean`; its chrome reflection is applied only to this material. The GLB has no
animation clips. Runtime replaces the original `Chicago_N_Spin` with a bounded
±0.14-radian yaw and 0.035-unit bob, respecting existing pause/reduced-motion rules.
Other Earth animations remain unchanged.

The native orthographic camera, preview floor and world lighting remain editable
in the blend file and are excluded from the GLB. The website uses its existing
world lights and a lower Chicago inspection camera to show the arch.

Validation: the exported GLB has zero validator errors and warnings. Desktop
Chrome and iPhone WebKit screenshots are under the ignored
`my-site/artifacts/review/chicago-{desktop,iphone}.png` paths.
