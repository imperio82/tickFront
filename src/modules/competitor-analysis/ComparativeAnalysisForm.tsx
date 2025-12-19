import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Award, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import competitorAnalysisService from '../../services/competitor-analysis.service';
import creditService from '../../services/credit.service';
import type { ComparativeAnalysisRequest } from '../../types/competitor-analysis.types';

const ComparativeAnalysisForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [yourProfile, setYourProfile] = useState('');
  const [currentCompetitor, setCurrentCompetitor] = useState('');
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [videosPerProfile, setVideosPerProfile] = useState(50);
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
    if (!currentCompetitor.trim()) {
      toast.error('Ingresa un perfil de competidor válido');
      return;
    }

    let profile = currentCompetitor.trim();
    if (!profile.startsWith('@')) {
      profile = '@' + profile;
    }

    if (competitors.includes(profile)) {
      toast.error('Este perfil ya fue agregado');
      return;
    }

    if (competitors.length >= 5) {
      toast.error('Máximo 5 competidores permitidos');
      return;
    }

    setCompetitors([...competitors, profile]);
    setCurrentCompetitor('');
    toast.success(`${profile} agregado`);
  };

  const handleRemoveCompetitor = (profile: string) => {
    setCompetitors(competitors.filter((c) => c !== profile));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!yourProfile.trim()) {
      toast.error('Debes ingresar tu perfil de TikTok');
      return;
    }

    if (competitors.length === 0) {
      toast.error('Debes agregar al menos 1 competidor para comparar');
      return;
    }

    // Verify credits before submitting
    const totalVideosToScrape = (competitors.length + 1) * videosPerProfile; // +1 for your profile
    const estimate = creditService.estimateCredits({
      videosAScrappear: totalVideosToScrape,
      videosAAnalizar: 0, // Comparative analysis doesn't analyze videos with AI
      creditosDisponibles: credits,
    });

    if (!estimate.tieneCreditos) {
      toast.error(`Créditos insuficientes. Necesitas ${estimate.total} crédito(s) pero solo tienes ${credits}. Redirigiendo a compra de créditos...`);
      setTimeout(() => navigate('/credits'), 2000);
      return;
    }

    setIsLoading(true);

    try {
      let profile = yourProfile.trim();
      if (!profile.startsWith('@')) {
        profile = '@' + profile;
      }

      const requestData: ComparativeAnalysisRequest = {
        yourProfile: profile,
        competitorProfiles: competitors,
        videosPerProfile,
      };

      const response = await competitorAnalysisService.analyzeComparative(requestData);

      toast.success('¡Análisis comparativo completado!');
      navigate(`/analysis/${response.analysisId}`);
    } catch (error: any) {
      console.error('Error al analizar comparativo:', error);
      toast.error(
        error.response?.data?.message || 'Error al realizar el análisis. Intenta nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedTime = Math.ceil(((competitors.length + 1) * videosPerProfile) / 800);

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
            <Award className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Análisis Comparativo</h1>
              <p className="text-sm text-gray-500">
                Compara tu perfil con la competencia y descubre oportunidades de mejora
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-4xl mx-auto px-4 py-8 text-black">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Tu perfil */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Tu perfil de TikTok
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={yourProfile}
                onChange={(e) => setYourProfile(e.target.value)}
                placeholder="@tu_usuario"
                className="w-full pl-10 pr-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Ingresa tu perfil de TikTok para comparar con tus competidores
            </p>
          </div>

          {/* Separador */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">VS</span>
            </div>
          </div>

          {/* Competidores */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Perfiles de competidores
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={currentCompetitor}
                  onChange={(e) => setCurrentCompetitor(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCompetitor();
                    }
                  }}
                  placeholder="@competidor"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <button
                type="button"
                onClick={handleAddCompetitor}
                disabled={isLoading || competitors.length >= 5}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Agregar
              </button>
            </div>

            {competitors.length > 0 && (
              <div className="mt-3 space-y-2">
                {competitors.map((profile, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-green-50 border border-green-200 px-4 py-3 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-green-700 font-medium">{index + 1}.</span>
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
                  <p className="text-sm text-gray-500 mt-2">
                    Puedes agregar hasta {5 - competitors.length} competidores más
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Configuración */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-900">Configuración:</label>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Videos por perfil
              </label>
              <select
                value={videosPerProfile}
                onChange={(e) => setVideosPerProfile(Number(e.target.value))}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value={20}>20 videos</option>
                <option value={30}>30 videos</option>
                <option value={50}>50 videos</option>
                <option value={100}>100 videos</option>
              </select>
              <p className="mt-2 text-xs text-gray-500">
                Total de videos a analizar: {(competitors.length + 1) * videosPerProfile}
              </p>
            </div>
          </div>

          {/* Info sobre comparativo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-gray-700">
              <p className="font-medium text-gray-900 mb-2">¿Qué obtendrás?</p>
              <ul className="space-y-1 text-gray-600">
                <li>✓ Comparación de engagement: Tu perfil vs competencia</li>
                <li>✓ Tus fortalezas y áreas de oportunidad</li>
                <li>✓ Gaps de contenido que puedes aprovechar</li>
                <li>✓ Recomendaciones personalizadas para mejorar</li>
              </ul>
            </div>
          </div>

          {/* Estimación */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-700">Tiempo estimado:</span>
                  <span className="ml-2 font-semibold text-green-900">~{estimatedTime} minutos</span>
                </div>
                <div>
                  <span className="text-gray-700">Créditos disponibles:</span>
                  <span className="ml-2 font-semibold text-green-900">{credits}</span>
                </div>
              </div>
              {yourProfile && competitors.length > 0 && (
                <div className="text-sm border-t border-green-200 pt-3">
                  <p className="font-semibold text-gray-900 mb-2">Estimación de créditos:</p>
                  <div className="space-y-1 text-gray-700">
                    <div className="flex justify-between">
                      <span>Scraping ({(competitors.length + 1) * videosPerProfile} videos):</span>
                      <span className="font-medium">{Math.ceil(((competitors.length + 1) * videosPerProfile) / 50)} créditos</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Análisis con IA:</span>
                      <span className="font-medium">0 créditos</span>
                    </div>
                    <div className="flex justify-between font-bold text-green-900 border-t border-green-200 pt-1 mt-1">
                      <span>Total necesario:</span>
                      <span>{creditService.estimateCredits({
                        videosAScrappear: (competitors.length + 1) * videosPerProfile,
                        videosAAnalizar: 0,
                        creditosDisponibles: credits,
                      }).total} créditos</span>
                    </div>
                  </div>
                  {!creditService.estimateCredits({
                    videosAScrappear: (competitors.length + 1) * videosPerProfile,
                    videosAAnalizar: 0,
                    creditosDisponibles: credits,
                  }).tieneCreditos && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
                      ⚠️ Créditos insuficientes. Necesitas {creditService.estimateCredits({
                        videosAScrappear: (competitors.length + 1) * videosPerProfile,
                        videosAAnalizar: 0,
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
              disabled={isLoading || !yourProfile.trim() || competitors.length === 0}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Comparando...
                </>
              ) : (
                <>
                  <Award className="w-5 h-5" />
                  Iniciar Comparación
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComparativeAnalysisForm;
