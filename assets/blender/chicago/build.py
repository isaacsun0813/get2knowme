import json
import math
from pathlib import Path
import re
import struct
import xml.etree.ElementTree as ET

import bpy
from mathutils import Vector
import numpy as np

SOURCE = Path(__file__).resolve().parent
ROOT = SOURCE.parents[2]
PUBLIC = ROOT / 'my-site/public/models'
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.context.preferences.filepaths.save_version = 0

def material(name, color, metallic=0, roughness=.65):
    result = bpy.data.materials.new(name)
    result.diffuse_color = (*color[:3], 1)
    result.use_nodes = True
    shader = result.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color[:3], 1)
    shader.inputs['Metallic'].default_value = metallic
    shader.inputs['Roughness'].default_value = roughness
    return result

anchor = bpy.data.objects.new('Chicago_Pin', None)
bpy.context.collection.objects.link(anchor)
data = (PUBLIC / 'sickEarthFile3.glb').read_bytes()
length = struct.unpack_from('<I', data, 12)[0]
source = json.loads(data[20:20 + length])
binary = data[28 + length:]

def accessor(index):
    item = source['accessors'][index]
    view = source['bufferViews'][item['bufferView']]
    size = {'VEC3': 3, 'SCALAR': 1}[item['type']]
    fmt = {5126: 'f', 5125: 'I', 5123: 'H', 5121: 'B'}[item['componentType']]
    stride = view.get('byteStride', struct.calcsize('<' + fmt) * size)
    offset = view.get('byteOffset', 0) + item.get('byteOffset', 0)
    return [struct.unpack_from('<' + fmt * size, binary, offset + i * stride) for i in range(item['count'])]

node = next(n for n in source['nodes'] if n.get('name') == 'Chicago_Pin')
for primitive in source['meshes'][node['mesh']]['primitives']:
    mat = source['materials'][primitive['material']]
    if mat['name'] not in ('LM_base', 'LM_plaza'):
        continue
    points = [(x, -z, y) for x, y, z in accessor(primitive['attributes']['POSITION'])]
    indices = [i[0] for i in accessor(primitive['indices'])] if 'indices' in primitive else list(range(len(points)))
    mesh = bpy.data.meshes.new(mat['name'])
    mesh.from_pydata(points, [], [indices[i:i + 3] for i in range(0, len(indices), 3)])
    mesh.update()
    obj = bpy.data.objects.new(mat['name'], mesh)
    bpy.context.collection.objects.link(obj)
    obj.parent = anchor
    obj.data.materials.append(material(mat['name'], mat['pbrMetallicRoughness']['baseColorFactor']))

svg = ET.parse(SOURCE / 'references/northwestern-wildcats.svg').getroot()
paths = [p.attrib['d'] for p in svg.iter() if p.tag.endswith('path')]

def contour(path):
    tokens = re.findall(r'[mlhvzMLHVZ]|[-+]?(?:\d*\.\d+|\d+)', path)
    points = []
    cursor = [0., 0.]
    command = None
    i = 0
    while i < len(tokens):
        if tokens[i].isalpha():
            command = tokens[i]
            i += 1
            if command.lower() == 'z':
                break
        relative = command.islower()
        if command.lower() in ('m', 'l'):
            x, y = float(tokens[i]), float(tokens[i + 1])
            i += 2
            cursor = [cursor[0] + x, cursor[1] + y] if relative else [x, y]
            command = 'l' if relative else 'L'
        elif command.lower() == 'h':
            value = float(tokens[i]); i += 1
            cursor[0] = cursor[0] + value if relative else value
        elif command.lower() == 'v':
            value = float(tokens[i]); i += 1
            cursor[1] = cursor[1] + value if relative else value
        points.append(tuple(cursor))
    return points

purple = tuple(((v / 255 + .055) / 1.055) ** 2.4 for v in (78, 42, 132))
purple_mat = material('LM_nuPurple', purple, .08, .4)
white_mat = material('LM_nuWhite', (.91, .91, .87), 0, .48)
letter = bpy.data.objects.new('Chicago_N', None)
bpy.context.collection.objects.link(letter)
letter.parent = anchor
letter.location.z = .57

