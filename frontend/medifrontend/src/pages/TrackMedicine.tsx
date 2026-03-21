import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SupplyChainTimeline } from "@/components/SupplyChainTimeline";

import { getMedicineHistory } from "@/api/medicine";
import { getUserByWallet } from "@/api/user.ts";

import { Search, MapPin, ArrowRight } from "lucide-react";

const TrackMedicine = () => {
  const [batchId, setBatchId] = useState("");
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await getMedicineHistory(batchId);

      // 🔄 Format blockchain history → timeline
     const formatted = await Promise.all(
  res.data.map(async (tx: any) => {
    let stage = "Unknown";

    try {
      const userRes = await getUserByWallet(tx.to?.toLowerCase());

      const role = userRes.data.role;

      if (role === "manufacturer") stage = "Manufacturer";
      else if (role === "distributor") stage = "Distributor";
      else if (role === "pharmacy") stage = "Pharmacy";

    } catch (err) {
      stage = "Unknown";
    }

    return {
      stage,
      fromTxId: tx.from,
      toTxId: tx.to,
      location: tx.location,
      status: tx.status,
      timestamp: tx.timestamp,
    };
  })
);

      setSteps(formatted);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch tracking data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Supply Chain Tracking</h1>

      <Card>
        <CardHeader>
          <CardTitle>Track Medicine Journey</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleTrack} className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label>Batch ID</Label>
              <Input
                placeholder="BATCH-2025-0042"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="self-end gap-2">
              <Search className="h-4 w-4" />
              {loading ? "Tracking..." : "Track"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {steps.length > 0 && (
        <>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-1.5">
              <ArrowRight className="h-3.5 w-3.5 text-primary" />
              From / To = Wallet Addresses
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Location of each step
            </span>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Supply Chain Timeline
                <span className="text-sm font-normal text-muted-foreground">
                  — {batchId}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <SupplyChainTimeline steps={steps} />
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Transaction Summary
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 pr-4 font-medium">Stage</th>
                      <th className="text-left py-2 pr-4 font-medium">From</th>
                      <th className="text-left py-2 pr-4 font-medium">To</th>
                      <th className="text-left py-2 font-medium">Location</th>
                    </tr>
                  </thead>

                  <tbody>
                    {steps.map((step, i) => (
                      <tr
                        key={i}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-2 pr-4 font-medium">
                          {step.stage}
                        </td>

                        <td className="py-2 pr-4 font-mono text-xs text-primary truncate max-w-[120px]">
                          {step.fromTxId}
                        </td>

                        <td className="py-2 pr-4 font-mono text-xs text-primary truncate max-w-[120px]">
                          {step.toTxId}
                        </td>

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