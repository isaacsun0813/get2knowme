export const EARTH_RADIUS = 25;
export const FLIGHT_RADIUS = 31;

export const places = [
  {
    id: "about",
    city: "Saratoga",
    title: "About me",
    node: "Saratoga_Pin",
    position: [-9.77292, 16.83141, 19.53852],
  },
  {
    id: "projects",
    city: "San Francisco",
    title: "Projects",
    node: "San_Francisco_Pin",
    position: [-9.93565, 19.07514, 16.96642],
  },
  {
    id: "career",
    city: "Chicago",
    title: "Career",
    node: "Chicago_Pin",
    position: [0.46914, 20.18864, 18.88305],
  },
  {
    id: "adventure",
    city: "Zurich",
    title: "Adventure",
    node: "Zurich_Pin",
    position: [18.11929, 20.7236, -2.57136],
  },
  {
    id: "vibes",
    city: "Shanghai",
    title: "Vibes",
    node: "Shanghai_Pin",
    position: [-10.97221, 13.57419, -21.14728],
  },
] as const;

export type PageId = (typeof places)[number]["id"];
export type WorldMode = "overview" | "flying" | "inspect";
export type FlightInput = {
  forward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
};
export type FlightCommand = {
  action: "land" | "takeoff";
  sequence: number;
};
export type FlightStatus = {
  position: [number, number, number];
  speed: number;
  nearest: PageId;
  landed: boolean;
};
export const landingPosition: [number, number, number] = [
  19.90553, 19.24695, -0.86281,
];
export const emptyInput = (): FlightInput => ({
  forward: false,
  left: false,
  right: false,
  brake: false,
});
