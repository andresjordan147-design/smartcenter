"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type WorkOrder = {
  id: string;
  work_order_number: number;
  customer_id: string | null;
  repair_id: string | null;
  status: string;
  title: string | null;
  description: string | null;
  estimated_price: number;
  final_price: number;
  amount_paid: number;
  notes: string | null;
  created_at: string;
};

type RepairInfo = {
  id: string;
  signature_reception: string | null;
  signature_delivery: string | null;
  signature_delivery_at: string | null;
};

type Cliente = {
  id: string;
  name: string;
};

export default function WorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [ordenSeleccionada, setOrdenSeleccionada] =
    useState<WorkOrder | null>(null);

    const [repairInfo, setRepairInfo] =
  useState<RepairInfo | null>(null);

const [firmaEntrega, setFirmaEntrega] =
  useState("");

const [dibujandoEntrega, setDibujandoEntrega] =
  useState(false);

const canvasEntregaRef =
  useRef<HTMLCanvasElement | null>(null);

const [guardandoEntrega, setGuardandoEntrega] =
  useState(false);

  const [cargando, setCargando] =
    useState(false);

  const [customerId, setCustomerId] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
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
      data: workOrdersData,
      error,
    } = await supabase
      .from("work_orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (clientesData) {
      setClientes(clientesData);
    }

    if (error) {
      console.error(error);

      alert(
        "No se pudieron cargar las Work Orders: " +
          error.message
      );

      return;
    }

    if (workOrdersData) {
      setWorkOrders(workOrdersData);
    }
  }

async function cargarRepairDeWorkOrder(
  workOrder: WorkOrder
) {
  setRepairInfo(null);

  if (!workOrder.repair_id) {
    return;
  }

  const { data, error } = await supabase
    .from("repairs")
    .select(
      "id, signature_reception, signature_delivery, signature_delivery_at"
    )
    .eq("id", workOrder.repair_id)
    .single();

  if (error) {
    console.error(
      "Error cargando reparación:",
      error
    );

    return;
  }

  setRepairInfo(data);
}

  async function guardarWorkOrder() {
    if (!customerId) {
      alert("Selecciona un cliente.");
      return;
    }

    if (!title.trim()) {
      alert(
        "Escribe un título para la Work Order."
      );
      return;
    }

    setCargando(true);

    const { error } = await supabase
      .from("work_orders")
      .insert({
        customer_id: customerId,

        title: title,

        description:
          description || null,

        estimated_price:
          Number(estimatedPrice) || 0,

        final_price:
          Number(finalPrice) || 0,

        amount_paid:
          Number(amountPaid) || 0,

        notes:
          notes || null,

        status: "open",
      });

    setCargando(false);

    if (error) {
      alert(
        "No se pudo guardar la Work Order: " +
          error.message
      );

      return;
    }

    alert(
      "Work Order creada correctamente."
    );

    limpiarFormulario();

    setMostrarFormulario(false);

    await cargarDatos();
  }

  function limpiarFormulario() {
    setCustomerId("");
    setTitle("");
    setDescription("");
    setEstimatedPrice("");
    setFinalPrice("");
    setAmountPaid("");
    setNotes("");
  }

  function limpiarFirmaEntrega() {
  const canvas =
    canvasEntregaRef.current;

  if (!canvas) return;

  const ctx =
    canvas.getContext("2d");

  if (!ctx) return;

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  setFirmaEntrega("");
}

