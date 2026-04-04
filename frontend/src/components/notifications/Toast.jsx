import { useEffect } from "react";
import { Check, X, AlertCircle, Info } from "lucide-react";

function Toast({ type = "info", title, message, onClose, duration = 5000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
    notification: "bg-gray-50 border-gray-200",
  };

  const iconColors = {
    success: "text-green-600",
    error: "text-red-600",
    info: "text-blue-600",
    notification: "text-gray-600",
  };

  const titleColors = {
    success: "text-green-900",
    error: "text-red-900",
    info: "text-blue-900",
    notification: "text-gray-900",
  };

  const messageColors = {
    success: "text-green-700",
    error: "text-red-700",
    info: "text-blue-700",
    notification: "text-gray-700",
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <Check className={`w-5 h-5 ${iconColors[type]}`} />;
      case "error":
        return <X className={`w-5 h-5 ${iconColors[type]}`} />;
      case "info":
        return <Info className={`w-5 h-5 ${iconColors[type]}`} />;
      default:
        return <AlertCircle className={`w-5 h-5 ${iconColors[type]}`} />;
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 shadow-lg ${colors[type]} animate-slide-in`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1">
          {title && (
            <div className={`font-semibold ${titleColors[type]}`}>{title}</div>
          )}
          {message && (
            <div className={`text-sm ${messageColors[type]}`}>{message}</div>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default Toast;
