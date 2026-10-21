"use client";

import {
  Suspense,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type ComponentRef,
} from "react";
import {
  Canvas,
  useFrame,
  useLoader,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import {
  OrbitControls,
  PerformanceMonitor,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import NightLights from "./NightLights";
import { useWebGLContextLoss } from "./useWebGLContextLoss";
import { useShadowBudget } from "./useShadowBudget";
import { isLimitedHardware } from "./render-quality";
import { animateCodi, createCodi } from "./codi";
import { createAmbientMotion } from "./ambient-motion";
import { createCameraTravel, stepCameraTravel } from "./camera-motion";
import { createFlight, stepFlight, sunDirection } from "./flight";
import {
  EARTH_RADIUS,
  FLIGHT_RADIUS,
  landingPosition,
  places,
  type FlightCommand,
  type FlightInput,
  type FlightStatus,
  type PageId,
  type WorldMode,
} from "./data";

interface Props {
  mode: WorldMode;
  inspected: PageId;
  paused: boolean;
  reducedMotion: boolean;
  input: RefObject<FlightInput>;
  command: FlightCommand;
  onReady: () => void;
  onStatus: (status: FlightStatus) => void;
  onInspect: (id: PageId) => void;
  onError: () => void;
}

function Globe({
  active,
  paused,
  reducedMotion,
  onInspect,
}: {
  active: boolean;
  paused: boolean;
  reducedMotion: boolean;
  onInspect: Props["onInspect"];
}) {
  const [gltf, chicago] = useGLTF([
    "/models/sickEarthFile3.glb",
    "/models/chicago-landmark.glb",
  ]);
  const reflections = useLoader(
    THREE.TextureLoader,
    "/models/chicago-reflections.jpg",
  );
  const group = useRef<THREE.Group>(null);
  const { scene, codi, ambient } = useMemo(() => {
    const copy = gltf.scene.clone(true);
    const originalChicago = copy.getObjectByName("Chicago_Pin")!;
    const newChicago = chicago.scene
      .getObjectByName("Chicago_Pin")!
      .clone(true);
    newChicago.position.copy(originalChicago.position);
    newChicago.quaternion.copy(originalChicago.quaternion);
    newChicago.scale.copy(originalChicago.scale);
    originalChicago.parent!.add(newChicago);
    originalChicago.removeFromParent();
    reflections.mapping = THREE.EquirectangularReflectionMapping;
    reflections.colorSpace = THREE.SRGBColorSpace;
    copy.traverse((object) => {
      if (
        object.name === "SkyDome" ||
        object.name === "world" ||
        object.name === "world001" ||
        object.name === "world.001"
      )
        object.visible = false;
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      object.castShadow =
        object.name !== "Ocean" &&
        !materials.some((material) => material.name === "Clouds");
      object.receiveShadow = !materials.some(
        (material) => material.name === "Ground",
      );
      if (object.name === "Ocean") {
        // Radial normals remove the exported face seams from the ocean’s day/night shading.
        object.geometry = object.geometry.clone();
        const positions = object.geometry.attributes.position;
        const normals = object.geometry.attributes.normal;
        const normal = new THREE.Vector3();
        for (let i = 0; i < positions.count; i++) {
          normal.fromBufferAttribute(positions, i).normalize();
          normals.setXYZ(i, normal.x, normal.y, normal.z);
        }
        normals.needsUpdate = true;
      }
      object.material = materials.map((original) => {
        const material = original.clone();
        if (
          material instanceof THREE.MeshStandardMaterial &&
          material.name === "LM_bean"
        ) {
          material.envMap = reflections;
          material.envMapIntensity = 1.1;
        }
        return material;
      });
      if (object.material.length === 1) object.material = object.material[0];
    });
    return {
      scene: copy,
      codi: createCodi(copy),
      ambient: createAmbientMotion(copy),
    };
  }, [gltf.scene, chicago.scene, reflections]);
  const codiTime = useRef(0);
  const ambientTime = useRef(0);
  const { camera, invalidate, gl } = useThree();
  const point = useMemo(() => new THREE.Vector3(), []);
  const projected = useMemo(() => new THREE.Vector3(), []);
  const codiVisible = useCallback(() => {
    codi.actor.getWorldPosition(point);
    if (
      point.distanceToSquared(camera.position) > 65 ** 2 ||
      point.dot(camera.position) < point.lengthSq()
    )
      return false;
    projected.copy(point).project(camera);
    return (
      Math.abs(projected.x) < 1.1 &&
      Math.abs(projected.y) < 1.1 &&
      projected.z < 1
    );
  }, [codi, camera, point, projected]);
  useEffect(() => {
    if (paused || reducedMotion || active) return;
    const timer = window.setInterval(invalidate, 1000 / 20);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, active, invalidate]);
  useEffect(() => () => codi.dispose(), [codi]);
  useEffect(() => () => ambient.dispose(), [ambient]);
  useFrame((_, delta) => {
    if (paused || reducedMotion) return;
    ambientTime.current += Math.min(delta, 0.1);
    ambient.update(ambientTime.current);
    gl.domElement.dataset.ambientTime = ambientTime.current.toFixed(3);
    if (!codiVisible()) return;
    codiTime.current += Math.min(delta, 0.1);
    animateCodi(codi, codiTime.current);
    gl.domElement.dataset.codiTime = codiTime.current.toFixed(3);
  });
  const { actions } = useAnimations(gltf.animations, group);
  useEffect(
    () => () => {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          materials.forEach((material) => material.dispose());
          if (object.name === "Ocean") object.geometry.dispose();
        }
      });
    },
    [scene],
  );
  useEffect(() => {
    Object.entries(actions).forEach(([name, action]) => {
      if (action && name !== "Chicago_N_Spin") {
        action.play();
        action.timeScale = 0.22;
        action.paused = paused || reducedMotion;
      }
    });
  }, [actions, paused, reducedMotion]);
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (event.delta > 5) return;
    let object: THREE.Object3D | null = event.object;
    while (object) {
      const place = places.find((place) => place.node === object?.name);
      if (place) {
        event.stopPropagation();
        onInspect(place.id);
        return;
      }
      object = object.parent;
    }
  };
  return (
    <group ref={group} scale={EARTH_RADIUS}>
      <primitive object={scene} onClick={handleClick} dispose={null} />
    </group>
  );
}

