import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-10 text-sidebar-accent-foreground w-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-display font-bold text-lg text-primary-foreground">S</span>
            </div>
            <div>
              <h1 className="font-display font-semibold text-lg">SEED Assist</h1>
              <p className="text-xs text-sidebar-foreground">Client Portal</p>
            </div>
          </div>

          {/* Center Content */}
          <div className="space-y-6 max-w-md">
            <div className="space-y-3">
              <h2 className="font-display text-3xl lg:text-4xl font-semibold leading-tight tracking-tight">
                Your Gateway to<br />
                <span className="text-primary">Global Education</span><br />
                Excellence
              </h2>
              <p className="text-sm text-sidebar-foreground leading-relaxed">
                Access comprehensive reports, track leads, manage scholarships, and derive holistic ROI insights — all in one powerful platform.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="space-y-0.5">
                <p className="text-2xl font-display font-semibold">110+</p>
                <p className="text-xs text-sidebar-foreground">Partner Universities</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-2xl font-display font-semibold">35K+</p>
                <p className="text-xs text-sidebar-foreground">Students Helped</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-2xl font-display font-semibold">8+</p>
                <p className="text-xs text-sidebar-foreground">Study Destinations</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-sidebar-foreground">
            Trusted by leading business schools worldwide
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-display font-bold text-lg text-primary-foreground">S</span>
            </div>
            <div>
              <h1 className="font-display font-semibold text-lg">SEED Assist</h1>
              <p className="text-xs text-muted-foreground">Client Portal</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-display font-semibold">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    inputSize="lg"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <Button variant="link" className="px-0 h-auto text-xs text-primary">
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9"
                    inputSize="lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Keep me signed in for 30 days
              </Label>
            </div>

            <Button type="submit" size="lg" className="w-full">
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Need access?{" "}
            <Button variant="link" className="px-0.5 h-auto text-sm text-primary">
              Contact your SEED representative
            </Button>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Button variant="link" className="px-0 h-auto text-xs">Terms</Button>
            {" "}and{" "}
            <Button variant="link" className="px-0 h-auto text-xs">Privacy Policy</Button>
          </p>
        </div>
      </div>
    </div>
  );
}
