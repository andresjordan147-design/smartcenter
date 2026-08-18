"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type Cliente = {
  id: string;
  name: string;
};

type Reparacion = {
  id: string;
  repair_number: number;
  device_brand: string | null;
  device_model: string | null;
  imei: string | null;
  problem: string;
  status: string;
  estimated_price: number;
  final_price: number;
  amount_paid: number;
};

const estados = [
  {
    value: "received",
    label: "Recibido",
    icon: "📥",
  },
  {
    value: "in_repair",
    label: "En reparación",
    icon: "🔧",
  },
  {
    value: "ready",
    label: "Listo para recoger",
    icon: "✅",
  },
  {
    value: "delivered",
    label: "Entregado",
    icon: "📦",
  },
];

function obtenerEstado(status: string) {
  return (
    estados.find(
      (estado) => estado.value === status
    ) || {
      value: status,
      label: status,
      icon: "•",
    }
  );
}

function obtenerClaseEstado(status: string) {
  switch (status) {
    case "received":
      return "border-slate-300 bg-slate-50 text-slate-700";

    case "in_repair":
      return "border-slate-400 bg-slate-100 text-slate-800";

    case "ready":
      return "border-slate-500 bg-slate-200 text-slate-900";

    case "delivered":
      return "border-slate-800 bg-slate-900 text-white";

    default:
      return "border-slate-300 bg-white text-slate-700";
  }
}

