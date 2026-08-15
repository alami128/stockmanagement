import type { StockStatus, StockUnit } from "@/lib/types";

type IconKind =
  | "pcs"
  | "bottle"
  | "egg"
  | "milk"
  | "oil"
  | "chicken"
  | "tomato"
  | "onion"
  | "rice"
  | "butter"
  | "bag"
  | "liquid";

const STATUS_TONE: Record<StockStatus, { wrap: string; ink: string }> = {
  needs_order: {
    wrap: "bg-neutral-900",
    ink: "text-white",
  },
  low: {
    wrap: "bg-neutral-900",
    ink: "text-white",
  },
  available: {
    wrap: "bg-neutral-900",
    ink: "text-white",
  },
};

function resolveKind(name: string, unit: StockUnit): IconKind {
  const n = name.toLowerCase();

  if (/egg/.test(n)) return "egg";
  if (/milk|cream/.test(n)) return "milk";
  if (/oil|vinegar|sauce/.test(n)) return "oil";
  if (/chicken|poultry|turkey|duck/.test(n)) return "chicken";
  if (/tomato/.test(n)) return "tomato";
  if (/onion|shallot|garlic/.test(n)) return "onion";
  if (/rice|grain|pasta|flour/.test(n)) return "rice";
  if (/butter|cheese/.test(n)) return "butter";

  if (unit === "pcs") return "pcs";
  if (unit === "bottle") return "bottle";
  if (unit === "L" || unit === "ml") return "liquid";
  return "bag";
}

function Glyph({ kind }: { kind: IconKind }) {
  const common = {
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-full w-full",
    "aria-hidden": true,
  };

  switch (kind) {
    case "pcs":
      return (
        <svg {...common}>
          <rect x="8" y="22" width="14" height="14" rx="2.5" />
          <rect x="26" y="22" width="14" height="14" rx="2.5" />
          <rect x="17" y="8" width="14" height="14" rx="2.5" />
        </svg>
      );
    case "bottle":
      return (
        <svg {...common}>
          <path d="M20 8h8v5c0 2 2 3 2 6v21a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V19c0-3 2-4 2-6V8z" />
          <path d="M20 8h8" />
          <path d="M18 24h12" />
        </svg>
      );
    case "liquid":
      return (
        <svg {...common}>
          <path d="M18 10h12v4c3 2 4 5 4 9v13a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V23c0-4 1-7 4-9v-4z" />
          <path d="M16 28c3 2 7 2 10 0s7-2 10 0" />
        </svg>
      );
    case "egg":
      return (
        <svg {...common}>
          <ellipse cx="24" cy="26" rx="10" ry="13" />
          <ellipse cx="21" cy="22" rx="2.5" ry="3.5" opacity="0.35" fill="currentColor" stroke="none" />
        </svg>
      );
    case "milk":
      return (
        <svg {...common}>
          <path d="M17 14h14l2 6v20a3 3 0 0 1-3 3H18a3 3 0 0 1-3-3V20l2-6z" />
          <path d="M19 14V9h10v5" />
          <path d="M16 24h16" />
        </svg>
      );
    case "oil":
      return (
        <svg {...common}>
          <path d="M22 6h4v7c3 2 5 5 5 9v16a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4V22c0-4 2-7 5-9V6z" />
          <path d="M20 28c2.5 1.5 5.5 1.5 8 0" />
        </svg>
      );
    case "chicken":
      return (
        <svg {...common}>
          <path d="M30 18c4 0 7 3 7 7 0 8-7 15-13 15s-10-5-10-11c0-5 3-9 8-10 1-4 4-6 8-6 1 0 2 .5 3 1.5" />
          <circle cx="33" cy="22" r="1.5" fill="currentColor" stroke="none" />
          <path d="M14 34c-2 2-4 4-6 4" />
        </svg>
      );
    case "tomato":
      return (
        <svg {...common}>
          <circle cx="24" cy="27" r="12" />
          <path d="M24 15c0-3 2-5 4-6-3 0-5 1-6 3-1-2-3-3-6-3 2 1 4 3 4 6" />
          <path d="M24 15v4" />
        </svg>
      );
    case "onion":
      return (
        <svg {...common}>
          <path d="M24 12c7 0 12 7 12 15s-5 13-12 13S12 35 12 27s5-15 12-15z" />
          <path d="M24 12c-1-3 0-5 2-7" />
          <path d="M24 12c1-3 0-5-2-7" />
          <path d="M16 26c3 4 7 6 8 6s5-2 8-6" />
        </svg>
      );
    case "rice":
      return (
        <svg {...common}>
          <path d="M14 18h20l3 22H11l3-22z" />
          <path d="M18 18c0-5 2-9 6-9s6 4 6 9" />
          <path d="M17 28h14" />
          <path d="M16 34h16" />
        </svg>
      );
    case "butter":
      return (
        <svg {...common}>
          <rect x="8" y="18" width="32" height="16" rx="3" />
          <path d="M8 24h32" />
          <path d="M16 18v16" />
          <path d="M32 18v16" />
        </svg>
      );
    case "bag":
    default:
      return (
        <svg {...common}>
          <path d="M16 16h16l3 24H13l3-24z" />
          <path d="M20 16c0-4 1.5-7 4-7s4 3 4 7" />
          <path d="M18 26h12" />
        </svg>
      );
  }
}

export default function ItemIcon({
  name,
  unit,
  status = "available",
  size = "md",
}: {
  name: string;
  unit: StockUnit;
  status?: StockStatus;
  size?: "sm" | "md" | "lg";
}) {
  const kind = resolveKind(name, unit);
  const tone = STATUS_TONE[status];
  const box =
    size === "lg" ? "h-14 w-14" : size === "sm" ? "h-10 w-10" : "h-12 w-12";
  const glyph = size === "lg" ? "h-8 w-8" : size === "sm" ? "h-5 w-5" : "h-6 w-6";

  return (
    <div
      className={`item-icon flex shrink-0 items-center justify-center rounded-full ${box} ${tone.wrap} ${tone.ink}`}
      title={unit === "pcs" ? "Pieces" : unit === "bottle" ? "Bottle" : unit}
    >
      <div className={glyph}>
        <Glyph kind={kind} />
      </div>
    </div>
  );
}
