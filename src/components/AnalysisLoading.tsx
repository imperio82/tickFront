import { Loader2, CheckCircle, Clock } from 'lucide-react';

interface AnalysisLoadingProps {
  progress?: number;
  currentStep?: string;
  estimatedTime?: number;
  tip?: string;
}

const AnalysisLoading = ({
  progress = 50,
  currentStep = 'Analizando videos...',
  estimatedTime = 3,
  tip = 'El 80% de los videos virales tienen hooks en los primeros 3 segundos',
}: AnalysisLoadingProps) => {
  const steps = [
    { label: 'Scrapeando videos', completed: progress > 25 },
    { label: 'Filtrando por engagement', completed: progress > 50 },
    { label: 'Analizando con IA', completed: progress > 75 },
    { label: 'Generando sugerencias', completed: progress >= 100 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analizando...</h2>
            <p className="text-gray-600">Por favor espera mientras procesamos tu solicitud</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{currentStep}</span>
              <span className="text-sm font-semibold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                {step.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : index === Math.floor((progress / 100) * steps.length) ? (
                  <div className="w-5 h-5 flex-shrink-0">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    step.completed
                      ? 'text-gray-900 font-medium'
                      : index === Math.floor((progress / 100) * steps.length)
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Estimated Time */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4" />
              <span>Tiempo estimado: {estimatedTime} minutos</span>
            </div>
          </div>

          {/* Tip */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  💡
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Mientras esperas:</p>
                <p className="text-sm text-gray-700">{tip}</p>
              </div>
            </div>
          </div>

          {/* Cancel Button (opcional) */}
          {/* <button className="w-full mt-6 px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
            Cancelar
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default AnalysisLoading;
