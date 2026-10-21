import "./loose-notes.css";
import { PaperPlaneDrawing, EarthSketch } from "../InkDrawings";

const places = [
  ["Saratoga", "where I grew up"],
  ["SF", "startup central"],
  ["Chicago", "college"],
  ["Zurich", "studied abroad"],
  ["Shanghai", "ancestral home"],
];

export default function VibesPage() {
  return (
    <article className="vibes-page">
      <header className="vibes-header">
        <h1 className="vibes-title">i wanted to fly.</h1>
      </header>
      <div className="vibes-letter-scene">
        <div className="vibes-letter">
          <p className="vibes-paragraph vibes-memory">
            That was my childhood dream. I would always think about it. I made
            every type of paper airplane possible, ran parkour over our
            elementary school roof, and jumped off way too many tall buildings
            chasing that dream. I still remember when my cousin let me fly his
            drone before school in 2nd grade, right before I crashed it into the
            ground.
          </p>
          <PaperPlaneDrawing className="vibes-plane" />
          <p className="vibes-paragraph vibes-earth-story">
            As I grew older, I became more interested in the systems that power
            the world, especially the ones that impact{" "}
            <span className="vibes-earth-words">Mother Earth</span>. When I was
            thinking about how to build my personal site, it felt fitting to
            center it around the theme of flight (planes) and my passion for
            climate (Earth). I chose five locations that shaped me: Saratoga
            (where I grew up), SF (startup central), Chicago (where I went to
            college), Zurich (where I studied abroad), and Shanghai (my
            ancestral home).
          </p>
          <EarthSketch className="vibes-world-drawing" />
          <p className="vibes-paragraph vibes-future">
            I have a lot of dreams and I&apos;m actively working to bring them
            to life. Thanks for visiting my site :D
          </p>
          <p className="vibes-signature">- isaac</p>
        </div>
        <aside className="vibes-places" aria-label="The places that shaped me">
          {places.map(([place, note], index) => (
            <div className={`vibes-place vibes-place-${index}`} key={place}>
              <span className="vibes-place-name">{place}</span>
              <span className="vibes-place-note">{note}</span>
            </div>
          ))}
        </aside>
      </div>
    </article>
  );
}
