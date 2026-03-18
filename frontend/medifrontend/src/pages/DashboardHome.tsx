import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, CheckCircle2, AlertTriangle } from "lucide-react";
import MedicineCard from "@/components/MedicineCard";
import { useAuth } from "@/context/AuthContext";

const stats = [
  { title: "Total Batches", value: "1,247", icon: Package, color: "text-primary" },
  { title: "In Transit", value: "89", icon: Truck, color: "text-warning" },
  { title: "Verified", value: "1,158", icon: CheckCircle2, color: "text-success" },
  { title: "Flagged", value: "3", icon: AlertTriangle, color: "text-destructive" },
];

const recentMeds = [
  { name: "Amoxicillin 500mg", batchId: "BATCH-2025-0042", manufacturer: "PharmaCorp", manufacturingDate: "2025-01-10", expiryDate: "2027-01-10", status: "verified" as const },
  { name: "Ibuprofen 200mg", batchId: "BATCH-2025-0041", manufacturer: "MedLife Inc", manufacturingDate: "2025-01-08", expiryDate: "2026-06-08", status: "in-transit" as const },
  { name: "Paracetamol 500mg", batchId: "BATCH-2025-0040", manufacturer: "HealthGen", manufacturingDate: "2025-01-05", expiryDate: "2027-01-05", status: "delivered" as const },
];

const DashboardHome = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Batches</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentMeds.map(m => <MedicineCard key={m.batchId} {...m} />)}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
