// src/components/Modal.js
import { type ReactElement } from 'react';
import ReactDOM from 'react-dom';

type ModalPropTypes={
    isOpen:boolean,
    onClose:()=>void,
    children:ReactElement
}

const Modal = ({ isOpen, onClose, children }:ModalPropTypes) => {

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50"
      onClick={onClose} // close on backdrop click
    >
      <div
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()} // prevent close on modal click
      >
        {children}
      </div>
    </div>,document.getElementById('modal-root') !
  );
};

export default Modal;