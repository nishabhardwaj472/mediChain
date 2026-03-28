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

// ✅ Normalize stage names
const isDeliveryStage = (stage: string) => {
  const s = stage.toLowerCase();
  return s === "confirmreceipt" || s === "delivery";
};

const getIcon = (stage: string, isDelivered: boolean) => {
  if (isDelivered) {
    return <Store className="h-5 w-5" />; // Pharmacy icon for delivered
  }

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

const formatTime = (timestamp?: number) => {
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toLocaleString();
};

const SupplyChainTimeline = ({ steps }: SupplyChainTimelineProps) => {

  // ✅ Find first delivery step
  const deliveryIndex = steps.findIndex((s) =>
    isDeliveryStage(s.stage)
  );

  // ✅ Remove duplicate confirmReceipt calls
  let filteredSteps = steps;
  if (deliveryIndex !== -1) {
    filteredSteps = [
      ...steps.slice(0, deliveryIndex),
      {
        ...steps[deliveryIndex],
        stage: "Delivered", // normalize label
      },
    ];
  }

  return (
    <div className="space-y-0">
      {filteredSteps.map((step, i) => {
        const isDelivered = isDeliveryStage(step.stage) || step.stage === "Delivered";
        const isLast = i === filteredSteps.length - 1;

        return (
          <div key={i} className="flex gap-4">
            
            {/* Icon Column */}
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full p-2 ${
                  isDelivered
                    ? "bg-green-100 text-green-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {isDelivered ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  getIcon(step.stage, false)
                )}
              </div>

              {!isLast && (
                <div
                  className={`w-0.5 h-20 ${
                    isDelivered
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
                  {isDelivered ? "Delivered to Pharmacy" : step.stage}
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
                      From:
                    </span>{" "}
                    <span className="text-primary truncate">
                      {step.fromTxId}
                    </span>
                  </p>
                )}

                {step.toTxId && (
                  <p>
                    <span className="font-sans font-medium text-foreground/60">
                      To:
                    </span>{" "}
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