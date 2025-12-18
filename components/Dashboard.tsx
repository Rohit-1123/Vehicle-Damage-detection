import React from 'react';
import { DamageReport } from '../types';
import { DamageVisualizer } from './DamageVisualizer';
import { DamageList } from './DamageList';
import { RefreshCw, Download, AlertOctagon, Beaker } from 'lucide-react';

interface Props {
  image: string;
  report: DamageReport | null;
  isAnalyzing: boolean;
  onReset: () => void;
  error: string | null;
}

export const Dashboard: React.FC<Props> = ({ image, report, isAnalyzing, onReset, error }) => {
  if (error) {
    return (
      <div className="max-w-xl mx-auto text-center pt-20">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertOctagon size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Analysis Failed</h2>
        <p className="text-slate-600 mb-8">{error}</p>
        <button 
          onClick={onReset}
          className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const isDemoMode = report?.id?.includes('demo');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">Vehicle Analysis Report</h2>
            {isDemoMode && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                <Beaker size={12} />
                Demo Mode
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-1">
            ID: #{report?.id?.split('-').pop() || Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
        </div>
        <div className="flex gap-3 no-print">
          <button 
            onClick={onReset}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
          >
            <RefreshCw size={18} />
            New Inspection
          </button>
          {report && (
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              onClick={() => window.print()}
            >
              <Download size={18} />
              Export PDF
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 print-stack">
        {/* Left Column: Image Visualization */}
        <div className="space-y-4 break-inside-avoid">
          <div className="relative aspect-[4/3] w-full rounded-xl bg-slate-200 overflow-hidden shadow-sm border border-slate-200 group print-expand">
            {isAnalyzing && !report ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-blue-900 font-medium animate-pulse">Analyzing vehicle structure...</p>
                <p className="text-blue-600/70 text-sm mt-1">Identifying damages</p>
              </div>
            ) : null}
            
            <DamageVisualizer 
              imageUrl={image} 
              damages={report ? report.damages : []} 
            />
          </div>
          
          {report && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Overall Score</p>
                <p className={`text-2xl font-bold ${report.total_severity_score > 50 ? 'text-red-600' : 'text-green-600'}`}>
                  {report.total_severity_score}/100
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Detections</p>
                <p className="text-2xl font-bold text-slate-800">{report.damages.length}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Status</p>
                <p className="text-xl font-bold text-slate-800">
                  {report.total_severity_score < 20 ? 'Excellent' : report.total_severity_score < 50 ? 'Fair' : 'Critical'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Report Details */}
        <div className="h-full min-h-[500px] print-expand">
          {isAnalyzing ? (
             <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
               <div className="h-8 bg-slate-100 rounded w-1/3 mb-6"></div>
               <div className="h-24 bg-slate-100 rounded w-full mb-6"></div>
               <div className="space-y-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="h-20 bg-slate-100 rounded w-full"></div>
                 ))}
               </div>
             </div>
          ) : report ? (
            <DamageList report={report} />
          ) : null}
        </div>
      </div>
    </div>
  );
};