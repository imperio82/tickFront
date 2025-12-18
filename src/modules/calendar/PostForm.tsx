import { useState, useEffect } from 'react';
import { X, Save, Calendar as CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import calendarService from '../../services/calendar.service';
import type { CreatePostDto, PostStatus, PostPlatform } from '../../types/calendar.types';
import { formatDateTimeForInput, formatHashtags, parseHashtags, isDateInPast } from '../../utils/calendar.utils';

interface PostFormProps {
  postId?: string;
  initialDate?: Date;
  onClose: () => void;
  onSave: () => void;
}

const PostForm = ({ postId, initialDate, onClose, onSave }: PostFormProps) => {
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hashtags: '',
    platform: 'tiktok' as PostPlatform,
    scheduledDate: initialDate ? formatDateTimeForInput(initialDate) : '',
    status: 'draft' as PostStatus,
    category: '',
    notes: '',
    sendReminder: true,
    reminderMinutesBefore: 30,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    setLoadingPost(true);
    try {
      const post = await calendarService.getPostById(postId!);
      setFormData({
        title: post.title,
        description: post.description || '',
        hashtags: formatHashtags(post.hashtags),
        platform: post.platform,
        scheduledDate: formatDateTimeForInput(new Date(post.scheduledDate)),
        status: post.status,
        category: post.metadata?.category || '',
        notes: post.metadata?.notes || '',
        sendReminder: post.sendReminder,
        reminderMinutesBefore: post.reminderMinutesBefore,
      });
    } catch (error: any) {
      console.error('Error al cargar post:', error);
      toast.error('Error al cargar el post');
    } finally {
      setLoadingPost(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'La fecha es requerida';
    } else if (isDateInPast(formData.scheduledDate) && formData.status === 'scheduled') {
      newErrors.scheduledDate = 'La fecha debe ser futura para posts programados';
    }

    if (!formData.hashtags.trim()) {
      newErrors.hashtags = 'Agrega al menos un hashtag';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const postData: CreatePostDto = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        hashtags: parseHashtags(formData.hashtags),
        platform: formData.platform,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
        status: formData.status,
        metadata: {
          category: formData.category || undefined,
          notes: formData.notes || undefined,
        },
        sendReminder: formData.sendReminder,
        reminderMinutesBefore: formData.reminderMinutesBefore,
      };

      if (postId) {
        await calendarService.updatePost(postId, postData);
        toast.success('Post actualizado exitosamente');
      } else {
        await calendarService.createPost(postData);
        toast.success('Post creado exitosamente');
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error al guardar post:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el post');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  if (loadingPost) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {postId ? 'Editar Post' : 'Crear Nuevo Post'}
              </h2>
              <p className="text-sm text-gray-600">Programa tu publicación de contenido</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-black">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full px-4 py-2 border text-black rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Tutorial: 5 tips de marketing en TikTok"
            />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Descripción del contenido a publicar"
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hashtags <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.hashtags}
              onChange={(e) => handleChange('hashtags', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.hashtags ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="marketing, tiktok, tips (separados por coma)"
            />
            {errors.hashtags && <p className="text-sm text-red-600 mt-1">{errors.hashtags}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Separar con comas. Puedes incluir o no el símbolo #
            </p>
          </div>

          {/* Row: Platform and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plataforma
              </label>
              <select
                value={formData.platform}
                onChange={(e) => handleChange('platform', e.target.value as PostPlatform)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as PostStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="draft">Borrador</option>
                <option value="scheduled">Programado</option>
                <option value="published">Publicado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha y Hora Programada <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => handleChange('scheduledDate', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.scheduledDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.scheduledDate && (
              <p className="text-sm text-red-600 mt-1">{errors.scheduledDate}</p>
            )}
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="educational, entertaining, promotional"
              />
            </div>

            {/* Reminder */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={formData.sendReminder}
                  onChange={(e) => handleChange('sendReminder', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                Recordatorio (minutos antes)
              </label>
              {formData.sendReminder && (
                <input
                  type="number"
                  value={formData.reminderMinutesBefore}
                  onChange={(e) => handleChange('reminderMinutesBefore', parseInt(e.target.value))}
                  min="5"
                  max="1440"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Notas adicionales sobre la publicación"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {postId ? 'Actualizar' : 'Crear Post'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm;
