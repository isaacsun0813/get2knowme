import { expect, test } from "@playwright/test";

for (const [name, viewport] of Object.entries({
  compact: { width: 375, height: 667 },
  standard: { width: 390, height: 844 },
  large: { width: 430, height: 932 },
  landscape: { width: 844, height: 390 },
})) {
  test(`iPhone ${name}: touch flight and direct page access fit the screen`, async ({
    page,
  }, info) => {
    test.skip(info.project.name !== "iphone", "iPhone WebKit touch profile");
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize(viewport);
    await page.goto("/");
    const fly = page.getByRole("button", { name: "Take flight", exact: true });
    await expect(fly).toBeEnabled({ timeout: 30_000 });
    await expect(page.locator(".world-stage")).toHaveCSS("opacity", "1");
    await page.screenshot({ path: info.outputPath(`${name}-world.png`) });
    await fly.tap();
    const forward = page.getByRole("button", { name: "Glide forward" });
    await expect(forward).toBeVisible();
    const bounds = (await forward.boundingBox())!;
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height);
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    const status = page.getByTestId("flight-status");
    const start = await status.getAttribute("data-position");
    await forward.tap();
    await page.mouse.move(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
    );
    await page.mouse.down();
    await expect
      .poll(() => status.getAttribute("data-position"))
      .not.toBe(start);
    await expect
      .poll(async () => Number(await status.getAttribute("data-speed")))
      .toBeGreaterThan(1);
    await page.mouse.up();
    await expect(
      page.locator('canvas[data-scene="isaacs-world"]'),
    ).toHaveAttribute("data-camera-travel", "idle");
    await page.screenshot({ path: info.outputPath(`${name}-flight.png`) });
    await page.getByRole("button", { name: "Explore", exact: true }).tap();
    await expect(
      page.getByRole("button", { name: "Inspect Zurich" }),
    ).toBeHidden();
    await page
      .getByRole("button", { name: "Open Projects", exact: true })
      .tap();
    await expect(page).toHaveURL(/#projects$/);
    await expect(
      page.getByRole("heading", { name: "Things I'm building." }),
    ).toBeVisible();
    await page.screenshot({ path: info.outputPath(`${name}-projects.png`) });
    expect(
      await page.evaluate(() => ({
        horizontal: document.documentElement.scrollWidth > innerWidth,
        vertical: document.documentElement.scrollHeight > innerHeight,
      })),
    ).toEqual({ horizontal: false, vertical: false });
    await page.getByRole("button", { name: "Close page", exact: true }).tap();
    await expect(
      page.getByRole("button", { name: "Explore", exact: true }),
    ).toBeFocused();
    expect(errors).toEqual([]);
  });
}
