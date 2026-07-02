import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductDetail } from '../hooks/useProducts';
import { FileText, ArrowLeft, Cpu, HardDrive, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProductDetailPage() {
  const { partNumber } = useParams();
  const navigate = useNavigate();

  // Load single product details
  const { data: product, isLoading, isError, error } = useProductDetail(partNumber);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-brand-accent border-t-transparent animate-spin"></div>
        <p className="text-sm text-brand-textMuted font-mono">Retrieving specifications sheet...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="space-y-6 max-w-lg mx-auto py-10">
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-6 rounded-xl text-center">
          <AlertCircle className="w-12 h-12 text-brand-danger mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-2">Component Not Found</h3>
          <p className="text-sm opacity-90">{error?.message || `The part number '${partNumber}' does not exist in the database.`}</p>
        </div>
        <div className="text-center">
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded bg-brand-card hover:bg-brand-border border border-brand-border text-brand-textLight transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Browser
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Back navigation */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-textMuted hover:text-brand-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Results
        </button>
      </div>

      {/* Main product card header */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-brand-accent/10 border border-brand-accent/30 text-brand-accent flex items-center justify-center flex-shrink-0">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] text-brand-textMuted font-mono uppercase tracking-widest bg-brand-bg px-2.5 py-1 rounded border border-brand-border/40">
              Component SpecSheet
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 leading-none tracking-tight">
              {product.partNumber}
            </h1>
            <div className="flex items-center gap-2 mt-3 text-xs text-brand-textMuted">
              <span className="text-brand-textLight">{product.category}</span>
              <span>/</span>
              <span className="text-brand-accent font-semibold">{product.subcategory}</span>
            </div>
          </div>
        </div>

        {/* Datasheet Link */}
        <div className="flex-shrink-0">
          {product.datasheetUrl ? (
            <a
              href={product.datasheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/10 transition-all"
            >
              <FileText className="w-4.5 h-4.5" />
              Download PDF Datasheet
            </a>
          ) : (
            <div className="px-4 py-2.5 rounded bg-brand-bg text-brand-textMuted text-xs font-semibold border border-brand-border/80 italic text-center">
              Datasheet link unavailable
            </div>
          )}
        </div>
      </div>

      {/* Specs sheet panel */}
      <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-brand-border/60 bg-brand-card/75 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-brand-accent" />
          <h2 className="text-base font-bold text-white">Technical Parameter Map</h2>
        </div>

        {/* Specs Table */}
        <div className="divide-y divide-brand-border/30">
          {product.attributes && product.attributes.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg/40 text-[10px] font-bold uppercase tracking-wider text-brand-textMuted border-b border-brand-border/40">
                  <th className="px-6 py-3.5">Parameter Specification Column</th>
                  <th className="px-6 py-3.5 text-right sm:text-left">Association Status & Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/30 text-sm">
                {product.attributes.map((attr, idx) => (
                  <tr key={idx} className="hover:bg-brand-bg/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-brand-textLight">
                      {attr.name}
                    </td>
                    <td className="px-6 py-4 text-right sm:text-left">
                      {attr.isDash ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-brand-border/30 text-brand-textMuted font-bold font-mono">
                          -
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-brand-accent/15 text-brand-accent font-bold font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {attr.value}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-brand-textMuted">
              <p className="text-sm italic">No parameter specifications are registered for this product.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
