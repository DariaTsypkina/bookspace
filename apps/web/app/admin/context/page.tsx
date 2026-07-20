import { AdminOnly } from '@/components/admin-only';
import { AdminContextPanel } from './admin-context-panel';

export default function AdminContextPage() {
  return (
    <AdminOnly>
      <AdminContextPanel />
    </AdminOnly>
  );
}
