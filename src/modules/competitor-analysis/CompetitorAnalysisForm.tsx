import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Search, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import competitorAnalysisService from '../../services/competitor-analysis.service';
import creditService from '../../services/credit.service';
import type { CompetitorAnalysisRequest } from '../../types/competitor-analysis.types';

const CompetitorAnalysisForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [credits, setCredits] = useState(0);

  // Load credits
  useEffect(() => {
    const loadCredits = async () => {
      if (!user?.id) return;

      try {
        const balance = await creditService.getBalance(user.id);
        setCredits(balance.creditosDisponibles);
      } catch (error) {
        console.error('Error loading credits:', error);
        setCredits(0);
      }
    };

    loadCredits();
  }, [user?.id]);

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

    // Verify credits before submitting
    const finalVideosPerProfile = Math.min(videosPerProfile, maxVideosPerProfile);
    const totalVideosToScrape = competitors.length * finalVideosPerProfile;
    const finalAnalyzeTop = Math.min(analyzeTop, maxVideosToAnalyze);

    const estimate = creditService.estimateCredits({
      videosAScrappear: totalVideosToScrape,
      videosAAnalizar: finalAnalyzeTop,
      creditosDisponibles: credits,
    });

    if (!estimate.tieneCreditos) {
      toast.error(`Créditos insuficientes. Necesitas ${estimate.total} crédito(s) pero solo tienes ${credits}. Redirigiendo a compra de créditos...`);
      setTimeout(() => navigate('/credits'), 2000);
      return;
    }

    setIsLoading(true);

    try {
      const requestData: CompetitorAnalysisRequest = {
        competitorProfiles: competitors,
        videosPerProfile: finalVideosPerProfile,
        analyzeTop: finalAnalyzeTop,
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

  // Calculate maximum videos per profile that can be scraped based on available credits
  const maxVideosPerProfileTotal = credits * 50; // Total videos we can scrape with all credits
  const maxVideosPerProfile = competitors.length > 0
    ? Math.floor(maxVideosPerProfileTotal / competitors.length)
    : maxVideosPerProfileTotal;

  // Generate dynamic options for "Videos por perfil" in multiples of 50
  const getScrapingOptions = () => {
    const options = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];
    return options.filter(opt => opt <= maxVideosPerProfile);
  };

  // Adjust videosPerProfile if it exceeds the maximum
  const validVideosPerProfile = Math.min(videosPerProfile, maxVideosPerProfile);

  // Calculate maximum videos that can be analyzed based on available credits
  const scrapingCredits = Math.ceil((competitors.length * validVideosPerProfile) / 50);
  const creditsForAnalysis = Math.max(0, credits - scrapingCredits);
  const maxVideosToAnalyze = creditsForAnalysis * 4;

  // Generate dynamic options for "Analizar con IA" based on available credits
  const getAnalysisOptions = () => {
    const options = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48];
    return options.filter(opt => opt <= maxVideosToAnalyze);
  };

  // Adjust analyzeTop if it exceeds the maximum
  const validAnalyzeTop = Math.min(analyzeTop, maxVideosToAnalyze);

  const estimatedTime = Math.ceil((competitors.length * videosPerProfile * validAnalyzeTop) / 1000);

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
      <div className="max-w-4xl mx-auto px-4 py-8 text-black">
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
                  Videos por perfil (máx: {maxVideosPerProfile} videos)
                </label>
                <select
                  value={validVideosPerProfile}
                  onChange={(e) => setVideosPerProfile(Number(e.target.value))}
                  disabled={isLoading || competitors.length === 0 || credits === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {credits === 0 ? (
                    <option value={0}>Sin créditos</option>
                  ) : competitors.length === 0 ? (
                    <option value={50}>Agrega competidores primero</option>
                  ) : getScrapingOptions().length === 0 ? (
                    <option value={0}>Necesitas más créditos</option>
                  ) : (
                    getScrapingOptions().map(option => (
                      <option key={option} value={option}>
                        {option} videos ({Math.ceil((competitors.length * option) / 50)} créditos)
                      </option>
                    ))
                  )}
                </select>
                {competitors.length > 0 && maxVideosPerProfile < 50 && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Necesitas al menos {Math.ceil((competitors.length * 50) / 50)} créditos para scrapear 50 videos por perfil
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Analizar con IA (máx: {maxVideosToAnalyze} videos)
                </label>
                <select
                  value={validAnalyzeTop}
                  onChange={(e) => setAnalyzeTop(Number(e.target.value))}
                  disabled={isLoading || maxVideosToAnalyze === 0 || competitors.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {maxVideosToAnalyze === 0 ? (
                    <option value={0}>Sin créditos suficientes</option>
                  ) : getAnalysisOptions().length === 0 ? (
                    <option value={0}>Necesitas más créditos</option>
                  ) : (
                    getAnalysisOptions().map(option => (
                      <option key={option} value={option}>
                        {option} videos ({Math.ceil(option / 4)} créditos)
                      </option>
                    ))
                  )}
                </select>
                {competitors.length > 0 && maxVideosToAnalyze < 4 && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Necesitas al menos {scrapingCredits + 1} créditos para analizar videos con IA
                  </p>
                )}
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
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-700">Tiempo estimado:</span>
                  <span className="ml-2 font-semibold text-blue-900">~{estimatedTime} minutos</span>
                </div>
                <div>
                  <span className="text-gray-700">Créditos disponibles:</span>
                  <span className="ml-2 font-semibold text-blue-900">{credits}</span>
                </div>
              </div>
              {competitors.length > 0 && (
                <div className="text-sm border-t border-blue-200 pt-3">
                  <p className="font-semibold text-gray-900 mb-2">Estimación de créditos:</p>
                  <div className="space-y-1 text-gray-700">
                    <div className="flex justify-between">
                      <span>Scraping ({competitors.length} perfiles × {validVideosPerProfile} videos):</span>
                      <span className="font-medium">{scrapingCredits} créditos</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Análisis con IA ({validAnalyzeTop} videos):</span>
                      <span className="font-medium">{Math.ceil(validAnalyzeTop / 4)} créditos</span>
                    </div>
                    <div className="flex justify-between font-bold text-blue-900 border-t border-blue-200 pt-1 mt-1">
                      <span>Total necesario:</span>
                      <span>{creditService.estimateCredits({
                        videosAScrappear: competitors.length * validVideosPerProfile,
                        videosAAnalizar: validAnalyzeTop,
                        creditosDisponibles: credits,
                      }).total} créditos</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 border-t border-blue-100 pt-1 mt-1">
                      <span>Créditos restantes para análisis IA:</span>
                      <span className="font-medium">{creditsForAnalysis} ({maxVideosToAnalyze} videos máx)</span>
                    </div>
                  </div>
                  {!creditService.estimateCredits({
                    videosAScrappear: competitors.length * videosPerProfile,
                    videosAAnalizar: analyzeTop,
                    creditosDisponibles: credits,
                  }).tieneCreditos && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
                      ⚠️ Créditos insuficientes. Necesitas {creditService.estimateCredits({
                        videosAScrappear: competitors.length * videosPerProfile,
                        videosAAnalizar: analyzeTop,
                        creditosDisponibles: credits,
                      }).creditosFaltantes} créditos más.
                    </div>
                  )}
                </div>
              )}
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
