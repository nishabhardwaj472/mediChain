import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole, APPROVER_FOR } from "@/types/auth";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  CheckCircle2,
  ShieldCheck,
  Users,
  Loader2,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { ethers } from "ethers";
import ABI from "@/abi/MediChain.json";

/* =====================================================
   ROLE UI CONFIG
===================================================== */
const roleBadgeVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  manufacturer: "default",
  distributor: "secondary",
  pharmacy: "outline",
};

const approverLabel: Record<string, string> = {
  admin: "Manufacturers",
  manufacturer: "Distributors",
  distributor: "Pharmacies",
};

/* =====================================================
   COMPONENT
===================================================== */
const Approvals = () => {
  const { user, pendingUsers, approveUser, rejectUser } = useAuth();
  const { toast } = useToast();

  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!user) return null;

  /* =====================================================
     ROLE LOGIC
  ===================================================== */
  const canApproveRole =
    user.role in APPROVER_FOR
      ? (APPROVER_FOR[user.role] as UserRole)
      : null;

  const filteredUsers = pendingUsers.filter(
    (u) => u.role === canApproveRole
  );

  /* =====================================================
     APPROVE (CORRECT FLOW)
  ===================================================== */
  const handleApprove = async (u: any) => {
    try {
      setLoadingId(u._id);

      toast({
        title: "Connect Wallet",
        description: "Please confirm in MetaMask",
      });

      // 🔗 connect wallet
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS,
        ABI.abi,
        signer
      );

      let tx;

      // 🔥 role-based contract call
      if (u.role === "manufacturer") {
        tx = await contract.approveManufacturer(u.walletAddress);
      } else if (u.role === "distributor") {
        tx = await contract.approveDistributor(u.walletAddress);
      } else if (u.role === "pharmacy") {
        tx = await contract.approvePharmacy(u.walletAddress);
      } else {
        throw new Error("Invalid role");
      }

      toast({
        title: "Transaction Sent",
        description: "Waiting for blockchain confirmation...",
      });

      const receipt = await tx.wait();

      // ✅ send txHash to backend
      await approveUser(u._id, receipt.hash);

      toast({
        title: "Approved",
        description: `${u.fullName} approved successfully`,
      });

    } catch (err: any) {
      console.error(err);

      toast({
        title: "Approval Failed",
        description:
          err?.reason || err?.message || "Transaction failed",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  /* =====================================================
     REJECT
  ===================================================== */
  const handleReject = async (id: string, name: string) => {
    try {
      setLoadingId(id);

      await rejectUser(id);

      toast({
        title: "Rejected",
        description: `${name} has been rejected`,
        variant: "destructive",
      });
    } catch (err: any) {
      toast({
        title: "Rejection Failed",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  /* =====================================================
     UI
  ===================================================== */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Manage Approvals</h1>
          <p className="text-sm text-muted-foreground">
            {canApproveRole
              ? `Approve ${approverLabel[user.role]} on blockchain`
              : "No approval permissions"}
          </p>
        </div>
      </div>

      {/* LIST */}
      {canApproveRole && (
        <Card>
          <CardHeader>
            <CardTitle>
              Pending {approverLabel[user.role]}
            </CardTitle>
            <CardDescription>
              {filteredUsers.length === 0
                ? "No pending users"
                : `${filteredUsers.length} awaiting blockchain approval`}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
                <p>All users are approved</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{u.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {u.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={roleBadgeVariant[u.role]}>
                        {u.role}
                      </Badge>

                      <Button
                        size="sm"
                        disabled={loadingId === u._id}
                        onClick={() => handleApprove(u)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {loadingId === u._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Approve"
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={loadingId === u._id}
                        onClick={() =>
                          handleReject(u._id!, u.fullName || "")
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* HIERARCHY */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Approval Hierarchy
          </CardTitle>
        </CardHeader>

        <CardContent className="text-sm space-y-2">
          <p><b>Admin</b> → Manufacturer</p>
          <p><b>Manufacturer</b> → Distributor</p>
          <p><b>Distributor</b> → Pharmacy</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Approvals;