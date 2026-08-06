import { Suspense } from 'react';
import { AdminOnly } from '@/components/admin-only';
import { AdminMatchQueuePanel } from './admin-match-queue-panel';

export default function AdminMatchQueuePage() {
  return (
    <AdminOnly>
      <Suspense fallback={<p className="p-8 font-sans text-sm">Загрузка…</p>}>
        <AdminMatchQueuePanel />
      </Suspense>
    </AdminOnly>
  );
}
