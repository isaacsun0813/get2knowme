import { chromium, devices } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const target = new URL(process.argv[2] || "http://127.0.0.1:3107");
if (!["http:", "https:"].includes(target.protocol))
  throw new Error("Use an HTTP or HTTPS URL");
const output = path.resolve(process.argv[3] || "artifacts/inspection");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: !process.env.HEADED });

try {
  for (const [name, options] of Object.entries({
    desktop: { viewport: { width: 1440, height: 1000 } },
    mobile: devices["Pixel 7"],
  })) {
    const context = await browser.newContext({
      ...options,
      serviceWorkers: "block",
    });
    const page = await context.newPage();
    const errors = [];
    const failedRequests = [];
    const badResponses = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("requestfailed", (request) =>
      failedRequests.push({
        url: request.url(),
        error: request.failure()?.errorText,
      }),
    );
    page.on("response", (response) => {
      if (response.status() >= 400)
        badResponses.push({ url: response.url(), status: response.status() });
    });
    const response = await page.goto(target.href, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await page
      .locator("button, a[href], h1")
      .first()
      .waitFor({ state: "visible", timeout: 30_000 });
    if (process.env.WAIT_FOR)
      await page
        .locator(process.env.WAIT_FOR)
        .waitFor({ state: "visible", timeout: 30_000 });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: path.join(output, `${name}-entry.png`),
      fullPage: true,
    });
    const action =
      process.env[`CLICK_${name.toUpperCase()}_BUTTON`] ||
      process.env.CLICK_BUTTON;
    if (action) {
      await page.getByRole("button", { name: action, exact: true }).click();
      await page.waitForTimeout(2500);
      await page.screenshot({
        path: path.join(output, `${name}-action.png`),
        fullPage: true,
      });
    }
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const metrics = await page.evaluate(() => ({
      title: document.title,
      url: location.href,
      viewport: {
        width: innerWidth,
        height: innerHeight,
        dpr: devicePixelRatio,
      },
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      canvases: Array.from(document.querySelectorAll("canvas"), (canvas) => {
        const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
        return {
          width: canvas.width,
          height: canvas.height,
          webgl: !!gl,
          contextLost: gl?.isContextLost() ?? null,
        };
      }),
      resources: performance.getEntriesByType("resource").map((entry) => ({
        name: entry.name,
        duration: entry.duration,
        transferSize: entry.transferSize,
      })),
    }));
    const report = {
      status: response?.status(),
      metrics,
      errors,
      failedRequests,
      badResponses,
      accessibility: accessibility.violations,
    };
    await writeFile(
      path.join(output, `${name}.json`),
      JSON.stringify(report, null, 2),
    );
    console.log(
      `${name}: HTTP ${report.status}; ${errors.length} errors; ${accessibility.violations.length} accessibility findings; screenshots and JSON in ${output}`,
    );
    await context.close();
  }
} finally {
  await browser.close();
}
