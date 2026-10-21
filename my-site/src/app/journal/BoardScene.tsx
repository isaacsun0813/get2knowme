"use client";

import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Group,
  Mesh,
  MathUtils,
  OrthographicCamera,
  ShadowMaterial,
  type DirectionalLight,
} from "three";
import { useShadowBudget } from "../world/useShadowBudget";
import {
  boardObjects,
  boardViews,
  plantPositions,
  type BoardMotion,
} from "./board-layout";
import { useWebGLContextLoss } from "../world/useWebGLContextLoss";
import { isLimitedHardware } from "../world/render-quality";
import { usePageVisibility } from "../usePageVisibility";

type Props = {
  motion: RefObject<BoardMotion>;
  redraw: RefObject<(() => void) | null>;
  onReady: () => void;
  onError: () => void;
  reducedMotion: boolean;
  active: boolean;
  economy?: boolean;
};

function BoardModel({
  motion,
  redraw,
  onReady,
  reducedMotion,
  active,
  economy,
}: Props) {
  const { scene } = useGLTF("/models/travel-board.glb");
  const { camera, size, invalidate, gl } = useThree();
  const ambientTime = useRef(0);
  const copy = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = object.name !== "Wall";
        object.receiveShadow = true;
        if (object.name === "Wall") {
          object.material = new ShadowMaterial({ opacity: 0.16 });
          return;
        }
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        object.material = materials.map((material) => {
          const clonedMaterial = material.clone();
          if (material.name.startsWith("Original photograph"))
            clonedMaterial.toneMapped = false;
          return clonedMaterial;
        });
        if (object.material.length === 1) object.material = object.material[0];
      }
    });
    for (const item of boardObjects) {
      if (item.topMount === undefined) continue;
      const object = cloned.getObjectByName(item.name)!;
      const mount = new Group();
      mount.name = `${item.name}Mount`;
      mount.position.copy(object.position);
      mount.position.y += item.topMount;
      object.parent!.add(mount);
      mount.add(object);
      object.position.set(0, -item.topMount, 0);
    }
    return cloned;
  }, [scene]);
  const objects = useMemo(
    () =>
      boardObjects.map((item) => {
        const object = copy.getObjectByName(
          item.topMount === undefined ? item.name : `${item.name}Mount`,
        )!;
        return {
          item,
          object,
          home: object.position.clone(),
          rotation: object.rotation.clone(),
          scale: object.scale.clone(),
        };
      }),
    [copy],
  );

  useLayoutEffect(() => {
    const phone = size.width <= 600;
    const view = phone ? boardViews.phone : boardViews.desktop;
    const cam = camera as OrthographicCamera;
    cam.left = -view.width / 2;
    cam.right = view.width / 2;
    cam.top = view.height / 2;
    cam.bottom = -view.height / 2;
    cam.position.set(0, 0, 15);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
    for (const { item, object, home } of objects) {
      const [x, y] = phone ? item.phone : item.desktop;
      home.set(x, y + (item.topMount ?? 0), home.z);
      object.position.copy(home);
    }
    copy.getObjectByName("CanvasBoardLandscape")!.visible = !phone;
    copy.getObjectByName("CanvasBoardPortrait")!.visible = phone;
    const [plantX, plantY] = phone
      ? plantPositions.phone
      : plantPositions.desktop;
    copy.getObjectByName("Succulent")!.position.set(plantX, plantY, 0.3);
    copy
      .getObjectByName("Vine")!
      .position.set(phone ? -2.88 : -5.1, phone ? 3.5 : 0.5, 0.1);
    invalidate();
  }, [camera, copy, invalidate, objects, size.width]);

  useEffect(() => {
    redraw.current = invalidate;
    gl.domElement.dataset.scene = "travel-board";
    gl.domElement.dataset.boardReady = "true";
    gl.domElement.dataset.boardMeshes = String(
      copy.children.reduce((count, root) => {
        root.traverse((part) => {
          if (part instanceof Mesh) count++;
        });
        return count;
      }, 0),
    );
    onReady();
    return () => {
      redraw.current = null;
    };
  }, [copy, gl, invalidate, onReady, redraw]);

  useEffect(
    () => () => {
      copy.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => material.dispose());
      });
    },
    [copy],
  );

  useEffect(() => {
    invalidate();
    if (!active || reducedMotion) return;
    const timer = window.setInterval(invalidate, 1000 / (economy ? 12 : 24));
    return () => window.clearInterval(timer);
  }, [active, reducedMotion, economy, invalidate]);

  useFrame((_, delta) => {
    if (!active) return;
    if (!reducedMotion) ambientTime.current += Math.min(delta, 0.1);
    const time = reducedMotion ? 0 : ambientTime.current;
    gl.domElement.dataset.boardMotionTime = time.toFixed(3);
    const dt = Math.min(delta, 0.05);
    let moving = false;
    let displacement = 0;
    for (const [
      index,
      { item, object, home, rotation, scale },
    ] of objects.entries()) {
      const target = motion.current.get(item.name);
      const x = home.x + (target?.x || 0);
      const y = home.y + (target?.y || 0);
      const emphasized = !reducedMotion && (target?.held || target?.hovered);
      const sway =
        reducedMotion || target?.held
          ? 0
          : Math.sin(time * 0.85 + index * 1.7) *
            (item.photo === undefined ? 0.045 : 0.024);
      const z = home.z + (emphasized ? 0.28 : 0);
      const tilt = rotation.z - (target?.x || 0) * 0.18 + sway;
      const tiltX =
        rotation.x + (target?.y || 0) * 0.65 + (emphasized ? -0.055 : 0);
      const tiltY =
        rotation.y +
        (target?.x || 0) * (item.name === "Basketball" ? 1.8 : 0.9) +
        (reducedMotion
          ? 0
          : Math.sin(time * 0.65 + index) *
            (item.name === "Basketball" ? 0.1 : 0.025));
      const rate = reducedMotion ? 1000 : target?.held ? 24 : 11;
      const zoom = emphasized && item.photo !== undefined ? 1.045 : 1;
      object.scale.x = MathUtils.damp(object.scale.x, scale.x * zoom, rate, dt);
      object.scale.y = MathUtils.damp(object.scale.y, scale.y * zoom, rate, dt);
      object.position.x = MathUtils.damp(object.position.x, x, rate, dt);
      object.position.y = MathUtils.damp(object.position.y, y, rate, dt);
      object.position.z = MathUtils.damp(object.position.z, z, rate, dt);
      object.rotation.z = MathUtils.damp(object.rotation.z, tilt, rate, dt);
      object.rotation.x = MathUtils.damp(object.rotation.x, tiltX, rate, dt);
      object.rotation.y = MathUtils.damp(object.rotation.y, tiltY, rate, dt);
      displacement = Math.max(displacement, object.position.distanceTo(home));
      moving ||=
        Math.abs(object.position.x - x) +
          Math.abs(object.position.y - y) +
          Math.abs(object.position.z - z) +
          Math.abs(object.rotation.z - tilt) +
          Math.abs(object.rotation.x - tiltX) +
          Math.abs(object.rotation.y - tiltY) >
        0.0001;
    }
    gl.domElement.dataset.boardDisplacement = displacement.toFixed(4);
    if (moving && reducedMotion) invalidate();
  });
  return <primitive object={copy} dispose={null} />;
}

