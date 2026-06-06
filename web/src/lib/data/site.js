/**
 * Site-wide constants and external links.
 * Edit these once and they update across the whole site.
 */
export const site = {
  name: 'Aksorn-LM',
  tagline: 'Aksorn-LM',
  description:
    'A Thai-first large language model platform for engineering workflows, evaluation, research, and real-world applications.',
  // Update these to your real project links.
  links: {
    github: 'https://github.com/your-org/thai-llm',
    huggingface: 'https://huggingface.co/thai-llm',
    discord: 'https://discord.gg/your-invite',
    x: 'https://x.com/your-handle'
  },
  // 3D mascot. Spline scene exported from spline-robot-head.html.
  // To swap the mascot, replace this .splinecode URL (Export -> Viewer in Spline).
  mascot: {
    splineUrl: 'https://prod.spline.design/dsP5vNHX1qAhnP8k/scene.splinecode'
  }
};

/** Primary navigation links (left side of the navbar). */
export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Model', href: '/model' },
  { label: 'Evaluation', href: '/evaluation' },
  { label: 'Research', href: '/research' },
  { label: 'Doc', href: '/docs' }
];

/** Status pills shown around the hero mascot. */
export const heroPills = [];
