import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Calendar, List, BarChart3, Sparkles, Plus, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import calendarService from '../../services/calendar.service';
import type { ScheduledPost } from '../../types/calendar.types';
import PostCard from './PostCard';
import PostForm from './PostForm';
import CalendarGrid from './CalendarGrid';
import CalendarGenerator from './CalendarGenerator';
import CalendarStatistics from './CalendarStatistics';

type TabType = 'calendar' | 'list' | 'generate' | 'statistics';

const CalendarView = () => {
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get('analysisId');
  const [activeTab, setActiveTab] = useState<TabType>(analysisId ? 'generate' : 'list');
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await calendarService.getPosts();
      setPosts(data);
    } catch (error: any) {
      console.error('Error al cargar posts:', error);
      toast.error('Error al cargar los posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = (initialDate?: Date) => {
    setEditingPost(undefined);
    setSelectedDate(initialDate);
    setShowPostForm(true);
  };

  const handleEditPost = (post: ScheduledPost) => {
    setEditingPost(post.id);
    setSelectedDate(undefined);
    setShowPostForm(true);
  };

  const handleDeletePost = async (post: ScheduledPost) => {
    try {
      await calendarService.deletePost(post.id);
      toast.success('Post eliminado exitosamente');
      loadPosts();
    } catch (error: any) {
      console.error('Error al eliminar post:', error);
      toast.error('Error al eliminar el post');
    }
  };

  const handleFormClose = () => {
    setShowPostForm(false);
    setEditingPost(undefined);
    setSelectedDate(undefined);
  };

  const handleFormSave = () => {
    loadPosts();
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (filterStatus && post.status !== filterStatus) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.description?.toLowerCase().includes(query) ||
        post.hashtags.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const tabs = [
    { id: 'calendar' as TabType, label: 'Calendario', icon: Calendar },
    { id: 'list' as TabType, label: 'Lista', icon: List },
    { id: 'generate' as TabType, label: 'Generar', icon: Sparkles },
    { id: 'statistics' as TabType, label: 'Estadísticas', icon: BarChart3 },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Calendario de Publicaciones</h1>
                  <p className="text-gray-600 mt-1">
                    Gestiona y programa tus publicaciones de contenido
                  </p>
                </div>
                <button
                  onClick={() => handleCreatePost()}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Nuevo Post
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 px-4 py-3 font-medium transition-colors
                        border-b-2 -mb-px
                        ${
                          isActive
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-gray-600 hover:text-gray-800'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* List View */}
            {activeTab === 'list' && (
              <div>
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Buscar por título, descripción o hashtags..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div className="w-full md:w-48">
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                        >
                          <option value="">Todos los estados</option>
                          <option value="draft">Borrador</option>
                          <option value="scheduled">Programado</option>
                          <option value="published">Publicado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Results count */}
                  <div className="mt-3 text-sm text-gray-600">
                    Mostrando {filteredPosts.length} de {posts.length} posts
                  </div>
                </div>

                {/* Posts List */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Cargando posts...</p>
                    </div>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {searchQuery || filterStatus ? 'No se encontraron posts' : 'No hay posts programados'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery || filterStatus
                        ? 'Prueba ajustando los filtros de búsqueda'
                        : 'Comienza creando tu primer post programado'}
                    </p>
                    {!searchQuery && !filterStatus && (
                      <button
                        onClick={() => handleCreatePost()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Crear Primer Post
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onEdit={handleEditPost}
                        onDelete={handleDeletePost}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Calendar View */}
            {activeTab === 'calendar' && (
              <div>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Cargando calendario...</p>
                    </div>
                  </div>
                ) : (
                  <CalendarGrid
                    posts={posts}
                    onDateClick={handleCreatePost}
                    onPostClick={handleEditPost}
                  />
                )}
              </div>
            )}

            {/* Generate View */}
            {activeTab === 'generate' && <CalendarGenerator />}

            {/* Statistics View */}
            {activeTab === 'statistics' && <CalendarStatistics />}
          </div>
        </div>

        {/* Post Form Modal */}
        {showPostForm && (
          <PostForm
            postId={editingPost}
            initialDate={selectedDate}
            onClose={handleFormClose}
            onSave={handleFormSave}
          />
        )}
    </DashboardLayout>
  );
};

export default CalendarView;
