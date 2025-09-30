import { toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const confirmDialog = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const toastId = toast(
      <div className="p-4">
        <div className="text-lg font-medium mb-4">{message}</div>
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
            onClick={() => {
              toast.dismiss(toastId);
              resolve(false);
            }}
          >
            İptal
          </button>
          <button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
            onClick={() => {
              toast.dismiss(toastId);
              resolve(true);
            }}
          >
            Onayla
          </button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        draggable: false,
        className: 'w-full max-w-md',
        bodyClassName: 'p-0',
      } as ToastOptions
    );
  });
};

export const successToast = (message: string) => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const errorToast = (message: string) => {
  toast.error(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};
