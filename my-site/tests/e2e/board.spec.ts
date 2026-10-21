import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import {
  boardFrames,
  boardObjects,
  boardPhotos,
  plantPositions,
} from "../../src/app/journal/board-layout";

async function pixelDifference(page: Page, a: Buffer, b: Buffer) {
  return page.evaluate(
    async ([first, second]) => {
      async function pixels(encoded: string) {
        const image = new Image();
        image.src = `data:image/png;base64,${encoded}`;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d")!;
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, canvas.width, canvas.height).data;
      }
      const [a, b] = await Promise.all([pixels(first), pixels(second)]);
      let changed = 0;
      for (let i = 0; i < a.length; i += 4) {
        if (
          Math.abs(a[i] - b[i]) +
            Math.abs(a[i + 1] - b[i + 1]) +
            Math.abs(a[i + 2] - b[i + 2]) >
          35
        )
          changed++;
      }
      return changed;
    },
    [a.toString("base64"), b.toString("base64")],
  );
}

test("the Blender export contains physical props and photo surfaces", async () => {
  const bytes = await readFile("public/models/travel-board.glb");
  expect(bytes.toString("utf8", 0, 4)).toBe("glTF");
  const json = JSON.parse(
    bytes.toString("utf8", 20, 20 + bytes.readUInt32LE(12)),
  );
  const nodeNames = json.nodes.map((node: { name: string }) => node.name);
  for (const name of [
    "CanvasBoard",
    "CanvasBoardLandscape",
    "CanvasBoardPortrait",
    "Basketball",
    "SnackBag",
    "Charm",
    "Succulent",
    "Vine",
    ...boardPhotos.map(({ number }) => `Photo_${number}`),
  ]) {
    expect(nodeNames).toContain(name);
    const node = json.nodes[nodeNames.indexOf(name)];
    expect(node.children.length).toBeGreaterThan(0);
  }
  for (const item of boardObjects) {
    if (item.topMount === undefined) continue;
    const node = json.nodes[nodeNames.indexOf(item.name)];
    expect(node.translation[1]).toBeCloseTo(
      boardFrames.desktop.height / 2 - item.topMount,
      3,
    );
    expect(item.phone[1] + item.topMount).toBeCloseTo(
      boardFrames.phone.height / 2,
      3,
    );
  }
  expect(json.nodes[nodeNames.indexOf("Succulent")].translation[1]).toBeCloseTo(
    plantPositions.desktop[1],
    3,
  );
  expect(
    json.materials.some(
      (mat: { normalTexture?: unknown }) => mat.normalTexture,
    ),
  ).toBe(true);
  expect(
    json.images.filter((image: { name: string }) =>
      image.name.startsWith("adventure"),
    ),
  ).toHaveLength(9);
  expect(
    json.materials.some((material: { name: string }) =>
      material.name.includes("XXTRA Hot"),
    ),
  ).toBe(true);
  expect(
    json.materials.some((material: { name: string }) =>
      material.name.includes("Spalding"),
    ),
  ).toBe(true);
  expect(
    json.materials.some((material: { name: string }) =>
      material.name.includes("Jean"),
    ),
  ).toBe(true);
  for (const material of json.materials.filter((material: { name: string }) =>
    material.name.startsWith("Original photograph"),
  )) {
    expect(
      material.pbrMetallicRoughness.roughnessFactor ?? 1,
    ).toBeGreaterThanOrEqual(0.9);
  }
  const source = await readFile(
    "../assets/blender/travel-board/travel-board.blend",
  );
  expect(source.toString("ascii", 0, 7)).toBe("BLENDER");
  expect(bytes.length).toBeLessThan(8 * 1024 * 1024);
  for (const [filename, root, other] of [
    ["basketball", "Basketball", "SnackBag"],
    ["hot-cheetos", "SnackBag", "Basketball"],
    ["jean-kirstein", "Charm", "Basketball"],
  ]) {
    const prop = await readFile(
      `../assets/blender/travel-board/${filename}.glb`,
    );
    const data = JSON.parse(
      prop.toString("utf8", 20, 20 + prop.readUInt32LE(12)),
    );
    const names = data.nodes.map((node: { name: string }) => node.name);
    expect(names).toContain(root);
    expect(names).not.toContain(other);
    expect(names).not.toContain("CanvasBoard");
  }
});

