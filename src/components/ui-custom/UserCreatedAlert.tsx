import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, User, Mail, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserCreatedAlertProps {
  user: {
    id: string;
    email: string;
    temp_password: string;
  };
  onClose: () => void;
}

export function UserCreatedAlert({ user, onClose }: UserCreatedAlertProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertDescription className="space-y-3">
        <div className="font-medium text-green-800 dark:text-green-200">
          Cliente criado com sucesso!
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-medium text-foreground">ID do usuário:</span>
            <code className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
              {user.id}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(user.id)}
              className="h-6 px-2 text-xs"
            >
              Copiar
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-medium text-foreground">Email:</span>
            <code className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
              {user.email}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(user.email)}
              className="h-6 px-2 text-xs"
            >
              Copiar
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-medium text-foreground">Senha temporária:</span>
            <code className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
              {user.temp_password}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(user.temp_password)}
              className="h-6 px-2 text-xs"
            >
              Copiar
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 p-2 rounded">
          <strong>Importante:</strong> Um email de boas-vindas foi enviado para o usuário com essas credenciais. 
          O usuário poderá fazer login com este email e senha temporária. Recomendamos que ele altere a senha no primeiro acesso.
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="mt-2"
        >
          Fechar
        </Button>
      </AlertDescription>
    </Alert>
  );
}
