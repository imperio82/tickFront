import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Award, BarChart3, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/user.service';
import type { UpdateUserDto } from '../../types/user.types';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription'>('profile');
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);

    try {
      const updateData: UpdateUserDto = {
        nombre: formData.nombre,
        apellido: formData.apellido,
      };

      await userService.update(user.id, updateData);
      await refreshUser();

      toast.success('Perfil actualizado correctamente');
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionBadge = (type: string) => {
    switch (type) {
      case 'premium':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-semibold">
            <Crown className="w-5 h-5" />
            Premium
          </span>
        );
      case 'basica':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold">
            <Award className="w-5 h-5" />
            Básica
          </span>
        );
      case 'empresarial':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold">
            <BarChart3 className="w-5 h-5" />
            Empresarial
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold">
            Gratuita
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al Dashboard
          </button>
          <div className="flex items-center">
            <User className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-sm text-gray-500">Administra tu información personal y suscripción</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Información Personal
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'subscription'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Crown className="w-4 h-4 inline mr-2" />
                Suscripción
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Información Personal */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  {user?.emailVerificado ? (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      ✓ Email verificado
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-orange-600">
                      Email no verificado. Revisa tu bandeja de entrada.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Suscripción */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                {/* Suscripción Actual */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tu Suscripción Actual</h3>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      {getSubscriptionBadge(user?.tipoSuscripcion || 'gratuita')}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Estado</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {user?.estado || 'Activo'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Búsquedas este mes</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {user?.busquedasUtilizadasMes || 0} / {user?.limiteBusquedasMes || 0}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Perfiles seguidos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        0 / {user?.limitePerfilesSeguimiento || 0}
                      </p>
                    </div>
                  </div>

                  {user?.tipoSuscripcion !== 'premium' && user?.tipoSuscripcion !== 'empresarial' && (
                    <button
                      onClick={() => toast('Función de upgrade próximamente')}
                      className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all"
                    >
                      <Crown className="w-5 h-5 inline mr-2" />
                      Actualizar a Premium
                    </button>
                  )}
                </div>

                {/* Planes Disponibles */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Planes Disponibles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Plan Básico */}
                    <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-all">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Básico</h4>
                      <p className="text-3xl font-bold text-gray-900 mb-4">
                        $9<span className="text-lg text-gray-600">/mes</span>
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700 mb-6">
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span> 20 búsquedas/mes
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span> 5 perfiles seguidos
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span> Análisis básico
                        </li>
                      </ul>
                      <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Seleccionar
                      </button>
                    </div>

                    {/* Plan Premium */}
                    <div className="border-2 border-yellow-400 rounded-lg p-6 relative">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                          POPULAR
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Premium</h4>
                      <p className="text-3xl font-bold text-gray-900 mb-4">
                        $29<span className="text-lg text-gray-600">/mes</span>
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700 mb-6">
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span> Búsquedas ilimitadas
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span> 20 perfiles seguidos
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span> Análisis avanzado
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span> Exportar reportes
                        </li>
                      </ul>
                      <button className="w-full px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600">
                        Seleccionar
                      </button>
                    </div>

                    {/* Plan Empresarial */}
                    <div className="border-2 border-purple-300 rounded-lg p-6 hover:border-purple-400 transition-all">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Empresarial</h4>
                      <p className="text-3xl font-bold text-gray-900 mb-4">
                        $99<span className="text-lg text-gray-600">/mes</span>
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700 mb-6">
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span> Todo lo de Premium
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span> 100 perfiles seguidos
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span> API access
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-600">✓</span> Soporte prioritario
                        </li>
                      </ul>
                      <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700">
                        Seleccionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
