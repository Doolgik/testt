export default function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="26" height="26" rx="7" fill="#0F5EFF" />
        <path
          d="M7 19V7h2.1l7.8 8.4V7H19v12h-2.1L9.1 10.6V19H7Z"
          fill="#fff"
        />
      </svg>
      <span className="display text-[1.05rem] font-bold tracking-tightest text-ink">
        NOVA<span className="text-muted font-medium"> Consulting</span>
      </span>
    </span>
  );
}
