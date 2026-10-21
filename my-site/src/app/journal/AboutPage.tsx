import Image from "next/image";
import "./loose-notes.css";
import { SunDrawing } from "../InkDrawings";

export default function AboutPage() {
  return (
    <article className="about-page">
      <div className="about-copy">
        <h1 className="about-name">Isaac Sun</h1>
        <svg className="about-rule" viewBox="0 0 300 18" aria-hidden="true">
          <path d="M3 12 Q143 2 294 5 M10 16 Q150 6 285 10" />
        </svg>
        <p className="about-lead">
          My interests lie within finding the intersection of{" "}
          <span className="about-highlight">
            robotics and climate solutions
          </span>
          .
        </p>
        <div className="about-bio">
          <p>
            My name is Isaac Sun and I&apos;m a recent graduate of Northwestern
            University with a BS/MS in Computer Science and a minor in Music.
          </p>
        </div>
        <a
          className="about-writing"
          href="https://isaacsun.substack.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          I like to write here{" "}
          <span className="about-substack">(substack)</span>{" "}
          <span aria-hidden="true">↗</span>
          <span className="about-link-context"> (opens in a new tab)</span>
        </a>
      </div>
      <SunDrawing className="about-sun-drawing" />
      <div className="about-photos">
        <svg className="about-cloud" viewBox="0 0 190 60" aria-hidden="true">
          <path d="M6 43 Q38 16 68 36 Q99 -7 132 30 Q161 17 179 48 M17 48 Q78 58 157 49" />
        </svg>
        <figure className="about-sunset">
          <Image
            className="about-sunset-source"
            src="/photos/about-sunset-reference.png"
            alt="Isaac in the grassy hills beneath a pastel sunset"
            width={1070}
            height={1028}
            sizes="(max-width: 700px) 200vw, 120vw"
            priority
          />
        </figure>
        <figure className="about-portrait">
          <Image
            src="/photos/profilePic.jpeg"
            alt="Isaac hiking in a sunlit forest"
            fill
            sizes="(max-width: 700px) 140px, 190px"
          />
        </figure>
        <svg className="about-arrow" viewBox="0 0 40 75" aria-hidden="true">
          <path d="M11 5 Q33 31 20 62 M10 51 L20 65 L30 54" />
        </svg>
      </div>
    </article>
  );
}
