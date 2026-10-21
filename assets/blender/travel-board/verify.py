from pathlib import Path
import json

import bpy


here = Path(__file__).resolve().parent
layout = json.loads((here.parents[2] / "my-site/src/app/journal/board-layout.json").read_text())
photo_count = sum("photo" in item for item in layout["objects"])
for filename, expected in [
    ("travel-board.blend", "CanvasBoard"),
    ("basketball.blend", "Basketball"),
    ("hot-cheetos.blend", "SnackBag"),
    ("jean-kirstein.blend", "Charm"),
]:
    bpy.ops.wm.open_mainfile(filepath=str(here / filename))
    scene = bpy.context.scene
    assert expected in scene.objects, f"{filename}: missing {expected}"
    assert scene.camera is not None, f"{filename}: missing review camera"
    for image in bpy.data.images:
        if image.source == "FILE":
            assert image.packed_file, f"{filename}: external texture {image.name}"
    if filename == "travel-board.blend":
        assert len([obj for obj in scene.objects if obj.type == "FONT"]) == photo_count
        for font in bpy.data.fonts:
            if font.users and font.filepath != "<builtin>":
                assert font.packed_file, f"{filename}: external font {font.name}"
    else:
        assert "CanvasBoard" not in scene.objects
        assert not ({"Basketball", "SnackBag", "Charm"} - {expected}) & set(scene.objects.keys())
    print(f"{filename}: {len(scene.objects)} objects, camera and packed textures verified")
