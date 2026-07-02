import React, { useState } from 'react';
import { useUploadCSV, useImportSampleCSV } from '../hooks/useProducts';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Info, Database } from 'lucide-react';

export default function AdminUploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const uploadMutation = useUploadCSV();
  const sampleMutation = useImportSampleCSV();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert("Only CSV files are accepted!");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    uploadMutation.mutate(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null);
      }
    });
  };

  const handleLoadSample = () => {
    sampleMutation.mutate();
  };

  const isPending = uploadMutation.isPending || sampleMutation.isPending;
  const isSuccess = uploadMutation.isSuccess || sampleMutation.isSuccess;
  const isError = uploadMutation.isError || sampleMutation.isError;
  const statusMessage = uploadMutation.isSuccess 
    ? uploadMutation.data?.message 
    : sampleMutation.isSuccess 
      ? sampleMutation.data?.message 
      : '';
  const errorMessage = uploadMutation.isError 
    ? (uploadMutation.error?.response?.data?.error || uploadMutation.error?.message)
    : sampleMutation.isError 
      ? (sampleMutation.error?.response?.data?.error || sampleMutation.error?.message)
      : '';

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">
      {/* Page Title */}
      <div className="border-b border-brand-border/60 pb-5">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Database className="w-5.5 h-5.5 text-brand-accent" />
          CSV Control Center
        </h1>
        <p className="text-sm text-brand-textMuted mt-1.5">
          Import and synchronize the relational product specifications catalog database.
        </p>
      </div>

      {/* Control Actions Box */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-6">
        
        {/* Status Banners */}
        {isPending && (
          <div className="bg-brand-accent/15 border border-brand-accent/30 rounded-lg p-4 flex items-center gap-3 text-brand-accent text-sm">
            <div className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
            Processing CSV parser and importing attributes transaction...
          </div>
        )}

        {isSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3 text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold">Sync Completed Successfully</p>
              <p className="text-xs opacity-90 mt-0.5">{statusMessage}</p>
            </div>
          </div>
        )}

        {isError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-400 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold">Import Failed</p>
              <p className="text-xs opacity-90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <form 
          onSubmit={handleUploadSubmit} 
          className="space-y-4"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-brand-accent bg-brand-accent/5' 
              : 'border-brand-border hover:border-brand-textMuted/40 bg-brand-bg/30'
          }`}>
            <UploadCloud className="w-12 h-12 text-brand-textMuted mb-3" />
            <p className="text-sm font-bold text-white mb-1">
              Drag and drop product CSV here
            </p>
            <p className="text-xs text-brand-textMuted mb-4">
              or browse your local files
            </p>
            
            <input 
              type="file" 
              id="csv-file-input" 
              accept=".csv"
              onChange={handleFileChange} 
              className="hidden" 
            />
            <label 
              htmlFor="csv-file-input" 
              className="px-4 py-2 text-xs font-bold rounded bg-brand-border text-brand-textLight hover:bg-gray-600 transition-colors cursor-pointer"
            >
              Select CSV File
            </label>

            {selectedFile && (
              <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded bg-brand-card border border-brand-border text-xs text-brand-textLight">
                <FileSpreadsheet className="w-4 h-4 text-brand-accent" />
                <span>{selectedFile.name}</span>
                <span className="text-[10px] text-brand-textMuted">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!selectedFile || isPending}
            className="w-full bg-brand-accent hover:bg-brand-accentHover text-white font-bold py-2.5 rounded-lg shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
          >
            Run Import Sync
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-border/40"></div>
          </div>
          <span className="relative px-3 bg-brand-card text-xs font-semibold text-brand-textMuted uppercase">
            Alternative Quick Start
          </span>
        </div>

        {/* Load Local Sample Button */}
        <div className="space-y-3">
          <p className="text-xs text-brand-textMuted leading-relaxed">
            For testing or evaluating assignments, you can directly import the sample sheet file located on the backend server with one click:
          </p>
          <button
            onClick={handleLoadSample}
            disabled={isPending}
            className="w-full bg-brand-card hover:bg-brand-border border border-brand-border text-brand-textLight font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Database className="w-4.5 h-4.5 text-brand-accent" />
            Direct Load Sample CSV File
          </button>
        </div>

      </div>

      {/* Database rules guide */}
      <div className="bg-brand-card/45 border border-brand-border/60 rounded-xl p-5 space-y-3 text-xs leading-relaxed text-brand-textMuted">
        <h4 className="font-bold text-white flex items-center gap-1.5 mb-2">
          <Info className="w-4 h-4 text-brand-accent" />
          Import Pipeline Specifications
        </h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>The importer reads <strong className="text-brand-textLight">Category, Sub-category, Part No., Datasheet Link (PDF)</strong> as the primary schema objects.</li>
          <li>All other column headers are stored as dynamic specifications in the relational table.</li>
          <li>Re-uploading the same Part Number updates the details, preventing data duplicates.</li>
        </ul>
      </div>
    </div>
  );
}
