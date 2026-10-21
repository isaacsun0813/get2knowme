import { expect, test } from "@playwright/test";
import {
  createFlight,
  stepFlight,
  sunDirection,
} from "../../src/app/world/flight";
import { emptyInput } from "../../src/app/world/data";

test("flight stays tangent to the globe through sustained steering", () => {
  const state = createFlight();
  const input = { ...emptyInput(), forward: true, right: true };
  for (let i = 0; i < 3600; i++) stepFlight(state, input, 1 / 60);
  expect(state.normal.length()).toBeCloseTo(1, 10);
  expect(state.forward.length()).toBeCloseTo(1, 10);
  expect(state.normal.dot(state.forward)).toBeCloseTo(0, 10);
  expect(Number.isFinite(state.speed)).toBe(true);
});

test("flight speed is bounded and movement is consistent across frame rates", () => {
  const slow = createFlight();
  const fast = createFlight();
  const input = { ...emptyInput(), forward: true };
  for (let i = 0; i < 150; i++) stepFlight(slow, input, 1 / 30);
  for (let i = 0; i < 600; i++) stepFlight(fast, input, 1 / 120);
  expect(slow.speed).toBeLessThanOrEqual(8);
  expect(slow.normal.distanceTo(fast.normal) * 31).toBeLessThan(0.15);
  for (let i = 0; i < 200; i++)
    stepFlight(slow, { ...emptyInput(), brake: true }, 1 / 60);
  expect(slow.speed).toBeLessThan(0.001);
});

test("real-time sunlight follows the globe longitude convention and seasons", () => {
  const noon = sunDirection(new Date("2026-03-20T12:00:00Z"));
  const dawn = sunDirection(new Date("2026-03-20T06:00:00Z"));
  expect(Math.hypot(...noon)).toBeCloseTo(1, 10);
  expect(noon[0]).toBeGreaterThan(0.99);
  expect(dawn[2]).toBeLessThan(-0.99);
  const start = createFlight().normal;
  const afternoon = sunDirection(new Date("2026-03-20T20:00:00Z"));
  const night = sunDirection(new Date("2026-03-20T08:00:00Z"));
  expect(
    start.dot({ x: afternoon[0], y: afternoon[1], z: afternoon[2] }),
  ).toBeGreaterThan(0.7);
  expect(start.dot({ x: night[0], y: night[1], z: night[2] })).toBeLessThan(
    -0.7,
  );
  expect(sunDirection(new Date("2026-06-21T12:00:00Z"))[1]).toBeGreaterThan(
    0.38,
  );
  expect(sunDirection(new Date("2026-12-21T12:00:00Z"))[1]).toBeLessThan(-0.38);
});

test("banking eases into turns, reverses through level, and settles after release", () => {
  const state = createFlight();
  const right = { ...emptyInput(), right: true };
  stepFlight(state, right, 1 / 60);
  expect(state.bank).toBeLessThan(0);
  expect(state.bank).toBeGreaterThan(-0.03);
  for (let i = 0; i < 60; i++) stepFlight(state, right, 1 / 60);
  expect(state.bank).toBeCloseTo(-0.24, 2);
  stepFlight(state, { ...emptyInput(), left: true }, 1 / 60);
  expect(state.bank).toBeLessThan(0);
  for (let i = 0; i < 120; i++) stepFlight(state, emptyInput(), 1 / 60);
  expect(Math.abs(state.bank)).toBeLessThan(0.001);
  const slow = createFlight(),
    fast = createFlight();
  for (let i = 0; i < 30; i++) stepFlight(slow, right, 1 / 30);
  for (let i = 0; i < 120; i++) stepFlight(fast, right, 1 / 120);
  expect(slow.bank).toBeCloseTo(fast.bank, 10);
});
