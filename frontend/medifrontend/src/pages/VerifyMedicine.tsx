import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRScanner from "@/components/QRScanner";
import { QrCode, Search, AlertTriangle, ArrowLeft, CheckCircle2, ShieldCheck, Factory, Calendar, User as UserIcon, Tag } from "lucide-react";
import { verifyMedicine } from "@/api/medicine";
import { Badge } from "@/components/ui/badge";

interface MedicineDetails {
  isValid: boolean;
  verifiedBy: string;
  batchId: string;
  isExpired: boolean;
  name: string;
  manufacturer: string;
  imageUrl: string;
  status: string;
  expiryDate: number;
  manufactureDate: number;
  currentHolder: string;
}

const VerifyMedicine = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [batchId, setBatchId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [counterfeit, setCounterfeit] = useState(false);
  const [verifiedData, setVerifiedData] = useState<MedicineDetails | null>(null);

  const isInDashboard = location.pathname.startsWith("/dashboard");

  const runVerification = async (id: string, qrHash?: string) => {
    setIsVerifying(true);
    setCounterfeit(false);
    setVerifiedData(null);

    try {
      const response = await verifyMedicine({ batchId: id.trim(), qrHash });
      const data = response.data;

      if (data.isValid) {
        setVerifiedData(data);
      } else {
        setCounterfeit(true);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setCounterfeit(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchId) {
      runVerification(batchId);
    }
  };

  const handleQRScan = (result: string) => {
    // QR contains "http://.../verify/BATCH-ID?hash=QR-HASH"
    try {
      const url = new URL(result);
      const id = url.pathname.split("/").pop() || "";
      const hash = url.searchParams.get("hash") || undefined;

      if (id) {
        setBatchId(id);
        runVerification(id, hash);
      }
    } catch (e) {
      // Fallback if it's just the ID
      runVerification(result);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Verify Medicine</h1>
      </div>

      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader><CardTitle>Secure Verification</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="scan" onValueChange={() => {
            setCounterfeit(false);
            setVerifiedData(null);
          }}>
            <TabsList className="w-full bg-muted/50">
              <TabsTrigger value="scan" className="flex-1 gap-2">
                <QrCode className="h-4 w-4" /> Scan QR
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex-1 gap-2">
                <Search className="h-4 w-4" /> Enter Batch ID
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scan" className="mt-4">
              <div className="rounded-xl overflow-hidden border-2 border-dashed border-primary/20 p-2">
                <QRScanner onScan={handleQRScan} />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Scan the QR code on the medicine packaging for instant verification.
              </p>
            </TabsContent>

            <TabsContent value="batch" className="mt-4">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Label>Batch ID</Label>
                  <Input
                    placeholder="BATCH-2025-0042"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="h-12 text-lg font-mono"
                    required
                  />
                </div>
                <Button type="submit" className="self-end h-12 px-8" disabled={isVerifying}>
                  {isVerifying ? "Verifying..." : "Verify"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {verifiedData && (
        <Card className="border-green-500/50 bg-green-500/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-green-500/10 p-4 border-b border-green-500/20 flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-green-500" />
            <div>
              <h3 className="text-lg font-bold text-green-500">Authenticity Verified</h3>
              <p className="text-xs text-green-600/80">Verified by {verifiedData.verifiedBy} • Blockchain Secured</p>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <Label className="text-xs text-muted-foreground">Medicine Name</Label>
                    <p className="font-semibold">{verifiedData.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Factory className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <Label className="text-xs text-muted-foreground">Manufacturer</Label>
                    <p className="font-semibold">{verifiedData.manufacturer}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <Label className="text-xs text-muted-foreground">Current Status</Label>
                    <div><Badge variant="outline" className="mt-1">{verifiedData.status}</Badge></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <Label className="text-xs text-muted-foreground">Manufacture Date</Label>
                    <p className="font-semibold">{new Date(verifiedData.manufactureDate * 1000).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <Label className="text-xs text-muted-foreground">Expiry Date</Label>
                    <p className="font-semibold text-orange-600">{new Date(verifiedData.expiryDate * 1000).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UserIcon className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <Label className="text-xs text-muted-foreground">Current Holder</Label>
                    <p className="text-xs font-mono truncate w-32">{verifiedData.currentHolder}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t p-4 flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={() => navigate(isInDashboard ? "/dashboard/medicine-details" : "/medicine-details", { state: { batchId: verifiedData.batchId } })}>
              View Full History
            </Button>
            {verifiedData.isExpired && (
              <Badge variant="destructive">Expired</Badge>
            )}
          </CardFooter>
        </Card>
      )}

      {counterfeit && (
        <Card className="border-destructive/50 bg-destructive/5 animate-in shake duration-500">
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