import React from 'react';
import { FileText, Upload, Edit3, Eye, CheckCircle, Archive } from 'lucide-react';

interface HeaderProps {
  currentStep: 'letterhead' | 'template' | 'editor' | 'preview' | 'saved';
  onStepChange: (step: 'letterhead' | 'template' | 'editor' | 'preview' | 'saved') => void;
  savedDocumentsCount: number;
}

const steps = [
  { id: 'letterhead', name: 'Kop Surat', icon: Upload },
  { id: 'template', name: 'Template', icon: FileText },
  { id: 'editor', name: 'Editor', icon: Edit3 },
  { id: 'preview', name: 'Preview', icon: Eye },
] as const;

function Header({ currentStep, onStepChange, savedDocumentsCount }: HeaderProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-blue-500 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800" >Document Generator</h1></a>
          </div>
          
          <button
            onClick={() => onStepChange('saved')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              currentStep === 'saved'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Archive className="w-5 h-5" />
            Dokumen Tersimpan
            {savedDocumentsCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {savedDocumentsCount}
              </span>
            )}
          </button>
        </div>

        {currentStep !== 'saved' && (
          <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;
            
            return (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center gap-3 cursor-pointer group transition-all duration-200 ${
                    isActive ? 'text-blue-500' : isCompleted ? 'text-emerald-500' : 'text-slate-400'
                  }`}
                  onClick={() => onStepChange(step.id)}
                >
                  <div
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-md'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="font-medium">{step.name}</span>
                </div>
                
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 transition-colors duration-200 ${
                      index < currentStepIndex ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;