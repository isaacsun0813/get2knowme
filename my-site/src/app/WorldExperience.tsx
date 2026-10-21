"use client";

import dynamic from "next/dynamic";
import SceneErrorBoundary from "./SceneErrorBoundary";
import { supportsWebGL } from "./supportsWebGL";
import { useRouter } from "next/navigation";
import {
  GliderDrawing,
  GlobeDrawing,
  WanderingArrowDrawing,
} from "./InkDrawings";
import { useFlightWind } from "./world/useFlightWind";
import { useReducedMotionPreference } from "./useReducedMotionPreference";
import { usePageVisibility } from "./usePageVisibility";
import "./world-presentation.css";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Compass,
  Maximize2,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  emptyInput,
  places,
  type FlightCommand,
  type FlightStatus,
  type PageId,
  type WorldMode,
} from "./world/data";

const WorldCanvas = dynamic(() => import("./world/WorldCanvas"), {
  ssr: false,
});
const AboutPage = dynamic(() => import("./journal/AboutPage"));
const AdventurePage = dynamic(() => import("./journal/AdventurePage"));
const ProjectsPage = dynamic(() => import("./journal/ProjectsPage"));
const CareerPage = dynamic(() => import("./journal/CareerPage"));
const VibesPage = dynamic(() => import("./journal/VibesPage"));
const pages = {
  about: AboutPage,
  adventure: AdventurePage,
  projects: ProjectsPage,
  career: CareerPage,
  vibes: VibesPage,
};

