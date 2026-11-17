const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function play(element: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
  if (reducedMotion()) return;
  element.animate(keyframes, options);
}

const SNAP = "cubic-bezier(0.2, 0.9, 0.3, 1.3)";

export function press(element: Element) {
  play(element, [{ transform: "scale(0.92)" }, { transform: "scale(1)" }], { duration: 220, easing: SNAP });
}

export function strike(element: Element) {
  play(
    element,
    [
      { transform: "scale(0.9)", backgroundColor: "var(--color-ink)", color: "var(--color-paper)" },
      { transform: "scale(1)" },
    ],
    { duration: 260, easing: SNAP },
  );
}

export function flash(element: Element) {
  play(element, [{ opacity: 0.25 }, { opacity: 1 }], { duration: 300, easing: "ease-out" });
}

export function tween(from: number, to: number, onFrame: (value: number) => void) {
  const duration = reducedMotion() ? 0 : 450;
  const start = performance.now();
  let frame = 0;
  const tick = (now: number) => {
    const progress = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - progress) ** 3;
    onFrame(Math.round(from + (to - from) * eased));
    if (progress < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  const settle = setTimeout(() => {
    cancelAnimationFrame(frame);
    onFrame(to);
  }, duration + 100);
  return () => {
    cancelAnimationFrame(frame);
    clearTimeout(settle);
  };
}
