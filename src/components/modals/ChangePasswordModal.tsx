import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-skeleton';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('A nova senha deve ser diferente da senha atual');
      return;
    }

    setIsLoading(true);

    try {
      // Primeiro, validar a senha atual fazendo um sign-in temporário
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('Usuário não encontrado');
      }

      // Tentar fazer sign-in com a senha atual para validar
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (signInError) {
        if (signInError.message?.includes('Invalid login credentials')) {
          throw new Error('Senha atual incorreta');
        }
        throw signInError;
      }

      // Se chegou até aqui, a senha atual está correta
      // Agora atualizar para a nova senha
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast.success('Senha alterada com sucesso!');
      
      // Fechar modal após um pequeno delay para o toast aparecer
      setTimeout(() => {
        handleClose();
      }, 1000);
      
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      // Tratar erros específicos
      if (error.message === 'Senha atual incorreta') {
        toast.error('Senha atual incorreta');
      } else if (error.message?.includes('Password should be at least')) {
        toast.error('A senha deve ter pelo menos 6 caracteres');
      } else if (error.message?.includes('Invalid login credentials')) {
        toast.error('Senha atual incorreta');
      } else if (error.message?.includes('same as the old password')) {
        toast.error('A nova senha deve ser diferente da senha atual');
      } else if (error.message?.includes('Password should be different')) {
        toast.error('A nova senha deve ser diferente da senha atual');
      } else {
        toast.error(error.message || 'Erro ao alterar senha');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="relative w-full max-w-md mx-4 bg-background border border-hairline rounded-lg shadow-card-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-hairline">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-1 rounded-lg">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-fg-1">Alterar Senha</h2>
                  <p className="text-sm text-fg-3">Digite sua senha atual e a nova senha</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 hover:bg-surface-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Senha Atual */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-fg-1 font-medium">
                  Senha Atual
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    className="pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    disabled={isLoading}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-fg-3" />
                    ) : (
                      <Eye className="h-4 w-4 text-fg-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Nova Senha */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-fg-1 font-medium">
                  Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    className="pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isLoading}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-fg-3" />
                    ) : (
                      <Eye className="h-4 w-4 text-fg-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-fg-1 font-medium">
                  Confirmar Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    className="pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-fg-3" />
                    ) : (
                      <Eye className="h-4 w-4 text-fg-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="flex-1"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Alterar Senha'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
