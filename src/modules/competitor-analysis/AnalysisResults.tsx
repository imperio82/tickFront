import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Star,
  TrendingUp,
  Hash,
  CheckCircle,
  Lightbulb,
  Calendar,
  Bookmark,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import competitorAnalysisService from '../../services/competitor-analysis.service';
import type { DetailedAnalysisResponse } from '../../types/competitor-analysis.types';
import AnalysisLoading from '../../components/AnalysisLoading';

const AnalysisResults = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'hashtags' | 'practices' | 'suggestions' | 'comparison'>(
    'insights'
  );
  const [analysis, setAnalysis] = useState<DetailedAnalysisResponse | null>(null);

  useEffect(() => {
    if (id) {
      fetchAnalysis(id);
    }
  }, [id]);

  const fetchAnalysis = async (analysisId: string) => {
    try {
      setLoading(true);
      const data = await competitorAnalysisService.getById(analysisId);
      setAnalysis(data);
    } catch (error: any) {
      console.error('Error al obtener análisis:', error);
      toast.error('Error al cargar el análisis');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    toast.success('Exportando a PDF... (función en desarrollo)');
    // TODO: Implementar exportación PDF
  };

  if (loading || !analysis) {
    return <AnalysisLoading progress={75} currentStep="Cargando resultados..." />;
  }

  const { insights, suggestions, summary } = analysis;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al Dashboard
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </button>
          </div>
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Resultados: Análisis de Competencia
              </h1>
              <p className="text-sm text-gray-500">
                {summary.competitorsAnalyzed} competidores · {summary.totalVideos} videos · {summary.analyzedVideos} analizados con IA
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Perfil Ganador */}
        {insights.topProfiles && insights.topProfiles.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <Star className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 mb-2">⭐ Perfil Ganador</h2>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-xl font-bold text-gray-900 mb-2">
                    {insights.topProfiles[0].username}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                    <span>
                      <strong>Engagement:</strong> {(insights.topProfiles[0].avgEngagement * 100).toFixed(1)}%
                    </span>
                    <span>
                      <strong>Videos:</strong> {insights.topProfiles[0].totalVideos}
                    </span>
                    <span>
                      <strong>Top tema:</strong> {insights.topProfiles[0].topTopic}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('insights')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'insights'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Insights
              </button>
              <button
                onClick={() => setActiveTab('hashtags')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'hashtags'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Hash className="w-4 h-4 inline mr-2" />
                Hashtags
              </button>
              <button
                onClick={() => setActiveTab('practices')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'practices'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Prácticas
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'suggestions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Lightbulb className="w-4 h-4 inline mr-2" />
                Sugerencias ({suggestions.length})
              </button>
              {analysis.comparison && (
                <button
                  onClick={() => setActiveTab('comparison')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'comparison'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Comparación
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Insights */}
            {activeTab === 'insights' && (
              <div className="space-y-6">
                {/* Top Temas */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Top Temas Identificados
                  </h3>
                  <div className="space-y-3">
                    {insights.topTopics.map((topic, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {index + 1}. {topic.topic}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Engagement: {(topic.avgEngagement * 100).toFixed(1)}%
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">{topic.frequency} videos</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(topic.frequency / insights.topTopics[0].frequency) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Análisis de Duración */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Análisis de Duración</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Duración Óptima</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {insights.durationAnalysis.optimal.min}-{insights.durationAnalysis.optimal.max}s
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Mediana</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {insights.durationAnalysis.optimal.median}s
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Promedio</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {insights.durationAnalysis.avgDuration.toFixed(1)}s
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Hashtags */}
            {activeTab === 'hashtags' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-blue-600" />
                  Hashtags Más Efectivos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.topHashtags.map((hashtag, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-lg font-bold text-blue-600">{hashtag.hashtag}</p>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {hashtag.usage} usos
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-700">
                        <p>
                          <strong>Views promedio:</strong> {hashtag.avgViews.toLocaleString()}
                        </p>
                        <p>
                          <strong>Engagement:</strong> {(hashtag.avgEngagement * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Mejores Prácticas */}
            {activeTab === 'practices' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Mejores Prácticas Detectadas
                  </h3>
                  <ul className="space-y-2">
                    {insights.bestPractices.map((practice, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-800">{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Patrones en Tendencia
                  </h3>
                  <ul className="space-y-2">
                    {insights.trendingPatterns.map((pattern, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-800">{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tab: Sugerencias */}
            {activeTab === 'suggestions' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Sugerencias de Contenido
                </h3>
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-gray-500 font-medium">#{index + 1}</span>
                            <h4 className="text-lg font-bold text-gray-900">{suggestion.title}</h4>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                suggestion.estimatedEngagement === 'high'
                                  ? 'bg-green-100 text-green-800'
                                  : suggestion.estimatedEngagement === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {suggestion.estimatedEngagement.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{suggestion.description}</p>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">🎯 Audiencia: </span>
                          <span className="text-gray-600">{suggestion.targetAudience}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">🏷️ Hashtags: </span>
                          <span className="text-blue-600">
                            {suggestion.suggestedHashtags.join(' ')}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">💡 Razón: </span>
                          <span className="text-gray-600">{suggestion.reasoning}</span>
                        </div>
                        {suggestion.inspirationFrom && (
                          <div>
                            <span className="font-medium text-gray-700">✨ Inspirado en: </span>
                            <span className="text-gray-600">{suggestion.inspirationFrom}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => toast.success('Guardado en favoritos')}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          <Bookmark className="w-4 h-4" />
                          Guardar
                        </button>
                        <button
                          onClick={() => toast.success('Agregado al calendario')}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Calendar className="w-4 h-4" />
                          Programar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Comparación */}
            {activeTab === 'comparison' && analysis.comparison && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Comparación de Perfiles</h3>

                {/* Tu Perfil */}
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-6 h-6 text-green-600" />
                    Tu Perfil
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Engagement Promedio</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {(analysis.comparison.yourProfile.avgEngagement * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Top Temas</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.comparison.yourProfile.topTopics.map((topic, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-200 text-green-900 text-sm font-medium rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {analysis.comparison.yourProfile.strengths && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">💪 Fortalezas:</p>
                      <ul className="space-y-1">
                        {analysis.comparison.yourProfile.strengths.map((strength, index) => (
                          <li key={index} className="text-gray-700 flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Competencia */}
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-red-600" />
                    Competencia
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Engagement Promedio</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {(analysis.comparison.competitors.avgEngagement * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Top Temas</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.comparison.competitors.topTopics.map((topic, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-200 text-red-900 text-sm font-medium rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {analysis.comparison.competitors.opportunities && (
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">🎯 Oportunidades:</p>
                      <ul className="space-y-1">
                        {analysis.comparison.competitors.opportunities.map((opportunity, index) => (
                          <li key={index} className="text-gray-700 flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-orange-600 flex-shrink-0 mt-1" />
                            {opportunity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Recomendaciones */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">📋 Recomendaciones Personalizadas</h4>
                  <ul className="space-y-3">
                    {analysis.comparison.recommendations.map((recommendation, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200"
                      >
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="text-gray-800">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </button>
          <button
            onClick={() => navigate('/analyze/competitors')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Nuevo Análisis
            <TrendingUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
