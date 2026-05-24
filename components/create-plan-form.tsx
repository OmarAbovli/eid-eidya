'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AVAILABLE_DENOMINATIONS = [5, 10, 20, 50, 100, 200];

export default function CreatePlanForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    totalAmount: 1000,
    numChildren: 5,
    description: '',
    selectedDenominations: [200, 100, 50, 20, 10, 5],
    isPublic: false,
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const { name, type } = target;
    const value = type === 'checkbox' ? (target as HTMLInputElement).checked
      : type === 'number' ? Number((target as HTMLInputElement).value)
      : target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDenomination = (denom: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedDenominations: prev.selectedDenominations.includes(denom)
        ? prev.selectedDenominations.filter((d) => d !== denom)
        : [...prev.selectedDenominations, denom].sort((a, b) => b - a),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('الرجاء إدخال اسم الخطة');
      return;
    }

    if (formData.selectedDenominations.length === 0) {
      toast.error('الرجاء اختيار فئة ورقية واحدة على الأقل');
      return;
    }

    if (formData.totalAmount <= 0 || formData.numChildren <= 0) {
      toast.error('المبلغ والعدد يجب أن يكونوا أكبر من صفر');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1, // In production, this would come from auth
          name: formData.name,
          totalAmount: formData.totalAmount,
          numChildren: formData.numChildren,
          description: formData.description,
          denominations: formData.selectedDenominations,
          isPublic: formData.isPublic,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.details || errorData?.error || 'فشل في إنشاء الخطة');
      }

      const data = await response.json();

      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: data.id }),
      });

      if (!sessionResponse.ok) {
        throw new Error('فشل في بدء الجلسة');
      }

      const session = await sessionResponse.json();
      localStorage.setItem('currentSessionCode', session.session_code);

      toast.success('تم إنشاء الخطة وبدء التحدي!');
      router.push(`/play?sessionCode=${session.session_code}`);
    } catch (error) {
      console.error('Error:', error);
      const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      toast.error(`حدث خطأ في إنشاء الخطة أو بدء الجلسة: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Plan Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-amber-950 font-semibold">
          اسم الخطة
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="مثال: عيديات العيد الكبير 2024"
          className="border-2 border-amber-200"
          required
        />
      </div>

      {/* Total Amount */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="totalAmount" className="text-amber-950 font-semibold">
            إجمالي المبلغ (جنيه)
          </Label>
          <Input
            id="totalAmount"
            name="totalAmount"
            type="number"
            value={formData.totalAmount}
            onChange={handleInputChange}
            min="1"
            className="border-2 border-amber-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numChildren" className="text-amber-950 font-semibold">
            عدد الأطفال
          </Label>
          <Input
            id="numChildren"
            name="numChildren"
            type="number"
            value={formData.numChildren}
            onChange={handleInputChange}
            min="1"
            className="border-2 border-amber-200"
          />
        </div>
      </div>

      {/* Denominations Selection */}
      <div className="space-y-3">
        <Label className="text-amber-950 font-semibold">الفئات الورقية</Label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {AVAILABLE_DENOMINATIONS.map((denom) => (
            <button
              key={denom}
              type="button"
              onClick={() => toggleDenomination(denom)}
              className={`p-3 rounded-lg font-bold text-sm transition-all ${
                formData.selectedDenominations.includes(denom)
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-amber-100 text-amber-800 border-2 border-amber-300'
              }`}
            >
              {denom} ج.م
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-amber-950 font-semibold">
          الوصف (اختياري)
        </Label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="أضف وصف للخطة..."
          className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500"
          rows={3}
        />
      </div>

      {/* Public Option */}
      <div className="flex items-center gap-3 p-3 bg-amber-100 rounded-lg">
        <input
          id="isPublic"
          name="isPublic"
          type="checkbox"
          checked={formData.isPublic}
          onChange={handleInputChange}
          className="w-5 h-5"
        />
        <Label htmlFor="isPublic" className="text-amber-950 font-semibold cursor-pointer">
          مشاركة الخطة علناً ليستخدمها الآخرون
        </Label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all"
      >
        {loading ? 'جاري الإنشاء...' : 'إنشاء الخطة'}
      </Button>
    </form>
  );
}
