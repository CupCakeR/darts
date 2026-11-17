import { useEffect, useRef, useState } from "react";
import { tween } from "./motion.ts";

export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const current = useRef(value);

  useEffect(
    () =>
      tween(current.current, value, (next) => {
        current.current = next;
        setShown(next);
      }),
    [value],
  );

  return <span className={className}>{shown}</span>;
}
