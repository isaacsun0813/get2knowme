import * as THREE from "three";

export function createCameraTravel(
  camera: THREE.Camera,
  destination: THREE.Camera,
) {
  return {
    elapsed: 0,
    from: camera.position.clone(),
    fromRotation: camera.quaternion.clone(),
    fromUp: camera.up.clone(),
    fromAim: new THREE.Vector3(0, 0, -1)
      .applyQuaternion(camera.quaternion)
      .multiplyScalar(camera.position.length())
      .add(camera.position),
    to: destination.position.clone(),
    toRotation: destination.quaternion.clone(),
    toUp: destination.up.clone(),
    direction: new THREE.Vector3(),
    aim: new THREE.Vector3(),
    arc: new THREE.Quaternion(),
    rotation: new THREE.Quaternion(),
  };
}

export function stepCameraTravel(
  camera: THREE.Camera,
  travel: ReturnType<typeof createCameraTravel>,
  elapsed: number,
) {
  travel.elapsed = Math.min(1.8, travel.elapsed + Math.min(elapsed, 0.05));
  const t = THREE.MathUtils.smootherstep(travel.elapsed / 1.8, 0, 1);
  const radius = THREE.MathUtils.lerp(
    travel.from.length(),
    travel.to.length(),
    t,
  );
  travel.direction.copy(travel.from).normalize();
  travel.arc.setFromUnitVectors(
    travel.direction,
    camera.position.copy(travel.to).normalize(),
  );
  travel.rotation.identity().slerp(travel.arc, t);
  camera.position
    .copy(travel.direction)
    .applyQuaternion(travel.rotation)
    .multiplyScalar(radius);
  camera.quaternion.slerpQuaternions(travel.fromRotation, travel.toRotation, t);
  travel.aim
    .set(0, 0, -1)
    .applyQuaternion(travel.toRotation)
    .multiplyScalar(travel.to.length())
    .add(travel.to)
    .lerp(travel.fromAim, 1 - t)
    .sub(camera.position)
    .normalize();
  travel.direction.set(0, 0, -1).applyQuaternion(camera.quaternion);
  travel.arc.setFromUnitVectors(travel.direction, travel.aim);
  camera.quaternion.premultiply(travel.arc);
  camera.up.copy(travel.fromUp).lerp(travel.toUp, t).normalize();
  return travel.elapsed === 1.8;
}