async function confirmarEntrega() {
  if (!ordenSeleccionada) {
    alert(
      "No hay una Work Order seleccionada."
    );

    return;
  }

  if (!ordenSeleccionada.repair_id) {
    alert(
      "Esta Work Order no está vinculada a una reparación."
    );

    return;
  }

  if (!firmaEntrega) {
    alert(
      "El cliente debe firmar antes de confirmar la entrega."
    );

    return;
  }

  if (saldoOrden(ordenSeleccionada) > 0) {
    const confirmarPagoPendiente =
      window.confirm(
        `Esta orden todavía tiene un saldo pendiente de $${saldoOrden(
          ordenSeleccionada
        ).toFixed(
          2
        )}.\n\n¿Deseas continuar con la entrega?`
      );

    if (!confirmarPagoPendiente) {
      return;
    }
  }

  setGuardandoEntrega(true);

  const ahora =
    new Date().toISOString();

  const { data: repairActualizada, error: repairError } =
  await supabase
    .from("repairs")
    .update({
      signature_delivery: firmaEntrega,
      signature_delivery_at: ahora,
      status: "delivered",
    })
    .eq(
      "id",
      ordenSeleccionada.repair_id
    )
    .select(
      "id, signature_delivery, signature_delivery_at, status"
    );

if (repairError) {
  console.error(
    "Error guardando firma de entrega:",
    repairError
  );

  alert(
    "No se pudo guardar la firma de entrega:\n\n" +
      repairError.message
  );

  setGuardandoEntrega(false);

  return;
}

if (!repairActualizada) {
  alert(
    "La firma no fue guardada porque no se encontró la reparación vinculada."
  );

  setGuardandoEntrega(false);

  return;
}

console.log(
  "Reparación actualizada correctamente:",
  repairActualizada
);

  const { error: workOrderError } =
    await supabase
      .from("work_orders")
      .update({
        status: "completed",
      })
      .eq(
        "id",
        ordenSeleccionada.id
      );

  setRepairInfo((actual) => ({
    ...(actual || {
      id:
        ordenSeleccionada.repair_id ||
        "",
      signature_reception:
        null,
    }),

    signature_delivery:
      firmaEntrega,

    signature_delivery_at:
      ahora,
  }));

  setOrdenSeleccionada({
    ...ordenSeleccionada,
    status: "completed",
  });

  setWorkOrders((actuales) =>
    actuales.map((workOrder) =>
      workOrder.id ===
      ordenSeleccionada.id
        ? {
            ...workOrder,
            status: "completed",
          }
        : workOrder
    )
  );

  setGuardandoEntrega(false);

  alert(
    "Entrega confirmada correctamente."
  );
}

  async function cambiarEstado(
    id: string,
    nuevoEstado: string
  ) {
    const { error } = await supabase
      .from("work_orders")
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

    setWorkOrders((actuales) =>
      actuales.map((workOrder) =>
        workOrder.id === id
          ? {
              ...workOrder,
              status: nuevoEstado,
            }
          : workOrder
      )
    );

    setOrdenSeleccionada((actual) => {
      if (!actual || actual.id !== id) {
        return actual;
      }

      return {
        ...actual,
        status: nuevoEstado,
      };
    });
  }

  function nombreCliente(
    id: string | null
  ) {
    if (!id) {
      return "Sin cliente";
    }

    return (
      clientes.find(
        (cliente) =>
          cliente.id === id
      )?.name ||
      "Cliente desconocido"
    );
  }

  function saldoOrden(
    workOrder: WorkOrder
  ) {
    return Math.max(
      Number(
        workOrder.final_price || 0
      ) -
        Number(
          workOrder.amount_paid || 0
        ),
      0
    );
  }

  function textoEstado(
    estado: string
  ) {
    switch (estado) {
      case "open":
        return "Abierta";

      case "in_progress":
        return "En progreso";

      case "ready":
        return "Lista";

      case "completed":
        return "Completada";

      case "cancelled":
        return "Cancelada";

      default:
        return estado;
    }
  }

  function claseEstado(
    estado: string
  ) {
    switch (estado) {
      case "open":
        return "border-slate-300 bg-slate-50 text-slate-800";

      case "in_progress":
        return "border-slate-400 bg-slate-100 text-slate-900";

      case "ready":
        return "border-slate-500 bg-slate-200 text-slate-900";

      case "completed":
        return "border-slate-700 bg-slate-900 text-white";

      case "cancelled":
        return "border-slate-400 bg-white text-slate-500";

      default:
        return "border-slate-300 bg-slate-50 text-slate-700";
    }
  }

  function formatearFecha(
    fecha: string
  ) {
    return new Date(
      fecha
    ).toLocaleDateString(
      "es-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  }

  /*
   * ============================================================
   * VISTA DE DETALLE
   * ============================================================
   */

  if (ordenSeleccionada) {
    const orden = ordenSeleccionada;

    const cliente =
      clientes.find(
        (item) =>
          item.id ===
          orden.customer_id
      );

    const total =
      Number(
        orden.final_price || 0
      );

    const pagado =
      Number(
        orden.amount_paid || 0
      );

    const saldo =
      saldoOrden(orden);

    return (
      <main className="min-h-screen bg-white text-slate-900">

        <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">

          {/* ====================================================
              VOLVER
          ==================================================== */}

          <button
            onClick={() =>
              setOrdenSeleccionada(null)
            }
            className="mb-6 rounded-md border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Volver a Work Orders
          </button>

          {/* ====================================================
              ENCABEZADO DE LA ORDEN
          ==================================================== */}

          <section className="overflow-hidden rounded-lg border-2 border-slate-300 bg-white">

            <div className="border-b-2 border-slate-300 p-5 md:p-6">

              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <span className="rounded-md border-2 border-slate-900 bg-slate-900 px-3 py-1.5 text-sm font-bold text-white">

                      WO-
                      {String(
                        orden.work_order_number
                      ).padStart(4, "0")}

                    </span>

                    <span className="text-xs text-slate-400">
                      Creada el{" "}
                      {formatearFecha(
                        orden.created_at
                      )}
                    </span>

                  </div>

                  <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
                    {cliente?.name ||
                      "Cliente desconocido"}
                  </h1>

                  <p className="mt-1 text-base text-slate-500">
                    {orden.title ||
                      "Sin título"}
                  </p>

                </div>

                <div className="w-full md:w-[210px]">

                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Estado de la orden
                  </p>

                  <select
                    value={
                      orden.status
                    }
                    onChange={(e) =>
                      cambiarEstado(
                        orden.id,
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-md border-2 border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  >

                    <option value="open">
                      Abierta
                    </option>

                    <option value="in_progress">
                      En progreso
                    </option>

                    <option value="ready">
                      Lista
                    </option>

                    <option value="completed">
                      Completada
                    </option>

                    <option value="cancelled">
                      Cancelada
                    </option>

                  </select>

                </div>

              </div>

            </div>

            {/* ==================================================
                RESUMEN SUPERIOR
            ================================================== */}

            <div className="grid gap-4 border-b-2 border-slate-300 bg-slate-50 p-5 md:grid-cols-4">

              <DetailStat
                label="Cliente"
                value={
                  cliente?.name ||
                  "Sin cliente"
                }
              />

              <DetailStat
                label="Estado"
                value={textoEstado(
                  orden.status
                )}
              />

              <DetailStat
                label="Total"
                value={`$${total.toFixed(
                  2
                )}`}
              />

              <DetailStat
                label="Saldo"
                value={`$${saldo.toFixed(
                  2
                )}`}
              />

            </div>

          </section>

          {/* ====================================================
              CONTENIDO
          ==================================================== */}

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">

            {/* COLUMNA PRINCIPAL */}

            <div className="space-y-5">

              {/* SUMMARY */}

              <section className="overflow-hidden rounded-lg border-2 border-slate-300 bg-white">

                <SectionHeader
                  title="Summary"
                  description="Información principal de la Work Order."
                />

                <div className="grid gap-4 p-5 md:grid-cols-2">

                  <DetailRow
                    label="Cliente"
                    value={
                      cliente?.name ||
                      "Sin cliente"
                    }
                  />

                  <DetailRow
                    label="Tipo / Servicio"
                    value={
                      orden.title ||
                      "No especificado"
                    }
                  />

                  <DetailRow
                    label="Repair ID"
                    value={
                      orden.repair_id ||
                      "No asociado"
                    }
                  />

                  <DetailRow
                    label="Work Order ID"
                    value={orden.id}
                  />

                </div>

              </section>

              {/* DESCRIPCIÓN */}

              <section className="overflow-hidden rounded-lg border-2 border-slate-300 bg-white">

                <SectionHeader
                  title="Descripción"
                  description="Problema o trabajo registrado en esta orden."
                />

                <div className="p-5">

                  <div className="min-h-[110px] rounded-md border-2 border-slate-300 bg-slate-50 p-4">

                    <p className="whitespace-pre-line text-sm leading-6 text-slate-700">

                      {orden.description ||
                        "No hay una descripción registrada."}

                    </p>

                  </div>

                </div>

              </section>

              {/* REPARACIÓN */}

              <section className="overflow-hidden rounded-lg border-2 border-slate-300 bg-white">

                <SectionHeader
                  title="Reparación"
                  description="Información relacionada con la reparación registrada."
                />

                <div className="p-5">

                  <div className="rounded-md border-2 border-slate-300 bg-white p-4">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Servicio registrado
                        </p>

                        <p className="mt-1 font-bold text-slate-900">
                          {orden.title ||
                            "Reparación"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {orden.repair_id
                            ? "Esta Work Order está vinculada a una reparación."
                            : "Esta Work Order no tiene una reparación vinculada."}
                        </p>

                      </div>

                      <div className="text-left sm:text-right">

                        <p className="text-xs text-slate-400">
                          Precio
                        </p>

                        <p className="text-xl font-bold">
                          $
                          {total.toFixed(
                            2
                          )}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* BOTÓN FUTURO DE REPARACIÓN */}

                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "La función de agregar una segunda reparación la vamos a conectar después de crear la estructura de múltiples reparaciones en Supabase."
                      )
                    }
                    className="mt-4 w-full rounded-md border-2 border-slate-900 bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    + Agregar reparación
                  </button>

                </div>

              </section>

              {/* NOTAS */}

              <section className="overflow-hidden rounded-lg border-2 border-slate-300 bg-white">

                <SectionHeader
                  title="Notas"
                  description="Información adicional de la orden."
                />

                <div className="p-5">

                  <div className="min-h-[100px] rounded-md border-2 border-slate-300 bg-slate-50 p-4">

                    <p className="whitespace-pre-line text-sm leading-6 text-slate-700">

                      {orden.notes ||
                        "No hay notas registradas."}

                    </p>

                  </div>

                </div>

              </section>

            </div>

            {/* =====================================================
    ENTREGA DEL EQUIPO
===================================================== */}

<section className="overflow-hidden rounded-lg border-2 border-slate-300 bg-white">

  <SectionHeader
    title="Entrega del equipo"
    description="Firma del cliente al recoger el dispositivo."
  />

  <div className="p-5">

    {repairInfo?.signature_delivery ? (

      <div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-bold text-slate-900">
              ✓ Equipo entregado
            </p>

            {repairInfo.signature_delivery_at && (
              <p className="mt-1 text-xs text-slate-500">
                Entregado el{" "}
                {new Date(
                  repairInfo.signature_delivery_at
                ).toLocaleString()}
              </p>
            )}
          </div>

          <span className="w-fit rounded-md border-2 border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
            FIRMA REGISTRADA
          </span>

        </div>

        <div className="overflow-hidden rounded-lg border-2 border-slate-300 bg-white">

          <img
            src={repairInfo.signature_delivery}
            alt="Firma de entrega del cliente"
            className="block h-auto max-h-[300px] w-full object-contain"
          />

        </div>

      </div>

    ) : (

      <div>

        <div className="mb-4 rounded-md border-2 border-slate-200 bg-slate-50 p-4">

          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Confirmación de entrega
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            Al firmar, el cliente confirma que ha recibido
            el equipo y que la entrega ha sido realizada.
          </p>

        </div>

        <div className="mb-2 flex items-center justify-between">

          <div>
            <p className="text-sm font-bold text-slate-900">
              Firma del cliente
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Firme con el dedo, stylus o mouse.
            </p>
          </div>

          {firmaEntrega && (
            <span className="rounded-md border-2 border-slate-300 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
              ✓ Firma registrada
            </span>
          )}

        </div>

        <div className="overflow-hidden rounded-lg border-2 border-slate-300 bg-white">

          <canvas
            ref={canvasEntregaRef}
            width={1200}
            height={300}

            onPointerDown={(e) => {

              const canvas = e.currentTarget;
              const ctx = canvas.getContext("2d");

              if (!ctx) return;

              canvas.setPointerCapture(e.pointerId);

              ctx.beginPath();

              ctx.moveTo(
                e.nativeEvent.offsetX,
                e.nativeEvent.offsetY
              );

              ctx.lineWidth = 3;
              ctx.lineCap = "round";
              ctx.lineJoin = "round";
              ctx.strokeStyle = "#0f172a";

              setDibujandoEntrega(true);
            }}

            onPointerMove={(e) => {

              if (!dibujandoEntrega) {
                return;
              }

              const canvas = e.currentTarget;
              const ctx = canvas.getContext("2d");

              if (!ctx) return;

              ctx.lineTo(
                e.nativeEvent.offsetX,
                e.nativeEvent.offsetY
              );

              ctx.stroke();
            }}

            onPointerUp={() => {

              const canvas =
                canvasEntregaRef.current;

              if (!canvas) return;

              setDibujandoEntrega(false);

              setFirmaEntrega(
                canvas.toDataURL("image/png")
              );
            }}

            onPointerCancel={() => {
              setDibujandoEntrega(false);
            }}

            className="block h-[220px] w-full touch-none bg-white"
          />

        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">

          <button
            type="button"
            onClick={limpiarFirmaEntrega}
            className="rounded-md border-2 border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Limpiar firma
          </button>

          <button
            type="button"
            onClick={confirmarEntrega}
            disabled={
              guardandoEntrega ||
              !firmaEntrega
            }
            className="flex-1 rounded-md border-2 border-slate-900 bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {guardandoEntrega
              ? "Guardando entrega..."
              : "✓ Confirmar entrega"}
          </button>

        </div>

      </div>

    )}

  </div>

</section>

            {/* ==================================================
                COLUMNA DERECHA
            ================================================== */}

            <div className="space-y-5">

              {/* ESTADO */}

              <section className="overflow-hidden rounded-lg border-2 border-slate-300 bg-white">

                <SectionHeader
                  title="Estado"
                  description="Progreso actual."
                />

                <div className="p-5">

                  <div
                    className={`rounded-md border-2 p-4 text-center ${claseEstado(
                      orden.status
                    )}`}
                  >

                    <p className="text-xs font-bold uppercase tracking-wider">
                      Estado actual
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {textoEstado(
                        orden.status
                      )}
                    </p>

                  </div>

                  {/* PROGRESO */}

                  <div className="mt-5 space-y-3">

                    <ProgressStep
                      label="Recibido"
                      active={true}
                      completed={
                        orden.status !==
                        "open"
                      }
                    />

                    <ProgressStep
                      label="Diagnóstico"
                      active={
                        orden.status ===
                          "in_progress" ||
                        orden.status ===
                          "ready" ||
                        orden.status ===
                          "completed"
                      }
                      completed={
                        orden.status ===
                          "ready" ||
                        orden.status ===
                          "completed"
                      }
                    />

                    <ProgressStep
                      label="Reparación"
                      active={
                        orden.status ===
                          "in_progress" ||
                        orden.status ===
                          "ready" ||
                        orden.status ===
                          "completed"
                      }
                      completed={
                        orden.status ===
                          "ready" ||
                        orden.status ===
                          "completed"
                      }
                    />

                    <ProgressStep
                      label="Listo"
                      active={
                        orden.status ===
                          "ready" ||
                        orden.status ===
                          "completed"
                      }
                      completed={
                        orden.status ===
                        "completed"
                      }
                    />

                    <ProgressStep
                      label="Entregado"
                      active={
                        orden.status ===
                        "completed"
                      }
                      completed={
                        orden.status ===
                        "completed"
                      }
                    />

                  </div>

                </div>

              </section>

              {/* DINERO */}

              <section className="overflow-hidden rounded-lg border-2 border-slate-300 bg-white">

                <SectionHeader
                  title="Pago"
                  description="Resumen financiero."
                />

                <div className="space-y-4 p-5">

                  <MoneyRow
                    label="Precio estimado"
                    value={
                      Number(
                        orden.estimated_price ||
                          0
                      )
                    }
                  />

                  <MoneyRow
                    label="Precio final"
                    value={total}
                  />

                  <MoneyRow
                    label="Pagado"
                    value={pagado}
                  />

                  <div className="border-t-2 border-slate-300 pt-4">

                    <div className="flex items-center justify-between">

                      <span className="font-bold text-slate-900">
                        Saldo
                      </span>

                      <span className="text-2xl font-bold text-slate-900">
                        $
                        {saldo.toFixed(
                          2
                        )}
                      </span>

                    </div>

                  </div>

                </div>

              </section>

              {/* INFORMACIÓN */}

              <section className="overflow-hidden rounded-lg border-2 border-slate-300 bg-white">

                <SectionHeader
                  title="Información"
                  description="Datos de esta Work Order."
                />

                <div className="space-y-4 p-5">

                  <DetailRow
                    label="Número"
                    value={`WO-${String(
                      orden.work_order_number
                    ).padStart(
                      4,
                      "0"
                    )}`}
                  />

                  <DetailRow
                    label="Creada"
                    value={formatearFecha(
                      orden.created_at
                    )}
                  />

                  <DetailRow
                    label="Cliente"
                    value={
                      cliente?.name ||
                      "Sin cliente"
                    }
                  />

                  <DetailRow
                    label="Repair ID"
                    value={
                      orden.repair_id ||
                      "No asociado"
                    }
                  />

                </div>

              </section>

            </div>

          </div>

        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * LISTA DE WORK ORDERS
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-white text-slate-900">

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">

        {/* ====================================================
            ENCABEZADO
        ==================================================== */}

        <div className="mb-6">

          <button
            onClick={() =>
              (window.location.href = "/")
            }
            className="mb-5 rounded-md border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Volver al Dashboard
          </button>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2">

                <span className="rounded-md border-2 border-slate-300 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Work Orders
                </span>

                <span className="text-xs text-slate-400">
                  Gestión de órdenes
                </span>

              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Work Orders
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Administra las órdenes de trabajo de SmartCenter.
              </p>

            </div>

            <button
              onClick={() =>
                setMostrarFormulario(true)
              }
              className="rounded-md border-2 border-slate-900 bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              + Nueva Work Order
            </button>

          </div>

        </div>

        {/* ====================================================
            LISTADO
        ==================================================== */}

        <div className="overflow-hidden rounded-lg border-2 border-slate-300 bg-white">

          <div className="flex flex-col gap-2 border-b-2 border-slate-300 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="font-bold">
                Órdenes de trabajo
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {workOrders.length} orden
                {workOrders.length !==
                1
                  ? "es"
                  : ""}{" "}
                registrada
                {workOrders.length !==
                1
                  ? "s"
                  : ""}
              </p>

            </div>

            <div className="rounded-md border-2 border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
              {workOrders.length} órdenes
            </div>

          </div>

          {workOrders.length ===
          0 ? (

            <div className="p-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border-2 border-slate-300 bg-slate-50 text-2xl">
                📋
              </div>

              <h3 className="mt-5 text-lg font-bold">
                No hay Work Orders todavía
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Crea tu primera orden de trabajo.
              </p>

            </div>

          ) : (

            <div className="space-y-4 p-4 md:p-5">

              {workOrders.map(
                (workOrder) => (

                  <button
                    key={
                      workOrder.id
                    }
                    type="button"
                    onClick={() => {
  setOrdenSeleccionada(workOrder);

  cargarRepairDeWorkOrder(
    workOrder
  );
}}
                    className="block w-full rounded-lg border-2 border-slate-300 bg-white p-5 text-left transition hover:border-slate-500 hover:bg-slate-50"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-3">

                          <span className="rounded-md border-2 border-slate-900 bg-slate-900 px-3 py-1.5 text-sm font-bold text-white">

                            WO-
                            {String(
                              workOrder.work_order_number
                            ).padStart(
                              4,
                              "0"
                            )}

                          </span>

                          <span className="text-xs text-slate-400">
                            {new Date(
                              workOrder.created_at
                            ).toLocaleDateString()}
                          </span>

                        </div>

                        <h3 className="mt-4 text-lg font-bold">
                          {nombreCliente(
                            workOrder.customer_id
                          )}
                        </h3>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {workOrder.title ||
                            "Sin título"}
                        </p>

                        {workOrder.description && (

                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            {workOrder.description}
                          </p>

                        )}

                      </div>

                      <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-[430px]">

                        <MiniMoney
                          label="Total"
                          value={
                            Number(
                              workOrder.final_price ||
                                0
                            )
                          }
                        />

                        <MiniMoney
                          label="Pagado"
                          value={
                            Number(
                              workOrder.amount_paid ||
                                0
                            )
                          }
                        />

                        <MiniMoney
                          label="Saldo"
                          value={saldoOrden(
                            workOrder
                          )}
                        />

                        <div className="sm:col-span-3">

                          <div className="flex items-center justify-between gap-3">

                            <span
                              className={`rounded-md border-2 px-3 py-1.5 text-xs font-bold ${claseEstado(
                                workOrder.status
                              )}`}
                            >
                              {textoEstado(
                                workOrder.status
                              )}
                            </span>

                            <span className="text-sm font-bold text-slate-400">
                              Ver detalles →
                            </span>

                          </div>

                        </div>

                      </div>

                    </div>

                  </button>

                )
              )}

            </div>

          )}

        </div>

      </div>

      {/* ========================================================
          MODAL NUEVA WORK ORDER
      ======================================================== */}

      {mostrarFormulario && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">

          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-xl border-2 border-slate-300 bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b-2 border-slate-300 px-5 py-5">

              <div>

                <span className="inline-flex rounded-md border-2 border-slate-300 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Nueva orden
                </span>

                <h2 className="mt-2 text-xl font-bold">
                  Nueva Work Order
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Registra una nueva orden de trabajo.
                </p>

              </div>

              <button
                onClick={() => {
                  setMostrarFormulario(
                    false
                  );
                  limpiarFormulario();
                }}
                className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-slate-300 text-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              >
                ×
              </button>

            </div>

            <div className="space-y-5 p-5">

              <div>

                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Cliente *
                </label>

                <select
                  value={customerId}
                  onChange={(e) =>
                    setCustomerId(
                      e.target.value
                    )
                  }
                  className="h-12 w-full rounded-md border-2 border-slate-300 bg-white px-4 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
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

              <div>

                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Título *
                </label>

                <input
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  placeholder="Ej. Reparación de pantalla"
                  className="h-12 w-full rounded-md border-2 border-slate-300 bg-white px-4 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />

              </div>

              <div>

                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Descripción
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Describe el trabajo..."
                  rows={4}
                  className="w-full resize-none rounded-md border-2 border-slate-300 bg-white p-4 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />

              </div>

              <div className="grid gap-4 md:grid-cols-3">

                <MoneyInput
                  label="Precio estimado"
                  value={
                    estimatedPrice
                  }
                  onChange={
                    setEstimatedPrice
                  }
                />

                <MoneyInput
                  label="Precio final"
                  value={finalPrice}
                  onChange={
                    setFinalPrice
                  }
                />

                <MoneyInput
                  label="Cantidad pagada"
                  value={
                    amountPaid
                  }
                  onChange={
                    setAmountPaid
                  }
                />

              </div>

              <div>

                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Notas
                </label>

                <textarea
                  value={notes}
                  onChange={(e) =>
                    setNotes(
                      e.target.value
                    )
                  }
                  placeholder="Notas adicionales..."
                  rows={4}
                  className="w-full resize-none rounded-md border-2 border-slate-300 bg-white p-4 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />

              </div>

            </div>

            <div className="flex flex-col-reverse gap-3 border-t-2 border-slate-300 bg-slate-50 p-5 sm:flex-row">

              <button
                onClick={() => {
                  setMostrarFormulario(
                    false
                  );
                  limpiarFormulario();
                }}
                className="flex-1 rounded-md border-2 border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>

              <button
                onClick={
                  guardarWorkOrder
                }
                disabled={cargando}
                className="flex-1 rounded-md border-2 border-slate-900 bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {cargando
                  ? "Guardando..."
                  : "Guardar Work Order"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}


/* ===============================================================
   COMPONENTES VISUALES
=============================================================== */

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b-2 border-slate-300 px-5 py-4">

      <h2 className="font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}


function DetailStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border-2 border-slate-300 bg-white p-4">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}


function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border-2 border-slate-300 bg-white p-4">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}


function MoneyRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">

      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="font-bold text-slate-900">
        ${value.toFixed(2)}
      </span>

    </div>
  );
}


function MiniMoney({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-md border-2 border-slate-300 bg-slate-50 p-3">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-base font-bold text-slate-900">
        ${value.toFixed(2)}
      </p>

    </div>
  );
}


function MoneyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <input
        type="number"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder="0.00"
        className="h-12 w-full rounded-md border-2 border-slate-300 bg-white px-4 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />

    </div>
  );
}


function ProgressStep({
  label,
  active,
  completed,
}: {
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-3">

      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
          completed
            ? "border-slate-900 bg-slate-900 text-white"
            : active
            ? "border-slate-500 bg-slate-100 text-slate-900"
            : "border-slate-300 bg-white text-slate-400"
        }`}
      >
        {completed
          ? "✓"
          : "•"}
      </div>

      <span
        className={`text-sm ${
          active
            ? "font-bold text-slate-900"
            : "text-slate-400"
        }`}
      >
        {label}
      </span>

    </div>
  );
}