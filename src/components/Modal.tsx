// src/components/Modal.js
import { type ReactElement } from "react";
import ReactDOM from "react-dom";

type ModalPropTypes = {
  isOpen: boolean;
  onClose?: () => void;
  targetRoot: string;
  children: ReactElement;
};

const Modal = ({ isOpen, onClose,targetRoot='modal-root', children }: ModalPropTypes) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50"
      onClick={onClose} // close on backdrop click
    >
      <div
        className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-md w-full max-sm:mx-2"
        onClick={(e) => e.stopPropagation()} // prevent close on modal click
      >
        {children}
      </div>
    </div>,
    document.getElementById(targetRoot)!
  );
};

export default Modal;
