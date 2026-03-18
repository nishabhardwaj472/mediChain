import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import BlockchainStatus from "@/components/BlockchainStatus";

const AddBatch = () => {
  const [form, setForm] = useState({ name: "", batchId: "", manufacturer: "", mfgDate: "", expDate: "", quantity: "", description: "" });
  const [status, setStatus] = useState<"idle" | "pending" | "confirmed">("idle");
  const [txHash, setTxHash] = useState("");
  const [showQR, setShowQR] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("pending");
    setTimeout(() => {
      setTxHash("0x" + Math.random().toString(16).slice(2, 18) + "..." + Math.random().toString(16).slice(2, 10));
      setStatus("confirmed");
      setShowQR(true);
    }, 2500);
  };

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Add Medicine Batch</h1>
      <Card>
        <CardHeader><CardTitle>Batch Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Medicine Name</Label><Input value={form.name} onChange={e => update("name", e.target.value)} required /></div>
              <div className="space-y-2"><Label>Batch ID</Label><Input value={form.batchId} onChange={e => update("batchId", e.target.value)} placeholder="BATCH-2025-XXXX" required /></div>
              <div className="space-y-2"><Label>Manufacturer Name</Label><Input value={form.manufacturer} onChange={e => update("manufacturer", e.target.value)} required /></div>
              <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e => update("quantity", e.target.value)} required /></div>
              <div className="space-y-2"><Label>Manufacturing Date</Label><Input type="date" value={form.mfgDate} onChange={e => update("mfgDate", e.target.value)} required /></div>
              <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={form.expDate} onChange={e => update("expDate", e.target.value)} required /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => update("description", e.target.value)} /></div>
            <Button type="submit" disabled={status === "pending"} className="w-full">Register on Blockchain</Button>
          </form>
        </CardContent>
      </Card>
      <BlockchainStatus status={status} txHash={txHash} />
      {showQR && form.batchId && (
        <QRCodeDisplay value={`medichain://${form.batchId}`} title={`QR: ${form.batchId}`} />
      )}
    </div>
  );
};

export default AddBatch;
