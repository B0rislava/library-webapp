import React from "react";
import "./NotificationModal.css";

function NotificationModal({ isOpen, onClose, message, isError }) {
  if (!isOpen) return null;

  return (
    <div className="notification-overlay">
      <div
        className={`notification-modal ${isError ? 'error' : 'success'}`}
        style={{ animation: isOpen ? 'slideIn 0.3s ease' : '' }}
      >
        <p className="notification-message">{message}</p>
        <button
          className={`notification-btn ${isError ? 'error-btn' : 'success-btn'}`}
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default NotificationModal;