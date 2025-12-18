import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import competitorAnalysisService from '../../services/competitor-analysis.service';
import type { TrendingAnalysisRequest } from '../../types/competitor-analysis.types';

const TrendingAnalysisForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [region, setRegion] = useState('US');
  const [numberOfVideos, setNumberOfVideos] = useState(100);
  const [analyzeTop, setAnalyzeTop] = useState(20);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const requestData: TrendingAnalysisRequest = {
        region,
        numberOfVideos,
        analyzeTop,
      };

      const response = await competitorAnalysisService.analyzeTrending(requestData);

      toast.success('¡Análisis completado exitosamente!');
      navigate(`/analysis/${response.analysisId}`);
    } catch (error: any) {
      console.error('Error al analizar trending:', error);
      toast.error(
        error.response?.data?.message || 'Error al realizar el análisis. Intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedTime = Math.ceil((numberOfVideos * analyzeTop) / 2500);

  const regions = [
    { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: 'MX', name: 'México', flag: '🇲🇽' },
    { code: 'ES', name: 'España', flag: '🇪🇸' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱' },
    { code: 'PE', name: 'Perú', flag: '🇵🇪' },
    { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
    { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
    { code: 'FR', name: 'Francia', flag: '🇫🇷' },
    { code: 'DE', name: 'Alemania', flag: '🇩🇪' },
    { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  ];

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
            <Zap className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analizar Videos Trending</h1>
              <p className="text-sm text-gray-500">
                Descubre qué está siendo viral ahora mismo en una región específica
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Selección de Región */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Selecciona una región
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {regions.map((r) => (
                <button
                  key={r.code}
                  type="button"
                  onClick={() => setRegion(r.code)}
                  disabled={isLoading}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    region === r.code
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-3xl mb-2">{r.flag}</div>
                  <div className="text-sm font-medium text-gray-900">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.code}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Configuración */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-900">Configuración:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Número de videos</label>
                <select
                  value={numberOfVideos}
                  onChange={(e) => setNumberOfVideos(Number(e.target.value))}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value={50}>50 videos</option>
                  <option value={100}>100 videos</option>
                  <option value={150}>150 videos</option>
                  <option value={200}>200 videos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Analizar con IA</label>
                <select
                  value={analyzeTop}
                  onChange={(e) => setAnalyzeTop(Number(e.target.value))}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value={10}>10 videos</option>
                  <option value={20}>20 videos</option>
                  <option value={30}>30 videos</option>
                  <option value={50}>50 videos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Info sobre trending */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-medium text-gray-900 mb-1">¿Qué analizaremos?</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Videos que están trending ahora en {regions.find(r => r.code === region)?.name}</li>
                  <li>• Patrones virales y tendencias emergentes</li>
                  <li>• Hashtags y sonidos más populares</li>
                  <li>• Análisis de engagement y alcance</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Estimación */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-700">Tiempo estimado:</span>
                <span className="ml-2 font-semibold text-red-900">~{estimatedTime} minutos</span>
              </div>
              <div>
                <span className="text-gray-700">Costo:</span>
                <span className="ml-2 font-semibold text-red-900">0 créditos</span>
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
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analizando...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Iniciar Análisis
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrendingAnalysisForm;
