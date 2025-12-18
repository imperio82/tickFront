import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Eye, Heart, MessageCircle, Share2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import profileAnalysisService from '../../services/profile-analysis.service';
import type { FilteredVideo } from '../../types/profile-analysis.types';

const VideoSelectionStep = () => {
  const navigate = useNavigate();
  const { analysisId } = useParams<{ analysisId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videos, setVideos] = useState<FilteredVideo[]>([]);
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);

  useEffect(() => {
    loadFilteredVideos();
  }, [analysisId]);

  const loadFilteredVideos = async () => {
    if (!analysisId) {
      toast.error('ID de análisis no válido');
      navigate('/dashboard');
      return;
    }

    try {
      setIsLoading(true);
      const response = await profileAnalysisService.getFilteredVideos(analysisId);
      setVideos(response.videos);
      setRecommendedIds(response.recomendados);

      // Pre-seleccionar los recomendados
      setSelectedVideoIds(response.recomendados.slice(0, 3));

      toast.success(`${response.totalVideos} videos disponibles para análisis`);
    } catch (error: any) {
      console.error('Error al cargar videos:', error);
      toast.error(error.response?.data?.message || 'Error al cargar los videos filtrados');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVideo = (videoId: string) => {
    if (selectedVideoIds.includes(videoId)) {
      setSelectedVideoIds(selectedVideoIds.filter((id) => id !== videoId));
    } else {
      if (selectedVideoIds.length >= 5) {
        toast.error('Máximo 5 videos permitidos');
        return;
      }
      setSelectedVideoIds([...selectedVideoIds, videoId]);
    }
  };

  const handleSubmit = async () => {
    if (selectedVideoIds.length === 0) {
      toast.error('Debes seleccionar al menos 1 video');
      return;
    }

    if (!analysisId) return;

    setIsSubmitting(true);

    try {
      // Paso 4: Iniciar análisis de videos
      const jobResponse = await profileAnalysisService.analyzeVideos(analysisId, {
        selectedVideoIds,
        analysisType: 'detailed',
      });

      // Paso 4.1: Ejecutar procesamiento (solo para testing)
      await profileAnalysisService.processJob(jobResponse.jobId);

      toast.success('Análisis iniciado exitosamente');

      // Redirigir a la pantalla de progreso
      navigate(`/profile-analysis/${analysisId}/progress/${jobResponse.jobId}`);
    } catch (error: any) {
      console.error('Error al iniciar análisis:', error);
      toast.error(
        error.response?.data?.message || 'Error al iniciar el análisis. Intenta nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const estimatedCost = selectedVideoIds.length * 0.3;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando videos filtrados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Selecciona Videos a Analizar</h1>
              <p className="text-sm text-gray-500">
                Hemos ordenado los videos por engagement. Selecciona hasta 5 videos.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Seleccionados:</p>
              <p className="text-2xl font-bold text-purple-600">
                {selectedVideoIds.length} / 5
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Info de recomendados */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-purple-900">
            <strong>Recomendación:</strong> Hemos pre-seleccionado los 3 videos con mejor
            engagement. Puedes cambiar la selección según tu criterio.
          </p>
        </div>

        {/* Grid de videos */}
        <div className="space-y-4">
          {videos.map((video, index) => {
            const isSelected = selectedVideoIds.includes(video.id);
            const isRecommended = recommendedIds.includes(video.id);

            return (
              <div
                key={video.id}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-purple-500 ring-2 ring-purple-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleToggleVideo(video.id)}
              >
                <div className="p-4">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={video.multimedia.coverUrl || video.thumbnail}
                        alt="Video thumbnail"
                        className="w-32 h-48 object-cover rounded-lg"
                      />
                      {isRecommended && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
                          TOP {recommendedIds.indexOf(video.id) + 1}
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        Video #{index + 1}
                      </div>
                    </div>

                    {/* Info del video */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium line-clamp-2 mb-2">
                            {video.texto || 'Sin descripción'}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {video.hashtags.slice(0, 5).map((hashtag, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                              >
                                #{hashtag}
                              </span>
                            ))}
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-6 h-6 text-purple-600 ml-2 flex-shrink-0" />
                        )}
                      </div>

                      {/* Métricas */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-gray-500 text-xs">Vistas</p>
                            <p className="font-semibold text-gray-900">
                              {formatNumber(video.vistas)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Heart className="w-4 h-4 text-pink-400" />
                          <div>
                            <p className="text-gray-500 text-xs">Likes</p>
                            <p className="font-semibold text-gray-900">
                              {formatNumber(video.likes)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MessageCircle className="w-4 h-4 text-blue-400" />
                          <div>
                            <p className="text-gray-500 text-xs">Comentarios</p>
                            <p className="font-semibold text-gray-900">
                              {formatNumber(video.comentarios)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Share2 className="w-4 h-4 text-green-400" />
                          <div>
                            <p className="text-gray-500 text-xs">Compartidos</p>
                            <p className="font-semibold text-gray-900">
                              {formatNumber(video.compartidos)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Engagement */}
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(parseFloat(video.metricas.tasaEngagement), 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-purple-600">
                          {video.metricas.tasaEngagement}% engagement
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer con botones */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Videos seleccionados:</p>
              <p className="text-2xl font-bold text-gray-900">{selectedVideoIds.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Costo estimado:</p>
              <p className="text-2xl font-bold text-gray-900">${estimatedCost.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedVideoIds.length === 0}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Iniciando análisis...
                </>
              ) : (
                <>
                  Analizar Videos →
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSelectionStep;
