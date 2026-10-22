// Simple inline illustrations of a robot vacuum and a dishwasher, drawn in the RoboCare palette.
// Decorative only: they are hidden from assistive technology.

export function RobotVacuumArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 200" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="160" cy="184" rx="118" ry="10" fill="#0f1d2b" opacity="0.1" />
      <ellipse cx="160" cy="142" rx="122" ry="38" fill="#1c2b3a" />
      <ellipse cx="160" cy="134" rx="106" ry="30" fill="#2d4256" />
      <ellipse cx="160" cy="134" rx="64" ry="17" fill="none" stroke="#0b5d54" strokeWidth="3" opacity="0.85" />
      <circle cx="160" cy="134" r="10" fill="#0b5d54" />
      <rect x="262" y="130" width="14" height="6" rx="3" fill="#5fd0bf" />
    </svg>
  );
}

export function DishwasherArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="160" cy="226" rx="130" ry="9" fill="#0f1d2b" opacity="0.1" />
      <rect x="40" y="26" width="240" height="196" rx="16" fill="#e4ebe8" stroke="#c6d2ce" strokeWidth="2" />
      <rect x="40" y="26" width="240" height="40" rx="16" fill="#d3ddd9" />
      <rect x="132" y="38" width="56" height="14" rx="4" fill="#0b5d54" />
      <rect x="52" y="80" width="216" height="130" rx="10" fill="#f7faf9" stroke="#c6d2ce" strokeWidth="2" />
      <rect x="78" y="106" width="164" height="12" rx="6" fill="#9dada8" />
      <rect x="78" y="150" width="164" height="12" rx="6" fill="#9dada8" />
      <ellipse cx="116" cy="138" rx="24" ry="11" fill="#ffffff" stroke="#b9c7c2" strokeWidth="2" />
      <ellipse cx="170" cy="138" rx="24" ry="11" fill="#ffffff" stroke="#b9c7c2" strokeWidth="2" />
      <ellipse cx="224" cy="138" rx="24" ry="11" fill="#ffffff" stroke="#b9c7c2" strokeWidth="2" />
      <circle cx="96" cy="186" r="6" fill="#9dada8" />
      <circle cx="224" cy="186" r="6" fill="#9dada8" />
    </svg>
  );
}

// Hero panel used on the homepage and the page headers. Pure layout, no data.
export function ApplianceVisual({ className = "" }: { className?: string }) {
  return (
    <div className={`relative mx-auto aspect-[5/4] w-full max-w-md ${className}`}>
      <div className="absolute inset-x-[6%] top-[8%] bottom-[8%] rounded-[2.5rem] bg-brand-soft" aria-hidden="true" />
      <DishwasherArt className="absolute right-0 top-[10%] w-[78%] drop-shadow-[0_18px_30px_rgb(15_29_43/0.16)]" />
      <RobotVacuumArt className="animate-float absolute bottom-[6%] left-0 w-[58%] drop-shadow-[0_14px_22px_rgb(15_29_43/0.22)]" />
      <div className="animate-float-slow absolute left-[2%] top-[4%] flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-xs font-medium text-ink shadow-lg ring-1 ring-border">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-soft text-brand">#</span>
        Reference for every request
      </div>
      <div className="animate-float-slow absolute bottom-[12%] right-[2%] flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-xs font-medium text-ink shadow-lg ring-1 ring-border [animation-delay:1.5s]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-soft text-brand">✓</span>
        Visits confirmed by our team
      </div>
    </div>
  );
}
