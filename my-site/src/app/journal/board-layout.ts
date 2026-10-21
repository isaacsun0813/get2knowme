import layout from "./board-layout.json";

export const boardViews = layout.views;
export const boardFrames = layout.frames;
export const boardObjects = layout.objects.map((item) =>
  item.topMount !== undefined
    ? {
        ...item,
        desktop: [
          item.desktop[0],
          boardFrames.desktop.height / 2 - item.topMount,
        ] as [number, number],
        phone: [
          item.phone[0],
          boardFrames.phone.height / 2 - item.topMount,
        ] as [number, number],
      }
    : item,
);
export const plantPositions = {
  desktop: [
    layout.plant.desktopX,
    boardFrames.desktop.height / 2 - layout.plant.topMount,
  ] as [number, number],
  phone: [
    layout.plant.phoneX,
    boardFrames.phone.height / 2 - layout.plant.topMount,
  ] as [number, number],
};
export const boardPhotos = boardObjects.flatMap(({ number, caption }) =>
  number !== undefined && caption !== undefined ? [{ number, caption }] : [],
);
export type BoardMotion = Map<
  string,
  { x: number; y: number; held: boolean; hovered?: boolean }
>;
