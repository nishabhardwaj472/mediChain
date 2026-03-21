import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuth } from "@/hooks/useAuth";
import { RegisterRole, UserRole } from "@/types/auth";
import { useWallet } from "@/hooks/useWallet";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Shield,
  Wallet,
  UserPlus,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";

/* =====================================================
   SCHEMA
===================================================== */
const registerSchema = z
  .object({
    fullName: z.string().min(2, "Name required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Minimum 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["manufacturer", "distributor", "pharmacy", "consumer"]),
    organization: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof registerSchema>;

/* =====================================================
   ROLE CONFIG
===================================================== */
const ROLES_PENDING_APPROVAL: UserRole[] = [
  "manufacturer",
  "distributor",
  "pharmacy",
];

const roles: { value: UserRole; label: string; description: string }[] = [
  {
    value: "manufacturer",
    label: "Manufacturer",
    description: "Register & track medicine batches",
  },
  {
    value: "distributor",
    label: "Distributor",
    description: "Manage shipments & logistics",
  },
  {
    value: "pharmacy",
    label: "Pharmacy",
    description: "Receive & dispense medicines",
  },
  {
    value: "consumer",
    label: "Consumer",
    description: "Verify medicine authenticity",
  },
];

export default function Register() {
  const { register: registerUser, isAuthenticated, loading } = useAuth();
  const wallet = useWallet();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  //
  // 🔄 AUTO-REDIRECT IF AUTHENTICATED
  //
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "consumer" },
  });

  

  const role = watch("role");
  const needsApproval = ROLES_PENDING_APPROVAL.includes(role);

  const showOrgField =
    role === "manufacturer" ||
    role === "distributor" ||
    role === "pharmacy";

  /* =====================================================
     SUBMIT
  ===================================================== */
  const onSubmit = async (data: FormData) => {
    if (!wallet.isConnected || !wallet.address) {
      toast({
        title: "Wallet required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
        walletAddress: wallet.address,
      });

      if (needsApproval) {
        setRegistered(true);
      } else {
        toast({
          title: "Registration successful",
        });
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      toast({
        title: "Registration failed",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =====================================================
     PENDING SCREEN
  ===================================================== */
  if (registered && needsApproval) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-muted/30">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-8 w-8 text-amber-500 animate-pulse" />
              </div>
            </div>
            <CardTitle className="text-2xl">Pending Approval</CardTitle>
            <CardDescription>
              Your <strong>{role}</strong> account is waiting for blockchain approval.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button onClick={() => navigate("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-muted/30">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Link to="/" className="flex justify-center mb-2">
            <Shield className="h-8 w-8 text-primary" />
          </Link>
          <CardTitle>Create your MediChain account</CardTitle>
          <CardDescription>
            Join the blockchain pharma network
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* NAME */}
            <div>
              <Label>Full Name</Label>
              <Input {...register("fullName")} />
              {errors.fullName && (
                <p className="text-xs text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <Label>Email</Label>
              <Input {...register("email")} type="email" />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-2.5"
                >
                  {showPw ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <Label>Confirm Password</Label>
              <Input {...register("confirmPassword")} type="password" />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* ROLE */}
            <div>
              <Label>Role</Label>
              <Select onValueChange={(v) => setValue("role", v as RegisterRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ORGANIZATION */}
            {showOrgField && (
              <div>
                <Label>Organization</Label>
                <Input {...register("organization")} />
              </div>
            )}

            {/* WALLET */}
            {wallet.isConnected ? (
              <div className="flex items-center gap-2 border px-3 py-2 rounded text-sm">
                <Wallet className="h-4 w-4" />
                {wallet.address}
              </div>
            ) : (
              <Button
                type="button"
                onClick={wallet.connect}
                className="w-full"
              >
                Connect Wallet
              </Button>
            )}

            {/* SUBMIT */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !wallet.isConnected}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {isSubmitting ? "Creating..." : "Register"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center">
          <Link to="/login">Already have an account?</Link>
        </CardFooter>
      </Card>
    </div>
  );
}