test("the rendered board moves in 3D, settles, and keeps keyboard photo access", async ({
  page,
  isMobile,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#adventure");
  const board = page.getByRole("group", { name: "Travel photo board" });
  await expect(board).toHaveAttribute("data-renderer", "3d", {
    timeout: 30_000,
  });
  const canvas = page.locator('canvas[data-scene="travel-board"]');
  await expect(canvas).toHaveAttribute("data-board-ready", "true");
  await expect(page.locator(".travel-board-canvas")).toHaveCSS("opacity", "1");
  expect(
    Number(await canvas.getAttribute("data-board-meshes")),
  ).toBeGreaterThan(30);
  await page.screenshot({
    path: info.outputPath("physical-board.png"),
    fullPage: true,
  });
  for (const caption of ["Ticino", "Zermatt", "Wicker Park"]) {
    const photo = page.getByRole("button", {
      name: `View ${caption} photograph`,
      exact: true,
    });
    if (isMobile) await photo.tap();
    else await photo.click();
    await expect(
      page
        .getByRole("dialog", { name: "Travel photograph" })
        .getByRole("heading", { name: caption }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Travel photograph" }),
    ).not.toBeVisible();
  }
  for (const name of [
    "Slide the Spalding basketball",
    "View Milan photograph",
  ]) {
    const object = page.getByRole("button", { name, exact: true });
    await object.scrollIntoViewIfNeeded();
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    const before = await object.screenshot();
    const rect = (await object.boundingBox())!;
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      rect.x + rect.width / 2 + 40,
      rect.y + rect.height / 2 + 15,
      { steps: 8 },
    );
    await page.waitForTimeout(200);
    const during = await object.screenshot();
    await page.mouse.up();
    const moved = await pixelDifference(page, before, during);
    expect(moved).toBeGreaterThan(80);
    await expect
      .poll(
        async () =>
          Number(await canvas.getAttribute("data-board-displacement")),
        { timeout: 5000 },
      )
      .toBeLessThan(0.002);
    await expect(
      page.getByRole("dialog", { name: "Travel photograph" }),
    ).not.toBeVisible();
  }
  const milan = page.getByRole("button", {
    name: "View Milan photograph",
    exact: true,
  });
  await milan.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Travel photograph" });
  await expect(dialog.getByRole("heading", { name: "Milan" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(milan).toBeFocused();
  // The keyboard focus ring paints above the canvas and would contaminate the motion comparison.
  await milan.evaluate((element: HTMLButtonElement) => element.blur());
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(canvas).toHaveAttribute("data-board-motion-time", "0.000");
  await expect(canvas).toHaveAttribute("data-board-displacement", "0.0000");
  const still = await milan.screenshot();
  const rect = (await milan.boundingBox())!;
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    rect.x + rect.width / 2 + 40,
    rect.y + rect.height / 2 + 15,
    { steps: 4 },
  );
  await page.mouse.up();
  await milan.evaluate((element: HTMLButtonElement) => element.blur());
  expect(
    await pixelDifference(page, still, await milan.screenshot()),
  ).toBeLessThan(10);
  expect(errors).toEqual([]);
});

test("a failed board asset leaves a matching still and usable photographs", async ({
  page,
  isMobile,
}, info) => {
  await page.route("**/models/travel-board.glb", (route) => route.abort());
  await page.goto("/#adventure");
  const board = page.getByRole("group", { name: "Travel photo board" });
  await expect(board).toHaveAttribute("data-renderer", "still", {
    timeout: 30_000,
  });
  const image = board.locator("picture img");
  await expect
    .poll(() =>
      image.evaluate((element: HTMLImageElement) => element.naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.screenshot({
    path: info.outputPath("board-fallback.png"),
    fullPage: true,
  });
  const milan = page.getByRole("button", {
    name: "View Milan photograph",
    exact: true,
  });
  if (isMobile) await milan.tap();
  else await milan.click();
  await expect(
    page
      .getByRole("dialog", { name: "Travel photograph" })
      .getByRole("heading", { name: "Milan" }),
  ).toBeVisible();
});

test("board context loss falls back independently of the Earth", async ({
  page,
}) => {
  await page.goto("/#adventure");
  const board = page.getByRole("group", { name: "Travel photo board" });
  await expect(board).toHaveAttribute("data-renderer", "3d", {
    timeout: 30_000,
  });
  await page
    .locator('canvas[data-scene="travel-board"]')
    .evaluate((canvas: HTMLCanvasElement) => {
      const extension = canvas
        .getContext("webgl2")!
        .getExtension("WEBGL_lose_context");
      if (!extension) throw new Error("Context loss extension unavailable");
      extension.loseContext();
    });
  await expect(board).toHaveAttribute("data-renderer", "still");
  await expect(
    page.getByRole("heading", {
      name: "A little less 3D. The same little world.",
    }),
  ).not.toBeVisible();
  await page
    .getByRole("button", { name: "View Milan photograph", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Travel photograph" }),
  ).toBeVisible();
});

test("the board sways on its own and pauses for photos and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#adventure");
  const board = page.getByRole("group", { name: "Travel photo board" });
  await expect(board).toHaveAttribute("data-renderer", "3d", {
    timeout: 30_000,
  });
  const canvas = page.locator('canvas[data-scene="travel-board"]');
  await board.scrollIntoViewIfNeeded();
  const first = await page.screenshot();
  await expect
    .poll(async () => pixelDifference(page, first, await page.screenshot()), {
      timeout: 5000,
      intervals: [300, 500, 800],
    })
    .toBeGreaterThan(80);
  await page
    .getByRole("button", { name: "View Milan photograph", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Travel photograph" }),
  ).toHaveAttribute("data-motion", "open");
  const frozen = await canvas.getAttribute("data-board-motion-time");
  await page.waitForTimeout(350);
  expect(await canvas.getAttribute("data-board-motion-time")).toBe(frozen);
  await page.keyboard.press("Escape");
  await expect
    .poll(() => canvas.getAttribute("data-board-motion-time"))
    .not.toBe(frozen);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(250);
  const still = await page.screenshot();
  await page.waitForTimeout(450);
  expect(
    await pixelDifference(page, still, await page.screenshot()),
  ).toBeLessThan(10);
  await expect(canvas).toHaveAttribute("data-board-motion-time", "0.000");
});
