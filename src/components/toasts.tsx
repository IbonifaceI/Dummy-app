import React from 'react';

type Props = {
  toasts: Array<{
    id: number;
    message: string;
  }>;
};

const Toasts: React.FunctionComponent<Props> = ({ toasts }) => {
  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default Toasts;