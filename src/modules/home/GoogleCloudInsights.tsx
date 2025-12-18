import React from 'react';
import {
  Tag,
  Mic,
  Scissors,
  Palette,
  FileText,
  TrendingUp,
  Info,
} from 'lucide-react';
import type { VideoAnalysisResult } from '../../types/profile-analysis.types';

interface GoogleCloudInsightsProps {
  videoAnalysis: VideoAnalysisResult[];
}

export const GoogleCloudInsights: React.FC<GoogleCloudInsightsProps> = ({
  videoAnalysis,
}) => {
  if (!videoAnalysis || videoAnalysis.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Google Cloud Video Intelligence</h3>
        </div>
        <p className="text-sm text-gray-500">No hay datos de análisis de video disponibles</p>
      </div>
    );
  }

  // Consolidar todos los labels de todos los videos
  const allLabels = videoAnalysis.flatMap((video) =>
    video.videoAnalysis.labels || []
  );

  // Agrupar labels por entidad y calcular confianza promedio
  const labelStats = allLabels.reduce((acc, label) => {
    if (!acc[label.entity]) {
      acc[label.entity] = {
        entity: label.entity,
        count: 0,
        totalConfidence: 0,
        categories: new Set<string>(),
      };
    }
    acc[label.entity].count += 1;
    acc[label.entity].totalConfidence += label.confidence;
    label.categories?.forEach((cat) => acc[label.entity].categories.add(cat));
    return acc;
  }, {} as Record<string, { entity: string; count: number; totalConfidence: number; categories: Set<string> }>);

  const topLabels = Object.values(labelStats)
    .map((stat) => ({
      entity: stat.entity,
      avgConfidence: (stat.totalConfidence / stat.count) * 100,
      count: stat.count,
      categories: Array.from(stat.categories),
    }))
    .sort((a, b) => b.avgConfidence - a.avgConfidence)
    .slice(0, 10);

  // Consolidar transcripciones
  const allTranscriptions = videoAnalysis.flatMap((video) =>
    video.videoAnalysis.speechTranscriptions || []
  );

  // Consolidar colores dominantes
  const allColors = videoAnalysis.flatMap((video) =>
    video.videoAnalysis.dominantColors || []
  );
  const uniqueColors = [...new Set(allColors)].slice(0, 8);

  // Consolidar texto detectado
  const allTextDetections = videoAnalysis.flatMap((video) =>
    video.videoAnalysis.textDetections || []
  );
  const uniqueTexts = [...new Set(allTextDetections)].slice(0, 10);

  // Calcular total de cambios de escena
  const totalShotChanges = videoAnalysis.reduce(
    (sum, video) => sum + (video.videoAnalysis.shotChanges?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-gray-900">Google Cloud Video Intelligence</h3>
        </div>
        <p className="text-sm text-gray-600">
          Análisis automático de {videoAnalysis.length} video{videoAnalysis.length > 1 ? 's' : ''} usando IA de Google Cloud
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Etiquetas detectadas */}
        {topLabels.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-gray-900">Etiquetas Detectadas</h4>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {topLabels.map((label, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{label.entity}</p>
                    {label.categories.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {label.categories.slice(0, 2).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{label.count}x</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${label.avgConfidence}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-10 text-right">
                      {label.avgConfidence.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transcripciones de voz */}
        {allTranscriptions.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Mic className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Transcripciones de Audio</h4>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {allTranscriptions.slice(0, 5).map((transcription, idx) => (
                <div key={idx} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <p className="text-sm text-gray-700 mb-2">"{transcription.transcript}"</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {transcription.startTime} - {transcription.endTime}
                    </span>
                    <span className="font-medium">
                      {(transcription.confidence * 100).toFixed(0)}% confianza
                    </span>
                  </div>
                </div>
              ))}
              {allTranscriptions.length > 5 && (
                <p className="text-xs text-gray-500 text-center">
                  +{allTranscriptions.length - 5} transcripciones más
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cambios de escena */}
        {totalShotChanges > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Scissors className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">Cambios de Escena</h4>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">{totalShotChanges}</span>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">
                  Total de cambios detectados
                </p>
                <p className="text-xs text-gray-500">
                  Promedio: {(totalShotChanges / videoAnalysis.length).toFixed(1)} por video
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Colores dominantes */}
        {uniqueColors.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-5 h-5 text-pink-600" />
              <h4 className="font-semibold text-gray-900">Colores Dominantes</h4>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {uniqueColors.map((color, idx) => (
                <div key={idx} className="text-center">
                  <div
                    className="w-full h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  ></div>
                  <p className="text-xs text-gray-600 mt-1 font-mono truncate">{color}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Texto detectado */}
        {uniqueTexts.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-orange-600" />
              <h4 className="font-semibold text-gray-900">Texto Detectado en Videos</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {uniqueTexts.map((text, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-orange-50 text-orange-800 rounded-full text-sm border border-orange-200"
                >
                  {text}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Videos analizados individualmente */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-900 mb-3">
          Detalle por Video ({videoAnalysis.length})
        </h4>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {videoAnalysis.map((video) => (
            <div
              key={video.videoId}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
            >
              <div className="flex items-start gap-3">
                <img
                  src={video.videoData.multimedia.coverUrl}
                  alt="Thumbnail"
                  className="w-20 h-28 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                    {video.videoData.texto || 'Sin descripción'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Labels:</span>{' '}
                      {video.videoAnalysis.labels?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Transcripciones:</span>{' '}
                      {video.videoAnalysis.speechTranscriptions?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Cambios escena:</span>{' '}
                      {video.videoAnalysis.shotChanges?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Colores:</span>{' '}
                      {video.videoAnalysis.dominantColors?.length || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
