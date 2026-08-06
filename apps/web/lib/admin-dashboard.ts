import { api, noStoreConfig } from './http';

export type AdminDashboardSummary = {
  matchQueueOpen: number;
  recentContext: number;
  failedJobs: number;
  recentContextDays: number;
};

const ADMIN_BFF_BASE = '/api/admin';

export async function fetchAdminDashboardSummary(
  days = 7,
): Promise<AdminDashboardSummary> {
  const { data } = await api.get<AdminDashboardSummary>(
    `${ADMIN_BFF_BASE}/dashboard/summary?days=${days}`,
    noStoreConfig,
  );
  return data;
}

export const ADMIN_DASHBOARD_QUICK_ACTIONS = [
  {
    href: '/admin/import',
    label: 'Импорт каталога',
    description: 'Запуск и мониторинг import jobs',
  },
  {
    href: '/admin/rankings',
    label: 'Агрегация рейтингов',
    description: 'Импорт внешних топов и публикация',
  },
  {
    href: '/admin/context',
    label: 'LLM context batch',
    description: 'Очередь ContextReading и batch jobs',
  },
] as const;
