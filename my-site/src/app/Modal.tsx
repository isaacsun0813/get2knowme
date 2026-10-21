"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useReducedMotionPreference } from "./useReducedMotionPreference";
import "./modal-motion.css";

export type DialogOrigin = { element: HTMLElement; angle?: number };

export default function Modal({
  open,
  onClose,
  label,
  className,
  children,
  origin,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  className: string;
  children: ReactNode;
  origin?: DialogOrigin | null;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const animation = useRef<Animation | null>(null);
  const skipClose = useRef(false);
  const reducedMotion = useReducedMotionPreference();

  useLayoutEffect(() => {
    const element = dialog.current!;
    if (!open && !element.open) return;
    const interrupted = animation.current !== null;
    const previous = getComputedStyle(element);
    const current = {
      transform: previous.transform,
      opacity: previous.opacity,
    };
    animation.current?.cancel();
    animation.current = null;
    const keyboard =
      origin === null ||
      (origin === undefined &&
        document.activeElement?.matches(":focus-visible"));
    if (open && !element.open) {
      element.dataset.pointer = String(!keyboard);
      element.showModal();
    }
    const finishClose = () => {
      element.close();
      if (origin?.element.isConnected)
        origin.element.focus({ preventScroll: true });
    };
    const skip = reducedMotion || keyboard || (!open && skipClose.current);
    skipClose.current = false;
    if (skip) {
      element.dataset.motion = open ? "open" : "closed";
      if (!open) finishClose();
      return;
    }
    const panel = element.getBoundingClientRect();
    const source = origin?.element.isConnected
      ? origin.element.getBoundingClientRect()
      : null;
    const visibleSource =
      source &&
      source.bottom > 0 &&
      source.top < innerHeight &&
      source.right > 0 &&
      source.left < innerWidth;
    const transform = visibleSource
      ? `translate3d(${source.x + source.width / 2 - panel.x - panel.width / 2}px, ${source.y + source.height / 2 - panel.y - panel.height / 2}px, 0) scale(${Math.max(0.12, Math.min(0.85, source.width / panel.width, source.height / panel.height))}) rotate(${origin?.angle || 0}deg)`
      : "translate3d(0, 10px, 0) scale(0.96)";
    const home = {
      transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)",
      opacity: 1,
    };
    const away = { transform, opacity: 0 };
    element.dataset.motion = open ? "entering" : "closing";
    const run = element.animate(
      open ? [interrupted ? current : away, home] : [current, away],
      {
        duration: open ? 280 : 220,
        easing: "cubic-bezier(0.215, 0.61, 0.355, 1)",
        fill: "both",
      },
    );
    animation.current = run;
    void run.finished.then(
      () => {
        if (animation.current !== run) return;
        if (!open) finishClose();
        element.dataset.motion = open ? "open" : "closed";
        animation.current = null;
        run.cancel();
      },
      () => {},
    );
  }, [open, origin, reducedMotion]);

  useEffect(() => () => animation.current?.cancel(), []);

  return (
    <dialog
      ref={dialog}
      className={`${className} motion-dialog`}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        skipClose.current = true;
        onClose();
      }}
      onPointerDown={(event) => {
        event.currentTarget.dataset.pointer = "true";
      }}
      onKeyDown={(event) => {
        event.currentTarget.dataset.pointer = "false";
        if (event.key === "Escape") event.stopPropagation();
      }}
      onClick={(event) => {
        skipClose.current = event.detail === 0;
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
