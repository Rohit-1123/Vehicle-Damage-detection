export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface DamageItem {
  id: string;
  label: string; // e.g., 'Scratch', 'Dent', 'Crack'
  severity: 'Minor' | 'Moderate' | 'Severe';
  confidence: number; // 0.0 - 1.0
  description: string;
  box_2d: number[]; // [ymin, xmin, ymax, xmax] normalized 0-1000
}

export interface DamageReport {
  id?: string;
  date?: string;
  damages: DamageItem[];
  summary: string;
  vehicle_parts_visible: string[];
  total_severity_score: number; // 0 - 100
  imageUrl?: string; // For history
}

export interface User {
  email: string;
  name: string;
}

export type ViewType = 'home' | 'dashboard' | 'login' | 'register' | 'history';

export interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  onAnalysisComplete: (report: DamageReport) => void;
  onError: (error: string) => void;
}

export interface DashboardProps {
  image: string;
  report: DamageReport | null;
  isAnalyzing: boolean;
  onReset: () => void;
  error: string | null;
}