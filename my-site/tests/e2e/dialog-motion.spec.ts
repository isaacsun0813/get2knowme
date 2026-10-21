import { expect, test } from "@playwright/test";

test("a photo expands from its print and returns before restoring focus", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const original = Element.prototype.animate;
    Element.prototype.animate = function (
      ...args: Parameters<typeof original>
    ) {
      const animation = original.apply(this, args);
      if (this.classList.contains("motion-dialog")) animation.pause();
      return animation;
    };
  });
  let releasePhoto = () => {};
  const photoGate = new Promise<void>((resolve) => {
    releasePhoto = resolve;
  });
  await page.route("**/_next/image?*", async (route) => {
    await photoGate;
    await route.continue();
  });
  await page.goto("/#adventure");
  await expect(
    page.getByRole("group", { name: "Travel photo board" }),
  ).toHaveAttribute("data-renderer", "3d", { timeout: 30_000 });
  const photo = page.getByRole("button", {
    name: "View Stoos photograph",
    exact: true,
  });
  await photo.scrollIntoViewIfNeeded();
  const source = (await photo.boundingBox())!;
  await photo.click();
  const dialog = page.getByRole("dialog", { name: "Travel photograph" });
  await expect(dialog).toHaveAttribute("data-motion", "entering");
  const start = (await dialog.boundingBox())!;
  expect(
    Math.abs(start.x + start.width / 2 - source.x - source.width / 2),
  ).toBeLessThan(3);
  expect(
    Math.abs(start.y + start.height / 2 - source.y - source.height / 2),
  ).toBeLessThan(3);
  await dialog.evaluate((element) => {
    const animation = element
      .getAnimations()
      .find((item) =>
        (item.effect as KeyframeEffect)
          .getKeyframes()
          .some((frame) => frame.transform),
      )!;
    animation.currentTime = 140;
  });
  const middle = (await dialog.boundingBox())!;
  const image = dialog.locator(".adventure-large-photo img");
  expect(
    await image.evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    ),
  ).not.toBe("none");
  releasePhoto();
  await image.evaluate((element: HTMLImageElement) => element.decode());
  await page.screenshot({ path: info.outputPath("photo-pulling-closer.png") });
  await dialog.evaluate((element) => {
    element
      .getAnimations()
      .find((item) =>
        (item.effect as KeyframeEffect)
          .getKeyframes()
          .some((frame) => frame.transform),
      )!
      .finish();
  });
  await expect(dialog).toHaveAttribute("data-motion", "open");
  const end = (await dialog.boundingBox())!;
  expect(middle.width).toBeGreaterThan(start.width);
  expect(middle.width).toBeLessThan(end.width);
  await dialog.getByRole("button", { name: /Back to the board/ }).click();
  await expect(dialog).toHaveAttribute("data-motion", "closing");
  await expect(
    dialog.getByRole("heading", { name: "Stoos", exact: true }),
  ).toBeVisible();
  await dialog.evaluate((element) => {
    const animation = element
      .getAnimations()
      .find((item) =>
        (item.effect as KeyframeEffect)
          .getKeyframes()
          .some((frame) => frame.transform),
      )!;
    animation.currentTime = 110;
  });
  await page.screenshot({
    path: info.outputPath("photo-returning-to-board.png"),
  });
  await dialog.evaluate((element) => {
    element
      .getAnimations()
      .find((item) =>
        (item.effect as KeyframeEffect)
          .getKeyframes()
          .some((frame) => frame.transform),
      )!
      .finish();
  });
  await expect(dialog).not.toBeVisible();
  await expect(photo).toBeFocused();
  await photo.click();
  await dialog.evaluate((element) => {
    element
      .getAnimations()
      .find((item) =>
        (item.effect as KeyframeEffect)
          .getKeyframes()
          .some((frame) => frame.transform),
      )!.currentTime = 80;
  });
  const interrupted = (await dialog.boundingBox())!;
  await dialog
    .getByRole("button", { name: /Back to the board/ })
    .dispatchEvent("click", { detail: 1 });
  await expect(dialog).toHaveAttribute("data-motion", "closing");
  const reversing = (await dialog.boundingBox())!;
  expect(Math.abs(reversing.width - interrupted.width)).toBeLessThan(3);
  await dialog.evaluate((element) => {
    element
      .getAnimations()
      .find((item) =>
        (item.effect as KeyframeEffect)
          .getKeyframes()
          .some((frame) => frame.transform),
      )!
      .finish();
  });
  await expect(dialog).not.toBeVisible();
});

test("photo navigation stays responsive and keyboard and reduced motion skip travel", async ({
  page,
}) => {
  await page.goto("/#adventure");
  const photo = page.getByRole("button", {
    name: "View Milan photograph",
    exact: true,
  });
  await photo.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Travel photograph" });
  await expect(dialog).toHaveAttribute("data-motion", "open");
  expect(
    await dialog.evaluate(
      (element) =>
        element
          .getAnimations()
          .filter(
            (item) =>
              item.effect instanceof KeyframeEffect &&
              item.effect.target === element &&
              item.effect.getKeyframes().some((frame) => frame.transform),
          ).length,
    ),
  ).toBe(0);
  await dialog.getByRole("button", { name: "Next photo", exact: true }).click();
  await expect(dialog.locator(".adventure-large-photo")).toHaveAttribute(
    "data-turn",
    "1",
  );
  await dialog
    .getByRole("button", { name: "Previous photo", exact: true })
    .click();
  await expect(
    dialog.getByRole("heading", { name: "Milan", exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Next photo", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(dialog.locator(".adventure-large-photo")).toHaveAttribute(
    "data-turn",
    "0",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(photo).toBeFocused();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await photo.click();
  await expect(dialog).toHaveAttribute("data-motion", "open");
  expect(
    await dialog.evaluate(
      (element) =>
        element
          .getAnimations({ subtree: true })
          .filter(
            (item) =>
              item.effect instanceof KeyframeEffect &&
              (item.effect.target === element ||
                element.contains(item.effect.target)) &&
              item.playState === "running",
          ).length,
    ),
  ).toBe(0);
  await dialog.getByRole("button", { name: /Back to the board/ }).click();
  await expect(dialog).not.toBeVisible();
  await expect(photo).toBeFocused();
});
