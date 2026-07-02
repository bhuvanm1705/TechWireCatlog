import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProducts, useCategories } from '../hooks/useProducts';
import { Search, Filter, FileText, ChevronLeft, ChevronRight, X, LayoutGrid } from 'lucide-react';

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories } = useCategories();

  // Extract filters from search parameters
  const currentCategory = searchParams.get('category') || '';
  const currentSubcategory = searchParams.get('subcategory') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const limit = 12; // 12 items per page

  // Local inputs synced to URL params
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Fetch product list
  const { data, isLoading, isError, error } = useProducts({
    category: currentCategory,
    subcategory: currentSubcategory,
    partNumber: currentSearch,
    page: currentPage,
    limit,
  });

  // Sync search input when url param changes
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    
    // Always reset page to 1 when changing filters
    params.set('page', '1');

    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    // If category is cleared, also clear subcategory
    if (newFilters.category === '') {
      params.delete('subcategory');
    }

    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > (data?.pagination?.totalPages || 1)) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  // Find subcategories of selected category
  const selectedCatObj = categories?.find(c => c.name === currentCategory);
  const availableSubcategories = selectedCatObj?.subcategories || [];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-brand-textMuted uppercase mb-1">
            <Link to="/" className="hover:text-brand-accent">Home</Link>
            <span>/</span>
            <Link to="/categories" className="hover:text-brand-accent">Catalog</Link>
            {currentCategory && (
              <>
                <span>/</span>
                <span className="text-brand-textLight">{currentCategory}</span>
              </>
            )}
            {currentSubcategory && (
              <>
                <span>/</span>
                <span className="text-brand-accent">{currentSubcategory}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <LayoutGrid className="w-5.5 h-5.5 text-brand-accent" />
            Component Browser
          </h1>
        </div>

        <div className="text-xs font-semibold px-3 py-1 rounded bg-brand-card border border-brand-border/60 text-brand-textMuted">
          Found: <span className="text-brand-accent">{data?.pagination?.total || 0}</span> components
        </div>
      </div>

      {/* Filters Board */}
      <div className="bg-brand-card border border-brand-border/80 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-brand-border/40 pb-2.5">
          <Filter className="w-4 h-4 text-brand-accent" />
          Filter Settings
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-textMuted uppercase tracking-wider">Category</label>
            <select
              value={currentCategory}
              onChange={(e) => updateFilters({ category: e.target.value, subcategory: '' })}
              className="w-full bg-brand-bg border border-brand-border rounded-lg text-sm text-brand-textLight p-2.5 outline-none focus:border-brand-accent transition-colors"
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-textMuted uppercase tracking-wider">Subcategory</label>
            <select
              value={currentSubcategory}
              onChange={(e) => updateFilters({ subcategory: e.target.value })}
              disabled={!currentCategory}
              className="w-full bg-brand-bg border border-brand-border rounded-lg text-sm text-brand-textLight p-2.5 outline-none focus:border-brand-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">All Subcategories</option>
              {availableSubcategories.map((sub) => (
                <option key={sub.id} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Part Number */}
          <form onSubmit={handleSearchSubmit} className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-semibold text-brand-textMuted uppercase tracking-wider">Search Part Number</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter exact or partial part no (e.g. PART483)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-lg text-sm text-brand-textLight pl-3 pr-20 py-2.5 outline-none focus:border-brand-accent transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bg-brand-accent hover:bg-brand-accentHover text-white text-xs font-bold px-3.5 py-1.5 rounded transition-all flex items-center gap-1"
              >
                <Search className="w-3.5 h-3.5" />
                Find
              </button>
            </div>
          </form>
        </div>

        {/* Filters Summary chips */}
        {(currentCategory || currentSubcategory || currentSearch) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-border/30">
            <span className="text-xs text-brand-textMuted font-medium">Applied:</span>
            {currentCategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-bg border border-brand-border text-xs text-brand-textLight">
                Cat: {currentCategory}
                <button onClick={() => updateFilters({ category: '' })} className="hover:text-brand-danger">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {currentSubcategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-bg border border-brand-border text-xs text-brand-textLight">
                Sub: {currentSubcategory}
                <button onClick={() => updateFilters({ subcategory: '' })} className="hover:text-brand-danger">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {currentSearch && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-bg border border-brand-border text-xs text-brand-textLight">
                Search: {currentSearch}
                <button onClick={() => updateFilters({ search: '' })} className="hover:text-brand-danger">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-brand-danger hover:underline ml-auto"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Grid Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse py-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-brand-card border border-brand-border/60 rounded-xl"></div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-6 rounded-xl text-center max-w-lg mx-auto">
          <h3 className="font-bold text-lg mb-2">Error loading products</h3>
          <p className="text-sm opacity-90">{error.message || 'Unknown network error occurred.'}</p>
        </div>
      ) : data?.products?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.products.map((product) => (
              <div
                key={product.id}
                className="bg-brand-card border border-brand-border hover:border-brand-accent/50 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 group"
              >
                {/* Product Header */}
                <div className="p-4 border-b border-brand-border/40 bg-brand-card/75 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white tracking-wide group-hover:text-brand-accent transition-colors">
                      {product.partNumber}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-brand-textMuted uppercase font-mono">{product.category}</span>
                      <span className="text-brand-border text-[9px]">•</span>
                      <span className="text-[10px] text-brand-accent uppercase font-mono">{product.subcategory}</span>
                    </div>
                  </div>

                  {product.datasheetUrl ? (
                    <a
                      href={product.datasheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white transition-all shadow-sm"
                      title="View PDF Datasheet"
                    >
                      <FileText className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="text-xs text-brand-textMuted opacity-50 px-2 py-1 bg-brand-bg rounded border border-brand-border/60">
                      No PDF
                    </span>
                  )}
                </div>

                {/* Specs List (Only showing associated columns) */}
                <div className="p-4 flex-grow bg-brand-bg/25">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {product.attributes && product.attributes.length > 0 ? (
                      product.attributes.map((attr, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-brand-border/20 last:border-0">
                          <span className="text-brand-textMuted truncate pr-2 font-medium" title={attr.name}>
                            {attr.name}
                          </span>
                          {attr.isDash ? (
                            <span className="font-bold px-1.5 py-0.5 rounded bg-brand-border/40 text-brand-textMuted font-mono" title="Associated without specific value">
                              -
                            </span>
                          ) : (
                            <span className="font-bold px-1.5 py-0.5 rounded bg-brand-accent/15 text-brand-accent font-mono truncate max-w-[80px]" title={attr.value}>
                              {attr.value}
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-brand-textMuted italic text-center col-span-2 py-4">
                        No parameters listed.
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 border-t border-brand-border/40 bg-brand-card/50 flex justify-end">
                  <Link
                    to={`/products/${encodeURIComponent(product.partNumber)}`}
                    className="text-xs font-bold px-3 py-1.5 rounded bg-brand-border text-brand-textLight hover:bg-brand-accent hover:text-white transition-colors"
                  >
                    View Specifications
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {data.pagination?.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-brand-border/60 pt-5 mt-6">
              <span className="text-xs text-brand-textMuted">
                Showing Page <span className="font-semibold text-brand-textLight">{currentPage}</span> of{' '}
                <span className="font-semibold text-brand-textLight">{data.pagination.totalPages}</span>
              </span>

              <div className="flex gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded border border-brand-border bg-brand-card hover:bg-brand-border text-brand-textLight disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(data.pagination.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Handle paging display subset for large lists
                  if (
                    data.pagination.totalPages > 5 &&
                    Math.abs(currentPage - pageNum) > 2 &&
                    pageNum !== 1 &&
                    pageNum !== data.pagination.totalPages
                  ) {
                    if (pageNum === 2 || pageNum === data.pagination.totalPages - 1) {
                      return <span key={pageNum} className="text-brand-textMuted px-1.5 py-1">...</span>;
                    }
                    return null;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition-all border ${
                        currentPage === pageNum
                          ? 'bg-brand-accent text-white border-brand-accent shadow shadow-brand-accent/25'
                          : 'border-brand-border bg-brand-card hover:bg-brand-border text-brand-textLight'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === data.pagination.totalPages}
                  className="p-2 rounded border border-brand-border bg-brand-card hover:bg-brand-border text-brand-textLight disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-brand-card border border-brand-border rounded-xl p-12 text-center">
          <Search className="w-12 h-12 text-brand-textMuted mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No Components Found</h3>
          <p className="text-sm text-brand-textMuted max-w-sm mx-auto mb-6">
            No products match the selected criteria or search keywords. Try adjusting your parameters.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-xs font-bold rounded bg-brand-border text-brand-textLight hover:bg-brand-accent hover:text-white transition-all"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
