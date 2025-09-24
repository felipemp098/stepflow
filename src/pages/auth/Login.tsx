import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AuthCard } from "@/components/auth/AuthCard";
import { EmailField } from "@/components/auth/EmailField";
import { PasswordField } from "@/components/auth/PasswordField";
import { LoadingButton } from "@/components/auth/LoadingButton";
import { OAuthButton } from "@/components/auth/OAuthButton";
import { ErrorBanner } from "@/components/auth/ErrorBanner";
import { ThemeSwitch } from "@/components/auth/ThemeSwitch";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isFormValid = email.trim() !== "" && password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Mock error for demo
      if (email === "error@test.com") {
        setError("E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.");
      } else {
        console.log("Login attempt:", { email, password });
      }
    }, 1500);
  };

  const handleOAuthLogin = (provider: string) => {
    console.log(`OAuth login with ${provider}`);
  };

  return (
    <div className="relative">
      {/* Theme Switch - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeSwitch />
      </div>

      <AuthCard 
        title="Acesse sua conta"
        subtitle="Entre com suas credenciais para continuar"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Banner */}
          {error && (
            <ErrorBanner 
              message={error} 
              onClose={() => setError("")} 
            />
          )}

          {/* Form Fields */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="space-y-4"
          >
            <EmailField
              value={email}
              onChange={setEmail}
              disabled={loading}
            />

            <PasswordField
              value={password}
              onChange={setPassword}
              disabled={loading}
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
            className="pt-2"
          >
            <LoadingButton
              type="submit"
              loading={loading}
              loadingText="Entrando..."
              disabled={!isFormValid}
              className="w-full h-11"
            >
              Entrar
            </LoadingButton>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="space-y-3 pt-2"
          >
            <div className="text-center">
              <Link
                to="/auth/magic-link"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-sm"
              >
                Entrar com link mágico
              </Link>
            </div>

            <div className="flex justify-between text-sm">
              <Link
                to="/auth/signup"
                className="text-fg-3 hover:text-fg-1 transition-colors duration-sm"
              >
                Criar conta
              </Link>
              <button
                type="button"
                className="text-fg-3 hover:text-fg-1 transition-colors duration-sm"
                onClick={() => console.log("Forgot password")}
              >
                Esqueci minha senha
              </button>
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.25 }}
            className="pt-4"
          >
            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex justify-center items-center">
                <span className="bg-card px-3 text-xs text-fg-3 font-medium">
                  ou
                </span>
              </div>
            </div>
          </motion.div>

          {/* OAuth */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.3 }}
            className="pt-4"
          >
            <OAuthButton
              provider="google"
              onClick={() => handleOAuthLogin("google")}
              disabled={loading}
            />
          </motion.div>
        </form>
      </AuthCard>
    </div>
  );
}