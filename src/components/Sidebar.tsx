import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  User,
  History,
  Sparkles,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Users,
  Package,
  Receipt,
  BarChart3,
  X,
  Calendar,
  TrendingUp,
  Coins,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import creditService from '../services/credit.service';

interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  badge?: number;
  adminOnly?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);

  const isAdmin = user?.rol === 'admin';

  // Load credits
  useEffect(() => {
    const loadCredits = async () => {
      if (!user?.id) return;

      try {
        setLoadingCredits(true);
        const balance = await creditService.getBalance(user.id);
        setCredits(balance.creditosDisponibles);
      } catch (error) {
        console.error('Error loading credits:', error);
        setCredits(null);
      } finally {
        setLoadingCredits(false);
      }
    };

    loadCredits();

    // Reload credits when user navigates (in case they purchased credits)
    const interval = setInterval(loadCredits, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [user?.id]);

  const menuItems: MenuItem[] = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: TrendingUp,
      label: 'Competitors',
      path: '/competitors',
    },
    {
      icon: Calendar,
      label: 'Calendario',
      path: '/calendar',
    },
    {
      icon: History,
      label: 'Historial',
      path: '/history',
    },
    {
      icon: CreditCard,
      label: 'Mis Créditos',
      path: '/credits',
    },
    {
      icon: User,
      label: 'Mi Perfil',
      path: '/profile',
    },
  ];

  const adminMenuItems: MenuItem[] = [
    {
      icon: BarChart3,
      label: 'Admin Dashboard',
      path: '/admin',
      adminOnly: true,
    },
    {
      icon: Users,
      label: 'Usuarios',
      path: '/admin/users',
      adminOnly: true,
    },
    {
      icon: Package,
      label: 'Paquetes',
      path: '/admin/packages',
      adminOnly: true,
    },
    {
      icon: Receipt,
      label: 'Transacciones',
      path: '/admin/transactions',
      adminOnly: true,
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const allMenuItems = isAdmin ? [...menuItems, ...adminMenuItems] : menuItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${collapsed ? 'w-20' : 'w-64'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-800">TikAnalytics</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              {/* Close button (mobile only) */}
              <button
                onClick={onClose}
                className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
              {/* Collapse button (desktop only) */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:block p-1 rounded-lg hover:bg-gray-100"
              >
                {collapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* User Info */}
          {!collapsed && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.nombre?.[0] || 'U'}
                  {user?.apellido?.[0] || ''}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {user?.nombre || 'Usuario'} {user?.apellido || ''}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.tipoSuscripcion || 'gratuita'}
                    </p>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Credit Balance */}
          {!collapsed && (
            <div className="p-4">
              <button
                onClick={() => handleNavigate('/credits')}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                  credits !== null && credits < 5
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 animate-pulse'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-white" />
                  <div className="text-left">
                    <p className="text-xs text-white/80">Créditos</p>
                    <p className="text-lg font-bold text-white">
                      {loadingCredits ? '...' : credits !== null ? credits : 0}
                    </p>
                  </div>
                </div>
                <div className="text-white/80 text-xs">
                  {credits !== null && credits < 5 ? '⚠️' : '→'}
                </div>
              </button>
              {credits !== null && credits < 5 && (
                <p className="text-xs text-red-600 mt-2 text-center">
                  Créditos bajos. ¡Recarga ahora!
                </p>
              )}
            </div>
          )}

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {allMenuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg
                      transition-all duration-200
                      ${
                        active
                          ? 'bg-purple-50 text-purple-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-purple-600' : 'text-gray-500'}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left text-sm">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs font-medium rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Admin Section Separator */}
            {isAdmin && !collapsed && (
              <div className="my-4 border-t border-gray-200 pt-4">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Administración
                </p>
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            {!collapsed && (
              <div className="mb-3 p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">Créditos</span>
                  <span className="text-sm font-bold text-purple-600">
                    {user?.creditosDisponibles || 0}
                  </span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-1.5">
                  <div
                    className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(((user?.creditosDisponibles || 0) / 100) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            <button
              onClick={() => !collapsed && handleNavigate('/profile')}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg
                text-gray-700 hover:bg-gray-50 transition-colors mb-2
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? 'Configuración' : undefined}
            >
              <Settings className="w-5 h-5 text-gray-500" />
              {!collapsed && <span className="text-sm">Configuración</span>}
            </button>

            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg
                text-red-600 hover:bg-red-50 transition-colors
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? 'Cerrar Sesión' : undefined}
            >
              <LogOut className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Cerrar Sesión</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
