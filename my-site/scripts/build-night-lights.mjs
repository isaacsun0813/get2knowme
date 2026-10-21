import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const output = new URL("public/models/night-lights.bin", root);
const [model, dataSource] = await Promise.all([
  readFile(new URL("public/models/sickEarthFile3.glb", root)),
  readFile(new URL("src/app/world/data.ts", root), "utf8"),
]);
const moduleURL = (source) =>
  `data:text/javascript;base64,${Buffer.from(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
  ).toString("base64")}`;
const { places, EARTH_RADIUS } = await import(moduleURL(dataSource));

function removeTextureBindings(object) {
  if (!object || typeof object !== "object") return;
  for (const key of Object.keys(object)) {
    if (key.endsWith("Texture")) delete object[key];
    else removeTextureBindings(object[key]);
  }
}

const loader = new GLTFLoader().register((parser) => ({
  name: "geometry-only",
  beforeRoot() {
    removeTextureBindings(parser.json.materials);
  },
}));
const { scene } = await loader.parseAsync(
  model.buffer.slice(model.byteOffset, model.byteOffset + model.byteLength),
  "",
);

const settlements = [
  [34, -118],
  [41, -74],
  [43, -79],
  [48, -123],
  [26, -80],
  [40, -105],
  [34, -84],
  [30, -95],
  [33, -97],
  [19, -99],
  [-24, -47],
  [-23, -43],
  [-35, -58],
  [-12, -77],
  [5, -74],
  [52, 0],
  [49, 2],
  [52, 5],
  [52, 13],
  [40, -3],
  [42, 12],
  [41, 29],
  [56, 38],
  [30, 31],
  [6, 3],
  [-1, 37],
  [-26, 28],
  [25, 55],
  [29, 77],
  [19, 73],
  [24, 90],
  [14, 101],
  [1, 104],
  [-6, 107],
  [15, 121],
  [40, 116],
  [22, 114],
  [37, 127],
  [36, 140],
  [35, 135],
  [-34, 151],
  [-38, 145],
  [-32, 116],
  [-37, 175],
];

function makeLights(scene) {
  const ground = [];
  scene.updateMatrixWorld(true);
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    if (materials.some((material) => material.name === "Ground"))
      ground.push(object);
  });
  let seed = 4127;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const centers = settlements.map(([latitude, longitude]) => {
    const lat = THREE.MathUtils.degToRad(latitude);
    const lon = THREE.MathUtils.degToRad(longitude);
    return new THREE.Vector3(
      Math.cos(lat) * Math.cos(lon),
      Math.sin(lat),
      -Math.cos(lat) * Math.sin(lon),
    );
  });
  centers.push(
    ...places.map((place) => new THREE.Vector3(...place.position).normalize()),
  );
  const points = [];
  const ray = new THREE.Raycaster();
  const normal = new THREE.Vector3();
  const east = new THREE.Vector3();
  const north = new THREE.Vector3();
  const point = new THREE.Vector3();
  for (const center of centers) {
    east.crossVectors(new THREE.Vector3(0, 1, 0), center).normalize();
    north.crossVectors(center, east).normalize();
    for (let i = 0; i < 100; i++) {
      const angle = random() * Math.PI * 2;
      const radius = Math.pow(random(), 1.6) * 0.1;
      normal
        .copy(center)
        .addScaledVector(east, Math.cos(angle) * radius)
        .addScaledVector(north, Math.sin(angle) * radius * 0.65)
        .normalize();
      ray.set(point.copy(normal).multiplyScalar(2), normal.clone().negate());
      const hit = ray.intersectObjects(ground, false)[0];
      if (!hit || hit.point.dot(normal) <= 0) continue;
      point
        .copy(hit.point)
        .multiplyScalar(EARTH_RADIUS)
        .addScaledVector(normal, 0.045);
      points.push(
        point.x,
        point.y,
        point.z,
        random() * Math.PI * 2,
        i % 31 === 0 ? 3.2 : 0.65 + random() * 0.85,
      );
    }
  }
  return new Float32Array(points);
}

const started = performance.now();
const points = makeLights(scene);
assert(
  points.length > 0 && points.length % 5 === 0,
  "Night lights must contain complete points",
);
assert(
  points.every(Number.isFinite),
  "Night lights must have finite attributes",
);
const bytes = Buffer.from(points.buffer, points.byteOffset, points.byteLength);
if (process.argv.includes("--check")) {
  assert(
    bytes.equals(await readFile(output)),
    "Night lights changed; run npm run build:night-lights",
  );
} else {
  await writeFile(output, bytes);
}
console.log(
  `${process.argv.includes("--check") ? "Verified" : "Built"} ${points.length / 5} night lights; ${bytes.length} bytes; raycasts ${(performance.now() - started).toFixed(1)} ms`,
);
