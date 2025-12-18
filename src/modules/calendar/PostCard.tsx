import { Edit2, Trash2, Clock, Calendar, Hash } from 'lucide-react';
import type { ScheduledPost } from '../../types/calendar.types';
import { formatDateReadable, getStatusColor } from '../../utils/calendar.utils';

interface PostCardProps {
  post: ScheduledPost;
  onEdit: (post: ScheduledPost) => void;
  onDelete: (post: ScheduledPost) => void;
}

const PostCard = ({ post, onEdit, onDelete }: PostCardProps) => {
  const statusColor = getStatusColor(post.status);

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este post?')) {
      onDelete(post);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{post.title}</h3>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
            >
              {post.status === 'draft' && 'Borrador'}
              {post.status === 'scheduled' && 'Programado'}
              {post.status === 'published' && 'Publicado'}
              {post.status === 'cancelled' && 'Cancelado'}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              {post.platform}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(post)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      {post.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.description}</p>
      )}

      {/* Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex items-start gap-2 mb-3">
          <Hash className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="flex flex-wrap gap-1">
            {post.hashtags.slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {post.hashtags.length > 5 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{post.hashtags.length - 5} más
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          {/* Scheduled Date */}
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDateReadable(post.scheduledDate)}</span>
          </div>

          {/* Reminder */}
          {post.sendReminder && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{post.reminderMinutesBefore}min antes</span>
            </div>
          )}
        </div>

        {/* Category (if exists) */}
        {post.metadata?.category && (
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {post.metadata.category}
          </span>
        )}
      </div>

      {/* Notes (if exists) */}
      {post.metadata?.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 italic line-clamp-1">
            Nota: {post.metadata.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default PostCard;
