// components/UI/ToastContainer.tsx
import { useToastStore } from "../../stores/toastStore";
import Toast from "./Toast";

function ToastContainer() {
    const toasts = useToastStore((s) => s.toasts);

    return (
        <div className="
            fixed top-4 left-1/2 -translate-x-1/2 z-50
            flex flex-col items-center gap-2
            pointer-events-none
        ">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast toast={toast} />
                </div>
            ))}
        </div>
    );
}

export default ToastContainer;