function Atmosphere({ sun }: { sun: THREE.Vector3 }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { sun: { value: sun } },
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        vertexShader:
          "varying vec3 vN; varying vec3 vP; void main(){vN=normalize(mat3(modelMatrix)*normal);vP=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vP,1.);}",
        fragmentShader:
          "uniform vec3 sun; varying vec3 vN; varying vec3 vP; void main(){vec3 n=normalize(vN);float rim=pow(1.-abs(dot(n,normalize(cameraPosition-vP))),3.);float altitude=dot(n,sun);float day=smoothstep(-.12,.3,altitude);float dusk=exp(-pow(altitude/.12,2.));vec3 color=mix(vec3(.08,.15,.29),vec3(.48,.74,.96),day);color=mix(color,vec3(.93,.61,.34),dusk*.48);gl_FragColor=vec4(color,rim*mix(.14,.5,day));}",
      }),
    [sun],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh material={material}>
      <sphereGeometry args={[26.1, 64, 48]} />
    </mesh>
  );
}

function WorldScene(props: Props & { economy: boolean }) {
  const {
    mode,
    paused,
    input,
    command,
    inspected,
    onStatus,
    onReady,
    onError,
    reducedMotion,
    economy,
  } = props;
  const pilotGLTF = useGLTF("/models/paraglider-isaac.glb");
  const pilotScene = useMemo(() => clone(pilotGLTF.scene), [pilotGLTF.scene]);
  const pilotCenter = useMemo(
    () =>
      new THREE.Box3()
        .setFromObject(pilotScene)
        .getCenter(new THREE.Vector3())
        .multiplyScalar(0.88),
    [pilotScene],
  );
  const pilot = useRef<THREE.Group>(null);
  const wind = useRef<THREE.Group>(null);
  const { actions } = useAnimations(pilotGLTF.animations, pilot);
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const flight = useRef(createFlight());
  const landed = useRef(false);
  const landing = useRef<number | null>(null);
  const landingStart = useRef(new THREE.Vector3());
  const landingNormal = useMemo(
    () => new THREE.Vector3(...landingPosition).normalize(),
    [],
  );
  const height = useRef(FLIGHT_RADIUS);
  const { camera, size, gl, invalidate } = useThree();
  const overviewDistance = useMemo(() => {
    const vertical = THREE.MathUtils.degToRad(
      (camera as THREE.PerspectiveCamera).fov,
    );
    const horizontal =
      2 * Math.atan((Math.tan(vertical / 2) * size.width) / size.height);
    return (EARTH_RADIUS / Math.sin(Math.min(vertical, horizontal) / 2)) * 1.23;
  }, [camera, size.width, size.height]);
  const scratch = useMemo(
    () => ({
      position: new THREE.Vector3(),
      up: new THREE.Vector3(),
      right: new THREE.Vector3(),
      matrix: new THREE.Matrix4(),
      target: new THREE.Vector3(),
      sun: new THREE.Vector3(),
    }),
    [],
  );
  const reported = useRef(0.2);
  const initialized = useRef(false);
  const travel = useRef<ReturnType<typeof createCameraTravel> | null>(null);
  const [traveling, setTraveling] = useState(false);
  const goal = useMemo(
    () => ({ pose: camera.clone(), target: new THREE.Vector3() }),
    [camera],
  );
  const sunlight = useRef<THREE.DirectionalLight>(null);
  useWebGLContextLoss(onError);
  useShadowBudget(sunlight, economy ? 1024 : 2048, economy ? 6 : 12);

  useEffect(() => {
    actions.Glide?.play();
    return () => {
      actions.Glide?.stop();
    };
  }, [actions]);
  useEffect(() => {
    if (!paused) invalidate();
  }, [paused, invalidate]);
  useEffect(() => {
    gl.domElement.dataset.scene = "isaacs-world";
    gl.domElement.setAttribute(
      "aria-label",
      "Interactive globe with Isaac’s paraglider and five landmarks",
    );
    onReady();
  }, [gl, onReady]);
  useEffect(() => {
    const update = () => {
      scratch.sun.set(...sunDirection(new Date()));
      sunlight.current?.position.copy(scratch.sun).multiplyScalar(150);
      if (sunlight.current) sunlight.current.shadow.needsUpdate = true;
      gl.domElement.dataset.sunDirection = scratch.sun.toArray().join(",");
      invalidate();
    };
    update();
    const timer = window.setInterval(update, 60_000);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, [invalidate, gl, scratch.sun]);
  useEffect(() => {
    const direction = new THREE.Vector3(
      ...places.find((place) => place.id === inspected)!.position,
    ).normalize();
    if (mode === "overview") {
      if (initialized.current)
        goal.pose.position
          .copy(camera.position)
          .normalize()
          .multiplyScalar(overviewDistance);
      else
        goal.pose.position
          .copy(flight.current.normal)
          .multiplyScalar(overviewDistance);
      goal.pose.up.set(0, 1, 0);
      goal.target.set(0, 0, 0);
    } else if (mode === "inspect") {
      goal.target.fromArray(
        places.find((place) => place.id === inspected)!.position,
      );
      const north = new THREE.Vector3(0, 1, 0)
        .addScaledVector(direction, -direction.y)
        .normalize();
      goal.pose.position
        .copy(goal.target)
        .addScaledVector(direction, inspected === "career" ? 4.5 : 13)
        .addScaledVector(north, inspected === "career" ? -9 : -10);
      goal.pose.up.copy(direction);
    } else {
      goal.pose.position
        .copy(flight.current.normal)
        .multiplyScalar(size.width < 550 ? 66 : 53)
        .addScaledVector(flight.current.forward, -9);
      goal.pose.up.copy(flight.current.forward);
      goal.target.copy(flight.current.normal).multiplyScalar(height.current);
      pilot.current?.localToWorld(goal.target.copy(pilotCenter));
    }
    goal.pose.lookAt(goal.target);
    if (!initialized.current || reducedMotion) {
      camera.position.copy(goal.pose.position);
      camera.quaternion.copy(goal.pose.quaternion);
      camera.up.copy(goal.pose.up);
      controls.current?.target.copy(goal.target);
      if (mode !== "flying") controls.current?.update();
      travel.current = null;
      setTraveling(false);
      gl.domElement.dataset.cameraTravel = "idle";
    } else {
      travel.current = createCameraTravel(camera, goal.pose);
      if (controls.current) controls.current.enabled = false;
      setTraveling(true);
      gl.domElement.dataset.cameraTravel = "moving";
    }
    initialized.current = true;
    invalidate();
  }, [
    mode,
    inspected,
    camera,
    overviewDistance,
    goal,
    reducedMotion,
    size.width,
    invalidate,
    gl,
    pilotCenter,
  ]);
  useEffect(() => {
    if (command.sequence === 0) return;
    if (command.action === "land") {
      landing.current = 0;
      landed.current = false;
      landingStart.current.copy(flight.current.normal);
      flight.current.speed = 0;
    } else if (command.action === "takeoff") {
      landing.current = null;
      landed.current = false;
    }
  }, [command]);
  useFrame((_, delta) => {
    if (!pilot.current || !initialized.current) return;
    const dt = Math.min(delta, 0.05);
    const current = flight.current;
    pilot.current.visible = mode !== "inspect" || landed.current;
    if (
      mode === "flying" &&
      !paused &&
      !landed.current &&
      landing.current === null
    )
      stepFlight(current, input.current, dt);
    if (landing.current !== null && !paused) {
      landing.current = Math.min(1, landing.current + dt / 2.6);
      const t = THREE.MathUtils.smoothstep(landing.current, 0, 1);
      current.normal
        .copy(landingStart.current)
        .lerp(landingNormal, t)
        .normalize();
      height.current = THREE.MathUtils.lerp(
        FLIGHT_RADIUS,
        new THREE.Vector3(...landingPosition).length() - 0.13,
        t,
      );
      current.forward
        .addScaledVector(current.normal, -current.forward.dot(current.normal))
        .normalize();
      if (landing.current === 1) {
        landed.current = true;
        landing.current = null;
      }
    } else if (!landed.current)
      height.current = THREE.MathUtils.damp(
        height.current,
        FLIGHT_RADIUS,
        2,
        dt,
      );
    scratch.position.copy(current.normal).multiplyScalar(height.current);
    scratch.right.crossVectors(current.forward, current.normal).normalize();
    scratch.matrix.makeBasis(current.forward, current.normal, scratch.right);
    pilot.current.position.copy(scratch.position);
    pilot.current.quaternion.setFromRotationMatrix(scratch.matrix);
    if (
      !paused &&
      (mode !== "flying" || landed.current || landing.current !== null)
    )
      current.bank = THREE.MathUtils.damp(current.bank, 0, 4, dt);
    pilot.current.rotateX(-current.bank);
    if (wind.current) {
      wind.current.visible =
        mode === "flying" && current.speed > 0.2 && !landed.current;
      wind.current.scale.x = current.speed / 8;
    }
    if (actions.Glide) {
      actions.Glide.paused =
        paused || reducedMotion || current.speed < 0.05 || mode !== "flying";
      actions.Glide.timeScale = 0.7;
    }
    if (mode === "flying") {
      goal.pose.position
        .copy(current.normal)
        .multiplyScalar(size.width < 550 ? 66 : 53)
        .addScaledVector(current.forward, -9);
      goal.pose.up.copy(current.forward);
      pilot.current.localToWorld(goal.target.copy(pilotCenter));
      goal.pose.lookAt(goal.target);
    }
    if (travel.current && !paused) {
      if (mode === "flying") {
        travel.current.to.copy(goal.pose.position);
        travel.current.toRotation.copy(goal.pose.quaternion);
        travel.current.toUp.copy(goal.pose.up);
      }
      if (stepCameraTravel(camera, travel.current, dt)) {
        travel.current = null;
        setTraveling(false);
        controls.current?.target.copy(goal.target);
        if (mode !== "flying") controls.current?.update();
        gl.domElement.dataset.cameraTravel = "idle";
      } else invalidate();
    } else if (mode === "flying" && !paused) {
      camera.position.lerp(goal.pose.position, 1 - Math.exp(-3.5 * dt));
      camera.up.lerp(current.forward, 1 - Math.exp(-3 * dt)).normalize();
      camera.lookAt(goal.target);
    }
    if (mode === "inspect" && camera.position.length() < 27.5) {
      camera.position.normalize().multiplyScalar(27.5);
      if (controls.current) camera.lookAt(controls.current.target);
    }
    reported.current += dt;
    if (reported.current >= 0.2) {
      let nearest = places[0] as (typeof places)[number];
      let distance = Infinity;
      for (const place of places) {
        const d = scratch.up
          .fromArray(place.position)
          .normalize()
          .distanceToSquared(current.normal);
        if (d < distance) {
          nearest = place;
          distance = d;
        }
      }
      onStatus({
        position: pilot.current.position.toArray(),
        speed: current.speed,
        nearest: nearest.id,
        landed: landed.current,
      });
      gl.domElement.dataset.flightPosition = pilot.current.position
        .toArray()
        .map((value) => value.toFixed(3))
        .join(",");
      gl.domElement.dataset.flightBank = (-current.bank).toFixed(4);
      gl.domElement.dataset.cameraPosition = camera.position
        .toArray()
        .join(",");
      reported.current = 0;
    }
  });
  return (
    <>
      <ambientLight intensity={0.5} color="#ffffff" />
      <hemisphereLight args={["#e7f2ff", "#c3d3df", 0.22]} />
      <directionalLight
        ref={sunlight}
        position={[100, 50, 70]}
        intensity={1.5}
        color="#fff8eb"
        castShadow
        shadow-autoUpdate={false}
        shadow-mapSize={economy ? [1024, 1024] : [2048, 2048]}
        shadow-camera-left={-42}
        shadow-camera-right={42}
        shadow-camera-top={42}
        shadow-camera-bottom={-42}
        shadow-camera-near={60}
        shadow-camera-far={220}
        shadow-bias={-0.0003}
        shadow-normalBias={0.04}
      />
      <Globe
        active={mode === "flying" && !paused}
        paused={paused}
        reducedMotion={reducedMotion}
        onInspect={props.onInspect}
      />
      <Atmosphere sun={scratch.sun} />
      <NightLights
        sun={scratch.sun}
        paused={paused}
        reducedMotion={reducedMotion}
        flying={mode === "flying"}
      />
      <group ref={pilot}>
        <primitive object={pilotScene} scale={0.88} dispose={null} />
        <group ref={wind} visible={false}>
          {[-1.5, -0.8, 0.8, 1.5].map((z, index) => (
            <mesh
              key={z}
              position={[-2.2 - index * 0.18, 1.7 + index * 0.2, z]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.008, 0.008, 2.1, 4]} />
              <meshBasicMaterial color="#f7ffff" transparent opacity={0.35} />
            </mesh>
          ))}
        </group>
      </group>
      <OrbitControls
        ref={controls}
        enabled={mode !== "flying" && !paused && !traveling}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={mode === "inspect" ? 7 : 50}
        maxDistance={
          mode === "inspect" ? 65 : Math.max(150, overviewDistance * 1.6)
        }
        target={[0, 0, 0]}
      />
    </>
  );
}

