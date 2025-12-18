import React from 'react';
import { DamageItem, DamageReport } from '../types';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface Props {
  report: DamageReport;
}

export const DamageList: React.FC<Props> = ({ report }) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Severe':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-200">Severe</span>;
      case 'Moderate':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">Moderate</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">Minor</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col print-expand">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Inspection Results
          {report.damages.length === 0 ? (
             <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Passed</span>
          ) : (
             <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">{report.damages.length} Issues Found</span>
          )}
        </h2>
        <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-100">
          <p className="font-medium text-slate-800 mb-1">AI Summary</p>
          <p>{report.summary}</p>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-4 print-expand">
        {report.damages.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">No Visible Damage</h3>
            <p className="text-slate-500">The AI did not detect any significant damage on the visible parts.</p>
          </div>
        ) : (
          report.damages.map((damage) => (
            <div key={damage.id} className="p-4 rounded-lg border border-slate-100 break-inside-avoid bg-white">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className={
                    damage.severity === 'Severe' ? 'text-red-500' : 
                    damage.severity === 'Moderate' ? 'text-orange-500' : 'text-yellow-500'
                  } />
                  <h3 className="font-semibold text-slate-800">{damage.label}</h3>
                </div>
                {getSeverityBadge(damage.severity)}
              </div>
              <p className="text-sm text-slate-600 mb-3">{damage.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  Confidence: <span className="font-medium text-slate-600">{(damage.confidence * 100).toFixed(1)}%</span>
                </span>
              </div>
              <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 no-print">
                <div 
                  className={`h-1.5 rounded-full ${
                    damage.confidence > 0.8 ? 'bg-green-500' : damage.confidence > 0.5 ? 'bg-blue-500' : 'bg-slate-400'
                  }`}
                  style={{ width: `${damage.confidence * 100}%` }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl break-inside-avoid">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">Parts Inspected</h4>
        <div className="flex flex-wrap gap-2">
          {report.vehicle_parts_visible.map((part, idx) => (
            <span key={idx} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded shadow-sm">
              {part}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};