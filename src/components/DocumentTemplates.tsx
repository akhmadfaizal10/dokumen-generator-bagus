import React from 'react';
import { FileText, Receipt, BarChart3, MessageSquare, CheckCircle } from 'lucide-react';
import { DocumentTemplate } from '../App';

interface DocumentTemplatesProps {
  selectedTemplate: DocumentTemplate | null;
  onTemplateSelect: (template: DocumentTemplate) => void;
}

const templates: DocumentTemplate[] = [
  {
    id: 'letter',
    name: 'Surat Resmi',
    type: 'letter',
    description: 'Template untuk surat resmi, undangan, atau korespondensi bisnis',
    icon: FileText
  },
  {
    id: 'invoice',
    name: 'Invoice',
    type: 'invoice',
    description: 'Template untuk invoice, tagihan, atau dokumen keuangan',
    icon: Receipt
  },
  {
    id: 'report',
    name: 'Laporan',
    type: 'report',
    description: 'Template untuk laporan, proposal, atau dokumen formal',
    icon: BarChart3
  },
  {
    id: 'memo',
    name: 'Memo Internal',
    type: 'memo',
    description: 'Template untuk memo, pengumuman, atau komunikasi internal',
    icon: MessageSquare
  }
];

function DocumentTemplates({ selectedTemplate, onTemplateSelect }: DocumentTemplatesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {templates.map((template) => {
        const Icon = template.icon;
        const isSelected = selectedTemplate?.id === template.id;
        
        return (
          <div
            key={template.id}
            onClick={() => onTemplateSelect(template)}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              isSelected
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-lg transition-colors ${
                  isSelected ? 'bg-blue-500' : 'bg-slate-100'
                }`}
              >
                <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-slate-800">{template.name}</h3>
                  {isSelected && <CheckCircle className="w-6 h-6 text-blue-500" />}
                </div>
                <p className="text-slate-600 leading-relaxed">{template.description}</p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full">
                    {template.type === 'letter' && 'Formal'}
                    {template.type === 'invoice' && 'Keuangan'}
                    {template.type === 'report' && 'Dokumen'}
                    {template.type === 'memo' && 'Internal'}
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">
                    Siap Pakai
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DocumentTemplates;