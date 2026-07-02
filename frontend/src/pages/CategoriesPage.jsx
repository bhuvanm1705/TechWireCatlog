import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../hooks/useProducts';
import { LayoutGrid, ArrowRight, FolderKanban, Tags } from 'lucide-react';

export default function CategoriesPage() {
  const { data: categories, isLoading, isError, error } = useCategories();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-brand-accent border-t-transparent animate-spin"></div>
        <p className="text-sm text-brand-textMuted font-mono">Loading product tree...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-6 rounded-xl text-center max-w-lg mx-auto">
        <h3 className="font-bold text-lg mb-2">Failed to load categories</h3>
        <p className="text-sm opacity-90">{error.message || 'Unknown network error occurred.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="border-b border-brand-border/60 pb-5">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <LayoutGrid className="w-6 h-6 text-brand-accent" />
          Component Categories
        </h1>
        <p className="text-sm text-brand-textMuted mt-1.5">
          Browse component specifications organized by categories and package subcategories.
        </p>
      </div>

      {categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-brand-card border border-brand-border/60 rounded-xl overflow-hidden shadow-md flex flex-col justify-between"
            >
              {/* Category Header */}
              <div className="p-5 border-b border-brand-border/40 bg-brand-card/75 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-brand-accent/15 text-brand-accent flex items-center justify-center">
                    <FolderKanban className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white leading-tight">{category.name}</h2>
                    <span className="text-[10px] text-brand-textMuted font-mono uppercase">Category</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-border text-brand-textLight">
                  {category.subcategories.reduce((acc, sub) => acc + (sub._count?.products || 0), 0)} Products
                </span>
              </div>

              {/* Subcategories Grid */}
              <div className="p-5 flex-grow">
                {category.subcategories && category.subcategories.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/products?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(sub.name)}`}
                        className="p-3 rounded-lg border border-brand-border/30 bg-brand-bg/50 hover:bg-brand-bg hover:border-brand-accent/50 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Tags className="w-3.5 h-3.5 text-brand-textMuted group-hover:text-brand-accent flex-shrink-0" />
                          <span className="text-xs font-semibold text-brand-textLight truncate group-hover:text-white">
                            {sub.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-card text-brand-textMuted group-hover:bg-brand-accent/10 group-hover:text-brand-accent">
                          {sub._count?.products || 0}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-brand-textMuted text-center py-6">
                    No package subcategories registered.
                  </p>
                )}
              </div>

              {/* Browse Category Footer */}
              <div className="px-5 py-3 border-t border-brand-border/30 bg-brand-card/25">
                <Link
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  className="text-xs text-brand-accent hover:text-white font-bold flex items-center gap-1 transition-colors"
                >
                  View all in category <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-brand-card border border-brand-border rounded-xl p-12 text-center">
          <FolderKanban className="w-12 h-12 text-brand-textMuted mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No Categories Found</h3>
          <p className="text-sm text-brand-textMuted max-w-sm mx-auto mb-6">
            Import a component specification CSV file to generate the catalog hierarchy and register categories.
          </p>
          <Link
            to="/admin/import"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded bg-brand-accent hover:bg-brand-accentHover text-white transition-all"
          >
            Go to Importer <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
