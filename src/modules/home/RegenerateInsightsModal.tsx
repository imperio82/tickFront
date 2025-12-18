import React, { useState } from 'react';
import { X, Sparkles, Shield, BarChart3, Flame, BookOpen } from 'lucide-react';

interface RegenerateInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (options: {
    enfoque: 'creativo' | 'conservador' | 'analitico' | 'viral' | 'educativo';
    temperature: number;
    numeroIdeas: number;
    guardarVariante: boolean;
    nombreVariante?: string;
  }) => void;
  isLoading?: boolean;
}

const enfoques = [
  {
    id: 'analitico' as const,
    name: 'Analítico',
    icon: BarChart3,
    color: 'blue',
    description: 'Insights basados en datos con justificaciones numéricas',
    temperature: 0.5,
  },
  {
    id: 'creativo' as const,
    name: 'Creativo',
    icon: Sparkles,
    color: 'purple',
    description: 'Ideas innovadoras y formatos únicos que destaquen',
    temperature: 0.9,
  },
  {
    id: 'viral' as const,
    name: 'Viral',
    icon: Flame,
    color: 'red',
    description: 'Alto potencial de viralidad con hooks emocionales',
    temperature: 0.8,
  },
  {
    id: 'educativo' as const,
    name: 'Educativo',
    icon: BookOpen,
    color: 'green',
    description: 'Contenido educativo con valor práctico',
    temperature: 0.6,
  },
  {
    id: 'conservador' as const,
    name: 'Conservador',
    icon: Shield,
    color: 'gray',
    description: 'Recomendaciones probadas y de bajo riesgo',
    temperature: 0.4,
  },
];

export const RegenerateInsightsModal: React.FC<RegenerateInsightsModalProps> = ({
  isOpen,
  onClose,
  onRegenerate,
  isLoading = false,
}) => {
  const [selectedEnfoque, setSelectedEnfoque] = useState<typeof enfoques[0]>(enfoques[0]);
  const [temperature, setTemperature] = useState(0.7);
  const [numeroIdeas, setNumeroIdeas] = useState(5);
  const [guardarVariante, setGuardarVariante] = useState(false);
  const [nombreVariante, setNombreVariante] = useState('');

  if (!isOpen) return null;

  const handleEnfoqueChange = (enfoque: typeof enfoques[0]) => {
    setSelectedEnfoque(enfoque);
    setTemperature(enfoque.temperature);
  };

  const handleSubmit = () => {
    onRegenerate({
      enfoque: selectedEnfoque.id,
      temperature,
      numeroIdeas,
      guardarVariante,
      nombreVariante: guardarVariante ? nombreVariante || `Variante ${selectedEnfoque.name}` : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Regenerar Insights</h2>
              <p className="text-sm text-gray-500">Personaliza el análisis con Gemini IA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Selección de Enfoque */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Enfoque del Análisis
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {enfoques.map((enfoque) => {
                const Icon = enfoque.icon;
                const isSelected = selectedEnfoque.id === enfoque.id;
                return (
                  <button
                    key={enfoque.id}
                    onClick={() => handleEnfoqueChange(enfoque)}
                    disabled={isLoading}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? `border-${enfoque.color}-500 bg-${enfoque.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`w-5 h-5 flex-shrink-0 ${
                          isSelected ? `text-${enfoque.color}-600` : 'text-gray-400'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">{enfoque.name}</div>
                        <div className="text-xs text-gray-600">{enfoque.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Control de Temperatura */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-900">
                Nivel de Creatividad
              </label>
              <span className="text-sm font-medium text-purple-600">{temperature.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Conservador</span>
              <span>Balanceado</span>
              <span>Muy Creativo</span>
            </div>
          </div>

          {/* Número de Ideas */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Cantidad de Ideas de Contenido
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="10"
                value={numeroIdeas}
                onChange={(e) => setNumeroIdeas(parseInt(e.target.value))}
                disabled={isLoading}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 disabled:opacity-50"
              />
              <span className="text-sm font-medium text-gray-900 w-8 text-center">
                {numeroIdeas}
              </span>
            </div>
          </div>

          {/* Guardar Variante */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="guardarVariante"
                checked={guardarVariante}
                onChange={(e) => setGuardarVariante(e.target.checked)}
                disabled={isLoading}
                className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
              />
              <div className="flex-1">
                <label
                  htmlFor="guardarVariante"
                  className="text-sm font-semibold text-gray-900 cursor-pointer"
                >
                  Guardar como variante (no sobrescribir)
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Mantiene el análisis actual y guarda este como una alternativa
                </p>
                {guardarVariante && (
                  <input
                    type="text"
                    value={nombreVariante}
                    onChange={(e) => setNombreVariante(e.target.value)}
                    placeholder={`Variante ${selectedEnfoque.name}`}
                    disabled={isLoading}
                    className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Regenerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Regenerar Insights
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