for name, path, depth, mat in [('Northwestern_outline', paths[0], .13, white_mat), ('Northwestern_purple', paths[1], .145, purple_mat)]:
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '2D'
    curve.fill_mode = 'BOTH'
    curve.resolution_u = 1
    spline = curve.splines.new('POLY')
    points = contour(path)
    spline.points.add(len(points) - 1)
    for point, (x, y) in zip(spline.points, points):
        point.co = ((x - 331.64) * 1.6 / 41.613, (y - 364.5935) * 1.6 / 41.613, 0, 1)
    spline.use_cyclic_u = True
    curve.extrude = depth
    curve.bevel_depth = .004
    curve.bevel_resolution = 1
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.parent = letter
    obj.rotation_euler.x = math.radians(70)
    obj.data.materials.append(mat)

bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, location=(0, 0, -.82))
bean = bpy.context.object
bean.name = 'Chicago_Bean'
for vertex in bean.data.vertices:
    x, y, z = vertex.co
    vertex.co = (x * (1.02 + .11 * y), y * .59 + .07 * x * x, z * .65 + .07 * x)
bean.parent = anchor
bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, location=(0, -.03, -1.49))
tunnel = bpy.context.object
tunnel.scale = (.57, 2, .70)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
bpy.context.view_layer.objects.active = bean
cut = bean.modifiers.new('Walk underneath', 'BOOLEAN')
cut.operation = 'DIFFERENCE'
cut.object = tunnel
bpy.ops.object.modifier_apply(modifier=cut.name)
bpy.data.objects.remove(tunnel, do_unlink=True)
bevel = bean.modifiers.new('Soft polished arch', 'BEVEL')
bevel.width = .025
bevel.segments = 3
bpy.ops.object.modifier_apply(modifier=bevel.name)
for polygon in bean.data.polygons:
    polygon.use_smooth = True
bean.data.materials.append(material('LM_bean', (.74, .76, .78), 1, .17))

width, height = 512, 256
y, x = np.mgrid[0:height, 0:width]
vertical = y / height
sky = np.clip((vertical - .4) / .6, 0, 1)
pixels = np.empty((height, width, 4), dtype=np.float32)
for channel, (ground, top) in enumerate(zip((.16, .17, .19), (.68, .79, .95))):
    pixels[:, :, channel] = ground + sky * (top - ground)
band = np.exp(-((vertical - .50) / .07) ** 2)
pixels[:, :, :3] += band[:, :, None] * .5
rng = np.random.default_rng(7)
for start in range(0, width, 14):
    roof = int(rng.integers(115, 139))
    pixels[100:roof, start:start + 8, :3] *= .28
pixels[:, :, 3] = 1
image = bpy.data.images.new('Chicago reflections', width=width, height=height)
image.pixels.foreach_set(pixels.ravel())
image.filepath_raw = str(PUBLIC / 'chicago-reflections.jpg')
image.file_format = 'JPEG'
image.save()
image.pack()
world = bpy.data.worlds.new('Soft sky and skyline')
world.use_nodes = True
nodes = world.node_tree.nodes
environment = nodes.new('ShaderNodeTexEnvironment')
environment.image = image
world.node_tree.links.new(environment.outputs['Color'], nodes.get('Background').inputs['Color'])
bpy.context.scene.world = world

bpy.ops.object.select_all(action='DESELECT')
anchor.select_set(True)
for obj in anchor.children_recursive:
    obj.select_set(True)
bpy.context.view_layer.objects.active = anchor
bpy.ops.export_scene.gltf(filepath=str(PUBLIC / 'chicago-landmark.glb'), use_selection=True, export_format='GLB', export_yup=True, export_animations=False)

bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, -1.505))
floor = bpy.context.object
floor.name = 'Preview floor (not exported)'
floor.data.materials.append(material('Preview paper', (.38, .36, .32)))
bpy.ops.object.camera_add(location=(2.8, -8, 1.8))
camera = bpy.context.object
camera.rotation_euler = (Vector((0, 0, -.25)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 4.3
scene = bpy.context.scene
scene.camera = camera
scene.render.engine = 'CYCLES'
scene.cycles.samples = 64
scene.cycles.use_denoising = True
scene.render.resolution_x = 900
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = str(SOURCE / 'preview.png')
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE / 'chicago.blend'))
bpy.ops.render.render(write_still=True)
print('Chicago export:', (PUBLIC / 'chicago-landmark.glb').stat().st_size, 'bytes')
