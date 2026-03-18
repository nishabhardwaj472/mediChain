import { CheckCircle2, Circle, Truck, Factory, Store } from "lucide-react";

interface TimelineStep {
  stage: string;
  icon: React.ReactNode;
  fromTxId: string;
  toTxId: string;
  location: string;
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
            <div className={`w-0.5 h-20 ${step.status === "completed" ? "bg-success" : "bg-border"}`} />
          )}
        </div>
        <div className="pb-8 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold ${step.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
              {step.stage}
            </h4>
            {step.location && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                📍 {step.location}
              </span>
            )}
          </div>
          <div className="space-y-1 text-xs text-muted-foreground font-mono">
            {step.fromTxId && (
              <p>
                <span className="text-foreground/60 font-sans font-medium">From: </span>
                <span className="text-primary">{step.fromTxId}</span>
              </p>
            )}
            {step.toTxId && (
              <p>
                <span className="text-foreground/60 font-sans font-medium">To: &nbsp;&nbsp;</span>
                <span className="text-primary">{step.toTxId}</span>
              </p>
            )}
            <p className="font-sans text-muted-foreground">{step.timestamp}</p>
            {step.txHash && (
              <p className="text-primary truncate max-w-[300px]">Tx: {step.txHash}</p>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
);

export { SupplyChainTimeline };
export type { TimelineStep };

// Supply chain stops at Pharmacy — Consumer is NOT included
export const defaultSteps: TimelineStep[] = [
  {
    stage: "Manufacturer",
    icon: <Factory className="h-5 w-5" />,
    fromTxId: "0xA1b2...C3d4",
    toTxId: "0xE5f6...G7h8",
    location: "Mumbai, India",
    timestamp: "2025-01-15 09:30 UTC",
    txHash: "0xabc123...def456",
    status: "completed",
  },
  {
    stage: "Distributor",
    icon: <Truck className="h-5 w-5" />,
    fromTxId: "0xE5f6...G7h8",
    toTxId: "0xI9j0...K1l2",
    location: "Delhi, India",
    timestamp: "2025-01-18 14:22 UTC",
    txHash: "0x789abc...123def",
    status: "completed",
  },
  {
    stage: "Pharmacy",
    icon: <Store className="h-5 w-5" />,
    fromTxId: "0xI9j0...K1l2",
    toTxId: "0xM3n4...O5p6",
    location: "Bengaluru, India",
    timestamp: "2025-01-20 11:15 UTC",
    txHash: "0xdef789...abc123",
    status: "current",
  },
];
