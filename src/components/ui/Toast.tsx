import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";

export interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

export interface ToastHandle {
  dismiss: (exitType?: "manual" | "auto") => void;
}

export const Toast = forwardRef<ToastHandle, ToastProps>(
  ({ message, duration = 3000, onClose }, ref) => {
    const [visible, setVisible] = useState(true);
    const [exiting, setExiting] = useState(false);
    const [exitType, setExitType] = useState<"auto" | "manual" | null>(null);
    const timerRef = useRef<number | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Определяем, мобильное ли устройство (ширина окна меньше 768px)
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Добавляем keyframes для анимаций
    useEffect(() => {
      const styleElement = document.createElement("style");
      styleElement.innerHTML = `
        @keyframes slideIn {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 0; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `;
      document.head.appendChild(styleElement);
      return () => {
        document.head.removeChild(styleElement);
      };
    }, []);

    // Устанавливаем таймер авто‑закрытия (запускается один раз при монтировании)
    useEffect(() => {
      timerRef.current = window.setTimeout(() => {
        if (!exiting) {
          setExitType("auto");
          setExiting(true);
        }
      }, duration);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, [duration, exiting]);

    // Позволяем родительскому компоненту закрывать уведомление вручную
    useImperativeHandle(
      ref,
      () => ({
        dismiss: (type: "manual" | "auto" = "manual") => {
          if (!exiting) {
            if (timerRef.current) clearTimeout(timerRef.current);
            setExitType(type);
            setExiting(true);
          }
        },
      }),
      [exiting]
    );

    // После завершения анимации вызываем onClose и скрываем уведомление
    const handleAnimationEnd = () => {
      if (exiting) {
        setVisible(false);
        onClose();
      }
    };

    if (!visible) return null;

    // Если уведомление закрывается вручную — используем fadeOut, иначе — slideOut (при авто‑закрытии)
    const animationStyle = exiting
      ? exitType === "manual"
        ? "fadeOut 0.5s ease-out forwards"
        : "slideOut 0.5s ease-out forwards"
      : "slideIn 0.5s ease-out forwards";

    // Для мобильной версии выводим уведомление как горизонтальный баннер внизу экрана,
    // для десктопа – как всплывающее окно в правом верхнем углу.
    const toastStyle: React.CSSProperties = isMobile
      ? {
          position: "fixed",
          bottom: "16px",
          left: "16px",
          right: "16px",
          textAlign: "center",
          zIndex: 50,
          backgroundColor: "red",
          color: "white",
          padding: "8px 16px",
          borderRadius: "4px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          animation: animationStyle,
        }
      : {
          position: "fixed",
          top: "16px",
          right: "16px",
          zIndex: 50,
          backgroundColor: "red",
          color: "white",
          padding: "8px 16px",
          borderRadius: "4px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          animation: animationStyle,
        };

    return (
      <div style={toastStyle} onAnimationEnd={handleAnimationEnd}>
        {message}
      </div>
    );
  }
);

Toast.displayName = "Toast";