export default function WorldExperience() {
  const router = useRouter();
  const [page, setPage] = useState<PageId | null>(null);
  const [mode, setMode] = useState<WorldMode>("overview");
  const [inspected, setInspected] = useState<PageId>("about");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);
  const [command, setCommand] = useState<FlightCommand>({
    action: "takeoff",
    sequence: 0,
  });
  const [status, setStatus] = useState<FlightStatus>({
    position: [-11, 19, 22],
    speed: 0,
    nearest: "about",
    landed: false,
  });
  const [entered, setEntered] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const notesMenu = useRef<HTMLElement>(null);
  const notesButton = useRef<HTMLButtonElement>(null);
  const input = useRef(emptyInput());
  const journal = useRef<HTMLDivElement>(null);
  const journalCloseButton = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotionPreference();
  const visible = usePageVisibility();
  const activePlace = places.find(
    (place) => place.id === (mode === "inspect" ? inspected : status.nearest),
  )!;
  const Page = page ? pages[page] : null;
  const wind = useFlightWind(
    mode === "flying" &&
      ready &&
      entered &&
      !status.landed &&
      !page &&
      !notesOpen,
    status.speed,
  );
  const activateWind = wind.activate;
  const reportStatus = useCallback((next: FlightStatus) => {
    setStatus((current) =>
      current.speed === next.speed &&
      current.nearest === next.nearest &&
      current.landed === next.landed &&
      current.position.every((value, index) => value === next.position[index])
        ? current
        : next,
    );
  }, []);

  const navigate = useCallback(
    (next: PageId | null) => {
      if (next) {
        lastFocus.current =
          document.activeElement instanceof HTMLElement &&
          document.activeElement !== document.body
            ? document.activeElement
            : notesButton.current;
      } else if (!lastFocus.current) {
        lastFocus.current = notesButton.current;
      }
      router.push(
        next ? `#${next}` : window.location.pathname + window.location.search,
        { scroll: false },
      );
      setPage(next);
      setNotesOpen(false);
    },
    [router],
  );
  useEffect(() => {
    const restore = () => {
      const id = window.location.hash.slice(1);
      const next = places.find((place) => place.id === id)?.id || null;
      setPage(next);
      setNotesOpen(false);
    };
    restore();
    window.addEventListener("popstate", restore);
    window.addEventListener("hashchange", restore);
    return () => {
      window.removeEventListener("popstate", restore);
      window.removeEventListener("hashchange", restore);
    };
  }, []);
  useEffect(() => {
    input.current = emptyInput();
    if (page) {
      journal.current?.scrollTo(0, 0);
      journalCloseButton.current?.focus({ preventScroll: true });
    } else if (lastFocus.current) {
      const target = notesMenu.current?.contains(lastFocus.current)
        ? notesButton.current
        : lastFocus.current;
      target?.focus({ preventScroll: true });
    }
  }, [page]);
  const inspect = useCallback((id: PageId) => {
    setNotesOpen(false);
    input.current = emptyInput();
    setInspected(id);
    setMode("inspect");
  }, []);
  const sceneReady = useCallback(() => {
    setReady(true);
    setFailed(false);
  }, []);
  const sceneError = useCallback(() => {
    setFailed(true);
    setReady(false);
  }, []);
  useEffect(() => {
    if (!supportsWebGL()) setFailed(true);
  }, []);
  useEffect(() => {
    if (!ready && !failed) return;
    const timer = window.setTimeout(
      () => setEntered(true),
      reducedMotion ? 0 : 850,
    );
    return () => window.clearTimeout(timer);
  }, [ready, failed, reducedMotion]);
  useEffect(() => {
    if (!notesOpen) return;
    notesMenu.current?.querySelector<HTMLButtonElement>(".note-open")?.focus();
    const dismiss = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !notesMenu.current?.contains(event.target) &&
        !notesButton.current?.contains(event.target)
      )
        setNotesOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [notesOpen]);
  useEffect(() => {
    const keys: Record<string, keyof ReturnType<typeof emptyInput>> = {
      KeyW: "forward",
      ArrowUp: "forward",
      KeyA: "left",
      ArrowLeft: "left",
      KeyD: "right",
      ArrowRight: "right",
      KeyS: "brake",
      ArrowDown: "brake",
    };
    const down = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        (event.target.matches("input,textarea,select") ||
          event.target.isContentEditable)
      )
        return;
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        document.querySelector("dialog[open]")
      )
        return;
      if (event.key === "Escape") {
        if (notesOpen) {
          setNotesOpen(false);
          notesButton.current?.focus();
          return;
        }
        if (page) navigate(null);
        else if (mode !== "overview") {
          setMode("overview");
          input.current = emptyInput();
        }
        return;
      }
      if (page || notesOpen || !entered) return;
      if (keys[event.code] && !failed) {
        event.preventDefault();
        if (!event.repeat) activateWind();
        input.current[keys[event.code]] = true;
        if (mode !== "flying") {
          setMode("flying");
        }
      }
      if (
        event.code === "Enter" &&
        !event.repeat &&
        mode === "flying" &&
        !failed &&
        !(
          event.target instanceof Element &&
          event.target.closest("button,a,summary,[role='button']")
        )
      ) {
        event.preventDefault();
        navigate(status.nearest);
        return;
      }
      if (event.code === "KeyE" && !event.repeat && !failed)
        inspect(status.nearest);
    };
    const up = (event: KeyboardEvent) => {
      if (keys[event.code]) input.current[keys[event.code]] = false;
    };
    const reset = () => {
      input.current = emptyInput();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, [
    page,
    mode,
    failed,
    inspect,
    navigate,
    status.nearest,
    notesOpen,
    entered,
    activateWind,
  ]);
  const fly = () => {
    wind.activate();
    setMode("flying");
    input.current = emptyInput();
  };
  const sendCommand = (action: FlightCommand["action"]) => {
    wind.activate();
    setCommand((current) => ({ action, sequence: current.sequence + 1 }));
    setMode("flying");
  };
  const flightControlHandlers = (key: keyof ReturnType<typeof emptyInput>) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      wind.activate();
      event.currentTarget.setPointerCapture(event.pointerId);
      input.current[key] = true;
    },
    onPointerUp: () => {
      input.current[key] = false;
    },
    onPointerCancel: () => {
      input.current[key] = false;
    },
    onLostPointerCapture: () => {
      input.current[key] = false;
    },
  });

  return (
    <div
      className={`world-app ${page ? "has-journal" : ""} ${entered || failed ? "world-entered" : "world-opening"}`}
    >
      <button className="skip-link" onClick={() => setNotesOpen(true)}>
        Skip to Explore
      </button>
      <header className="site-header">
        <button
          className="wordmark"
          onClick={() => navigate(null)}
          aria-label="Isaac's World, home"
        >
          <GlobeDrawing />
          <span>
            isaac&apos;s world<span className="wordmark-period">.</span>
          </span>
        </button>
        <div className="header-tools">
          <button
            ref={notesButton}
            className="notes-toggle"
            aria-expanded={notesOpen}
            aria-controls="field-notes"
            onClick={() => setNotesOpen((current) => !current)}
          >
            <GlobeDrawing /> Explore
          </button>
          <button
            className="icon-button"
            onClick={wind.toggle}
            aria-label={wind.enabled ? "Mute wind" : "Enable wind"}
            aria-pressed={wind.enabled}
          >
            {wind.enabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
          </button>
        </div>
      </header>

      <main className="world-main" aria-label="Isaac's World" inert={!!page}>
        <h1 className="sr-only">Isaac&apos;s World</h1>
        {!page && !failed && (
          <div className="atlas-opening" aria-hidden={entered} role="status">
            <GlobeDrawing className="atlas-opening-earth" />
            <p>
              a personal atlas,
              <br />
              <span>by isaac sun</span>
            </p>
            <GliderDrawing className="atlas-opening-glider" />
          </div>
        )}
        <div className="world-stage" aria-busy={!ready && !failed}>
          {!failed && (
            <SceneErrorBoundary key={sceneKey} onError={sceneError}>
              <WorldCanvas
                mode={mode}
                inspected={inspected}
                paused={!!page || notesOpen || !visible}
                reducedMotion={!!reducedMotion}
                input={input}
                command={command}
                onReady={sceneReady}
                onStatus={reportStatus}
                onInspect={inspect}
                onError={sceneError}
              />
            </SceneErrorBoundary>
          )}
          {failed && (
            <div className="world-fallback">
              <GlobeDrawing />
              <h2>
                A little less 3D.
                <br />
                The same little world.
              </h2>
              <p>
                Your browser couldn&apos;t open the globe.
                <br />
                Every page is still here to explore.
              </p>
              <button
                className="text-button"
                onClick={async () => {
                  const { resetWorldAssets } = await import(
                    "./world/WorldCanvas"
                  );
                  resetWorldAssets();
                  setFailed(false);
                  setReady(false);
                  setEntered(false);
                  setSceneKey((current) => current + 1);
                }}
              >
                Try the globe again <RotateCcw size={15} />
              </button>
            </div>
          )}
        </div>
        {mode === "overview" && ready && !failed && (
          <div className="world-actions">
            <button className="text-button" onClick={fly} disabled={!entered}>
              Take flight <WanderingArrowDrawing className="flight-arrow" />
            </button>
          </div>
        )}
        {mode !== "overview" && !failed && (
          <>
            <div className="flight-topline">
              <button
                className="text-button"
                onClick={() => {
                  setMode("overview");
                  input.current = emptyInput();
                }}
              >
                <ArrowLeft size={15} /> Back to the world
              </button>
            </div>
            <div className="place-actions" aria-label="Current place">
              <h2>{activePlace.city}</h2>
              <button
                className="text-button"
                aria-keyshortcuts={mode === "flying" ? "Enter" : undefined}
                onClick={() => navigate(activePlace.id)}
              >
                Open {activePlace.title} <ArrowUpRight size={17} />
                {mode === "flying" && (
                  <kbd className="page-shortcut">Enter</kbd>
                )}
              </button>
              {mode === "inspect" && activePlace.id === "adventure" && (
                <button
                  className="landing-button"
                  onClick={() =>
                    sendCommand(status.landed ? "takeoff" : "land")
                  }
                >
                  {status.landed ? "Take off again" : "Land in the meadow"}
                </button>
              )}
              {mode !== "inspect" && !status.landed && (
                <button
                  className="inspect-button"
                  onClick={() => inspect(status.nearest)}
                >
                  <Maximize2 size={14} /> Look closer <kbd>E</kbd>
                </button>
              )}
              {mode === "inspect" && (
                <button className="inspect-button" onClick={fly}>
                  <Compass size={15} /> Keep flying
                </button>
              )}
              {status.landed && mode === "flying" && (
                <button
                  className="landing-button"
                  onClick={() => sendCommand("takeoff")}
                >
                  Take off again <ArrowUpRight size={15} />
                </button>
              )}
            </div>
            {mode === "flying" && (
              <div className="flight-tools">
                <div className="desktop-controls">
                  <span>
                    <kbd>W</kbd> move
                  </span>
                  <span>
                    <kbd>A</kbd>
                    <kbd>D</kbd> steer
                  </span>
                  <span>
                    <kbd>S</kbd> slow
                  </span>
                </div>
                <div className="touch-controls" aria-label="Flight controls">
                  <button
                    {...flightControlHandlers("left")}
                    aria-label="Steer left"
                  >
                    ←
                  </button>
                  <button
                    {...flightControlHandlers("forward")}
                    aria-label="Glide forward"
                  >
                    ↑
                  </button>
                  <button
                    {...flightControlHandlers("right")}
                    aria-label="Steer right"
                  >
                    →
                  </button>
                  <button
                    {...flightControlHandlers("brake")}
                    aria-label="Slow down"
                  >
                    ↓
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        <output
          className="sr-only"
          aria-label="Flight status"
          data-testid="flight-status"
          data-position={status.position
            .map((value) => value.toFixed(3))
            .join(",")}
          data-speed={status.speed.toFixed(3)}
          data-landed={status.landed}
        >
          {status.landed ? "Landed in Zurich" : `${status.nearest}, ${mode}`}
        </output>
      </main>

      <nav
        id="field-notes"
        ref={notesMenu}
        className="field-notes"
        aria-label="Explore"
        hidden={!notesOpen}
      >
        <div className="notes-menu-heading">
          <span>a few places, a few stories.</span>
          <button
            className="icon-button"
            aria-label="Close Explore"
            onClick={() => {
              setNotesOpen(false);
              notesButton.current?.focus();
            }}
          >
            <X size={17} />
          </button>
        </div>
        {places.map((place) => (
          <div
            key={place.id}
            className="notes-menu-place"
            aria-current={page === place.id ? "page" : undefined}
          >
            <button
              className="note-open"
              onClick={() => navigate(place.id)}
              aria-label={`Open ${place.title}`}
            >
              <span>
                {place.title} <ArrowUpRight size={15} />
              </span>
              <small>{place.city}</small>
            </button>
          </div>
        ))}
        <details className="globe-visits">
          <summary>Visit a place on the globe</summary>
          <div>
            {places.map((place) => (
              <button
                key={place.id}
                className="text-button"
                onClick={() => {
                  if (page) navigate(null);
                  inspect(place.id);
                }}
                aria-label={`Inspect ${place.city}`}
                disabled={failed || !ready}
              >
                <Compass size={14} /> {place.city}
              </button>
            ))}
          </div>
        </details>
      </nav>

      {page && Page && (
        <div
          key={page}
          ref={journal}
          className={`journal-view journal-${page}`}
        >
          <div className="journal-toolbar">
            <button
              ref={journalCloseButton}
              className="text-button journal-back"
              onClick={() => navigate(null)}
            >
              <ArrowLeft size={16} /> Back to the world
            </button>
            <button
              className="journal-close"
              onClick={() => navigate(null)}
              aria-label="Close page"
            >
              close <X size={17} />
            </button>
          </div>
          <main className="journal-content">
            <Page />
          </main>
        </div>
      )}

      {wind.unavailable && (
        <span className="audio-message" role="status">
          Wind audio couldn&apos;t start. You can keep exploring.
        </span>
      )}
    </div>
  );
}
