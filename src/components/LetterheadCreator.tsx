import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, CheckCircle, Building, Mail, Phone, Globe, ChevronDown, Trash2 } from 'lucide-react';
import { Letterhead } from '../App';
import { fileToBase64, base64ToBlob, deleteLetterhead } from '../utils/storage';

interface LetterheadCreatorProps {
  onLetterheadCreated: (letterhead: Letterhead) => void;
  selectedLetterhead: Letterhead | null;
  onLetterheadSelect: (letterhead: Letterhead | null) => void;
  existingLetterheads: Letterhead[];
}

function LetterheadCreator({
  onLetterheadCreated,
  selectedLetterhead,
  onLetterheadSelect,
  existingLetterheads
}: LetterheadCreatorProps) {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      try {
        const base64Data = await fileToBase64(file);
        setLogoPreview(base64Data);
      } catch (error) {
        console.error('Error processing logo:', error);
        setLogoPreview(URL.createObjectURL(file));
      }
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.companyName) {
      let logoBase64 = logoPreview;
      
      // If we have a logo file, convert it to base64
      if (logoFile && !logoPreview?.startsWith('data:')) {
        try {
          logoBase64 = await fileToBase64(logoFile);
        } catch (error) {
          console.error('Error converting logo to base64:', error);
        }
      }
      
      const newLetterhead: Letterhead = {
        id: Date.now().toString(),
        name: formData.name || formData.companyName,
        type: 'manual',
        companyName: formData.companyName,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        logoUrl: logoBase64 || undefined,
        logoBase64: logoBase64 || undefined,
      };
      onLetterheadCreated(newLetterhead);
      onLetterheadSelect(newLetterhead);
      
      // Reset form
      setFormData({
        name: '',
        companyName: '',
        address: '',
        phone: '',
        email: '',
        website: '',
      });
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  const handleDeleteLetterhead = (letterheadId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('Yakin ingin menghapus kop surat ini?')) {
      deleteLetterhead(letterheadId);
      // Update the existing letterheads list by calling parent component
      window.location.reload(); // Simple refresh - in production you'd use proper state management
    }
  };

  const isFormValid = formData.companyName.trim() !== '';

  return (
    <div className="space-y-6">
      {/* Dropdown untuk memilih kop surat manual yang sudah ada */}
      {existingLetterheads.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Pilih Kop Surat Manual Tersimpan</h3>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-left flex items-center justify-between hover:border-slate-400 transition-colors"
            >
              <span className="text-slate-700">
                {selectedLetterhead ? selectedLetterhead.companyName : 'Pilih kop surat manual...'}
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
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Building className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{letterhead.companyName}</p>
                        <p className="text-sm text-slate-500">Manual</p>
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
      {/* Creator Form */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-6">Buat Kop Surat Manual</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Logo Perusahaan</label>
            {logoPreview ? (
              <div className="relative inline-block">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-32 h-32 object-contain border border-slate-200 rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 transition-colors bg-slate-50"
              >
                <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-600">Upload Logo</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nama Template *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Contoh: Kop Resmi Perusahaan"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-slate-500 mt-1">Nama untuk mengidentifikasi template kop surat ini</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Building className="w-4 h-4 inline mr-1" />
                Nama Perusahaan *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="PT. Contoh Perusahaan"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Alamat</label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Jl. Contoh No. 123, Jakarta"
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+62 21 1234 5678"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="info@contohperusahaan.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="www.contohperusahaan.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!isFormValid}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Simpan Kop Surat
            </button>
          </div>
        </form>
      </div>

      {/* Preview */}
      {(formData.companyName || logoPreview) && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Preview Kop Surat</h3>
          <div className="border border-slate-200 rounded-lg p-8 bg-gray-50">
            <div className="flex flex-col items-center gap-4 mb-6">
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="w-20 h-20 object-contain"
                />
              )}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  {formData.companyName || 'Nama Perusahaan'}
                </h2>
                {formData.address && (
                  <p className="text-slate-600 mb-1">{formData.address}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  {formData.phone && <span>Tel: {formData.phone}</span>}
                  {formData.email && <span>Email: {formData.email}</span>}
                  {formData.website && <span>Web: {formData.website}</span>}
                </div>
              </div>
            </div>
            <hr className="border-slate-300" />
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
                  <h4 className="font-medium text-slate-800">{selectedLetterhead.companyName}</h4>
                  <p className="text-sm text-slate-600">Manual</p>
                </div>
              </div>
              {selectedLetterhead.logoBase64 && (
                <img
                  src={selectedLetterhead.logoBase64}
                  alt="Logo preview"
                  className="w-12 h-12 object-contain border border-slate-200 rounded bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LetterheadCreator;