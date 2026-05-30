'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[slide-up_0.2s_ease-out]"
      onClick={(e) => {
        if (e.target === overlayRef.current && onClose) onClose();
      }}
    >
      <div
        className={cn(
          'bg-white rounded-3xl shadow-2xl p-6 mx-4 max-w-sm w-full animate-bounce-in',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
