import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AuthCard } from "@/components/auth/AuthCard";
import { EmailField } from "@/components/auth/EmailField";
import { PasswordField } from "@/components/auth/PasswordField";
import { LoadingButton } from "@/components/auth/LoadingButton";
import { ErrorBanner } from "@/components/auth/ErrorBanner";
import { ThemeSwitch } from "@/components/auth/ThemeSwitch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isFormValid = 
    name.trim() !== "" && 
    email.trim() !== "" && 
    password.length >= 6 && 
    acceptTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Mock error for demo
      if (email === "error@test.com") {
        setError("Este e-mail já está em uso. Tente fazer login ou use outro e-mail.");
      } else {
        console.log("Sign up attempt:", { name, email, password, acceptTerms });
      }
    }, 1500);
  };

  return (
    <div className="relative">
      {/* Theme Switch - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeSwitch />
      </div>

      <AuthCard 
        title="Criar conta"
        subtitle="Vamos começar"
        className="max-w-lg"
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
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-fg-2">
                Nome completo
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                disabled={loading}
                autoComplete="name"
                autoFocus
              />
            </div>

            <EmailField
              value={email}
              onChange={setEmail}
              disabled={loading}
            />

            <PasswordField
              value={password}
              onChange={setPassword}
              disabled={loading}
              showStrengthIndicator
            />
          </motion.div>

          {/* Terms Checkbox */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
            className="pt-2"
          >
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                disabled={loading}
                className="mt-0.5"
              />
              <div className="space-y-1 leading-none">
                <label
                  htmlFor="terms"
                  className={cn(
                    "text-xs text-fg-2 leading-relaxed cursor-pointer",
                    "hover:text-fg-1 transition-colors duration-sm"
                  )}
                >
                  Li e aceito os{" "}
                  <button
                    type="button"
                    className="text-primary hover:text-primary/80 underline font-medium"
                    onClick={() => console.log("Open terms")}
                  >
                    Termos de Uso
                  </button>{" "}
                  e a{" "}
                  <button
                    type="button"
                    className="text-primary hover:text-primary/80 underline font-medium"
                    onClick={() => console.log("Open privacy")}
                  >
                    Política de Privacidade
                  </button>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="pt-2"
          >
            <LoadingButton
              type="submit"
              loading={loading}
              loadingText="Criando conta..."
              disabled={!isFormValid}
              className="w-full h-11"
            >
              Criar conta
            </LoadingButton>
          </motion.div>

          {/* Link to Login */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.25 }}
            className="text-center pt-2"
          >
            <span className="text-sm text-fg-3">
              Já tem uma conta?{" "}
              <Link
                to="/auth/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors duration-sm"
              >
                Fazer login
              </Link>
            </span>
          </motion.div>
        </form>
      </AuthCard>
    </div>
  );
}