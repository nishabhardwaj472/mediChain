import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, Calendar, Hash } from "lucide-react";

interface MedicineCardProps {
  name: string;
  batchId: string;
  manufacturer: string;
  manufacturingDate: string;
  expiryDate: string;
  status?: "verified" | "in-transit" | "delivered";
}

const statusColors: Record<string, string> = {
  verified: "bg-success text-success-foreground",
  "in-transit": "bg-warning text-warning-foreground",
  delivered: "bg-primary text-primary-foreground",
};

const MedicineCard = ({ name, batchId, manufacturer, manufacturingDate, expiryDate, status = "verified" }: MedicineCardProps) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-lg flex items-center gap-2">
        <Pill className="h-5 w-5 text-primary" />
        {name}
      </CardTitle>
      <Badge className={statusColors[status]}>{status}</Badge>
    </CardHeader>
    <CardContent className="space-y-2 text-sm text-muted-foreground">
      <div className="flex items-center gap-2"><Hash className="h-4 w-4" /> Batch: {batchId}</div>
      <div>Manufacturer: {manufacturer}</div>
      <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Mfg: {manufacturingDate} | Exp: {expiryDate}</div>
    </CardContent>
  </Card>
);

export default MedicineCard;
