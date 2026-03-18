import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SupplyChainTimeline, defaultSteps } from "@/components/SupplyChainTimeline";
import { Search } from "lucide-react";

const TrackMedicine = () => {
  const [batchId, setBatchId] = useState("");
  const [tracked, setTracked] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setTracked(true);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Supply Chain Tracking</h1>
      <Card>
        <CardHeader><CardTitle>Track Medicine Journey</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleTrack} className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label>Batch ID</Label>
              <Input placeholder="BATCH-2025-0042" value={batchId} onChange={e => setBatchId(e.target.value)} required />
            </div>
            <Button type="submit" className="self-end gap-2"><Search className="h-4 w-4" /> Track</Button>
          </form>
        </CardContent>
      </Card>
      {tracked && (
        <Card>
          <CardHeader><CardTitle>Supply Chain Timeline — {batchId}</CardTitle></CardHeader>
          <CardContent>
            <SupplyChainTimeline steps={defaultSteps} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrackMedicine;
