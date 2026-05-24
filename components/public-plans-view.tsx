'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Plan {
  id: number;
  name: string;
  total_amount: number;
  num_children: number;
  description: string;
  created_at: string;
  denominations: number[];
  questionCount: number;
}

export default function PublicPlansView() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicPlans();
  }, []);

  const fetchPublicPlans = async () => {
    try {
      const response = await fetch('/api/plans?isPublic=true');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('فشل في تحميل الخطط');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (planId: number, shouldNavigate = true) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      if (response.ok) {
        const session = await response.json();
        const link = `${window.location.origin}/play?sessionCode=${session.session_code}`;
        localStorage.setItem('currentSessionCode', session.session_code);

        if (shouldNavigate) {
          toast.success('تم بدء الجلسة!');
          router.push(`/play?sessionCode=${session.session_code}`);
          return;
        }

        await navigator.clipboard.writeText(link);
        toast.success('تم نسخ رابط الجلسة!');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('فشل في إنشاء جلسة');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-amber-700">جاري التحميل...</div>;
  }

  if (plans.length === 0) {
    return <div className="text-center py-12 text-amber-700">لا توجد خطط متاحة</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {plans.map((plan) => (
        <Card key={plan.id} className="border-2 border-amber-300 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
            <h3 className="font-bold text-lg">{plan.name}</h3>
          </div>

          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-amber-700 font-semibold">المبلغ الإجمالي</p>
                <p className="text-lg font-bold text-amber-950">{plan.total_amount} ج.م</p>
              </div>
              <div>
                <p className="text-amber-700 font-semibold">عدد الأطفال</p>
                <p className="text-lg font-bold text-amber-950">{plan.num_children}</p>
              </div>
            </div>

            {plan.description && (
              <p className="text-sm text-amber-700 border-t pt-2">{plan.description}</p>
            )}

            <div className="space-y-2">
              <p className="text-xs text-amber-600 font-semibold">الفئات الورقية</p>
              <div className="flex flex-wrap gap-1">
                {plan.denominations.map((denom) => (
                  <Badge key={denom} className="bg-amber-200 text-amber-900">
                    {denom} ج.م
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleStartSession(plan.id, true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold"
              >
                <Play className="w-4 h-4 ml-2" />
                ابدأ الآن
              </Button>
              <Button
                onClick={() => handleStartSession(plan.id, false)}
                variant="outline"
                className="border-amber-400 text-amber-900"
              >
                <Copy className="w-4 h-4 ml-2" />
                نسخ الرابط
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