export default function Reparaciones() {
  const [clientes, setClientes] =
    useState<Cliente[]>([]);

  const [reparaciones, setReparaciones] =
    useState<Reparacion[]>([]);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [cargando, setCargando] =
    useState(false);

  const [busqueda, setBusqueda] =
    useState("");

  const [filtroEstado, setFiltroEstado] =
    useState("all");

  const [customerId, setCustomerId] =
    useState("");

  const [deviceBrand, setDeviceBrand] =
    useState("");

  const [deviceModel, setDeviceModel] =
    useState("");

  const [imei, setImei] =
    useState("");

  const [problem, setProblem] =
    useState("");

  const [diagnosis, setDiagnosis] =
    useState("");

  const [estimatedPrice, setEstimatedPrice] =
    useState("");

  const [finalPrice, setFinalPrice] =
    useState("");

  const [amountPaid, setAmountPaid] =
    useState("");

  const [notes, setNotes] =
    useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const { data: clientesData } =
      await supabase
        .from("customers")
        .select("id, name")
        .order("name");

    const {
      data: reparacionesData,
      error,
    } = await supabase
      .from("repairs")
      .select(
        "id, repair_number, device_brand, device_model, imei, problem, status, estimated_price, final_price, amount_paid"
      )
      .order("created_at", {
        ascending: false,
      });

    if (clientesData) {
      setClientes(clientesData);
    }

    if (error) {
      console.error(
        "Error cargando reparaciones:",
        error
      );

      return;
    }

    if (reparacionesData) {
      setReparaciones(
        reparacionesData
      );
    }
  }

  async function guardarReparacion() {
    if (!customerId) {
      alert("Selecciona un cliente.");
      return;
    }

    if (!problem.trim()) {
      alert(
        "Escribe el problema del equipo."
      );
      return;
    }

    setCargando(true);

    const { error } =
      await supabase
        .from("repairs")
        .insert({
          customer_id: customerId,

          device_brand:
            deviceBrand || null,

          device_model:
            deviceModel || null,

          imei:
            imei || null,

          problem: problem,

          diagnosis:
            diagnosis || null,

          status: "received",

          estimated_price:
            Number(
              estimatedPrice
            ) || 0,

          final_price:
            Number(
              finalPrice
            ) || 0,

          amount_paid:
            Number(
              amountPaid
            ) || 0,

          notes:
            notes || null,
        });

    setCargando(false);

    if (error) {
      alert(
        "No se pudo guardar la reparación: " +
          error.message
      );

      return;
    }

    alert(
      "Reparación guardada correctamente."
    );

    limpiarFormulario();

    setMostrarFormulario(false);

    cargarDatos();
  }

  function limpiarFormulario() {
    setCustomerId("");
    setDeviceBrand("");
    setDeviceModel("");
    setImei("");
    setProblem("");
    setDiagnosis("");
    setEstimatedPrice("");
    setFinalPrice("");
    setAmountPaid("");
    setNotes("");
  }

  async function cambiarEstado(
    id: string,
    nuevoEstado: string
  ) {
    const { error } =
      await supabase
        .from("repairs")
        .update({
          status: nuevoEstado,
        })
        .eq("id", id);

    if (error) {
      alert(
        "No se pudo actualizar el estado: " +
          error.message
      );

      return;
    }

    setReparaciones(
      (actuales) =>
        actuales.map(
          (reparacion) =>
            reparacion.id === id
              ? {
                  ...reparacion,
                  status:
                    nuevoEstado,
                }
              : reparacion
        )
    );
  }

  const reparacionesFiltradas =
    reparaciones.filter(
      (reparacion) => {
        const texto =
          busqueda.toLowerCase();

        const coincideBusqueda =
          reparacion.repair_number
            .toString()
            .includes(texto) ||
          (
            reparacion.device_brand ||
            ""
          )
            .toLowerCase()
            .includes(texto) ||
          (
            reparacion.device_model ||
            ""
          )
            .toLowerCase()
            .includes(texto) ||
          reparacion.problem
            .toLowerCase()
            .includes(texto);

        const coincideEstado =
          filtroEstado === "all" ||
          reparacion.status ===
            filtroEstado;

        return (
          coincideBusqueda &&
          coincideEstado
        );
      }
    );

  return (
    <main className="min-h-screen bg-white text-slate-900">

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">

        {/* =====================================================
            ENCABEZADO
        ===================================================== */}

        <div className="mb-7">

          <button
            onClick={() =>
              (window.location.href = "/")
            }
            className="mb-5 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            ← Volver al Dashboard
          </button>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="mb-2 inline-flex rounded-md border-2 border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Reparaciones
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Reparaciones
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Administra y controla el estado de las reparaciones.
              </p>

            </div>

            <button
              onClick={() =>
                setMostrarFormulario(true)
              }
              className="rounded-md border-2 border-slate-900 bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-black"
            >
              + Nueva reparación
            </button>

          </div>

        </div>

        {/* =====================================================
            BUSCADOR Y FILTROS
        ===================================================== */}

        <div className="mb-6 rounded-lg border-2 border-slate-200 bg-white p-4">

          <div className="flex flex-col gap-3 md:flex-row">

            <div className="relative flex-1">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(
                    e.target.value
                  )
                }
                placeholder="Buscar por reparación, equipo o problema..."
                className="h-12 w-full rounded-md border-2 border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              />

            </div>

            <select
              value={filtroEstado}
              onChange={(e) =>
                setFiltroEstado(
                  e.target.value
                )
              }
              className="h-12 w-full rounded-md border-2 border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100 md:w-64"
            >

              <option value="all">
                Todos los estados
              </option>

              {estados.map(
                (estado) => (
                  <option
                    key={
                      estado.value
                    }
                    value={
                      estado.value
                    }
                  >
                    {estado.label}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

        {/* =====================================================
            LISTA
        ===================================================== */}

        <div className="overflow-hidden rounded-lg border-2 border-slate-200 bg-white">

          <div className="flex items-center justify-between border-b-2 border-slate-200 p-5">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Reparaciones
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {reparacionesFiltradas.length}{" "}
                reparación
                {reparacionesFiltradas.length !==
                1
                  ? "es"
                  : ""}
              </p>

            </div>

            <div className="rounded-md border-2 border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
              {reparacionesFiltradas.length}{" "}
              registros
            </div>

          </div>

          {reparacionesFiltradas.length ===
          0 ? (

            <div className="p-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border-2 border-slate-200 bg-slate-50 text-2xl">
                🔧
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                No encontramos reparaciones
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Intenta cambiar la búsqueda o el filtro.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-200">

              {reparacionesFiltradas.map(
                (reparacion) => {

                  const estado =
                    obtenerEstado(
                      reparacion.status
                    );

                  return (

                    <div
                      key={
                        reparacion.id
                      }
                      onClick={() => {
                        window.location.href =
                          `/reparaciones/${reparacion.id}`;
                      }}
                      className="cursor-pointer p-5 transition hover:bg-slate-50"
                    >

                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                        {/* INFORMACIÓN */}

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-3">

                            <span className="rounded-md border-2 border-slate-900 bg-slate-900 px-3 py-1.5 text-sm font-bold text-white">
                              #
                              {
                                reparacion.repair_number
                              }
                            </span>

                            <span className="text-xs font-semibold text-slate-400">
                              Reparación
                            </span>

                          </div>

                          <p className="mt-3 font-bold text-slate-900">
                            {reparacion.device_brand ||
                              "Sin marca"}{" "}
                            {reparacion.device_model ||
                              ""}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {reparacion.problem}
                          </p>

                          {reparacion.imei && (

                            <p className="mt-2 text-xs font-medium text-slate-400">
                              IMEI:{" "}
                              {
                                reparacion.imei
                              }
                            </p>

                          )}

                        </div>

                        {/* ESTADO Y PRECIO */}

                        <div
                          className="flex flex-col gap-3 md:items-end"
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        >

                          <select
                            value={
                              reparacion.status
                            }
                            onChange={(e) =>
                              cambiarEstado(
                                reparacion.id,
                                e.target.value
                              )
                            }
                            className="h-11 rounded-md border-2 border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                          >

                            {estados.map(
                              (
                                estadoItem
                              ) => (

                                <option
                                  key={
                                    estadoItem.value
                                  }
                                  value={
                                    estadoItem.value
                                  }
                                >
                                  {
                                    estadoItem.label
                                  }
                                </option>

                              )
                            )}

                          </select>

                          <span
                            className={`inline-flex w-fit rounded-md border-2 px-3 py-1.5 text-xs font-bold ${obtenerClaseEstado(
                              reparacion.status
                            )}`}
                          >
                            {estado.icon}{" "}
                            {estado.label}
                          </span>

                          <p className="text-xl font-bold text-slate-900">
                            $
                            {Number(
                              reparacion.final_price ||
                                0
                            ).toFixed(
                              2
                            )}
                          </p>

                          {Number(
                            reparacion.amount_paid ||
                              0
                          ) > 0 && (

                            <p className="text-xs font-semibold text-slate-500">
                              Pagado: $
                              {Number(
                                reparacion.amount_paid ||
                                  0
                              ).toFixed(
                                2
                              )}
                            </p>

                          )}

                        </div>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          FORMULARIO NUEVA REPARACIÓN
      ===================================================== */}

      {mostrarFormulario && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-lg border-2 border-slate-200 bg-white shadow-2xl">

            {/* CABECERA */}

            <div className="flex items-center justify-between border-b-2 border-slate-200 px-5 py-5">

              <div>

                <div className="mb-2 inline-flex rounded-md border-2 border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Nueva reparación
                </div>

                <h2 className="text-2xl font-bold text-slate-900">
                  Nueva reparación
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Registra un nuevo equipo.
                </p>

              </div>

              <button
                onClick={() => {
                  setMostrarFormulario(
                    false
                  );
                  limpiarFormulario();
                }}
                className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-slate-200 text-2xl font-bold text-slate-400 transition hover:bg-slate-50 hover:text-slate-900"
              >
                ×
              </button>

            </div>

            {/* FORMULARIO */}

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">

              {/* CLIENTE */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Cliente *
                </label>

                <select
                  value={customerId}
                  onChange={(e) =>
                    setCustomerId(
                      e.target.value
                    )
                  }
                  className="h-12 w-full rounded-md border-2 border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                >

                  <option value="">
                    Seleccionar cliente
                  </option>

                  {clientes.map(
                    (cliente) => (

                      <option
                        key={
                          cliente.id
                        }
                        value={
                          cliente.id
                        }
                      >
                        {cliente.name}
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* MARCA */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Marca
                </label>

                <input
                  value={deviceBrand}
                  onChange={(e) =>
                    setDeviceBrand(
                      e.target.value
                    )
                  }
                  placeholder="Ej. iPhone"
                  className="h-12 w-full rounded-md border-2 border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                />

              </div>

              {/* MODELO */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Modelo
                </label>

                <input
                  value={deviceModel}
                  onChange={(e) =>
                    setDeviceModel(
                      e.target.value
                    )
                  }
                  placeholder="Ej. iPhone 15 Pro"
                  className="h-12 w-full rounded-md border-2 border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                />

              </div>

              {/* IMEI */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  IMEI
                </label>

                <input
                  value={imei}
                  onChange={(e) =>
                    setImei(
                      e.target.value
                    )
                  }
                  placeholder="Número IMEI"
                  className="h-12 w-full rounded-md border-2 border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                />

              </div>

              {/* PROBLEMA */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Problema *
                </label>

                <textarea
                  value={problem}
                  onChange={(e) =>
                    setProblem(
                      e.target.value
                    )
                  }
                  placeholder="Describe el problema del equipo"
                  rows={3}
                  className="w-full resize-none rounded-md border-2 border-slate-200 bg-white p-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                />

              </div>

              {/* DIAGNÓSTICO */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Diagnóstico
                </label>

                <textarea
                  value={diagnosis}
                  onChange={(e) =>
                    setDiagnosis(
                      e.target.value
                    )
                  }
                  placeholder="Diagnóstico técnico"
                  rows={3}
                  className="w-full resize-none rounded-md border-2 border-slate-200 bg-white p-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                />

              </div>

              {/* PRECIO ESTIMADO */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Precio estimado
                </label>

                <input
                  type="number"
                  value={estimatedPrice}
                  onChange={(e) =>
                    setEstimatedPrice(
                      e.target.value
                    )
                  }
                  placeholder="0.00"
                  className="h-12 w-full rounded-md border-2 border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                />

              </div>

              {/* PRECIO FINAL */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Precio final
                </label>

                <input
                  type="number"
                  value={finalPrice}
                  onChange={(e) =>
                    setFinalPrice(
                      e.target.value
                    )
                  }
                  placeholder="0.00"
                  className="h-12 w-full rounded-md border-2 border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                />

              </div>

              {/* PAGADO */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Cantidad pagada
                </label>

                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) =>
                    setAmountPaid(
                      e.target.value
                    )
                  }
                  placeholder="0.00"
                  className="h-12 w-full rounded-md border-2 border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                />

              </div>

              {/* NOTAS */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Notas
                </label>

                <input
                  value={notes}
                  onChange={(e) =>
                    setNotes(
                      e.target.value
                    )
                  }
                  placeholder="Notas adicionales"
                  className="h-12 w-full rounded-md border-2 border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
                />

              </div>

            </div>

            {/* BOTONES */}

            <div className="flex flex-col-reverse gap-3 border-t-2 border-slate-200 bg-slate-50 p-5 sm:flex-row">

              <button
                onClick={() => {
                  setMostrarFormulario(
                    false
                  );
                  limpiarFormulario();
                }}
                className="flex-1 rounded-md border-2 border-slate-200 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancelar
              </button>

              <button
                onClick={
                  guardarReparacion
                }
                disabled={cargando}
                className="flex-1 rounded-md border-2 border-slate-900 bg-slate-900 py-3 font-semibold text-white transition hover:bg-black disabled:opacity-50"
              >
                {cargando
                  ? "Guardando..."
                  : "Guardar reparación"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}