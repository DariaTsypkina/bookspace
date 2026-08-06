import { AdminOnly } from '@/components/admin-only';
import { AdminDashboardPanel } from './admin-dashboard-panel';

export default function AdminDashboardPage() {
  return (
    <AdminOnly>
      <AdminDashboardPanel />
    </AdminOnly>
  );
}
