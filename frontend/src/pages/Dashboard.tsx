import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { LiveMatchWidget } from "@/components/dashboard/LiveMatchWidget";
import { Sparkles } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || 'https://goalify-ai.onrender.com/api';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setUser(data.user);
        })
        .catch(() => { });
    }
  }, []);

  // Get display name from user data
  const displayName = user?.name || user?.email?.split('@')[0] || 'Kullanıcı';

  return (
    <AppLayout>
      {/* Welcome Section - Brutalist Style */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 brutalist-border bg-card shadow-brutalist-sm mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-display uppercase tracking-wider">Dashboard</span>
        </div>
        <h1 className="brutalist-heading text-3xl md:text-4xl mb-2">
          Hoş Geldin, <span className="text-gradient">{displayName}!</span>
        </h1>
        <p className="text-muted-foreground">AI destekli analizler ve güncel maç verileri seni bekliyor.</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <PerformanceChart />
          <ActivityFeed />
        </div>

        {/* Right Column - Quick Actions & Live */}
        <div className="space-y-6">
          <QuickActions />
          <LiveMatchWidget />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
