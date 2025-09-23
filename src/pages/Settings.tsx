import React from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Database, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const settingsCards = [
  {
    icon: User,
    title: 'Perfil',
    description: 'Gerencie suas informações pessoais',
    items: [
      { label: 'Nome completo', value: 'João Silva' },
      { label: 'E-mail', value: 'joao@stepflow.com' },
      { label: 'Cargo', value: 'Administrador' },
    ]
  },
  {
    icon: Bell,
    title: 'Notificações',
    description: 'Configure suas preferências de notificação',
    items: [
      { label: 'Notificações por e-mail', toggle: true, value: true },
      { label: 'Lembretes de pagamento', toggle: true, value: true },
      { label: 'Alertas do sistema', toggle: true, value: false },
    ]
  },
  {
    icon: Shield,
    title: 'Segurança',
    description: 'Configurações de segurança da conta',
    items: [
      { label: 'Autenticação de dois fatores', toggle: true, value: false },
      { label: 'Sessões ativas', value: '2 dispositivos' },
      { label: 'Última alteração de senha', value: '30 dias atrás' },
    ]
  },
  {
    icon: Database,
    title: 'Dados',
    description: 'Gerencie seus dados e backups',
    items: [
      { label: 'Último backup', value: '2 horas atrás' },
      { label: 'Tamanho dos dados', value: '125 MB' },
      { label: 'Backup automático', toggle: true, value: true },
    ]
  }
];

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-fg-1">Configurações</h1>
        <p className="text-fg-3 mt-1">Gerencie suas preferências e configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.2, 
              delay: index * 0.1,
              ease: [0.2, 0, 0, 1] 
            }}
          >
            <Card className="shadow-card-md h-full">
              <CardHeader className="border-b border-hairline">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface-1 rounded-lg">
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-fg-1">{card.title}</CardTitle>
                    <p className="text-sm text-fg-3 mt-1">{card.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {card.items.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-fg-1 font-medium">{item.label}</Label>
                          {!item.toggle && (
                            <p className="text-sm text-fg-3 mt-1">{item.value}</p>
                          )}
                        </div>
                        {item.toggle ? (
                          <Switch 
                            checked={item.value as boolean}
                            className="data-[state=checked]:bg-primary"
                          />
                        ) : item.label.includes('Nome') || item.label.includes('E-mail') ? (
                          <Button variant="outline" size="sm" className="border-hairline">
                            Editar
                          </Button>
                        ) : null}
                      </div>
                      {itemIndex < card.items.length - 1 && (
                        <Separator className="mt-4 bg-border-hairline" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.4, ease: [0.2, 0, 0, 1] }}
      >
        <Card className="shadow-card-md">
          <CardHeader className="border-b border-hairline">
            <CardTitle className="text-lg font-semibold text-fg-1">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-hairline">
                Exportar Dados
              </Button>
              <Button variant="outline" className="border-hairline">
                Fazer Backup
              </Button>
              <Button variant="outline" className="border-hairline">
                Alterar Senha
              </Button>
              <Button variant="outline" className="border-error text-error hover:bg-error/5">
                Excluir Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}