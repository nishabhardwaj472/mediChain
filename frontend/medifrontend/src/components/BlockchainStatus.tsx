import { CheckCircle2, Loader2, XCircle } from "lucide-react";

type Status = "idle" | "pending" | "confirmed" | "failed";

interface BlockchainStatusProps {
  status: Status;
  txHash?: string;
}

const BlockchainStatus = ({ status, txHash }: BlockchainStatusProps) => {
  if (status === "idle") return null;
  return (
    <div className={`flex items-center gap-3 rounded-lg p-4 ${
      status === "pending" ? "bg-warning/10 text-warning" :
      status === "confirmed" ? "bg-success/10 text-success" :
      "bg-destructive/10 text-destructive"
    }`}>
      {status === "pending" && <Loader2 className="h-5 w-5 animate-spin" />}
      {status === "confirmed" && <CheckCircle2 className="h-5 w-5" />}
      {status === "failed" && <XCircle className="h-5 w-5" />}
      <div>
        <p className="font-medium text-sm">
          {status === "pending" && "Confirming on blockchain..."}
          {status === "confirmed" && "Transaction confirmed!"}
          {status === "failed" && "Transaction failed"}
        </p>
        {txHash && <p className="text-xs font-mono mt-1 opacity-70 truncate max-w-[300px]">{txHash}</p>}
      </div>
    </div>
  );
};

export default BlockchainStatus;
