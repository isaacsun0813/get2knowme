import { expect, test } from "@playwright/test";
import * as THREE from "three";
import { createAmbientMotion } from "../../src/app/world/ambient-motion";

test("wind leaves the windsock attachment and water bed anchored without changing source geometry", () => {
  const scene = new THREE.Group();
  const surface = (name: string, values: number[]) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(values, 3),
    );
    const material = new THREE.MeshStandardMaterial();
    material.name = name;
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return mesh;
  };
  const sock = surface(
    "LM_windsock",
    [2.575, 0.4, 1.9, 3.025, 0.4, 1.9, 3.025, 0.5, 1.9],
  );
  const water = surface(
    "LM_water",
    [0, -1.319255, 0, 0.5, -1.289255, 0, -0.5, -1.289255, 0.2],
  );
  const source = sock.geometry;
  const motion = createAmbientMotion(scene);
  motion.update(1.3);
  expect(sock.geometry).not.toBe(source);
  expect(sock.geometry.attributes.position.getZ(0)).toBeCloseTo(1.9, 6);
  expect(sock.geometry.attributes.position.getZ(1)).not.toBeCloseTo(1.9, 4);
  expect(source.attributes.position.getZ(1)).toBeCloseTo(1.9, 6);
  expect(water.geometry.attributes.position.getY(0)).toBeCloseTo(-1.319255, 6);
  expect(
    Math.abs(water.geometry.attributes.position.getY(1) + 1.289255),
  ).toBeLessThan(0.007);
  motion.dispose();
});

test("Northwestern stays readable and returns to rest without accumulating drift", () => {
  const scene = new THREE.Group();
  const letter = new THREE.Group();
  letter.name = "Chicago_N";
  letter.position.set(0, 0.57, 0);
  scene.add(letter);
  const motion = createAmbientMotion(scene);
  let maxAngle = 0;
  let maxLift = 0;
  for (let time = 0; time < 120; time += 0.1) {
    motion.update(time);
    maxAngle = Math.max(maxAngle, Math.abs(letter.rotation.y));
    maxLift = Math.max(maxLift, Math.abs(letter.position.y - 0.57));
  }
  expect(maxAngle).toBeGreaterThan(0.13);
  expect(maxAngle).toBeLessThanOrEqual(0.14);
  expect(maxLift).toBeLessThanOrEqual(0.035);
  motion.update(0);
  expect(letter.position.y).toBeCloseTo(0.57);
  expect(letter.rotation.y).toBe(0);
  motion.dispose();
});
