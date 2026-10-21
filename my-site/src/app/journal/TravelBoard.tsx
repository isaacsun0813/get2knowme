"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import dynamic from "next/dynamic";
import SceneErrorBoundary from "../SceneErrorBoundary";
import type { DialogOrigin } from "../Modal";
import { supportsWebGL } from "../supportsWebGL";
import { useReducedMotionPreference } from "../useReducedMotionPreference";
import { boardObjects, boardViews, type BoardMotion } from "./board-layout";

const BoardScene = dynamic(() => import("./BoardScene"), { ssr: false });

function controlStyle(item: (typeof boardObjects)[number]): CSSProperties {
  const style: Record<string, string> = {};
  for (const mode of ["desktop", "phone"] as const) {
    const view = boardViews[mode];
    const [x, y] = item[mode];
    style[`--${mode}-left`] = `${50 + (x / view.width) * 100}%`;
    style[`--${mode}-top`] =
      `${50 - ((y - (item.anchor * item.height) / 2) / view.height) * 100}%`;
    style[`--${mode}-width`] = `${(item.width / view.width) * 100}%`;
    style[`--${mode}-height`] = `${(item.height / view.height) * 100}%`;
  }
  return style as CSSProperties;
}

export default function TravelBoard({
  onOpen,
  paused = false,
}: {
  onOpen: (photo: number, origin: DialogOrigin | null) => void;
  paused?: boolean;
}) {
  const reducedMotion = useReducedMotionPreference();
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [available, setAvailable] = useState(false);
  const board = useRef<HTMLDivElement>(null);
  const motion = useRef<BoardMotion>(new Map());
  const redraw = useRef<(() => void) | null>(null);
  const drag = useRef<{
    name: string;
    pointerId: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);

  useEffect(() => {
    if (!reducedMotion) return;
    motion.current.clear();
    drag.current = null;
    redraw.current?.();
  }, [reducedMotion]);

  useEffect(() => {
    const supported = supportsWebGL();
    setAvailable(supported);
    setFailed(!supported);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    );
    observer.observe(board.current!);
    return () => observer.disconnect();
  }, []);

  function emphasize(name: string, hovered: boolean) {
    if (drag.current || reducedMotion || !ready || failed) return;
    if (hovered)
      motion.current.set(name, { x: 0, y: 0, held: false, hovered: true });
    else motion.current.delete(name);
    redraw.current?.();
  }

  function release(event: PointerEvent<HTMLButtonElement>) {
    const active = drag.current;
    if (
      !active ||
      active.pointerId !== event.pointerId ||
      active.name !== event.currentTarget.dataset.object
    )
      return;
    drag.current = null;
    suppressClick.current = active.moved || event.type !== "pointerup";
    motion.current.delete(active.name);
    redraw.current?.();
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div
      ref={board}
      className="travel-board"
      role="group"
      aria-label="Travel photo board"
      data-renderer={failed ? "still" : ready ? "3d" : "loading"}
    >
      <picture className="travel-board-still">
        <source
          media="(max-width: 700px)"
          srcSet="/photos/board/travel-board-phone.jpg"
        />
        <img
          src="/photos/board/travel-board.jpg"
          alt="Nine travel photographs on an olive canvas board with a Spalding TF-1000 basketball, Jean from Attack on Titan, plants and XXTRA Hot Cheetos"
        />
      </picture>
      {available && !failed && (
        <div className={`travel-board-canvas ${ready ? "is-ready" : ""}`}>
          <SceneErrorBoundary onError={onError}>
            <BoardScene
              motion={motion}
              redraw={redraw}
              onReady={onReady}
              onError={onError}
              reducedMotion={reducedMotion}
              active={inView && !paused}
            />
          </SceneErrorBoundary>
        </div>
      )}
      {boardObjects.map((item) => (
        <button
          type="button"
          key={item.name}
          className="travel-board-object"
          aria-label={item.label}
          data-object={item.name}
          style={controlStyle(item)}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") emphasize(item.name, true);
          }}
          onPointerLeave={() => emphasize(item.name, false)}
          onFocus={() => emphasize(item.name, true)}
          onBlur={() => emphasize(item.name, false)}
          onPointerDown={(event) => {
            if (event.button !== 0 || drag.current) return;
            suppressClick.current = false;
            drag.current = {
              name: item.name,
              pointerId: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              moved: false,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
            if (ready && !failed && !reducedMotion) {
              motion.current.set(item.name, { x: 0, y: 0, held: true });
              redraw.current?.();
            }
          }}
          onPointerMove={(event) => {
            const active = drag.current;
            if (
              active?.name !== item.name ||
              active.pointerId !== event.pointerId
            )
              return;
            const dx = event.clientX - active.x;
            const dy = event.clientY - active.y;
            active.moved ||= Math.hypot(dx, dy) > 6;
            if (!ready || failed || reducedMotion) return;
            const width = board.current!.clientWidth;
            const units =
              (width <= 600
                ? boardViews.phone.width
                : boardViews.desktop.width) / width;
            motion.current.set(item.name, {
              x: Math.max(-0.24, Math.min(0.24, dx * units)),
              y: Math.max(-0.18, Math.min(0.18, -dy * units)),
              held: true,
            });
            redraw.current?.();
          }}
          onPointerUp={(event) => release(event)}
          onPointerCancel={(event) => release(event)}
          onLostPointerCapture={(event) => release(event)}
          onClick={(event) => {
            if (
              (event.detail === 0 || !suppressClick.current) &&
              item.photo !== undefined
            )
              onOpen(
                item.photo,
                event.detail === 0
                  ? null
                  : {
                      element: event.currentTarget,
                      angle: "angle" in item ? item.angle : 0,
                    },
              );
          }}
        />
      ))}
      {failed && (
        <p className="travel-board-fallback-note">
          A still of the board. The photographs still open.
        </p>
      )}
    </div>
  );
}
