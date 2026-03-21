import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SupplyChainTimeline } from "@/components/SupplyChainTimeline";

import { verifyMedicine, getMedicineHistory } from "@/api/medicine";

import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

const VerifyMedicine = () => {
  const navigate = useNavigate();
  const { batchId: urlBatchId } = useParams();

  const [batchId, setBatchId] = useState(urlBatchId || "");
  const [qrHash, setQrHash] = useState("");

  const [result, setResult] = useState<"valid" | "counterfeit" | null>(null);
  const [medicine, setMedicine] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔍 Auto verify from QR URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = params.get("hash");

    if (urlBatchId && hash) {
      setBatchId(urlBatchId);
      setQrHash(hash);
      handleVerify(urlBatchId, hash);
    }
  }, [urlBatchId]);

  const handleVerify = async (
    id?: string,
    hash?: string
  ) => {
    try {
      setLoading(true);

      const res = await verifyMedicine({
        batchId: id || batchId,
        qrHash: hash || qrHash,
      });

      if (!res.isValid) {
        setResult("counterfeit");
        return;
      }

      setResult("valid");
      setMedicine(res);

      // 📊 Fetch history
      const historyRes = await getMedicineHistory(id || batchId);

      const formatted = historyRes.data.map((tx: any, index: number) => ({
        stage:
          index === 0
            ? "Manufacturer"
            : index === historyRes.data.length - 1
            ? "Pharmacy"
            : "Distributor",

        fromTxId: tx.from,
        toTxId: tx.to,
        location: tx.location,
        status: tx.status,
      }));

      setSteps(formatted);

    } catch (err) {
      console.error(err);
      setResult("counterfeit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Verify Medicine</h1>
      </div>

      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle>Medicine Verification</CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="batch">
            <TabsList className="w-full">
              <TabsTrigger value="scan" className="flex-1 gap-2">
                <QrCode className="h-4 w-4" /> Scan QR
              </TabsTrigger>

              <TabsTrigger value="batch" className="flex-1 gap-2">
                <Search className="h-4 w-4" /> Enter Batch ID
              </TabsTrigger>
            </TabsList>

            {/* QR Scan Placeholder */}
            <TabsContent value="scan" className="mt-4">
              <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg text-muted-foreground">
                <div className="text-center">
                  <QrCode className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">QR scanning coming soon</p>
                </div>
              </div>
            </TabsContent>

            {/* Manual Input */}
            <TabsContent value="batch" className="mt-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerify();
                }}
                className="flex gap-3"
              >
                <div className="flex-1 space-y-2">
                  <Label>Batch ID</Label>
                  <Input
                    placeholder="BATCH-2025-0042"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="self-end">
                  {loading ? "Verifying..." : "Verify"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ✅ VALID */}
      {result === "valid" && medicine && (
        <Card className="border-green-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Medicine Verified ✓
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>{" "}
                {medicine.name}
              </div>

              <div>
                <span className="text-muted-foreground">Batch ID:</span>{" "}
                {batchId}
              </div>

              <div>
                <span className="text-muted-foreground">Manufacturer:</span>{" "}
                {medicine.manufacturer}
              </div>

              <div>
                <span className="text-muted-foreground">Expiry:</span>{" "}
                {new Date(medicine.expiryDate * 1000).toLocaleDateString()}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">
                Supply Chain History
              </h4>
              <SupplyChainTimeline steps={steps} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ❌ COUNTERFEIT */}
      {result === "counterfeit" && (
        <Card className="border-red-500/50 bg-red-50">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />

            <h3 className="text-xl font-bold text-red-600 mb-2">
              ⚠ Counterfeit Warning
            </h3>

            <p className="text-muted-foreground">
              This medicine is not valid or QR mismatch detected.
              Do not consume.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VerifyMedicine;