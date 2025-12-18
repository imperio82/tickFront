import { useState, useEffect } from 'react';
import { Clock, Calendar, Hash, Edit2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import calendarService from '../../services/calendar.service';
import type { ScheduledPost } from '../../types/calendar.types';
import { getStatusColor } from '../../utils/calendar.utils';

interface UpcomingPostsProps {
  days?: number;
  onEdit?: (post: ScheduledPost) => void;
}

const UpcomingPosts = ({ days = 7, onEdit }: UpcomingPostsProps) => {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);

  useEffect(() => {
    loadUpcomingPosts();
  }, [days]);

  const loadUpcomingPosts = async () => {
    setLoading(true);
    try {
      const data = await calendarService.getUpcomingPosts(days);
      setPosts(data);
    } catch (error: any) {
      console.error('Error al cargar próximos posts:', error);
      toast.error('Error al cargar los próximos posts');
    } finally {
      setLoading(false);
    }
  };

  const isToday = (date: Date | string): boolean => {
    const today = new Date();
    const postDate = new Date(date);
    return (
      postDate.getDate() === today.getDate() &&
      postDate.getMonth() === today.getMonth() &&
      postDate.getFullYear() === today.getFullYear()
    );
  };

  const isTomorrow = (date: Date | string): boolean => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const postDate = new Date(date);
    return (
      postDate.getDate() === tomorrow.getDate() &&
      postDate.getMonth() === tomorrow.getMonth() &&
      postDate.getFullYear() === tomorrow.getFullYear()
    );
  };

  const getDateLabel = (date: Date | string): string => {
    if (isToday(date)) return 'Hoy';
    if (isTomorrow(date)) return 'Mañana';
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Cargando...</span>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No hay posts próximos
        </h3>
        <p className="text-gray-600 text-sm">
          No tienes publicaciones programadas para los próximos {days} días
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Próximas Publicaciones
            </h2>
            <p className="text-sm text-gray-600 mt-1">Próximos {days} días</p>
          </div>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            {posts.length} posts
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <div className="space-y-4">
          {posts.map((post, index) => {
            const isPostToday = isToday(post.scheduledDate);
            const isPostTomorrow = isTomorrow(post.scheduledDate);

            return (
              <div key={post.id} className="relative">
                {/* Timeline line */}
                {index < posts.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200"></div>
                )}

                {/* Post item */}
                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div
                    className={`relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isPostToday
                        ? 'bg-red-500 ring-4 ring-red-100'
                        : isPostTomorrow
                        ? 'bg-orange-500 ring-4 ring-orange-100'
                        : 'bg-purple-500'
                    }`}
                  >
                    {isPostToday && <AlertCircle className="w-4 h-4 text-white" />}
                    {!isPostToday && (
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                isPostToday
                                  ? 'bg-red-100 text-red-700'
                                  : isPostTomorrow
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {getDateLabel(post.scheduledDate)}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(post.status)}`}>
                              {post.status === 'scheduled' && 'Programado'}
                              {post.status === 'draft' && 'Borrador'}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-800 mb-1">
                            {post.title}
                          </h3>
                        </div>
                        {onEdit && (
                          <button
                            onClick={() => onEdit(post)}
                            className="p-1.5 text-gray-600 hover:bg-white rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(post.scheduledDate).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {post.sendReminder && (
                          <span className="ml-2 text-xs text-purple-600">
                            🔔 {post.reminderMinutesBefore}min antes
                          </span>
                        )}
                      </div>

                      {/* Hashtags */}
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <Hash className="w-3 h-3 text-gray-400" />
                          {post.hashtags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-xs text-gray-600">
                              {tag}
                              {i < Math.min(post.hashtags.length, 3) - 1 && ','}
                            </span>
                          ))}
                          {post.hashtags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{post.hashtags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Platform */}
                      <div className="mt-2 text-xs text-gray-500 capitalize">
                        {post.platform}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      {posts.length > 0 && (
        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p>
              <strong>Tip:</strong> Los posts marcados como "Hoy" requieren tu atención inmediata.
              Asegúrate de tener el contenido listo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingPosts;
