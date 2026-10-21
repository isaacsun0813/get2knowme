import { expect, test } from "@playwright/test";
import { PerspectiveCamera, Vector3 } from "three";
import {
  createCameraTravel,
  stepCameraTravel,
} from "../../src/app/world/camera-motion";

test("camera travel takes a continuous arc outside the Earth and reaches the requested pose", () => {
  const camera = new PerspectiveCamera();
  camera.position.set(0, 30, 80);
  camera.lookAt(0, 0, 0);
  const destination = new PerspectiveCamera();
  destination.position.set(0, -35, -40);
  destination.up.set(1, 0, 0);
  destination.lookAt(0, -8, -12);
  const travel = createCameraTravel(camera, destination);
  const before = camera.position.clone();
  expect(stepCameraTravel(camera, travel, 1 / 60)).toBe(false);
  expect(camera.position.distanceTo(before)).toBeLessThan(0.02);
  let done = false;
  for (let i = 0; i < 120; i++) {
    const previous = camera.position.clone();
    done = stepCameraTravel(camera, travel, 1 / 60);
    expect(camera.position.length()).toBeGreaterThan(50);
    expect(camera.position.distanceTo(previous)).toBeLessThan(6);
    const inward = camera.position.clone().normalize().negate();
    expect(camera.getWorldDirection(new Vector3()).dot(inward)).toBeGreaterThan(
      0.95,
    );
  }
  expect(done).toBe(true);
  expect(camera.position.distanceTo(destination.position)).toBeLessThan(
    0.00001,
  );
  expect(camera.quaternion.angleTo(destination.quaternion)).toBeLessThan(
    0.00001,
  );
  expect(camera.up.distanceTo(destination.up)).toBeLessThan(0.00001);
});
