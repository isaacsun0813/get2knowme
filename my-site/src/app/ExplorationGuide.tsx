import { ArrowUpRight, X } from "lucide-react";
import Modal from "./Modal";
import { GlobeDrawing } from "./InkDrawings";

export default function ExplorationGuide({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="help-dialog"
      label="How to explore Isaac's World"
    >
      <button
        className="icon-button help-close"
        onClick={onClose}
        aria-label="Close exploration guide"
      >
        <X size={20} />
      </button>
      <GlobeDrawing />
      <h2>Make yourself at home.</h2>
      <p>
        Turn the globe by dragging. Scroll or pinch to look a little closer.
        Select a landmark to look closer. The Explore menu opens any page
        directly, without flying there.
      </p>
      <div className="help-keys">
        <span>
          <kbd>W</kbd> / <kbd>↑</kbd> Glide forward
        </span>
        <span>
          <kbd>A</kbd>
          <kbd>D</kbd> / <kbd>←</kbd>
          <kbd>→</kbd> Steer
        </span>
        <span>
          <kbd>S</kbd> / <kbd>↓</kbd> Slow down
        </span>
        <span>
          <kbd>Enter</kbd> Open the nearest page while flying
        </span>
        <span>
          <kbd>E</kbd> Inspect the nearest place
        </span>
        <span>
          <kbd>P</kbd> Pause flight
        </span>
        <span>
          <kbd>Esc</kbd> Back to the world
        </span>
      </div>
      <p>
        On a phone, use the arrow controls. In Zurich, inspect the meadow and
        come in for a landing. Wind rises with your speed; use the speaker to
        mute it.
      </p>
      <button className="hand-button" onClick={onClose}>
        Got it <ArrowUpRight size={18} />
      </button>
    </Modal>
  );
}
