"use client";

import { useRef, useState } from "react";

const CENTER = 50;
const TRIGGER_LEFT = 38;
const TRIGGER_RIGHT = 62;

export default function SwipeQuantityControl({
  quantityLabel,
  sublabel,
  disabled = false,
  canDecrease = true,
  onIncrease,
  onDecrease,
}: {
  quantityLabel: string;
  sublabel: string;
  disabled?: boolean;
  canDecrease?: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumbPct, setThumbPct] = useState(CENTER);
  const [dragging, setDragging] = useState(false);

  function pctFromClientX(clientX: number) {
    const track = trackRef.current;
    if (!track) return CENTER;
    const rect = track.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = (x / rect.width) * 100;
    return Math.max(6, Math.min(94, pct));
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled) return;
    setDragging(true);
    setThumbPct(pctFromClientX(e.clientX));
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging || disabled) return;
    setThumbPct(pctFromClientX(e.clientX));
  }

  function onPointerUp() {
    if (!dragging) return;
    const pct = thumbPct;
    setDragging(false);
    setThumbPct(CENTER);

    if (pct >= TRIGGER_RIGHT) onIncrease();
    else if (pct <= TRIGGER_LEFT && canDecrease) onDecrease();
  }

  return (
    <div className="mt-4">
      <div className="mb-5 text-center">
        <p className="text-2xl font-bold tabular-nums text-neutral-900">
          {quantityLabel}
        </p>
        <p className="mt-0.5 text-xs text-neutral-500">{sublabel}</p>
      </div>

      <div
        ref={trackRef}
        role="slider"
        aria-label="Slide left to decrease, slide right to increase"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(thumbPct)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`relative h-12 touch-none select-none ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-neutral-900" />

        <div
          className={`absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-900 shadow-md ring-4 ring-white ${
            dragging ? "scale-110" : "scale-100"
          }`}
          style={{
            left: `${thumbPct}%`,
            transition: dragging
              ? "none"
              : "left 0.25s ease-out, transform 0.15s ease-out",
          }}
        />
      </div>

      <div className="mt-3 flex justify-between px-1 text-xs font-medium text-neutral-400">
        <span>− less</span>
        <span>more +</span>
      </div>
    </div>
  );
}
