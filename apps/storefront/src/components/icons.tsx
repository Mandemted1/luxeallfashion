export function FilterIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <line x1="2" y1="5" x2="18" y2="5" />
      <circle cx="12" cy="5" r="2" fill="currentColor" stroke="none" />
      <line x1="2" y1="10" x2="18" y2="10" />
      <circle cx="7" cy="10" r="2" fill="currentColor" stroke="none" />
      <line x1="2" y1="15" x2="18" y2="15" />
      <circle cx="14" cy="15" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CloseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <line x1="3" y1="3" x2="17" y2="17" />
      <line x1="17" y1="3" x2="3" y2="17" />
    </svg>
  );
}

export function ChevronDownIcon({
  className = "h-3.5 w-3.5",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <polyline points="5 8 10 13 15 8" />
    </svg>
  );
}
