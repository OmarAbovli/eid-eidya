'use client';

import { useEffect, useRef, useState } from 'react';

interface MoneySpinnerProps {
  amounts: number[];
  selectedAmount: number;
  onAnimationComplete?: () => void;
}

export function MoneySpinner({
  amounts,
  selectedAmount,
  onAnimationComplete,
}: MoneySpinnerProps) {
  const [isSpinning, setIsSpinning] = useState(true);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSpinning) return;

    const itemCount = amounts.length;
    const selectedIndex = amounts.indexOf(selectedAmount);
    const anglePerItem = 360 / itemCount;
    const spinDuration = 3000;
    const startTime = Date.now();
    const baseSpins = 5 * 360;
    const selectedAngle = selectedIndex * anglePerItem + anglePerItem / 2;
    const targetRotation = baseSpins - selectedAngle;

    let animationFrameId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setRotation(easeOut * targetRotation);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setRotation(targetRotation);
        onAnimationComplete?.();
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [amounts, selectedAmount, isSpinning, onAnimationComplete]);

  const itemCount = amounts.length;
  const anglePerItem = 360 / itemCount;
  const colors = ['#f59e0b', '#f97316', '#fbbf24', '#ea580c', '#facc15', '#d97706'];
  const wheelBackground = `conic-gradient(${amounts
    .map((_, index) => {
      const start = index * anglePerItem;
      const end = (index + 1) * anglePerItem;
      return `${colors[index % colors.length]} ${start}deg ${end}deg`;
    })
    .join(', ')})`;

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* Wheel Container */}
      <div className="relative w-80 h-80 md:w-96 md:h-96">
        {/* Spinner */}
        <div
          ref={containerRef}
          className="absolute inset-0 rounded-full border-8 border-orange-600 shadow-2xl transition-transform"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: isSpinning ? '0ms' : '500ms',
            background: wheelBackground,
          }}
        >
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,_transparent_0_22%,_rgba(255,255,255,0.18)_23%,_transparent_24%)]" />

          {/* Amount labels */}
          {amounts.map((amount, index) => {
            const angle = index * anglePerItem + anglePerItem / 2;
            return (
              <div
                key={amount}
                className="absolute left-1/2 top-1/2 -ml-10 -mt-4 flex h-8 w-20 items-center justify-center rounded-full bg-white/85 text-sm md:text-base font-black text-amber-950 shadow-md"
                style={{
                  transform: `rotate(${angle}deg) translateY(-120px) rotate(-${angle}deg)`,
                }}
              >
                {amount}
              </div>
            );
          })}
        </div>

        {/* Center Circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 shadow-2xl flex items-center justify-center border-4 border-white z-10">
              <div className="text-white text-center">
                <div className="text-xs opacity-75">العيدية</div>
                <div className="text-2xl font-bold">{isSpinning ? '...' : selectedAmount}</div>
              </div>
            </div>
          </div>

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 z-20 h-0 w-0 -translate-x-1/2 -translate-y-2 border-l-[14px] border-r-[14px] border-t-[26px] border-l-transparent border-r-transparent border-t-orange-700 drop-shadow-lg" />

        {/* Decorative Ring */}
        <div className="pointer-events-none absolute inset-0 rounded-full border-4 border-white/80 shadow-inner" />
      </div>

      {/* Spinning Indicator */}
      {isSpinning && (
        <div className="flex gap-2 items-center text-amber-700">
          <div className="w-2 h-2 rounded-full bg-amber-700 animate-bounce" />
          <span className="text-sm font-semibold">جاري الدوران...</span>
        </div>
      )}
    </div>
  );
}
