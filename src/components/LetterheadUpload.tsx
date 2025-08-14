import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, ChevronDown, Trash2, Edit } from 'lucide-react';
import { Letterhead } from '../App';
import { fileToBase64, base64ToBlob, deleteLetterhead } from '../utils/storage';
import PDFCropper from './PDFCropper';

interface LetterheadUploadProps {
  onLetterheadCreated: (letterhead: Letterhead) => void;
  selectedLetterhead: Letterhead | null;
  onLetterheadSelect: (letterhead: Letterhead | null) => void;
  existingLetterheads: Letterhead[];
}

function LetterheadUpload({
  onLetterheadCreated,
  selectedLetterhead,
  onLetterheadSelect,
  existingLetterheads
}: LetterheadUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [fileToProcess, setFileToProcess] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setFileToProcess(file);
      setShowCropper(true);
    } else {
      alert('Silakan upload file PDF saja');
    }
  }, []);

  const handleCropComplete = async (croppedImageData: string, cropName: string) => {
    if (!fileToProcess) return;

    try {
      setUploadProgress(0);
      setShowCropper(false);
      
      // Convert original file to base64 for storage
      const base64Data = await fileToBase64(fileToProcess);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return 0;
          if (prev >= 100) {
            clearInterval(interval);
            // Create letterhead object with cropped image
            const newLetterhead: Letterhead = {
              id: Date.now().toString(),
              name: cropName,
              type: 'uploaded',
              pdfUrl: base64ToBlob(base64Data),
              base64Data,
              fileType: fileToProcess.type,
              imageUrl: croppedImageData, // Store cropped image
            };
            onLetterheadCreated(newLetterhead);
            onLetterheadSelect(newLetterhead);
            setUploadProgress(null);
            setUploadedFile(fileToProcess);
            setFileToProcess(null);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Terjadi kesalahan saat memproses file');
      setUploadProgress(null);
      setShowCropper(false);
      setFileToProcess(null);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setFileToProcess(null);
  };

  const handleDeleteLetterhead = (letterheadId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('Yakin ingin menghapus kop surat ini?')) {
      deleteLetterhead(letterheadId);
      // Update the existing letterheads list by calling parent component
      window.location.reload(); // Simple refresh - in production you'd use proper state management
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(null);
    onLetterheadSelect(null);
  };

  // Show cropper if needed
  if (showCropper && fileToProcess) {
    return (
      <PDFCropper
        pdfFile={fileToProcess}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Dropdown untuk memilih kop surat yang sudah ada */}
      {existingLetterheads.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Pilih Kop Surat Tersimpan</h3>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-left flex items-center justify-between hover:border-slate-400 transition-colors"
            >
              <span className="text-slate-700">
                {selectedLetterhead ? selectedLetterhead.name : 'Pilih kop surat...'}
              </span>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                <div
                  onClick={() => {
                    onLetterheadSelect(null);
                    setShowDropdown(false);
                  }}
                  className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                >
                  <span className="text-slate-500 italic">Tidak menggunakan kop surat</span>
                </div>
                {existingLetterheads.map((letterhead) => (
                  <div
                    key={letterhead.id}
                    className={`px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 group ${
                      selectedLetterhead?.id === letterhead.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div 
                      className="flex items-center gap-3 flex-1"
                      onClick={() => {
                        onLetterheadSelect(letterhead);
                        setShowDropdown(false);
                      }}
                    >
                      <div className="p-2 bg-red-100 rounded-lg">
                        <FileText className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{letterhead.name}</p>
                        <p className="text-sm text-slate-500">PDF Upload</p>
                      </div>
                      {selectedLetterhead?.id === letterhead.id && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleDeleteLetterhead(letterhead.id, e)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Hapus kop surat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview kop surat yang dipilih */}
      {selectedLetterhead && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Kop Surat Terpilih</h3>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <div>
                  <h4 className="font-medium text-slate-800">{selectedLetterhead.name}</h4>
                  <p className="text-sm text-slate-600">
                    {selectedLetterhead.type === 'uploaded' ? 'PDF Upload' : 'Manual'}
                  </p>
                </div>
              </div>
              {selectedLetterhead.imageUrl && (
                <img
                  src={selectedLetterhead.imageUrl}
                  alt="Letterhead preview"
                  className="w-20 h-12 object-contain border border-slate-200 rounded bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : uploadedFile
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
        }`}
      >
        <input {...getInputProps()} />
        
        {uploadProgress !== null ? (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-blue-500 mx-auto animate-pulse" />
            <div>
              <p className="text-lg font-medium text-slate-800">Memproses...</p>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-slate-600 mt-1">{uploadProgress}%</p>
            </div>
          </div>
        ) : uploadedFile ? (
          <div className="space-y-4">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <div>
              <p className="text-lg font-medium text-slate-800">File berhasil diproses!</p>
              <p className="text-slate-600">{uploadedFile.name}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors inline-flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Hapus File
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-slate-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-slate-800">
                {isDragActive ? 'Drop file PDF di sini...' : 'Upload Kop Surat PDF'}
              </p>
              <p className="text-slate-600">
                Drag & drop file PDF atau klik untuk memilih file
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Maksimal ukuran file: 10MB • Format: PDF
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Setelah upload, Anda dapat memilih area kop surat yang diinginkan
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LetterheadUpload;