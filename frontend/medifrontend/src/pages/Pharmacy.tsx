import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BlockchainStatus from "@/components/BlockchainStatus";

const Pharmacy = () => {
  const [form, setForm] = useState({ batchId: "", pharmacy: "", location: "" });
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
      <h1 className="text-2xl font-bold">Receive Medicine</h1>
      <Card>
        <CardHeader><CardTitle>Receipt Confirmation</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Batch ID</Label><Input value={form.batchId} onChange={e => update("batchId", e.target.value)} required /></div>
            <div className="space-y-2"><Label>Pharmacy Name</Label><Input value={form.pharmacy} onChange={e => update("pharmacy", e.target.value)} required /></div>
            <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={e => update("location", e.target.value)} required /></div>
            <Button type="submit" disabled={status === "pending"} className="w-full">Confirm Receipt</Button>
          </form>
        </CardContent>
      </Card>
      <BlockchainStatus status={status} txHash={txHash} />
    </div>
  );
};

export default Pharmacy;
