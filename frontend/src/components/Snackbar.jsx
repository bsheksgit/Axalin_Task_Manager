import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { hideSnackbar } from "../store/snackbarSlice";

export default function Snackbar() {
  const dispatch = useDispatch();
  const { message, type, isOpen } = useSelector((state) => state.snackbar);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        dispatch(hideSnackbar());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  const bgColor = type === "success" ? "bg-emerald-600" : "bg-red-600";
  const icon = type === "success" ? "✓" : "✗";

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg px-5 py-3.5 text-sm font-medium text-white shadow-lg ${bgColor} animate-slide-in`}
      role="alert"
    >
      <span className="text-base font-bold">{icon}</span>
      <span>{message}</span>
      <button
        onClick={() => dispatch(hideSnackbar())}
        className="ml-2 text-white/80 hover:text-white"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}
