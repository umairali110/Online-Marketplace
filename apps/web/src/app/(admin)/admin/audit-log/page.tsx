'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';

export default function AdminAuditLogPage() {
  const { data: logs, isLoading } = useQuery({ queryKey: ['admin-audit-log'], queryFn: adminApi.listAuditLog });

  if (isLoading) return <p className="text-text-muted">Loading...</p>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-text-primary">Audit Log</h1>
      <div className="divide-y divide-border rounded-card border border-border bg-surface">
        {logs?.length === 0 && <p className="p-4 text-sm text-text-muted">No admin actions recorded yet.</p>}
        {logs?.map((log) => (
          <div key={log.id} className="flex items-center justify-between p-3 text-sm">
            <div>
              <span className="font-medium text-text-primary">{log.actorName}</span>{' '}
              <span className="text-text-muted">{log.action.replace(/_/g, ' ').toLowerCase()}</span>{' '}
              {log.targetType && <span className="text-text-muted">({log.targetType})</span>}
            </div>
            <span className="text-xs text-text-muted">{new Date(log.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}