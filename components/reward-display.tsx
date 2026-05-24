'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoneySpinner } from '@/components/money-spinner';
import { MoneyCounter } from '@/components/money-counter';

interface RewardDisplayProps {
  amount: number;
  onAcknowledge?: () => void;
  onRevealComplete?: () => void;
  allDenominations?: number[];
  revealMode?: 'spinner' | 'counter' | 'card';
  variant?: 'reveal' | 'win';
}

type DisplayMode = 'reveal' | 'result';

export default function RewardDisplay({ 
  amount, 
  onAcknowledge,
  onRevealComplete,
  allDenominations = [5, 10, 20, 50, 100, 200],
  revealMode = 'spinner',
  variant = 'win',
}: RewardDisplayProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>(variant === 'reveal' ? 'reveal' : 'result');
  const [pickedCard, setPickedCard] = useState<number | null>(null);
  const acknowledged = useRef(false);

  useEffect(() => {
    setPickedCard(null);
    acknowledged.current = false;
  }, [amount, revealMode, variant]);

  useEffect(() => {
    if (displayMode === 'reveal') {
      if (variant === 'reveal' && revealMode === 'card' && pickedCard === null) {
        return;
      }

      const timer = setTimeout(() => {
        if (variant === 'reveal') {
          onRevealComplete?.();
          return;
        }
        setDisplayMode('result');
      }, revealMode === 'card' ? 2000 : 3600);
      return () => clearTimeout(timer);
    }

    if (displayMode === 'result' && onAcknowledge) {
      const timer = setTimeout(() => {
        if (!acknowledged.current) {
          acknowledged.current = true;
          onAcknowledge();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [displayMode, onAcknowledge, onRevealComplete, pickedCard, revealMode, variant]);

  const handleAcknowledge = () => {
    if (acknowledged.current) return;
    acknowledged.current = true;
    onAcknowledge?.();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl border-4 border-amber-400 max-w-2xl w-full overflow-hidden shadow-2xl">
         {/* Header */}
         <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-8 text-center">
          {variant === 'reveal' ? (
            <>
              <h2 className="text-4xl md:text-5xl font-bold mb-2">لحظة السحب</h2>
              <p className="text-lg opacity-90">شوف العيدية هتقف على كام</p>
            </>
          ) : (
            <>
              <h2 className="text-4xl md:text-5xl font-bold mb-2">تهانينا يا بطل!</h2>
              <p className="text-lg opacity-90">لقد فزت بعيدية رائعة</p>
            </>
          )}
         </div>

        {/* Content */}
        <div className="p-4 sm:p-8 md:p-12 space-y-8">
          {/* Spinner Mode */}
          {displayMode === 'reveal' && (
            revealMode === 'spinner' ? (
              <MoneySpinner amounts={allDenominations} selectedAmount={amount} />
            ) : revealMode === 'counter' ? (
              <MoneyCounter targetAmount={amount} denominations={allDenominations} duration={2800} />
            ) : (
              <div className="mx-auto max-w-md [perspective:1000px]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[0, 1, 2].map((cardIndex) => {
                    const isPicked = pickedCard === cardIndex;

                    return (
                      <button
                        key={cardIndex}
                        type="button"
                        disabled={pickedCard !== null}
                        onClick={() => setPickedCard(cardIndex)}
                        className="relative h-40 sm:h-52 rounded-2xl text-white [transform-style:preserve-3d] transition-all duration-700 hover:-translate-y-2 hover:scale-105 disabled:hover:translate-y-0 disabled:hover:scale-100"
                        style={{
                          transform: isPicked ? 'rotateY(180deg) scale(1.06)' : 'rotateY(0deg)',
                          opacity: pickedCard !== null && !isPicked ? 0.35 : 1,
                        }}
                      >
                        <div className="absolute inset-0 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-800 via-orange-700 to-amber-600 shadow-2xl [backface-visibility:hidden] overflow-hidden">
                          <div className="absolute inset-4 rounded-xl border border-amber-200/60" />
                          <div className="absolute -top-12 -left-12 h-28 w-28 rounded-full bg-white/15 blur-xl" />
                          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
                          <div className="flex h-full flex-col items-center justify-center gap-3">
                            <span className="h-12 w-12 rounded-full border border-amber-100/70 bg-white/10" />
                            <span className="text-sm font-bold tracking-wide">اختار الكارت</span>
                          </div>
                        </div>
                        <div className="absolute inset-0 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 p-4 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col items-center justify-center shadow-2xl">
                          <p className="text-xs opacity-90">العيدية</p>
                          <div className="mt-2 text-2xl sm:text-4xl font-black tabular-nums">
                            {amount}
                          </div>
                          <p className="mt-1 text-sm opacity-90">جنيه</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-center text-amber-800 font-semibold">اختار كارت واحد للكشف</p>
              </div>
            )
          )}

          {/* Result Mode */}
          {displayMode === 'result' && variant === 'win' && (
            <div className="text-center space-y-6 py-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-3xl blur-2xl opacity-40 animate-pulse" />
                <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl px-12 py-8 shadow-2xl border-2 border-amber-300">
                  <div className="text-4xl sm:text-5xl md:text-7xl font-bold text-white">
                    {amount}
                  </div>
                  <div className="text-2xl text-amber-100 mt-2">جنيه مصري</div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-2xl font-bold text-amber-950">
                  كل عام وأنت بألف خير!
                </p>
                <p className="text-amber-700 text-lg">
                  إجابة موفقة - استحقيت هذه العيدية بجدارة
                </p>
              </div>

              <Button
                onClick={handleAcknowledge}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 text-lg rounded-xl"
              >
                استلام العيدية
              </Button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
