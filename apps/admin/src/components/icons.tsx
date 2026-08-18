export function GridIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
      className={className}
    >
      <rect x="2.5" y="2.5" width="6" height="6" rx="0.5" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="0.5" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="0.5" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="0.5" />
    </svg>
  );
}

export function BagIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M5 7h10l-.7 9.3a1 1 0 0 1-1 .7H6.7a1 1 0 0 1-1-.7L5 7Z" />
      <path d="M7.2 7V5.5a2.8 2.8 0 0 1 5.6 0V7" />
    </svg>
  );
}

export function BoxIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M10 2.5 17 6v8l-7 3.5L3 14V6l7-3.5Z" />
      <path d="M3 6l7 3.5L17 6" />
      <path d="M10 9.5V17" />
    </svg>
  );
}

export function TagIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M11 3h4a2 2 0 0 1 2 2v4l-8.5 8.5a1.4 1.4 0 0 1-2 0l-4-4a1.4 1.4 0 0 1 0-2L11 3Z" />
      <circle cx="13.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function UsersIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="7.2" cy="6.5" r="2.4" />
      <path d="M2.5 16c.6-2.7 2.4-4.2 4.7-4.2s4.1 1.5 4.7 4.2" />
      <circle cx="14" cy="7.2" r="1.9" />
      <path d="M13 11.9c1.9.2 3.2 1.6 3.7 4.1" />
    </svg>
  );
}

export function MapPinIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M10 17.5S16 12.4 16 8a6 6 0 1 0-12 0c0 4.4 6 9.5 6 9.5Z" />
      <circle cx="10" cy="8" r="2" />
    </svg>
  );
}

export function PercentIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
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
      <line x1="15" y1="5" x2="5" y2="15" />
      <circle cx="6" cy="6" r="1.8" />
      <circle cx="14" cy="14" r="1.8" />
    </svg>
  );
}

export function MegaphoneIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 8.5v3a1 1 0 0 0 1 1h1.5L11 16v-11L5.5 7.5H4a1 1 0 0 0-1 1Z" />
      <path d="M11 5v10" />
      <path d="M14 7.5a3 3 0 0 1 0 5" />
    </svg>
  );
}

export function HomeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 9.5 10 3l7 6.5" />
      <path d="M5 8v8.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V8" />
    </svg>
  );
}

export function PencilIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12.5 3.5 16.5 7.5 7 17H3v-4L12.5 3.5Z" />
      <path d="M11 5l4 4" />
    </svg>
  );
}

export function TrashIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 6h12" />
      <path d="M7.5 6V4.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V6" />
      <path d="M5.5 6l.7 9.4a1 1 0 0 0 1 .9h5.6a1 1 0 0 0 1-.9L14.5 6" />
      <path d="M8.3 9v4.5" />
      <path d="M11.7 9v4.5" />
    </svg>
  );
}

export function PlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M10 4v12" />
      <path d="M4 10h12" />
    </svg>
  );
}

export function ImageIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="2.5" y="3.5" width="15" height="13" rx="1" />
      <circle cx="7" cy="8" r="1.4" />
      <path d="M4 15l4.5-4.5a1.2 1.2 0 0 1 1.7 0L13 13.3" />
      <path d="M12 12.3l1.3-1.3a1.2 1.2 0 0 1 1.7 0L17 13.5" />
    </svg>
  );
}
