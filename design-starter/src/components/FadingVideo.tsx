import { useEffect, useRef, useState, type CSSProperties } from 'react';

type Props = {
  src?: string | string[];
  className?: string;
  style?: CSSProperties;
};

/**
 * A background <video> that fades in once a frame is ready and fades out
 * just before it loops or advances, so cuts never show as a hard pop.
 *
 * No real farm cinematography ships with this template — pass your own
 * `src` (a single clip, or an array to cycle through) once you have one.
 * With no `src`, an ambient animated field gradient stands in so every
 * section still reads as intentional rather than a broken video tag.
 */
export default function FadingVideo({ src, className, style }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const fadingOutRef = useRef(false);
  const rafRef = useRef<number>();

  const sources = Array.isArray(src) ? src : src ? [src] : [];
  const current = sources[index];

  function animateOpacity(target: number, durationMs: number) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    const from = opacity;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setOpacity(from + (target - from) * t);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !current) return;
    fadingOutRef.current = false;

    const onLoaded = () => animateOpacity(1, 500);
    const onTimeUpdate = () => {
      if (!v.duration || fadingOutRef.current) return;
      if (v.duration - v.currentTime <= 0.55) {
        fadingOutRef.current = true;
        animateOpacity(0, 550);
      }
    };
    const onEnded = () => {
      if (sources.length > 1) {
        setIndex((i) => (i + 1) % sources.length);
      } else {
        v.currentTime = 0;
        v.play().catch(() => {});
        animateOpacity(1, 500);
        fadingOutRef.current = false;
      }
    };

    v.addEventListener('loadeddata', onLoaded);
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('ended', onEnded);
    return () => {
      v.removeEventListener('loadeddata', onLoaded);
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('ended', onEnded);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  if (!current) {
    return (
      <div className={className} style={style} aria-hidden="true">
        <div className="ambient-field" />
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      key={current}
      src={current}
      className={className}
      style={{ ...style, opacity }}
      autoPlay
      muted
      playsInline
      preload="auto"
    />
  );
}
