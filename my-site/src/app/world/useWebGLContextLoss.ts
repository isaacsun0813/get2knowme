import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

export function useWebGLContextLoss(onError: () => void) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onError]);
}
