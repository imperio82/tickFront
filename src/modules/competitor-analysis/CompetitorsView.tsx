import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { TrendingUp, Users, Hash, BarChart3, Sparkles, ArrowRight, Clock, Target } from 'lucide-react';

const CompetitorsView = () => {
  const navigate = useNavigate();

  const analysisTypes = [
    {
      id: 'competitors',
      title: 'Análisis de Competidores',
      description: 'Analiza perfiles específicos de la competencia para descubrir sus estrategias de contenido',
      icon: Users,
      path: '/analyze/competitors',
      color: 'from-blue-500 to-blue-600',
      features: [
        'Analiza hasta 5 perfiles simultáneamente',
        'Identifica temas y hashtags principales',
        'Descubre patrones de éxito',
        'Obtén sugerencias de contenido',
      ],
      estimatedTime: '2-3 minutos',
    },
    {
      id: 'category',
      title: 'Análisis por Categoría',
      description: 'Descubre tendencias en nichos específicos usando hashtags y palabras clave',
      icon: Hash,
      path: '/analyze/category',
      color: 'from-purple-500 to-purple-600',
      features: [
        'Busca por hashtags o keywords',
        'Analiza hasta 500 videos',
        'Filtra por región y engagement',
        'Identifica oportunidades de contenido',
      ],
      estimatedTime: '1-2 minutos',
    },
    {
      id: 'trending',
      title: 'Análisis de Trending',
      description: 'Analiza los videos más populares del momento en diferentes regiones',
      icon: TrendingUp,
      path: '/analyze/trending',
      color: 'from-pink-500 to-pink-600',
      features: [
        'Videos trending en tiempo real',
        'Filtra por región específica',
        'Detecta patrones virales',
        'Identifica tendencias emergentes',
      ],
      estimatedTime: '1-2 minutos',
    },
    {
      id: 'comparative',
      title: 'Análisis Comparativo',
      description: 'Compara tu perfil directamente con tus competidores principales',
      icon: BarChart3,
      path: '/analyze/comparative',
      color: 'from-orange-500 to-orange-600',
      features: [
        'Compara tu perfil vs competencia',
        'Identifica fortalezas y debilidades',
        'Descubre oportunidades únicas',
        'Recomendaciones personalizadas',
      ],
      estimatedTime: '2-3 minutos',
    },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-4">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Análisis de Competencia</h1>
                  <p className="text-gray-600 mt-1">
                    Descubre qué está funcionando en tu nicho con análisis impulsado por IA
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Info Card */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Analiza a tu Competencia con IA
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Utiliza nuestras herramientas de análisis para entender qué estrategias están
                    funcionando en tu nicho. Obtén insights accionables y sugerencias de contenido
                    personalizadas basadas en datos reales.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Análisis con IA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Resultados en minutos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Sugerencias accionables</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysisTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className={`bg-gradient-to-r ${type.color} p-6`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <Icon className="w-7 h-7 text-black" />
                        </div>
                        <span className="px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm text-black text-xs font-medium rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3 text-black" />
                          {type.estimatedTime}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{type.title}</h3>
                      <p className="text-white text-opacity-90 text-sm">{type.description}</p>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Características:
                      </h4>
                      <ul className="space-y-2 mb-6">
                        {type.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                              <svg
                                className="w-3 h-3 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <button
                        onClick={() => navigate(type.path)}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${type.color} text-white rounded-lg hover:opacity-90 transition-opacity font-medium`}
                      >
                        Iniciar Análisis
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Info */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>💡 Tip:</strong> Para mejores resultados, combina diferentes tipos de
                análisis. Por ejemplo, usa el análisis de categoría para identificar nichos
                prometedores, y luego analiza a los competidores principales en ese nicho.
              </p>
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
};

export default CompetitorsView;
