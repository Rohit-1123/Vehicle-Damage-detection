import React, { useRef, useState, useCallback } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import { analyzeVehicleImage } from '../services/geminiService';
import { DamageReport } from '../types';

interface Props {
  onImageSelected: (base64: string) => void;
  onAnalysisComplete: (report: DamageReport) => void;
  onError: (error: string) => void;
}

export const ImageUploader: React.FC<Props> = ({ onImageSelected, onAnalysisComplete, onError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError('Please upload a valid image file (JPG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      onImageSelected(base64);
      try {
        const result = await analyzeVehicleImage(base64);
        // Attach the image to the report directly to ensure it's available for history
        onAnalysisComplete({ ...result, imageUrl: base64 });
      } catch (err: any) {
        onError(err.message || 'Failed to analyze image.');
      }
    };
    reader.onerror = () => onError('Failed to read file.');
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      onError("Unable to access camera.");
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg');
        
        // Stop stream
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        
        setIsCameraOpen(false);
        onImageSelected(base64);

        // Analyze
        (async () => {
           try {
            const result = await analyzeVehicleImage(base64);
            // Attach image here too
            onAnalysisComplete({ ...result, imageUrl: base64 });
           } catch (err: any) {
             onError(err.message);
           }
        })();
      }
    }
  };

  const closeCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCameraOpen(false);
  };

  return (
    <div className="w-full">
      {isCameraOpen ? (
        <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-6 flex gap-4">
             <button 
              onClick={closeCamera}
              className="p-3 bg-red-600 rounded-full text-white shadow-lg hover:bg-red-700"
            >
              <X size={24} />
            </button>
            <button 
              onClick={capturePhoto}
              className="p-3 bg-white rounded-full text-blue-600 shadow-lg hover:bg-gray-100"
            >
              <div className="w-12 h-12 border-4 border-blue-600 rounded-full flex items-center justify-center">
                 <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div 
          className={`relative border-2 border-dashed rounded-xl p-8 transition-colors text-center ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleChange}
          />
          
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
              <Upload size={32} />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-700">Drag & drop your vehicle image here</p>
              <p className="text-slate-500 text-sm mt-1">Supports JPG, PNG, WEBP</p>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
              >
                Browse Files
              </button>
              <button 
                onClick={startCamera}
                className="px-6 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition flex items-center gap-2"
              >
                <Camera size={18} />
                Use Camera
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};