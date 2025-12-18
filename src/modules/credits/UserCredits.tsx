import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import creditService from '../../services/credit.service';
import type { CreditPackage, CreditBalance, CreditTransaction } from '../../types/credit.types';

export default function UserCredits() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const [packagesData, balanceData, historyData] = await Promise.all([
        creditService.getAllPackages(),
        creditService.getBalance(user.id),
        creditService.getHistory(user.id, 1, 10),
      ]);
      setPackages(packagesData.filter(pkg => pkg.activo));
      setBalance(balanceData);
      setTransactions(historyData.transacciones);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar información de créditos');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedPackage || !user) return;

    try {
      // Aquí integrarías con tu pasarela de pago (Stripe, PayPal, etc.)
      // Por ahora simulamos la compra
      alert('Redirigiendo a la pasarela de pago...');

      // Después del pago exitoso, llamarías a:
      // await creditService.purchaseCredits(user.id, {
      //   tipoPaquete: selectedPackage.tipo,
      //   pagoId: 'payment_id_from_gateway',
      //   metodoPago: 'stripe'
      // });

      setShowPurchaseModal(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al procesar la compra');
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'compra':
        return 'bg-green-100 text-green-800';
      case 'consumo':
        return 'bg-red-100 text-red-800';
      case 'regalo':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Mis Créditos</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestiona tus créditos y realiza análisis de TikTok
          </p>
        </div>

        {/* Balance Card */}
        {balance && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-2">Créditos Disponibles</p>
                <p className="text-5xl font-bold">{balance.creditosDisponibles}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Total Comprados</p>
                <p className="text-2xl font-semibold">{balance.totalComprados}</p>
                <p className="text-sm opacity-90 mt-2">Total Consumidos</p>
                <p className="text-2xl font-semibold">{balance.totalConsumidos}</p>
              </div>
            </div>
          </div>
        )}

        {/* Packages */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Paquetes de Créditos</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                  pkg.metadata?.destacado ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{pkg.nombre}</h3>
                    {pkg.metadata?.etiqueta && (
                      <span className="px-2 py-1 text-xs font-semibold text-purple-600 bg-purple-100 rounded-full">
                        {pkg.metadata.etiqueta}
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-4xl font-bold text-gray-900">${pkg.precio}</p>
                    <p className="text-sm text-gray-500">{pkg.creditos} créditos</p>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{pkg.descripcion}</p>

                  {pkg.metadata?.caracteristicas && pkg.metadata.caracteristicas.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {pkg.metadata.caracteristicas.map((caracteristica, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600">
                          <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {caracteristica}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => handlePurchase(pkg)}
                    disabled={pkg.precio === 0}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                      pkg.precio === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : pkg.metadata?.destacado
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-800 text-white hover:bg-gray-900'
                    }`}
                  >
                    {pkg.precio === 0 ? 'Ya Usado' : 'Comprar Ahora'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Historial Reciente
            </h3>
          </div>

          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.creadoEn)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(
                            transaction.tipo
                          )}`}
                        >
                          {transaction.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-semibold ${
                            transaction.cantidad > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.cantidad > 0 ? '+' : ''}
                          {transaction.cantidad}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.balanceResultante}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {transaction.descripcion || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay transacciones aún</p>
            </div>
          )}
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && selectedPackage && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPurchaseModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Confirmar Compra
                </h3>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Paquete:</span>
                    <span className="font-semibold">{selectedPackage.nombre}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Créditos:</span>
                    <span className="font-semibold">{selectedPackage.creditos}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Precio:</span>
                    <span className="font-semibold text-lg">${selectedPackage.precio}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  Serás redirigido a la pasarela de pago para completar tu compra de forma segura.
                </p>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmPurchase}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Proceder al Pago
                </button>
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
