import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ImageUploader } from './components/ImageUploader';
import { Dashboard } from './components/Dashboard';
import { AuthForms } from './components/AuthForms';
import { History } from './components/History';
import { HowItWorksModal } from './components/HowItWorksModal';
import { DamageReport, User, ViewType } from './types';
import { ShieldCheck } from 'lucide-react';

// Utility to create a thumbnail to save storage space
const createThumbnail = (base64Image: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      // Limit width to 300px for history thumbnails
      const maxWidth = 300;
      const scale = maxWidth / img.width;
      const newWidth = maxWidth;
      const newHeight = img.height * scale;
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        // Compress to 0.7 quality jpeg
        resolve(canvas.toDataURL('image/jpeg', 0.7)); 
      } else {
        resolve(base64Image); // Fallback if canvas fails
      }
    };
    img.onerror = () => resolve(base64Image); // Fallback
    img.src = base64Image;
  });
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [user, setUser] = useState<User | null>(null);
  
  const [report, setReport] = useState<DamageReport | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DamageReport[]>([]);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Load user and history from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('autospector_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedHistory = localStorage.getItem('autospector_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
        localStorage.removeItem('autospector_history');
      }
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('autospector_user', JSON.stringify(newUser));
    setCurrentView('home');
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('autospector_user');
    setCurrentView('home');
  };

  const handleNavigate = (view: ViewType) => {
    if (view === 'history' && !user) {
      setCurrentView('login');
      return;
    }
    setCurrentView(view);
    
    if (view === 'home') {
      handleReset();
    }
  };

  const handleAnalysisStart = (image: string) => {
    setCurrentImage(image);
    setAnalyzing(true);
    setReport(null);
    setError(null);
    setCurrentView('dashboard');
  };

  const handleAnalysisComplete = async (data: DamageReport) => {
    setReport(data);
    setAnalyzing(false);
    
    // Save to history if logged in
    if (user) {
      try {
        // Use the image attached to the report, or fallback to state
        const imageToSave = data.imageUrl || currentImage;
        
        let thumbnail = undefined;
        if (imageToSave) {
          // Generate a thumbnail for storage to avoid LocalStorage quota limits
          thumbnail = await createThumbnail(imageToSave);
        }

        const newReport: DamageReport = { 
          ...data, 
          imageUrl: thumbnail, 
          date: new Date().toISOString() 
        };
        
        const updatedHistory = [newReport, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('autospector_history', JSON.stringify(updatedHistory));
      } catch (e) {
        console.error("Failed to save history:", e);
        // Optionally alert user that history couldn't be saved due to storage limits
      }
    }
  };

  const handleAnalysisError = (err: string) => {
    setError(err);
    setAnalyzing(false);
  };

  const handleReset = () => {
    setReport(null);
    setCurrentImage(null);
    setError(null);
    setCurrentView('home');
  };

  const handleHistorySelect = (selectedReport: DamageReport) => {
    setReport(selectedReport);
    // When loading from history, use the stored thumbnail as the current image
    setCurrentImage(selectedReport.imageUrl || null);
    setCurrentView('dashboard');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'login':
        return <AuthForms onLogin={handleLogin} onCancel={() => setCurrentView('home')} initialView="login" />;
      case 'register':
        return <AuthForms onLogin={handleLogin} onCancel={() => setCurrentView('home')} initialView="register" />;
      case 'history':
        return <History reports={history} onSelectReport={handleHistorySelect} />;
      case 'dashboard':
        return (
          <Dashboard 
            image={currentImage || ''}
            report={report}
            isAnalyzing={analyzing}
            onReset={handleReset}
            error={error}
          />
        );
      case 'home':
      default:
        return (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                AI-Powered Vehicle Inspection
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Upload a photo of your vehicle to instantly detect scratches, dents, cracks, and other damages using advanced computer vision.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
              <ImageUploader 
                onImageSelected={handleAnalysisStart}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleAnalysisError}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-semibold text-lg mb-2">Instant Detection</h3>
                <p className="text-slate-500 text-sm">Detects multiple types of damage in seconds with high precision.</p>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Detailed Reports</h3>
                <p className="text-slate-500 text-sm">Get comprehensive classification including severity and location.</p>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Confidence Scoring</h3>
                <p className="text-slate-500 text-sm">AI provides confidence scores for every detected issue.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-900">
      <Navbar 
        user={user} 
        onNavigate={handleNavigate} 
        onSignOut={handleSignOut}
        onOpenHowItWorks={() => setShowHowItWorks(true)}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {renderContent()}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} AutoSpector AI. </p>
        </div>
      </footer>

      <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
    </div>
  );
};

export default App;