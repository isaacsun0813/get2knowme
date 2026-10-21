export function installRenderProbe({ weak = false } = {}) {
  if (weak) {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 4 });
    Object.defineProperty(navigator, "deviceMemory", { get: () => 4 });
  }
  let frame = 0;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (fn) =>
    raf((t) => {
      frame = t;
      fn(t);
    });
  const stats = new Map();
  function record(context) {
    if (!stats.has(context))
      stats.set(context, {
        context,
        frames: new Set(),
        draws: 0,
        offscreen: 0,
        offscreenPasses: 0,
        offscreenSize: 0,
        maxTextureSize: 0,
        bound: false,
      });
    return stats.get(context);
  }
  for (const type of [WebGLRenderingContext, WebGL2RenderingContext]) {
    for (const name of [
      "drawArrays",
      "drawElements",
      "drawArraysInstanced",
      "drawElementsInstanced",
    ]) {
      const original = type.prototype[name];
      if (!original) continue;
      type.prototype[name] = function (...args) {
        const stat = record(this);
        stat.frames.add(frame);
        stat.draws++;
        if (stat.bound) stat.offscreen++;
        return original.apply(this, args);
      };
    }
    const bind = type.prototype.bindFramebuffer;
    type.prototype.bindFramebuffer = function (target, buffer) {
      const stat = record(this);
      stat.bound = !!buffer;
      if (buffer) stat.offscreenPasses++;
      return bind.call(this, target, buffer);
    };
    const viewport = type.prototype.viewport;
    type.prototype.viewport = function (x, y, width, height) {
      const stat = record(this);
      if (stat.bound) stat.offscreenSize = Math.max(width, height);
      return viewport.call(this, x, y, width, height);
    };
    const texture = type.prototype.texImage2D;
    type.prototype.texImage2D = function (...args) {
      const source = args.length === 6 ? args[5] : null;
      const size = source
        ? Math.max(source.width, source.height)
        : Math.max(args[3], args[4]);
      const stat = record(this);
      if (Number.isFinite(size))
        stat.maxTextureSize = Math.max(stat.maxTextureSize, size);
      return texture.apply(this, args);
    };
  }
  window.renderProbe = {
    reset() {
      for (const s of stats.values()) {
        s.frames.clear();
        s.draws = 0;
        s.offscreen = 0;
        s.offscreenPasses = 0;
      }
    },
    read() {
      return Array.from(stats.values())
        .filter((s) => s.context.canvas.dataset.scene)
        .map((s) => ({
          scene: s.context.canvas.dataset.scene,
          width: s.context.drawingBufferWidth,
          height: s.context.drawingBufferHeight,
          frames: s.frames.size,
          draws: s.draws,
          offscreenDraws: s.offscreen,
          offscreenPasses: s.offscreenPasses,
          offscreenSize: s.offscreenSize,
          maxTextureSize: s.maxTextureSize,
          drawsPerFrame: s.draws / Math.max(1, s.frames.size),
          offscreenPerFrame: s.offscreen / Math.max(1, s.frames.size),
        }));
    },
  };
}
