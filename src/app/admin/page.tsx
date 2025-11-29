'use client';

import { WidgetList } from '@/components/admin/widget-list';

export default function AdminPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <WidgetList />
    </div>
  );
}
