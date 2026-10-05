import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiShield, FiArrowLeft, FiHome } from 'react-icons/fi';

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 bg-ivory">
      <Helmet>
        <title>Access Restricted — Chaitrika Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-md w-full space-y-6 text-center">
        <div className="w-14 h-14 bg-white border border-charcoal/15 text-charcoal flex items-center justify-center text-xl mx-auto shadow-sm">
          <FiShield />
        </div>

        <div>
          <span className="text-micro font-medium uppercase tracking-[0.25em] text-accent block mb-1">
            403 Forbidden
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-light text-charcoal">
            Restricted Access
          </h1>
          <p className="text-sm text-ink-muted mt-2 font-light">
            You do not have administrative authorization to access this area.
          </p>
        </div>

        <div className="bg-white border border-charcoal/10 p-6 text-left shadow-sm">
          <div className="space-y-3 mb-6">
            <h3 className="text-xs font-medium uppercase tracking-wider text-charcoal">
              Requirements
            </h3>
            <ul className="text-xs text-ink-muted space-y-2 font-light">
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Active administrator credentials required</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent">•</span>
                <span>Contact your store supervisor if you believe this is an error</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-charcoal/10 pt-4 space-y-2">
            <button
              onClick={() => navigate('/')}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-micro uppercase tracking-widest"
            >
              <FiHome className="w-3.5 h-3.5" />
              Return to Storefront
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full btn-secondary flex items-center justify-center gap-2 py-3 text-micro uppercase tracking-widest"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
