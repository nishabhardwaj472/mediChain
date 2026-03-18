import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const monthlyData = [
  { month: "Jan", batches: 120 }, { month: "Feb", batches: 98 },
  { month: "Mar", batches: 156 }, { month: "Apr", batches: 134 },
  { month: "May", batches: 178 }, { month: "Jun", batches: 145 },
];

const pieData = [
  { name: "Verified", value: 1158 }, { name: "In Transit", value: 89 }, { name: "Flagged", value: 3 },
];
const COLORS = ["hsl(160 60% 40%)", "hsl(40 90% 50%)", "hsl(0 72% 55%)"];

const Reports = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Reports & Analytics</h1>
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Monthly Batch Registrations</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="batches" fill="hsl(210 80% 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Batch Status Distribution</CardTitle></CardHeader>
        <CardContent className="flex justify-center">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Reports;
