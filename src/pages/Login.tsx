import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, ArrowRight, GraduationCap } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, navigate to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/70" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
              <span className="font-display font-bold text-2xl">S</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl">SEED Assist</h1>
              <p className="text-sm text-primary-foreground/70">Client Portal</p>
            </div>
          </div>

          {/* Center Content */}
          <div className="space-y-8 max-w-lg">
            <div className="space-y-4 animate-fade-in-up">
              <h2 className="font-display text-4xl lg:text-5xl font-bold leading-tight">
                Your Gateway to<br />
                <span className="text-accent">Global Education</span><br />
                Excellence
              </h2>
              <p className="text-lg text-primary-foreground/80">
                Access comprehensive reports, track leads, manage scholarships, and derive holistic ROI insights — all in one powerful platform.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="space-y-1">
                <p className="text-3xl font-display font-bold">110+</p>
                <p className="text-sm text-primary-foreground/70">Partner Universities</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-display font-bold">35K+</p>
                <p className="text-sm text-primary-foreground/70">Students Helped</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-display font-bold">8+</p>
                <p className="text-sm text-primary-foreground/70">Study Destinations</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 text-sm text-primary-foreground/60">
            <GraduationCap className="h-4 w-4" />
            <span>Trusted by leading business schools worldwide</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
              <span className="font-display font-bold text-2xl text-primary-foreground">S</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl">SEED Assist</h1>
              <p className="text-sm text-muted-foreground">Client Portal</p>
            </div>
          </div>

          <Card variant="flat" className="border-0 shadow-none animate-fade-in-up">
            <CardHeader className="space-y-1 px-0">
              <CardTitle className="text-2xl font-display">Welcome back</CardTitle>
              <CardDescription>
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        inputSize="lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
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
                        className="pl-10 pr-10"
                        inputSize="lg"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
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

                <Button type="submit" variant="gradient" size="lg" className="w-full">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Need access?{" "}
                <Button variant="link" className="px-1 h-auto text-primary">
                  Contact your SEED representative
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '400ms' }}>
            By signing in, you agree to our{" "}
            <Button variant="link" className="px-0.5 h-auto text-xs">Terms of Service</Button>
            {" "}and{" "}
            <Button variant="link" className="px-0.5 h-auto text-xs">Privacy Policy</Button>
          </p>
        </div>
      </div>
    </div>
  );
}
