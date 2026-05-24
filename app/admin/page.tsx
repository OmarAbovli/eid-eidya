'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreatePlanForm from '@/components/create-plan-form';
import PublicPlansView from '@/components/public-plans-view';
import SessionsList from '@/components/sessions-list';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-4 md:p-8 rtl">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-950 mb-2">
            عيدية وفرحة
          </h1>
          <p className="text-amber-700">
            نظام توزيع العيديات مع الأسئلة الدينية
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-amber-200">
            <TabsTrigger value="create" className="text-amber-950">
              إنشاء خطة جديدة
            </TabsTrigger>
            <TabsTrigger value="public" className="text-amber-950">
              الخطط المشاركة
            </TabsTrigger>
            <TabsTrigger value="sessions" className="text-amber-950">
              الجلسات
            </TabsTrigger>
          </TabsList>

          {/* Create Plan Tab */}
          <TabsContent value="create" className="mt-6">
            <Card className="border-2 border-amber-300 bg-white">
              <CreatePlanForm />
            </Card>
          </TabsContent>

          {/* Public Plans Tab */}
          <TabsContent value="public" className="mt-6">
            <PublicPlansView />
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="mt-6">
            <SessionsList />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
