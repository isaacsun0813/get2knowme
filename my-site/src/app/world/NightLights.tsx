"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function NightLights({
  sun,
  paused,
  reducedMotion,
  flying,
}: {
  sun: THREE.Vector3;
  paused: boolean;
  reducedMotion: boolean;
  flying: boolean;
}) {
  const data = useLoader(
    THREE.FileLoader,
    "/models/night-lights.bin",
    (loader) => {
      loader.setResponseType("arraybuffer");
    },
  ) as ArrayBuffer;
  const { invalidate, gl } = useThree();
  const geometry = useMemo(() => {
    const buffer = new THREE.InterleavedBuffer(new Float32Array(data), 5);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.InterleavedBufferAttribute(buffer, 3, 0),
    );
    geometry.setAttribute(
      "phase",
      new THREE.InterleavedBufferAttribute(buffer, 1, 3),
    );
    geometry.setAttribute(
      "size",
      new THREE.InterleavedBufferAttribute(buffer, 1, 4),
    );
    return geometry;
  }, [data]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          sun: { value: sun },
          time: { value: 0 },
          pixelRatio: { value: 1 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
      uniform vec3 sun;
      uniform float pixelRatio;
      attribute float phase;
      attribute float size;
      varying float night;
      varying float seed;
      varying float burst;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.);
        vec4 view = viewMatrix * world;
        night = 1. - smoothstep(-.22, .04, dot(normalize(world.xyz), sun));
        seed = phase;
        burst = step(3., size);
        gl_PointSize = min(18., size * pixelRatio * 200. / -view.z);
        gl_Position = projectionMatrix * view;
      }
    `,
        fragmentShader: `
      uniform float time;
      varying float night;
      varying float seed;
      varying float burst;
      void main() {
        vec2 p = (gl_PointCoord - .5) * 2.;
        float radius = length(p);
        float glow = exp(-radius * radius * 7.);
        float core = exp(-radius * radius * 55.);
        float rays = exp(-min(abs(p.x), abs(p.y)) * 35.) * pow(max(0., 1. - radius), 2.);
        float shimmer = .78 + .22 * sin(time * .7 + seed);
        float alpha = night * shimmer * (glow * .22 + core * .65 + rays * burst * .3);
        if (alpha < .015) discard;
        gl_FragColor = vec4(mix(vec3(1., .57, .16), vec3(1., .91, .64), core), alpha);
      }
    `,
      }),
    [sun],
  );
  useFrame(({ clock }) => {
    material.uniforms.time.value = reducedMotion ? 0 : clock.elapsedTime;
    material.uniforms.pixelRatio.value = gl.getPixelRatio();
  });
  useEffect(() => {
    if (paused || reducedMotion || flying) return;
    const timer = window.setInterval(invalidate, 125);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, flying, invalidate]);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  return <points geometry={geometry} material={material} raycast={() => {}} />;
}
