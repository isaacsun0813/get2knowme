"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function createWind() {
  const context = new AudioContext();
  const noise = context.createBufferSource();
  const buffer = context.createBuffer(
    1,
    context.sampleRate * 8,
    context.sampleRate,
  );
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  noise.buffer = buffer;
  noise.loop = true;
  const highpass = context.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 100;
  const lowpass = context.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 650;
  lowpass.Q.value = 0.4;
  const gain = context.createGain();
  gain.gain.value = 0;
  noise
    .connect(highpass)
    .connect(lowpass)
    .connect(gain)
    .connect(context.destination);
  noise.start();
  return {
    context,
    level(speed: number | null) {
      const ratio = speed === null ? 0 : Math.min(1, Math.max(0, speed / 8));
      const volume =
        speed === null
          ? 0
          : (0.025 + 0.075 * ratio) *
            (0.94 + 0.06 * Math.sin(context.currentTime * 0.45));
      gain.gain.cancelScheduledValues(context.currentTime);
      gain.gain.setTargetAtTime(volume, context.currentTime, 0.18);
      lowpass.frequency.setTargetAtTime(
        650 + ratio * 600,
        context.currentTime,
        0.3,
      );
    },
    close() {
      noise.stop();
      void context.close();
    },
  };
}

export function useFlightWind(active: boolean, speed: number) {
  const wind = useRef<ReturnType<typeof createWind> | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const start = useCallback(() => {
    try {
      wind.current ??= createWind();
      void wind.current.context
        .resume()
        .then(() => setUnavailable(false))
        .catch(() => setUnavailable(true));
    } catch {
      setUnavailable(true);
    }
  }, []);
  const activate = useCallback(() => {
    if (enabled) start();
  }, [enabled, start]);
  useEffect(() => {
    let stop: ReturnType<typeof setTimeout> | undefined;
    const update = () => {
      clearTimeout(stop);
      if (active && enabled && !document.hidden) {
        wind.current?.level(speed);
        if (wind.current?.context.state === "suspended") {
          void wind.current.context.resume().catch(() => setUnavailable(true));
        }
      } else {
        wind.current?.level(null);
        stop = setTimeout(() => {
          void wind.current?.context.suspend();
        }, 1000);
      }
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => {
      clearTimeout(stop);
      document.removeEventListener("visibilitychange", update);
    };
  }, [active, enabled, speed]);
  useEffect(() => () => wind.current?.close(), []);
  return {
    enabled,
    unavailable,
    activate,
    toggle: () => {
      if (!enabled) start();
      setEnabled(!enabled);
    },
  };
}
