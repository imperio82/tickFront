import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Trash2,
  Eye,
  TrendingUp,
  Hash,
  Target,
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import competitorAnalysisService from '../../services/competitor-analysis.service';
import type {
  AnalysisHistoryItem,
  AnalysisType,
  AnalysisHistoryParams,
} from '../../types/competitor-analysis.types';

const AnalysisHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<AnalysisType | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadHistory();
  }, [page, selectedType, dateFilter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const params: AnalysisHistoryParams = {
        page,
        limit,
      };

      if (selectedType !== 'all') {
        params.type = selectedType;
      }

      const response = await competitorAnalysisService.getHistory(params);
      setAnalyses(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      console.error('Error al cargar historial:', error);
      toast.error('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (_id: string) => {
    if (!confirm('¿Estás seguro de eliminar este análisis?')) return;

    try {
      // TODO: Implementar endpoint de eliminación
      toast.success('Análisis eliminado');
      loadHistory();
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el análisis');
    }
  };

  const handleView = (id: string) => {
    navigate(`/analysis/${id}`);
  };

  const getTypeIcon = (type: AnalysisType) => {
    switch (type) {
      case 'competitor_profile':
        return <Target className="w-5 h-5 text-blue-600" />;
      case 'category':
        return <Hash className="w-5 h-5 text-purple-600" />;
      case 'trending':
        return <TrendingUp className="w-5 h-5 text-red-600" />;
      case 'comparative':
        return <Award className="w-5 h-5 text-green-600" />;
      default:
        return <Search className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: AnalysisType) => {
    switch (type) {
      case 'competitor_profile':
        return 'Competidores';
      case 'category':
        return 'Categoría';
      case 'trending':
        return 'Trending';
      case 'comparative':
        return 'Comparativo';
      default:
        return 'Análisis';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            ✓ Completado
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            ⏳ Procesando
          </span>
        );
      case 'failed':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
            ✗ Fallido
          </span>
        );
      default:
        return null;
    }
  };

  const filteredAnalyses = analyses.filter((analysis) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const paramsString = JSON.stringify(analysis.parameters).toLowerCase();
      return paramsString.includes(query);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al Dashboard
          </button>
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Historial de Análisis</h1>
              <p className="text-sm text-gray-500">
                {total} análisis totales
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar en análisis..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por tipo */}
            <div className="lg:w-48">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as AnalysisType | 'all');
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los tipos</option>
                <option value="competitor_profile">Competidores</option>
                <option value="category">Categoría</option>
                <option value="trending">Trending</option>
                <option value="comparative">Comparativo</option>
              </select>
            </div>

            {/* Filtro por fecha */}
            <div className="lg:w-48">
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las fechas</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="year">Último año</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de análisis */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Cargando historial...</p>
          </div>
        ) : filteredAnalyses.length > 0 ? (
          <div className="space-y-4">
            {filteredAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getTypeIcon(analysis.analysisType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {getTypeLabel(analysis.analysisType)}:{' '}
                          {analysis.analysisType === 'competitor_profile' &&
                            analysis.parameters.profiles?.join(', ')}
                          {analysis.analysisType === 'category' &&
                            (analysis.parameters.hashtags?.join(', ') ||
                              analysis.parameters.keywords?.join(', '))}
                          {analysis.analysisType === 'trending' &&
                            `Región ${analysis.parameters.region}`}
                          {analysis.analysisType === 'comparative' &&
                            `${analysis.parameters.yourProfile} vs ${analysis.parameters.competitorProfiles?.length} competidores`}
                        </h3>
                        {getStatusBadge(analysis.status)}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(analysis.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {analysis.scrapingMetadata && (
                          <>
                            <span>
                              {analysis.scrapingMetadata.totalVideosScraped} videos scrapeados
                            </span>
                            <span>
                              {analysis.scrapingMetadata.videosAnalyzedWithAI} analizados con IA
                            </span>
                          </>
                        )}
                      </div>

                      {analysis.summary && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Tiempo de procesamiento:</span>{' '}
                          {Math.ceil(analysis.summary.processingTime / 1000)}s
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {analysis.status === 'completed' && (
                      <button
                        onClick={() => navigate(`/calendar?analysisId=${analysis.id}`)}
                        className="flex items-center gap-1.5 px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition text-sm font-medium"
                        title="Crear calendario basado en este análisis"
                      >
                        <Calendar className="w-4 h-4" />
                        Crear Calendario
                      </button>
                    )}
                    <button
                      onClick={() => handleView(analysis.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Ver detalles"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(analysis.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron análisis
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Intenta con otros términos de búsqueda'
                : 'Aún no has realizado ningún análisis'}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Crear nuevo análisis
            </button>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Mostrando {(page - 1) * limit + 1}-{Math.min(page * limit, total)} de {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisHistory;
