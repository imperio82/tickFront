import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import profileAnalysisService from '../../services/profile-analysis.service';
import type { ProfileScrapeRequest } from '../../types/profile-analysis.types';

const ProfileAnalysisForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profileUrl, setProfileUrl] = useState('');
  const [resultsPerPage, setResultsPerPage] = useState(50);
  const [loadingStep, setLoadingStep] = useState<'idle' | 'scraping' | 'filtering'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileUrl.trim()) {
      toast.error('Ingresa una URL de perfil de TikTok válida');
      return;
    }

    // Validar que sea una URL válida de TikTok
    const tiktokUrlRegex = /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+/;
    if (!tiktokUrlRegex.test(profileUrl.trim())) {
      toast.error('La URL debe tener el formato: https://www.tiktok.com/@username');
      return;
    }

    setIsLoading(true);

    try {
      // Paso 1: Scrapear perfil
      setLoadingStep('scraping');
      const requestData: ProfileScrapeRequest = {
        profileUrl: profileUrl.trim(),
        resultsPerPage,
      };

      const scrapeResponse = await profileAnalysisService.scrapeProfile(requestData);

      toast.success(`${scrapeResponse.totalVideos} videos obtenidos exitosamente`);

      // Paso 2: Filtrar datos automáticamente
      setLoadingStep('filtering');
      await profileAnalysisService.filterData(scrapeResponse.analysisId);

      toast.success('Datos filtrados. Selecciona los videos a analizar');

      // Paso 3: Redirigir a selección de videos
      navigate(`/profile-analysis/${scrapeResponse.analysisId}/videos`);
    } catch (error: any) {
      console.error('Error al procesar el perfil:', error);
      const errorMessage =
        error.response?.data?.message ||
        'Error al procesar el perfil. Verifica la URL e intenta nuevamente.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingStep('idle');
    }
  };

  const getLoadingMessage = () => {
    switch (loadingStep) {
      case 'scraping':
        return 'Obteniendo videos del perfil...';
      case 'filtering':
        return 'Filtrando y analizando engagement...';
      default:
        return 'Procesando...';
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
            <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Análisis de Perfil Individual</h1>
              <p className="text-sm text-gray-500">
                Analiza un perfil de TikTok con IA para obtener insights profundos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Información del flujo */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">¿Cómo funciona?</h3>
            <ol className="text-sm text-purple-800 space-y-1 ml-4 list-decimal">
              <li>Obtenemos los videos del perfil</li>
              <li>Filtramos y ordenamos por engagement</li>
              <li>Tú seleccionas qué videos analizar</li>
              <li>Analizamos con Google Video Intelligence IA</li>
              <li>Generamos insights accionables con Gemini</li>
            </ol>
          </div>

          {/* URL del perfil */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              URL del perfil de TikTok
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://www.tiktok.com/@username"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ejemplo: https://www.tiktok.com/@charlidamelio
            </p>
          </div>

          {/* Configuración */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-900">
              Configuración:
            </label>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Cantidad de videos a obtener
              </label>
              <select
                value={resultsPerPage}
                onChange={(e) => setResultsPerPage(Number(e.target.value))}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value={30}>30 videos</option>
                <option value={50}>50 videos (recomendado)</option>
                <option value={100}>100 videos</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Más videos = mejor análisis, pero toma más tiempo
              </p>
            </div>
          </div>

          {/* Info de costos */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Scraping del perfil:</span>
                <span className="font-semibold text-gray-900">Gratis</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Análisis con IA:</span>
                <span className="font-semibold text-gray-900">~$0.30 por video</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                El análisis con IA se cobra después de seleccionar los videos
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
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {getLoadingMessage()}
                </>
              ) : (
                <>
                  Continuar →
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileAnalysisForm;
