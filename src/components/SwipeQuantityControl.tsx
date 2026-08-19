"use client";

import { useRef, useState } from "react";

const SWIPE_THRESHOLD = 44;
const MAX_DRAG = 80;

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
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const active = useRef(false);

  function resetDrag() {
    active.current = false;
    setDragging(false);
    setDragX(0);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled) return;
    active.current = true;
    startX.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!active.current) return;
    const delta = e.clientX - startX.current;
    setDragX(Math.max(-MAX_DRAG, Math.min(MAX_DRAG, delta)));
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!active.current) return;
    const delta = e.clientX - startX.current;
    resetDrag();
    if (delta >= SWIPE_THRESHOLD) onIncrease();
    else if (delta <= -SWIPE_THRESHOLD && canDecrease) onDecrease();
  }

  const dragTone =
    dragX > 20
      ? "bg-green-100 ring-green-300"
      : dragX < -20
        ? "bg-red-50 ring-red-200"
        : "bg-neutral-100 ring-neutral-200";

  return (
    <div className="mt-4">
      <div
        role="slider"
        aria-label="Swipe left to decrease, swipe right to increase"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={50}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={resetDrag}
        className={`relative flex h-[4.5rem] touch-none select-none items-center overflow-hidden rounded-2xl ring-1 transition-colors ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing"
        } ${dragging ? dragTone : "bg-neutral-100 ring-neutral-200"}`}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 flex w-1/3 items-center justify-start pl-4">
          <span
            className={`text-2xl font-bold transition-opacity ${
              dragX < -10 ? "text-red-600 opacity-100" : "text-neutral-300 opacity-70"
            }`}
          >
            −
          </span>
        </div>

        <div
          className="pointer-events-none mx-auto flex min-w-0 flex-1 flex-col items-center px-16 text-center"
          style={{
            transform: `translateX(${dragX}px)`,
            transition: dragging ? "none" : "transform 0.22s ease-out",
          }}
        >
          <p className="text-2xl font-bold tabular-nums text-neutral-900">
            {quantityLabel}
          </p>
          <p className="text-xs text-neutral-500">{sublabel}</p>
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-1/3 items-center justify-end pr-4">
          <span
            className={`text-2xl font-bold transition-opacity ${
              dragX > 10 ? "text-green-700 opacity-100" : "text-neutral-300 opacity-70"
            }`}
          >
            +
          </span>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-neutral-400">
        Swipe left for less · swipe right for more
      </p>
    </div>
  );
}
