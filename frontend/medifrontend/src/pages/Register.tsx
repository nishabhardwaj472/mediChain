import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Wallet, UserPlus, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const roles: { value: UserRole; label: string; description: string }[] = [
  { value: "manufacturer", label: "Manufacturer", description: "Register & track medicine batches" },
  { value: "distributor", label: "Distributor", description: "Manage shipments & logistics" },
  { value: "pharmacy", label: "Pharmacy", description: "Receive & dispense medicines" },
  { value: "consumer", label: "Consumer", description: "Verify medicine authenticity" },
];

const ROLES_PENDING_APPROVAL: UserRole[] = ["manufacturer", "distributor", "pharmacy"];

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("consumer");
  const [organization, setOrganization] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [registered, setRegistered] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const needsApproval = ROLES_PENDING_APPROVAL.includes(role);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", description: "Please make sure both passwords are the same.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    register(email, role, fullName, organization || undefined, walletConnected ? "0x7a3B...9f2E" : undefined);

    if (needsApproval) {
      // Stay on page — show pending message
      setRegistered(true);
    } else {
      // Consumer / admin go straight to dashboard
      toast({ title: "Registration successful!", description: "Welcome to MediChain." });
      navigate("/dashboard");
    }
  };

  const connectWallet = () => {
    setWalletConnected(true);
    toast({ title: "Wallet Connected", description: "MetaMask wallet linked successfully." });
  };

  const showOrgField = role === "manufacturer" || role === "distributor" || role === "pharmacy";

  // Post-registration pending screen for roles that need approval
  if (registered && needsApproval) {
    const approverLabel: Record<string, string> = {
      manufacturer: "an Admin",
      distributor: "an approved Manufacturer",
      pharmacy: "an approved Distributor",
    };
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-muted/30">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-8 w-8 text-amber-500 animate-pulse" />
              </div>
            </div>
            <CardTitle className="text-2xl">Account Created!</CardTitle>
            <CardDescription>
              Your <strong className="capitalize text-foreground">{role}</strong> account is pending approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground text-left">
              <p>
                Your account needs to be approved by{" "}
                <strong className="text-foreground">{approverLabel[role]}</strong> before you can access
                the dashboard.
              </p>
              <p className="mt-2">Please contact your approver and ask them to log in and visit <strong>Manage Approvals</strong>.</p>
            </div>
            <Button className="w-full" onClick={() => navigate("/dashboard")}>
              Check Approval Status
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
              Return to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-muted/30">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary" />
          </Link>
          <CardTitle className="text-2xl">Create your MediChain account</CardTitle>
          <CardDescription>Join the blockchain-powered pharma supply chain</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regEmail">Email</Label>
              <Input id="regEmail" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regPassword">Password</Label>
                <Input id="regPassword" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={v => setRole(v as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r.value} value={r.value}>
                      <span className="font-medium">{r.label}</span>
                      <span className="text-muted-foreground text-xs ml-2">– {r.description}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {needsApproval && (
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  This role requires approval before dashboard access is granted.
                </p>
              )}
            </div>
            {showOrgField && (
              <div className="space-y-2">
                <Label htmlFor="organization">Organization Name</Label>
                <Input id="organization" placeholder="Your company or pharmacy name" value={organization} onChange={e => setOrganization(e.target.value)} required />
              </div>
            )}
            <Button type="button" variant="outline" className="w-full gap-2" onClick={connectWallet}>
              <Wallet className="h-4 w-4" />
              {walletConnected ? "Wallet Connected ✓" : "Connect MetaMask Wallet"}
            </Button>
            <Button type="submit" className="w-full gap-2">
              <UserPlus className="h-4 w-4" />
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
