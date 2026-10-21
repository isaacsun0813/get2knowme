import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import * as THREE from "three";
import { animateCodi, createCodi } from "../../src/app/world/codi";

function originalDog() {
  const bytes = readFileSync("public/models/sickEarthFile3.glb");
  const length = bytes.readUInt32LE(12);
  const gltf = JSON.parse(bytes.subarray(20, 20 + length).toString());
  const binary = bytes.subarray(28 + length);
  const scene = new THREE.Group();
  const yard = new THREE.Group();
  yard.name = "Saratoga_Pin";
  scene.add(yard);
  const source = gltf.nodes.find(
    (node: { name: string }) => node.name === yard.name,
  );
  for (const primitive of gltf.meshes[source.mesh].primitives) {
    const name: string = gltf.materials[primitive.material].name;
    const accessor = gltf.accessors[primitive.attributes.POSITION];
    const view = gltf.bufferViews[accessor.bufferView];
    const values: number[] = [];
    for (let i = 0; i < accessor.count; i++) {
      const offset =
        (view.byteOffset || 0) +
        (accessor.byteOffset || 0) +
        i * (view.byteStride || 12);
      for (let axis = 0; axis < 3; axis++)
        values.push(binary.readFloatLE(offset + axis * 4));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(values, 3),
    );
    geometry.boundingBox = new THREE.Box3(
      new THREE.Vector3().fromArray(accessor.min),
      new THREE.Vector3().fromArray(accessor.max),
    );
    geometry.boundingSphere = geometry.boundingBox.getBoundingSphere(
      new THREE.Sphere(),
    );
    const material = new THREE.MeshStandardMaterial();
    material.name = name;
    yard.add(new THREE.Mesh(geometry, material));
  }
  return scene;
}

test("Codi's original vertices have valid skin weights and stay in the yard through a full route", () => {
  const scene = originalDog();
  const rig = createCodi(scene);
  expect(rig.bones).toHaveLength(6);
  const yard = scene.getObjectByName("Saratoga_Pin")!;
  const vertex = new THREE.Vector3();
  for (const name of ["LM_base", "LM_grass", "LM_stucco", "LM_gate"]) {
    const mesh = yard.children.find(
      (object) =>
        object instanceof THREE.Mesh &&
        (object.material as THREE.Material).name === name,
    ) as THREE.Mesh;
    const { geometry } = mesh;
    expect(geometry.boundingBox, name).not.toBeNull();
    expect(geometry.boundingSphere, name).not.toBeNull();
    const positions = geometry.getAttribute("position");
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i);
      expect(
        geometry.boundingBox!.distanceToPoint(vertex),
        name,
      ).toBeLessThanOrEqual(0.000001);
      expect(
        vertex.distanceTo(geometry.boundingSphere!.center) -
          geometry.boundingSphere!.radius,
        name,
      ).toBeLessThanOrEqual(0.000001);
    }
  }
  const bounds = (material: string) => {
    const mesh = yard.children.find(
      (object) =>
        object instanceof THREE.Mesh &&
        (object.material as THREE.Material).name === material,
    ) as THREE.Mesh;
    mesh.geometry.computeBoundingBox();
    return mesh.geometry.boundingBox!;
  };
  expect(bounds("LM_grass").max.x).toBeCloseTo(1.35, 5);
  expect(bounds("LM_stucco").min.x).toBeCloseTo(1.34, 5);
  expect(bounds("LM_wall").max.x).toBeCloseTo(0.35, 5);
  const meshes = rig.actor.children.filter(
    (object): object is THREE.SkinnedMesh =>
      object instanceof THREE.SkinnedMesh,
  );
  expect(meshes).toHaveLength(4);
  for (const mesh of meshes) {
    const weights = mesh.geometry.getAttribute("skinWeight");
    for (let i = 0; i < weights.count; i++) {
      expect(weights.getX(i) + weights.getY(i)).toBeCloseTo(1, 6);
    }
  }
  const box = new THREE.Box3();
  for (let time = 0; time <= 20; time += 0.1) {
    animateCodi(rig, time);
    scene.updateMatrixWorld(true);
    box.makeEmpty();
    for (const mesh of meshes) {
      const positions = mesh.geometry.getAttribute("position");
      for (let i = 0; i < positions.count; i++) {
        vertex.fromBufferAttribute(positions, i);
        mesh.applyBoneTransform(i, vertex).applyMatrix4(mesh.matrixWorld);
        box.expandByPoint(vertex);
      }
    }
    expect(box.min.x).toBeGreaterThan(0.35);
    expect(box.max.x).toBeLessThan(1.32);
    expect(box.min.z).toBeGreaterThan(-0.9);
    expect(box.max.z).toBeLessThan(0.9);
    expect(box.min.y).toBeGreaterThan(-1.46);
    expect(box.max.y).toBeLessThan(-0.98);
  }
  animateCodi(rig, 19.9999);
  const before = rig.actor.quaternion.clone();
  animateCodi(rig, 20);
  expect(before.angleTo(rig.actor.quaternion)).toBeLessThan(0.001);
  for (const boundary of [7, 10, 17, 20]) {
    animateCodi(rig, boundary - 0.0001);
    const head = rig.bones[0].quaternion.clone();
    const position = rig.actor.position.clone();
    animateCodi(rig, boundary);
    expect(head.angleTo(rig.bones[0].quaternion)).toBeLessThan(0.001);
    expect(position.distanceTo(rig.actor.position)).toBeLessThan(0.001);
  }
  animateCodi(rig, 7.9);
  expect(rig.bones[0].rotation.y).toBeGreaterThan(-0.7);
  animateCodi(rig, 9.1);
  expect(rig.bones[0].rotation.y).toBeLessThan(-1.7);
  rig.dispose();
});
