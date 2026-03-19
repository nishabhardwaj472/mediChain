import { useState } from "react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  ShieldCheck,
  Truck,
  Store,
  Factory,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const roleIconMap: Record<string, React.ElementType> = {
  manufacturer: Factory,
  distributor: Truck,
  pharmacy: Store,
};

const roleBadgeVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  manufacturer: "default",
  distributor: "secondary",
  pharmacy: "outline",
};

const Approvals = () => {
  const { user, pendingUsers, approveUser, rejectUser } = useAuth();
  const { toast } = useToast();

  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!user) return null;

  //
  // 🔐 ROLE LOGIC
  //
  const canApproveRole: UserRole | null =
    user.role === "pharmacy"
      ? "manufacturer"
      : user.role === "manufacturer"
      ? "distributor"
      : user.role === "distributor"
      ? "pharmacy"
      : null;

  const myPending = canApproveRole
    ? pendingUsers.filter((p) => p.role === canApproveRole)
    : [];

  //
  // ✅ APPROVE
  //
  const handleApprove = async (id: string, name: string) => {
    try {
      setLoadingId(id);

      await approveUser(id); // 🔗 backend + blockchain

      toast({
        title: "User Approved",
        description: `${name} is now approved on blockchain`,
      });
    } catch (err: any) {
      toast({
        title: "Approval Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  //
  // ❌ REJECT
  //
  const handleReject = async (id: string, name: string) => {
    try {
      setLoadingId(id);

      await rejectUser(id);

      toast({
        title: "User Rejected",
        description: `${name} has been removed`,
        variant: "destructive",
      });
    } catch (err: any) {
      toast({
        title: "Rejection Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const approverLabel: Record<string, string> = {
    admin: "Manufacturers",
    manufacturer: "Distributors",
    distributor: "Pharmacies",
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Manage Approvals</h1>
          <p className="text-sm text-muted-foreground">
            {canApproveRole
              ? `Approve or reject ${approverLabel[user.role]}`
              : "No approval permissions"}
          </p>
        </div>
      </div>

      {/* NO PERMISSION */}
      {!canApproveRole && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Your role ({user.role}) cannot approve users.
            </p>
          </CardContent>
        </Card>
      )}

      {/* APPROVAL LIST */}
      {canApproveRole && (
        <Card>
          <CardHeader>
            <CardTitle>
              Pending {approverLabel[user.role]}
            </CardTitle>
            <CardDescription>
              {myPending.length === 0
                ? "No pending users"
                : `${myPending.length} pending approvals`}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {myPending.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
                <p>All caught up</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myPending.map((u) => (
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

                    <div className="flex gap-2">
                      <Badge variant={roleBadgeVariant[u.role]}>
                        {u.role}
                      </Badge>

                      {/* APPROVE */}
                      <Button
                        size="sm"
                        disabled={loadingId === u._id}
                        onClick={() =>
                          handleApprove(u._id!, u.fullName || "")
                        }
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {loadingId === u._id
                          ? "..."
                          : "Approve"}
                      </Button>

                      {/* REJECT */}
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