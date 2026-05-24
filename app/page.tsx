'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Page() {
  const [hasActiveSession, setHasActiveSession] = useState(false);

  useEffect(() => {
    // Check if there's an active session stored
    const sessionCode = localStorage.getItem('currentSessionCode');
    setHasActiveSession(!!sessionCode);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-50">
      {/* Navigation */}
      <nav className="border-b border-amber-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            عيدية وفرحة
          </div>
          <Link href="/admin">
            <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold">
              منطقة المدير
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 via-transparent to-orange-200/20" />

        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="text-center space-y-10 max-w-4xl mx-auto">
            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-amber-950 leading-tight">
                عيدية وفرحة
              </h1>
              <p className="text-2xl md:text-3xl text-amber-700 font-semibold">
                بروح العيد وقيم الإسلام
              </p>
            </div>

            {/* CTA Buttons - Only Two */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/admin" className="block">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-6 px-12 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                  ابدأ الآن
                </Button>
              </Link>
              {hasActiveSession && (
                <Link href="/play" className="block">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 px-12 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                    اكمل الجلسة السابقة
                  </Button>
                </Link>
              )}
            </div>

            {/* Tagline */}
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 rounded-2xl p-6 max-w-2xl mx-auto">
              <p className="text-lg text-amber-950 font-semibold leading-relaxed">
                &quot;الفلوس بتروح وتيجي.. بس ذكريات العيدية والورقة الجديدة بتفضل محفورة في ذاكرة الطفل طول عمره. خليك أنت صاحب الذكرى الحلوة السنة دي.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Islamic Content Section */}
      <section className="py-20 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-amber-950">
              حكمة العيد والعطاء
            </h2>
            <p className="text-xl text-amber-800/70 max-w-2xl mx-auto">
              آيات قرآنية وأحاديث شريفة عن قيمة الإنفاق والعطاء للأطفال
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Quran Verses */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-8 space-y-6">
              <h3 className="text-2xl font-bold text-blue-950 text-center">آيات قرآنية</h3>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 border-l-4 border-blue-500">
                  <p className="text-lg text-blue-900 leading-loose font-semibold mb-3">
                    ﴿إِنَّ الَّذِينَ يَتْلُونَ كِتَابَ اللَّهِ وَأَقَامُوا الصَّلَاةَ وَأَنفَقُوا مِمَّا رَزَقْنَاهُمْ سِرًّا وَعَلَانِيَةً يَرْجُونَ تِجَارَةً لَّن تَبُورَ﴾
                  </p>
                  <p className="text-blue-700 text-sm">سورة فاطر: 29</p>
                </div>

                <div className="bg-white rounded-lg p-6 border-l-4 border-blue-500">
                  <p className="text-lg text-blue-900 leading-loose font-semibold mb-3">
                    ﴿لَن تَنَالُوا الْبِرَّ حَتَّىٰ تُنفِقُوا مِمَّا تُحِبُّونَ﴾
                  </p>
                  <p className="text-blue-700 text-sm">سورة آل عمران: 92</p>
                </div>
              </div>
            </div>

            {/* Hadith */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8 space-y-6">
              <h3 className="text-2xl font-bold text-green-950 text-center">أحاديث شريفة</h3>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 border-l-4 border-green-500">
                  <p className="text-lg text-green-900 leading-loose font-semibold mb-3">
                    &quot;أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ سُرُورٌ تُدْخِلُهُ عَلَى مُسْلِمٍ&quot;
                  </p>
                  <p className="text-green-700 text-sm">رواه الطبراني</p>
                </div>

                <div className="bg-white rounded-lg p-6 border-l-4 border-green-500">
                  <p className="text-lg text-green-900 leading-loose font-semibold mb-3">
                    &quot;تَهَادَوْا تَحَابّوا&quot;
                  </p>
                  <p className="text-green-700 text-sm">رواه البخاري في الأدب المفرد</p>
                </div>
              </div>
            </div>
          </div>

          {/* Wise sayings */}
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-3 border-amber-400 rounded-2xl p-8 space-y-8">
            <h3 className="text-2xl font-bold text-amber-950 text-center">حكم ولطائف</h3>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6">
                <p className="text-lg text-amber-950 leading-relaxed font-semibold">
                  &quot;العيدية مش فرض.. بس الفرحة فرض على قلوبنا في العيد. فرحوهم وعيدوا عليهم، فأحب الأعمال إلى الله سرور تدخله على مسلم.&quot;
                </p>
              </div>

              <div className="bg-white rounded-lg p-6">
                <p className="text-lg text-amber-950 leading-relaxed font-semibold">
                  &quot;ما تستقلش بالعيدية، قيمتها في معناها وفي اللمة والدعوة الحلوة اللي بتطلع من القلب. تهادوا تحابوا.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eid Story Section */}
      <section className="py-20 bg-gradient-to-b from-orange-50 to-amber-50">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-amber-950 mb-4">
              قصة العيد الكبير
            </h2>
            <p className="text-xl text-amber-800/70">
              عيد الأضحى وقصة الطاعة والتضحية
            </p>
          </div>

          <div className="bg-white border-4 border-amber-400 rounded-2xl p-8 md:p-12 space-y-6">
            <p className="text-lg text-amber-950 leading-relaxed">
              في قصة سيدنا إبراهيم عليه السلام، اختبره الله بطلب عظيم - أن يضحي بابنه الوحيد إسماعيل، وكان إبراهيم شيخاً كبيراً وانتظر طويلاً ليرزقه الله هذا الولد.
            </p>

            <p className="text-lg text-amber-950 leading-relaxed">
              لكن إبراهيم وضع أمر الله فوق كل شيء، وعندما عزم على الطاعة، فداه الله برام عظيم بدلاً من ابنه. كان هذا درساً عظيماً - طاعة الله أولاً، والثقة به سبحانه، والاستعداد للتضحية بالغالي والنفيس.
            </p>

            <p className="text-lg text-amber-950 leading-relaxed">
              احتفالاً بهذه الطاعة والتضحية، شرع الله لنا عيد الأضحى - نعيد فيه على أطفالنا بالعيديات، ليذكرهم بأهمية الطاعة والسخاء والعطاء. العيدية ليست مجرد فلوس - هي رسالة حب تقول للطفل: أنت عزيز على قلبي، وأنا فرحان بك.
            </p>

            <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 rounded-lg p-6 mt-8">
              <p className="text-center text-amber-950 font-bold text-lg leading-relaxed">
                &quot;كل عام وأنتم بألف خير، وحكاياكم مع الفلوس والضحك تصير حكايات عسلة نتذكرها طول العمر&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-amber-950">
              خطوات الاستخدام
            </h2>
            <p className="text-xl text-amber-800/70">
              سهلة وبسيطة - حتى الطفل يفهمها
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                num: '1',
                title: 'انشئ الخطة',
                desc: 'حدد المبلغ الكلي والفئات الورقية (200 ج.م، 100 ج.م، إلخ)',
                color: 'from-blue-600 to-blue-700'
              },
              {
                num: '2',
                title: 'ابدأ الجلسة',
                desc: 'اختر عدد الأطفال وانقر "ابدأ" لتحصل على رابط',
                color: 'from-purple-600 to-purple-700'
              },
              {
                num: '3',
                title: 'الطفل يلعب',
                desc: 'الطفل يضغط على الخروف ويرى العجلة الدوارة تدور',
                color: 'from-pink-600 to-pink-700'
              },
              {
                num: '4',
                title: 'يجاوب السؤال',
                desc: 'إجابة صحيحة = العيدية، خطأ = يحاول مرة تانية بفئة أقل',
                color: 'from-green-600 to-green-700'
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="flex flex-col items-center">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-lg`}>
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-amber-950 mb-2 text-center">
                    {step.title}
                  </h3>
                  <p className="text-amber-700/70 text-center text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-10 right-0 w-12 text-amber-400 text-2xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600">
        <div className="mx-auto max-w-4xl px-6 text-center text-white space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            هل أنت جاهز تخليهم يبسموا؟
          </h2>
          <p className="text-xl opacity-95 max-w-2xl mx-auto leading-relaxed">
            لا تضيع فرصة تخليك صاحب أحلى ذكرية في العيد - خطة توزيع ذكية، أسئلة شيقة، وفلوس بتطلع بتأثيرات تتنسى!
          </p>
          <Link href="/admin">
            <Button className="bg-white text-amber-600 hover:bg-amber-50 font-bold py-6 px-12 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all">
              ابدأ الآن
            </Button>
          </Link>
          <p className="text-sm opacity-80">
            مجاني تماماً - بدون اشتراكات أو رسوم إضافية
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 text-center space-y-4">
          <p className="text-amber-700 font-semibold">
            صُنع بحب وذوق لجعل العيد أكثر متعة وتعليماً
          </p>
          <p className="text-amber-600 text-sm">
            ذكريات الطفل الحلوة أغلى من الفلوس.. فرحه وضحكته وسؤاله "بابا فيه عديه كمان؟" دي هي الفلوس الحقيقية
          </p>
        </div>
      </footer>
    </main>
  );
}
