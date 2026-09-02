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
  | "cheese"
  | "pepper"
  | "flour"
  | "vanilla"
  | "toffee"
  | "coffee"
  | "bag"
  | "liquid";

const STATUS_TONE: Record<StockStatus, { wrap: string; ink: string }> = {
  needs_order: {
    wrap: "bg-red-500",
    ink: "text-white",
  },
  low: {
    wrap: "bg-yellow-400",
    ink: "text-white",
  },
  available: {
    wrap: "bg-green-500",
    ink: "text-white",
  },
};

function resolveKind(name: string, unit: StockUnit): IconKind {
  const n = name.toLowerCase();

  if (/egg/.test(n)) return "egg";
  if (/milk|cream/.test(n)) return "milk";
  if (/black\s*pepper|white\s*pepper|peppercorn|ground\s*pepper|cracked\s*pepper/.test(n))
    return "pepper";
  if (/oil|vinegar|sauce/.test(n)) return "oil";
  if (/chicken|poultry|turkey|duck/.test(n)) return "chicken";
  if (/tomato/.test(n)) return "tomato";
  if (/onion|shallot|garlic/.test(n)) return "onion";
  if (/plain\s*flour|all[\s-]*purpose\s*flour|\bflour\b/.test(n)) return "flour";
  if (/rice|grain|pasta/.test(n)) return "rice";
  if (/butter/.test(n)) return "butter";
  if (/cheese/.test(n)) return "cheese";
  if (/vanilla/.test(n)) return "vanilla";
  if (/sticky\s*toffee|toffee\s*pudding|\btoffee\b/.test(n)) return "toffee";
  if (/espresso|\bcoffee\b/.test(n)) return "coffee";

  if (unit === "pcs") return "pcs";
  if (unit === "bottle") return "bottle";
  if (unit === "bags" || unit === "packets" || unit === "boxes") return "bag";
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
          <ellipse
            cx="21"
            cy="22"
            rx="2.5"
            ry="3.5"
            opacity="0.35"
            fill="currentColor"
            stroke="none"
          />
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
        <svg {...common} fill="currentColor" stroke="none">
          {/* Overflowing rice mound */}
          <path
            d="M15 16c1.5-4 4-7 9-7s7.5 3 9 7c.8 2.2.5 4.5-.5 5.5H15.5c-1-1-1.3-3.3-.5-5.5z"
            opacity="0.95"
          />
          <path
            d="M15 16c.6-1.6 1.5-3 2.8-4.1-.4 1.5-.3 3.3.3 4.8.4 1.1.3 2.3-.1 3.3H15.5c-1-1-1.3-3.3-.5-5.5.1.5.2 1 .2 1.5z"
            opacity="0.3"
          />
          {/* Sack body */}
          <path
            d="M14 20.5h20l2.5 18.5c0 1.8-2.2 3-4.5 3H16c-2.3 0-4.5-1.2-4.5-3L14 20.5z"
            opacity="0.9"
          />
          {/* Left shade on sack */}
          <path
            d="M14 20.5h5.5v21.5c-2.8-.2-5-1.4-5-3L14 20.5z"
            opacity="0.25"
          />
          {/* Sack rim / fold */}
          <path
            d="M13.5 18.5h21c.8 0 1.5.7 1.5 1.5v1.2H12V20c0-.8.7-1.5 1.5-1.5z"
            opacity="0.85"
          />
          {/* RICE lettering */}
          <text
            x="24"
            y="32.5"
            textAnchor="middle"
            fontSize="8"
            fontWeight="700"
            letterSpacing="0.5"
            opacity="0.5"
            fill="currentColor"
          >
            RICE
          </text>
        </svg>
      );
    case "butter":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          {/* Top face */}
          <path
            d="M10 18 L30 12 L42 18 L22 24 Z"
            opacity="0.95"
          />
          {/* Left / long side */}
          <path
            d="M10 18 L22 24 L22 38 L10 32 Z"
            opacity="0.75"
          />
          {/* Right / short end (darker shade) */}
          <path
            d="M22 24 L42 18 L42 32 L22 38 Z"
            opacity="0.55"
          />
          {/* Soft edge lines */}
          <path
            d="M10 18 L30 12 L42 18 L22 24 Z M10 18 L22 24 L22 38 L10 32 Z M22 24 L42 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
            opacity="0.35"
          />
          {/* Tiny texture dots */}
          <circle cx="16" cy="26" r="0.7" opacity="0.35" />
          <circle cx="18" cy="30" r="0.6" opacity="0.3" />
          <circle cx="28" cy="28" r="0.65" opacity="0.3" />
          <circle cx="32" cy="22" r="0.55" opacity="0.25" />
        </svg>
      );
    case "cheese":
      return (
        <svg {...common}>
          <rect x="8" y="18" width="32" height="16" rx="3" />
          <path d="M8 24h32" />
          <path d="M16 18v16" />
          <path d="M32 18v16" />
        </svg>
      );
    case "pepper":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          {/* Cap */}
          <ellipse cx="24" cy="11" rx="9" ry="5.5" opacity="0.95" />
          <path d="M15 11c0 2.8 4 4.5 9 4.5s9-1.7 9-4.5" opacity="0.75" />
          {/* Cap holes */}
          <ellipse cx="20" cy="9.5" rx="1.1" ry="2" opacity="0.35" />
          <ellipse cx="24" cy="9" rx="1.1" ry="2.2" opacity="0.35" />
          <ellipse cx="28" cy="9.5" rx="1.1" ry="2" opacity="0.35" />
          {/* Body */}
          <path
            d="M16 15.5c0 0 1.5 2 2.5 6.5C19.5 28 18 36 18 39.5c0 2.5 2.7 3.5 6 3.5s6-1 6-3.5c0-3.5-1.5-11.5-.5-17.5 1-4.5 2.5-6.5 2.5-6.5H16z"
            opacity="0.9"
          />
          {/* Side shade */}
          <path
            d="M16 15.5c0 0 1.2 2 2 6.2C19 28 17.8 36 17.8 39.2c0 1.4.9 2.4 2.4 3-.8.2-1.7.3-2.2.3-3.3 0-6-1-6-3.5 0-3.5 1.5-11.5.5-17.5C11.5 17.5 13 15.5 13 15.5h3z"
            opacity="0.25"
          />
          {/* Letter P */}
          <path
            d="M21.2 22.5h4.2c2.4 0 3.9 1.3 3.9 3.3 0 2-1.5 3.3-3.9 3.3h-2.2V34h-2V22.5zm2 4.8h2c1.1 0 1.8-.6 1.8-1.5s-.7-1.5-1.8-1.5h-2v3z"
            opacity="0.55"
          />
          {/* Pepper grains */}
          <circle cx="29" cy="21" r="1" opacity="0.4" />
          <circle cx="31" cy="23.5" r="0.85" opacity="0.4" />
          <circle cx="28.5" cy="24.5" r="0.75" opacity="0.35" />
          <circle cx="19.5" cy="33" r="0.9" opacity="0.4" />
          <circle cx="21.5" cy="35" r="0.75" opacity="0.35" />
          <circle cx="30" cy="33.5" r="0.85" opacity="0.4" />
          <circle cx="28" cy="36" r="0.7" opacity="0.35" />
        </svg>
      );
    case "flour":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          {/* Flour mound */}
          <path
            d="M16 17c2-5 5-8 8-8s6 3 8 8c1 2.5.5 4.5-.8 5H16.8c-1.3-.5-1.8-2.5-.8-5z"
            opacity="0.95"
          />
          <circle cx="20" cy="13" r="1.4" opacity="0.55" />
          <circle cx="24" cy="11.5" r="1.6" opacity="0.55" />
          <circle cx="28" cy="13.5" r="1.3" opacity="0.55" />
          {/* Sack body */}
          <path
            d="M14 21h20l2 18c0 2-2.5 3.5-5 3.5H17c-2.5 0-5-1.5-5-3.5l2-18z"
            opacity="0.88"
          />
          {/* Left shade */}
          <path
            d="M14 21h6v21.5c-2.6-.2-5-1.5-5-3.5l-1-18z"
            opacity="0.22"
          />
          {/* Rolled rim */}
          <path
            d="M13 19h22c1 0 1.8.8 1.8 1.8v1.4H11.2v-1.4c0-1 .8-1.8 1.8-1.8z"
            opacity="0.75"
          />
          {/* Yellow-style grain emblem (reads as lighter mark on monochrome icon) */}
          <g opacity="0.55">
            <path d="M24 25.5c-1.2 2.2-1.4 4.4-.6 6.2 1.4-1.2 2.4-3.2 2.4-5.2 0-.4-.6-.8-1.8-1z" />
            <path d="M24 25.5c1.2 2.2 1.4 4.4.6 6.2-1.4-1.2-2.4-3.2-2.4-5.2 0-.4.6-.8 1.8-1z" />
            <path d="M24 24.8c-.2 2.4.2 4.8 1.4 6.4.2-2.2.1-4.4-.4-6.2-.2-.4-.7-.4-1 0z" />
          </g>
        </svg>
      );
    case "vanilla":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          {/* Cap */}
          <rect x="17" y="6" width="14" height="6" rx="1.5" opacity="0.95" />
          <rect x="18.5" y="6.8" width="2" height="4.2" rx="0.6" opacity="0.35" />
          {/* Neck */}
          <path d="M20 12h8v4h-8z" opacity="0.8" />
          {/* Bottle body */}
          <path
            d="M16 16h16v22c0 2.2-2 3.5-4.5 3.5h-7C18 41.5 16 40.2 16 38V16z"
            opacity="0.9"
          />
          {/* Left highlight */}
          <path
            d="M16 16h4.5v22c-1.8-.2-3-1.2-3-2.5V16z"
            opacity="0.25"
          />
          {/* Label */}
          <rect
            x="18"
            y="21"
            width="12"
            height="14"
            rx="1.2"
            opacity="0.35"
          />
          <rect
            x="19"
            y="22"
            width="10"
            height="12"
            rx="0.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.9"
            opacity="0.45"
          />
          <text
            x="24"
            y="27.5"
            textAnchor="middle"
            fontSize="4.2"
            fontWeight="700"
            opacity="0.7"
            fill="currentColor"
          >
            VANILLA
          </text>
          <text
            x="24"
            y="32.5"
            textAnchor="middle"
            fontSize="4"
            fontWeight="700"
            opacity="0.7"
            fill="currentColor"
          >
            EXTRACT
          </text>
        </svg>
      );
    case "toffee":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          {/* Plate */}
          <ellipse cx="24" cy="39" rx="14" ry="3.5" opacity="0.55" />
          {/* Cake base (lighter) */}
          <path
            d="M12 28c0-8 5.5-16 12-16s12 8 12 16c0 2-2.5 3.5-5 3.5H17c-2.5 0-5-1.5-5-3.5z"
            opacity="0.55"
          />
          {/* Toffee sauce drip on top (darker) */}
          <path
            d="M12.5 24c1.2-7 5.5-12 11.5-12s10.3 5 11.5 12c.2 1.2-.8 1.8-1.8 1.5-1.5-.5-2.5.3-3.5 1.2-1 .9-2.2.4-3.2-.2s-2-.8-3.2-.1c-1.1.6-2.3 1.2-3.5.4-1.1-.8-2.2-1.5-3.6-.9-1.2.5-2.3.8-3.4.3-.9-.4-1.1-1.4-.8-2.2z"
            opacity="0.9"
          />
          {/* Topping dots */}
          <circle cx="18" cy="18" r="1.1" opacity="0.4" />
          <circle cx="22" cy="15.5" r="1" opacity="0.4" />
          <circle cx="27" cy="15" r="1.15" opacity="0.4" />
          <circle cx="30.5" cy="18" r="1" opacity="0.4" />
          <circle cx="20.5" cy="20.5" r="0.9" opacity="0.35" />
          <circle cx="25.5" cy="19.5" r="0.95" opacity="0.35" />
          {/* Mint leaves */}
          <path
            d="M24 8.5c-2.2 1.2-3.5 3.2-3.2 4.8 1.8-.4 3.2-2 3.2-4.8z"
            opacity="0.75"
          />
          <path
            d="M24 8.5c2.2 1.2 3.5 3.2 3.2 4.8-1.8-.4-3.2-2-3.2-4.8z"
            opacity="0.65"
          />
        </svg>
      );
    case "coffee":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          {/* Three coffee beans in a triangle */}
          <ellipse
            cx="24"
            cy="15"
            rx="8"
            ry="5.5"
            transform="rotate(-25 24 15)"
            opacity="0.95"
          />
          <path
            d="M19 13.5c3 1.2 7 1.5 10.5.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.35"
            transform="rotate(-25 24 15)"
          />
          <ellipse
            cx="16.5"
            cy="29"
            rx="8"
            ry="5.5"
            transform="rotate(18 16.5 29)"
            opacity="0.95"
          />
          <path
            d="M11.5 27.8c3 1.1 7 1.4 10.2.1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.35"
            transform="rotate(18 16.5 29)"
          />
          <ellipse
            cx="31.5"
            cy="29"
            rx="8"
            ry="5.5"
            transform="rotate(-18 31.5 29)"
            opacity="0.95"
          />
          <path
            d="M26.5 27.8c3 1.1 7 1.4 10.2.1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.35"
            transform="rotate(-18 31.5 29)"
          />
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
  const glyph =
    size === "lg" ? "h-8 w-8" : size === "sm" ? "h-5 w-5" : "h-6 w-6";

  return (
    <div
      className={`item-icon flex shrink-0 items-center justify-center rounded-full transition-colors duration-300 ease-out ${box} ${tone.wrap} ${tone.ink}`}
      title={
        unit === "pcs"
          ? "Pieces"
          : unit === "bottle"
            ? "Bottle"
            : unit === "bags"
              ? "Bags"
              : unit === "packets"
                ? "Packets"
                : unit === "boxes"
                  ? "Boxes"
                  : unit
      }
    >
      <div className={glyph}>
        <Glyph kind={kind} />
      </div>
    </div>
  );
}
