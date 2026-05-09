import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, LogOut } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Ingresa un email válido");
const passwordSchema = z
  .string()
  .min(6, "La contraseña debe tener al menos 6 caracteres");

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const { signIn, signUp, signOut, user } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  // Auto-redirect authenticated users to their dashboard after login success
  useEffect(() => {
    if (user && !roleLoading && role && !isLoading) {
      console.log(
        "🔍 Auth: User logged in successfully, checking for required actions..."
      );

      // Check if user needs to change password first
      const requiresPasswordChange =
        user.user_metadata?.requires_password_change;

      if (requiresPasswordChange) {
        console.log(
          "🔑 User requires password change - redirecting to password recovery"
        );
        navigate("/auth/password-recovery");
        return;
      }

      console.log("✅ Redirecting to dashboard for role:", role);
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "agent") {
        navigate("/agent-dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, role, roleLoading, navigate, isLoading]);

  // Show loading while checking authentication and role
  if ((user && roleLoading) || isLoading) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">
            {user && roleLoading ? "Cargando perfil..." : "Iniciando sesión..."}
          </p>
        </div>
      </div>
    );
  }

  // If user is already authenticated and role is loaded, show logout option
  if (user && !roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Ya tienes una sesión activa
            </CardTitle>
            <CardDescription>
              Estás autenticado como{" "}
              {role === "admin"
                ? "Administrador"
                : role === "agent"
                ? "Agente"
                : "Usuario"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              onClick={() => {
                // Check if user needs to change password first
                const requiresPasswordChange =
                  user.user_metadata?.requires_password_change;

                if (requiresPasswordChange) {
                  navigate("/auth/password-recovery");
                  return;
                }

                if (role === "admin") {
                  navigate("/admin");
                } else if (role === "agent") {
                  navigate("/agent-dashboard");
                } else {
                  navigate("/");
                }
              }}
              className="w-full"
            >
              {user.user_metadata?.requires_password_change
                ? "Cambiar Contraseña"
                : "Ir al Dashboard"}
            </Button>

            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                toast.success("Sesión cerrada exitosamente");
              }}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    try {
      emailSchema.parse(formData.email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.email = error.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(formData.password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.password = error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    const { error } = await signIn(formData.email, formData.password);

    setIsLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Credenciales inválidas. Verifica tu email y contraseña.");
      } else {
        toast.error(`Error al iniciar sesión: ${error.message}`);
      }
    } else {
      toast.success("¡Bienvenido!");
      // La navegación será manejada por el router basado en el estado del usuario
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    const { error } = await signUp(formData.email, formData.password);

    if (error) {
      if (error.message.includes("User already registered")) {
        toast.error("Este email ya está registrado. Intenta iniciar sesión.");
      } else {
        toast.error(`Error al registrarse: ${error.message}`);
      }
    } else {
      toast.success(
        "Cuenta creada exitosamente. Revisa tu email para confirmar tu cuenta."
      );
    }

    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail) {
      toast.error("Por favor ingresa tu email");
      return;
    }

    try {
      emailSchema.parse(resetEmail);
    } catch (error) {
      toast.error("Ingresa un email válido");
      return;
    }

    setIsLoading(true);

    const redirectUrl = `${window.location.origin}/auth/password-recovery`;

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: redirectUrl,
    });

    setIsLoading(false);

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success("Revisa tu email para restablecer tu contraseña");
      setShowResetPassword(false);
      setResetEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Panel de Administración
          </CardTitle>
          <CardDescription>
            Accede a tu cuenta para gestionar las propiedades
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!showResetPassword ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="admin@zimarealstate.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={
                      errors.password ? "border-destructive pr-10" : "pr-10"
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowResetPassword(true)}
                  className="text-sm text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  "Iniciando sesión..."
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="admin@zimarealstate.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Ingresa tu email y te enviaremos un enlace para restablecer tu
                  contraseña
                </p>
              </div>

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetEmail("");
                  }}
                >
                  Volver al inicio de sesión
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
