// Placeholder mark — swap for the real logo file (SVG preferred) once it's supplied.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1" />
      <text
        x="20"
        y="27"
        textAnchor="middle"
        fontSize="18"
        fontFamily="var(--font-geist-sans), sans-serif"
        fill="currentColor"
      >
        K
      </text>
    </svg>
  );
}
