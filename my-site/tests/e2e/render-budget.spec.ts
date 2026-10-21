import { expect, test, type Page } from "@playwright/test";
import { installRenderProbe } from "../../scripts/render-probe.mjs";
import { isLimitedHardware } from "../../src/app/world/render-quality";

type RenderStats = {
  scene: string;
  width: number;
  height: number;
  draws: number;
  offscreenPasses: number;
  offscreenSize: number;
  maxTextureSize: number;
};

declare global {
  interface Window {
    renderProbe: { reset: () => void; read: () => RenderStats[] };
  }
}

async function readyWorld(page: Page) {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Take flight", exact: true }),
  ).toBeEnabled();
}

function worldStats(page: Page) {
  return page.evaluate(
    () =>
      window.renderProbe.read().find(({ scene }) => scene === "isaacs-world")!,
  );
}

test("unknown hardware keeps normal quality, limited CPU or memory selects economy", () => {
  expect(isLimitedHardware({})).toBe(false);
  expect(isLimitedHardware({ hardwareConcurrency: 16, deviceMemory: 8 })).toBe(
    false,
  );
  expect(isLimitedHardware({ hardwareConcurrency: 4, deviceMemory: 8 })).toBe(
    true,
  );
  expect(isLimitedHardware({ hardwareConcurrency: 16, deviceMemory: 4 })).toBe(
    true,
  );
});

test("limited hardware uses smaller real render targets while keeping flight and photos", async ({
  page,
}) => {
  await page.addInitScript(installRenderProbe, { weak: true });
  await readyWorld(page);
  const world = page.locator('canvas[data-scene="isaacs-world"]');
  const width = (await world.boundingBox())!.width;
  const stats = await worldStats(page);
  expect(stats.width).toBeLessThanOrEqual(Math.ceil(width));
  expect(stats.offscreenSize).toBe(1024);
  await page.getByRole("button", { name: "Take flight", exact: true }).click();
  await page.keyboard.down("w");
  await expect
    .poll(async () =>
      Number(
        await page.getByTestId("flight-status").getAttribute("data-speed"),
      ),
    )
    .toBeGreaterThan(2);
  await page.keyboard.up("w");
  await page.goto("/#adventure");
  const board = page.locator('canvas[data-scene="travel-board"]');
  await expect(board).toHaveAttribute("data-board-ready", "true");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.renderProbe
            .read()
            .find(({ scene }) => scene === "travel-board")?.offscreenSize,
      ),
    )
    .toBe(512);
  const boardWidth = (await board.boundingBox())!.width;
  const rendered = await page.evaluate(
    () =>
      window.renderProbe.read().find(({ scene }) => scene === "travel-board")!,
  );
  expect(rendered.width).toBeLessThanOrEqual(Math.ceil(boardWidth));
  expect(rendered.maxTextureSize).toBeLessThanOrEqual(1024);
  await page
    .getByRole("button", { name: "View Milan photograph", exact: true })
    .click();
  await expect(
    page
      .getByRole("dialog", { name: "Travel photograph" })
      .getByRole("heading", { name: "Milan" }),
  ).toBeVisible();
});

test("world shadows refresh within a bounded budget", async ({ page }) => {
  await page.addInitScript(installRenderProbe);
  await readyWorld(page);
  await page.evaluate(() => window.renderProbe.reset());
  await page.waitForTimeout(3000);
  const stats = await worldStats(page);
  expect(stats.draws).toBeGreaterThan(0);
  expect(stats.offscreenPasses).toBeGreaterThan(0);
  expect(stats.offscreenPasses).toBeLessThanOrEqual(45);
});

test("the overview stops rendering in a hidden tab and resumes when visible", async ({
  page,
}) => {
  await page.addInitScript(installRenderProbe);
  await readyWorld(page);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(150);
  await page.evaluate(() => window.renderProbe.reset());
  await page.waitForTimeout(600);
  expect((await worldStats(page)).draws).toBe(0);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect
    .poll(async () => (await worldStats(page)).draws)
    .toBeGreaterThan(0);
});

test("the moving board stops drawing behind a photograph and in a hidden tab", async ({
  page,
}) => {
  await page.addInitScript(installRenderProbe);
  await page.goto("/#adventure");
  const board = page.locator('canvas[data-scene="travel-board"]');
  await expect(board).toHaveAttribute("data-board-ready", "true");
  const stats = () =>
    page.evaluate(
      () =>
        window.renderProbe
          .read()
          .find(({ scene }) => scene === "travel-board")!,
    );
  await page.evaluate(() => window.renderProbe.reset());
  await page.waitForTimeout(1000);
  expect((await stats()).draws).toBeGreaterThan(0);
  expect((await stats()).offscreenPasses).toBeLessThanOrEqual(45);
  await page
    .getByRole("button", { name: "View Milan photograph", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Travel photograph" }),
  ).toBeVisible();
  await page.waitForTimeout(150);
  await page.evaluate(() => window.renderProbe.reset());
  await page.waitForTimeout(500);
  expect((await stats()).draws).toBe(0);
  await page.keyboard.press("Escape");
  await expect.poll(async () => (await stats()).draws).toBeGreaterThan(0);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(150);
  await page.evaluate(() => window.renderProbe.reset());
  await page.waitForTimeout(500);
  expect((await stats()).draws).toBe(0);
});
