import '../../styles/components.css';

const icons = {
  success: 'OK',
  error: '!',
  warning: '!',
  info: 'i',
};

export default function Alert({ type = 'info', children, onClose }) {
  return (
    <div className={`alert alert-${type}`}>
      <span>{icons[type]}</span>
      <span className="alert-content">{children}</span>
      {onClose && (
        <button type="button" className="alert-close" onClick={onClose} aria-label="Dismiss alert">
          x
        </button>
      )}
    </div>
  );
}
