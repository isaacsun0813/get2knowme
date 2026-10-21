import { expect, test, type Page } from "@playwright/test";

type WindProbe = {
  context: AudioContext;
  gain?: GainNode;
  meter?: AnalyserNode;
};
type ProbedWindow = Window & { windProbe?: WindProbe };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    const target = window as ProbedWindow;
    window.AudioContext = class extends Native {
      constructor(options?: AudioContextOptions) {
        super(options);
        target.windProbe = { context: this };
      }
      override createGain() {
        const gain = super.createGain();
        const connect = gain.connect.bind(gain);
        gain.connect = ((
          destination: AudioNode | AudioParam,
          ...ports: number[]
        ) => {
          if (destination === this.destination) {
            const meter = super.createAnalyser();
            meter.fftSize = 2048;
            connect(meter);
            meter.connect(destination);
            target.windProbe!.gain = gain;
            target.windProbe!.meter = meter;
            return destination;
          }
          return Reflect.apply(connect, gain, [destination, ...ports]);
        }) as typeof gain.connect;
        return gain;
      }
    };
  });
});

function rms(page: Page) {
  return page.evaluate(() => {
    const meter = (window as ProbedWindow).windProbe?.meter;
    if (!meter) return 0;
    const samples = new Float32Array(meter.fftSize);
    meter.getFloatTimeDomainData(samples);
    return Math.sqrt(
      samples.reduce((sum, sample) => sum + sample * sample, 0) /
        samples.length,
    );
  });
}

test("keyboard flight starts audible wind from a fresh load", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Take flight", exact: true }),
  ).toBeEnabled();
  expect(await page.evaluate(() => !!(window as ProbedWindow).windProbe)).toBe(
    false,
  );
  await page.keyboard.down("w");
  await expect
    .poll(async () =>
      Number(
        await page.getByTestId("flight-status").getAttribute("data-speed"),
      ),
    )
    .toBeGreaterThan(1);
  await expect.poll(() => rms(page)).toBeGreaterThan(0.0001);
  await page.keyboard.up("w");
});

test("flight wind is audible, follows speed, mutes and fades on pause without requesting music", async ({
  page,
}) => {
  const tracks: string[] = [];
  page.on("request", (request) => {
    if (/\.mp3|\/audio\//.test(request.url())) tracks.push(request.url());
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Take flight", exact: true }),
  ).toBeEnabled();
  expect(await page.evaluate(() => !!(window as ProbedWindow).windProbe)).toBe(
    false,
  );
  await expect(page.locator("audio")).toHaveCount(0);
  await page.getByRole("button", { name: "Take flight", exact: true }).click();
  const volume = () =>
    page.evaluate(
      () => (window as ProbedWindow).windProbe?.gain?.gain.value || 0,
    );
  await expect.poll(() => rms(page)).toBeGreaterThan(0.0001);
  await page.waitForTimeout(350);
  const idle = await rms(page);
  await page.keyboard.down("w");
  await expect
    .poll(async () =>
      Number(
        await page.getByTestId("flight-status").getAttribute("data-speed"),
      ),
    )
    .toBeGreaterThan(5);
  await expect.poll(() => rms(page)).toBeGreaterThan(idle * 1.5);
  await page.getByRole("button", { name: "Mute wind", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Enable wind", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect.poll(volume).toBeLessThan(0.001);
  await page.getByRole("button", { name: "Enable wind", exact: true }).click();
  await expect.poll(volume).toBeGreaterThan(0.03);
  await page.getByRole("button", { name: "Pause flight", exact: true }).click();
  await page.keyboard.up("w");
  await expect.poll(volume).toBeLessThan(0.001);
  const audioState = () =>
    page.evaluate(() => (window as ProbedWindow).windProbe?.context.state);
  await expect.poll(audioState).toBe("suspended");
  await page.keyboard.press("a");
  await page.waitForTimeout(300);
  expect(await audioState()).toBe("suspended");
  await page.keyboard.press("Escape");
  expect(tracks).toEqual([]);
});
