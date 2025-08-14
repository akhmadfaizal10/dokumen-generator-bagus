import React, { useState } from 'react';
import { FileText, Upload, Edit3, Eye, Download, Settings } from 'lucide-react';
import { getUserData, saveUserData, getUserId, getLetterheads, saveLetterhead, getSavedDocuments, saveDocument, deleteDocument } from './utils/storage';
import Header from './components/Header';
import LetterheadUpload from './components/LetterheadUpload';
import LetterheadCreator from './components/LetterheadCreator';
import DocumentTemplates from './components/DocumentTemplates';
import DocumentEditor from './components/DocumentEditor';
import DocumentPreview from './components/DocumentPreview';
import SavedDocuments from './components/SavedDocuments';

export interface Letterhead {
  id: string;
  name: string;
  type: 'uploaded' | 'manual';
  imageUrl?: string;
  pdfUrl?: string;
  base64Data?: string;
  fileType?: string;
  imageUrl?: string; // For cropped letterhead images
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  logoBase64?: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'letter' | 'invoice' | 'report' | 'memo';
  description: string;
  icon: React.ComponentType<any>;
}

export interface DocumentData {
  title: string;
  content: string;
  recipient?: string;
  date: string;
  subject?: string;
  template: DocumentTemplate;
  letterhead?: Letterhead;
  signature?: {
    name: string;
    position: string;
    signatureImage?: string;
  };
}

export interface SavedDocument {
  id: string;
  name: string;
  data: DocumentData;
  createdAt: string;
  updatedAt: string;
}

function App() {
  const [currentStep, setCurrentStep] = useState<'letterhead' | 'template' | 'editor' | 'preview' | 'saved'>('letterhead');
  const [letterheadMode, setLetterheadMode] = useState<'upload' | 'create'>('upload');
  const [selectedLetterhead, setSelectedLetterhead] = useState<Letterhead | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [documentData, setDocumentData] = useState<DocumentData>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    template: {} as DocumentTemplate,
  });

  const [letterheads, setLetterheads] = useState<Letterhead[]>([]);
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([]);
  const [userId] = useState<string>(getUserId());

  // Load saved data from localStorage on component mount
  React.useEffect(() => {
    const loadedLetterheads = getLetterheads();
    const loadedDocuments = getSavedDocuments();
    setLetterheads(loadedLetterheads);
    setSavedDocuments(loadedDocuments);
  }, []);

  const handleLetterheadCreated = (letterhead: Letterhead) => {
    saveLetterhead(letterhead);
    const updatedLetterheads = getLetterheads();
    setLetterheads(updatedLetterheads);
    setSelectedLetterhead(letterhead);
  };

  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setDocumentData({ ...documentData, template, letterhead: selectedLetterhead || undefined });
  };

  const handleSaveDocument = () => {
    const savedDoc: SavedDocument = {
      id: Date.now().toString(),
      name: documentData.title || 'Dokumen Tanpa Judul',
      data: documentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    saveDocument(savedDoc);
    const updatedDocuments = getSavedDocuments();
    setSavedDocuments(updatedDocuments);
    alert('Dokumen berhasil disimpan!');
  };

  const handleLoadDocument = (savedDoc: SavedDocument) => {
    setDocumentData(savedDoc.data);
    setSelectedTemplate(savedDoc.data.template);
    setSelectedLetterhead(savedDoc.data.letterhead || null);
    setCurrentStep('editor');
  };

  const handleDeleteDocument = (id: string) => {
    deleteDocument(id);
    const updatedDocuments = getSavedDocuments();
    setSavedDocuments(updatedDocuments);
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'letterhead':
        setCurrentStep('template');
        break;
      case 'template':
        setCurrentStep('editor');
        break;
      case 'editor':
        setCurrentStep('preview');
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'template':
        setCurrentStep('letterhead');
        break;
      case 'editor':
        setCurrentStep('template');
        break;
      case 'preview':
        setCurrentStep('editor');
        break;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'letterhead':
        return selectedLetterhead !== null;
      case 'template':
        return selectedTemplate !== null;
      case 'editor':
        return documentData.title && documentData.content;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header 
        currentStep={currentStep} 
        onStepChange={setCurrentStep}
        savedDocumentsCount={savedDocuments.length}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {currentStep === 'letterhead' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Setup Kop Surat</h2>
              <p className="text-slate-600 text-lg">Upload kop surat dari PDF atau buat secara manual</p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="bg-white p-1 rounded-lg shadow-sm border">
                <button
                  onClick={() => setLetterheadMode('upload')}
                  className={`px-6 py-3 rounded-md transition-all duration-200 flex items-center gap-2 ${
                    letterheadMode === 'upload'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  Upload PDF
                </button>
                <button
                  onClick={() => setLetterheadMode('create')}
                  className={`px-6 py-3 rounded-md transition-all duration-200 flex items-center gap-2 ${
                    letterheadMode === 'create'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Edit3 className="w-5 h-5" />
                  Buat Manual
                </button>
              </div>
            </div>

            {letterheadMode === 'upload' ? (
              <LetterheadUpload
                onLetterheadCreated={handleLetterheadCreated}
                selectedLetterhead={selectedLetterhead}
                onLetterheadSelect={setSelectedLetterhead}
                existingLetterheads={letterheads.filter(l => l.type === 'uploaded')}
              />
            ) : (
              <LetterheadCreator
                onLetterheadCreated={handleLetterheadCreated}
                selectedLetterhead={selectedLetterhead}
                onLetterheadSelect={setSelectedLetterhead}
                existingLetterheads={letterheads.filter(l => l.type === 'manual')}
              />
            )}

            <div className="flex justify-end mt-8">
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Lanjutkan
                <FileText className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 'template' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Pilih Template Dokumen</h2>
              <p className="text-slate-600 text-lg">Pilih jenis dokumen yang ingin dibuat</p>
            </div>

            <DocumentTemplates
              selectedTemplate={selectedTemplate}
              onTemplateSelect={handleTemplateSelect}
            />

            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="px-8 py-3 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Kembali
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Lanjutkan
                <Edit3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 'editor' && selectedTemplate && (
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Edit Dokumen</h2>
              <p className="text-slate-600 text-lg">Isi konten dokumen {selectedTemplate.name}</p>
            </div>

            <DocumentEditor
              documentData={documentData}
              onDocumentChange={setDocumentData}
              template={selectedTemplate}
            />

            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="px-8 py-3 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Kembali
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Preview
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 'preview' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Preview Dokumen</h2>
              <p className="text-slate-600 text-lg">Periksa dokumen sebelum diunduh</p>
            </div>

            <DocumentPreview 
              documentData={documentData} 
              onSaveDocument={handleSaveDocument}
            />

            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="px-8 py-3 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Edit Dokumen
              </button>
            </div>
          </div>
        )}

        {currentStep === 'saved' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Dokumen Tersimpan</h2>
              <p className="text-slate-600 text-lg">Kelola dokumen yang telah Anda simpan</p>
            </div>

            <SavedDocuments
              savedDocuments={savedDocuments}
              onLoadDocument={handleLoadDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;