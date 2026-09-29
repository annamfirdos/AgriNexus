import type { SVGProps } from 'react';

export function ArrowUpRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

export function Play(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <polygon points="6 4 20 12 6 20 6 4" />
    </svg>
  );
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c3 3.5 3 14.5 0 18" />
      <path d="M12 3c-3 3.5-3 14.5 0 18" />
    </svg>
  );
}

/** Sense — soil, water and weather signal, replacing the template's ImageIcon */
export function LeafDropIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20 4C11 4 4 11 4 20c9 0 16-7 16-16z" opacity="0.9" />
      <path d="M9 20c1.6-3.4 4.5-5.7 7.6-6.9-2.3 2.6-3.8 5.5-4.4 8.9H9z" fill="#050805" opacity="0.55" />
    </svg>
  );
}

/** Decide — the model reading signal into a recommendation, replacing MovieIcon */
export function ChipIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <rect x="6" y="6" width="12" height="12" rx="2.5" />
      <g stroke="#050805" strokeWidth="1.3" strokeLinecap="round">
        <path d="M9 6V3M15 6V3M9 21v-3M15 21v-3M6 9H3M6 15H3M21 9h-3M21 15h-3" />
      </g>
      <circle cx="12" cy="12" r="2.6" fill="#050805" />
    </svg>
  );
}

/** Grow — yield turning into income, replacing LightbulbIcon */
export function SproutCartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 3c.6 3-1 5-3.3 5.9C9.1 6.6 10.3 4.4 12 3z" />
      <path d="M12 3c-.6 3 1 5 3.3 5.9C14.9 6.6 13.7 4.4 12 3z" />
      <path d="M12 8.6v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 12h16l-1.6 7.2a2 2 0 0 1-2 1.6H7.6a2 2 0 0 1-2-1.6L4 12z" />
      <circle cx="9.5" cy="12" r="0" />
    </svg>
  );
}
