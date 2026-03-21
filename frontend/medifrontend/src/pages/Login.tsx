import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Shield, Wallet, Eye, EyeOff, LogIn } from "lucide-react";

//
// ✅ VALIDATION SCHEMA
//
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const wallet = useWallet();
  const navigate = useNavigate();

  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });

  

  //
  // 🔐 SUBMIT HANDLER
  //
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      const walletAddress = wallet.isConnected
        ? wallet.address
        : undefined;

      await login(data.email, data.password, walletAddress || "");

      toast({
        title: "Login successful",
        description: "Welcome to MediChain",
      });

      navigate("/dashboard");
    } catch (err: unknown) {
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary" />
          </Link>
          <CardTitle className="text-2xl">Sign in to MediChain</CardTitle>
          <CardDescription>Access your supply chain dashboard</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* EMAIL */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label>Password</Label>

              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                />

                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-2.5 text-muted-foreground"
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* WALLET */}
            <div className="space-y-2">
              <Label>MetaMask Wallet</Label>

              {wallet.isConnected ? (
                <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="truncate font-mono text-xs">
                    {wallet.address}
                  </span>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={wallet.connect}
                  disabled={wallet.isConnecting}
                  className="w-full gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  {wallet.isConnecting
                    ? "Connecting..."
                    : "Connect MetaMask Wallet"}
                </Button>
              )}
            </div>

            {/* SUBMIT */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              <LogIn className="mr-2 h-4 w-4" />
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>

        {/* FOOTER */}
        <div className="px-6 pb-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;