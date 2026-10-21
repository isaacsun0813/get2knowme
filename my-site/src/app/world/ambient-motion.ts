import * as THREE from "three";

export function createAmbientMotion(scene: THREE.Group) {
  const northwestern = scene.getObjectByName("Chicago_N");
  const northwesternRest = northwestern?.position.clone();
  const tree = new THREE.Group();
  tree.name = "Saratoga_breeze";
  tree.position.set(-0.3, -1.45651, -0.775);
  const yard = scene.getObjectByName("Saratoga_Pin");
  const branches: THREE.Mesh[] = [];
  yard?.traverse((object) => {
    if (
      object instanceof THREE.Mesh &&
      !Array.isArray(object.material) &&
      ["LM_trunk", "LM_redwood"].includes(object.material.name)
    )
      branches.push(object);
  });
  yard?.add(tree);
  for (const branch of branches) {
    branch.position.sub(tree.position);
    tree.add(branch);
  }
  const surfaces: { mesh: THREE.Mesh; rest: Float32Array; kind: string }[] = [];
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || Array.isArray(object.material))
      return;
    const kind = object.material.name;
    if (!["LM_windsock", "LM_water"].includes(kind)) return;
    object.geometry = object.geometry.clone();
    const position = object.geometry.attributes.position;
    const rest = new Float32Array(position.count * 3);
    for (let i = 0; i < position.count; i++)
      rest.set([position.getX(i), position.getY(i), position.getZ(i)], i * 3);
    surfaces.push({ mesh: object, rest, kind });
  });
  return {
    update(time: number) {
      if (northwestern && northwesternRest) {
        northwestern.rotation.y = Math.sin(time * 0.45) * 0.14;
        northwestern.position.y =
          northwesternRest.y + Math.sin(time * 0.8) * 0.035;
      }
      tree.rotation.z = Math.sin(time * 0.7) * 0.018;
      tree.rotation.x = Math.sin(time * 0.5) * 0.012;
      for (const { mesh, rest, kind } of surfaces) {
        const positions = mesh.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const x = rest[i * 3],
            y = rest[i * 3 + 1],
            z = rest[i * 3 + 2];
          if (kind === "LM_windsock") {
            const weight = THREE.MathUtils.clamp((x - 2.575) / 0.45, 0, 1);
            positions.setXYZ(
              i,
              x,
              y + 0.025 * weight * Math.sin(time * 4 - weight * 4),
              z + 0.035 * weight * Math.sin(time * 3 - weight * 3),
            );
          } else {
            const weight = THREE.MathUtils.smoothstep(y, -1.315, -1.29);
            positions.setXYZ(
              i,
              x,
              y + 0.006 * weight * Math.sin(time * 1.5 + x * 7 + z * 4),
              z,
            );
          }
        }
        positions.needsUpdate = true;
        mesh.geometry.computeVertexNormals();
      }
    },
    dispose() {
      surfaces.forEach(({ mesh }) => mesh.geometry.dispose());
    },
  };
}
