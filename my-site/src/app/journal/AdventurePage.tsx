"use client";

import { useState } from "react";
import Image from "next/image";
import Modal, { type DialogOrigin } from "../Modal";
import { WanderingArrowDrawing } from "../InkDrawings";
import TravelBoard from "./TravelBoard";
import { boardPhotos } from "./board-layout";
import { travelPhotos } from "./photo-assets";
import "./physical-pages.css";

const photos = [
  ...boardPhotos,
  { number: 2, caption: "Skiing in Alestch" },
  { number: 5, caption: "Monte Carlo" },
  { number: 6, caption: "Stoos Ridge Hike" },
  { number: 8, caption: "Swimming in Zurich" },
  { number: 9, caption: "Interlaken" },
  { number: 10, caption: "Alestch" },
  { number: 13, caption: "Ticino" },
  { number: 16, caption: "Interlaken" },
];

export default function AdventurePage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<DialogOrigin | null>(null);
  const [turn, setTurn] = useState(0);
  function openPhoto(index: number, source: DialogOrigin | null) {
    setOrigin(source);
    setTurn(0);
    setSelected(index);
    setOpen(true);
  }
  function closePhoto() {
    setOpen(false);
  }
  function changePhoto(direction: number, animate: boolean) {
    setTurn(animate ? direction : 0);
    setSelected(
      (index) => (index! + direction + photos.length) % photos.length,
    );
  }

  return (
    <section className="adventure-page" aria-labelledby="adventure-title">
      <header className="adventure-heading">
        <h1 id="adventure-title">A little further out.</h1>
        <p>
          Some of my favorite places. <WanderingArrowDrawing />
        </p>
      </header>
      <TravelBoard onOpen={openPhoto} paused={open} />
      <footer className="adventure-footnote">
        <p>Click a photo to look closer.</p>
        <button
          type="button"
          onClick={(event) =>
            openPhoto(
              0,
              event.detail === 0 ? null : { element: event.currentTarget },
            )
          }
        >
          Look through all {photos.length} photos
        </button>
      </footer>
      <Modal
        open={open}
        origin={origin}
        onClose={closePhoto}
        className="adventure-photo-dialog"
        label="Travel photograph"
      >
        {selected !== null && (
          <div className="adventure-photo-detail">
            <button
              className="adventure-detail-close"
              type="button"
              onClick={closePhoto}
            >
              Back to the board <span aria-hidden="true">×</span>
            </button>
            <div
              className="adventure-large-photo"
              key={selected}
              data-turn={turn}
            >
              <Image
                src={travelPhotos[photos[selected].number - 1]}
                placeholder="blur"
                loading="eager"
                fetchPriority="high"
                alt={photos[selected].caption}
                fill
                sizes="(max-width: 700px) 85vw, 750px"
              />
            </div>
            <div className="adventure-photo-navigation">
              <button
                type="button"
                onClick={(event) => changePhoto(-1, event.detail !== 0)}
                aria-label="Previous photo"
              >
                ←
              </button>
              <h2 key={selected} data-turn={turn}>
                {photos[selected].caption}
              </h2>
              <button
                type="button"
                onClick={(event) => changePhoto(1, event.detail !== 0)}
                aria-label="Next photo"
              >
                →
              </button>
            </div>
            <p className="adventure-photo-count">
              {selected + 1} / {photos.length}
            </p>
          </div>
        )}
      </Modal>
    </section>
  );
}
