import React from 'react';
import { X, Upload, ScanLine, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">How AutoSpector AI Works</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Upload size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">1. Upload Image</h3>
              <p className="text-slate-600 leading-relaxed">
                Take a photo or upload an existing image of the vehicle. Ensure the area of interest is clearly visible and well-lit for the best results.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <ScanLine size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">2. AI Analysis</h3>
              <p className="text-slate-600 leading-relaxed">
                Our advanced Gemini AI Vision model scans the image to identify specific damages such as scratches, dents, and cracks. It creates precise bounding boxes around each issue.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">3. View Report</h3>
              <p className="text-slate-600 leading-relaxed">
                Get a comprehensive damage report including severity assessment, confidence scores, and a visual map of the detected damages on your vehicle.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};