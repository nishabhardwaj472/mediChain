import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import QRCodeDisplay from "@/components/QRCodeDisplay";
import BlockchainStatus from "@/components/BlockchainStatus";

import { registerMedicine } from "@/api/medicine";

const AddBatch = () => {
  const [form, setForm] = useState({
    name: "",
    batchId: "",
    manufacturerName: "",
    licenseNo: "",
    mfgDate: "",
    expDate: "",
    quantity: "",
    description: "",
  });

  const [status, setStatus] = useState<"idle" | "pending" | "confirmed" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [qrImage, setQrImage] = useState("");

  const update = (k: string, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setStatus("pending");

      const response = await registerMedicine({
        name: form.name,
        batchId: form.batchId,
        manufacturerName: form.manufacturerName,
        licenseNo: form.licenseNo,
        quantity: Number(form.quantity),
        manufactureDate: new Date(form.mfgDate).getTime() / 1000,
        expiryDate: new Date(form.expDate).getTime() / 1000,
        description: form.description,
      });

      setTxHash(response.data.txHash);
      setQrImage(response.data.imageUrl);

      setStatus("confirmed");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Add Medicine Batch</h1>

      <Card>
        <CardHeader>
          <CardTitle>Batch Information</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">

              <div className="space-y-2">
                <Label>Medicine Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Batch ID</Label>
                <Input
                  value={form.batchId}
                  onChange={(e) => update("batchId", e.target.value)}
                  placeholder="BATCH-2025-XXXX"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Manufacturer Name</Label>
                <Input
                  value={form.manufacturerName}
                  onChange={(e) => update("manufacturerName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>License Number</Label>
                <Input
                  value={form.licenseNo}
                  onChange={(e) => update("licenseNo", e.target.value)}
                  placeholder="LIC-XXXX-XXXX"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => update("quantity", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Manufacturing Date</Label>
                <Input
                  type="date"
                  value={form.mfgDate}
                  onChange={(e) => update("mfgDate", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={form.expDate}
                  onChange={(e) => update("expDate", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={status === "pending"}
              className="w-full"
            >
              {status === "pending" ? "Processing..." : "Register on Blockchain"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <BlockchainStatus status={status} txHash={txHash} />

      {status === "confirmed" && qrImage && (
        <Card className="w-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-center">Batch QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-4">
            <div className="rounded-lg bg-background p-3 border">
              <img src={qrImage} alt="Medicine QR Code" className="w-[180px] h-[180px]" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddBatch;