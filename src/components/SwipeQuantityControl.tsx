"use client";

import { useEffect, useRef, useState } from "react";

function snapQuantity(pct: number, maxQuantity: number, step: number) {
  const raw = (pct / 100) * maxQuantity;
  return Math.max(0, Math.round(raw / step) * step);
}

function pctFromQuantity(quantity: number, maxQuantity: number) {
  if (maxQuantity <= 0) return 0;
  const pct = (quantity / maxQuantity) * 100;
  return Math.max(4, Math.min(96, pct));
}

export function sliderMaxQuantity(
  quantity: number,
  lowStockThreshold: number,
  step: number
) {
  return Math.max(
    lowStockThreshold * 8,
    quantity + step * 30,
    step * 40,
    20
  );
}

export default function SwipeQuantityControl({
  quantity,
  step,
  maxQuantity,
  quantityLabel,
  sublabel,
  disabled = false,
  onChange,
  onCommit,
}: {
  quantity: number;
  step: number;
  maxQuantity: number;
  quantityLabel: string;
  sublabel: string;
  disabled?: boolean;
  onChange: (next: number) => void;
  onCommit: (next: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const thumbPctRef = useRef(pctFromQuantity(quantity, maxQuantity));
  const [thumbPct, setThumbPct] = useState(() =>
    pctFromQuantity(quantity, maxQuantity)
  );
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!draggingRef.current) {
      const pct = pctFromQuantity(quantity, maxQuantity);
      thumbPctRef.current = pct;
      setThumbPct(pct);
    }
  }, [quantity, maxQuantity]);

  function pctFromClientX(clientX: number) {
    const track = trackRef.current;
    if (!track) return thumbPctRef.current;
    const rect = track.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = (x / rect.width) * 100;
    return Math.max(4, Math.min(96, pct));
  }

  function applyAtClientX(clientX: number) {
    const pct = pctFromClientX(clientX);
    thumbPctRef.current = pct;
    setThumbPct(pct);
    onChange(snapQuantity(pct, maxQuantity, step));
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled) return;
    draggingRef.current = true;
    setDragging(true);
    applyAtClientX(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current || disabled) return;
    applyAtClientX(e.clientX);
  }

  function finishDrag() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    const next = snapQuantity(thumbPctRef.current, maxQuantity, step);
    onChange(next);
    onCommit(next);
    const pct = pctFromQuantity(next, maxQuantity);
    thumbPctRef.current = pct;
    setThumbPct(pct);
  }

  return (
    <div className="mt-4">
      <div className="mb-5 text-center">
        <p
          className={`text-2xl font-bold tabular-nums text-neutral-900 transition-opacity ${
            dragging ? "opacity-90" : "opacity-100"
          }`}
        >
          {quantityLabel}
        </p>
        <p className="mt-0.5 text-xs text-neutral-500">{sublabel}</p>
      </div>

      <div
        ref={trackRef}
        role="slider"
        aria-label="Slide to set quantity"
        aria-valuemin={0}
        aria-valuemax={maxQuantity}
        aria-valuenow={quantity}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        className={`relative h-14 touch-none select-none ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-neutral-300" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-neutral-900 transition-[width] duration-75 ease-out"
          style={{ width: `${thumbPct}%` }}
        />

        <div
          className={`absolute top-1/2 z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-900 shadow-md ring-4 ring-white ${
            dragging ? "scale-110" : "scale-100"
          }`}
          style={{
            left: `${thumbPct}%`,
            transition: dragging
              ? "transform 0.1s ease-out"
              : "left 0.2s ease-out, transform 0.15s ease-out",
          }}
        />
      </div>

      <div className="mt-3 flex justify-between px-1 text-xs font-medium text-neutral-400">
        <span>0</span>
        <span>{Math.round(maxQuantity)} max</span>
      </div>
    </div>
  );
}
