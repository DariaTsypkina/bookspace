import { AdminOnly } from '@/components/admin-only';
import { AdminWorkMergePanel } from './admin-work-merge-panel';

export default function AdminWorkMergePage() {
  return (
    <AdminOnly>
      <AdminWorkMergePanel />
    </AdminOnly>
  );
}
