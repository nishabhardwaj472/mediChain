import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const txData = [
  { hash: "0xabc123...def456", type: "Register Batch", batch: "BATCH-2025-0042", from: "0xA1b2...C3d4", time: "2025-01-15 09:30", status: "confirmed" },
  { hash: "0x789abc...123def", type: "Shipment Update", batch: "BATCH-2025-0042", from: "0xE5f6...G7h8", time: "2025-01-18 14:22", status: "confirmed" },
  { hash: "0xdef789...abc123", type: "Receipt Confirm", batch: "BATCH-2025-0042", from: "0xI9j0...K1l2", time: "2025-01-20 11:15", status: "confirmed" },
  { hash: "0x456def...789abc", type: "Register Batch", batch: "BATCH-2025-0041", from: "0xM3n4...O5p6", time: "2025-01-08 08:00", status: "confirmed" },
  { hash: "0xfed321...cba654", type: "Shipment Update", batch: "BATCH-2025-0041", from: "0xQ7r8...S9t0", time: "2025-01-12 16:45", status: "pending" },
];

const Transactions = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Transactions</h1>
    <Card>
      <CardHeader><CardTitle>Blockchain Transactions</CardTitle></CardHeader>
      <CardContent className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tx Hash</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>From</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {txData.map(tx => (
              <TableRow key={tx.hash}>
                <TableCell className="font-mono text-xs text-primary">{tx.hash}</TableCell>
                <TableCell>{tx.type}</TableCell>
                <TableCell className="font-mono text-xs">{tx.batch}</TableCell>
                <TableCell className="font-mono text-xs">{tx.from}</TableCell>
                <TableCell className="text-xs">{tx.time}</TableCell>
                <TableCell>
                  <Badge variant={tx.status === "confirmed" ? "default" : "secondary"}>
                    {tx.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

export default Transactions;
