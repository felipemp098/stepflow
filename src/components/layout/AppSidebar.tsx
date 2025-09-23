import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  BarChart3, 
  Users, 
  GraduationCap, 
  Package, 
  FileText, 
  Settings,
  ChevronDown,
  Plus,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
  }[];
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'home',
    label: 'Início',
    icon: Home,
    href: '/',
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: BarChart3,
    href: '/reports',
  },
  {
    id: 'clients',
    label: 'Clientes',
    icon: Users,
    children: [
      { id: 'clients-list', label: 'Listar', icon: List, href: '/clients' },
      { id: 'clients-add', label: 'Adicionar', icon: Plus, href: '/clients/add' },
    ],
  },
  {
    id: 'students',
    label: 'Alunos',
    icon: GraduationCap,
    children: [
      { id: 'students-list', label: 'Listar', icon: List, href: '/students' },
      { id: 'students-add', label: 'Adicionar', icon: Plus, href: '/students/add' },
    ],
  },
  {
    id: 'products',
    label: 'Produtos',
    icon: Package,
    children: [
      { id: 'products-list', label: 'Listar', icon: List, href: '/products' },
      { id: 'products-add', label: 'Adicionar', icon: Plus, href: '/products/add' },
    ],
  },
  {
    id: 'contracts',
    label: 'Contratos',
    icon: FileText,
    children: [
      { id: 'contracts-list', label: 'Listar', icon: List, href: '/contracts' },
      { id: 'contracts-templates', label: 'Modelos', icon: FileText, href: '/contracts/templates' },
    ],
  },
  {
    id: 'settings',
    label: 'Configuração',
    icon: Settings,
    href: '/settings',
  },
];

interface AppSidebarProps {
  isCondensed?: boolean;
  onItemClick?: () => void;
  className?: string;
}

export function AppSidebar({ isCondensed = false, onItemClick, className }: AppSidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (href?: string, children?: SidebarItem['children']) => {
    if (href) {
      return location.pathname === href;
    }
    if (children) {
      return children.some(child => location.pathname === child.href);
    }
    return false;
  };

  const renderItem = (item: SidebarItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const itemIsActive = isActive(item.href, item.children);

    if (isCondensed && hasChildren) {
      // In condensed mode, show children as tooltip
      return (
        <TooltipProvider key={item.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-lg transition-colors cursor-pointer",
                  itemIsActive 
                    ? "bg-sidebar-accent text-sidebar-primary border border-sidebar-border" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover border-hairline">
              <div className="py-2">
                <div className="font-medium text-fg-1 mb-2">{item.label}</div>
                {item.children?.map(child => (
                  <Link
                    key={child.id}
                    to={child.href}
                    onClick={onItemClick}
                    className="flex items-center gap-2 px-2 py-1 text-sm text-fg-2 hover:text-fg-1 hover:bg-accent rounded"
                  >
                    <child.icon className="h-4 w-4" />
                    {child.label}
                  </Link>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (isCondensed && !hasChildren) {
      return (
        <TooltipProvider key={item.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to={item.href!}
                onClick={onItemClick}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-lg transition-colors",
                  itemIsActive 
                    ? "bg-sidebar-accent text-sidebar-primary border border-sidebar-border" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover border-hairline">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div key={item.id}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.id)}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-left",
              itemIsActive 
                ? "bg-sidebar-accent text-sidebar-primary border border-sidebar-border" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            <ChevronDown 
              className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "transform rotate-180"
              )} 
            />
          </button>
        ) : (
          <Link
            to={item.href!}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
              itemIsActive 
                ? "bg-sidebar-accent text-sidebar-primary border border-sidebar-border" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        )}

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
              className="overflow-hidden"
            >
              <div className="ml-8 mt-1 space-y-1">
                {item.children?.map(child => (
                  <Link
                    key={child.id}
                    to={child.href}
                    onClick={onItemClick}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-sm",
                      location.pathname === child.href
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <child.icon className="h-4 w-4" />
                    {child.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <aside className={cn("bg-sidebar border-r border-sidebar-border h-full", className)}>
      <nav className={cn("p-4 space-y-2", isCondensed && "flex flex-col items-center")}>
        {sidebarItems.map(renderItem)}
      </nav>
    </aside>
  );
}