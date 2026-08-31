'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { workflowsApi } from '@/lib/workflows-api';

const workflowInfo: Record<string, { title: string; trigger: string; action: string; toggleable: boolean }> = {
  NEW_ORDER_EMAIL: {
    title: 'New Order → Send Email',
    trigger: 'New Order Trigger',
    action: 'Sends an email to you when a new order comes in.',
    toggleable: true,
  },
  NEW_ORDER_INVENTORY: {
    title: 'New Order → Update Inventory',
    trigger: 'New Order Trigger',
    action: 'Core behavior — stock always updates automatically on every order.',
    toggleable: false,
  },
  LOW_STOCK_NOTIFY: {
    title: 'Low Stock → Notify Seller',
    trigger: 'Low Stock Trigger',
    action: 'Sends an email when a product drops below 5 units in stock.',
    toggleable: true,
  },
};

export default function AutomationPage() {
  const queryClient = useQueryClient();
  const { data: workflows, isLoading } = useQuery({ queryKey: ['seller-workflows'], queryFn: workflowsApi.list });

  const handleToggle = async (key: string) => {
    await workflowsApi.toggle(key);
    queryClient.invalidateQueries({ queryKey: ['seller-workflows'] });
  };

  if (isLoading) return <p className="text-text-muted">Loading automations...</p>;

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-text-primary">Automation</h1>
      <p className="mb-2 text-sm text-text-muted">
        Pre-built workflows for your store. A full custom workflow builder is coming soon —
        for now these are the automations available.
      </p>
      <p className="mb-6 rounded-btn border border-border bg-bg px-3 py-2 text-xs text-text-muted">
        Coming soon: custom workflow builder
      </p>

      <div className="space-y-3">
        {workflows?.map((w) => {
          const info = workflowInfo[w.key];
          return (
            <div key={w.id} className="flex items-center justify-between rounded-card border border-border bg-surface p-4">
              <div>
                <p className="font-medium text-text-primary">{info.title}</p>
                <p className="text-xs text-text-muted">{info.action}</p>
              </div>
              <label className={`relative inline-flex h-6 w-11 items-center ${info.toggleable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                <input
                  type="checkbox"
                  checked={w.isActive}
                  disabled={!info.toggleable}
                  onChange={() => info.toggleable && handleToggle(w.key)}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-border peer-checked:bg-primary" />
                <div className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}