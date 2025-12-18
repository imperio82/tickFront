import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import competitorAnalysisService from '../../services/competitor-analysis.service';
import creditService from '../../services/credit.service';
import type { CategoryAnalysisRequest } from '../../types/competitor-analysis.types';

const CategoryAnalysisForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentHashtag, setCurrentHashtag] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [numberOfVideos, setNumberOfVideos] = useState(200);
  const [analyzeTop, setAnalyzeTop] = useState(30);
  const [region, setRegion] = useState('MX');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    minViews: 10000,
    minEngagementRate: 0.04,
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

  const handleAddHashtag = () => {
    if (!currentHashtag.trim()) {
      toast.error('Ingresa un hashtag válido');
      return;
    }

    let hashtag = currentHashtag.trim();
    if (!hashtag.startsWith('#')) {
      hashtag = '#' + hashtag;
    }

    if (hashtags.includes(hashtag)) {
      toast.error('Este hashtag ya fue agregado');
      return;
    }

    if (hashtags.length >= 5) {
      toast.error('Máximo 5 hashtags permitidos');
      return;
    }

    setHashtags([...hashtags, hashtag]);
    setCurrentHashtag('');
    toast.success(`${hashtag} agregado`);
  };

  const handleRemoveHashtag = (hashtag: string) => {
    setHashtags(hashtags.filter((h) => h !== hashtag));
  };

  const handleAddKeyword = () => {
    if (!currentKeyword.trim()) {
      toast.error('Ingresa una palabra clave válida');
      return;
    }

    const keyword = currentKeyword.trim();

    if (keywords.includes(keyword)) {
      toast.error('Esta palabra clave ya fue agregada');
      return;
    }

    if (keywords.length >= 5) {
      toast.error('Máximo 5 palabras clave permitidas');
      return;
    }

    setKeywords([...keywords, keyword]);
    setCurrentKeyword('');
    toast.success(`"${keyword}" agregado`);
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hashtags.length === 0 && keywords.length === 0) {
      toast.error('Debes agregar al menos 1 hashtag o palabra clave');
      return;
    }

    // Verify credits before submitting
    const estimate = creditService.estimateCredits({
      videosAScrappear: numberOfVideos,
      videosAAnalizar: analyzeTop,
      creditosDisponibles: credits,
    });

    if (!estimate.tieneCreditos) {
      toast.error(`Créditos insuficientes. Necesitas ${estimate.total} créditos pero solo tienes ${credits}. Redirigiendo a compra de créditos...`);
      setTimeout(() => navigate('/credits'), 2000);
      return;
    }

    setIsLoading(true);

    try {
      const requestData: CategoryAnalysisRequest = {
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        keywords: keywords.length > 0 ? keywords : undefined,
        numberOfVideos,
        analyzeTop,
        region,
        filters: {
          minViews: filters.minViews,
          minEngagementRate: filters.minEngagementRate,
        },
      };

      const response = await competitorAnalysisService.analyzeCategory(requestData);

      toast.success('¡Análisis completado exitosamente!');
      navigate(`/analysis/${response.analysisId}`);
    } catch (error: any) {
      console.error('Error al analizar categoría:', error);
      toast.error(
        error.response?.data?.message || 'Error al realizar el análisis. Intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedTime = Math.ceil((numberOfVideos * analyzeTop) / 2000);

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
            <Hash className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analizar Categoría / Hashtags</h1>
              <p className="text-sm text-gray-500">
                Descubre tendencias y contenido popular en categorías específicas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Hashtags */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Hashtags a analizar
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={currentHashtag}
                  onChange={(e) => setCurrentHashtag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHashtag();
                    }
                  }}
                  placeholder="Ej: marketing, emprendimiento"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <button
                type="button"
                onClick={handleAddHashtag}
                disabled={isLoading || hashtags.length >= 5}
                className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Agregar
              </button>
            </div>

            {hashtags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {hashtags.map((hashtag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-800 rounded-lg"
                  >
                    {hashtag}
                    <button
                      type="button"
                      onClick={() => handleRemoveHashtag(hashtag)}
                      disabled={isLoading}
                      className="hover:text-purple-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Palabras clave (opcional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                placeholder='Ej: "marketing digital", "redes sociales"'
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                disabled={isLoading || keywords.length >= 5}
                className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Agregar
              </button>
            </div>

            {keywords.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg"
                  >
                    "{keyword}"
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      disabled={isLoading}
                      className="hover:text-gray-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Configuración */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-900">Configuración:</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Número de videos</label>
                <select
                  value={numberOfVideos}
                  onChange={(e) => setNumberOfVideos(Number(e.target.value))}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value={100}>100 videos</option>
                  <option value={200}>200 videos</option>
                  <option value={300}>300 videos</option>
                  <option value={500}>500 videos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Analizar con IA</label>
                <select
                  value={analyzeTop}
                  onChange={(e) => setAnalyzeTop(Number(e.target.value))}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value={20}>20 videos</option>
                  <option value={30}>30 videos</option>
                  <option value={50}>50 videos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Región</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="MX">México</option>
                  <option value="US">Estados Unidos</option>
                  <option value="ES">España</option>
                  <option value="AR">Argentina</option>
                  <option value="CO">Colombia</option>
                  <option value="CL">Chile</option>
                </select>
              </div>
            </div>

            {/* Filtros avanzados */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estimación de tiempo */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-700">Tiempo estimado:</span>
                <span className="ml-2 font-semibold text-purple-900">~{estimatedTime} minutos</span>
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
              disabled={isLoading || (hashtags.length === 0 && keywords.length === 0)}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
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

export default CategoryAnalysisForm;
