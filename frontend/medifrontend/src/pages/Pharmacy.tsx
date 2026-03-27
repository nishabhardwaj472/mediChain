import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import BlockchainStatus from "@/components/BlockchainStatus";
import { confirmReceipt as confirmReceiptAPI } from "@/api/medicine";
import contract from "@/blockchain/contract"; // ✅ use your existing contract
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

      // ✅ 1. Call blockchain
      const tx = await contract.confirmReceipt(
        form.batchId,
        form.location
      );

      // ✅ 2. Wait for mining
      await tx.wait();

      // ✅ 3. Sync with backend
      await confirmReceiptAPI({
        batchId: form.batchId,
        location: form.location,
        txHash: tx.hash,
      });

      // ✅ success
      setTxHash(tx.hash);
      setStatus("confirmed");

      // reset form
      setForm({
        batchId: "",
        location: "",
      });

      toast({
        title: "Success",
        description: "Medicine received successfully",
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