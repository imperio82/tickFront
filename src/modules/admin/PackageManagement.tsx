import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import creditService from '../../services/credit.service';
import type { CreditPackage, CreatePackageDto, UpdatePackageDto } from '../../types/credit.types';
import { TipoPaqueteCredito } from '../../types/credit.types';

export default function PackageManagement() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CreditPackage | null>(null);
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState<CreatePackageDto>({
    tipo: TipoPaqueteCredito.BASICO,
    nombre: '',
    creditos: 0,
    precio: 0,
    descripcion: '',
    activo: true,
    metadata: {
      destacado: false,
      etiqueta: '',
      caracteristicas: [],
    },
  });

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await creditService.getAllPackages();
      setPackages(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar paquetes');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializePackages = async () => {
    if (!confirm('¿Estás seguro de inicializar los paquetes predeterminados? Esto solo debe hacerse una vez.')) {
      return;
    }

    try {
      setProcessing(true);
      await creditService.initializePackages();
      loadPackages();
      alert('Paquetes inicializados exitosamente');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al inicializar paquetes');
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenModal = (pkg?: CreditPackage) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        tipo: pkg.tipo,
        nombre: pkg.nombre,
        creditos: pkg.creditos,
        precio: pkg.precio,
        descripcion: pkg.descripcion,
        activo: pkg.activo,
        metadata: pkg.metadata || { destacado: false, etiqueta: '', caracteristicas: [] },
      });
    } else {
      setEditingPackage(null);
      setFormData({
        tipo: TipoPaqueteCredito.BASICO,
        nombre: '',
        creditos: 0,
        precio: 0,
        descripcion: '',
        activo: true,
        metadata: { destacado: false, etiqueta: '', caracteristicas: [] },
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setProcessing(true);
      if (editingPackage) {
        await creditService.updatePackage(editingPackage.id, formData as UpdatePackageDto);
      } else {
        await creditService.createPackage(formData);
      }
      setShowModal(false);
      loadPackages();
      alert(editingPackage ? 'Paquete actualizado exitosamente' : 'Paquete creado exitosamente');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar paquete');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este paquete?')) {
      return;
    }

    try {
      await creditService.deletePackage(id);
      loadPackages();
      alert('Paquete eliminado exitosamente');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar paquete');
    }
  };

  const handleToggleActive = async (pkg: CreditPackage) => {
    try {
      await creditService.updatePackage(pkg.id, { activo: !pkg.activo });
      loadPackages();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar paquete');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Cargando paquetes...</p>
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
    <div className="min-h-screen bg-gray-50 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Paquetes</h1>
              <p className="mt-2 text-sm text-gray-600">
                {packages.length} paquetes disponibles
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleInitializePackages}
                disabled={processing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Inicializar Paquetes
              </button>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
              >
                Crear Paquete
              </button>
              <Link
                to="/admin"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Volver al Panel
              </Link>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                pkg.metadata?.destacado ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{pkg.nombre}</h3>
                  {pkg.metadata?.etiqueta && (
                    <span className="px-2 py-1 text-xs font-semibold text-purple-600 bg-purple-100 rounded-full">
                      {pkg.metadata.etiqueta}
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-3xl font-bold text-gray-900">${pkg.precio}</p>
                  <p className="text-sm text-gray-500">{pkg.creditos} créditos</p>
                </div>

                <p className="text-gray-600 text-sm mb-4">{pkg.descripcion}</p>

                {pkg.metadata?.caracteristicas && pkg.metadata.caracteristicas.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {pkg.metadata.caracteristicas.map((caracteristica, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-600">{caracteristica}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleToggleActive(pkg)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                        pkg.activo ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          pkg.activo ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="ml-3 text-sm text-gray-600">
                      {pkg.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenModal(pkg)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  <span className="font-medium">Tipo:</span> {pkg.tipo}
                </div>
              </div>
            </div>
          ))}
        </div>

        {packages.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No hay paquetes creados</p>
            <button
              onClick={handleInitializePackages}
              disabled={processing}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {processing ? 'Inicializando...' : 'Inicializar Paquetes Predeterminados'}
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {editingPackage ? 'Editar Paquete' : 'Crear Nuevo Paquete'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Paquete
                      </label>
                      <select
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoPaqueteCredito })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={!!editingPackage}
                      >
                        <option value="gratuito">Gratuito</option>
                        <option value="basico">Básico</option>
                        <option value="estandar">Estándar</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Créditos
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={formData.creditos}
                          onChange={(e) => setFormData({ ...formData, creditos: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Precio ($)
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formData.precio}
                          onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      <textarea
                        required
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Etiqueta (opcional)
                      </label>
                      <input
                        type="text"
                        value={formData.metadata?.etiqueta || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, etiqueta: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ej: Más Popular"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="destacado"
                        checked={formData.metadata?.destacado || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, destacado: e.target.checked }
                        })}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="destacado" className="ml-2 block text-sm text-gray-900">
                        Destacar este paquete
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="activo"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                        Paquete activo
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {processing ? 'Guardando...' : editingPackage ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
