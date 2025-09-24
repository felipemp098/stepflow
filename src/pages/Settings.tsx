import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Database, Palette, Edit, Save, X, Monitor, Smartphone, Globe, Clock, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingPage, LoadingSkeleton, LoadingSpinner } from '@/components/ui/loading-skeleton';
import { ChangePasswordModal } from '@/components/modals/ChangePasswordModal';
import { useAccount } from '@/hooks/useAccount';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Settings() {
  const { user, currentRole } = useAuth();
  const { 
    profile, 
    profileLoading, 
    profileError, 
    updateProfile,
    settings, 
    settingsLoading, 
    settingsError, 
    updateSettings,
    sessions, 
    sessionsLoading, 
    sessionsError, 
    deleteSession 
  } = useAccount();

  const [editingProfile, setEditingProfile] = useState(false);
  const [editingSettings, setEditingSettings] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: ''
  });
  const [updatingSettings, setUpdatingSettings] = useState<string | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Initialize form when profile loads
  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  const handleProfileSave = async () => {
    const result = await updateProfile(profileForm);
    if (result.success) {
      setEditingProfile(false);
      toast.success('Perfil atualizado com sucesso!');
    } else {
      toast.error(result.error || 'Erro ao atualizar perfil');
    }
  };

  const handleSettingsUpdate = async (field: string, value: any) => {
    setUpdatingSettings(field);
    try {
      const result = await updateSettings({ [field]: value });
      if (result.success) {
        toast.success('Configuração atualizada!');
      } else {
        toast.error(result.error || 'Erro ao atualizar configuração');
      }
    } finally {
      setUpdatingSettings(null);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    const result = await deleteSession(sessionId);
    if (result.success) {
      toast.success('Sessão encerrada com sucesso!');
    } else {
      toast.error(result.error || 'Erro ao encerrar sessão');
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent?.toLowerCase().includes('mobile')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  if (profileLoading || settingsLoading) {
    return (
      <LoadingPage 
        title="Configurações"
        description="Carregando suas configurações..."
        showCards={true}
        cardCount={4}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-fg-1">Configurações</h1>
        <p className="text-fg-3 mt-1">Gerencie suas preferências e configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1, ease: [0.2, 0, 0, 1] }}
        >
          <Card className="shadow-card-md h-full">
            <CardHeader className="border-b border-hairline">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface-1 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-fg-1">Perfil</CardTitle>
                    <p className="text-sm text-fg-3 mt-1">Gerencie suas informações pessoais</p>
                  </div>
                </div>
                       {!editingProfile && (
                         <div className="flex gap-2">
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => setEditingProfile(true)}
                             className="border-hairline"
                           >
                             <Edit className="h-4 w-4 mr-2" />
                             Editar
                           </Button>
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => setShowChangePasswordModal(true)}
                             className="border-hairline"
                           >
                             <Lock className="h-4 w-4 mr-2" />
                             Alterar Senha
                           </Button>
                         </div>
                       )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <Label className="text-fg-1 font-medium">Nome completo</Label>
                  {editingProfile ? (
                    <Input
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                      placeholder="Seu nome completo"
                    />
                  ) : (
                    <p className="text-sm text-fg-3 mt-1">{profile?.name || 'Não informado'}</p>
                  )}
                </div>
                <Separator className="bg-border-hairline" />
                
                {/* Email */}
                <div>
                  <Label className="text-fg-1 font-medium">E-mail</Label>
                  <p className="text-sm text-fg-3 mt-1">{profile?.email || 'Não informado'}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {profile?.email_verified ? 'Verificado' : 'Não verificado'}
                  </Badge>
                </div>
                <Separator className="bg-border-hairline" />
                
                {/* Phone */}
                <div>
                  <Label className="text-fg-1 font-medium">Telefone</Label>
                  {editingProfile ? (
                    <Input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1"
                      placeholder="Seu telefone"
                    />
                  ) : (
                    <p className="text-sm text-fg-3 mt-1">{profile?.phone || 'Não informado'}</p>
                  )}
                </div>
                <Separator className="bg-border-hairline" />
                
                {/* Role */}
                <div>
                  <Label className="text-fg-1 font-medium">Cargo</Label>
                  <p className="text-sm text-fg-3 mt-1 capitalize">{currentRole || 'Usuário'}</p>
                </div>

                {/* Edit Actions */}
                       {editingProfile && (
                         <div className="flex gap-2 pt-4">
                           <Button
                             size="sm"
                             onClick={handleProfileSave}
                             disabled={!profileForm.name.trim() || updateProfile.isLoading}
                           >
                             {updateProfile.isLoading ? (
                               <LoadingSpinner size="sm" />
                             ) : (
                               <>
                                 <Save className="h-4 w-4 mr-2" />
                                 Salvar
                               </>
                             )}
                           </Button>
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => {
                               setEditingProfile(false);
                               setProfileForm({
                                 name: profile?.name || '',
                                 phone: profile?.phone || ''
                               });
                             }}
                             disabled={updateProfile.isLoading}
                           >
                             <X className="h-4 w-4 mr-2" />
                             Cancelar
                           </Button>
                         </div>
                       )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2, ease: [0.2, 0, 0, 1] }}
        >
          <Card className="shadow-card-md h-full">
            <CardHeader className="border-b border-hairline">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-1 rounded-lg">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-fg-1">Notificações</CardTitle>
                  <p className="text-sm text-fg-3 mt-1">Configure suas preferências de notificação</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                       {/* Email Alerts Financeiro */}
                       <div className="flex items-center justify-between">
                         <div>
                           <Label className="text-fg-1 font-medium">Alertas Financeiros</Label>
                           <p className="text-sm text-fg-3 mt-1">Notificações sobre questões financeiras</p>
                         </div>
                         <div className="flex items-center gap-2">
                           {updatingSettings === 'email_alerts_financeiro' && (
                             <LoadingSpinner size="sm" />
                           )}
                           <Switch
                             checked={settings?.email_alerts_financeiro || false}
                             onCheckedChange={(checked) => handleSettingsUpdate('email_alerts_financeiro', checked)}
                             disabled={updatingSettings === 'email_alerts_financeiro'}
                             className="data-[state=checked]:bg-primary"
                           />
                         </div>
                       </div>
                <Separator className="bg-border-hairline" />
                
                {/* Email Alerts Operacional */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-fg-1 font-medium">Alertas Operacionais</Label>
                    <p className="text-sm text-fg-3 mt-1">Notificações sobre operações do sistema</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {updatingSettings === 'email_alerts_operacional' && (
                      <LoadingSpinner size="sm" />
                    )}
                    <Switch
                      checked={settings?.email_alerts_operacional || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('email_alerts_operacional', checked)}
                      disabled={updatingSettings === 'email_alerts_operacional'}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
                <Separator className="bg-border-hairline" />
                
                {/* Email Resumo Semanal */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-fg-1 font-medium">Resumo Semanal</Label>
                    <p className="text-sm text-fg-3 mt-1">Receber resumo semanal por e-mail</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {updatingSettings === 'email_resumo_semanal' && (
                      <LoadingSpinner size="sm" />
                    )}
                    <Switch
                      checked={settings?.email_resumo_semanal || false}
                      onCheckedChange={(checked) => handleSettingsUpdate('email_resumo_semanal', checked)}
                      disabled={updatingSettings === 'email_resumo_semanal'}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.3, ease: [0.2, 0, 0, 1] }}
        >
          <Card className="shadow-card-md h-full">
            <CardHeader className="border-b border-hairline">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-1 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-fg-1">Segurança</CardTitle>
                  <p className="text-sm text-fg-3 mt-1">Configurações de segurança da conta</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Active Sessions */}
                <div>
                  <Label className="text-fg-1 font-medium">Sessões Ativas</Label>
                  <p className="text-sm text-fg-3 mt-1">{sessions?.length || 0} dispositivos</p>
                </div>
                <Separator className="bg-border-hairline" />
                
                {/* Account Created */}
                <div>
                  <Label className="text-fg-1 font-medium">Conta Criada</Label>
                  <p className="text-sm text-fg-3 mt-1">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : 'Não informado'}
                  </p>
                </div>
                <Separator className="bg-border-hairline" />
                
                {/* Email Verification */}
                <div>
                  <Label className="text-fg-1 font-medium">E-mail Verificado</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={profile?.email_verified ? "default" : "destructive"} className="text-xs">
                      {profile?.email_verified ? 'Verificado' : 'Não verificado'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preferences Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.4, ease: [0.2, 0, 0, 1] }}
        >
          <Card className="shadow-card-md h-full">
            <CardHeader className="border-b border-hairline">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-1 rounded-lg">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-fg-1">Preferências</CardTitle>
                  <p className="text-sm text-fg-3 mt-1">Configurações de interface e localização</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Theme */}
                <div>
                  <Label className="text-fg-1 font-medium">Tema</Label>
                  <Select 
                    value={settings?.theme || 'system'} 
                    onValueChange={(value) => handleSettingsUpdate('theme', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator className="bg-border-hairline" />
                
                {/* Density */}
                <div>
                  <Label className="text-fg-1 font-medium">Densidade da Interface</Label>
                  <Select 
                    value={settings?.density || 'comfortable'} 
                    onValueChange={(value) => handleSettingsUpdate('density', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comfortable">Confortável</SelectItem>
                      <SelectItem value="compact">Compacta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator className="bg-border-hairline" />
                
                {/* Language */}
                <div>
                  <Label className="text-fg-1 font-medium">Idioma</Label>
                  <Select 
                    value={settings?.language || 'pt-BR'} 
                    onValueChange={(value) => handleSettingsUpdate('language', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator className="bg-border-hairline" />
                
                {/* Timezone */}
                <div>
                  <Label className="text-fg-1 font-medium">Fuso Horário</Label>
                  <Select 
                    value={settings?.timezone || 'UTC'} 
                    onValueChange={(value) => handleSettingsUpdate('timezone', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Active Sessions */}
      {sessions && sessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.5, ease: [0.2, 0, 0, 1] }}
        >
          <Card className="shadow-card-md">
            <CardHeader className="border-b border-hairline">
              <CardTitle className="text-lg font-semibold text-fg-1">Sessões Ativas</CardTitle>
              <p className="text-sm text-fg-3 mt-1">Gerencie suas sessões em diferentes dispositivos</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border border-hairline rounded-lg">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(session.user_agent || '')}
                      <div>
                        <p className="font-medium text-fg-1">{session.device_label}</p>
                        <div className="flex items-center gap-2 text-sm text-fg-3">
                          <Globe className="h-3 w-3" />
                          <span>{session.ip}</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>{formatLastSeen(session.last_seen_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.current && (
                        <Badge variant="default" className="text-xs">Atual</Badge>
                      )}
                      {!session.current && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteSession(session.id)}
                          className="border-hairline text-error hover:bg-error/5"
                        >
                          Encerrar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
}