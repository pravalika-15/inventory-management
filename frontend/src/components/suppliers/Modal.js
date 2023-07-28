import React from "react";

const Modal = ({ children }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="bg-white p-8 rounded shadow-md">{children}</div>
    </div>
  );
};

export default Modal;
