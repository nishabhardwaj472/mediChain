import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import BlockchainStatus from "@/components/BlockchainStatus";
import { confirmReceipt as confirmReceiptAPI } from "@/api/medicine";
import contract from "@/blockchain/contract";
import { useToast } from "@/hooks/use-toast";

const Pharmacy = () => {
  const { toast } = useToast();

  const [form, setForm] = useState({
    batchId: "",
    location: "",
  });

  const [status, setStatus] = useState<
    "idle" | "pending" | "confirmed" | "error"
  >("idle");

  const [txHash, setTxHash] = useState("");

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.batchId || !form.location) {
      toast({
        title: "Missing Fields",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setStatus("pending");

      // ✅ 1. Blockchain transaction
      const tx = await contract.confirmReceipt(
        form.batchId,
        form.location
      );

      await tx.wait();

      // ✅ 2. Mark success immediately (blockchain is source of truth)
      setTxHash(tx.hash);
      setStatus("confirmed");

      toast({
        title: "Success",
        description: "Medicine received on blockchain",
      });

      // ✅ 3. Backend sync (non-blocking)
      try {
        await confirmReceiptAPI({
          batchId: form.batchId,
          location: form.location,
          txHash: tx.hash,
        });
      } catch (apiErr) {
        console.warn("Backend sync failed:", apiErr);

        toast({
          title: "Sync Issue",
          description:
            "Blockchain updated, but server sync failed",
          variant: "destructive",
        });
      }

      // ✅ reset form
      setForm({
        batchId: "",
        location: "",
      });

    } catch (err: any) {
      console.error(err);

      setStatus("error");

      toast({
        title: "Transaction Failed",
        description:
          err?.reason ||
          err?.message ||
          "Something went wrong",
        variant: "destructive",
      });
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
                placeholder="Enter batch ID"
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
              disabled={status === "pending" || status === "confirmed"}
              className="w-full"
            >
              {status === "pending"
                ? "Processing..."
                : status === "confirmed"
                ? "Already Delivered"
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