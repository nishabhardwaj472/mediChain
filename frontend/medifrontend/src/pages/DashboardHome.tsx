import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import MedicineCard from "@/components/MedicineCard";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardStats } from "@/services/medicineService";

interface DashboardData {
  stats: {
    totalBatches: number;
    inTransit: number;
    delivered: number;
    flagged: number;
  };
  recentBatches: any[];
}

const DashboardHome = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getDashboardStats();
        if (res.success) {
          setData(res.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch dashboard stats:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  const statsConfig = [
    { title: "Total Batches", value: data?.stats.totalBatches || 0, icon: Package, color: "text-primary" },
    { title: "In Transit", value: data?.stats.inTransit || 0, icon: Truck, color: "text-warning" },
    { title: "Delivered", value: data?.stats.delivered || 0, icon: CheckCircle2, color: "text-success" },
    { title: "Flagged", value: data?.stats.flagged || 0, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <div className="text-sm text-muted-foreground">
          Welcome back, <span className="font-semibold text-foreground capitalize">{user?.fullName}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((s) => (
          <Card key={s.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        {data?.recentBatches && data.recentBatches.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.recentBatches.map((m) => (
              <MedicineCard
                key={m.batchId}
                name={m.name}
                batchId={m.batchId}
                manufacturer={m.manufacturerName}
                manufacturingDate={new Date(m.manufactureDate * 1000).toLocaleDateString()}
                expiryDate={new Date(m.expiryDate * 1000).toLocaleDateString()}
                status={m.status === "Registered" ? "verified" : m.status === "InTransit" ? "in-transit" : "delivered"}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-muted/20 rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">No recent batch activity found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;

