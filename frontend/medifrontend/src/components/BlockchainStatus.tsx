import { CheckCircle2, Loader2, XCircle } from "lucide-react";

type Status = "idle" | "pending" | "confirmed" | "failed" | "error";

interface BlockchainStatusProps {
  status: Status;
  txHash?: string;
}

const BlockchainStatus = ({ status, txHash }: BlockchainStatusProps) => {
  if (status === "idle") return null;

  const getStyles = () => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "failed":
      case "error":
        return "bg-red-100 text-red-700";
      default:
        return "";
    }
  };

  const getMessage = () => {
    switch (status) {
      case "pending":
        return "Waiting for wallet confirmation or mining...";
      case "confirmed":
        return "Transaction confirmed on blockchain";
      case "failed":
      case "error":
        return "Transaction failed";
      default:
        return "";
    }
  };

  const renderIcon = () => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case "confirmed":
        return <CheckCircle2 className="h-5 w-5" />;
      case "failed":
      case "error":
        return <XCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const explorerUrl = txHash
    ? `https://sepolia.etherscan.io/tx/${txHash}`
    : null;

  return (
    <div className={`flex items-center gap-3 rounded-lg p-4 ${getStyles()}`}>
      {renderIcon()}

      <div className="flex flex-col">
        <p className="font-medium text-sm">{getMessage()}</p>

        {txHash && explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono mt-1 underline opacity-80 hover:opacity-100 truncate max-w-[320px]"
          >
            {txHash}
          </a>
        )}
      </div>
    </div>
  );
};

export default BlockchainStatus;