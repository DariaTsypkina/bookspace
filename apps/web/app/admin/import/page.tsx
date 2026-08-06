import { AdminOnly } from '@/components/admin-only';
import { AdminImportPanel } from './admin-import-panel';

export default function AdminImportPage() {
  return (
    <AdminOnly>
      <AdminImportPanel />
    </AdminOnly>
  );
}
