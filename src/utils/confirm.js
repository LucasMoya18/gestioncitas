import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const resolveRef = useRef(null);
  const [state, setState] = useState({
    show: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'primary' // primary | warning | danger | info | success
  });

  const confirm = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState((s) => ({
        ...s,
        show: true,
        title: opts.title || 'Confirmar',
        message: opts.text || opts.message || '',
        confirmText: opts.confirmButtonText || 'Confirmar',
        cancelText: opts.cancelButtonText || 'Cancelar',
        variant: opts.variant || 'primary',
      }));
    });
  }, []);

  const onClose = (result) => {
    setState((s) => ({ ...s, show: false }));
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
  };

  const headerClass =
    state.variant === 'warning' ? 'bg-warning text-dark'
    : state.variant === 'danger' ? 'bg-danger text-white'
    : state.variant === 'success' ? 'bg-success text-white'
    : state.variant === 'info' ? 'bg-info text-white'
    : 'bg-primary text-white';

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal show={state.show} onHide={() => onClose(false)} centered>
        <Modal.Header closeButton className={headerClass}>
          <Modal.Title>{state.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {state.message && <p className="mb-0">{state.message}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => onClose(false)}>
            {state.cancelText}
          </Button>
          <Button variant={state.variant} onClick={() => onClose(true)}>
            {state.confirmText}
          </Button>
        </Modal.Footer>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de ConfirmProvider');
  return ctx;
}