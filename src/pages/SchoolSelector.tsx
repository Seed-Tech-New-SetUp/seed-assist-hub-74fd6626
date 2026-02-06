import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSchool } from "@/contexts/SchoolContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ChevronRight, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { decodeUTF8 } from "@/lib/utils/decode-utf8";
import seedAssistLogoBlue from "@/assets/seed-assist-logo-blue.png";
import seedAssistLogoWhite from "@/assets/seed-assist-logo-white.png";

export default function SchoolSelector() {
  const { schools, setCurrentSchool, loading } = useSchool();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [selectingSchoolId, setSelectingSchoolId] = useState<string | null>(null);

  const handleSchoolSelect = async (school: typeof schools[0]) => {
    try {
      setSelectingSchoolId(school.id);
      await setCurrentSchool(school);
      navigate("/dashboard");
    } catch (error) {
      console.error('Failed to select school:', error);
      toast.error('Failed to select school. Please try again.');
    } finally {
      setSelectingSchoolId(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading schools...</div>
      </div>
    );
  }

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
                Multiple Schools,<br />
                <span className="text-primary">One Platform</span>
              </h2>
              <p className="text-sm text-sidebar-foreground leading-relaxed">
                You have access to multiple institutions. Select which school you'd like to manage today.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-sidebar-foreground">
            Switch between schools anytime from the dashboard
          </p>
        </div>
      </div>

      {/* Right Panel - School Selection */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <img 
              src={seedAssistLogoBlue} 
              alt="SEED Assist" 
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-display font-semibold">Select a School</h2>
            <p className="text-sm text-muted-foreground">
              Welcome back! Choose which institution you'd like to access.
            </p>
          </div>

          <div className="space-y-3">
            {schools.map((school) => (
              <Card
                key={school.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-medium hover:border-primary/30 group ${
                  selectingSchoolId === school.id ? 'opacity-75 pointer-events-none' : ''
                }`}
                onClick={() => handleSchoolSelect(school)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {school.logo_url ? (
                        <img
                          src={school.logo_url}
                          alt={school.name}
                          className="h-10 w-10 object-contain"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{decodeUTF8(school.name)}</h3>
                      {school.designation && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {decodeUTF8(school.designation)}
                        </p>
                      )}
                      <span className="text-xs text-primary mt-1 inline-block capitalize">
                        {school.role}
                      </span>
                    </div>
                    {selectingSchoolId === school.id ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {schools.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No schools assigned to your account yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Contact your SEED representative for access.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="pt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Logged in as {user?.email}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
