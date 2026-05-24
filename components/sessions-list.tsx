'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface Session {
  id: number;
  plan_id: number;
  session_code: string;
  status: string;
  total_distributed: number;
  children_count: number;
  created_at: string;
  plan_name?: string;
}

export default function SessionsList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (!response.ok) {
        setLoading(false);
        return;
      }
      const allSessions = await response.json();
      setSessions(Array.isArray(allSessions) ? allSessions : []);
    } catch {
      // No sessions or error
    } finally {
      setLoading(false);
    }
  };

  const copySessionLink = (sessionCode: string) => {
    const link = `${window.location.origin}/play?sessionCode=${sessionCode}`;
    navigator.clipboard.writeText(link);
    toast.success('تم نسخ الرابط');
  };

  if (loading) {
    return <div className="text-center py-12 text-amber-700">جاري التحميل...</div>;
  }

  if (sessions.length === 0) {
    return (
      <Card className="border-2 border-amber-300 p-8 text-center">
        <p className="text-amber-700 mb-4">لم تبدأ أي جلسات بعد</p>
        <p className="text-sm text-amber-600">ابدأ جلسة جديدة من قائمة الخطط المشاركة</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <Card key={session.id} className="border-2 border-amber-300 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-amber-950">{session.plan_name}</h3>
            <Badge className={session.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
              {session.status === 'active' ? 'نشطة' : 'مكتملة'}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm mb-3">
            <div>
              <p className="text-amber-600">الأطفال</p>
              <p className="font-bold text-amber-950">{session.children_count}</p>
            </div>
            <div>
              <p className="text-amber-600">الموزع</p>
              <p className="font-bold text-amber-950">{session.total_distributed} ج.م</p>
            </div>
            <div>
              <p className="text-amber-600">الكود</p>
              <p className="font-mono font-bold text-amber-950">{session.session_code}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => copySessionLink(session.session_code)}
              variant="outline"
              className="flex-1"
            >
              <Copy className="w-4 h-4 ml-2" />
              نسخ الرابط
            </Button>
            <Button
              onClick={() => window.open(`/play?sessionCode=${session.session_code}`, '_blank')}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Eye className="w-4 h-4 ml-2" />
              عرض
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
