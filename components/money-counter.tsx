'use client';

import { useEffect, useState } from 'react';

interface MoneyCounterProps {
  targetAmount: number;
  denominations: number[];
  duration?: number;
  onComplete?: () => void;
}

export function MoneyCounter({
  targetAmount,
  denominations,
  duration = 3000,
  onComplete,
}: MoneyCounterProps) {
  const [displayAmount, setDisplayAmount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    let animationFrame: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newAmount = Math.floor(easeOut * targetAmount);

      setDisplayAmount(newAmount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayAmount(targetAmount);
        setIsAnimating(false);
        onComplete?.();
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [targetAmount, duration, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Large Amount Display */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-3xl blur-xl opacity-50" />
        <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl px-8 md:px-12 py-6 md:py-8 shadow-2xl border-2 border-amber-300">
          <div className="text-5xl md:text-7xl font-bold text-white text-center tabular-nums">
            {displayAmount}
          </div>
          <div className="text-lg md:text-2xl text-amber-100 text-center mt-2">
            جنيه مصري
          </div>
        </div>
      </div>

      {/* Denomination Pills */}
      <div className="flex flex-wrap gap-3 justify-center max-w-md">
        {denominations.map((denom) => (
          <div
            key={denom}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              displayAmount >= denom
                ? 'bg-green-500 text-white scale-105'
                : 'bg-gray-300 text-gray-500'
            }`}
          >
            {denom} ج.م
          </div>
        ))}
      </div>

      {/* Confetti Effect */}
      {!isAnimating && (
        <div className="text-6xl animate-bounce">✨</div>
      )}
    </div>
  );
}
