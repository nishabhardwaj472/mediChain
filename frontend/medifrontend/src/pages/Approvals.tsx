import { useState } from "react";
import { useAuth, APPROVER_FOR, UserRole } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Users, ShieldCheck, Truck, Store, Factory } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const roleIconMap: Record<string, React.ElementType> = {
  manufacturer: Factory,
  distributor: Truck,
  pharmacy: Store,
};

const roleBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  manufacturer: "default",
  distributor: "secondary",
  pharmacy: "outline",
};

const Approvals = () => {
  const { user, pendingUsers, approveUser } = useAuth();
  const { toast } = useToast();
  const [approving, setApproving] = useState<string | null>(null);

  if (!user) return null;

  // Which role can this user approve?
  const canApproveRole: UserRole | null =
    user.role === "admin"
      ? "manufacturer"
      : user.role === "manufacturer"
      ? "distributor"
      : user.role === "distributor"
      ? "pharmacy"
      : null;

  const myPending = canApproveRole
    ? pendingUsers.filter(p => p.role === canApproveRole)
    : [];

  const handleApprove = (email: string, name: string) => {
    setApproving(email);
    setTimeout(() => {
      approveUser(email);
      setApproving(null);
      toast({
        title: "User Approved!",
        description: `${name} now has full dashboard access.`,
      });
    }, 800);
  };

  const approverLabel: Record<string, string> = {
    admin: "Manufacturers",
    manufacturer: "Distributors",
    distributor: "Pharmacies",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Manage Approvals</h1>
          <p className="text-sm text-muted-foreground">
            {canApproveRole
              ? `Approve pending ${approverLabel[user.role]} to grant them dashboard access`
              : "You do not have approval permissions for any role"}
          </p>
        </div>
      </div>

      {!canApproveRole && (
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <ShieldCheck className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No Approval Permissions</p>
              <p className="text-sm text-muted-foreground">
                Your role (<strong>{user.role}</strong>) does not have the ability to approve other users.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {canApproveRole && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {roleIconMap[canApproveRole] && (
                  <span className="p-2 bg-primary/10 rounded-lg">
                    {(() => { const Icon = roleIconMap[canApproveRole]; return <Icon className="h-5 w-5 text-primary" />; })()}
                  </span>
                )}
                <div>
                  <CardTitle>Pending {approverLabel[user.role]}</CardTitle>
                  <CardDescription>
                    {myPending.length === 0
                      ? "No pending approvals"
                      : `${myPending.length} user${myPending.length > 1 ? "s" : ""} awaiting your approval`}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <Clock className="h-3.5 w-3.5 mr-1 inline" />
                {myPending.length} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {myPending.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-3">
                <CheckCircle2 className="h-12 w-12 text-green-500/70" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm">No pending {approverLabel[user.role].toLowerCase()} to approve.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myPending.map(pending => (
                  <div
                    key={pending.email}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                        {pending.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{pending.name}</p>
                        <p className="text-sm text-muted-foreground">{pending.email}</p>
                        {pending.organization && (
                          <p className="text-xs text-muted-foreground">{pending.organization}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={roleBadgeVariant[pending.role]} className="capitalize hidden sm:flex">
                        {pending.role}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(pending.email, pending.name)}
                        disabled={approving === pending.email}
                        className="gap-2"
                      >
                        {approving === pending.email ? (
                          <>
                            <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approve
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary of who approves whom */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Approval Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {[
              { approver: "Admin", target: "Manufacturers" },
              { approver: "Manufacturer", target: "Distributors" },
              { approver: "Distributor", target: "Pharmacies" },
            ].map(row => (
              <div key={row.approver} className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span>
                  <strong className="text-foreground">{row.approver}</strong> approves{" "}
                  <strong className="text-foreground">{row.target}</strong>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Approvals;
