import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const notes = [
  ["About me", "Isaac Sun"],
  ["Projects", "Things I'm building."],
  ["Career", "the road so far"],
  ["Adventure", "A little further out."],
  ["Vibes", "i wanted to fly."],
] as const;

async function sceneReady(page: Page) {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Take flight", exact: true }),
  ).toBeEnabled({ timeout: 30_000 });
  await expect(page.locator('canvas[data-scene="isaacs-world"]')).toBeVisible();
  await expect(page.locator(".world-stage")).toHaveCSS("opacity", "1");
}

async function openNote(page: Page, name: string) {
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await page.getByRole("button", { name: `Open ${name}`, exact: true }).click();
}

function radius(position: string | null) {
  return Math.hypot(...(position || "").split(",").map(Number));
}

test("Enter opens the nearby page in flight without hijacking focused buttons", async ({
  page,
}) => {
  await sceneReady(page);
  const stage = (await page.locator(".world-stage").boundingBox())!;
  const main = (await page.locator(".world-main").boundingBox())!;
  expect(Math.abs(stage.height - main.height)).toBeLessThan(1);
  await expect(page.locator(".flight-bird")).toHaveCount(0);
  await page.getByRole("button", { name: "Take flight", exact: true }).click();
  const status = page.getByTestId("flight-status");
  const nearest = (await status.textContent())!.split(",")[0];
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`#${nearest}$`));
  await page.keyboard.press("Escape");
  const explore = page.getByRole("button", { name: "Explore", exact: true });
  await explore.focus();
  await page.keyboard.press("Enter");
  await expect(explore).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".journal-view")).toHaveCount(0);
});

