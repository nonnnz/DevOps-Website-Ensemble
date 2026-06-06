/**
 * Svelte action: reveal an element on scroll (fade + rise).
 * Adds `.is-visible` when the element enters the viewport.
 *
 * Usage: <div use:reveal> ... </div>  (requires the .reveal CSS in app.css)
 *
 * Falls back to immediately visible if IntersectionObserver is unavailable
 * (old browsers / SSR-less environments), so content is never stuck hidden.
 *
 * @param {HTMLElement} node
 * @param {{ threshold?: number, once?: boolean }} [options]
 */
export function reveal(node, options = {}) {
  const { threshold = 0.12, once = true } = options;

  if (typeof IntersectionObserver === 'undefined') {
    node.classList.add('reveal', 'is-visible');
    return {};
  }

  node.classList.add('reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          node.classList.add('is-visible');
          if (once) observer.unobserve(node);
        } else if (!once) {
          node.classList.remove('is-visible');
        }
      }
    },
    { threshold }
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    }
  };
}
