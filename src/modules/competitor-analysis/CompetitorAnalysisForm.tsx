import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Search, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import competitorAnalysisService from '../../services/competitor-analysis.service';
import type { CompetitorAnalysisRequest } from '../../types/competitor-analysis.types';

const CompetitorAnalysisForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentProfile, setCurrentProfile] = useState('');
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [videosPerProfile, setVideosPerProfile] = useState(50);
  const [analyzeTop, setAnalyzeTop] = useState(20);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    minViews: 5000,
    minEngagementRate: 0.03,
  });

  const handleAddCompetitor = () => {
    if (!currentProfile.trim()) {
      toast.error('Ingresa un perfil de TikTok válido');
      return;
    }

    // Validar formato @username
    let profile = currentProfile.trim();
    if (!profile.startsWith('@')) {
      profile = '@' + profile;
    }

    // Verificar que no esté duplicado
    if (competitors.includes(profile)) {
      toast.error('Este perfil ya fue agregado');
      return;
    }

    // Límite de 5 competidores
    if (competitors.length >= 5) {
      toast.error('Máximo 5 competidores permitidos');
      return;
    }

    setCompetitors([...competitors, profile]);
    setCurrentProfile('');
    toast.success(`${profile} agregado`);
  };

  const handleRemoveCompetitor = (profile: string) => {
    setCompetitors(competitors.filter((c) => c !== profile));
    toast.success('Competidor eliminado');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (competitors.length === 0) {
      toast.error('Debes agregar al menos 1 competidor');
      return;
    }

    setIsLoading(true);

    try {
      const requestData: CompetitorAnalysisRequest = {
        competitorProfiles: competitors,
        videosPerProfile,
        analyzeTop,
        filters: {
          minViews: filters.minViews,
          minEngagementRate: filters.minEngagementRate,
        },
      };

      const response = await competitorAnalysisService.analyzeCompetitors(requestData);

      toast.success('¡Análisis completado exitosamente!');

      // Redirigir a la página de resultados
      navigate(`/analysis/${response.analysisId}`);
    } catch (error: any) {
      console.error('Error al analizar competidores:', error);
      toast.error(
        error.response?.data?.message || 'Error al realizar el análisis. Intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedTime = Math.ceil((competitors.length * videosPerProfile * analyzeTop) / 1000);

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
            <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analizar Competencia</h1>
              <p className="text-sm text-gray-500">
                Descubre qué funciona en tu nicho analizando a tus competidores
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Paso 1: Buscar perfiles */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Paso 1: Selecciona competidores
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={currentProfile}
                  onChange={(e) => setCurrentProfile(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCompetitor();
                    }
                  }}
                  placeholder="Buscar perfiles de TikTok (@username)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <button
                type="button"
                onClick={handleAddCompetitor}
                disabled={isLoading || competitors.length >= 5}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Agregar
              </button>
            </div>
          </div>

          {/* Competidores seleccionados */}
          {competitors.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competidores seleccionados:
              </label>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {competitors.map((profile, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="font-medium text-gray-900">{profile}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCompetitor(profile)}
                      disabled={isLoading}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {competitors.length < 5 && (
                  <button
                    type="button"
                    onClick={() => document.querySelector('input')?.focus()}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar otro competidor (máx: 5)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Configuración */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-900">
              Configuración:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Videos por perfil
                </label>
                <select
                  value={videosPerProfile}
                  onChange={(e) => setVideosPerProfile(Number(e.target.value))}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={20}>20 videos</option>
                  <option value={30}>30 videos</option>
                  <option value={50}>50 videos</option>
                  <option value={100}>100 videos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Analizar con IA
                </label>
                <select
                  value={analyzeTop}
                  onChange={(e) => setAnalyzeTop(Number(e.target.value))}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10 videos</option>
                  <option value={20}>20 videos</option>
                  <option value={30}>30 videos</option>
                  <option value={50}>50 videos</option>
                </select>
              </div>
            </div>

            {/* Filtros avanzados */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Filtros avanzados: {showAdvancedFilters ? '▲' : '▼'}
              </button>
              {showAdvancedFilters && (
                <div className="mt-3 space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Mínimo de vistas
                    </label>
                    <input
                      type="number"
                      value={filters.minViews}
                      onChange={(e) =>
                        setFilters({ ...filters, minViews: Number(e.target.value) })
                      }
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Mínimo de engagement (0.00 - 1.00)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={filters.minEngagementRate}
                      onChange={(e) =>
                        setFilters({ ...filters, minEngagementRate: Number(e.target.value) })
                      }
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estimación */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-700">Tiempo estimado:</span>
                <span className="ml-2 font-semibold text-blue-900">~{estimatedTime} minutos</span>
              </div>
              <div>
                <span className="text-gray-700">Costo:</span>
                <span className="ml-2 font-semibold text-blue-900">0 créditos</span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || competitors.length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analizando...
                </>
              ) : (
                <>
                  Iniciar Análisis →
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompetitorAnalysisForm;
