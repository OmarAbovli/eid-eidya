'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import GameBoard from '@/components/game-board';
import QuestionModal from '@/components/question-modal';
import RewardDisplay from '@/components/reward-display';
import { toast } from 'sonner';

interface SessionData {
  id: number;
  plan_id: number;
  session_code: string;
  status: string;
  total_distributed: number;
  children_count: number;
}

interface PlanData {
  id: number;
  name: string;
  total_amount: number;
  num_children: number;
  denominations: number[];
}

type RevealMode = 'spinner' | 'counter' | 'card';
type PlayPhase = 'idle' | 'reveal' | 'question' | 'win';

function pickRevealMode(lastModes: RevealMode[]): RevealMode {
  const modes: RevealMode[] = ['spinner', 'counter', 'card'];
  const lastMode = lastModes[lastModes.length - 1];
  const pool = lastMode ? modes.filter((m) => m !== lastMode) : modes;
  return pool[Math.floor(Math.random() * pool.length)];
}

function PlayPageContent() {
  const searchParams = useSearchParams();
  const [sessionCode, setSessionCode] = useState<string | null>(null);

  const [session, setSession] = useState<SessionData | null>(null);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentReward, setCurrentReward] = useState<number | null>(null);
  const [selectedDenomination, setSelectedDenomination] = useState<number | null>(null);
  const [revealMode, setRevealMode] = useState<RevealMode>('spinner');
  const [revealHistory, setRevealHistory] = useState<RevealMode[]>([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState<number[]>([]);
  const [phase, setPhase] = useState<PlayPhase>('idle');

  useEffect(() => {
    const codeFromUrl = searchParams.get('sessionCode');
    const codeFromStorage = localStorage.getItem('currentSessionCode');
    const activeCode = codeFromUrl || codeFromStorage;

    if (activeCode) {
      setSessionCode(activeCode);
      localStorage.setItem('currentSessionCode', activeCode);
    } else {
      toast.error('كود الجلسة غير صحيح');
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!sessionCode) return;
    loadSessionData();
  }, [sessionCode]);

  const loadSessionData = async () => {
    try {
      const response = await fetch(`/api/sessions?sessionCode=${sessionCode}`);
      if (!response.ok) {
        toast.error('لم يتم العثور على الجلسة');
        return;
      }

      const sessionData = await response.json();
      setSession(sessionData);

      // Load plan data
      const planResponse = await fetch(`/api/plans?planId=${sessionData.plan_id}`);
      if (planResponse.ok) {
        const plans = await planResponse.json();
        const planData = plans[0];
        if (planData) {
          setPlan(planData);
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSheepClick = () => {
    if (!plan) return;

    const randomDenom = plan.denominations[
      Math.floor(Math.random() * plan.denominations.length)
    ];
    setSelectedDenomination(randomDenom);
    const nextMode = pickRevealMode(revealHistory);
    setRevealMode(nextMode);
    setRevealHistory((prev) => [...prev, nextMode].slice(-10));
    setPhase('reveal');
    setShowQuestion(false);
  };

  const handleQuestionAnswer = async (isCorrect: boolean, questionId: number) => {
    if (!isCorrect || !selectedDenomination) {
      // If wrong, suggest the next lower denomination
      const currentIndex = plan!.denominations.indexOf(selectedDenomination!);
      if (currentIndex >= 0 && currentIndex < plan!.denominations.length - 1) {
        const nextLowerDenom = plan!.denominations[currentIndex + 1];
        setSelectedDenomination(nextLowerDenom);
        const nextMode = pickRevealMode(revealHistory);
        setRevealMode(nextMode);
        setRevealHistory((prev) => [...prev, nextMode].slice(-10));
        setPhase('reveal');
        setShowQuestion(false);
        toast.error('الإجابة خاطئة. حاول مجدداً بمبلغ أقل');
      } else {
        // No lower denomination
        setShowQuestion(false);
        setCurrentReward(null);
        setSelectedDenomination(null);
        setPhase('idle');
        toast.error('للأسف لا يوجد عيدية. حاول مرة أخرى!');
        return;
      }
    } else {
      // Correct answer - award the money
      setCurrentReward(selectedDenomination);
      setShowQuestion(false);
      setPhase('win');
      
      // Save reward to database
      try {
        const res = await fetch('/api/rewards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session!.id,
            questionId,
            finalAmount: selectedDenomination,
            status: 'completed',
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `API returned ${res.status}`);
        }

        setSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            total_distributed: (Number(prev.total_distributed) || 0) + selectedDenomination,
            children_count: prev.children_count + 1,
          };
        });
      } catch (error) {
        console.error('Error saving reward:', error);
        toast.error(error instanceof Error ? error.message : 'فشل حفظ العيدية');
      }
    }
  };

  const handleRewardAcknowledge = () => {
    setCurrentReward(null);
    setSelectedDenomination(null);
    setPhase('idle');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-amber-950">جاري التحميل...</h2>
        </div>
      </main>
    );
  }

  if (!session || !plan) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-amber-950">لم يتم العثور على الجلسة</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-4 md:p-8 rtl">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-950 mb-2">
            كل عام وأنتم بألف خير
          </h1>
          <p className="text-amber-700 text-lg">{plan.name}</p>
        </div>

        {/* Game Board */}
        {phase === 'idle' && !currentReward && (
          <GameBoard onSheepClick={handleSheepClick} />
        )}

        {phase === 'reveal' && selectedDenomination && (
          <RewardDisplay
            amount={selectedDenomination}
            allDenominations={plan.denominations}
            revealMode={revealMode}
            variant="reveal"
            onRevealComplete={() => {
              setPhase('question');
              setShowQuestion(true);
            }}
          />
        )}

        {/* Question Modal */}
        {phase === 'question' && showQuestion && selectedDenomination && (
          <QuestionModal
            denomination={selectedDenomination}
            onAnswer={handleQuestionAnswer}
            planId={plan.id}
            excludeQuestionIds={usedQuestionIds}
            onQuestionLoaded={(id) => {
              setUsedQuestionIds((prev) => {
                if (prev.includes(id)) return prev;
                return [...prev, id].slice(-20);
              });
            }}
          />
        )}

        {/* Reward Display */}
        {phase === 'win' && currentReward && (
          <RewardDisplay
            amount={currentReward}
            onAcknowledge={handleRewardAcknowledge}
            allDenominations={plan.denominations}
            revealMode={revealMode}
            variant="win"
          />
        )}

        {/* Session Stats */}
          <div className="mt-8 bg-white rounded-lg border-2 border-amber-300 p-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-amber-700 font-semibold">عدد فرحات العيد</p>
              <p className="text-2xl font-bold text-amber-950">{session.children_count}</p>
            </div>
            <div>
              <p className="text-amber-700 font-semibold">المبلغ الموزع</p>
              <p className="text-2xl font-bold text-amber-950">{Number(session.total_distributed) || 0} ج.م</p>
            </div>
            <div>
              <p className="text-amber-700 font-semibold">المبلغ المتبقي</p>
              <p className="text-2xl font-bold text-green-600">
                {(plan.total_amount - (Number(session.total_distributed) || 0))} ج.م
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-amber-950">جاري التحميل...</h2>
          </div>
        </main>
      }
    >
      <PlayPageContent />
    </Suspense>
  );
}
