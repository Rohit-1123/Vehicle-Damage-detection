import React from 'react';
import { DamageReport } from '../types';
import { Calendar, AlertTriangle, ArrowRight, Search } from 'lucide-react';

interface HistoryProps {
  reports: DamageReport[];
  onSelectReport: (report: DamageReport) => void;
}

export const History: React.FC<HistoryProps> = ({ reports, onSelectReport }) => {
  if (reports.length === 0) {
    return (
      <div className="text-center py-20 max-w-lg mx-auto">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search size={40} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No History Found</h2>
        <p className="text-slate-500">
          You haven't performed any vehicle inspections yet. Upload an image to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Calendar className="text-blue-600" />
        Inspection History
      </h2>
      
      <div className="grid gap-4">
        {reports.map((report) => (
          <div 
            key={report.id} 
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition cursor-pointer flex flex-col md:flex-row gap-6 items-center"
            onClick={() => onSelectReport(report)}
          >
            <div className="w-full md:w-48 h-32 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
              {report.imageUrl ? (
                <img src={report.imageUrl} alt="Vehicle" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                   No Image
                </div>
              )}
            </div>
            
            <div className="flex-grow text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                <span className="text-sm text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded inline-block">
                  {new Date(parseInt(report.id?.split('-').pop() || Date.now().toString())).toLocaleDateString()}
                </span>
                <span className={`text-sm font-bold ${
                   report.total_severity_score < 20 ? 'text-green-600' : 
                   report.total_severity_score < 50 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  Score: {report.total_severity_score}/100
                </span>
              </div>
              
              <p className="text-slate-800 font-semibold mb-1 line-clamp-1">{report.summary}</p>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 justify-center md:justify-start">
                 <span className="flex items-center gap-1">
                   <AlertTriangle size={14} />
                   {report.damages.length} Issues
                 </span>
                 <span>
                   {report.vehicle_parts_visible.slice(0, 3).join(', ')}
                   {report.vehicle_parts_visible.length > 3 ? '...' : ''}
                 </span>
              </div>
            </div>

            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition flex-shrink-0">
              <ArrowRight size={24} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};