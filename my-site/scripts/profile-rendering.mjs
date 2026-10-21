import { installRenderProbe } from "./render-probe.mjs";
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
});
if (process.env.CPU_RATE) {
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setCPUThrottlingRate", {
    rate: Number(process.env.CPU_RATE),
  });
}
await page.addInitScript(installRenderProbe, { weak: !!process.env.LOW_POWER });
const base = process.env.BASE_URL || "http://127.0.0.1:3107";
const report = {
  cpuRate: Number(process.env.CPU_RATE || 1),
  weakHardware: !!process.env.LOW_POWER,
  modes: {},
};
async function sample(name, action) {
  await page.evaluate(() => window.renderProbe.reset());
  const start = Date.now();
  if (action) await action();
  else await page.waitForTimeout(3000);
  report.modes[name] = {
    milliseconds: Date.now() - start,
    rendering: await page.evaluate(() => window.renderProbe.read()),
  };
}
try {
  await page.goto(base);
  await page
    .getByRole("button", { name: "Take flight", exact: true })
    .waitFor();
  await page.waitForFunction(
    () =>
      document.querySelector(".world-entered") &&
      getComputedStyle(document.querySelector(".world-stage")).opacity === "1",
  );
  await sample("overview");
  await page.getByRole("button", { name: "Take flight", exact: true }).click();
  await page.waitForFunction(
    () =>
      document.querySelector('canvas[data-scene="isaacs-world"]').dataset
        .cameraTravel === "idle",
  );
  await page.keyboard.down("w");
  await page.waitForTimeout(1000);
  await sample("flight");
  await page.keyboard.up("w");
  await page.goto(`${base}/#adventure`);
  await page.locator('canvas[data-board-ready="true"]').waitFor();
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".travel-board-canvas"))
        .opacity === "1",
  );
  await page.waitForTimeout(1000);
  await sample("boardIdle");
  const rect = await page
    .getByRole("button", { name: "Slide the hanging basketball", exact: true })
    .boundingBox();
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.down();
  await sample("boardDrag", async () => {
    for (let i = 0; i < 60; i++) {
      await page.mouse.move(
        rect.x + rect.width / 2 + Math.sin(i * 0.2) * 25,
        rect.y + rect.height / 2,
      );
      await page.waitForTimeout(50);
    }
  });
  await page.mouse.up();
  const output = process.env.OUTPUT || "artifacts/performance/rendering.json";
  await mkdir("artifacts/performance", { recursive: true });
  await writeFile(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
