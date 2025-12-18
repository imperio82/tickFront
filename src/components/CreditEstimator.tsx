import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import creditService from '../services/credit.service';

interface CreditEstimatorProps {
  videosAScrappear: number;
  videosAAnalizar: number;
  currentCredits: number;
  onInsufficientCredits?: () => void;
}

export const CreditEstimator = ({
  videosAScrappear,
  videosAAnalizar,
  currentCredits,
  onInsufficientCredits,
}: CreditEstimatorProps) => {
  const navigate = useNavigate();

  const estimate = useMemo(() => {
    return creditService.estimateCredits({
      videosAScrappear,
      videosAAnalizar,
      creditosDisponibles: currentCredits,
    });
  }, [videosAScrappear, videosAAnalizar, currentCredits]);

  useEffect(() => {
    if (!estimate.tieneCreditos && onInsufficientCredits) {
      onInsufficientCredits();
    }
  }, [estimate.tieneCreditos, onInsufficientCredits]);

  return (
    <div
      className={`rounded-lg border-2 p-5 ${
        !estimate.tieneCreditos
          ? 'bg-red-50 border-red-300'
          : 'bg-green-50 border-green-300'
      }`}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
            !estimate.tieneCreditos ? 'bg-red-100' : 'bg-green-100'
          }`}
        >
          {!estimate.tieneCreditos ? (
            <AlertCircle className="w-6 h-6 text-red-600" />
          ) : (
            <CheckCircle className="w-6 h-6 text-green-600" />
          )}
        </div>
        <div className="flex-1">
          <h4
            className={`text-lg font-bold mb-1 ${
              !estimate.tieneCreditos ? 'text-red-900' : 'text-green-900'
            }`}
          >
            {!estimate.tieneCreditos ? 'Créditos Insuficientes' : 'Créditos Disponibles'}
          </h4>
          <p
            className={`text-sm ${
              !estimate.tieneCreditos ? 'text-red-700' : 'text-green-700'
            }`}
          >
            {!estimate.tieneCreditos
              ? `Te faltan ${estimate.creditosFaltantes} créditos para realizar esta operación`
              : 'Tienes suficientes créditos para continuar'}
          </p>
        </div>
      </div>

      {/* Estimación detallada */}
      <div className="bg-white rounded-lg p-4 space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">
            Scraping ({videosAScrappear} videos):
          </span>
          <span className="font-semibold text-gray-900">
            {estimate.scraping} {estimate.scraping === 1 ? 'crédito' : 'créditos'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">
            Análisis con IA ({videosAAnalizar} videos):
          </span>
          <span className="font-semibold text-gray-900">
            {estimate.analisis} {estimate.analisis === 1 ? 'crédito' : 'créditos'}
          </span>
        </div>

        <div className="border-t border-gray-200 my-2"></div>

        <div className="flex items-center justify-between text-base font-bold">
          <span className="text-gray-900">Total necesario:</span>
          <span className="text-purple-600">
            {estimate.total} {estimate.total === 1 ? 'crédito' : 'créditos'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">Tienes disponible:</span>
          <span className={`font-semibold ${!estimate.tieneCreditos ? 'text-red-600' : 'text-green-600'}`}>
            {currentCredits} {currentCredits === 1 ? 'crédito' : 'créditos'}
          </span>
        </div>
      </div>

      {/* Información adicional */}
      {!estimate.tieneCreditos && (
        <div className="space-y-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-900">
              <strong>💡 Tip:</strong> Un crédito permite scrappear hasta 50 videos y analizar 4
              videos con IA.
            </p>
          </div>

          <button
            onClick={() => navigate('/credits')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <CreditCard className="w-5 h-5" />
            Comprar Créditos
          </button>
        </div>
      )}

      {estimate.tieneCreditos && (
        <div className="flex items-center gap-2 text-sm text-green-700">
          <CheckCircle className="w-4 h-4" />
          <span>Después de esta operación te quedarán {currentCredits - estimate.total} créditos</span>
        </div>
      )}
    </div>
  );
};

export default CreditEstimator;
