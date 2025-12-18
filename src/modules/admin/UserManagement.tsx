import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import creditService from '../../services/credit.service';
import { userService } from '../../services/user.service';
import type { User, TipoSuscripcion } from '../../types/user.types';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftAmount, setGiftAmount] = useState(1);
  const [giftMessage, setGiftMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  // Adjust credits modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustDescription, setAdjustDescription] = useState('');

  // Change subscription modal
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [newSubscription, setNewSubscription] = useState<TipoSuscripcion>('gratuita');

  console.log('🔍 UserManagement render:', {
    usersLength: users.length,
    filteredUsersLength: filteredUsers.length,
    isUsersArray: Array.isArray(users),
    isFilteredArray: Array.isArray(filteredUsers)
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await creditService.getAllUsers();
      console.log('👥 Usuarios cargados:', data);
      console.log('📊 Es array?:', Array.isArray(data));

      // Si data es un objeto con propiedad usuarios
      if (data && typeof data === 'object' && 'usuarios' in data && Array.isArray(data.usuarios)) {
        setUsers(data.usuarios);
        setFilteredUsers(data.usuarios);
      }
      // Si data es directamente un array
      else if (Array.isArray(data)) {
        setUsers(data);
        setFilteredUsers(data);
      }
      else {
        console.error('❌ Los datos no son un array:', data);
        setError('Formato de datos inválido');
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (err: any) {
      console.error('❌ Error al cargar usuarios:', err);
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.nombre && user.nombre.toLowerCase().includes(term)) ||
        (user.apellido && user.apellido.toLowerCase().includes(term))
    );
    setFilteredUsers(filtered);
  };

  const handleGiftCredits = async () => {
    if (!selectedUser || giftAmount <= 0) return;

    try {
      setProcessing(true);
      await creditService.giftCredits(selectedUser.id, {
        usuarioDestinoId: selectedUser.id,
        cantidad: giftAmount,
        mensaje: giftMessage || `Regalo de ${giftAmount} créditos`,
      });

      setShowGiftModal(false);
      setSelectedUser(null);
      setGiftAmount(1);
      setGiftMessage('');
      loadUsers();
      toast.success('Créditos regalados exitosamente');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al regalar créditos');
    } finally {
      setProcessing(false);
    }
  };

  const handleAdjustCredits = async () => {
    if (!selectedUser || adjustAmount === 0) {
      toast.error('La cantidad debe ser diferente de 0');
      return;
    }

    if (!adjustDescription.trim()) {
      toast.error('La descripción es requerida');
      return;
    }

    try {
      setProcessing(true);
      await creditService.adjustUserCredits(selectedUser.id, adjustAmount, adjustDescription);

      setShowAdjustModal(false);
      setSelectedUser(null);
      setAdjustAmount(0);
      setAdjustDescription('');
      loadUsers();
      toast.success(`Créditos ${adjustAmount > 0 ? 'agregados' : 'removidos'} exitosamente`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al ajustar créditos');
    } finally {
      setProcessing(false);
    }
  };

  const handleChangeSubscription = async () => {
    if (!selectedUser) return;

    try {
      setProcessing(true);
      await userService.updateSubscription(selectedUser.id, newSubscription);

      setShowSubscriptionModal(false);
      setSelectedUser(null);
      setNewSubscription('gratuita');
      loadUsers();
      toast.success('Plan de suscripción actualizado exitosamente');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al cambiar suscripción');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="mt-2 text-sm text-gray-600">
                {filteredUsers.length} usuarios encontrados
              </p>
            </div>
            <Link
              to="/admin"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Volver al Panel
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por username, email o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créditos Disponibles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Comprados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Consumidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-semibold text-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          @{user.username}
                        </div>
                        {(user.nombre || user.apellido) && (
                          <div className="text-sm text-gray-500">
                            {user.nombre} {user.apellido}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-purple-600">
                      {user.creditosDisponibles || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.totalCreditosComprados || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.totalCreditosConsumidos || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        user.tipoSuscripcion === 'empresarial'
                          ? 'bg-purple-100 text-purple-800'
                          : user.tipoSuscripcion === 'premium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : user.tipoSuscripcion === 'basica'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.tipoSuscripcion}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.estado === 'activo'
                          ? 'bg-green-100 text-green-800'
                          : user.estado === 'suspendido'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowAdjustModal(true);
                        }}
                        className="text-left text-purple-600 hover:text-purple-900"
                      >
                        Ajustar Créditos
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setNewSubscription(user.tipoSuscripcion);
                          setShowSubscriptionModal(true);
                        }}
                        className="text-left text-indigo-600 hover:text-indigo-900"
                      >
                        Cambiar Plan
                      </button>
                      <Link
                        to={`/admin/users/${user.id}/history`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver Historial
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </div>

      {/* Adjust Credits Modal */}
      {showAdjustModal && selectedUser && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowAdjustModal(false)}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg w-full relative">
              {/* Close button */}
              <button
                onClick={() => {
                  setShowAdjustModal(false);
                  setSelectedUser(null);
                  setAdjustAmount(0);
                  setAdjustDescription('');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg leading-6 font-bold text-gray-900">
                      Ajustar Créditos
                    </h3>
                    <p className="text-sm text-gray-500">
                      @{selectedUser.username}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">
                    Créditos actuales: <strong className="text-blue-600 text-lg">{selectedUser.creditosDisponibles}</strong>
                  </p>
                </div>

                <div className="space-y-4 text-black">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad (usa números negativos para restar)
                    </label>
                    <input
                      type="number"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="Ej: 10 para agregar, -5 para quitar"
                    />
                    {adjustAmount !== 0 && (
                      <div className={`mt-2 p-3 rounded-lg ${adjustAmount > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <p className={`text-sm font-medium ${adjustAmount > 0 ? 'text-green-900' : 'text-red-900'}`}>
                          {adjustAmount > 0 ? '➕' : '➖'} Nuevo total: <strong className="text-lg">{selectedUser.creditosDisponibles + adjustAmount}</strong> créditos
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción (requerido)
                    </label>
                    <textarea
                      value={adjustDescription}
                      onChange={(e) => setAdjustDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="Ej: Ajuste manual por corrección de error"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleAdjustCredits}
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-lg px-6 py-3 bg-purple-600 text-white font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Ajustar Créditos
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdjustModal(false);
                    setSelectedUser(null);
                    setAdjustAmount(0);
                    setAdjustDescription('');
                  }}
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-lg px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Subscription Modal */}
      {showSubscriptionModal && selectedUser && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowSubscriptionModal(false)}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg w-full relative">
              {/* Close button */}
              <button
                onClick={() => {
                  setShowSubscriptionModal(false);
                  setSelectedUser(null);
                  setNewSubscription('gratuita');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg leading-6 font-bold text-gray-900">
                      Cambiar Plan
                    </h3>
                    <p className="text-sm text-gray-500">
                      @{selectedUser.username}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">
                    Plan actual: <strong className="capitalize text-blue-600 text-lg">{selectedUser.tipoSuscripcion}</strong>
                  </p>
                </div>

                <div className="space-y-4 text-black">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Nuevo Plan
                    </label>
                    <div className="space-y-2">
                      {(['gratuita', 'basica', 'premium', 'empresarial'] as TipoSuscripcion[]).map((plan) => (
                        <label
                          key={plan}
                          className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            newSubscription === plan
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="subscription"
                            value={plan}
                            checked={newSubscription === plan}
                            onChange={(e) => setNewSubscription(e.target.value as TipoSuscripcion)}
                            className="mr-3"
                          />
                          <span className="capitalize font-medium">{plan}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleChangeSubscription}
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-lg px-6 py-3 bg-indigo-600 text-white font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Cambiar Plan
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSubscriptionModal(false);
                    setSelectedUser(null);
                    setNewSubscription('gratuita');
                  }}
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-lg px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gift Credits Modal */}
      {showGiftModal && selectedUser && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowGiftModal(false)}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg w-full relative">
              {/* Close button */}
              <button
                onClick={() => {
                  setShowGiftModal(false);
                  setSelectedUser(null);
                  setGiftAmount(1);
                  setGiftMessage('');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg leading-6 font-bold text-gray-900">
                      Regalar Créditos
                    </h3>
                    <p className="text-sm text-gray-500">
                      @{selectedUser.username}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad de Créditos
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={giftAmount}
                      onChange={(e) => setGiftAmount(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje (opcional)
                    </label>
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="Ej: Regalo de bienvenida"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleGiftCredits}
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-lg px-6 py-3 bg-green-600 text-white font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                      Regalar Créditos
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGiftModal(false);
                    setSelectedUser(null);
                    setGiftAmount(1);
                    setGiftMessage('');
                  }}
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-lg px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
