'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getRandomCelebration } from '@/lib/eid-utils';

interface Question {
  id: number;
  text: string;
  correct_answer: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

function getDifficultyForAmount(amount: number): 'easy' | 'medium' | 'hard' {
  if (amount >= 200) return 'hard';
  if (amount >= 100) return 'medium';
  return 'easy';
}

interface QuestionModalProps {
  denomination: number;
  onAnswer: (isCorrect: boolean, questionId: number) => void;
  planId: number;
  excludeQuestionIds?: number[];
  onQuestionLoaded?: (questionId: number) => void;
}

export default function QuestionModal({
  denomination,
  onAnswer,
  planId,
  excludeQuestionIds = [],
  onQuestionLoaded,
}: QuestionModalProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  useEffect(() => {
    loadQuestion();
  }, [denomination, planId]);

  const loadQuestion = async () => {
    try {
      const difficulty = getDifficultyForAmount(denomination);
      const excludeParam = excludeQuestionIds.join(',');
      const response = await fetch(
        `/api/questions?difficulty=${difficulty}&limit=1&planId=${planId}&excludeIds=${excludeParam}`
      );

      if (response.ok) {
        const questions = await response.json();
        if (questions.length > 0) {
          setQuestion(questions[0]);
          onQuestionLoaded?.(questions[0].id);
        } else {
          const fallbackResponse = await fetch(
            `/api/questions?difficulty=${difficulty}&limit=1&planId=${planId}`
          );
          if (fallbackResponse.ok) {
            const fallbackQuestions = await fallbackResponse.json();
            if (fallbackQuestions.length > 0) {
              setQuestion(fallbackQuestions[0]);
              onQuestionLoaded?.(fallbackQuestions[0].id);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading question:', error);
      toast.error('فشل تحميل السؤال');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswered(true);

    const isCorrect = answer === question?.correct_answer;
    setIsCorrectAnswer(isCorrect);
    
    // Show funny message
    if (isCorrect) {
      toast.success(getRandomCelebration(), { duration: 2000 });
    } else {
      toast.error('إجابة غير صحيحة، سيتم الانتقال إلى فئة أقل', { duration: 2000 });
    }
    
    // Delay answer callback to show feedback
    setTimeout(() => onAnswer(isCorrect, question!.id), 1500);
  };

  if (loading || !question) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center rtl z-50">
        <Card className="bg-white border-4 border-amber-400 p-8 max-w-lg w-full mx-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-amber-950 mb-4">
              جاري تحميل السؤال...
            </h2>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center rtl z-50 p-4">
      <Card className="bg-white border-4 border-amber-400 max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">السؤال الديني</h2>
            <div className="bg-white text-amber-600 px-4 py-2 rounded-full text-lg font-bold shadow-lg">
              {denomination} ج.م
            </div>
          </div>
          {!answered && <p className="text-amber-100 text-sm">اختر الإجابة الصحيحة للحصول على العيدية</p>}
        </div>

        {/* Question */}
        <div className="p-6">
          <p className="text-xl font-bold text-amber-950 mb-6 leading-relaxed">
            {question.text}
          </p>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {[
              { key: 'A', value: question.option_a },
              { key: 'B', value: question.option_b },
              { key: 'C', value: question.option_c },
              { key: 'D', value: question.option_d },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => !answered && handleAnswer(option.value)}
                disabled={answered}
                className={`p-4 rounded-lg border-2 font-semibold text-right transition-all ${
                  answered
                    ? option.value === question.correct_answer
                      ? 'bg-green-100 border-green-500 text-green-900'
                      : selectedAnswer === option.value
                        ? 'bg-red-100 border-red-500 text-red-900'
                        : 'bg-gray-100 border-gray-300 text-gray-700'
                    : 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200 cursor-pointer'
                }`}
              >
                <span className="ml-2">({option.key})</span>
                {option.value}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {answered && (
            <div className="p-4 rounded-lg mb-6 text-center font-bold animate-pulse">
              {isCorrectAnswer ? (
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-900 border-3 border-green-500 rounded-xl p-4 space-y-2">
                  <div className="text-3xl">صح</div>
                  <p className="text-lg">إجابة صحيحة!</p>
                  <p className="text-green-800">استحقيت العيدية دي بجدارة</p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 text-amber-950 border-3 border-orange-400 rounded-xl p-4 space-y-2">
                  <div className="text-3xl">خطأ</div>
                  <p className="text-lg">الإجابة خاطئة للأسف</p>
                  <p className="text-amber-800 mt-2">الإجابة الصحيحة: <span className="font-bold text-amber-950">{question.correct_answer}</span></p>
                  <p className="text-sm text-amber-700 mt-2">بس ما تقلقش - ممكن تحاول مرة تانية!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
