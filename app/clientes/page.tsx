"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Cliente = {
  id: string;
  name: string;
  phone: string | null;
};

export default function Clientes() {
  const supabase = createClient();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function cargarClientes() {
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, phone")
      .order("name");

    if (error) {
      console.error("Error cargando clientes:", error);
      return;
    }

    setClientes(data || []);
  }

  useEffect(() => {
    cargarClientes();
  }, []);

  async function guardarCliente() {
    if (!nombre.trim()) {
      alert("Escribe el nombre del cliente.");
      return;
    }

    setGuardando(true);

    const { error } = await supabase.from("customers").insert({
      name: nombre.trim(),
      phone: telefono.trim() || null,
    });

    if (error) {
      console.error("Error guardando cliente:", error);
      alert("No se pudo guardar el cliente.");
      setGuardando(false);
      return;
    }

    setNombre("");
    setTelefono("");
    setMostrarFormulario(false);
    setGuardando(false);

    await cargarClientes();
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* ENCABEZADO */}
        <div className="mb-8">
          <button
            onClick={() => (window.location.href = "/")}
            className="mb-5 text-sm font-semibold text-slate-500 hover:text-black transition"
          >
            ← Volver al Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Clientes
              </h1>

              <p className="text-slate-500 mt-2">
                Administra los clientes de SmartCenter
              </p>
            </div>

            <button
              onClick={() => setMostrarFormulario(true)}
              className="bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-md font-semibold transition"
            >
              + Nuevo cliente
            </button>
          </div>
        </div>

        {/* CONTENIDO */}
        {clientes.length === 0 ? (
          <div className="bg-white border-2 border-slate-200 rounded-lg p-10 text-center">
            <div className="text-5xl mb-5">👤</div>

            <h2 className="text-xl font-bold text-slate-900">
              No hay clientes todavía
            </h2>

            <p className="text-slate-500 mt-2">
              Cuando agregues clientes aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden">

            {/* CABECERA DE LISTA */}
            <div className="p-5 border-b-2 border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                Clientes registrados
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {clientes.length}{" "}
                {clientes.length === 1 ? "cliente registrado" : "clientes registrados"}
              </p>
            </div>

            {/* LISTA */}
            <div className="divide-y divide-slate-200">
              {clientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="p-5 flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-4">

                    {/* AVATAR */}
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                      {cliente.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {cliente.name}
                      </p>

                      <p className="text-slate-500 text-sm mt-1">
                        {cliente.phone || "Sin teléfono"}
                      </p>
                    </div>
                  </div>

                  <span className="hidden sm:inline-flex rounded-md border-2 border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                    Cliente
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL NUEVO CLIENTE */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border-2 border-slate-200 rounded-lg p-6 w-full max-w-md shadow-xl">

              {/* CABECERA */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Nuevo cliente
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Registra la información del cliente.
                  </p>
                </div>

                <button
                  onClick={() => setMostrarFormulario(false)}
                  className="text-slate-400 hover:text-black text-2xl transition"
                >
                  ×
                </button>
              </div>

              {/* CAMPOS */}
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nombre completo
                  </label>

                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full p-3 rounded-md bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Teléfono
                  </label>

                  <input
                    type="text"
                    placeholder="Teléfono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full p-3 rounded-md bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 transition"
                  />
                </div>

              </div>

              {/* BOTONES */}
              <div className="flex gap-3 mt-6">

                <button
                  onClick={() => {
                    setMostrarFormulario(false);
                    setNombre("");
                    setTelefono("");
                  }}
                  className="flex-1 border-2 border-slate-200 hover:border-slate-400 text-slate-700 py-3 rounded-md font-semibold transition"
                >
                  Cancelar
                </button>

                <button
                  onClick={guardarCliente}
                  disabled={guardando}
                  className="flex-1 bg-slate-900 hover:bg-black text-white py-3 rounded-md font-semibold transition disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>

              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}