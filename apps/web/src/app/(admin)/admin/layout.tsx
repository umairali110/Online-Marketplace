'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { AdminSidebar } from '@/components/admin/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== 'ADMIN') router.push('/login');
  }, [loading, user, router]);

  if (loading) return <p className="p-8 text-text-muted">Loading...</p>;
  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-bg p-6">{children}</main>
    </div>
  );
}