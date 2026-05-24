'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface GameBoardProps {
  onSheepClick: () => void;
}

export default function GameBoard({ onSheepClick }: GameBoardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [floatingParticles, setFloatingParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleSheepClick = () => {
    setIsAnimating(true);
    setPulseIntensity(1);
    
    // Create floating particles on click
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 50,
    }));
    setFloatingParticles(newParticles);

    setTimeout(() => {
      setIsAnimating(false);
      setPulseIntensity(0);
      setFloatingParticles([]);
    }, 800);

    onSheepClick();
  };

  useEffect(() => {
    // Pulse animation
    const pulseInterval = setInterval(() => {
      setPulseIntensity(prev => (prev + 0.1) % 1);
    }, 50);

    return () => clearInterval(pulseInterval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden mb-12">
      {/* Main Game Board */}
      <div className="relative w-full bg-gradient-to-b from-blue-200 via-sky-100 to-green-150 rounded-3xl border-4 border-amber-400 overflow-hidden shadow-2xl h-96 md:h-[500px]">
        {/* Background decorative elements */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-sky-200/60 blur-2xl" />
        <div className="absolute -top-12 right-8 w-44 h-44 rounded-full bg-amber-200/70 blur-2xl" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-400 to-transparent opacity-50" />

        {/* Grass pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-24 opacity-30 bg-[radial-gradient(circle_at_8px_8px,_rgba(255,255,255,0.6)_2px,_transparent_0)] [background-size:16px_16px]">
        </div>

        {/* Game area with sheep image */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Pulse effect ring */}
          {pulseIntensity > 0 && (
            <div
              className="absolute w-64 h-64 rounded-full border-4 border-amber-400"
              style={{
                opacity: 1 - pulseIntensity,
                transform: `scale(${1 + pulseIntensity * 0.5})`,
              }}
            />
          )}

          {/* Sheep Image Button */}
          <button
            onClick={handleSheepClick}
            className={`absolute z-10 transform transition-all duration-200 focus:outline-none group ${
              isAnimating 
                ? 'scale-90' 
                : 'hover:scale-110 hover:drop-shadow-2xl'
            }`}
            aria-label="اضغط على الخروف للحصول على العيدية"
          >
            <div className="relative w-40 h-40 md:w-52 md:h-52">
              <Image
                src="/sheep-luxury.png"
                alt="خروف العيد"
                fill
                className="object-contain filter drop-shadow-xl group-hover:drop-shadow-2xl transition-all"
                priority
              />
            </div>

            {/* Click indicator */}
            {!isAnimating && (
              <div className="absolute inset-0 rounded-full border-2 border-amber-400 border-dotted animate-spin opacity-50" style={{ animationDuration: '4s' }} />
            )}
          </button>

          {/* Floating particles */}
          {floatingParticles.map(particle => (
              <div
                key={particle.id}
                className="absolute w-3 h-3 rounded-full bg-amber-300 animate-bounce"
                style={{
                  left: particle.x + '%',
                  top: particle.y + '%',
                  animation: `floatUp 1.5s ease-out forwards`,
                }}
              />
            ))}
          </div>

        {/* Instructions Card */}
        <div className="absolute bottom-8 left-0 right-0 mx-auto max-w-2xl z-20">
          <div className="bg-white/90 backdrop-blur-sm border-2 border-amber-300 rounded-2xl p-6 shadow-lg text-center">
            <p className="text-2xl md:text-3xl font-bold text-amber-950 mb-2">
              اضغط على الخروف
            </p>
            <p className="text-amber-700 text-lg">
              ثم أجب على السؤال الديني بشكل صحيح لتحصل على العيدية
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
