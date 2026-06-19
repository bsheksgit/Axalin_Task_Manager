export default function ConfirmModal({
  isOpen,
  mode = "confirm",
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  confirmButtonClass = "bg-red-600 hover:bg-red-700",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>

        <p className="text-sm text-gray-600">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          {mode === "confirm" && (
            <button
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={mode === "confirm" ? onConfirm : onCancel}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${confirmButtonClass}`}
          >
            {mode === "confirm" ? confirmText : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}
