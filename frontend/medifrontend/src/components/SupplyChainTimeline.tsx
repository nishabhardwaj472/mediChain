import { CheckCircle2, Circle, Truck, Factory, Store } from "lucide-react";

export interface TimelineStep {
  stage: string;
  fromTxId?: string;
  toTxId?: string;
  location?: string;
  timestamp?: number;
  txHash?: string;
}

interface SupplyChainTimelineProps {
  steps: TimelineStep[];
}

const getIcon = (stage: string) => {
  switch (stage.toLowerCase()) {
    case "manufacturer":
      return <Factory className="h-5 w-5" />;
    case "distributor":
      return <Truck className="h-5 w-5" />;
    case "pharmacy":
      return <Store className="h-5 w-5" />;
    default:
      return <Circle className="h-5 w-5" />;
  }
};

const getStatus = (index: number, total: number) => {
  if (index < total - 1) return "completed";
  return "current";
};

const formatTime = (timestamp?: number) => {
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toLocaleString();
};

const SupplyChainTimeline = ({ steps }: SupplyChainTimelineProps) => {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const status = getStatus(i, steps.length);

        return (
          <div key={i} className="flex gap-4">
            {/* Icon Column */}
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full p-2 ${
                  status === "completed"
                    ? "bg-green-100 text-green-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  getIcon(step.stage)
                )}
              </div>

              {i < steps.length - 1 && (
                <div
                  className={`w-0.5 h-20 ${
                    status === "completed"
                      ? "bg-green-400"
                      : "bg-gray-300"
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="pb-8 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">
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
                    <span className="font-sans font-medium text-foreground/60">
                      From:{" "}
                    </span>
                    <span className="text-primary truncate">
                      {step.fromTxId}
                    </span>
                  </p>
                )}

                {step.toTxId && (
                  <p>
                    <span className="font-sans font-medium text-foreground/60">
                      To:{" "}
                    </span>
                    <span className="text-primary truncate">
                      {step.toTxId}
                    </span>
                  </p>
                )}

                {step.timestamp && (
                  <p className="font-sans">
                    {formatTime(step.timestamp)}
                  </p>
                )}

                {step.txHash && (
                  <p className="truncate text-primary">
                    Tx: {step.txHash}
                  </p>
                )}

              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { SupplyChainTimeline };