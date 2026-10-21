import math

import bpy


def build_jean(parent, sphere, box, rod, material):
    skin = material("Jean warm skin", (0.67, 0.43, 0.26), 0.92)
    hair = material("Jean ash brown hair", (0.19, 0.125, 0.085), 0.96)
    undercut = material("Jean darker undercut", (0.07, 0.053, 0.038), 0.98)
    jacket = material("Survey Corps brown jacket", (0.31, 0.16, 0.065), 0.96)
    shirt = material("Jean ivory shirt", (0.76, 0.75, 0.67), 1)
    cape = material("Survey Corps green cloak", (0.035, 0.095, 0.057), 1)
    harness = material("Jean leather harness", (0.065, 0.025, 0.018), 0.95)
    steel = material("ODM brushed steel", (0.29, 0.32, 0.32), 0.8, 0.2)
    eye_white = material("Jean eye whites", (0.9, 0.87, 0.8), 1)
    eye = material("Jean grey hazel eyes", (0.13, 0.11, 0.065), 1)
    dark = material("Jean face linework", (0.025, 0.018, 0.012), 1)
    badge_blue = material("Wings of Freedom blue", (0.09, 0.19, 0.32), 1)

    def panel(name, vertices, faces, mat):
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(vertices, [], faces)
        mesh.update()
        obj = bpy.data.objects.new(name, mesh)
        bpy.context.collection.objects.link(obj)
        obj.parent = parent
        obj.data.materials.append(mat)
        return obj

    sphere("Jean face", (0, 0.16, 0.06), (0.30, 0.29, 0.23), skin, parent, 40)
    for side in [-1, 1]:
        sphere("Jean ear", (side * 0.29, 0.12, 0.045), (0.047, 0.076, 0.05), skin, parent, 16)
        sphere("Jean side undercut", (side * 0.265, 0.25, 0.005), (0.057, 0.16, 0.20), undercut, parent, 20)
        sphere("Jean narrow eye", (side * 0.112, 0.15, 0.276), (0.074, 0.034, 0.009), eye_white, parent, 20)
        sphere("Jean iris", (side * 0.112, 0.146, 0.285), (0.027, 0.027, 0.005), eye, parent, 16)
        sphere("Jean pupil", (side * 0.112, 0.146, 0.291), (0.011, 0.022, 0.003), dark, parent, 12)
        rod("Jean upper eyelid", [(side * (0.04 + t * 0.14), 0.17 + 0.018 * t, 0.289) for t in [0, 0.3, 0.7, 1]], 0.008, dark, parent)
        rod("Jean expressive brow", [(side * (0.045 + t * 0.135), 0.205 + t * 0.04, 0.275) for t in [0, 0.3, 0.7, 1]], 0.012, hair, parent)
    sphere("Jean nose", (0, 0.092, 0.289), (0.018, 0.029, 0.02), skin, parent, 12)
    rod("Jean neutral mouth", [(-0.049, 0.017, 0.264), (0, 0.022, 0.271), (0.049, 0.017, 0.264)], 0.0045, dark, parent)
    sphere("Jean hair crown", (0, 0.355, 0.015), (0.31, 0.17, 0.235), hair, parent, 32)
    for i in range(9):
        x = -0.27 + i * 0.067
        end_y = 0.21 + 0.045 * math.sin(i * 1.7)
        vertices = []
        rings = 8
        for ring in range(rings):
            t = ring / (rings - 1)
            width = 0.047 * (1 - t) ** 0.65 + 0.001
            cx = x + 0.045 * math.sin(t * 2 + i * 0.3)
            cy = 0.43 + (end_y - 0.43) * t
            cz = 0.14 + 0.14 * math.sin(t * 1.6)
            for angle in [0, math.pi / 2, math.pi, 3 * math.pi / 2]:
                vertices.append((cx + width * math.cos(angle), cy, cz + width * 0.5 * math.sin(angle)))
        faces = [(j * 4 + k, j * 4 + (k + 1) % 4, (j + 1) * 4 + (k + 1) % 4, (j + 1) * 4 + k) for j in range(rings - 1) for k in range(4)]
        tuft = panel("Jean pointed fringe", vertices, faces, hair)
        for poly in tuft.data.polygons:
            poly.use_smooth = True

    box("Jean jacket torso", (0, -0.30, -0.025), (0.32, 0.35, 0.18), jacket, parent, 0.035)
    box("Jean shirt front", (0, -0.30, 0.079), (0.145, 0.30, 0.018), shirt, parent, 0.004)
    for x in [-0.09, 0.09]:
        box("Jean trousers", (x, -0.61, -0.01), (0.145, 0.30, 0.14), shirt, parent, 0.03)
        box("Jean riding boot", (x, -0.85, 0.018), (0.15, 0.23, 0.18), harness, parent, 0.025)
        box("Jean thigh strap", (x, -0.57, 0.07), (0.15, 0.035, 0.015), harness, parent, 0.005)
        for direction in [-1, 1]:
            rod("Jean crossed leg harness", [(x - 0.06 * direction, -0.63, 0.072), (x + 0.055 * direction, -0.74, 0.072)], 0.012, harness, parent)
        box("ODM gear sheath", (x * 2.8, -0.61, -0.01), (0.13, 0.19, 0.14), steel, parent, 0.008)
        for dx in [-0.027, 0.027]:
            rod("ODM gear grooves", [(x * 2.8 + dx, -0.69, 0.066), (x * 2.8 + dx, -0.54, 0.066)], 0.005, dark, parent)
        arm = box("Jean jacket sleeve", (x * 2.1, -0.33, 0), (0.10, 0.27, 0.12), jacket, parent, 0.025)
        arm.rotation_euler.z = x * 2
        sphere("Jean hand", (x * 2.45, -0.48, 0.06), (0.052, 0.065, 0.05), skin, parent, 16)
    box("Jean waist belt", (0, -0.46, 0.088), (0.34, 0.045, 0.022), harness, parent, 0.005)
    box("Jean belt buckle", (0, -0.46, 0.104), (0.045, 0.035, 0.008), steel, parent, 0.004)
    for side in [-1, 1]:
        panel("Jean folded cloak", [(0, -0.12, 0.12), (side * 0.21, -0.10, 0.02), (side * 0.34, -0.55, -0.01), (side * 0.20, -0.43, 0.09), (side * 0.09, -0.23, 0.15)], [(0, 1, 4), (1, 2, 3, 4)], cape)
        for feather in range(4):
            y = -0.24 - feather * 0.025
            rod("Wings of Freedom feather", [(side * 0.205, y, 0.095), (side * (0.24 + feather * 0.007), y + 0.026, 0.105)], 0.006, shirt if side < 0 else badge_blue, parent)
    sphere("Cloak clasp", (0.04, -0.13, 0.15), (0.018, 0.018, 0.009), steel, parent, 12)
    rod("Jean keyring eyelet", [(0.046 * math.cos(t), 0.55 + 0.046 * math.sin(t), -0.02) for t in [i * math.tau / 32 for i in range(33)]], 0.009, steel, parent)