test("the loading atlas gives way to a centered world with one notes menu", async ({
  page,
}) => {
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/models/sickEarthFile3.glb", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/");
  await expect(page.locator(".atlas-opening")).toBeVisible();
  await expect(page.locator(".atlas-opening")).toContainText(
    "a personal atlas,",
  );
  await expect(page.getByRole("navigation", { name: "Explore" })).toBeHidden();
  release();
  await expect(
    page.getByRole("button", { name: "Take flight", exact: true }),
  ).toBeEnabled({ timeout: 30_000 });
  await expect(page.locator(".atlas-opening")).toBeHidden();
  await expect(page.locator(".world-stage")).toHaveCSS("opacity", "1");
  const stage = (await page.locator(".world-stage").boundingBox())!;
  const canvas = (await page.locator("canvas[data-scene]").boundingBox())!;
  expect(Math.abs(canvas.width - stage.width)).toBeLessThan(1);
  expect(Math.abs(canvas.height - stage.height)).toBeLessThan(1);
  const alignment = await page
    .locator("canvas[data-scene]")
    .evaluate((element) => {
      const camera = element
        .getAttribute("data-camera-position")!
        .split(",")
        .map(Number);
      const pilot = element
        .getAttribute("data-flight-position")!
        .split(",")
        .map(Number);
      return (
        camera.reduce((sum, value, i) => sum + value * pilot[i], 0) /
        (Math.hypot(...camera) * Math.hypot(...pilot))
      );
    });
  expect(alignment).toBeGreaterThan(0.999);
  const toggle = page.getByRole("button", { name: "Explore", exact: true });
  await toggle.click();
  await expect(page.getByRole("navigation", { name: "Explore" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open About me", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("daylight changes with UTC and night lights appear on the dark land", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.setFixedTime(new Date("2026-03-20T20:00:00Z"));
  await sceneReady(page);
  const canvas = page.locator("canvas[data-scene]");
  const renderedColors = async () => {
    const screenshot = await canvas.screenshot();
    return page.evaluate(async (encoded) => {
      const image = new Image();
      image.src = `data:image/png;base64,${encoded}`;
      await image.decode();
      const sample = document.createElement("canvas");
      sample.width = image.width;
      sample.height = image.height;
      const context = sample.getContext("2d")!;
      context.drawImage(image, 0, 0);
      const { data } = context.getImageData(0, 0, sample.width, sample.height);
      let count = 0;
      let dark = 0;
      let sampled = 0;
      const radius = Math.min(sample.width, sample.height) * 0.3;
      for (let y = 0; y < sample.height; y++) {
        for (let x = Math.floor(sample.width / 2); x < sample.width; x++) {
          if (Math.hypot(x - sample.width / 2, y - sample.height / 2) > radius)
            continue;
          sampled++;
          const i = (y * sample.width + x) * 4;
          const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
          if (r > 180 && g > 130 && r > g * 1.03 && g > b * 1.5) count++;
          if (r < 30 && g < 30 && b < 40) dark++;
        }
      }
      return {
        lights: count,
        darkFraction: dark / sampled,
      };
    }, screenshot.toString("base64"));
  };
  const day = (await canvas.getAttribute("data-sun-direction"))!
    .split(",")
    .map(Number);
  expect(day[2]).toBeGreaterThan(0.8);
  const dayLights = (await renderedColors()).lights;
  await page.screenshot({ path: info.outputPath("daylight-noon.png") });
  await page.clock.setFixedTime(new Date("2026-03-21T08:00:00Z"));
  await page.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await expect
    .poll(async () =>
      Number((await canvas.getAttribute("data-sun-direction"))!.split(",")[2]),
    )
    .toBeLessThan(-0.8);
  await expect
    .poll(async () => (await renderedColors()).lights)
    .toBeGreaterThan(dayLights);
  expect((await renderedColors()).darkFraction).toBeLessThan(0.03);
  await page.screenshot({ path: info.outputPath("daylight-midnight.png") });
});

test("all field notes navigate, reflow, and return to the world", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  for (const [name, heading] of notes) {
    await openNote(page, name);
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator(".journal-view")).toHaveCSS("opacity", "1");
    await page.screenshot({
      path: info.outputPath(`${name.replaceAll(" ", "-")}.png`),
    });
    await page.getByRole("button", { name: "Close page", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test("free flight moves on the sphere, pauses, inspects, and lands in Zurich", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await sceneReady(page);
  await page.getByRole("button", { name: "Take flight", exact: true }).click();
  const status = page.getByTestId("flight-status");
  const start = await status.getAttribute("data-position");
  await page.keyboard.down("w");
  await expect
    .poll(async () => Number(await status.getAttribute("data-speed")))
    .toBeGreaterThan(1);
  await expect.poll(() => status.getAttribute("data-position")).not.toBe(start);
  await page.keyboard.down("d");
  await page.waitForTimeout(400);
  await expect
    .poll(async () =>
      Number(
        await page
          .locator("canvas[data-scene]")
          .getAttribute("data-flight-bank"),
      ),
    )
    .toBeGreaterThan(0.1);
  await page.keyboard.up("d");
  await page.keyboard.up("w");
  expect(radius(await status.getAttribute("data-position"))).toBeCloseTo(31, 2);
  await page.getByRole("button", { name: "Pause flight", exact: true }).click();
  await page.waitForTimeout(250);
  const stopped = await status.getAttribute("data-position");
  await page.waitForTimeout(350);
  expect(await status.getAttribute("data-position")).toBe(stopped);
  await page
    .getByRole("button", { name: "Resume flight", exact: true })
    .click();
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await page.getByText("Visit a place on the globe", { exact: true }).click();
  await page
    .getByRole("button", { name: "Inspect Zurich", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Zurich", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Land in the meadow", exact: true })
    .click();
  await expect(status).toHaveAttribute("data-landed", "true");
  expect(radius(await status.getAttribute("data-position"))).toBeLessThan(28);
  await page
    .getByRole("button", { name: "Take off again", exact: true })
    .click();
  await expect(status).toHaveAttribute("data-landed", "false");
  await expect
    .poll(async () => radius(await status.getAttribute("data-position")))
    .toBeGreaterThan(30.8);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Pause flight", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Take flight", exact: true }),
  ).toBeEnabled();
  const canvas = page.locator("canvas[data-scene]");
  await page.waitForTimeout(150);
  const beforeOrbit = await canvas.screenshot();
  const bounds = (await canvas.boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width / 2 + 90,
    bounds.y + bounds.height / 2,
    { steps: 10 },
  );
  await page.mouse.up();
  await expect
    .poll(async () => beforeOrbit.equals(await canvas.screenshot()))
    .toBe(false);
  expect(errors).toEqual([]);
});

test("Codi moves in the Saratoga yard and rests with reduced motion", async ({
  page,
}, info) => {
  await sceneReady(page);
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await page.getByText("Visit a place on the globe", { exact: true }).click();
  await page
    .getByRole("button", { name: "Inspect Saratoga", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Saratoga", exact: true }),
  ).toBeVisible();
  const canvas = page.locator("canvas[data-scene]");
  const time = () => canvas.getAttribute("data-codi-time");
  await expect.poll(async () => Number(await time())).toBeGreaterThan(0.3);
  const start = await time();
  await expect.poll(time).not.toBe(start);
  await page.screenshot({ path: info.outputPath("codi-yard.png") });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(200);
  const resting = await time();
  const ambient = await canvas.getAttribute("data-ambient-time");
  await page.waitForTimeout(300);
  expect(await time()).toBe(resting);
  expect(await canvas.getAttribute("data-ambient-time")).toBe(ambient);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(time).not.toBe(resting);
});

test("camera travels into flight and back around the globe, with an immediate reduced-motion alternative", async ({
  page,
}, info) => {
  await sceneReady(page);
  const canvas = page.locator("canvas[data-scene]");
  const position = () => canvas.getAttribute("data-camera-position");
  const overview = await position();
  await page.getByRole("button", { name: "Take flight", exact: true }).click();
  await expect(canvas).toHaveAttribute("data-camera-travel", "moving");
  await expect.poll(position).not.toBe(overview);
  await page.screenshot({
    path: info.outputPath("camera-entering-flight.png"),
  });
  await expect(canvas).toHaveAttribute("data-camera-travel", "idle");
  const close = await position();
  await page.keyboard.press("Escape");
  await expect(canvas).toHaveAttribute("data-camera-travel", "moving");
  await expect.poll(position).not.toBe(close);
  await expect(canvas).toHaveAttribute("data-camera-travel", "idle");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Take flight", exact: true }).click();
  await expect(canvas).toHaveAttribute("data-camera-travel", "idle");
});

test("photo board and project sketches open usable details without closing the journal", async ({
  page,
}) => {
  await page.goto("/#adventure");
  await page
    .getByRole("button", { name: "View Milan photograph", exact: true })
    .click();
  const photo = page.getByRole("dialog", { name: "Travel photograph" });
  await expect(photo.getByRole("heading", { name: "Milan" })).toBeVisible();
  await photo.getByRole("button", { name: "Next photo", exact: true }).click();
  await expect(photo.getByRole("heading", { name: "Zurich" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(photo).not.toBeVisible();
  await expect(
    page.getByRole("heading", { name: "A little further out.", exact: true }),
  ).toBeVisible();
  await openNote(page, "Projects");
  const sketches = page.locator(".project-sketchbook button");
  await expect(sketches).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    await sketches.nth(i).click();
    const detail = page.getByRole("dialog", { name: "Project details" });
    await expect(detail).toBeVisible();
    await expect(detail.getByRole("heading")).toBeVisible();
    if (i === 3)
      await expect(
        detail.getByRole("link", { name: "Visit Verdra" }),
      ).toHaveAttribute("href", "https://verdratech.github.io/Verdra-Site/");
    await page.keyboard.press("Escape");
    await expect(detail).not.toBeVisible();
  }
  await expect(
    page.getByRole("heading", { name: "Things I'm building.", exact: true }),
  ).toBeVisible();
});

test("direct links, back navigation, keyboard close, and the career goal work", async ({
  page,
}) => {
  await page.goto("/#career");
  await expect(
    page.getByRole("heading", { name: "the road so far" }),
  ).toBeVisible();
  await expect(
    page.getByText("Find where robotics and climate solutions align.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".career-date")).toHaveCount(0);
  await expect(page.locator(".career-goals")).toHaveCount(0);
  await expect(
    page.getByText("A semester at ETH Zurich.", { exact: true }),
  ).toBeVisible();
  await openNote(page, "Vibes");
  await expect(page).toHaveURL(/#vibes$/);
  await page.goBack();
  await expect(page).toHaveURL(/#career$/);
  await expect(
    page.getByRole("heading", { name: "the road so far" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Close page" })).toHaveCount(0);
});

test("no WebGL and failed model loads leave the notes accessible", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).includes("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "A little less 3D. The same little world.",
    }),
  ).toBeVisible();
  await openNote(page, "About me");
  await expect(
    page.getByRole("heading", { name: "Isaac Sun", exact: true }),
  ).toBeVisible();
  await openNote(page, "Adventure");
  await expect(
    page.getByRole("group", { name: "Travel photo board" }),
  ).toHaveAttribute("data-renderer", "still");
  await page
    .getByRole("button", { name: "View Milan photograph", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Travel photograph" }),
  ).toBeVisible();
});

test("model failure can recover and GPU context loss displays the fallback", async ({
  page,
}) => {
  await page.route("**/models/sickEarthFile3.glb", (route) => route.abort());
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "A little less 3D. The same little world.",
    }),
  ).toBeVisible();
  await page.unroute("**/models/sickEarthFile3.glb");
  await page
    .getByRole("button", { name: "Try the globe again", exact: true })
    .click();
  await expect(page.locator("canvas[data-scene]")).toBeVisible();
  await page.locator("canvas[data-scene]").evaluate((element) => {
    if (!(element instanceof HTMLCanvasElement))
      throw new Error("Canvas missing");
    const gl = element.getContext("webgl2");
    const extension = gl?.getExtension("WEBGL_lose_context");
    if (!extension) throw new Error("Context loss extension unavailable");
    extension.loseContext();
  });
  await expect(
    page.getByRole("heading", {
      name: "A little less 3D. The same little world.",
    }),
  ).toBeVisible();
});

test("night-light asset failure can recover to a usable globe", async ({
  page,
}) => {
  await page.route("**/models/night-lights.bin", (route) => route.abort());
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "A little less 3D. The same little world.",
    }),
  ).toBeVisible();
  await page.unroute("**/models/night-lights.bin");
  await page
    .getByRole("button", { name: "Try the globe again", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Take flight", exact: true }),
  ).toBeEnabled({ timeout: 30_000 });
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await page.getByText("Visit a place on the globe", { exact: true }).click();
  await page
    .getByRole("button", { name: "Inspect Zurich", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Zurich", exact: true }),
  ).toBeVisible();
});

test("world and each note pass automated accessibility checks", async ({
  page,
}) => {
  await sceneReady(page);
  for (const note of [null, ...notes.map(([name]) => name)]) {
    if (note) await openNote(page, note);
    if (note)
      await expect(
        page.getByRole("heading", {
          name: notes.find(([name]) => name === note)![1],
          exact: true,
        }),
      ).toBeVisible();
    if (note)
      await expect(page.locator(".journal-view")).toHaveCSS("opacity", "1");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        targets: v.nodes.map((n) => n.target),
      })),
      note || "world",
    ).toEqual([]);
  }
});

test("reduced motion keeps navigation and the travel viewer usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#adventure");
  await page
    .getByRole("button", { name: "View Milan photograph", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Travel photograph" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Close page", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Take flight", exact: true }),
  ).toBeVisible();
});

test("Chicago landmark asset can retry and its inspection opens Career", async ({
  page,
}) => {
  await page.route("**/models/chicago-landmark.glb", (route) => route.abort());
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "A little less 3D. The same little world.",
    }),
  ).toBeVisible();
  await page.unroute("**/models/chicago-landmark.glb");
  await page
    .getByRole("button", { name: "Try the globe again", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Take flight", exact: true }),
  ).toBeEnabled({ timeout: 30_000 });
  await expect(page.locator(".atlas-opening")).toBeHidden();
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await page
    .locator("summary")
    .filter({ hasText: "Visit a place on the globe" })
    .click();
  await page
    .getByRole("button", { name: "Inspect Chicago", exact: true })
    .click();
  await page.getByRole("button", { name: "Open Career", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "the road so far", exact: true }),
  ).toBeVisible();
});
