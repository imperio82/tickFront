import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Hash,
  Video,
  Download,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import profileAnalysisService from '../../services/profile-analysis.service';
import type { ProfileInsightsResponse } from '../../types/profile-analysis.types';
import { GoogleCloudInsights } from '../home/GoogleCloudInsights';

const InsightsResults = () => {
  const navigate = useNavigate();
  const { analysisId } = useParams<{ analysisId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<ProfileInsightsResponse | null>(null);

  useEffect(() => {
    loadInsights();
  }, [analysisId]);

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

  const loadInsights = async () => {
    if (!analysisId) {
      toast.error('ID de análisis no válido');
      navigate('/dashboard');
      return;
    }

    try {
      setIsLoading(true);
      const response = await profileAnalysisService.getInsights(analysisId);

      // Si parsedInsights es null, intentar parsear rawResponse
      if (!response.geminiInsights?.parsedInsights && response.geminiInsights?.rawResponse) {
        const parsed = parseRawResponse(response.geminiInsights.rawResponse);
        console.log("raw response", response)
        if (parsed) {
          response.geminiInsights.parsedInsights = parsed;
          console.log("parsedInsights parseado desde rawResponse:", parsed);
        }
      }

      setInsights(response);
      toast.success('Insights cargados exitosamente');
    } catch (error: any) {
      console.error('Error al cargar insights:', error);
      toast.error(error.response?.data?.message || 'Error al cargar los insights');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!insights || !insights.geminiInsights?.parsedInsights) return;

    const parsedInsights = insights.geminiInsights.parsedInsights;

    // Crear un reporte en texto
    const report = `
=== REPORTE DE ANÁLISIS DE PERFIL ===

${parsedInsights.resumenGeneral || 'Sin resumen disponible'}

PATRONES IDENTIFICADOS:
${parsedInsights.patronesIdentificados?.map((p, i) => `${i + 1}. ${p}`).join('\n') || 'N/A'}

RECOMENDACIONES:
${parsedInsights.recomendaciones?.map((r, i) => `${i + 1}. ${r}`).join('\n') || 'N/A'}

IDEAS DE CONTENIDO:
${parsedInsights.ideasContenido?.map((idea, i) => `
${i + 1}. ${idea.titulo}
   Concepto: ${idea.concepto}
   Hashtags: ${idea.hashtags.join(', ')}
   Razonamiento: ${idea.razonamiento}
`).join('\n') || 'N/A'}

MEJORAS SUGERIDAS:
${parsedInsights.mejorasSugeridas?.map((m, i) => `${i + 1}. ${m}`).join('\n') || 'N/A'}

Generado: ${new Date().toLocaleString()}
    `;

    // Descargar como archivo
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profile-analysis-${analysisId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Reporte descargado');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando insights...</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No se encontraron insights</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Volver al Dashboard
          </button>
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
            <div className="flex items-center">
              <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Insights del Perfil</h1>
                <p className="text-sm text-gray-500">
                  Análisis profundo generado con Gemini IA
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadReport}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar Reporte
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copiado al portapapeles');
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Compartir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Mensaje de error si no hay insights parseados */}
        {!insights.geminiInsights?.parsedInsights && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <Sparkles className="w-12 h-12 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Los insights no están disponibles
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Los datos de análisis no se pudieron cargar correctamente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setInsights(null);
                    loadInsights();
                  }}
                  className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Recargar
                </button>
                {insights.jobId && analysisId && (
                  <button
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const result = await profileAnalysisService.regenerateInsights(
                          analysisId,
                          insights.jobId!,
                          {
                            guardarVariante: false, // Sobrescribir
                          }
                        );
                        toast.success('Regenerando insights con Gemini...');

                        // Polling del estado
                        const pollInterval = setInterval(async () => {
                          try {
                            const status = await profileAnalysisService.getVideoAnalysisStatus(
                              analysisId,
                              result.jobId
                            );

                            if (status.status === 'completed') {
                              clearInterval(pollInterval);
                              setIsLoading(false);
                              setInsights(null);
                              loadInsights();
                              toast.success('¡Insights regenerados exitosamente!');
                            } else if (status.status === 'failed') {
                              clearInterval(pollInterval);
                              setIsLoading(false);
                              toast.error('Error al regenerar insights');
                            }
                          } catch (error) {
                            clearInterval(pollInterval);
                            setIsLoading(false);
                            toast.error('Error en el proceso');
                          }
                        }, 3000);
                      } catch (error: any) {
                        setIsLoading(false);
                        toast.error(error.response?.data?.message || 'Error al regenerar');
                      }
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Regenerar con Gemini
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resumen General */}
        {insights.geminiInsights?.parsedInsights?.resumenGeneral && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Resumen General</h2>
            </div>
            <p className="text-gray-800 leading-relaxed">
              {insights.geminiInsights.parsedInsights.resumenGeneral}
            </p>
          </div>
        )}

        {/* Patrones Identificados */}
        {insights.geminiInsights?.parsedInsights?.patronesIdentificados?.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Patrones Identificados</h2>
            </div>
            <div className="space-y-3">
              {insights.geminiInsights.parsedInsights.patronesIdentificados.map((pattern, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <p className="text-gray-800">{pattern}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recomendaciones */}
        {insights.geminiInsights?.parsedInsights?.recomendaciones?.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-bold text-gray-900">Recomendaciones</h2>
            </div>
            <div className="space-y-3">
              {insights.geminiInsights.parsedInsights.recomendaciones.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <p className="text-gray-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ideas de Contenido */}
        {insights.geminiInsights?.parsedInsights?.ideasContenido?.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Video className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Ideas de Contenido</h2>
            </div>
            <div className="grid gap-4">
              {insights.geminiInsights.parsedInsights.ideasContenido.map((idea, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{idea.titulo}</h3>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                      Idea #{index + 1}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{idea.concepto}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {idea.hashtags.map((hashtag, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {hashtag}
                      </span>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-600">
                      <strong>Por qué funciona:</strong> {idea.razonamiento}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mejoras Sugeridas (si existen) */}
        {insights.geminiInsights?.parsedInsights?.mejorasSugeridas &&
          insights.geminiInsights.parsedInsights.mejorasSugeridas.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Mejoras Sugeridas</h2>
              </div>
              <div className="space-y-3">
                {insights.geminiInsights.parsedInsights.mejorasSugeridas.map((mejora, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <p className="text-gray-800">{mejora}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Google Cloud Video Intelligence Insights */}
        {insights.videoAnalysis && insights.videoAnalysis.length > 0 && (
          <GoogleCloudInsights videoAnalysis={insights.videoAnalysis} />
        )}

        {/* Análisis de Videos */}
        {insights.videoAnalysis && insights.videoAnalysis.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Video className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Videos Analizados ({insights.videoAnalysis.length})
              </h2>
            </div>
            <div className="space-y-4">
              {insights.videoAnalysis.map((videoResult, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex gap-4">
                    <img
                      src={videoResult.videoData.multimedia.coverUrl}
                      alt="Video thumbnail"
                      className="w-24 h-32 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-2">
                        {videoResult.videoData.texto || 'Sin descripción'}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {videoResult.videoData.hashtags?.slice(0, 3).map((hashtag, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            #{hashtag}
                          </span>
                        ))}
                      </div>
                      {videoResult.videoAnalysis.labels && videoResult.videoAnalysis.labels.length > 0 && (
                        <div className="text-sm">
                          <strong className="text-gray-700">Labels detectados:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {videoResult.videoAnalysis.labels.slice(0, 5).map((label, idx) => (
                              <span
                                key={idx}
                                className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs"
                              >
                                {label.entity} ({Math.round(label.confidence * 100)}%)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón de acción */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Volver al Dashboard
          </button>
          <button
            onClick={() => navigate('/analyze/profile')}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Analizar Otro Perfil
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightsResults;
