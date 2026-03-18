import { CheckCircle2, Circle, Truck, Factory, Store, User } from "lucide-react";

interface TimelineStep {
  stage: string;
  icon: React.ReactNode;
  walletAddress: string;
  timestamp: string;
  txHash: string;
  status: "completed" | "current" | "pending";
}

interface SupplyChainTimelineProps {
  steps: TimelineStep[];
}

const SupplyChainTimeline = ({ steps }: SupplyChainTimelineProps) => (
  <div className="space-y-0">
    {steps.map((step, i) => (
      <div key={i} className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className={`rounded-full p-2 ${
            step.status === "completed" ? "bg-success text-success-foreground" :
            step.status === "current" ? "bg-primary text-primary-foreground" :
            "bg-muted text-muted-foreground"
          }`}>
            {step.status === "completed" ? <CheckCircle2 className="h-5 w-5" /> : step.icon}
          </div>
          {i < steps.length - 1 && (
            <div className={`w-0.5 h-16 ${step.status === "completed" ? "bg-success" : "bg-border"}`} />
          )}
        </div>
        <div className="pb-8">
          <h4 className={`font-semibold ${step.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
            {step.stage}
          </h4>
          <p className="text-xs text-muted-foreground mt-1 font-mono">{step.walletAddress}</p>
          <p className="text-xs text-muted-foreground">{step.timestamp}</p>
          {step.txHash && (
            <p className="text-xs text-primary mt-1 font-mono truncate max-w-[250px]">Tx: {step.txHash}</p>
          )}
        </div>
      </div>
    ))}
  </div>
);

export { SupplyChainTimeline };
export type { TimelineStep };
export const defaultSteps: TimelineStep[] = [
  { stage: "Manufacturer", icon: <Factory className="h-5 w-5" />, walletAddress: "0xA1b2...C3d4", timestamp: "2025-01-15 09:30 UTC", txHash: "0xabc123...def456", status: "completed" },
  { stage: "Distributor", icon: <Truck className="h-5 w-5" />, walletAddress: "0xE5f6...G7h8", timestamp: "2025-01-18 14:22 UTC", txHash: "0x789abc...123def", status: "completed" },
  { stage: "Pharmacy", icon: <Store className="h-5 w-5" />, walletAddress: "0xI9j0...K1l2", timestamp: "2025-01-20 11:15 UTC", txHash: "0xdef789...abc123", status: "current" },
  { stage: "Consumer", icon: <User className="h-5 w-5" />, walletAddress: "Pending", timestamp: "—", txHash: "", status: "pending" },
];
