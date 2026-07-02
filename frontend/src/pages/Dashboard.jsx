import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories, useProducts } from '../hooks/useProducts';
import { FolderKanban, Tags, Cpu, FileSpreadsheet, Layers, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Dashboard() {
  const { data: categories, isLoading: isCatLoading } = useCategories();
  const { data: productsData, isLoading: isProdLoading } = useProducts({ page: 1, limit: 1 });

  // Calculate metrics
  const totalCategories = categories ? categories.length : 0;
  const totalSubcategories = categories
    ? categories.reduce((acc, cat) => acc + cat.subcategories.length, 0)
    : 0;
  const totalProducts = productsData?.pagination?.total || 0;

  const isLoading = isCatLoading || isProdLoading;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Intro Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-card to-brand-bg border border-brand-border p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-accent/10 text-brand-accent border border-brand-accent/20 mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Active Catalog Manager
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Semi-Ecommerce Technical Database
          </h1>
          <p className="text-brand-textMuted text-base sm:text-lg leading-relaxed mb-6">
            A premium, high-density specifications repository designed for engineering and procurement lookup. Easily import CSV datasheets, filter components, and inspect precise associations.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/products"
              className="px-5 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accentHover text-white text-sm font-semibold shadow-lg shadow-brand-accent/15 transition-all"
            >
              Browse Catalog
            </Link>
            <Link
              to="/admin/import"
              className="px-5 py-2.5 rounded-lg bg-brand-card hover:bg-brand-border border border-brand-border text-brand-textLight text-sm font-semibold transition-all"
            >
              CSV Data Control
            </Link>
          </div>
        </div>
      </section>

      {/* Grid Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 hover:border-brand-border transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-textMuted">Categories</span>
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-16 bg-brand-border rounded animate-pulse"></div>
          ) : (
            <div className="text-2xl font-bold text-white">{totalCategories}</div>
          )}
          <p className="text-xs text-brand-textMuted mt-1">Primary component categories</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 hover:border-brand-border transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-textMuted">Subcategories</span>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Tags className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-16 bg-brand-border rounded animate-pulse"></div>
          ) : (
            <div className="text-2xl font-bold text-white">{totalSubcategories}</div>
          )}
          <p className="text-xs text-brand-textMuted mt-1">Specific component packages</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 hover:border-brand-border transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-textMuted">Total Products</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-16 bg-brand-border rounded animate-pulse"></div>
          ) : (
            <div className="text-2xl font-bold text-white">{totalProducts}</div>
          )}
          <p className="text-xs text-brand-textMuted mt-1">Active items in catalog</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-brand-card border border-brand-border/60 rounded-xl p-5 hover:border-brand-border transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-textMuted">Dynamic Specs</span>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">Dynamic</div>
          <p className="text-xs text-brand-textMuted mt-1">Database-column independent</p>
        </div>
      </section>

      {/* CSV Association Rules Legend / Explanation */}
      <section className="bg-brand-card/45 border border-brand-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-accent" />
          CSV Attribute Association Rules
        </h3>
        <p className="text-sm text-brand-textMuted mb-6 leading-relaxed">
          Product specifications are stored dynamically in the <code className="text-brand-accent px-1.5 py-0.5 rounded bg-brand-bg font-mono text-xs">ProductAttribute</code> database table. Depending on the CSV row cell state, they are stored and visualized according to these critical business associations:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rule 1 */}
          <div className="flex gap-4 p-4 rounded-lg bg-brand-card border border-brand-border/40">
            <div className="flex-shrink-0 w-8 h-8 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-mono">
              1
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Filled Cell (e.g. "4")</h4>
              <p className="text-xs text-brand-textMuted leading-relaxed">
                The product is associated with that attribute. The attribute is saved and displays the precise value in a soft green badge.
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="flex gap-4 p-4 rounded-lg bg-brand-card border border-brand-border/40">
            <div className="flex-shrink-0 w-8 h-8 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold font-mono">
              2
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Dash Cell ("-")</h4>
              <p className="text-xs text-brand-textMuted leading-relaxed">
                The product IS associated with that attribute, but has no specific value. It is saved with <code className="text-amber-400">isDash = true</code> and displays a dash (<strong className="text-white">-</strong>) badge.
              </p>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="flex gap-4 p-4 rounded-lg bg-brand-card border border-brand-border/40">
            <div className="flex-shrink-0 w-8 h-8 rounded bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold font-mono">
              3
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Empty Cell ("")</h4>
              <p className="text-xs text-brand-textMuted leading-relaxed">
                The product is NOT associated with that attribute. It is completely omitted from storage and not displayed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
