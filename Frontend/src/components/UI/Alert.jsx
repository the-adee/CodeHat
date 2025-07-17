// Alert.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faTimesCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";

const Alert = ({
  type = "info",
  message,
  dismissible = true,
  autoClose = false,
  duration = 5000,
  onClose,
  className = "",
  show = true,
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const alertConfig = {
    success: {
      icon: faCheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      iconColor: "text-green-400",
    },
    error: {
      icon: faTimesCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      iconColor: "text-red-400",
    },
    warning: {
      icon: faExclamationTriangle,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-800",
      iconColor: "text-yellow-400",
    },
    info: {
      icon: faInfoCircle,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      iconColor: "text-blue-400",
    },
  };

  const config = alertConfig[type] || alertConfig.info;

  if (!isVisible) return null;

  return (
    <div
      className={classNames(
        "rounded-lg border p-4 shadow-sm transition-all duration-300 ease-in-out",
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FontAwesomeIcon
            icon={config.icon}
            className={classNames("h-5 w-5", config.iconColor)}
          />
        </div>
        <div className="ml-3 flex-1">
          <p className={classNames("text-sm font-medium", config.textColor)}>
            {message}
          </p>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              onClick={handleClose}
              className={classNames(
                "inline-flex rounded-md p-1.5 transition-colors duration-200 hover:bg-opacity-20",
                config.textColor,
                `hover:${config.bgColor}`
              )}
            >
              <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
