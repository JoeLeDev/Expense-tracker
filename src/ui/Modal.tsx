import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  labelledById?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, labelledById }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && ref.current) {
      ref.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById || 'modal-title'}
        tabIndex={-1}
        ref={ref}
      >
        <div className="modal-header">
          <h2 id={labelledById || 'modal-title'}>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer la modale">×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal; 