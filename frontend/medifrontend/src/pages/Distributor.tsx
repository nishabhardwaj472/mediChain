import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import BlockchainStatus from "@/components/BlockchainStatus";
import { updateShipment } from "@/api/medicine";

const Distributor = () => {
  const [form, setForm] = useState({
    batchId: "",
    location: "",
    shipmentStatus: "InTransit",
    toAddress: "",
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

      const res = await updateShipment({
        batchId: form.batchId,
        toAddress: form.toAddress,
        location: form.location,
        status: form.shipmentStatus,
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
      <h1 className="text-2xl font-bold">Update Shipment</h1>

      <Card>
        <CardHeader>
          <CardTitle>Shipment Details</CardTitle>
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

            <div className="space-y-2">
              <Label>Shipment Status</Label>
              <Select
                value={form.shipmentStatus}
                onValueChange={(v) => update("shipmentStatus", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="InTransit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Receiver Wallet Address</Label>
              <Input
                value={form.toAddress}
                onChange={(e) => update("toAddress", e.target.value)}
                placeholder="0x..."
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter wallet address of next entity (Distributor / Pharmacy)
              </p>
            </div>

            <Button
              type="submit"
              disabled={status === "pending" || !form.toAddress}
              className="w-full"
            >
              {status === "pending"
                ? "Processing..."
                : "Update Blockchain Record"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <BlockchainStatus status={status} txHash={txHash} />
    </div>
  );
};

export default Distributor;