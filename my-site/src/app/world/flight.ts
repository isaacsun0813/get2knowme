import { MathUtils, Vector3 } from "three";
import { type FlightInput, FLIGHT_RADIUS, places } from "./data";

export function createFlight() {
  const normal = new Vector3(...places[0].position).normalize();
  const destination = new Vector3(...places[2].position).normalize();
  const forward = destination
    .addScaledVector(normal, -destination.dot(normal))
    .normalize();
  return { normal, forward, speed: 0, bank: 0, axis: new Vector3() };
}

export type FlightState = ReturnType<typeof createFlight>;

export function stepFlight(
  state: FlightState,
  input: FlightInput,
  elapsed: number,
) {
  const dt = MathUtils.clamp(elapsed, 0, 0.05);
  const target = input.forward && !input.brake ? 8 : 0;
  state.speed = MathUtils.damp(state.speed, target, input.brake ? 5 : 1.5, dt);
  const turn = Number(input.right) - Number(input.left);
  state.bank = MathUtils.damp(state.bank, -turn * 0.24, 4, dt);
  state.forward.applyAxisAngle(state.normal, (state.bank / 0.24) * dt * 1.5);
  if (state.speed > 0.005) {
    state.axis.crossVectors(state.normal, state.forward).normalize();
    const angle = (state.speed * dt) / FLIGHT_RADIUS;
    state.normal.applyAxisAngle(state.axis, angle).normalize();
    state.forward.applyAxisAngle(state.axis, angle).normalize();
  }
  state.forward
    .addScaledVector(state.normal, -state.forward.dot(state.normal))
    .normalize();
}

export function sunDirection(date: Date): [number, number, number] {
  const year = date.getUTCFullYear();
  const start = Date.UTC(year, 0, 1);
  const day = (date.getTime() - start) / 86_400_000;
  const daysInYear = (Date.UTC(year + 1, 0, 1) - start) / 86_400_000;
  const gamma = ((2 * Math.PI) / daysInYear) * (day - 0.5);
  const declination =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);
  const equation =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));
  const minutes =
    date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const longitude = ((720 - minutes - equation) * Math.PI) / 720;
  return [
    Math.cos(declination) * Math.cos(longitude),
    Math.sin(declination),
    -Math.cos(declination) * Math.sin(longitude),
  ];
}
