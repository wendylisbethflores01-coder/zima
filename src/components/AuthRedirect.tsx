import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Admin from "@/pages/Admin";
import AgentDashboard from "@/pages/AgentDashboard";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";

const AuthRedirect = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const location = useLocation();
  const [sessionError, setSessionError] = useState(false);

  // Monitor for session/auth errors
  useEffect(() => {
    // If we have been loading for too long and still have a user but no role,
    // it might indicate a session/API key issue
    if (user && !roleLoading && role === null && !authLoading) {
      console.warn(
        "🚨 Potential session corruption detected: user exists but no role found"
      );
      setSessionError(true);
    }
  }, [user, role, roleLoading, authLoading]);

  console.log(
    "🔍 AuthRedirect - user:",
    !!user,
    "authLoading:",
    authLoading,
    "roleLoading:",
    roleLoading,
    "role:",
    role,
    "path:",
    location.pathname,
    "sessionError:",
    sessionError
  );

  // If session error detected, force logout
  if (sessionError) {
    console.log("🚨 Session error detected - forcing logout");
    return <Auth />;
  }

  // Show loading while authentication or role is loading
  if (authLoading || (user && roleLoading)) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">
            {authLoading
              ? "Verificando autenticación..."
              : "Cargando perfil..."}
          </p>
        </div>
      </div>
    );
  }

  // If no user, show auth page
  if (!user) {
    console.log("🚀 No user - showing Auth page");
    return <Auth />;
  }

  // Check if user needs to change password
  const requiresPasswordChange = user.user_metadata?.requires_password_change;
  const isOnPasswordRecovery = location.pathname === "/auth/password-recovery";

  if (requiresPasswordChange && !isOnPasswordRecovery) {
    console.log(
      "🔑 User requires password change - redirecting to password recovery"
    );
    return <Navigate to="/auth/password-recovery" replace />;
  }

  // If user exists and role loading is complete
  console.log(
    "✅ User authenticated, role determined:",
    role,
    "for path:",
    location.pathname
  );

  // Check what dashboard the user should access based on their role
  const shouldAccessAdmin = location.pathname === "/admin";
  const shouldAccessAgent = location.pathname === "/agent-dashboard";

  if (shouldAccessAdmin) {
    if (role === "admin") {
      console.log("🚀 Admin user accessing /admin - rendering Admin dashboard");
      return <Admin />;
    } else {
      console.log(
        "❌ Non-admin user trying to access /admin - showing Auth page"
      );
      return <Auth />;
    }
  }

  if (shouldAccessAgent) {
    if (role === "agent") {
      console.log(
        "🚀 Agent user accessing /agent-dashboard - rendering Agent dashboard"
      );
      return <AgentDashboard />;
    } else {
      console.log(
        "❌ Non-agent user trying to access /agent-dashboard - showing Auth page"
      );
      return <Auth />;
    }
  }

  // If we reach here, something unexpected happened
  console.log("⚠️ Unexpected state - fallback to Index");
  return <Index />;
};

export default AuthRedirect;
