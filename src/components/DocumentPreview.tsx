import React from 'react';
import { Download, Printer, Share, Save } from 'lucide-react';
import { DocumentData } from '../App';
import html2pdf from 'html2pdf.js';

interface DocumentPreviewProps {
  documentData: DocumentData;
  onSaveDocument: () => void;
}

function DocumentPreview({ documentData, onSaveDocument }: DocumentPreviewProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

const handleDownloadPDF = async () => {
  setIsGeneratingPDF(true);
  try {
    const element = document.getElementById('document-content');
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `${documentData.title || 'dokumen'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Terjadi kesalahan saat membuat PDF');
  } finally {
    setIsGeneratingPDF(false);
  }
};


  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: documentData.title,
          text: `Dokumen: ${documentData.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link telah disalin ke clipboard');
    }
  };

  const renderLetterhead = () => {
    if (!documentData.letterhead) return null;

    if (documentData.letterhead.type === 'uploaded') {
      return (
        <div className="mb-8 pb-6 border-b-2 border-slate-300">
          {documentData.letterhead.imageUrl ? (
            <div className="text-center">
              <img
                src={documentData.letterhead.imageUrl}
                alt="Letterhead"
                className="max-w-full h-auto mx-auto"
                style={{ maxHeight: '200px' }}
              />
            </div>
          ) : documentData.letterhead.base64Data ? (
            <div className="text-center">
              <embed
                src={documentData.letterhead.base64Data}
                type="application/pdf"
                width="100%"
                height="200px"
                className="border border-slate-200 rounded"
              />
            </div>
          ) : (
            <div className="text-center text-sm text-slate-600 italic">
              [Kop Surat PDF: {documentData.letterhead.name}]
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="mb-8 pb-6 border-b-2 border-slate-300">
          <div className="flex flex-col items-center gap-4 mb-6">
            {documentData.letterhead.logoBase64 && (
              <img
                src={documentData.letterhead.logoBase64}
                alt="Logo"
                className="w-20 h-20 object-contain"
              />
            )}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {documentData.letterhead.companyName}
              </h2>
              {documentData.letterhead.address && (
                <p className="text-slate-600 mb-1">{documentData.letterhead.address}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                {documentData.letterhead.phone && <span>Tel: {documentData.letterhead.phone}</span>}
                {documentData.letterhead.email && <span>Email: {documentData.letterhead.email}</span>}
                {documentData.letterhead.website && <span>Web: {documentData.letterhead.website}</span>}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Preview Actions */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Aksi Dokumen</h3>
          
          <div className="space-y-3">
            <button 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="w-full px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              {isGeneratingPDF ? 'Membuat PDF...' : 'Download PDF'}
            </button>
            
            <button 
              onClick={onSaveDocument}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 justify-center"
            >
              <Save className="w-5 h-5" />
              Simpan Dokumen
            </button>
            
            <button 
              onClick={handlePrint}
              className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 justify-center"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
            
            <button 
              onClick={handleShare}
              className="w-full px-4 py-3 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2 justify-center"
            >
              <Share className="w-5 h-5" />
              Share
            </button>
          </div>

          <hr className="my-6" />

          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-slate-700">Template:</span>
              <p className="text-slate-600">{documentData.template.name}</p>
            </div>
            
            <div>
              <span className="font-medium text-slate-700">Tanggal:</span>
              <p className="text-slate-600">{formatDate(documentData.date)}</p>
            </div>
            
            {documentData.letterhead && (
              <div>
                <span className="font-medium text-slate-700">Kop Surat:</span>
                <p className="text-slate-600">
                  {documentData.letterhead.type === 'uploaded' 
                    ? documentData.letterhead.name 
                    : documentData.letterhead.companyName}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Preview */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-xl shadow-lg border">
          {/* A4 Paper Simulation */}
<div id="document-content" className="p-16 bg-white">
            {/* Letterhead */}
            {renderLetterhead()}

            {/* Document Header */}
            <div className="mb-10">
              <div className="text-right mb-8">
                <p className="text-slate-700 text-base">{formatDate(documentData.date)}</p>
              </div>

              {documentData.template.type === 'letter' && documentData.recipient && (
                <div className="mb-8">
                  <p className="text-slate-800 text-base">Kepada Yth.</p>
                  <p className="font-semibold text-slate-800 text-base">{documentData.recipient}</p>
                  <p className="text-slate-700 text-base">Di tempat</p>
                </div>
              )}

              {documentData.template.type === 'memo' && documentData.recipient && (
                <div className="mb-8 space-y-2 text-base">
                  <p className="text-slate-800"><strong>Kepada:</strong> {documentData.recipient}</p>
                  <p className="text-slate-800"><strong>Dari:</strong> Manajemen</p>
                  <p className="text-slate-800"><strong>Tanggal:</strong> {formatDate(documentData.date)}</p>
                  {documentData.subject && <p className="text-slate-800"><strong>Perihal:</strong> {documentData.subject}</p>}
                </div>
              )}

              {documentData.template.type === 'letter' && documentData.subject && (
                <div className="mb-8">
                  <p className="text-slate-800 text-base"><strong>Perihal:</strong> {documentData.subject}</p>
                </div>
              )}

              <h1 className="text-3xl font-bold text-slate-800 mb-8 text-center">
                {documentData.title}
              </h1>
            </div>

            {/* Document Content */}
            <div className="mb-12">
              <div className="text-slate-800 leading-relaxed whitespace-pre-wrap text-justify text-base" style={{ lineHeight: '1.8' }}>
                {documentData.content}
              </div>
            </div>

            {/* Signature Section */}
            {documentData.signature && (documentData.signature.name || documentData.signature.position) && (
              <div className="mt-16 flex justify-end">
                <div className="text-center">
                  <p className="text-slate-800 text-base mb-1">Hormat kami,</p>
                  
                  {documentData.signature.signatureImage && (
                    <div className="my-4">
                      <img
                        src={documentData.signature.signatureImage}
                        alt="Signature"
                        className="w-32 h-16 object-contain mx-auto"
                      />
                    </div>
                  )}
                  
                  {!documentData.signature.signatureImage && (
                    <div className="my-8">
                      <div className="w-32 h-16 mx-auto"></div>
                    </div>
                  )}
                  
                  {documentData.signature.name && (
                    <p className="font-semibold text-slate-800 text-base border-b border-slate-800 inline-block pb-1">
                      {documentData.signature.name}
                    </p>
                  )}
                  
                  {documentData.signature.position && (
                    <p className="text-slate-700 text-base mt-1">
                      {documentData.signature.position}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Footer for Invoice */}
            {documentData.template.type === 'invoice' && (
              <div className="mt-12 pt-6 border-t border-slate-300">
                <p className="text-center text-slate-600 italic text-base">
                  Terima kasih atas kepercayaan Anda
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentPreview;