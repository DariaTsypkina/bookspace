import { AdminOnly } from '@/components/admin-only';
import { AdminCatalogPanel } from './admin-catalog-panel';

export default function AdminCatalogPage() {
  return (
    <AdminOnly>
      <AdminCatalogPanel />
    </AdminOnly>
  );
}
