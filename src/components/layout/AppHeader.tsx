import React from 'react';
import { Menu, ChevronDown, User, Settings, LogOut, Monitor, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';

interface AppHeaderProps {
  onMenuClick: () => void;
  showMenuButton: boolean;
}

const mockClients = [
  { id: 'all', name: 'Todos os clientes', status: 'all' },
  { id: '1', name: 'Tech Solutions Corp', status: 'active' },
  { id: '2', name: 'Digital Innovators Ltd', status: 'active' },
  { id: '3', name: 'Future Systems Inc', status: 'pending' },
  { id: '4', name: 'Smart Business Co', status: 'inactive' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'chip-success';
    case 'pending': return 'chip-financial';
    case 'inactive': return 'chip-error';
    default: return 'chip-operational';
  }
};

export function AppHeader({ onMenuClick, showMenuButton }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

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
          <Select defaultValue="all">
            <SelectTrigger className="w-[240px] bg-background border-hairline">
              <SelectValue placeholder="Selecionar cliente" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-hairline z-50">
              {mockClients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm text-fg-1">{client.name}</span>
                    {client.status !== 'all' && (
                      <Badge 
                        variant="outline" 
                        className={`ml-2 text-xs px-2 py-0.5 ${getStatusColor(client.status)}`}
                      >
                        {client.status}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">João Silva</div>
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
              <DropdownMenuItem className="text-error hover:bg-error/5">
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