import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SupplyChainTimeline, defaultSteps } from "@/components/SupplyChainTimeline";
import { Search, MapPin, ArrowRight } from "lucide-react";

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
              <Input
                placeholder="BATCH-2025-0042"
                value={batchId}
                onChange={e => setBatchId(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="self-end gap-2">
              <Search className="h-4 w-4" />
              Track
            </Button>
          </form>
        </CardContent>
      </Card>

      {tracked && (
        <>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-1.5">
              <ArrowRight className="h-3.5 w-3.5 text-primary" />
              From / To = Wallet Transaction IDs
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Location of each supply chain step
            </span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Supply Chain Timeline
                <span className="text-sm font-normal text-muted-foreground">— {batchId}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SupplyChainTimeline steps={defaultSteps} />
            </CardContent>
          </Card>

          {/* Transaction summary table */}
          <Card>
            <CardHeader><CardTitle className="text-base">Transaction Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 pr-4 font-medium">Stage</th>
                      <th className="text-left py-2 pr-4 font-medium">From Tx ID</th>
                      <th className="text-left py-2 pr-4 font-medium">To Tx ID</th>
                      <th className="text-left py-2 font-medium">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defaultSteps.map((step, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-2 pr-4 font-medium">{step.stage}</td>
                        <td className="py-2 pr-4 font-mono text-xs text-primary">{step.fromTxId}</td>
                        <td className="py-2 pr-4 font-mono text-xs text-primary">{step.toTxId}</td>
                        <td className="py-2 text-xs flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {step.location}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default TrackMedicine;
