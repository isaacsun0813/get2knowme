import argparse
import json
import math
import subprocess
import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector


HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
PUBLIC = REPO / "my-site/public"
sys.path.insert(0, str(HERE))
from jean import build_jean

LAYOUT = json.loads((PUBLIC.parent / "src/app/journal/board-layout.json").read_text())
parser = argparse.ArgumentParser()
parser.add_argument("--render", action="store_true")
args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
for block in bpy.data.materials:
    bpy.data.materials.remove(block)
bpy.context.scene.unit_settings.system = "METRIC"
bpy.context.scene.unit_settings.scale_length = 0.1
bpy.context.preferences.filepaths.save_version = 0


def material(name, color, roughness=0.5, metal=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1)
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Metallic"].default_value = metal
    shader.inputs["Specular IOR Level"].default_value = 0.12
    return mat


def textured(name, path, roughness=0.5):
    mat = material(name, (1, 1, 1), roughness)
    image = bpy.data.images.load(str(path), check_existing=True)
    tex = mat.node_tree.nodes.new("ShaderNodeTexImage")
    tex.image = image
    mat.node_tree.links.new(tex.outputs["Color"], mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"])
    return mat


def assign(obj, name, mat, parent=None):
    obj.name = name
    if mat:
        obj.data.materials.append(mat)
    if parent:
        obj.parent = parent
    return obj


def root(name, location=(0, 0, 0), angle=0):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler.z = math.radians(angle)
    return obj


def box(name, location, scale, mat, parent=None, bevel=0.015):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = assign(bpy.context.object, name, mat, parent)
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = obj.modifiers.new("Rounded edges", "BEVEL")
        mod.width = bevel
        mod.segments = 3
        obj.modifiers.new("Weighted corner normals", "WEIGHTED_NORMAL")
    return obj


def sphere(name, location, scale, mat, parent=None, segments=32):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=max(6, segments // 2), radius=1, location=location)
    obj = assign(bpy.context.object, name, mat, parent)
    obj.scale = scale
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj


def rod(name, points, radius, mat, parent=None):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = radius
    curve.bevel_resolution = 1
    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for point, xyz in zip(spline.points, points):
        point.co = (*xyz, 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.parent = parent
    obj.data.materials.append(mat)
    return obj


def surface(name, nx, ny, position, uv, mat, parent=None):
    vertices = [position(i / nx, j / ny) for j in range(ny + 1) for i in range(nx + 1)]
    faces = []
    for j in range(ny):
        for i in range(nx):
            a = j * (nx + 1) + i
            faces.append((a, a + 1, a + nx + 2, a + nx + 1))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.uv_layers.new(name="UVMap")
    for poly in mesh.polygons:
        poly.use_smooth = True
        for loop in poly.loop_indices:
            vertex = mesh.loops[loop].vertex_index
            mesh.uv_layers.active.data[loop].uv = uv(vertex % (nx + 1) / nx, vertex // (nx + 1) / ny)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return assign(obj, name, mat, parent)


brass = material("Warm brushed brass", (0.34, 0.29, 0.19), 0.85, 0.2)
frame_mat = material("Honey oak canvas stretcher", (0.37, 0.24, 0.14), 0.84)
frame_edge = material("Worn oak edge", (0.49, 0.34, 0.20), 0.9)
wood = material("Unfinished maple clips", (0.64, 0.44, 0.22), 0.66)
paper = material("Warm cotton photo paper", (0.98, 0.97, 0.94), 0.79)
ink = material("Graphite handwriting", (0.085, 0.08, 0.065), 0.85)
cord = material("Woven linen cord", (0.09, 0.08, 0.065), 1)
wall_mat = material("Chalk plaster", (0.76, 0.72, 0.63), 0.96)
green = material("Eucalyptus leaf", (0.24, 0.36, 0.22), 0.72)
green_light = material("Succulent pale wax", (0.34, 0.47, 0.29), 0.48)
clay = material("Unglazed terracotta", (0.53, 0.28, 0.16), 0.9)

wall = box("Wall", (0, 0, -0.32), (30, 22, 0.18), wall_mat, bevel=0)
canvas_board = root("CanvasBoard")
fabric_size = 512
fabric_u, fabric_v = np.meshgrid(np.arange(fabric_size), np.arange(fabric_size))
fabric_noise = np.random.default_rng(8).normal(0, 0.009, (fabric_size, fabric_size))
fabric_weave = 0.018 * np.sin(fabric_u * math.tau / 5) + 0.018 * np.sin(fabric_v * math.tau / 5)
fabric_color = np.ones((fabric_size, fabric_size, 4), dtype=np.float32)
for channel, value in enumerate((0.29, 0.35, 0.30)):
    fabric_color[:, :, channel] = np.clip(value + fabric_weave + fabric_noise, 0, 1)
fabric_image = bpy.data.images.new("Olive cotton canvas weave", width=fabric_size, height=fabric_size)
fabric_image.pixels.foreach_set(fabric_color.ravel())
fabric_image.filepath_raw = str(HERE / "textures/canvas-weave.jpg")
fabric_image.file_format = "JPEG"
fabric_image.save()
fabric = textured("Olive cotton canvas fabric", HERE / "textures/canvas-weave.jpg", 1)


def make_canvas(width, height, suffix):
    frame = root("CanvasBoard" + suffix)
    frame.parent = canvas_board
    left, top = width / 2, height / 2
    box("Oak stretcher body", (0, 0, -0.18), (width, height, 0.31), frame_mat, frame, 0.045)
    for x in [-left + 0.085, left - 0.085]:
        box("Oak side grain", (x, 0, -0.015), (0.11, height - 0.08, 0.05), frame_edge, frame, 0.012)
    for y in [-top + 0.085, top - 0.085]:
        box("Oak top grain", (0, y, -0.015), (width - 0.08, 0.11, 0.05), frame_edge, frame, 0.012)
    sheet = surface(
        "Tensioned woven canvas", 32, 32,
        lambda u, v: ((u - 0.5) * (width - 0.13), (v - 0.5) * (height - 0.13),
                      0.035 + 0.006 * math.sin(u * math.tau) * math.sin(v * math.tau)),
        lambda u, v: (u * width / 2, v * height / 2), fabric, frame,
    )
    sheet.modifiers.new("Wrapped fabric depth", "SOLIDIFY").thickness = 0.035
    for x in [-left + 0.19, left - 0.19]:
        for y in [-top + 0.19, top - 0.19]:
            sphere("Canvas corner tack", (x, y, 0.07), (0.035, 0.035, 0.013), brass, frame, 16)


make_canvas(LAYOUT["frames"]["desktop"]["width"], LAYOUT["frames"]["desktop"]["height"], "Landscape")
make_canvas(LAYOUT["frames"]["phone"]["width"], LAYOUT["frames"]["phone"]["height"], "Portrait")


def canvas_mode(phone):
    for suffix in ["Landscape", "Portrait"]:
        node = bpy.data.objects["CanvasBoard" + suffix]
        hidden = phone is not None and (suffix == "Portrait") != phone
        for part in [node, *node.children_recursive]:
            part.hide_render = hidden
            part.hide_set(hidden)


canvas_mode(False)


def peg(parent):
    for z in [-0.015, 0.075]:
        obj = box("Maple clothespin jaw", (0, 0.015, z), (0.075, 0.34, 0.065), wood, parent, 0.009)
        obj.rotation_euler.x = 0.08 if z > 0 else -0.08
    rod("Steel clothespin spring", [(0.047 * math.cos(t), 0.016 + 0.047 * math.sin(t), 0.045 + 0.005 * t) for t in np.linspace(0, math.pi * 6, 80)], 0.008, brass, parent)
    for x in [-0.031, 0.031]:
        rod("Woodgrain", [(x, -0.14, 0.111), (x + 0.004, 0.16, 0.111)], 0.0011, cord, parent)


font = bpy.data.fonts.load(str(HERE / "PatrickHand-Regular.ttf"))
photo_items = [p for p in LAYOUT["objects"] if "photo" in p]
photos = [(p["number"], p["caption"], *p["desktop"], p["angle"]) for p in photo_items]
for number, caption, x, y, angle in photos:
    photo = root(f"Photo_{number}", (x, y, 0.22 + (number % 3) * 0.065), angle)
    item = next(p for p in photo_items if p["number"] == number)
    photo.scale = (item["width"] / 1.59, item["height"] / 2.03, 1)
    def curl(u, v):
        return 0.025 * (2 * u - 1) ** 2 + 0.055 * (1 - v) ** 3
    sheet = surface("Curled cotton print", 16, 20, lambda u, v: ((u - 0.5) * 1.59, (v - 1) * 2.03 + 0.02, curl(u, v)), lambda u, v: (u, v), paper, photo)
    solid = sheet.modifiers.new("Paper thickness", "SOLIDIFY")
    solid.thickness = 0.012
    image = bpy.data.images.load(str(PUBLIC / f"photos/adventure/adventure{number}.jpg"), check_existing=True)
    ratio = image.size[0] / image.size[1]
    mat = textured(f"Original photograph {number}", Path(image.filepath), 1)
    emission = mat.node_tree.nodes.new("ShaderNodeEmission")
    photograph_texture = next(node for node in mat.node_tree.nodes if node.type == "TEX_IMAGE")
    mat.node_tree.links.new(photograph_texture.outputs["Color"], emission.inputs["Color"])
    mat.node_tree.links.new(emission.outputs["Emission"], mat.node_tree.nodes.get("Material Output").inputs["Surface"])
    def image_uv(u, v, ratio=ratio):
        return ((u - 0.5) / max(1, ratio) + 0.5, (v - 0.5) * min(1, ratio) + 0.5)
    surface("Photographic emulsion", 16, 16, lambda u, v: ((u - 0.5) * 1.35, -1.56 + v * 1.36, 0.008 + curl((u * 1.35 / 1.59) + 0.0755, (-1.56 + v * 1.36 - 0.02) / 2.03 + 1)), image_uv, mat, photo)
    text = bpy.data.curves.new("Handwritten caption", "FONT")
    text.body = caption
    text.font = font
    text.align_x = "CENTER"
    text.size = 0.29
    text.resolution_u = 3
    text.extrude = 0
    obj = bpy.data.objects.new("Caption " + caption, text)
    bpy.context.collection.objects.link(obj)
    obj.parent = photo
    obj.location = (0, -1.86, 0.09)
    text.materials.append(ink)
    peg(photo)

ball = root("Basketball", (-2.9, 2, 0.70), -6)
ball.scale = (0.85, 0.85, 0.85)
sphere("Basketball mounting stud", (0, 0.79, -0.03), (0.045, 0.045, 0.022), brass, ball, 16)
size = 1024
u, v = np.meshgrid(np.linspace(0, 1, size), np.linspace(0, 1, size))
theta, phi = u * math.tau, v * math.pi
sx, sy, sz = np.sin(phi) * np.cos(theta), -np.cos(phi), -np.sin(phi) * np.sin(theta)
seam = np.minimum.reduce([np.abs(sy), np.abs(0.82 * sx + 0.57 * sz), np.abs(0.82 * sx - 0.57 * sz)])
seam_weight = np.clip(seam / 0.022, 0, 1)
grid_x, grid_y = u * 230, v * 115
cell_x, cell_y = np.floor(grid_x).astype(int), np.floor(grid_y).astype(int)
random = np.random.default_rng(42)
jitter = random.uniform(-0.28, 0.28, (117, 232, 2))
distance = np.full_like(u, np.inf)
for oy in [-1, 0, 1]:
    for ox in [-1, 0, 1]:
        cx, cy = cell_x + ox, cell_y + oy
        offset = jitter[cy % 117, cx % 232]
        distance = np.minimum(distance, (grid_x - cx - 0.5 - offset[:, :, 0]) ** 2 + (grid_y - cy - 0.5 - offset[:, :, 1]) ** 2)
pores = np.exp(-((np.sqrt(distance) / 0.34) ** 4))
grain = 0.81 + 0.19 * pores
pixels = np.ones((size, size, 4), dtype=np.float32)
for channel, value in enumerate([0.43, 0.16, 0.085]):
    pixels[:, :, channel] = (0.02 * (1 - seam_weight) + value * seam_weight) * grain
reference = bpy.data.images.load(str(HERE / "references/tf1000-classic-295-reference.jpg"), check_existing=True)
reference.scale(1024, 1041)
reference_pixels = np.asarray(reference.pixels[:], dtype=np.float32).reshape(reference.size[1], reference.size[0], 4)
product = np.max(reference_pixels[:, :, :3], axis=2) < 0.82
ys, xs = np.where(product)
center_x = (xs.min() + xs.max()) / 2
center_y = (ys.min() + ys.max()) / 2
radius = min((xs.max() - xs.min()), (ys.max() - ys.min())) / 2
sample_x = np.clip(np.rint(center_x + sx * radius).astype(int), 0, reference.size[0] - 1)
sample_y = np.clip(np.rint(center_y + sy * radius).astype(int), 0, reference.size[1] - 1)
front = np.clip((sz - 0.04) / 0.12, 0, 1)[..., None]
pixels[:, :, :3] = pixels[:, :, :3] * (1 - front) + reference_pixels[sample_y, sample_x, :3] * front
image = bpy.data.images.new("Basketball leather color", width=size, height=size)
image.pixels.foreach_set(pixels.ravel())
image.filepath_raw = str(HERE / "textures/basketball-color.jpg")
image.file_format = "JPEG"
image.save()
ball_mat = textured("Spalding TF-1000 ZK pebbled leather", HERE / "textures/basketball-color.jpg", 0.76)
height = pores * 0.8 - 2.2 * np.exp(-(seam / 0.022) ** 2)
dy, dx = np.gradient(height)
normal = np.stack([-dx * 1.8, -dy * 1.8, np.ones_like(dx)], axis=-1)
normal /= np.linalg.norm(normal, axis=-1, keepdims=True)
pixels[:, :, :3] = normal * 0.5 + 0.5
image = bpy.data.images.new("Leather pore normal", width=size, height=size)
image.colorspace_settings.name = "Non-Color"
image.pixels.foreach_set(pixels.ravel())
image.filepath_raw = str(HERE / "textures/basketball-normal.png")
image.file_format = "PNG"
image.save()
tex = ball_mat.node_tree.nodes.new("ShaderNodeTexImage")
tex.image = image
normal_node = ball_mat.node_tree.nodes.new("ShaderNodeNormalMap")
normal_node.inputs["Strength"].default_value = 0.62
ball_mat.node_tree.links.new(tex.outputs["Color"], normal_node.inputs["Color"])
ball_mat.node_tree.links.new(normal_node.outputs["Normal"], ball_mat.node_tree.nodes["Principled BSDF"].inputs["Normal"])
def ball_position(u, v):
    theta, phi = u * math.tau, v * math.pi
    x, y, z = math.sin(phi) * math.cos(theta), -math.cos(phi), -math.sin(phi) * math.sin(theta)
    return (x * 0.80, y * 0.80, z * 0.80)
surface("Leather ball", 128, 64, ball_position, lambda u, v: (u, v), ball_mat, ball)

bag = root("SnackBag", (4.45, -2.35, 0.42), -8)
bag_mat = textured("Cheetos XXTRA Hot manufacturer packaging", HERE / "textures/cheetos-xxtra-front.jpg", 0.9)
next(node.image for node in bag_mat.node_tree.nodes if node.type == "TEX_IMAGE").save()
bag_shader = bag_mat.node_tree.nodes["Principled BSDF"]
bag_shader.inputs["Metallic"].default_value = 0
bag_shader.inputs["Coat Weight"].default_value = 0
bag_shader.inputs["Coat Roughness"].default_value = 0.25
def bag_position(u, v, front=True):
    x, y = (u - 0.5) * 1.02, (v - 0.5) * 1.50
    swell = max(0, math.sin(math.pi * u)) ** 0.42 * max(0, math.sin(math.pi * v)) ** 0.5
    edge = abs(2 * u - 1) ** 4 + abs(2 * v - 1) ** 8
    wrinkle = (math.sin(u * 57 + v * 13) * math.sin(v * 31 - u * 9) * 0.018 + math.sin(u * 131 + v * 41) * 0.006) * (0.2 + edge)
    z = (0.18 * swell + wrinkle * swell ** 0.3) * (1 if front else -1)
    y += math.sin(u * 51) * 0.009 * abs(2 * v - 1) ** 16
    return (x * (0.95 + 0.05 * math.sin(math.pi * v)), y, z)
def front_uv(u, v):
    edge = 0.02 + 0.09 * math.sin(math.pi * v)
    return (edge + u * (1 - edge * 2), 0.025 + v * 0.95)
def back_uv(u, v):
    u = 1 - u
    x = 780 + u * 270 if u < 0.5 else 254 + (u - 0.5) * 270
    return (x / 1295, 1 - (641 - v * 513) / 1031)
back_mat = material("XXTRA Hot black reverse foil", (0.018, 0.014, 0.013), 0.92)
for front in [True, False]:
    obj = surface("Crinkled foil front" if front else "Printed foil back", 48, 48, lambda u, v, front=front: bag_position(u, v, front), front_uv if front else back_uv, bag_mat if front else back_mat, bag)
    if not front:
        for poly in obj.data.polygons:
            poly.flip()
seal = material("Heat sealed orange laminate", (0.48, 0.025, 0.012), 0.9, 0)
for y in [-0.72, 0.72]:
    box("Crimped heat seal", (0, y, 0), (1.02, 0.065, 0.019), seal, bag, 0.006)
    for x in np.linspace(-0.49, 0.49, 55):
        rod("Seal rib", [(x, y - 0.03, 0.012), (x, y + 0.03, 0.012)], 0.002, seal, bag)
peg_root = root("Bag clip")
peg_root.parent = bag
peg_root.location = (0, 0.77, 0.04)
peg(peg_root)

charm = root("Charm", (-4.35, 2.1, 0.38))
for y in np.linspace(0.61, 0.89, 7):
    sphere("Jean chain link", (0, y, -0.08), (0.018, 0.018, 0.018), brass, charm, 12)
build_jean(charm, sphere, box, rod, material)

plant = root("Succulent", (4.54, 1.96, 0.3))
box("Plant's small oak shelf", (0, -0.41, -0.025), (0.46, 0.065, 0.19), frame_mat, plant, 0.014)
bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=0.17, radius2=0.24, depth=0.32, location=(0, -0.14, 0.14), rotation=(-math.pi / 2, 0, 0))
assign(bpy.context.object, "Terracotta pot", clay, plant)
for i in range(11):
    angle = i * 2.4
    x, y = math.sin(angle) * 0.15, 0.08 + (i % 3) * 0.07
    obj = sphere("Fleshy succulent leaf", (x, y, 0.15 + math.cos(angle) * 0.11), (0.085, 0.32, 0.08), green_light, plant, 20)
    obj.rotation_euler.z = -x * 3

vine = root("Vine", (-4.95, 0.85, 0.1))
rod("Trailing stem", [(0.12 * math.sin(t * 2), -t, 0.07 + 0.04 * math.sin(t)) for t in np.linspace(0, 1.65, 50)], 0.014, green, vine)
for i in range(9):
    t = i * 0.18
    side = 1 if i % 2 else -1
    obj = sphere("Eucalyptus leaf", (side * 0.12, -t, 0.12), (0.17, 0.095, 0.024), green, vine, 20)
    obj.rotation_euler.z = side * 0.6

def placed(item, mode):
    x, y = item[mode]
    if "topMount" in item:
        y = LAYOUT["frames"][mode]["height"] / 2 - item["topMount"]
    return x, y


def plant_position(mode):
    return (LAYOUT["plant"][mode + "X"], LAYOUT["frames"][mode]["height"] / 2 - LAYOUT["plant"]["topMount"], 0.3)


for item in LAYOUT["objects"]:
    bpy.data.objects[item["name"]].location.x, bpy.data.objects[item["name"]].location.y = placed(item, "desktop")
plant.location = plant_position("desktop")
vine.location = (-5.1, .5, .1)

scene = bpy.context.scene
scene.world.color = (0.45, 0.45, 0.45)
scene.render.engine = "CYCLES"
scene.cycles.samples = 24
scene.cycles.use_denoising = True
scene.view_settings.view_transform = "Standard"
scene.render.resolution_x = 1200
scene.render.resolution_y = round(1200 * LAYOUT["views"]["desktop"]["height"] / LAYOUT["views"]["desktop"]["width"])
scene.render.resolution_percentage = 100
camera_data = bpy.data.cameras.new("Board review camera")
camera = bpy.data.objects.new("Board review camera", camera_data)
bpy.context.collection.objects.link(camera)
camera.location = (0, 0, 15)
camera.rotation_euler = (0, 0, 0)
camera_data.type = "ORTHO"
camera_data.ortho_scale = LAYOUT["views"]["desktop"]["width"]
scene.camera = camera
def area(name, location, power, size, color):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = power
    data.shape = "DISK"
    data.size = size
    data.color = color
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (Vector((0, 0, 0)) - obj.location).to_track_quat("-Z", "Y").to_euler()
area("Large window upper left", (-4, 6, 8), 700, 5, (1, 0.92, 0.8))
area("Soft room fill", (5, -1, 6), 250, 7, (0.8, 0.87, 1))

bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(HERE / "travel-board.blend"))
report = {"objects": len(bpy.data.objects), "polygons": sum(len(o.data.polygons) for o in bpy.data.objects if o.type == "MESH"), "photos": [p[0] for p in photos]}
assert all(bpy.data.objects.get(name) for name in ["CanvasBoard", "Basketball", "SnackBag", "Photo_4", "Photo_7"])
(HERE / "asset-report.json").write_text(json.dumps(report, indent=2) + "\n")
if args.render:
    scene.render.filepath = str(PUBLIC / "photos/board/travel-board.jpg")
    scene.render.image_settings.file_format = "JPEG"
    scene.render.image_settings.quality = 90
    bpy.ops.render.render(write_still=True)
    homes = {obj.name: (obj.location.copy(), obj.scale.copy()) for obj in bpy.data.objects if obj.parent is None}
    for item in LAYOUT["objects"]:
        bpy.data.objects[item["name"]].location.x, bpy.data.objects[item["name"]].location.y = placed(item, "phone")
    canvas_mode(True)
    plant.location = plant_position("phone")
    vine.location = (-2.88, 3.5, 0.1)
    camera_data.ortho_scale = LAYOUT["views"]["phone"]["height"]
    scene.render.resolution_x = 680
    scene.render.resolution_y = round(680 * LAYOUT["views"]["phone"]["height"] / LAYOUT["views"]["phone"]["width"])
    scene.render.filepath = str(PUBLIC / "photos/board/travel-board-phone.jpg")
    bpy.ops.render.render(write_still=True)
    for name, (location, scale) in homes.items():
        bpy.data.objects[name].location = location
        bpy.data.objects[name].scale = scale
canvas_mode(None)
for obj in list(bpy.data.objects):
    if obj.type in {"CURVE", "FONT"}:
        caption = obj.type == "FONT"
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.convert(target="MESH")
        if caption:
            for vertex in obj.data.vertices:
                u = vertex.co.x / 1.59 + 0.5
                v = (vertex.co.y + obj.location.y - 0.02) / 2.03 + 1
                vertex.co.z += 0.025 * (2 * u - 1) ** 2 + 0.055 * (1 - v) ** 3 + 0.007 - obj.location.z
            obj.data.update()
for parent in [o for o in bpy.data.objects if o.type == "EMPTY" and (o.parent is None or o.name in {"CanvasBoardLandscape", "CanvasBoardPortrait"})]:
    if parent.name == "CanvasBoard":
        continue
    groups = {}
    for child in parent.children_recursive:
        if child.type == "MESH":
            bpy.context.view_layer.objects.active = child
            for modifier in list(child.modifiers):
                bpy.ops.object.modifier_apply(modifier=modifier.name)
            groups.setdefault(child.data.materials[0].name, []).append(child)
    for name, objects in groups.items():
        bpy.ops.object.select_all(action="DESELECT")
        for obj in objects:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = objects[0]
        if len(objects) > 1:
            bpy.ops.object.join()
        objects[0].name = parent.name + "_" + name
for mat in bpy.data.materials:
    for node in mat.node_tree.nodes:
        if node.type == "TEX_IMAGE" and node.image and ("adventure" in node.image.filepath or "cheetos-xxtra-front" in node.image.filepath):
            image = node.image.copy()
            limit = 512 if "adventure" in node.image.filepath else 1024
            if max(image.size) > limit:
                factor = limit / max(image.size)
                image.scale(round(image.size[0] * factor), round(image.size[1] * factor))
            image.filepath_raw = str(HERE / "textures" / (Path(node.image.filepath).stem + "-web.jpg"))
            image.file_format = "JPEG"
            image.save()
            node.image = bpy.data.images.load(image.filepath_raw, check_existing=False)
            node.image.pack()
export_settings = dict(export_format="GLB", export_yup=False, export_cameras=False, export_lights=False, export_animations=False, export_extras=False, export_apply=True, export_tangents=True, use_active_scene=True)
bpy.ops.export_scene.gltf(filepath=str(PUBLIC / "models/travel-board.glb"), **export_settings)
for name, filename in [("Basketball", "basketball.glb"), ("SnackBag", "hot-cheetos.glb"), ("Charm", "jean-kirstein.glb")]:
    bpy.ops.object.select_all(action="DESELECT")
    obj = bpy.data.objects[name]
    obj.location = (0, 0, 0)
    obj.rotation_euler = (0, 0, 0)
    for part in [obj, *obj.children_recursive]:
        part.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(HERE / filename), use_selection=True, **export_settings)
    prop_scene = bpy.data.scenes.new(name + " asset")
    prop_scene.unit_settings.system = "METRIC"
    prop_scene.unit_settings.scale_length = 0.1
    prop_scene.world = scene.world
    for part in [obj, *obj.children_recursive]:
        prop_scene.collection.objects.link(part)
    prop_camera = camera.copy()
    prop_camera.data = camera.data.copy()
    prop_scene.collection.objects.link(prop_camera)
    prop_camera.location = (0.7, 0.3, 4)
    prop_camera.rotation_euler = (-math.atan2(0.3, 4), math.atan2(0.7, 4), 0)
    prop_camera.data.type = "ORTHO"
    prop_camera.data.ortho_scale = 2.3
    prop_scene.camera = prop_camera
    for light in [o for o in scene.objects if o.type == "LIGHT"]:
        prop_scene.collection.objects.link(light)
    prop_scene.render.engine = "CYCLES"
    prop_scene.cycles.samples = 24
    prop_scene.cycles.use_denoising = True
    prop_scene.render.resolution_x = 900
    prop_scene.render.resolution_y = 900
    prop_scene.render.resolution_percentage = 100
    bpy.data.libraries.write(str(HERE / filename.replace(".glb", ".blend")), {prop_scene}, fake_user=True)
    subprocess.run([
        bpy.app.binary_path, "--background", str(HERE / filename.replace(".glb", ".blend")),
        "--python-exit-code", "1", "--python-expr",
        "import bpy; bpy.context.preferences.filepaths.save_version = 0; bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)",
    ], check=True, stdout=subprocess.DEVNULL)
    if args.render:
        prop_scene.render.filepath = str(HERE / filename.replace(".glb", "-preview.jpg"))
        prop_scene.render.image_settings.file_format = "JPEG"
        bpy.ops.render.render(write_still=True, scene=prop_scene.name)
print(json.dumps(report))
