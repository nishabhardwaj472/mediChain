import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupplyChainTimeline, defaultSteps } from "@/components/SupplyChainTimeline";
import { QrCode, Search, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";

const VerifyMedicine = () => {
  const navigate = useNavigate();
  const { batchId: urlBatchId } = useParams();
  const [batchId, setBatchId] = useState(urlBatchId || "");
  const [result, setResult] = useState<"valid" | "counterfeit" | null>(null);

  // Auto-verify if batchId is in URL
  React.useEffect(() => {
    if (urlBatchId) {
      setResult(urlBatchId.startsWith("BATCH") ? "valid" : "counterfeit");
    }
  }, [urlBatchId]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(batchId.startsWith("BATCH") ? "valid" : "counterfeit");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Verify Medicine</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Medicine Verification</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="batch">
            <TabsList className="w-full">
              <TabsTrigger value="scan" className="flex-1 gap-2"><QrCode className="h-4 w-4" /> Scan QR</TabsTrigger>
              <TabsTrigger value="batch" className="flex-1 gap-2"><Search className="h-4 w-4" /> Enter Batch ID</TabsTrigger>
            </TabsList>
            <TabsContent value="scan" className="mt-4">
              <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg text-muted-foreground">
                <div className="text-center">
                  <QrCode className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Camera QR scanning — coming soon</p>
                  <p className="text-xs mt-1">Use Batch ID tab to verify manually</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="batch" className="mt-4">
              <form onSubmit={handleVerify} className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Label>Batch ID</Label>
                  <Input placeholder="BATCH-2025-0042" value={batchId} onChange={e => setBatchId(e.target.value)} required />
                </div>
                <Button type="submit" className="self-end">Verify</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {result === "valid" && (
        <Card className="border-success/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" /> Medicine Verified ✓
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Name:</span> Amoxicillin 500mg</div>
              <div><span className="text-muted-foreground">Batch ID:</span> {batchId}</div>
              <div><span className="text-muted-foreground">Manufacturer:</span> PharmaCorp</div>
              <div><span className="text-muted-foreground">License Number:</span> LIC-2025-8842</div>
              <div><span className="text-muted-foreground">Production:</span> 2025-01-10</div>
              <div><span className="text-muted-foreground">Expiry:</span> 2027-01-10</div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Supply Chain History</h4>
              <SupplyChainTimeline steps={defaultSteps} />
            </div>
          </CardContent>
        </Card>
      )}

      {result === "counterfeit" && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-bold text-destructive mb-2">⚠ Counterfeit Warning</h3>
            <p className="text-muted-foreground">
              This medicine is not registered on MediChain. It may be counterfeit. Do not consume and report to authorities immediately.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VerifyMedicine;
