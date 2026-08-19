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

export function UserIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <circle cx="10" cy="6.5" r="3.2" />
      <path d="M3.5 17c1-3.6 4-5.5 6.5-5.5s5.5 1.9 6.5 5.5" />
    </svg>
  );
}

export function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <path d="M5 3h2.3l1 3.3-1.6 1.4a10 10 0 0 0 5.6 5.6l1.4-1.6 3.3 1v2.3a1.5 1.5 0 0 1-1.6 1.5A13.5 13.5 0 0 1 3.5 4.6 1.5 1.5 0 0 1 5 3Z" />
    </svg>
  );
}

export function MailIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <rect x="2.5" y="4.5" width="15" height="11" rx="1" />
      <path d="M3 5.5 10 11l7-5.5" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <path d="M4 17.5 5 14a7 7 0 1 1 2.7 2.6L4 17.5Z" />
      <path d="M7.3 8.6c.2 2 2.1 3.9 4.1 4.1.9.1 1.1-.6 1.1-1l-.1-.7a.4.4 0 0 0-.3-.3l-1.3-.4a.4.4 0 0 0-.4.1l-.4.5a4 4 0 0 1-1.9-1.9l.5-.4a.4.4 0 0 0 .1-.4L8.3 7a.4.4 0 0 0-.3-.3l-.7-.1c-.4 0-1.1.2-1 1.1Z" />
    </svg>
  );
}

export function EyeIcon({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z" />
      <circle cx="10" cy="10" r="2.3" />
    </svg>
  );
}

export function EyeOffIcon({
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
      <path d="M2.5 2.5l15 15" />
      <path d="M8.3 4.2A8.6 8.6 0 0 1 10 4c5.5 0 8.5 6 8.5 6a15 15 0 0 1-2.9 3.6M5.6 5.6C3 7.2 1.5 10 1.5 10s3 6 8.5 6c1 0 1.9-.2 2.7-.5" />
      <path d="M7.8 8a2.3 2.3 0 0 0 3.2 3.2" />
    </svg>
  );
}

export function ChevronLeftIcon({
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
      <polyline points="12 5 7 10 12 15" />
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
