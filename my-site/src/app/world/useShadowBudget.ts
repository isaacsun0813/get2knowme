import { useEffect, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { DirectionalLight } from "three";

export function useShadowBudget(
  light: RefObject<DirectionalLight | null>,
  resolution: number,
  refreshRate: number,
) {
  const elapsed = useRef(0);
  const { invalidate } = useThree();

  useEffect(() => {
    const shadow = light.current?.shadow;
    if (!shadow) return;
    shadow.map?.setSize(resolution, resolution);
    shadow.needsUpdate = true;
    invalidate();
  }, [light, resolution, invalidate]);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (elapsed.current < 1 / refreshRate || !light.current) return;
    light.current.shadow.needsUpdate = true;
    elapsed.current %= 1 / refreshRate;
  });
}
