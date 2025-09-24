-- Migration: Create RLS Policies for Multi-tenant Isolation
-- Description: Implements Row Level Security policies for tenant isolation
-- Date: 2025-01-27

-- Helper function to get current user's role for current client
CREATE OR REPLACE FUNCTION public.get_user_role_for_client(client_id UUID)
RETURNS user_role AS $$
DECLARE
  user_role_result user_role;
BEGIN
  SELECT role INTO user_role_result
  FROM public.user_client_roles
  WHERE user_id = auth.uid() AND cliente_id = client_id;
  
  RETURN user_role_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin for current client
CREATE OR REPLACE FUNCTION public.is_admin_for_client(client_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_user_role_for_client(client_id) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has access to client
CREATE OR REPLACE FUNCTION public.has_client_access(client_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_client_roles
    WHERE user_id = auth.uid() AND cliente_id = client_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for clientes table
CREATE POLICY "Users can view clients they have access to" 
ON public.clientes 
FOR SELECT 
USING (public.has_client_access(id));

CREATE POLICY "Only admins can create clients" 
ON public.clientes 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_client_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update clients" 
ON public.clientes 
FOR UPDATE 
USING (public.is_admin_for_client(id));

CREATE POLICY "Only admins can delete clients" 
ON public.clientes 
FOR DELETE 
USING (public.is_admin_for_client(id));

-- RLS Policies for user_client_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_client_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Only admins can manage user roles" 
ON public.user_client_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_client_roles ucr
    WHERE ucr.user_id = auth.uid() 
    AND ucr.cliente_id = user_client_roles.cliente_id 
    AND ucr.role = 'admin'
  )
);

-- RLS Policies for contratos table
CREATE POLICY "Users can view contracts from their clients" 
ON public.contratos 
FOR SELECT 
USING (public.has_client_access(cliente_id));

CREATE POLICY "Admins and clients can create contracts" 
ON public.contratos 
FOR INSERT 
WITH CHECK (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Admins and clients can update contracts" 
ON public.contratos 
FOR UPDATE 
USING (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Only admins can delete contracts" 
ON public.contratos 
FOR DELETE 
USING (public.is_admin_for_client(cliente_id));

-- RLS Policies for alunos table
CREATE POLICY "Users can view students from their clients" 
ON public.alunos 
FOR SELECT 
USING (public.has_client_access(cliente_id));

CREATE POLICY "Admins and clients can create students" 
ON public.alunos 
FOR INSERT 
WITH CHECK (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Admins and clients can update students" 
ON public.alunos 
FOR UPDATE 
USING (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Only admins can delete students" 
ON public.alunos 
FOR DELETE 
USING (public.is_admin_for_client(cliente_id));

-- RLS Policies for produtos table
CREATE POLICY "Users can view products from their clients" 
ON public.produtos 
FOR SELECT 
USING (public.has_client_access(cliente_id));

CREATE POLICY "Admins and clients can create products" 
ON public.produtos 
FOR INSERT 
WITH CHECK (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Admins and clients can update products" 
ON public.produtos 
FOR UPDATE 
USING (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Only admins can delete products" 
ON public.produtos 
FOR DELETE 
USING (public.is_admin_for_client(cliente_id));

-- RLS Policies for ofertas table
CREATE POLICY "Users can view offers from their clients" 
ON public.ofertas 
FOR SELECT 
USING (public.has_client_access(cliente_id));

CREATE POLICY "Admins and clients can create offers" 
ON public.ofertas 
FOR INSERT 
WITH CHECK (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Admins and clients can update offers" 
ON public.ofertas 
FOR UPDATE 
USING (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Only admins can delete offers" 
ON public.ofertas 
FOR DELETE 
USING (public.is_admin_for_client(cliente_id));

-- RLS Policies for jornadas table
CREATE POLICY "Users can view journeys from their clients" 
ON public.jornadas 
FOR SELECT 
USING (public.has_client_access(cliente_id));

CREATE POLICY "Admins and clients can create journeys" 
ON public.jornadas 
FOR INSERT 
WITH CHECK (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Admins and clients can update journeys" 
ON public.jornadas 
FOR UPDATE 
USING (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Only admins can delete journeys" 
ON public.jornadas 
FOR DELETE 
USING (public.is_admin_for_client(cliente_id));

-- RLS Policies for passos table
CREATE POLICY "Users can view steps from their clients" 
ON public.passos 
FOR SELECT 
USING (public.has_client_access(cliente_id));

CREATE POLICY "Admins and clients can create steps" 
ON public.passos 
FOR INSERT 
WITH CHECK (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Admins and clients can update steps" 
ON public.passos 
FOR UPDATE 
USING (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Only admins can delete steps" 
ON public.passos 
FOR DELETE 
USING (public.is_admin_for_client(cliente_id));

-- RLS Policies for jornadas_instancia table
CREATE POLICY "Users can view journey instances from their clients" 
ON public.jornadas_instancia 
FOR SELECT 
USING (public.has_client_access(cliente_id));

CREATE POLICY "Admins and clients can create journey instances" 
ON public.jornadas_instancia 
FOR INSERT 
WITH CHECK (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Admins and clients can update journey instances" 
ON public.jornadas_instancia 
FOR UPDATE 
USING (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Only admins can delete journey instances" 
ON public.jornadas_instancia 
FOR DELETE 
USING (public.is_admin_for_client(cliente_id));

-- RLS Policies for passos_instancia table
CREATE POLICY "Users can view step instances from their clients" 
ON public.passos_instancia 
FOR SELECT 
USING (public.has_client_access(cliente_id));

CREATE POLICY "Admins and clients can create step instances" 
ON public.passos_instancia 
FOR INSERT 
WITH CHECK (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Admins and clients can update step instances" 
ON public.passos_instancia 
FOR UPDATE 
USING (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Only admins can delete step instances" 
ON public.passos_instancia 
FOR DELETE 
USING (public.is_admin_for_client(cliente_id));

-- RLS Policies for parcelas table
CREATE POLICY "Users can view installments from their clients" 
ON public.parcelas 
FOR SELECT 
USING (public.has_client_access(cliente_id));

CREATE POLICY "Admins and clients can create installments" 
ON public.parcelas 
FOR INSERT 
WITH CHECK (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Admins and clients can update installment status" 
ON public.parcelas 
FOR UPDATE 
USING (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Only admins can delete installments" 
ON public.parcelas 
FOR DELETE 
USING (public.is_admin_for_client(cliente_id));

-- RLS Policies for contrato_alunos table
CREATE POLICY "Users can view contract-student relationships from their clients" 
ON public.contrato_alunos 
FOR SELECT 
USING (public.has_client_access(cliente_id));

CREATE POLICY "Admins and clients can create contract-student relationships" 
ON public.contrato_alunos 
FOR INSERT 
WITH CHECK (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Admins and clients can update contract-student relationships" 
ON public.contrato_alunos 
FOR UPDATE 
USING (
  public.has_client_access(cliente_id) AND
  public.get_user_role_for_client(cliente_id) IN ('admin', 'cliente')
);

CREATE POLICY "Only admins can delete contract-student relationships" 
ON public.contrato_alunos 
FOR DELETE 
USING (public.is_admin_for_client(cliente_id));
