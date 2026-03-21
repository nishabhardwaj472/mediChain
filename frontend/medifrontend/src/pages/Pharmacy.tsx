import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import BlockchainStatus from "@/components/BlockchainStatus";
import { confirmReceipt } from "@/api/medicine";

const Pharmacy = () => {
  const [form, setForm] = useState({
    batchId: "",
    location: "",
  });

  const [status, setStatus] = useState<
    "idle" | "pending" | "confirmed" | "error"
  >("idle");

  const [txHash, setTxHash] = useState("");

  const update = (k: string, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setStatus("pending");

      const res = await confirmReceipt({
        batchId: form.batchId,
        location: form.location,
      });

      setTxHash(res.data.txHash);
      setStatus("confirmed");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Receive Medicine</h1>

      <Card>
        <CardHeader>
          <CardTitle>Receipt Confirmation</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-2">
              <Label>Batch ID</Label>
              <Input
                value={form.batchId}
                onChange={(e) => update("batchId", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="City, Country"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={status === "pending"}
              className="w-full"
            >
              {status === "pending"
                ? "Processing..."
                : "Confirm Receipt on Blockchain"}
            </Button>

          </form>
        </CardContent>
      </Card>

      <BlockchainStatus status={status} txHash={txHash} />
    </div>
  );
};

export default Pharmacy;