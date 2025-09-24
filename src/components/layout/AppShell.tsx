import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 1280px)');
  const isTablet = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)');
  const isMobile = useMediaQuery('(max-width: 1023px)');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/login');
    }
  }, [user, loading, navigate]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const sidebarWidth = isDesktop ? 280 : isTablet ? 80 : 0;

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Header */}
      <AppHeader 
        onMenuClick={() => setSidebarOpen(true)}
        showMenuButton={isMobile}
      />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Desktop/Tablet Sidebar */}
        {!isMobile && (
          <AppSidebar 
            isCondensed={isTablet}
            className={`fixed left-0 top-16 h-[calc(100vh-64px)] z-40 ${
              isDesktop ? 'w-[280px]' : 'w-20'
            }`}
          />
        )}

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isMobile && sidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 z-40 top-16"
                onClick={() => setSidebarOpen(false)}
              />
              
              {/* Mobile Sidebar */}
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ 
                  duration: 0.2, 
                  ease: [0.2, 0, 0, 1] 
                }}
                className="fixed left-0 top-16 h-[calc(100vh-64px)] w-[280px] z-50"
              >
                <AppSidebar 
                  isCondensed={false}
                  onItemClick={() => setSidebarOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main 
          className="flex-1 overflow-auto"
          style={{ 
            marginLeft: !isMobile ? sidebarWidth : 0,
            paddingLeft: 'var(--gutter)',
            paddingRight: 'var(--gutter)'
          }}
        >
          <div className="max-w-content mx-auto py-6">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.2, 
                ease: [0.2, 0, 0, 1] 
              }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}