function ContextWatch({ onError }: { onError: () => void }) {
  useWebGLContextLoss(onError);
  return null;
}

function BoardLighting({
  economy,
  reducedMotion,
}: {
  economy: boolean;
  reducedMotion: boolean;
}) {
  const light = useRef<DirectionalLight>(null);
  useShadowBudget(light, economy ? 512 : 1024, economy ? 6 : 12);
  const { invalidate } = useThree();
  useEffect(() => {
    if (light.current) light.current.shadow.needsUpdate = true;
    invalidate();
  }, [reducedMotion, invalidate]);
  return (
    <>
      <ambientLight intensity={1} />
      <hemisphereLight args={["#fffaf0", "#c6c7bc", 0.45]} />
      <directionalLight
        ref={light}
        shadow-autoUpdate={false}
        position={[-3, 5, 12]}
        intensity={1.6}
        color="#fffaf0"
        castShadow
        shadow-mapSize={economy ? [512, 512] : [1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-normalBias={0.012}
        shadow-bias={-0.00015}
        shadow-radius={5}
        shadow-blurSamples={8}
      />
      <directionalLight
        position={[5, -1, 6]}
        intensity={0.25}
        color="#f4f5f0"
      />
    </>
  );
}

export default function BoardScene(props: Props) {
  const economy = isLimitedHardware(navigator);
  const visible = usePageVisibility();
  return (
    <Canvas
      orthographic
      frameloop={visible && props.active ? "demand" : "never"}
      shadows="variance"
      dpr={[1, economy ? 1 : 1.75]}
      camera={{ position: [0, 0, 15], near: 0.1, far: 50, manual: true }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <BoardLighting economy={economy} reducedMotion={props.reducedMotion} />
      <Suspense fallback={null}>
        <BoardModel
          {...props}
          active={props.active && visible}
          economy={economy}
        />
      </Suspense>
      <ContextWatch onError={props.onError} />
    </Canvas>
  );
}
