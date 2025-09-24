import React, { useState, useEffect, useMemo } from 'react';
import { Menu, ChevronDown, User, Settings, LogOut, Monitor, Sun, Moon, Loader2, Search, Check } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

interface AppHeaderProps {
  onMenuClick: () => void;
  showMenuButton: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ativo': return 'chip-success';
    case 'pendente': return 'chip-financial';
    case 'inativo': return 'chip-error';
    case 'suspenso': return 'chip-error';
    default: return 'chip-operational';
  }
};

export function AppHeader({ onMenuClick, showMenuButton }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, signOut, clientes, currentCliente, setCurrentCliente, loading } = useAuth();
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  // Sincronizar estado local com cliente atual
  useEffect(() => {
    if (currentCliente) {
      setSelectedClient(currentCliente.id.toString());
    } else {
      setSelectedClient("all");
    }
  }, [currentCliente]);

  // Filtrar clientes baseado na busca
  const filteredClients = useMemo(() => {
    if (!searchValue) return clientes;
    return clientes.filter(client => 
      client.nome.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [clientes, searchValue]);

  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
    setOpen(false);
    setSearchValue("");
    
    if (clientId === "all") {
      setCurrentCliente(null);
    } else {
      const cliente = clientes.find(c => c.id.toString() === clientId);
      if (cliente) {
        setCurrentCliente(cliente);
      }
    }
  };

  const getDisplayText = () => {
    if (currentCliente) {
      return currentCliente.nome;
    }
    return "Todos os clientes";
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getUserName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  };

  return (
    <header className="h-16 border-b border-hairline bg-card shadow-sm">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onMenuClick}
              className="text-fg-2 hover:text-fg-1"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-sm">S</span>
            </div>
            <span className="font-semibold text-fg-1 text-lg">Stepflow</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Client Selector */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[240px] justify-between bg-background border-hairline hover:bg-accent"
              >
                <div className="flex items-center gap-2">
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Search className="h-4 w-4 text-fg-3" />
                  )}
                  <span className="text-sm text-fg-1 truncate">
                    {loading ? "Carregando..." : getDisplayText()}
                  </span>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0 bg-popover border-hairline z-50">
              <Command shouldFilter={false}>
                <CommandInput 
                  placeholder="Buscar cliente..." 
                  value={searchValue}
                  onValueChange={setSearchValue}
                  className="border-0 focus:ring-0"
                />
                <CommandList>
                  {loading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-fg-2">Carregando clientes...</span>
                    </div>
                  ) : (
                    <>
                      <CommandEmpty>
                        <div className="p-4 text-center">
                          <span className="text-sm text-fg-2">
                            {searchValue ? "Nenhum cliente encontrado" : "Nenhum cliente disponível"}
                          </span>
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all todos os clientes"
                          onSelect={() => handleClientChange("all")}
                          className="cursor-pointer hover:bg-accent"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedClient === "all" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm text-fg-1">Todos os clientes</span>
                            <Badge 
                              variant="outline" 
                              className="ml-2 text-xs px-2 py-0.5 chip-operational"
                            >
                              todos
                            </Badge>
                          </div>
                        </CommandItem>
                        {filteredClients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={`${client.nome} ${client.status || 'ativo'}`}
                            onSelect={() => handleClientChange(client.id.toString())}
                            className="cursor-pointer hover:bg-accent"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedClient === client.id.toString() ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex items-center justify-between w-full">
                              <span className="text-sm text-fg-1">{client.nome}</span>
                              <Badge 
                                variant="outline" 
                                className={`ml-2 text-xs px-2 py-0.5 ${getStatusColor(client.status || 'ativo')}`}
                              >
                                {client.status || 'ativo'}
                              </Badge>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-fg-2 hover:text-fg-1">
                <ThemeIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-hairline z-50">
              <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as any)}>
                <DropdownMenuRadioItem value="light" className="text-fg-1">
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark" className="text-fg-1">
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system" className="text-fg-1">
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-fg-1 hover:bg-accent">
               <Avatar className="h-8 w-8">
                 <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                   {user?.email ? getUserInitials(user.email) : "U"}
                 </AvatarFallback>
               </Avatar>
               <div className="hidden sm:block text-left">
                 <div className="text-sm font-medium">{getUserName()}</div>
                 <div className="text-xs text-fg-3">Administrador</div>
               </div>
                <ChevronDown className="h-4 w-4 text-fg-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-popover border-hairline z-50" align="end">
              <DropdownMenuItem className="text-fg-1 hover:bg-accent">
                <User className="mr-2 h-4 w-4" />
                Meu perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="text-fg-1 hover:bg-accent">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border-hairline" />
              <DropdownMenuItem className="text-error hover:bg-error/5" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}