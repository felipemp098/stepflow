import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { FixAdminRole } from '@/lib/fix-admin-role';
import { isSuperAdmin, canCreateUsers, getUserAccessLevel } from '@/lib/auth/permissions';

type UserRole = Database['public']['Enums']['user_role'];
type Cliente = Database['public']['Tables']['clientes']['Row'];
type UserClientRole = Database['public']['Tables']['user_client_roles']['Row'] & {
  clientes: Cliente;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  clientes: Cliente[];
  currentCliente: Cliente | null;
  userRoles: UserClientRole[];
  currentRole: UserRole | null;
  isSuperAdmin: boolean;
  canCreateUsers: boolean;
  accessLevel: 'super_admin' | 'admin' | 'cliente' | 'aluno' | 'none';
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signInWithMagicLink: (email: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  setCurrentCliente: (cliente: Cliente | null) => void;
  refreshUserData: () => Promise<void>;
  fixAdminRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [currentCliente, setCurrentCliente] = useState<Cliente | null>(null);
  const [userRoles, setUserRoles] = useState<UserClientRole[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  // Calcular permissões baseadas no usuário e roles
  const isSuperAdminUser = isSuperAdmin(user);
  const canCreateUsersFlag = canCreateUsers(user, userRoles);
  const accessLevel = getUserAccessLevel(user, userRoles);

  // Log de debug das permissões
  useEffect(() => {
    if (user) {
      console.log('🔐 Permissões do usuário:', {
        userId: user.id,
        email: user.email,
        isSuperAdmin: isSuperAdminUser,
        canCreateUsers: canCreateUsersFlag,
        accessLevel,
        userRoles: userRoles.length,
        userMetadata: user.user_metadata
      });
    }
  }, [user, isSuperAdminUser, canCreateUsersFlag, accessLevel, userRoles]);

  // Função para buscar dados do usuário (clientes e papéis)
  const fetchUserData = async (userId: string) => {
    try {
      console.log('🔍 Buscando dados do usuário:', userId);
      
      // Evitar múltiplas chamadas simultâneas
      if (loading) {
        console.log('⏳ Já carregando, ignorando chamada duplicada');
        return;
      }
      
      // Primeiro, verificar se o usuário tem vínculos
      console.log('🔍 Verificando vínculos do usuário...');
      
      // Adicionar timeout para evitar travamento
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na consulta de vínculos')), 30000);
      });
      
      const queryPromise = supabase
        .from('user_client_roles')
        .select('*')
        .eq('user_id', userId);
      
      const { data: roles, error: rolesError } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (rolesError) {
        console.error('❌ Erro ao buscar papéis do usuário:', rolesError);
        setUserRoles([]);
        setClientes([]);
        return;
      }

      console.log('✅ Vínculos encontrados:', roles);

      if (!roles || roles.length === 0) {
        console.warn('⚠️ Nenhum vínculo encontrado para o usuário');
        setUserRoles([]);
        setClientes([]);
        setCurrentCliente(null);
        setCurrentRole(null);
        return;
      }

      console.log('✅ Vínculos encontrados com sucesso:', roles.length, 'vínculos');

      // Buscar informações dos clientes
      console.log('🔍 Buscando informações dos clientes...');
      const clienteIds = roles.map((role: any) => role.cliente_id);
      console.log('🔍 IDs dos clientes:', clienteIds);
      
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('*')
        .in('id', clienteIds);

      if (clientesError) {
        console.error('❌ Erro ao buscar clientes:', clientesError);
        setUserRoles([]);
        setClientes([]);
        return;
      }

      console.log('✅ Clientes encontrados:', clientes);

      // Combinar dados
      const rolesWithClientes = roles.map((role: any) => ({
        ...role,
        clientes: clientes?.find(c => c.id === role.cliente_id)
      })).filter(role => role.clientes);

      console.log('✅ Dados combinados:', rolesWithClientes);
      
      setUserRoles(rolesWithClientes);
      setClientes(clientes || []);

      // Se não há cliente atual definido, usar o primeiro disponível
      if (!currentCliente && clientes && clientes.length > 0) {
        console.log('✅ Definindo cliente atual:', clientes[0]);
        setCurrentCliente(clientes[0]);
        setCurrentRole(rolesWithClientes[0]?.role || null);
      } else if (!clientes || clientes.length === 0) {
        console.warn('⚠️ Nenhum cliente encontrado para o usuário');
      }
    } catch (error) {
      // Log apenas se não for timeout (para não poluir o console)
      if (!error.message?.includes('Timeout')) {
        console.error('❌ Erro ao buscar dados do usuário:', error);
      } else {
        console.warn('⚠️ Timeout na consulta de vínculos - continuando sem dados de cliente');
      }
      
      // Garantir que os estados sejam definidos mesmo com erro
      setUserRoles([]);
      setClientes([]);
      setCurrentCliente(null);
      setCurrentRole(null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email);
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Usuário autenticado, buscando dados...');
          await fetchUserData(session.user.id);
        } else {
          console.log('🚪 Usuário deslogado, limpando dados...');
          // Limpar dados quando usuário faz logout
          setClientes([]);
          setCurrentCliente(null);
          setUserRoles([]);
          setCurrentRole(null);
        }
        
        if (isMounted) {
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao obter sessão:', error);
          if (isMounted) setLoading(false);
          return;
        }
        
        console.log('🔍 Sessão existente:', session?.user?.email || 'Nenhuma');
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Sessão encontrada, buscando dados...');
          await fetchUserData(session.user.id);
        }
        
        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Função para atualizar cliente atual
  const handleSetCurrentCliente = (cliente: Cliente | null) => {
    setCurrentCliente(cliente);
    
    if (cliente) {
      // Encontrar o papel do usuário para este cliente
      const role = userRoles.find(r => r.cliente_id === cliente.id);
      setCurrentRole(role?.role || null);
    } else {
      setCurrentRole(null);
    }
  };

  // Função para recarregar dados do usuário
  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  const fixAdminRole = async () => {
    await FixAdminRole.fix();
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: name ? { full_name: name } : undefined,
      }
    });
    return { error };
  };

  const signInWithMagicLink = async (email: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      }
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    clientes,
    currentCliente,
    userRoles,
    currentRole,
    isSuperAdmin: isSuperAdminUser,
    canCreateUsers: canCreateUsersFlag,
    accessLevel,
    signIn,
    signUp,
    signInWithMagicLink,
    signInWithGoogle,
    signOut,
    setCurrentCliente: handleSetCurrentCliente,
    refreshUserData,
    fixAdminRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}