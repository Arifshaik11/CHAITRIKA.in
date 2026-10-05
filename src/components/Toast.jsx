import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.98 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={onClose}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 bg-charcoal text-ivory shadow-2xl cursor-pointer max-w-sm border border-charcoal/30"
      >
        <div className="flex-shrink-0">
          {isSuccess && <FiCheck className="text-ivory w-4 h-4" />}
          {isError && <FiAlertCircle className="text-accent w-4 h-4" />}
          {isInfo && <FiInfo className="text-ivory-sand w-4 h-4" />}
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide leading-relaxed">
            {toast.message}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
