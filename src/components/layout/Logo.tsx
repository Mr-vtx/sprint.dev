/** Route glyph: two nodes joined by a line, ending in a milestone diamond. */
export default function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 18V9.5C6 7.6 7.6 6 9.5 6H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="6" cy="18" r="2.6" fill="currentColor" />
      <rect x="14.6" y="2.6" width="6.4" height="6.4" rx="1.2" transform="rotate(45 17.8 5.8)" fill="var(--c-amber)" />
    </svg>
  );
}
