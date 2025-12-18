import { useState, useEffect } from 'react';
import { BarChart3, Calendar, TrendingUp, Clock, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import calendarService from '../../services/calendar.service';
import type { CalendarStatistics as Stats } from '../../types/calendar.types';
import { getDayName } from '../../utils/calendar.utils';

const CalendarStatistics = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const data = await calendarService.getStatistics();
      setStats(data);
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
      toast.error('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!stats || stats.totalPosts === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No hay estadísticas disponibles
        </h3>
        <p className="text-gray-600">
          Crea algunos posts programados para ver estadísticas sobre tu calendario
        </p>
      </div>
    );
  }

  // Get top days
  const topDays = Object.entries(stats.distributionByDay)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Get top hours
  const topHours = Object.entries(stats.distributionByHour)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Posts */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Total Posts</span>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Hash className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalPosts}</p>
        </div>

        {/* Upcoming */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Próximos</span>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.upcomingPosts}</p>
        </div>

        {/* Published */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Publicados</span>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.publishedPosts}</p>
        </div>

        {/* Posts per week */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Posts/Semana</span>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.averagePostsPerWeek.toFixed(1)}</p>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution by Day */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Distribución por Día
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.distributionByDay)
              .sort((a, b) => {
                const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                return dayOrder.indexOf(a[0]) - dayOrder.indexOf(b[0]);
              })
              .map(([day, count]) => {
                const dayMap: Record<string, number> = {
                  sunday: 0,
                  monday: 1,
                  tuesday: 2,
                  wednesday: 3,
                  thursday: 4,
                  friday: 5,
                  saturday: 6,
                };
                const percentage = (count / stats.totalPosts) * 100;

                return (
                  <div key={day}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {getDayName(dayMap[day])}
                      </span>
                      <span className="text-sm text-gray-600">
                        {count} posts ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Distribution by Hour */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Distribución por Hora
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.distributionByHour)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([hour, count]) => {
                const percentage = (count / stats.totalPosts) * 100;

                return (
                  <div key={hour}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {hour.padStart(2, '0')}:00
                      </span>
                      <span className="text-sm text-gray-600">
                        {count} posts ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Top Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Days */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Días con Más Publicaciones
          </h3>
          <div className="space-y-3">
            {topDays.map(([day, count], index) => {
              const dayMap: Record<string, number> = {
                sunday: 0,
                monday: 1,
                tuesday: 2,
                wednesday: 3,
                thursday: 4,
                friday: 5,
                saturday: 6,
              };
              const medals = ['🥇', '🥈', '🥉'];

              return (
                <div
                  key={day}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{medals[index]}</span>
                    <span className="font-medium text-gray-800">
                      {getDayName(dayMap[day])}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">{count} posts</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Hours */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Horarios Más Usados
          </h3>
          <div className="space-y-3">
            {topHours.map(([hour, count], index) => {
              const medals = ['🥇', '🥈', '🥉'];

              return (
                <div
                  key={hour}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{medals[index]}</span>
                    <span className="font-medium text-gray-800">
                      {hour.padStart(2, '0')}:00
                    </span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">{count} posts</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Optimal Hours Used */}
      {stats.optimalHoursUsed.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Horarios Óptimos Utilizados
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.optimalHoursUsed.map((hour) => (
              <span
                key={hour}
                className="px-3 py-1.5 bg-white rounded-full text-sm font-medium text-purple-700 shadow-sm"
              >
                {hour}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Estos horarios están basados en análisis de engagement de tus videos
          </p>
        </div>
      )}
    </div>
  );
};

export default CalendarStatistics;
