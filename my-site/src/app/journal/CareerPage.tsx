import "./journal-pages.css";

const chapters = [
  {
    name: "Lumentum",
    role: "Testing and visualization",
    details: ["Worked on testing and built visualizations in MATLAB."],
  },
  {
    name: "Relativity",
    role: "Software engineering intern · Chicago",
    details: ["Worked across DevOps, dashboarding, observability, and APIs."],
  },
  {
    name: "PrizeSole",
    role: "CTO / co-founder",
    details: [
      "Co-founded a sneaker sweepstakes platform and built the web and iOS product.",
    ],
  },
  {
    name: "Intel",
    role: "Software engineering intern · Chicago",
    details: ["Built full-stack internal tools."],
  },
  {
    name: "Northwestern",
    role: "BS + MS Computer Science · minor in Music",
    details: ["A semester at ETH Zurich."],
  },
  {
    name: "Meta",
    role: "Software engineer · Ads Serving",
    details: [
      "Worked on early-stage retrieval and late-stage optimizations for ad output formats.",
    ],
  },
  {
    name: "Foxglove",
    role: "Software engineer",
    details: ["Building ML tooling for roboticists."],
  },
];

export default function CareerPage() {
  return (
    <article className="career-page">
      <header className="career-header">
        <h1 className="career-title">the road so far</h1>
        <p className="career-intro">A few chapters, tied together.</p>
      </header>
      <div className="career-timeline">
        <ol className="career-chapters">
          {chapters.map((chapter) => (
            <li className="career-chapter" key={chapter.name}>
              <svg
                className="career-cord"
                viewBox="0 0 1000 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M170 0 L830 100" />
              </svg>
              <span className="career-knot" aria-hidden="true" />
              <section className="career-tag">
                <h2 className="career-company">{chapter.name}</h2>
                <p className="career-role">{chapter.role}</p>
                {chapter.details.map((detail) => (
                  <p className="career-detail" key={detail}>
                    {detail}
                  </p>
                ))}
              </section>
            </li>
          ))}
          <li className="career-chapter career-next">
            <svg
              className="career-cord"
              viewBox="0 0 1000 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M170 0 L230 80" />
            </svg>
            <span className="career-knot" aria-hidden="true" />
            <section className="career-tag">
              <h2 className="career-company">the next knot</h2>
              <p className="career-detail">
                Find where robotics and climate solutions align.
              </p>
            </section>
          </li>
        </ol>
      </div>
      <a
        className="career-resume"
        href="https://drive.google.com/file/d/130KQWH7hviU7HDY7dztdG4wLoJAI8ryw/view?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
      >
        Read my resume <span aria-hidden="true">↗</span>
        <span className="career-link-context"> (opens in a new tab)</span>
      </a>
    </article>
  );
}
