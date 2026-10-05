import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 text-center bg-ivory">
      <Helmet>
        <title>Page Not Found — Chaitrika</title>
      </Helmet>

      <div className="max-w-md w-full space-y-6">
        <span className="text-micro font-medium uppercase tracking-[0.3em] text-accent block">
          Error 404
        </span>
        
        <h1 className="font-display text-4xl sm:text-5xl font-light text-charcoal leading-tight">
          Page Out of Frame
        </h1>
        
        <p className="text-sm text-ink-muted max-w-sm mx-auto leading-relaxed font-light">
          The memory or page you are looking for has been moved or does not exist in our curated collection.
        </p>

        <div className="pt-4">
          <Link
            to="/"
            className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-widest"
          >
            <FiArrowLeft className="w-3.5 h-3.5" /> Return to Gallery
          </Link>
        </div>
      </div>
    </div>
  );
}
