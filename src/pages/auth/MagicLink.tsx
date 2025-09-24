import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AuthCard } from "@/components/auth/AuthCard";
import { EmailField } from "@/components/auth/EmailField";
import { LoadingButton } from "@/components/auth/LoadingButton";
import { SuccessState } from "@/components/auth/SuccessState";
import { ErrorBanner } from "@/components/auth/ErrorBanner";
import { ThemeSwitch } from "@/components/auth/ThemeSwitch";
import { motion } from "framer-motion";

export default function MagicLink() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isFormValid = email.trim() !== "" && email.includes("@");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Mock error for demo
      if (email === "error@test.com") {
        setError("Não foi possível enviar o link. Verifique seu e-mail e tente novamente.");
      } else {
        setSuccess(true);
      }
    }, 1500);
  };

  const handleOpenEmail = () => {
    // Try to open default email client
    const mailtoUrl = `mailto:${email}`;
    window.location.href = mailtoUrl;
  };

  const handleBackToLogin = () => {
    setSuccess(false);
    setEmail("");
    setError("");
  };

  return (
    <div className="relative">
      {/* Theme Switch - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeSwitch />
      </div>

      <AuthCard 
        title={success ? "" : "Entrar com link mágico"}
        subtitle={success ? "" : "Enviaremos um link seguro para seu e-mail"}
        showLogo={!success}
      >
        {success ? (
          <SuccessState
            title="Link enviado!"
            message="Enviamos um link mágico para"
            email={email}
            actionLabel="Abrir e-mail"
            onAction={handleOpenEmail}
            showEmailIcon
          />
        ) : (
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
            >
              <EmailField
                value={email}
                onChange={setEmail}
                disabled={loading}
                placeholder="Seu e-mail"
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
                loadingText="Enviando..."
                disabled={!isFormValid}
                className="w-full h-11"
              >
                Enviar link mágico
              </LoadingButton>
            </motion.div>

            {/* Back to Login */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }}
              className="text-center pt-2"
            >
              <Link
                to="/auth/login"
                className="text-sm text-fg-3 hover:text-fg-1 transition-colors duration-sm"
              >
                ← Voltar ao login
              </Link>
            </motion.div>
          </form>
        )}

        {/* Success State - Back to Login */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.3 }}
            className="text-center pt-4 border-t border-border-hairline"
          >
            <button
              onClick={handleBackToLogin}
              className="text-sm text-fg-3 hover:text-fg-1 transition-colors duration-sm"
            >
              ← Voltar ao login
            </button>
          </motion.div>
        )}
      </AuthCard>
    </div>
  );
}