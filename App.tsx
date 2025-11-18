import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultsView } from './components/ResultsView';
import { analyzeCheckImage } from './services/geminiService';
import { AnalysisResult, AnalysisStatus, UploadedFile } from './types';
import { Scan, LayoutDashboard, Loader2, X, CheckSquare } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Convert file to base64 helper
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setStatus(AnalysisStatus.UPLOADING);
    
    try {
      const base64 = await fileToBase64(file);
      
      setUploadedFile({
        file,
        previewUrl: URL.createObjectURL(file),
        base64,
        mimeType: file.type
      });

      setStatus(AnalysisStatus.ANALYZING);
      
      // Call Gemini Service
      const analysisData = await analyzeCheckImage(base64, file.type);
      
      setResult(analysisData);
      setStatus(AnalysisStatus.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze the check. Please try again.");
      setStatus(AnalysisStatus.ERROR);
    }
  }, []);

  const reset = () => {
    setStatus(AnalysisStatus.IDLE);
    setUploadedFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="bg-blue-600 p-2 rounded-lg">
               <Scan className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">SentinelCheck AI</h1>
              <p className="text-xs text-slate-500">Automated Fraud Detection</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm text-slate-600 hover:text-blue-600 font-medium">Documentation</button>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-300">
              JS
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero / Status Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            {status === AnalysisStatus.COMPLETE ? 'Analysis Report' : 'Check Extraction & Fraud Screen'}
          </h2>
          <p className="text-slate-500 max-w-2xl">
            Upload a scanned check PDF or image. Our Gemini-powered AI will extract transaction data and analyze security features for potential fraud indicators in real-time.
          </p>
        </div>

        {/* Error Message */}
        {status === AnalysisStatus.ERROR && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-md flex justify-between items-center">
            <div>
              <p className="font-bold text-red-700">Analysis Failed</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button onClick={reset} className="text-red-700 hover:text-red-900">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="space-y-8">
          
          {/* Upload or Preview Area */}
          {status === AnalysisStatus.IDLE && (
             <div className="max-w-2xl mx-auto mt-12">
               <FileUpload onFileSelect={handleFileSelect} />
             </div>
          )}

          {(status === AnalysisStatus.ANALYZING || status === AnalysisStatus.COMPLETE || status === AnalysisStatus.UPLOADING) && uploadedFile && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                 <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                   <LayoutDashboard className="w-4 h-4" />
                   Input Document
                 </h3>
                 {status === AnalysisStatus.COMPLETE && (
                   <button onClick={reset} className="text-sm text-blue-600 hover:underline">
                     Analyze Another
                   </button>
                 )}
              </div>
              
              <div className="relative w-full h-64 bg-slate-100 flex items-center justify-center overflow-hidden">
                 {uploadedFile.mimeType.includes('pdf') ? (
                    <div className="flex flex-col items-center text-slate-400">
                       <CheckSquare className="w-16 h-16 mb-2" />
                       <span className="font-medium">PDF Document Uploaded</span>
                    </div>
                 ) : (
                    <img 
                      src={uploadedFile.previewUrl} 
                      alt="Check Preview" 
                      className="object-contain w-full h-full" 
                    />
                 )}

                 {status === AnalysisStatus.ANALYZING && (
                   <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                      <h3 className="text-lg font-semibold text-blue-900">Analyzing Document...</h3>
                      <p className="text-sm text-blue-600/80">Extracting data and running fraud heuristics</p>
                   </div>
                 )}
              </div>
            </div>
          )}

          {/* Results Area */}
          {status === AnalysisStatus.COMPLETE && result && (
            <ResultsView result={result} />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