const WorldCanvas = memo(function WorldCanvas(props: Props) {
  const [economy, setEconomy] = useState(() => isLimitedHardware(navigator));
  return (
    <Canvas
      frameloop={
        props.paused ? "never" : props.mode === "flying" ? "always" : "demand"
      }
      shadows
      dpr={[1, economy ? 1 : 1.6]}
      camera={{ position: [-33, 55, 60], fov: 42, near: 0.1, far: 500 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      fallback={
        <span>3D is unavailable. All field notes are available below.</span>
      }
    >
      <Suspense fallback={null}>
        <WorldScene {...props} economy={economy} />
        {props.mode === "flying" && !props.paused && !economy && (
          <PerformanceMonitor
            ms={400}
            iterations={5}
            bounds={() => [35, 55]}
            onDecline={() => setEconomy(true)}
          />
        )}
      </Suspense>
    </Canvas>
  );
});

export default WorldCanvas;

export function resetWorldAssets() {
  useGLTF.clear(["/models/sickEarthFile3.glb", "/models/chicago-landmark.glb"]);
  useLoader.clear(THREE.TextureLoader, "/models/chicago-reflections.jpg");
  useGLTF.clear("/models/paraglider-isaac.glb");
  useLoader.clear(THREE.FileLoader, "/models/night-lights.bin");
}
