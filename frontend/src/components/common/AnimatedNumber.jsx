import { useEffect, useState, useRef } from 'react';

export default function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const target = Number(value) || 0;
    const start = 0;
    startRef.current = null;

    function step(timestamp) {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.floor(start + (target - start) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(target);
      }
    }

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return <span>{display}</span>;
}