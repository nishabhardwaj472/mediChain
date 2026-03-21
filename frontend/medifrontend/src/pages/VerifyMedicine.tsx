import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRScanner from "@/components/QRScanner";
import { QrCode, Search, AlertTriangle, ArrowLeft } from "lucide-react";

const VerifyMedicine = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [batchId, setBatchId] = useState("");
  const [counterfeit, setCounterfeit] = useState(false);

  const isInDashboard = location.pathname.startsWith("/dashboard");

  const verifyBatch = (id: string) => {
    const trimmed = id.trim();
    if (trimmed.startsWith("BATCH")) {
      const detailsPath = isInDashboard ? "/dashboard/medicine-details" : "/medicine-details";
      navigate(detailsPath, { state: { batchId: trimmed } });
    } else {
      setCounterfeit(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCounterfeit(false);
    verifyBatch(batchId);
  };

  const handleQRScan = (result: string) => {
    // QR might contain "medichain://BATCH-..." or just "BATCH-..."
    const id = result.replace("medichain://", "");
    verifyBatch(id);
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
          <Tabs defaultValue="scan" onValueChange={() => setCounterfeit(false)}>
            <TabsList className="w-full">
              <TabsTrigger value="scan" className="flex-1 gap-2">
                <QrCode className="h-4 w-4" /> Scan QR
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex-1 gap-2">
                <Search className="h-4 w-4" /> Enter Batch ID
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scan" className="mt-4">
              <QRScanner onScan={handleQRScan} />
            </TabsContent>

            <TabsContent value="batch" className="mt-4">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Label>Batch ID</Label>
                  <Input
                    placeholder="BATCH-2025-0042"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="self-end">Verify</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {counterfeit && (
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