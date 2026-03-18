import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BlockchainStatus from "@/components/BlockchainStatus";

const Distributor = () => {
  const [form, setForm] = useState({ batchId: "", distributor: "", location: "", shipmentStatus: "in-transit" });
  const [status, setStatus] = useState<"idle" | "pending" | "confirmed">("idle");
  const [txHash, setTxHash] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("pending");
    setTimeout(() => {
      setTxHash("0x" + Math.random().toString(16).slice(2, 18));
      setStatus("confirmed");
    }, 2000);
  };

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Update Shipment</h1>
      <Card>
        <CardHeader><CardTitle>Shipment Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Batch ID</Label><Input value={form.batchId} onChange={e => update("batchId", e.target.value)} required /></div>
            <div className="space-y-2"><Label>Distributor Name</Label><Input value={form.distributor} onChange={e => update("distributor", e.target.value)} required /></div>
            <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={e => update("location", e.target.value)} required /></div>
            <div className="space-y-2">
              <Label>Shipment Status</Label>
              <Select value={form.shipmentStatus} onValueChange={v => update("shipmentStatus", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={status === "pending"} className="w-full">Update Blockchain Record</Button>
          </form>
        </CardContent>
      </Card>
      <BlockchainStatus status={status} txHash={txHash} />
    </div>
  );
};

export default Distributor;
