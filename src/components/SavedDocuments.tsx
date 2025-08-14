import React from 'react';
import { FileText, Calendar, Trash2, Edit, Eye } from 'lucide-react';
import { SavedDocument } from '../App';

interface SavedDocumentsProps {
  savedDocuments: SavedDocument[];
  onLoadDocument: (document: SavedDocument) => void;
  onDeleteDocument: (id: string) => void;
}

function SavedDocuments({ savedDocuments, onLoadDocument, onDeleteDocument }: SavedDocumentsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (savedDocuments.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">Belum Ada Dokumen Tersimpan</h3>
        <p className="text-slate-500">Dokumen yang Anda simpan akan muncul di sini</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Dokumen Tersimpan ({savedDocuments.length})</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedDocuments.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">
                    {doc.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {doc.data.template.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(doc.createdAt)}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onLoadDocument(doc)}
                className="flex-1 px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors flex items-center gap-1 justify-center"
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
              
              <button
                onClick={() => {
                  if (confirm('Yakin ingin menghapus dokumen ini?')) {
                    onDeleteDocument(doc.id);
                  }
                }}
                className="px-3 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SavedDocuments;