import { toast } from 'sonner';

export function notifySuccess(message) {
  toast.success(message, {
    style: { background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46' },
  });
}

export function notifyError(message) {
  toast.error(message, {
    style: { background: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239' },
  });
}