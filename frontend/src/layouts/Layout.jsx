import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Cpu, Database, LayoutGrid, Info, ArrowUpRight } from 'lucide-react';

export default function Layout({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-textLight">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-brand-bg/85 backdrop-blur-md border-b border-brand-border/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-accent to-emerald-500 flex items-center justify-center shadow-lg shadow-brand-accent/20 group-hover:scale-105 transition-transform">
              <Cpu className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-wider leading-none text-white flex items-center gap-0.5">
                TECH<span className="text-brand-accent font-light">WIRE</span>
              </span>
              <span className="text-[10px] text-brand-textMuted font-mono tracking-widest mt-0.5 uppercase">Component Catalog</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-border/50 text-white shadow-sm'
                    : 'text-brand-textMuted hover:text-brand-textLight hover:bg-brand-border/30'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-border/50 text-white shadow-sm'
                    : 'text-brand-textMuted hover:text-brand-textLight hover:bg-brand-border/30'
                }`
              }
            >
              Categories
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-border/50 text-white shadow-sm'
                    : 'text-brand-textMuted hover:text-brand-textLight hover:bg-brand-border/30'
                }`
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/admin/import"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-brand-accent/20 text-brand-accent border border-brand-accent/40 shadow-sm'
                    : 'text-brand-textMuted hover:text-brand-textLight hover:bg-brand-border/30'
                }`
              }
            >
              <Database className="w-4 h-4" />
              CSV Admin
            </NavLink>
          </nav>

          {/* Nav Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-xs w-full sm:w-64">
            <input
              type="text"
              placeholder="Search part number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-card border border-brand-border hover:border-brand-textMuted/40 focus:border-brand-accent text-brand-textLight text-sm rounded-lg pl-9 pr-3 py-2 outline-none transition-all duration-200 focus:ring-1 focus:ring-brand-accent"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-brand-textMuted" />
          </form>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-brand-card/30 border-t border-brand-border/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-accent" />
            <span className="text-sm font-semibold text-brand-textMuted">
              &copy; {new Date().getFullYear()} TechWire. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-brand-textMuted">
            <span className="hover:text-brand-textLight">
              TechWire Components
            </span>
            <span>•</span>
            <Link to="/admin/import" className="hover:text-brand-textLight">
              CSV Control Center
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
