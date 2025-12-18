import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, Download, Video, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import profileAnalysisService from '../../services/profile-analysis.service';
import type { VideoAnalysisJobStatusResponse, VideoAnalysisJobStatus } from '../../types/profile-analysis.types';

const AnalysisProgress = () => {
  const navigate = useNavigate();
  const { analysisId, jobId } = useParams<{ analysisId: string; jobId: string }>();
  const [jobStatus, setJobStatus] = useState<VideoAnalysisJobStatusResponse | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);

  useEffect(() => {
    if (!analysisId || !jobId) {
      toast.error('Parámetros inválidos');
      navigate('/dashboard');
      return;
    }

    // Iniciar polling inmediatamente
    fetchJobStatus();

    // Polling cada 5 segundos
    const interval = setInterval(() => {
      fetchJobStatus();
    }, 5000);

    setPollingInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [analysisId, jobId]);

  const fetchJobStatus = async () => {
    if (!analysisId || !jobId) return;

    try {
      const status = await profileAnalysisService.getVideoAnalysisStatus(analysisId, jobId);
      setJobStatus(status);

      // Si el job está completado o falló, detener polling
      if (status.status === 'completed') {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        toast.success('¡Análisis completado exitosamente!');

        // Redirigir a insights después de 2 segundos
        setTimeout(() => {
          navigate(`/profile-analysis/${analysisId}/insights`);
        }, 2000);
      } else if (status.status === 'failed') {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        toast.error('El análisis ha fallado. Por favor, intenta nuevamente.');
      }
    } catch (error: any) {
      console.error('Error al obtener estado del job:', error);
      // No mostrar toast en cada error de polling para no saturar al usuario
    }
  };

  const getStatusIcon = (status: VideoAnalysisJobStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-12 h-12 text-green-500" />;
      case 'failed':
        return <XCircle className="w-12 h-12 text-red-500" />;
      case 'downloading':
        return <Download className="w-12 h-12 text-blue-500 animate-pulse" />;
      case 'analyzing_videos':
        return <Video className="w-12 h-12 text-purple-500 animate-pulse" />;
      case 'generating_insights':
        return <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse" />;
      default:
        return <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />;
    }
  };

  const getStatusText = (status: VideoAnalysisJobStatus) => {
    switch (status) {
      case 'queued':
        return 'En cola...';
      case 'downloading':
        return 'Descargando videos';
      case 'analyzing_videos':
        return 'Analizando videos con IA';
      case 'generating_insights':
        return 'Generando insights con Gemini';
      case 'completed':
        return '¡Análisis completado!';
      case 'failed':
        return 'Análisis fallido';
      default:
        return 'Procesando...';
    }
  };

  const getStatusColor = (status: VideoAnalysisJobStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'downloading':
        return 'text-blue-600';
      case 'analyzing_videos':
        return 'text-purple-600';
      case 'generating_insights':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!jobStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando estado del análisis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Card principal */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Icono de estado */}
          <div className="flex justify-center mb-6">
            {getStatusIcon(jobStatus.status)}
          </div>

          {/* Título de estado */}
          <h1 className={`text-3xl font-bold text-center mb-2 ${getStatusColor(jobStatus.status)}`}>
            {getStatusText(jobStatus.status)}
          </h1>

          {/* Paso actual */}
          {jobStatus.currentStep && (
            <p className="text-center text-gray-600 mb-8">
              {jobStatus.currentStep}
            </p>
          )}

          {/* Barra de progreso */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progreso</span>
              <span className="text-sm font-medium text-gray-700">{jobStatus.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  jobStatus.status === 'completed'
                    ? 'bg-green-500'
                    : jobStatus.status === 'failed'
                    ? 'bg-red-500'
                    : 'bg-purple-600'
                }`}
                style={{ width: `${jobStatus.progress}%` }}
              >
                {jobStatus.progress > 0 && jobStatus.progress < 100 && (
                  <div className="w-full h-full bg-white/30 animate-pulse"></div>
                )}
              </div>
            </div>
          </div>

          {/* Contador de videos */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Videos Procesados</p>
                <p className="text-3xl font-bold text-purple-600">{jobStatus.videosProcessed}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total de Videos</p>
                <p className="text-3xl font-bold text-gray-900">{jobStatus.videosTotal}</p>
              </div>
            </div>
          </div>

          {/* Video actual */}
          {jobStatus.currentVideo && jobStatus.status !== 'completed' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>Procesando:</strong> {jobStatus.currentVideo}
              </p>
            </div>
          )}

          {/* Error */}
          {jobStatus.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-900">
                <strong>Error:</strong> {jobStatus.error}
              </p>
            </div>
          )}

          {/* Fases del proceso */}
          <div className="space-y-3 mb-8">
            <div className={`flex items-center gap-3 ${jobStatus.progress >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">1. Descargando videos</span>
              {jobStatus.status === 'downloading' && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
            </div>
            <div className={`flex items-center gap-3 ${jobStatus.progress >= 35 ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">2. Analizando con Google Video Intelligence</span>
              {jobStatus.status === 'analyzing_videos' && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
            </div>
            <div className={`flex items-center gap-3 ${jobStatus.progress >= 70 ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">3. Generando insights con Gemini IA</span>
              {jobStatus.status === 'generating_insights' && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
            </div>
            <div className={`flex items-center gap-3 ${jobStatus.progress >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">4. Completado</span>
            </div>
          </div>

          {/* Mensaje de espera */}
          {jobStatus.status !== 'completed' && jobStatus.status !== 'failed' && (
            <div className="text-center text-gray-500 text-sm">
              <p>Este proceso puede tomar varios minutos.</p>
              <p>Puedes cerrar esta ventana, te notificaremos cuando esté listo.</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 mt-8">
            {jobStatus.status === 'completed' ? (
              <button
                onClick={() => navigate(`/profile-analysis/${analysisId}/insights`)}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Ver Insights →
              </button>
            ) : jobStatus.status === 'failed' ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Volver al Dashboard
                </button>
                <button
                  onClick={() => navigate(`/profile-analysis/${analysisId}/videos`)}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  Intentar Nuevamente
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Volver al Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisProgress;
