import { Clock, TrendingUp, Users } from 'lucide-react';
import type { OptimalHour } from '../../types/calendar.types';
import { getDayName, formatTime } from '../../utils/calendar.utils';

interface OptimalHoursDisplayProps {
  hours: OptimalHour[];
  loading?: boolean;
}

const OptimalHoursDisplay = ({ hours, loading = false }: OptimalHoursDisplayProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Analizando horarios óptimos...</span>
        </div>
      </div>
    );
  }

  if (hours.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No hay datos disponibles
        </h3>
        <p className="text-gray-600 text-sm">
          Necesitas tener análisis previos para calcular horarios óptimos
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Mejores Horarios para Publicar
            </h2>
            <p className="text-sm text-gray-600">
              Basado en el engagement de tus videos analizados
            </p>
          </div>
        </div>
      </div>

      {/* Hours List */}
      <div className="p-6">
        <div className="space-y-3">
          {hours.map((hour, index) => {
            const percentage = Math.round((hour.score / 100) * 100);

            return (
              <div
                key={`${hour.dayOfWeek}-${hour.hour}`}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Rank */}
                <div className="flex-shrink-0">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : index === 1
                          ? 'bg-gray-200 text-gray-700'
                          : index === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-purple-50 text-purple-700'
                      }
                    `}
                  >
                    #{index + 1}
                  </div>
                </div>

                {/* Time info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="font-semibold text-gray-800">
                      {getDayName(hour.dayOfWeek)} a las {formatTime(hour.hour)}
                    </span>
                  </div>

                  {/* Score bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{(hour.averageEngagement * 100).toFixed(2)}% engagement</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{hour.sampleSize} videos analizados</span>
                    </div>
                    <div className="font-medium text-purple-600">
                      Score: {hour.score}/100
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer tip */}
      <div className="px-6 pb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">💡</span>
              </div>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Tip:</p>
              <p>
                Estos horarios están calculados basándose en el engagement promedio de los
                videos publicados en estas franjas horarias. Puedes usar esta información para
                programar tus publicaciones y maximizar el alcance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimalHoursDisplay;
