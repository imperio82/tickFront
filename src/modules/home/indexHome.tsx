import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  CheckCircle2,
  Circle,
  Loader2,
  Play,
  Eye,
  Heart,
  MessageCircle,
  Lightbulb,
  TrendingUp,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from '../../components/Sidebar';
import profileAnalysisService from '../../services/profile-analysis.service';
import creditService from '../../services/credit.service';
import type {
  ProfileAnalysisHistoryItem,
  FilteredVideo,
  ProfileInsightsResponse,
} from '../../types/profile-analysis.types';
import toast from 'react-hot-toast';
import { GoogleCloudInsights } from './GoogleCloudInsights';
import { RegenerateInsightsModal } from './RegenerateInsightsModal';

type AnalysisStep = 'idle' | 'scraping' | 'filtering' | 'selecting' | 'analyzing' | 'completed';

export const HomeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  // Estados del flujo de análisis
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('idle');
  const [profileUrl, setProfileUrl] = useState<string>('');
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [filteredVideos, setFilteredVideos] = useState<FilteredVideo[]>([]);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);

  // Datos de cada paso para mostrar
  const [totalVideosScraped, setTotalVideosScraped] = useState<number>(0);
  const [profileUsername, setProfileUsername] = useState<string>('');

  // Estados de análisis completados
  const [completedAnalyses, setCompletedAnalyses] = useState<ProfileAnalysisHistoryItem[]>([]);
  const [expandedAnalysisId, setExpandedAnalysisId] = useState<string | null>(null);
  const [insightsData, setInsightsData] = useState<Record<string, ProfileInsightsResponse>>({});
  const [loadingInsights, setLoadingInsights] = useState<string | null>(null);

  // Estados de análisis agrupados por paso
  const [scrapedAnalyses, setScrapedAnalyses] = useState<ProfileAnalysisHistoryItem[]>([]); // Scraping completado
  const [filteredAnalyses, setFilteredAnalyses] = useState<ProfileAnalysisHistoryItem[]>([]); // Filtrado completado

  // Estados del modal de regeneración
  const [regenerateModal, setRegenerateModal] = useState<{
    isOpen: boolean;
    analysisId: string | null;
    jobId: string | null;
  }>({ isOpen: false, analysisId: null, jobId: null });

  // Estados para controlar secciones expandidas
  const [isScrapedExpanded, setIsScrapedExpanded] = useState<boolean>(true);
  const [isFilteredExpanded, setIsFilteredExpanded] = useState<boolean>(true);

  // Credit state
  const [credits, setCredits] = useState(0);

  // Cargar créditos
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

  // Cargar análisis al inicio
  useEffect(() => {
    loadCompletedAnalyses();
  }, []);

  // Polling para análisis en progreso
  useEffect(() => {
    if (currentStep === 'analyzing' && analysisId && jobId) {
      const interval = setInterval(async () => {
        try {
          const status = await profileAnalysisService.getVideoAnalysisStatus(analysisId, jobId);
          setAnalysisProgress(status.progress);

          if (status.status === 'completed') {
            clearInterval(interval);
            setCurrentStep('completed');
            toast.success('¡Análisis completado!');
            loadCompletedAnalyses();
            resetForm();
          } else if (status.status === 'failed') {
            clearInterval(interval);
            toast.error('El análisis falló');
            setCurrentStep('idle');
          }
        } catch (error) {
          console.error('Error en polling:', error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [currentStep, analysisId, jobId]);

  const loadCompletedAnalyses = async () => {
    try {
      const response = await profileAnalysisService.getHistory({ limit: 20 });
      console.log("Análisis cargados:", response.analyses);
      console.log("Estados encontrados:", response.analyses.map(a => a.status));

      const completed = response.analyses.filter((a) => a.status === 'completed');
      const scraped = response.analyses.filter((a) => a.status === 'scraped');
      const filtered = response.analyses.filter((a) => a.status === 'filtered');

      console.log("Completados:", completed.length);
      console.log("Scraped:", scraped.length);
      console.log("Filtered:", filtered.length);

      setCompletedAnalyses(completed || []);
      setScrapedAnalyses(scraped || []);
      setFilteredAnalyses(filtered || []);
    } catch (error) {
      console.error('Error al cargar análisis:', error);
    }
  };

  const resetForm = () => {
    setProfileUrl('');
    setAnalysisId(null);
    setJobId(null);
    setFilteredVideos([]);
    setSelectedVideoIds([]);
    setAnalysisProgress(0);
    setTotalVideosScraped(0);
    setProfileUsername('');
    setTimeout(() => setCurrentStep('idle'), 3000);
  };

  // Paso 1: Solo Scraping
  const handleStartScraping = async () => {
    if (!profileUrl.trim()) {
      toast.error('Ingresa una URL de perfil de TikTok válida');
      return;
    }

    const tiktokUrlRegex = /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+/;
    if (!tiktokUrlRegex.test(profileUrl.trim())) {
      toast.error('La URL debe tener el formato: https://www.tiktok.com/@username');
      return;
    }

    // Verify credits before submitting
    const estimate = creditService.estimateCredits({
      videosAScrappear: 50, // Default scraping amount
      videosAAnalizar: 0, // No analysis yet
      creditosDisponibles: credits,
    });

    if (!estimate.tieneCreditos) {
      toast.error(`Créditos insuficientes. Necesitas ${estimate.total} crédito(s) pero solo tienes ${credits}. Redirigiendo a compra de créditos...`);
      setTimeout(() => navigate('/credits'), 2000);
      return;
    }

    try {
      // Extraer username de la URL
      const usernameMatch = profileUrl.match(/@([\w.-]+)/);
      const username = usernameMatch ? usernameMatch[1] : 'Usuario';
      setProfileUsername(username);

      // Scraping
      setCurrentStep('scraping');
      const scrapeResponse = await profileAnalysisService.scrapeProfile({
        profileUrl: profileUrl.trim(),
        resultsPerPage: 50,
      });
      setAnalysisId(scrapeResponse.analysisId);
      setTotalVideosScraped(scrapeResponse.totalVideos);

      // Resetear el formulario y mostrar mensaje
      setCurrentStep('idle');
      setProfileUrl('');
      toast.success(`✅ ${scrapeResponse.totalVideos} videos obtenidos. Ve a "📦 Scrapings Completados" para filtrar.`, {
        duration: 5000,
      });

      // Recargar lista para mostrar el análisis en progreso
      loadCompletedAnalyses();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al procesar el perfil');
      setCurrentStep('idle');
      loadCompletedAnalyses();
    }
  };

  // Paso 2: Filtrado (puede ser llamado independientemente)
  const handleFiltering = async (targetAnalysisId: string) => {
    try {
      setCurrentStep('filtering');
      await profileAnalysisService.filterData(targetAnalysisId);

      // Resetear estado y mostrar mensaje
      setCurrentStep('idle');
      setAnalysisId(null);
      toast.success('✅ Filtrado completado. Ve a "🔍 Filtrados Completados" para seleccionar videos.', {
        duration: 5000,
      });

      // Recargar lista para mostrar el análisis actualizado
      loadCompletedAnalyses();
    } catch (error: any) {
      console.error('Error en filtrado:', error);
      toast.error(error.response?.data?.message || 'Error al filtrar videos');
      setCurrentStep('idle');
      loadCompletedAnalyses();
    }
  };

  // Continuar desde un análisis existente
  const handleContinueAnalysis = async (analysis: ProfileAnalysisHistoryItem) => {
    setAnalysisId(analysis.id);
    setProfileUrl(analysis.profileUrl);

    const usernameMatch = analysis.profileUrl.match(/@([\w.-]+)/);
    const username = usernameMatch ? usernameMatch[1] : 'Usuario';
    setProfileUsername(username);

    // Determinar qué paso continuar
    if (analysis.status === 'scraped' || analysis.status === 'scraping') {
      // Si el scraping terminó, continuar al filtrado
      toast.success('Continuando al filtrado...');
      await handleFiltering(analysis.id);
    } else if (analysis.status === 'filtered' || analysis.status === 'filtering') {
      // Si el filtrado terminó, mostrar selección de videos
      try {
        const videosResponse = await profileAnalysisService.getFilteredVideos(analysis.id);
        setFilteredVideos(videosResponse.videos);
        setSelectedVideoIds(videosResponse.recomendados.slice(0, 3));
        setCurrentStep('selecting');
        toast.success('Videos listos para selección');
      } catch (error: any) {
        console.error('Error:', error);
        toast.error(error.response?.data?.message || 'Error al cargar videos');
      }
    }
  };

  // Paso 2: Analizar videos seleccionados
  const handleAnalyzeVideos = async () => {
    if (!analysisId || selectedVideoIds.length === 0) {
      toast.error('Selecciona al menos 1 video');
      return;
    }

    try {
      setCurrentStep('analyzing');
      const jobResponse = await profileAnalysisService.analyzeVideos(analysisId, {
        selectedVideoIds,
        analysisType: 'detailed',
      });
      setJobId(jobResponse.jobId);

      // Ejecutar procesamiento (testing)
      await profileAnalysisService.processJob(jobResponse.jobId);
      toast.success('Análisis iniciado');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al iniciar análisis');
      setCurrentStep('idle');
    }
  };

  // Toggle video selection
  const handleToggleVideo = (videoId: string) => {
    if (selectedVideoIds.includes(videoId)) {
      setSelectedVideoIds(selectedVideoIds.filter((id) => id !== videoId));
    } else {
      if (selectedVideoIds.length >= 5) {
        toast.error('Máximo 5 videos');
        return;
      }
      setSelectedVideoIds([...selectedVideoIds, videoId]);
    }
  };

  // Función helper para parsear rawResponse cuando parsedInsights es null
  const parseRawResponse = (rawResponse: string) => {
    try {
      // Primero intentar con saltos de línea reales
      let jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/);

      // Si no funciona, intentar con \n como string literal
      if (!jsonMatch) {
        jsonMatch = rawResponse.match(/```json\\n([\s\S]*?)\\n```/);
      }

      if (jsonMatch && jsonMatch[1]) {
        // Reemplazar \n literales por saltos de línea reales si existen
        const jsonString = jsonMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        return JSON.parse(jsonString);
      }

      return null;
    } catch (error) {
      console.error('Error parseando rawResponse:', error);
      console.error('rawResponse recibido:', rawResponse);
      return null;
    }
  };

  // Ver insights de análisis completado
  const handleViewInsights = async (analysisIdParam: string) => {
    if (expandedAnalysisId === analysisIdParam) {
      setExpandedAnalysisId(null);
      return;
    }

    if (insightsData[analysisIdParam]) {
      setExpandedAnalysisId(analysisIdParam);
      return;
    }

    try {
      setLoadingInsights(analysisIdParam);
      const insights = await profileAnalysisService.getInsights(analysisIdParam);
      console.log("insides de la data", insights);

      // Si parsedInsights es null, intentar parsear rawResponse
      if (!insights.geminiInsights?.parsedInsights && insights.geminiInsights?.rawResponse) {
        const parsed = parseRawResponse(insights.geminiInsights.rawResponse);
        if (parsed) {
          insights.geminiInsights.parsedInsights = parsed;
          console.log("parsedInsights parseado desde rawResponse:", parsed);
        }
      }

      setInsightsData((prev) => ({ ...prev, [analysisIdParam]: insights }));
      setExpandedAnalysisId(analysisIdParam);
    } catch (error: any) {
      toast.error('Error al cargar insights');
    } finally {
      setLoadingInsights(null);
    }
  };

  // Manejar regeneración de insights con opciones personalizadas
  const handleRegenerateInsights = async (options: {
    enfoque: 'creativo' | 'conservador' | 'analitico' | 'viral' | 'educativo';
    temperature: number;
    numeroIdeas: number;
    guardarVariante: boolean;
    nombreVariante?: string;
  }) => {
    if (!regenerateModal.analysisId || !regenerateModal.jobId) return;

    try {
      setLoadingInsights(regenerateModal.analysisId);
      const result = await profileAnalysisService.regenerateInsights(
        regenerateModal.analysisId,
        regenerateModal.jobId,
        options
      );

      setRegenerateModal({ isOpen: false, analysisId: null, jobId: null });
      toast.success(`Regenerando insights con enfoque ${options.enfoque}...`);

      // Polling del estado
      const pollInterval = setInterval(async () => {
        try {
          const status = await profileAnalysisService.getVideoAnalysisStatus(
            regenerateModal.analysisId!,
            result.jobId
          );

          if (status.status === 'completed') {
            clearInterval(pollInterval);
            setLoadingInsights(null);
            setInsightsData((prev) => {
              const newData = { ...prev };
              delete newData[regenerateModal.analysisId!];
              return newData;
            });
            await handleViewInsights(regenerateModal.analysisId!);
            toast.success('¡Insights regenerados exitosamente!');
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setLoadingInsights(null);
            toast.error('Error al regenerar insights');
          }
        } catch (error) {
          clearInterval(pollInterval);
          setLoadingInsights(null);
          toast.error('Error en el proceso');
        }
      }, 3000);
    } catch (error: any) {
      setLoadingInsights(null);
      setRegenerateModal({ isOpen: false, analysisId: null, jobId: null });
      toast.error(error.response?.data?.message || 'Error al regenerar');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getStepStatus = (step: AnalysisStep) => {
    const steps: AnalysisStep[] = ['idle', 'scraping', 'filtering', 'selecting', 'analyzing', 'completed'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="min-h-screen bg-gray-50 lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">TikAnalytics MVP</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>

              {/* User Menu - Desktop */}
              <div className="relative pl-3 border-l">
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-800">
                      {user?.nombre || 'Usuario'} {user?.apellido || ''}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.tipoSuscripcion.toLowerCase() || 'gratuita'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold hover:opacity-90 hover:scale-105 transition-all"
                  >
                    {user?.nombre?.[0] || 'U'}
                    {user?.apellido?.[0] || ''}
                  </button>
                </div>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 animate-fadeIn">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/profile');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Mi Perfil</span>
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Cerrar Sesión</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Mobile */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)}>
          <div className="w-64 h-full bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <nav className="space-y-2">
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <Settings className="w-5 h-5" />
                Configuración
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-red-600"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </nav>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ¡Hola, {user?.nombre || 'Usuario'}! 👋
          </h1>
          <p className="text-gray-600">Analiza perfiles de TikTok con inteligencia artificial</p>
        </div>

        {/* Nuevo Análisis - Formulario Dinámico */}
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 rounded-2xl p-8 mb-8 text-white overflow-hidden shadow-2xl animate-fadeInUp">
          {/* Efectos de fondo animados */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute top-1/2 -left-8 w-32 h-32 bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          {/* Contenido */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 animate-slideInLeft">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-md animate-ping"></div>
                <User className="w-8 h-8 relative z-10 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold">Análisis de Perfil con IA</h2>
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>

            <p className="text-purple-100 mb-6 animate-fadeIn delay-200">
              🚀 Obtén insights profundos con Google Video Intelligence y Gemini IA
            </p>

            <div className="flex gap-3 mb-4 animate-fadeIn delay-300">
              <div className="relative flex-1 group">
                {/* Efecto de brillo en el input */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
                <input
                  type="text"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleStartScraping()}
                  placeholder="https://www.tiktok.com/@username"
                  disabled={currentStep !== 'idle'}
                  className="relative w-full px-6 py-4 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:scale-105 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all duration-300 shadow-lg placeholder:text-gray-400"
                />
              </div>

              <button
                onClick={handleStartScraping}
                disabled={currentStep !== 'idle'}
                className="group relative px-8 py-4 bg-white text-purple-600 rounded-xl font-bold overflow-hidden disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
              >
                {/* Efecto de brillo al hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-pink-200 opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>

                <span className="relative flex items-center gap-2">
                  {currentStep === 'scraping' || currentStep === 'filtering' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="animate-pulse">Procesando...</span>
                    </>
                  ) : (
                    <>
                      Analizar
                      <Sparkles className="w-5 h-5 group-hover:animate-spin transition-all" />
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Tags de ejemplo animados */}
            <div className="flex flex-wrap gap-2 animate-fadeIn delay-500">
              <span className="text-xs text-purple-100 flex items-center gap-1">
                <span className="animate-pulse">💡</span> Ejemplo:
              </span>
              {['@charlidamelio', '@kyliejenner', '@therock'].map((username, idx) => (
                <button
                  key={username}
                  onClick={() => setProfileUrl(`https://www.tiktok.com/${username}`)}
                  className="group px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm hover:bg-white/30 hover:scale-110 transition-all duration-300 border border-white/20 hover:border-white/50"
                  style={{ animationDelay: `${600 + idx * 100}ms` }}
                >
                  <span className="group-hover:animate-pulse">{username}</span>
                </button>
              ))}
            </div>

            {/* Indicador de estado animado */}
            {currentStep !== 'idle' && currentStep !== 'selecting' && currentStep !== 'analyzing' && currentStep !== 'completed' && (
              <div className="mt-6 animate-slideInUp">
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {currentStep === 'scraping' && '🎬 Obteniendo videos del perfil...'}
                        {currentStep === 'filtering' && '🔍 Analizando engagement y filtrando...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .animate-fadeInUp {
            animation: fadeInUp 0.6s ease-out;
          }

          .animate-slideInLeft {
            animation: slideInLeft 0.5s ease-out;
          }

          .animate-slideInUp {
            animation: slideInUp 0.4s ease-out;
          }

          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }

          .delay-200 {
            animation-delay: 200ms;
            animation-fill-mode: both;
          }

          .delay-300 {
            animation-delay: 300ms;
            animation-fill-mode: both;
          }

          .delay-500 {
            animation-delay: 500ms;
            animation-fill-mode: both;
          }

          .delay-700 {
            animation-delay: 700ms;
          }

          .delay-1000 {
            animation-delay: 1000ms;
          }
        `}</style>

        {/* Pasos del Proceso - Dinámico */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-bold text-gray-800">Proceso de Análisis</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
          </div>

          <div className="relative">
            {/* Línea de progreso vertical */}
            <div className="absolute left-3 top-8 bottom-8 w-0.5 bg-gray-200">
              <div
                className="w-full bg-gradient-to-b from-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                style={{
                  height: currentStep === 'idle' ? '0%' :
                          currentStep === 'scraping' ? '20%' :
                          currentStep === 'filtering' ? '40%' :
                          currentStep === 'selecting' ? '60%' :
                          currentStep === 'analyzing' ? '80%' : '100%'
                }}
              ></div>
            </div>

            <div className="space-y-6 relative">
              {/* Paso 1: Scraping */}
              <div className={`transition-all duration-500 ${
                getStepStatus('scraping') === 'current' ? 'scale-105' : 'scale-100'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {getStepStatus('scraping') === 'completed' ? (
                      <>
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 relative z-10 animate-bounce" />
                      </>
                    ) : getStepStatus('scraping') === 'current' ? (
                      <>
                        <div className="absolute inset-0 bg-purple-400 rounded-full animate-pulse opacity-30 blur-sm"></div>
                        <Loader2 className="w-6 h-6 text-purple-500 animate-spin flex-shrink-0 relative z-10" />
                      </>
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
                    )}
                  </div>
                  <div className={`flex-1 p-3 rounded-lg transition-all duration-300 ${
                    getStepStatus('scraping') === 'current' ? 'bg-purple-50 border border-purple-200' :
                    getStepStatus('scraping') === 'completed' ? 'bg-green-50 border border-green-200' : ''
                  }`}>
                    <p className="font-semibold text-gray-900">🎬 1. Obtener videos del perfil</p>
                    <p className="text-sm text-gray-500">Scraping con Apify</p>
                  </div>
                </div>
                {/* Información del paso completado */}
                {getStepStatus('scraping') === 'completed' && totalVideosScraped > 0 && (
                  <div className="ml-10 mt-2 animate-slideInUp">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Play className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          {totalVideosScraped} videos obtenidos de @{profileUsername}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Paso 2: Filtrado */}
              <div className={`transition-all duration-500 ${
                getStepStatus('filtering') === 'current' ? 'scale-105' : 'scale-100'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {getStepStatus('filtering') === 'completed' ? (
                      <>
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 relative z-10 animate-bounce" />
                      </>
                    ) : getStepStatus('filtering') === 'current' ? (
                      <>
                        <div className="absolute inset-0 bg-purple-400 rounded-full animate-pulse opacity-30 blur-sm"></div>
                        <Loader2 className="w-6 h-6 text-purple-500 animate-spin flex-shrink-0 relative z-10" />
                      </>
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
                    )}
                  </div>
                  <div className={`flex-1 p-3 rounded-lg transition-all duration-300 ${
                    getStepStatus('filtering') === 'current' ? 'bg-purple-50 border border-purple-200' :
                    getStepStatus('filtering') === 'completed' ? 'bg-green-50 border border-green-200' : ''
                  }`}>
                    <p className="font-semibold text-gray-900">🔍 2. Filtrar por engagement</p>
                    <p className="text-sm text-gray-500">Análisis de métricas</p>
                  </div>
                </div>
                {/* Información del paso completado */}
                {getStepStatus('filtering') === 'completed' && filteredVideos.length > 0 && (
                  <div className="ml-10 mt-2 animate-slideInUp">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-900">
                          Top {filteredVideos.length} videos con mejor engagement listos
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Paso 3: Selección */}
              <div className={`transition-all duration-500 ${
                getStepStatus('selecting') === 'current' ? 'scale-105' : 'scale-100'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {getStepStatus('selecting') === 'completed' ? (
                      <>
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 relative z-10 animate-bounce" />
                      </>
                    ) : getStepStatus('selecting') === 'current' ? (
                      <>
                        <div className="absolute inset-0 bg-purple-400 rounded-full animate-pulse opacity-30 blur-sm"></div>
                        <Loader2 className="w-6 h-6 text-purple-500 animate-spin flex-shrink-0 relative z-10" />
                      </>
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
                    )}
                  </div>
                  <div className={`flex-1 p-3 rounded-lg transition-all duration-300 ${
                    getStepStatus('selecting') === 'current' ? 'bg-purple-50 border border-purple-200 shadow-lg' :
                    getStepStatus('selecting') === 'completed' ? 'bg-green-50 border border-green-200' : ''
                  }`}>
                    <p className="font-semibold text-gray-900">✅ 3. Seleccionar videos</p>
                    <p className="text-sm text-gray-500">Hasta 5 videos para análisis profundo</p>
                  </div>
                </div>
                {/* Información del paso actual */}
                {getStepStatus('selecting') === 'current' && selectedVideoIds.length > 0 && (
                  <div className="ml-10 mt-2 animate-slideInUp">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-yellow-900">
                          {selectedVideoIds.length} video{selectedVideoIds.length > 1 ? 's' : ''} seleccionado{selectedVideoIds.length > 1 ? 's' : ''} para análisis
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {getStepStatus('selecting') === 'completed' && selectedVideoIds.length > 0 && (
                  <div className="ml-10 mt-2 animate-slideInUp">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-900">
                          {selectedVideoIds.length} video{selectedVideoIds.length > 1 ? 's' : ''} enviado{selectedVideoIds.length > 1 ? 's' : ''} a análisis
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Paso 4: Análisis IA */}
              <div className={`transition-all duration-500 ${
                getStepStatus('analyzing') === 'current' ? 'scale-105' : 'scale-100'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {getStepStatus('analyzing') === 'completed' ? (
                      <>
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 relative z-10 animate-bounce" />
                      </>
                    ) : getStepStatus('analyzing') === 'current' ? (
                      <>
                        <div className="absolute inset-0 bg-purple-400 rounded-full animate-pulse opacity-30 blur-sm"></div>
                        <Loader2 className="w-6 h-6 text-purple-500 animate-spin flex-shrink-0 relative z-10" />
                      </>
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
                    )}
                  </div>
                  <div className={`flex-1 p-3 rounded-lg transition-all duration-300 ${
                    getStepStatus('analyzing') === 'current' ? 'bg-purple-50 border border-purple-200' :
                    getStepStatus('analyzing') === 'completed' ? 'bg-green-50 border border-green-200' : ''
                  }`}>
                    <p className="font-semibold text-gray-900">🤖 4. Análisis con IA</p>
                    <p className="text-sm text-gray-500">Google Video Intelligence + Gemini</p>
                  </div>
                </div>
                {/* Información del paso en progreso */}
                {getStepStatus('analyzing') === 'current' && (
                  <div className="ml-10 mt-2 animate-slideInUp">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-900">
                          Analizando {selectedVideoIds.length} video{selectedVideoIds.length > 1 ? 's' : ''} con Google AI y Gemini
                        </span>
                      </div>
                      <div className="relative w-full bg-purple-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 h-2.5 rounded-full transition-all duration-500 animate-pulse"
                          style={{ width: `${analysisProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-purple-600 mt-1 font-medium">
                        {analysisProgress}% completado
                      </p>
                    </div>
                  </div>
                )}
                {getStepStatus('analyzing') === 'completed' && (
                  <div className="ml-10 mt-2 animate-slideInUp">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-900">
                          Análisis IA completado - Insights generados
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Paso 5: Completado */}
              <div className={`transition-all duration-500 ${
                getStepStatus('completed') === 'completed' ? 'scale-105' : 'scale-100'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {getStepStatus('completed') === 'completed' ? (
                      <>
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 relative z-10 animate-bounce" />
                      </>
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
                    )}
                  </div>
                  <div className={`flex-1 p-3 rounded-lg transition-all duration-300 ${
                    getStepStatus('completed') === 'completed' ? 'bg-green-50 border border-green-200 shadow-lg' : ''
                  }`}>
                    <p className="font-semibold text-gray-900">✨ 5. Insights generados</p>
                    <p className="text-sm text-gray-500">Recomendaciones y patrones</p>
                  </div>
                </div>
                {/* Información del paso completado */}
                {getStepStatus('completed') === 'completed' && (
                  <div className="ml-10 mt-2 animate-slideInUp">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Sparkles className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-green-900">
                          ¡Análisis completado con éxito! 🎉
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        El análisis ha sido guardado. Revisa los resultados abajo en "Análisis Completados"
                      </p>
                      <button
                        onClick={() => {
                          const element = document.getElementById('completed-analyses');
                          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        Ver resultados →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selección de Videos */}
        {currentStep === 'selecting' && filteredVideos.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Selecciona Videos ({selectedVideoIds.length}/5)
              </h2>
              <button
                onClick={handleAnalyzeVideos}
                disabled={selectedVideoIds.length === 0}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Analizar Videos Seleccionados
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
              {filteredVideos.slice(0, 5).map((video) => {
                const isSelected = selectedVideoIds.includes(video.id);
                return (
                  <div
                    key={video.id}
                    onClick={() => handleToggleVideo(video.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex gap-4">
                      <img
                        src={video.multimedia.coverUrl}
                        alt="Thumbnail"
                        className="w-24 h-32 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2 line-clamp-2">
                          {video.texto || 'Sin descripción'}
                        </p>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span>{formatNumber(video.vistas)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-pink-400" />
                            <span>{formatNumber(video.likes)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4 text-blue-400" />
                            <span>{formatNumber(video.comentarios)}</span>
                          </div>
                          <div>
                            <span className="text-purple-600 font-semibold">
                              {video.metricas.tasaEngagement}%
                            </span>
                          </div>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-6 h-6 text-purple-600" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Paso 1: Scrapings Completados (Listos para Filtrar) */}
        {scrapedAnalyses.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-green-200 p-6 mb-6 shadow-lg">
            <div
              onClick={() => setIsScrapedExpanded(!isScrapedExpanded)}
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-6 p-6 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    📦 Scrapings Completados
                  </h2>
                  <p className="text-sm text-gray-500">
                    {scrapedAnalyses.length} perfil{scrapedAnalyses.length > 1 ? 'es' : ''} listo{scrapedAnalyses.length > 1 ? 's' : ''} para filtrar
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                  {scrapedAnalyses.length}
                </span>
                {isScrapedExpanded ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>

            {isScrapedExpanded && (
              <div className="mt-6 space-y-3">
                {scrapedAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-green-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{analysis.profileUrl}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(analysis.createdAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleContinueAnalysis(analysis)}
                        className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 shadow hover:shadow-lg"
                      >
                        <Play className="w-4 h-4" />
                        Filtrar Videos
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Paso 2: Filtrados Completados (Listos para Seleccionar Videos) */}
        {filteredAnalyses.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 mb-6 shadow-lg">
            <div
              onClick={() => setIsFilteredExpanded(!isFilteredExpanded)}
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-6 p-6 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    🔍 Filtrados Completados
                  </h2>
                  <p className="text-sm text-gray-500">
                    {filteredAnalyses.length} perfil{filteredAnalyses.length > 1 ? 'es' : ''} listo{filteredAnalyses.length > 1 ? 's' : ''} para seleccionar videos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  {filteredAnalyses.length}
                </span>
                {isFilteredExpanded ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>

            {isFilteredExpanded && (
              <div className="mt-6 space-y-3">
                {filteredAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{analysis.profileUrl}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(analysis.createdAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleContinueAnalysis(analysis)}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow hover:shadow-lg"
                      >
                        <Play className="w-4 h-4" />
                        Seleccionar Videos
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mensaje si no hay análisis pausados */}
        {scrapedAnalyses.length === 0 && filteredAnalyses.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 text-center">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No hay scrapings listos para continuar</p>
            <p className="text-sm text-gray-400 mt-1">Inicia un nuevo análisis arriba</p>
          </div>
        )}

        {/* Análisis Completados */}
        <div id="completed-analyses" className="bg-white rounded-2xl border border-gray-200 p-6 scroll-mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Análisis Completados ({completedAnalyses.length})
          </h2>

          {completedAnalyses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No tienes análisis completados aún</p>
              <p className="text-sm">¡Crea tu primer análisis arriba!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedAnalyses.map((analysis) => (
                <div key={analysis.id} className="border border-gray-200 rounded-lg">
                  <div
                    onClick={() => handleViewInsights(analysis.id)}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{analysis.profileUrl}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(analysis.createdAt).toLocaleDateString('es-ES')} •{' '}
                            {analysis.videosAnalyzed || 0} videos analizados
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                          Completado
                        </span>
                        {expandedAnalysisId === analysis.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Insights expandidos */}
                  {expandedAnalysisId === analysis.id && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                      {loadingInsights === analysis.id ? (
                        <div className="text-center py-4">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                        </div>
                      ) : insightsData[analysis.id] ? (
                        <div className="space-y-4">
                          {/* Mensaje de error si no hay insights parseados */}
                          {!insightsData[analysis.id]?.geminiInsights?.parsedInsights && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                              <div className="flex flex-col items-center gap-3">
                                <Sparkles className="w-8 h-8 text-yellow-600" />
                                <h4 className="text-sm font-semibold text-gray-900">
                                  Los insights no están disponibles
                                </h4>
                                <p className="text-xs text-gray-600 mb-2">
                                  Los datos de análisis no se pudieron cargar correctamente.
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={async () => {
                                      setInsightsData((prev) => {
                                        const newData = { ...prev };
                                        delete newData[analysis.id];
                                        return newData;
                                      });
                                      await handleViewInsights(analysis.id);
                                    }}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium flex items-center gap-2"
                                  >
                                    <Download className="w-4 h-4" />
                                    Recargar
                                  </button>
                                  {analysis.jobId && (
                                    <button
                                      onClick={() => {
                                        setRegenerateModal({
                                          isOpen: true,
                                          analysisId: analysis.id,
                                          jobId: analysis.jobId!,
                                        });
                                      }}
                                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center gap-2"
                                    >
                                      <Sparkles className="w-4 h-4" />
                                      Regenerar con Gemini
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Resumen */}
                          {insightsData[analysis.id]?.geminiInsights?.parsedInsights?.resumenGeneral && (
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                <h3 className="font-semibold text-gray-900">Resumen</h3>
                              </div>
                              <p className="text-sm text-gray-700">
                                {insightsData[analysis.id].geminiInsights.parsedInsights.resumenGeneral}
                              </p>
                            </div>
                          )}

                          {/* Recomendaciones */}
                          {insightsData[analysis.id]?.geminiInsights?.parsedInsights?.recomendaciones?.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Lightbulb className="w-5 h-5 text-yellow-600" />
                                <h3 className="font-semibold text-gray-900">Recomendaciones</h3>
                              </div>
                              <ul className="space-y-2">
                                {insightsData[analysis.id].geminiInsights.parsedInsights.recomendaciones
                                  .slice(0, 3)
                                  .map((rec, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                      <span className="text-purple-600">•</span>
                                      {rec}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}

                          {/* Patrones */}
                          {insightsData[analysis.id]?.geminiInsights?.parsedInsights?.patronesIdentificados?.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">Patrones Identificados</h3>
                              </div>
                              <ul className="space-y-2">
                                {insightsData[analysis.id].geminiInsights.parsedInsights.patronesIdentificados
                                  .slice(0, 3)
                                  .map((pattern, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                      <span className="text-blue-600">•</span>
                                      {pattern}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}

                          {/* Google Cloud Video Intelligence Insights */}
                          {insightsData[analysis.id]?.videoAnalysis && (
                            <div className="border-t border-gray-200 pt-4">
                              <GoogleCloudInsights
                                videoAnalysis={insightsData[analysis.id].videoAnalysis}
                              />
                            </div>
                          )}

                          <button
                            onClick={() => navigate(`/profile-analysis/${analysis.id}/insights`)}
                            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                          >
                            Ver Análisis Completo
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de regeneración */}
      <RegenerateInsightsModal
        isOpen={regenerateModal.isOpen}
        onClose={() => setRegenerateModal({ isOpen: false, analysisId: null, jobId: null })}
        onRegenerate={handleRegenerateInsights}
        isLoading={loadingInsights !== null}
      />
      </div>
    </>
  );
};
