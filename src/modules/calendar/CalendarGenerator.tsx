import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import calendarService from '../../services/calendar.service';
import type { OptimalHour, CalendarStrategy } from '../../types/calendar.types';
import { formatDateForInput } from '../../utils/calendar.utils';
import OptimalHoursDisplay from './OptimalHoursDisplay';

interface FormData {
  calendarName: string;
  description: string;
  startDate: string;
  endDate: string;
  postsPerWeek: number;
  strategy: CalendarStrategy;
  preferredDays: number[];
  contentMix: {
    educational: number;
    entertaining: number;
    promotional: number;
  };
  referenceAnalysisId?: string;
}

const CalendarGenerator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingHours, setLoadingHours] = useState(false);
  const [optimalHours, setOptimalHours] = useState<OptimalHour[]>([]);

  const analysisId = searchParams.get('analysisId');

  const [formData, setFormData] = useState<FormData>({
    calendarName: '',
    description: '',
    startDate: formatDateForInput(new Date()),
    endDate: formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // +30 days
    postsPerWeek: 5,
    strategy: 'balanced' as CalendarStrategy,
    preferredDays: [1, 3, 5], // Lunes, Miércoles, Viernes
    contentMix: {
      educational: 50,
      entertaining: 30,
      promotional: 20,
    },
    referenceAnalysisId: analysisId || undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formData.strategy === 'optimal_hours' || analysisId) {
      loadOptimalHours();
    }
  }, [formData.strategy, analysisId]);

  const loadOptimalHours = async () => {
    setLoadingHours(true);
    try {
      const hours = await calendarService.getOptimalHours(10, analysisId || undefined);
      setOptimalHours(hours);
    } catch (error: any) {
      console.error('Error al cargar horarios óptimos:', error);
      if (error.response?.status !== 404) {
        toast.error('Error al cargar horarios óptimos');
      }
    } finally {
      setLoadingHours(false);
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleContentMixChange = (type: keyof FormData['contentMix'], value: number) => {
    setFormData((prev) => ({
      ...prev,
      contentMix: {
        ...prev.contentMix,
        [type]: value,
      },
    }));
  };

  const toggleDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter((d) => d !== day)
        : [...prev.preferredDays, day],
    }));
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.calendarName.trim()) {
      newErrors.calendarName = 'El nombre del calendario es requerido';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de fin es requerida';
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) {
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('📤 Enviando datos al backend:', {
        calendarName: formData.calendarName,
        description: formData.description || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        postsPerWeek: formData.postsPerWeek,
        strategy: formData.strategy,
        preferredDays: formData.preferredDays,
        referenceAnalysisId: formData.referenceAnalysisId,
        contentMix: formData.contentMix,
      });

      const result = await calendarService.generateCalendar({
        calendarName: formData.calendarName,
        description: formData.description || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        postsPerWeek: formData.postsPerWeek,
        strategy: formData.strategy,
        preferredDays: formData.preferredDays,
        referenceAnalysisId: formData.referenceAnalysisId,
        contentMix: formData.contentMix,
      });

      console.log('📥 Respuesta del backend:', result);

      // Check if posts were generated
      if (result.posts.length === 0) {
        toast.error(
          '⚠️ El calendario fue creado pero no se generaron posts. Por favor revisa la configuración del backend.',
          { duration: 6000 }
        );
        console.error('❌ Backend retornó 0 posts. Verificar lógica de generación en el backend.');
      } else {
        toast.success(`¡Calendario creado con ${result.posts.length} posts!`);
      }

      navigate('/calendar');
    } catch (error: any) {
      console.error('Error al generar calendario:', error);
      toast.error(error.response?.data?.message || 'Error al generar el calendario');
    } finally {
      setLoading(false);
    }
  };

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with steps */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/calendar')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Generar Calendario Automático</h1>
            <p className="text-gray-600 text-sm">
              Crea un calendario completo de publicaciones en minutos
            </p>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${
                      s < step
                        ? 'bg-green-500 text-white'
                        : s === step
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    s === step ? 'text-purple-600' : 'text-gray-500'
                  }`}
                >
                  {s === 1 ? 'Básico' : s === 2 ? 'Estrategia' : 'Contenido'}
                </span>
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-5 text-black">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Información Básica
              </h2>
            </div>

            {/* Calendar Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Calendario <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.calendarName}
                onChange={(e) => handleChange('calendarName', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.calendarName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Calendario Enero 2026"
              />
              {errors.calendarName && (
                <p className="text-sm text-red-600 mt-1">{errors.calendarName}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Plan de contenido para el próximo mes"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Info about analysis */}
            {analysisId && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800">
                  <strong>Análisis vinculado:</strong> Este calendario se generará usando los
                  horarios óptimos detectados en tu análisis previo.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Strategy */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Estrategia y Frecuencia
              </h2>
            </div>

            {/* Posts per week */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publicaciones por Semana: {formData.postsPerWeek}
              </label>
              <input
                type="range"
                min="1"
                max="14"
                value={formData.postsPerWeek}
                onChange={(e) => handleChange('postsPerWeek', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1/semana</span>
                <span>14/semana</span>
              </div>
            </div>

            {/* Strategy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Estrategia de Distribución
              </label>
              <div className="space-y-3">
                {[
                  {
                    value: 'balanced' as CalendarStrategy,
                    label: 'Balanceado',
                    desc: 'Distribución uniforme a lo largo del período',
                  },
                  {
                    value: 'optimal_hours' as CalendarStrategy,
                    label: 'Horarios Óptimos',
                    desc: 'Usa los mejores horarios según tus análisis previos',
                  },
                  {
                    value: 'custom' as CalendarStrategy,
                    label: 'Personalizado',
                    desc: 'Define manualmente los días preferidos',
                  },
                ].map((strategy) => (
                  <label
                    key={strategy.value}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.strategy === strategy.value
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="strategy"
                      value={strategy.value}
                      checked={formData.strategy === strategy.value}
                      onChange={(e) => handleChange('strategy', e.target.value as CalendarStrategy)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{strategy.label}</p>
                        <p className="text-sm text-gray-600">{strategy.desc}</p>
                      </div>
                      {formData.strategy === strategy.value && (
                        <Check className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Preferred Days (if custom) */}
            {formData.strategy === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Días Preferidos
                </label>
                <div className="flex flex-wrap gap-2">
                  {dayNames.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => toggleDay(index)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        formData.preferredDays.includes(index)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Show optimal hours if strategy is optimal_hours */}
            {formData.strategy === 'optimal_hours' && (
              <div className="mt-6">
                <OptimalHoursDisplay hours={optimalHours} loading={loadingHours} />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Content Mix */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Mezcla de Contenido
              </h2>
              <p className="text-sm text-gray-600">
                Define el porcentaje de cada tipo de contenido en tu calendario
              </p>
            </div>

            {/* Educational */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Educativo
                </label>
                <span className="text-sm font-semibold text-purple-600">
                  {formData.contentMix.educational}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.contentMix.educational}
                onChange={(e) => handleContentMixChange('educational', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Entertaining */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Entretenimiento
                </label>
                <span className="text-sm font-semibold text-purple-600">
                  {formData.contentMix.entertaining}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.contentMix.entertaining}
                onChange={(e) => handleContentMixChange('entertaining', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Promotional */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Promocional
                </label>
                <span className="text-sm font-semibold text-purple-600">
                  {formData.contentMix.promotional}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.contentMix.promotional}
                onChange={(e) => handleContentMixChange('promotional', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Total validation */}
            {formData.contentMix.educational +
              formData.contentMix.entertaining +
              formData.contentMix.promotional !==
              100 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  El total debe sumar 100%. Actualmente:{' '}
                  {formData.contentMix.educational +
                    formData.contentMix.entertaining +
                    formData.contentMix.promotional}
                  %
                </p>
              </div>
            )}

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-gray-800 mb-3">Resumen</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Calendario:</span>
                  <span className="font-medium">{formData.calendarName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Período:</span>
                  <span className="font-medium">
                    {formData.startDate} → {formData.endDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Publicaciones/semana:</span>
                  <span className="font-medium">{formData.postsPerWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estrategia:</span>
                  <span className="font-medium capitalize">{formData.strategy}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="ml-auto flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={
                loading ||
                formData.contentMix.educational +
                  formData.contentMix.entertaining +
                  formData.contentMix.promotional !==
                  100
              }
              className="ml-auto flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generar Calendario
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarGenerator;
