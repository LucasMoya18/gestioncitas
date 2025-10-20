import Swal from 'sweetalert2';

const swal = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-primary',
    cancelButton: 'btn btn-outline-secondary ms-2',
    denyButton: 'btn btn-warning ms-2',
    popup: 'rounded-4',
    title: 'fw-bold',
  },
  buttonsStyling: false,
  reverseButtons: true,
});

async function confirmAction({
  title = '¿Confirmar acción?',
  text = '',
  icon = 'question',
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar',
  showDenyButton = false,
  denyButtonText = 'No',
} = {}) {
  const res = await swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    showDenyButton,
    confirmButtonText,
    cancelButtonText,
    denyButtonText,
  });
  return res.isConfirmed;
}

function successToast(message = 'Operación exitosa') {
  return swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: message,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });
}

function errorToast(message = 'Ocurrió un error') {
  return swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'error',
    title: message,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
}

function infoToast(message = 'Información') {
  return swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'info',
    title: message,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });
}

function showLoading(title = 'Procesando...') {
  return swal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

function close() {
  return Swal.close();
}

function confirmDelete(item = 'registro') {
  return confirmAction({
    title: `¿Eliminar ${item}?`,
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    confirmButtonText: 'Sí, eliminar',
  });
}

function confirmUpdate(item = 'cambios') {
  return confirmAction({
    title: `¿Guardar ${item}?`,
    icon: 'question',
    confirmButtonText: 'Guardar',
  });
}

function confirmSchedule({ fecha, hora, medico, box }) {
  const text = [
    medico ? `Médico: ${medico}` : null,
    fecha ? `Fecha: ${fecha}` : null,
    hora ? `Hora: ${hora}` : null,
    box ? `Box: ${box}` : null,
  ].filter(Boolean).join(' • ');
  return confirmAction({
    title: '¿Confirmar agendamiento?',
    text,
    icon: 'question',
    confirmButtonText: 'Agendar',
  });
}

export const alerts = {
  confirmAction,
  confirmDelete,
  confirmUpdate,
  confirmSchedule,
  successToast,
  errorToast,
  infoToast,
  showLoading,
  close,
};