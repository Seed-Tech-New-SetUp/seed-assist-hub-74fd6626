import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Eye, EyeOff, Mail, Lock, ArrowRight, User, ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import seedAssistLogoBlue from "@/assets/seed-assist-logo-blue.png";
import seedAssistLogoWhite from "@/assets/seed-assist-logo-white.png";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Please enter your full name"),
});

type ForgotPasswordStep = 'email' | 'otp' | 'new-password';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user, selectedSchool, loginSchools } = useAuth();

  // Forgot password states
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>('email');
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // Navigate after successful login based on school count
  useEffect(() => {
    if (user && !loading) {
      if (selectedSchool) {
        // Single school user (auto-selected) or previously selected
        navigate("/dashboard", { replace: true });
      } else if (loginSchools.length > 1) {
        // Multi-school user needs to select
        navigate("/select-school", { replace: true });
      }
    }
  }, [user, selectedSchool, loginSchools, loading, navigate]);

  // Early return for loading state after user is set
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center animate-pulse">
            <span className="font-display font-bold text-lg text-primary-foreground">S</span>
          </div>
          <p className="text-sm text-muted-foreground">Signing in...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const validation = signupSchema.safeParse({ email, password, fullName });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in.");
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }
        toast.success("Account created successfully!");
        navigate("/select-school");
      } else {
        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          // Check for specific error codes
          const errorMessage = error.message.toLowerCase();
          
          if (errorMessage.includes('not found') || 
              errorMessage.includes('does not exist') ||
              errorMessage.includes('no user') ||
              errorMessage.includes('user_not_found')) {
            toast.error("This account does not exist. Please check your email or create an account.");
          } else if (errorMessage.includes('invalid') || 
                     errorMessage.includes('credentials') ||
                     errorMessage.includes('incorrect') ||
                     errorMessage.includes('wrong')) {
            toast.error("Invalid credentials. Please check your email and password.");
          } else {
            toast.error(error.message || "Login failed. Please try again.");
          }
          setLoading(false);
          return;
        }
        // Navigation will be handled by the useEffect or component re-render
        // For single school users, selectedSchool will be set, for multi-school users it won't
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordOpen = () => {
    setForgotEmail(email); // Pre-fill with login email if available
    setForgotPasswordStep('email');
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotPasswordOpen(true);
  };

  const handleSendOtp = async () => {
    if (!forgotEmail || !z.string().email().safeParse(forgotEmail).success) {
      toast.error("Please enter a valid email address");
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portal-auth?action=forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ email: forgotEmail }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.error_code === 'USER_NOT_FOUND' || 
            data.error?.toLowerCase().includes('not found') ||
            data.error?.toLowerCase().includes('does not exist')) {
          toast.error("This account does not exist. Please check your email.");
        } else {
          toast.error(data.error || "Failed to send verification code");
        }
        return;
      }

      toast.success("Verification code sent to your email!");
      setForgotPasswordStep('otp');
    } catch (error) {
      toast.error("Failed to send verification code. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portal-auth?action=verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ email: forgotEmail, otp }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Invalid verification code");
        return;
      }

      toast.success("Code verified! Please set your new password.");
      setForgotPasswordStep('new-password');
    } catch (error) {
      toast.error("Failed to verify code. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portal-auth?action=reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ 
            email: forgotEmail, 
            otp,
            password: newPassword,
            password_confirmation: confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to reset password");
        return;
      }

      toast.success("Password reset successfully! Please sign in with your new password.");
      setForgotPasswordOpen(false);
      setEmail(forgotEmail);
      setPassword("");
    } catch (error) {
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const renderForgotPasswordContent = () => {
    switch (forgotPasswordStep) {
      case 'email':
        return (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-display">Reset your password</DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a verification code.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email" className="text-sm">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@university.edu"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="pl-9"
                    inputSize="lg"
                    disabled={forgotLoading}
                  />
                </div>
              </div>
              <Button 
                type="button" 
                className="w-full" 
                size="lg" 
                onClick={handleSendOtp}
                disabled={forgotLoading}
              >
                {forgotLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Sending code...
                  </span>
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 'otp':
        return (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-display">Enter verification code</DialogTitle>
              <DialogDescription>
                We've sent a 6-digit code to <span className="font-medium text-foreground">{forgotEmail}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP 
                  maxLength={6} 
                  value={otp} 
                  onChange={setOtp}
                  disabled={forgotLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1" 
                  size="lg" 
                  onClick={() => setForgotPasswordStep('email')}
                  disabled={forgotLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  type="button" 
                  className="flex-1" 
                  size="lg" 
                  onClick={handleVerifyOtp}
                  disabled={forgotLoading || otp.length !== 6}
                >
                  {forgotLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <>
                      Verify Code
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Didn't receive the code?{" "}
                <Button 
                  variant="link" 
                  className="px-0 h-auto text-sm text-primary"
                  onClick={handleSendOtp}
                  disabled={forgotLoading}
                >
                  Resend
                </Button>
              </p>
            </div>
          </div>
        );

      case 'new-password':
        return (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-display">Set new password</DialogTitle>
              <DialogDescription>
                Create a strong password for your account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-sm">New Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 pr-9"
                    inputSize="lg"
                    disabled={forgotLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={forgotLoading}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 pr-9"
                    inputSize="lg"
                    disabled={forgotLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={forgotLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1" 
                  size="lg" 
                  onClick={() => setForgotPasswordStep('otp')}
                  disabled={forgotLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  type="button" 
                  className="flex-1" 
                  size="lg" 
                  onClick={handleResetPassword}
                  disabled={forgotLoading || !newPassword || !confirmPassword}
                >
                  {forgotLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Resetting...
                    </span>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        );
    }
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
          <div className="flex items-center">
            <img 
              src={seedAssistLogoWhite} 
              alt="SEED Assist" 
              className="h-14 w-auto object-contain"
            />
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
          <div className="lg:hidden flex items-center justify-center mb-8">
            <img 
              src={seedAssistLogoBlue} 
              alt="SEED Assist" 
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-display font-semibold">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSignUp
                ? "Enter your details to create your account"
                : "Enter your credentials to access your dashboard"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {isSignUp && (
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Smith"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-9"
                      inputSize="lg"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

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
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  {!isSignUp && (
                    <Button 
                      type="button"
                      variant="link" 
                      className="px-0 h-auto text-xs text-primary"
                      onClick={handleForgotPasswordOpen}
                    >
                      Forgot password?
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignUp ? "Create a password" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9"
                    inputSize="lg"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
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


            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </span>
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {isSignUp && (
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                className="px-0.5 h-auto text-sm text-primary"
                onClick={() => setIsSignUp(false)}
                disabled={loading}
              >
                Sign in
              </Button>
            </p>
          )}

          <p className="text-center text-xs text-muted-foreground">
            By {isSignUp ? "signing up" : "signing in"}, you agree to our{" "}
            <Button variant="link" className="px-0 h-auto text-xs">Terms</Button>
            {" "}and{" "}
            <Button variant="link" className="px-0 h-auto text-xs">Privacy Policy</Button>
          </p>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          {renderForgotPasswordContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
