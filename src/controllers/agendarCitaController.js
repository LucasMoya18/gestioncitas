export const agendarCitaController = {
  async getPacientes() {
    const res = await fetch("http://10.60.49.43:8000/api/pacientes");
    if (!res.ok) return [];
    const data = await res.json();
    return data;
  },
  async getMedicos() {
    const res = await fetch("http://10.60.49.43:8000/api/medicos");
    if (!res.ok) return [];
    return await res.json();
  },
  async registrarUsuarioPorRut(rut) {
    // Registra usuario mínimo con rut y rol Paciente
    const body = {
      usuario: {
        nombre: "Paciente",
        correo: `${rut}@mail.com`,
        password: rut, // Puedes pedir contraseña real
        telefono: "",
        rut,
        rol: "Paciente",
      },
      direccion: "",
    };
    const res = await fetch("http://10.60.49.43:8000/api/registrar/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  },
  async agendarCitaPaciente({ rut, medico, fechaHora, prioridad }) {
    // Busca el paciente por rut para obtener el ID
    const pacientesRes = await fetch("http://10.60.49.43:8000/api/pacientes");
    const pacientes = await pacientesRes.json();
    const pacienteObj = pacientes.find((p) => p.usuario.rut === rut);
    if (!pacienteObj) return { error: "Paciente no encontrado" };
    const body = {
      paciente: pacienteObj.usuario.id,
      medico,
      fechaHora,
      prioridad,
    };
    const res = await fetch("http://10.60.49.43:8000/api/citas/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  },
};