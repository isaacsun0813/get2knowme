# Provisional direction for Isaac's portfolio

This initial toolkit direction is superseded by [the supplied handoff](HANDOFF.md)
and [the local implementation/review notes](REVIEW.md). Retained as research context.

This captures the request from 15 October 2026. It is not the final design plan.
Isaac will supply that plan and Blender files after toolkit preparation.

## Confirmed intent

Deep redesign; strong art direction; Pinterest-like and PostHog-like personality;
new Blender material; maintainable, simple code; real browser and 3D verification.
Avoid the interchangeable "sleek and modern" AI landing page.

## Working interpretation to confirm against the incoming references

A personal collection with a sense of place: objects, photographs, annotations,
and meaningful details that belong to Isaac. Explore tactile materials and
playful interaction, with enough structure to make projects and biography easy
to find. Pinterest here could mean a collected visual sensibility, a collage,
or an actual masonry composition; do not assume which without the brief.

PostHog's useful lesson is the coherence of its visual world and playful browser
metaphors. Its public [brand principles](https://posthog.com/handbook/brand/foundations)
emphasize intentional detail and personality. Its [asset guidance](https://posthog.com/handbook/brand/assets)
explicitly rejects generic SaaS layouts. Adapt those principles to Isaac's story;
create original artwork and choose an interaction metaphor appropriate to him.

## Decisions to extract from the design plan

| Decision | Evidence to use | Output |
| --- | --- | --- |
| Visitor's purpose | Portfolio content and intended audience | Primary path to work, biography, contact |
| Visual world | User's board, favorite details, anti-references | One short art-direction statement |
| Typography | Reference hierarchy and actual content | Named font roles, sizes, line lengths |
| Materials and color | Blender renders, photos, references | Small token palette and surface rules |
| Composition | Desktop and phone references | Representative layouts with real content |
| Motion | Desired object behavior and navigation | Trigger, duration, reduced-motion alternative |
| 3D purpose | Supplied objects and intended interactions | What is 3D, what stays HTML, fallback |

Do not lock in cream/serif/terracotta, a fake operating system, scrapbook tape,
or masonry solely because they are recognizable style labels. A specific
reference or the user's choice should justify them. No final fonts or palette
have been selected.

## Reference pool for the incoming moodboard

These sources were opened during research. They are a pool for selecting
specific reference details once Isaac's board arrives, not a combined template.

| Reference | What to investigate | Boundary |
| --- | --- | --- |
| [PostHog](https://posthog.com/) | Playful desktop metaphor, material consistency, artwork around useful content | Its current desktop was captured and viewed in Chromium; copying the entire OS metaphor is not assumed |
| [Hoverstat.es](https://www.hoverstat.es/) | Alternative portfolios and interactions that escape standard landing-page structure | Choose a relevant example; novelty alone is insufficient |
| [Siteinspire](https://www.siteinspire.com/) | Portfolio, unusual-layout, photography, and typography categories | Use for composition comparison, not a preset |
| [Bruno Simon](https://bruno-simon.com/) | A portfolio where the interactive world is the experience | Investigate navigation/access costs before adopting game-like exploration |
| [Maggie Appleton](https://maggieappleton.com/) | Personal illustration and explanation as an identity | Evaluate as a personal publishing reference rather than a ready-made layout |

Keep a compact working board: for each selected image, record the exact detail
we want to borrow, its source, and why it fits Isaac. Include anti-references so
"playful" does not drift into arbitrary decoration. Compare reference motion
in a browser where accessible; a static screenshot cannot specify behavior.

## Design constraints

- Give the first viewport a characteristic piece of Isaac's world and useful
  content. Avoid a long entrance sequence that blocks access to his work.
- Use varied scale and grouping for hierarchy. Keep reading order clear when
  the composition is asymmetric or collage-like.
- Make materials agree: shadows, edges, texture scale, lighting, and object
  perspective should look related across the scene and the page.
- Treat handwriting, stickers, and ornamental type as accents when relevant;
  body copy and controls remain readable.
- Use real projects and personal material. Keep copy specific and brief.
- Make interactions discoverable. Provide visible focus, keyboard equivalents,
  touch targets, and direct access to essential content.
- Let mobile express the same identity with a composition suited to its size.
  Decide the 3D fallback from evidence rather than maintaining two unrelated sites.

## Critique rubric

Rate each dimension 1–5 after viewing the rendered screenshots. The score is a
structured editorial judgment, not a machine measurement.

| Dimension | What earns a strong score |
| --- | --- |
| Identity | Recognizably Isaac; specific assets and choices |
| Composition | A clear focal point, useful hierarchy, balanced density |
| Typography | Distinct roles, readable rhythm, intentional scale |
| Material cohesion | CSS and 3D belong to the same visual world |
| Content | Visitors can understand Isaac and find his work quickly |
| Interaction | Play supports exploration; controls explain themselves |
| Adaptation | Phone, keyboard, reduced motion, and fallback remain useful |

For each weak dimension, name the visible problem and its concrete fix. Compare
to references; "make it premium" is not an actionable critique. Do not certify
the design by its average score or by passing an automated accessibility scan.

## Implementation sequence after the brief arrives

1. Inventory references and assets; settle the scene's role and core navigation.
2. Produce one representative desktop and phone composition with the real assets.
3. Establish shared tokens and a small set of primitives from that composition.
4. Complete content and interactions; refactor the incumbent code in working slices.
5. Verify browser flows, visual consistency, 3D import, fallback, accessibility,
   and performance; leave screenshots and an honest handoff.

Record unresolved choices and material departures from the brief as they arise.
