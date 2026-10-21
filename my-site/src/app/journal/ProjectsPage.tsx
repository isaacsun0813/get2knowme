"use client";

import { useState } from "react";
import Image from "next/image";
import Modal, { type DialogOrigin } from "../Modal";
import "./projects-sketchbook.css";
import { ProjectDrawing, PaperPlaneDrawing } from "../InkDrawings";

const projects = [
  {
    id: "carbon",
    cover: "Carbon-aware",
    subtitle: "ML scheduling",
    title: "Carbon Aware Scheduling for ML Training/Inference",
    status: "Researching",
    description:
      "Also interested in greener CI/CD pipelines, distributed systems, and broadly security specifically attacks.",
    image: undefined,
    link: undefined,
  },
  {
    id: "grey",
    cover: "Grey market",
    subtitle: "Sneaker marketplace",
    title: "Grey Market Sneaker Marketplace",
    status: "Building",
    description:
      "A sneaker inventory management platform featuring agent-driven workflows, automated SKU detection, and real-time access to available wholesale inventory.",
    image: undefined,
    link: undefined,
  },
  {
    id: "prizesole",
    cover: "PrizeSole",
    subtitle: "Sneaker sweepstakes",
    title: "PrizeSole",
    status: "Discontinued",
    description: "B2B eCommerce sneaker sweepstakes platform",
    image: "/photos/projects/PrizeSole.png",
    link: undefined,
  },
  {
    id: "verdra",
    cover: "Verdra",
    subtitle: "Cloud compute optimization",
    title: "Verdra",
    status: "Building",
    description:
      "Reduces infrastructure costs and improves carbon footprint by detecting common cloud compute inefficiencies",
    image: "/photos/projects/Verdra.png",
    link: "https://verdratech.github.io/Verdra-Site/",
  },
];

export default function ProjectsPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<DialogOrigin | null>(null);
  function closeNotes() {
    setOpen(false);
  }
  const project = selected === null ? null : projects[selected];
  return (
    <section className="projects-page" aria-labelledby="projects-title">
      <header className="projects-heading">
        <h1 id="projects-title">Things I&apos;m building.</h1>
        <p>A few ideas, in various states of becoming.</p>
      </header>
      <div className="project-sketchbook" aria-label="Project sketchbook">
        {projects.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`project-sketch-entry project-sketch-${item.id}`}
            onClick={(event) => {
              setOrigin(
                event.detail === 0 ? null : { element: event.currentTarget },
              );
              setSelected(index);
              setOpen(true);
            }}
            aria-label={`Open ${item.title}, ${item.status.toLowerCase()}`}
          >
            <span className="project-sketch-object">
              <ProjectDrawing kind={item.id} />
            </span>
            <span className="project-sketch-notes">
              <span className="project-sketch-name">{item.cover}</span>
              <span className="project-sketch-subtitle">{item.subtitle}</span>
              <span className="project-sketch-status">{item.status}</span>
            </span>
          </button>
        ))}
        <PaperPlaneDrawing className="projects-plane" />
      </div>
      <footer className="projects-footnote">
        <p>Pick a sketch to open my notes.</p>
        <a
          href="https://github.com/isaacsun0813"
          target="_blank"
          rel="noopener noreferrer"
        >
          More on GitHub
        </a>
      </footer>
      <Modal
        open={open}
        origin={origin}
        onClose={closeNotes}
        className="projects-detail-dialog"
        label="Project details"
      >
        {project && (
          <article className={`projects-open-book projects-open-${project.id}`}>
            <button
              type="button"
              className="projects-back"
              onClick={closeNotes}
            >
              ← Back to the sketchbook
            </button>
            <span
              className={`projects-status projects-status-${project.status.toLowerCase()}`}
            >
              {project.status}
            </span>
            <h2>{project.title}</h2>
            <p>{project.description}</p>
            {project.image && (
              <div className="projects-detail-image">
                <Image
                  src={project.image}
                  alt={`${project.title} website`}
                  width={900}
                  height={600}
                  sizes="(max-width: 700px) 85vw, 600px"
                />
              </div>
            )}
            {project.link && (
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                Visit Verdra
              </a>
            )}
          </article>
        )}
      </Modal>
    </section>
  );
}
