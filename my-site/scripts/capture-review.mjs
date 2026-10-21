import { chromium, webkit } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const base = process.env.BASE_URL || "http://127.0.0.1:3107";
const folder = "artifacts/review";
await mkdir(folder, { recursive: true });
const pages = {
  about: "Isaac Sun",
  adventure: "A little further out.",
  projects: "Things I'm building.",
  career: "the road so far",
  vibes: "i wanted to fly.",
};
for (const [engine, launcher] of Object.entries({ chromium, webkit })) {
  const browser = await launcher.launch();
  try {
    for (const [device, viewport] of Object.entries({
      desktop: { width: 1440, height: 1000 },
      phone: { width: 390, height: 844 },
    })) {
      const page = await browser.newPage({
        viewport,
        deviceScaleFactor: 1,
        serviceWorkers: "block",
      });
      await page.goto(base, { waitUntil: "domcontentloaded" });
      await page.locator("canvas[data-scene]").waitFor({ timeout: 30_000 });
      await page.waitForFunction(
        () =>
          getComputedStyle(document.querySelector(".world-stage")).opacity ===
            "1" && document.querySelector(".world-entered"),
      );
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: `${folder}/${engine}-${device}-world.png`,
      });
      for (const [id, heading] of Object.entries(pages)) {
        await page.goto(`${base}/#${id}`, { waitUntil: "domcontentloaded" });
        await page
          .getByRole("heading", { name: heading, exact: true })
          .waitFor();
        await page.waitForFunction(() => {
          const element = document.querySelector(".journal-view");
          return element && getComputedStyle(element).opacity === "1";
        });
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({
          path: `${folder}/${engine}-${device}-${id}.png`,
        });
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
console.log(`Review screenshots saved to ${folder}`);
