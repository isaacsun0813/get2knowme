import * as THREE from "three";

const dogMaterials = new Set([
  "LM_dog",
  "LM_dogNose",
  "LM_tongue",
  "LM_bandana",
]);
const floor = -1.46851;

export function createCodi(scene: THREE.Group) {
  const yard = scene.getObjectByName("Saratoga_Pin");
  if (!yard) throw new Error("Codi's Saratoga yard is missing");
  const geometries: THREE.BufferGeometry[] = [];
  yard.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || Array.isArray(object.material))
      return;
    const name = object.material.name;
    if (!["LM_base", "LM_grass", "LM_stucco", "LM_gate"].includes(name)) return;
    const geometry = object.geometry.clone();
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      if (name === "LM_stucco" || name === "LM_gate" || x > 0.35)
        positions.setX(i, x + 0.55);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    object.geometry = geometry;
    geometries.push(geometry);
  });
  const originals: THREE.Mesh[] = [];
  yard.traverse((object) => {
    if (
      object instanceof THREE.Mesh &&
      !Array.isArray(object.material) &&
      dogMaterials.has(object.material.name)
    )
      originals.push(object);
  });
  if (originals.length !== 4)
    throw new Error("Codi's four material groups are missing");
  const actor = new THREE.Group();
  actor.name = "Codi";
  const body = new THREE.Bone();
  body.name = "Codi_body";
  const joints = [
    ["head", 0.12, 0.225, -0.03],
    ["tail", -0.12, 0.22, 0],
    ["front_left", 0.105, 0.15, -0.045],
    ["front_right", 0.105, 0.15, 0.045],
    ["back_left", -0.12, 0.15, -0.045],
    ["back_right", -0.12, 0.15, 0.045],
  ] as const;
  const bones = joints.map(([name, x, y, z]) => {
    const bone = new THREE.Bone();
    bone.name = `Codi_${name}`;
    bone.position.set(x, y, z);
    body.add(bone);
    return bone;
  });
  actor.add(body);
  actor.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton([body, ...bones]);
  const toBody = new THREE.Matrix4()
    .makeRotationY(Math.PI / 4)
    .multiply(new THREE.Matrix4().makeTranslation(-0.6, -floor, 0.48));
  for (const original of originals) {
    const geometry = original.geometry.clone().applyMatrix4(toBody);
    const positions = geometry.attributes.position;
    const indices: number[] = [];
    const weights: number[] = [];
    const material = original.material as THREE.Material;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      let joint = 0;
      let weight = 0;
      if (material.name === "LM_bandana") {
        joint = 0;
        weight = 0;
      } else if (material.name !== "LM_dog") {
        joint = 1;
        weight = 1;
      } else if (y < 0.16) {
        joint = (x > 0 ? 3 : 5) + Number(z > 0);
        weight = 1 - THREE.MathUtils.smoothstep(y, 0.07, 0.16);
      } else if (x > -0.025) {
        joint = 1;
        weight =
          THREE.MathUtils.smoothstep(x, -0.015, 0.02) *
          THREE.MathUtils.smoothstep(y, 0.195, 0.245);
      } else if (x < -0.1 && y > 0.19) {
        joint = 2;
        weight =
          (1 - THREE.MathUtils.smoothstep(x, -0.17, -0.1)) *
          THREE.MathUtils.smoothstep(y, 0.19, 0.26);
      }
      indices.push(0, joint, 0, 0);
      weights.push(1 - weight, weight, 0, 0);
    }
    geometry.setAttribute(
      "skinIndex",
      new THREE.Uint16BufferAttribute(indices, 4),
    );
    geometry.setAttribute(
      "skinWeight",
      new THREE.Float32BufferAttribute(weights, 4),
    );
    const mesh = new THREE.SkinnedMesh(geometry, material);
    mesh.name = `Codi_${material.name}`;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    actor.add(mesh);
    actor.updateMatrixWorld(true);
    mesh.bind(skeleton, new THREE.Matrix4());
    geometries.push(geometry);
    original.removeFromParent();
  }
  yard.add(actor);
  actor.position.set(0.6, floor, -0.48);
  actor.rotation.y = -Math.PI / 4;
  return {
    actor,
    body,
    bones,
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      skeleton.dispose();
    },
  };
}

export type CodiRig = ReturnType<typeof createCodi>;

export function animateCodi(rig: CodiRig, time: number) {
  const t = time % 20;
  const returning = t >= 10;
  const legTime = returning ? t - 10 : t;
  const progress = THREE.MathUtils.smootherstep(legTime, 0, 7);
  const stride = Math.sin(Math.PI * progress);
  const angle = -Math.PI / 2 + Math.PI * progress + (returning ? Math.PI : 0);
  rig.actor.position.set(
    0.88 + 0.26 * Math.cos(angle),
    -1.4445,
    0.52 * Math.sin(angle),
  );
  rig.actor.rotation.y = Math.atan2(
    -0.52 * Math.cos(angle),
    -0.26 * Math.sin(angle),
  );
  rig.body.position.y = (1 - Math.cos(time * 20)) * 0.0015 * stride;
  rig.body.rotation.z = Math.sin(time * 10) * 0.01 * stride;
  const look =
    0.65 * Math.sin(Math.PI * 2 * THREE.MathUtils.smootherstep(legTime, 7, 10));
  rig.bones[0].rotation.set(
    0.02 * Math.sin(time * 0.8),
    -1.2 + 0.12 * Math.sin(time * 0.9) * stride + look,
    0.012 * Math.sin(time * 0.7),
  );
  rig.bones[1].rotation.x = Math.sin(time * 7) * 0.24;
  for (let i = 2; i < 6; i++) {
    const diagonal = i === 2 || i === 5 ? 1 : -1;
    rig.bones[i].rotation.z = Math.sin(time * 10) * 0.36 * stride * diagonal;
  }
}
