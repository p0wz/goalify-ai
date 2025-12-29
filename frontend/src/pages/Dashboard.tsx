import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { LiveMatchWidget } from "@/components/dashboard/LiveMatchWidget";
import { TrendingUp, Target, Percent, Trophy } from "lucide-react";

const Dashboard = () => {
  return (
    <AppLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-display mb-2">
          Hoş Geldin, <span className="text-gradient">Ahmet!</span>
        </h1>
        <p className="text-muted-foreground">Bugün için tahminlerin hazır. Başarılı bir gün dileriz!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Toplam Tahmin"
          value={247}
          change={12}
          icon={<TrendingUp className="w-6 h-6" />}
          variant="primary"
        />
        <StatsCard
          title="Başarı Oranı"
          value="%81.4"
          change={5}
          icon={<Percent className="w-6 h-6" />}
          variant="success"
        />
        <StatsCard
          title="Aktif Tahmin"
          value={12}
          icon={<Target className="w-6 h-6" />}
        />
        <StatsCard
          title="Kazanılan"
          value={201}
          change={8}
          icon={<Trophy className="w-6 h-6" />}
          variant="accent"
        />
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
