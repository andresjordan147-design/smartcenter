"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

type Cliente = {
  id: string;
  name: string;
  phone: string | null;
};

type Motivo =
  | "Reparación"
  | "Diagnóstico"
  | "Venta"
  | "Garantía"
  | "Trade-In"
  | "Otro";

export default function CheckIn() {
  const supabase = createClient();

  // =========================================================
  // CLIENTE
  // =========================================================

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState("");

  // =========================================================
  // NUEVO CLIENTE
  // =========================================================

  const [mostrarNuevoCliente, setMostrarNuevoCliente] =
    useState(false);

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoTelefono, setNuevoTelefono] = useState("");
  const [creandoCliente, setCreandoCliente] =
    useState(false);

  // =========================================================
  // MOTIVO
  // =========================================================

  const [motivo, setMotivo] =
    useState<Motivo>("Reparación");

  // =========================================================
  // EQUIPO
  // =========================================================

  const [equipo, setEquipo] = useState("");
  const [imei, setImei] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [problema, setProblema] = useState("");

  // =========================================================
  // CONDICIÓN FÍSICA
  // =========================================================

  const [pantallaRota, setPantallaRota] =
    useState(false);

  const [golpes, setGolpes] =
    useState(false);

  const [equipoDoblado, setEquipoDoblado] =
    useState(false);

  const [camaraDañada, setCamaraDañada] =
    useState(false);

  const [noEnciende, setNoEnciende] =
    useState(false);

  const [dañoLiquido, setDañoLiquido] =
    useState(false);

  const [otroDaño, setOtroDaño] =
    useState(false);

  // =========================================================
  // OTROS
  // =========================================================

  const [accesorios, setAccesorios] =
    useState("");

  const [notas, setNotas] =
    useState("");

  // =========================================================
  // PRECIOS
  // =========================================================

  const [diagnosticoPrecio, setDiagnosticoPrecio] =
    useState("");

  const [reparacionPrecio, setReparacionPrecio] =
    useState("");

  const [deposito, setDeposito] =
    useState("");

  const [aprobado, setAprobado] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);

    // =========================================================
// FIRMA Y POLÍTICAS
// =========================================================

const [firma, setFirma] = useState("");

const canvasRef = useRef<HTMLCanvasElement | null>(null);

const [dibujando, setDibujando] =
  useState(false);

  // =========================================================
  // CARGAR CLIENTES
  // =========================================================

  useEffect(() => {
    cargarClientes();
  }, []);

  async function cargarClientes() {
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, phone")
      .order("name");

    if (error) {
      console.error(
        "Error cargando clientes:",
        error
      );

      return;
    }

    setClientes(data || []);
  }

  // =========================================================
  // CREAR CLIENTE NUEVO
  // =========================================================

  async function crearCliente() {
    const nombre = nuevoNombre.trim();
    const telefono = nuevoTelefono.trim();

    if (!nombre) {
      alert("Escribe el nombre del cliente.");
      return;
    }

    setCreandoCliente(true);

    try {
      const { data, error } = await supabase
        .from("customers")
        .insert({
          name: nombre,
          phone: telefono || null,
        })
        .select("id, name, phone")
        .single();

      if (error) {
        console.error(
          "Error creando cliente:",
          error
        );

        alert(
          "No se pudo crear el cliente:\n" +
            error.message
        );

        return;
      }

      if (!data) {
        alert(
          "El cliente no pudo ser creado."
        );

        return;
      }

      setClientes((actuales) => {
        const nuevaLista = [
          ...actuales,
          data,
        ];

        return nuevaLista.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      });

      setClienteId(data.id);

      setNuevoNombre("");
      setNuevoTelefono("");

      setMostrarNuevoCliente(false);

      alert(
        "Cliente creado correctamente."
      );
    } catch (error) {
      console.error(error);

      alert(
        "Ocurrió un error al crear el cliente."
      );
    } finally {
      setCreandoCliente(false);
    }
  }

  // =========================================================
  // CÁLCULOS
  // =========================================================

  const total =
    (Number(diagnosticoPrecio) || 0) +
    (Number(reparacionPrecio) || 0);

  const saldo =
    total -
    (Number(deposito) || 0);

  // =========================================================
  // LIMPIAR FORMULARIO
  // =========================================================

  function limpiarFirma() {
  const canvas = canvasRef.current;

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  setFirma("");
}

  function limpiarFormulario() {
    setClienteId("");

    setMotivo("Reparación");

    setEquipo("");
    setImei("");
    setContrasena("");
    setProblema("");

    setPantallaRota(false);
    setGolpes(false);
    setEquipoDoblado(false);
    setCamaraDañada(false);
    setNoEnciende(false);
    setDañoLiquido(false);
    setOtroDaño(false);

    setAccesorios("");
    setNotas("");

    setDiagnosticoPrecio("");
    setReparacionPrecio("");
    setDeposito("");

    setAprobado(false);

    setMostrarNuevoCliente(false);

    setNuevoNombre("");
    setNuevoTelefono("");

    setFirma("");
  }

  // =========================================================
  // CREAR CHECK-IN + REPARACIÓN + WORK ORDER
  // =========================================================

  async function crearOrden() {
    
    if (!firma) {
      alert(
        "El cliente debe firmar antes de crear la orden."
      );
      return;
    }
    
    if (!clienteId) {
      alert("Selecciona un cliente.");
      return;
    }

    if (!equipo.trim()) {
      alert("Escribe el equipo.");
      return;
    }

    if (!problema.trim()) {
      alert(
        "Describe el problema o motivo de la visita."
      );
      return;
    }

    setGuardando(true);

    try {
      const cliente = clientes.find(
        (c) => c.id === clienteId
      );

      if (!cliente) {
        alert(
          "No se encontró el cliente seleccionado."
        );
        return;
      }

      // =====================================================
      // CONSTRUIR INFORMACIÓN DE CONDICIÓN
      // =====================================================

      const condiciones: string[] = [];

      if (pantallaRota) {
        condiciones.push("Pantalla rota");
      }

      if (golpes) {
        condiciones.push("Golpes");
      }

      if (equipoDoblado) {
        condiciones.push("Equipo doblado");
      }

      if (camaraDañada) {
        condiciones.push("Cámara dañada");
      }

      if (noEnciende) {
        condiciones.push("No enciende");
      }

      if (dañoLiquido) {
        condiciones.push("Daño por líquido");
      }

      if (otroDaño) {
        condiciones.push("Otro daño");
      }

      const condicionTexto =
        condiciones.length > 0
          ? condiciones.join(", ")
          : "Sin daños físicos reportados";

      // =====================================================
      // CONSTRUIR NOTAS COMPLETAS
      // =====================================================

      const notasCompletas = [
        `Motivo: ${motivo}`,

        `IMEI / Serial: ${
          imei.trim() || "No proporcionado"
        }`,

        `Contraseña: ${
          contrasena.trim() || "No proporcionada"
        }`,

        `Condición física: ${condicionTexto}`,

        `Accesorios: ${
          accesorios.trim() ||
          "Ninguno especificado"
        }`,

        `Cliente aprobó precio: ${
          aprobado ? "Sí" : "No"
        }`,

        `Notas: ${
          notas.trim() || "Sin notas adicionales"
        }`,
      ].join("\n");

      // =====================================================
      // 1. CREAR REPARACIÓN
      // =====================================================

      const { data: repair, error: repairError } =
        await supabase
          .from("repairs")
          .insert({
            customer_id: clienteId,

            device_brand: equipo.trim(),

            device_model: equipo.trim(),

            imei: imei.trim() || null,

            problem: problema.trim(),

            diagnosis: null,

            status: "received",

            estimated_price: total,

            final_price: total,

            amount_paid:
              Number(deposito) || 0,

            notes: notasCompletas,

signature_reception: firma,

policies_accepted: true,
          })
          .select("id, repair_number")
          .single();

      if (repairError) {
        console.error(
          "Error creando reparación:",
          repairError
        );

        throw new Error(
          "No se pudo crear la reparación: " +
            repairError.message
        );
      }

      if (!repair) {
        throw new Error(
          "La reparación no fue creada correctamente."
        );
      }

      // =====================================================
      // 2. CREAR WORK ORDER
      // =====================================================

      const titulo =
        `${motivo} - ${equipo.trim()}`;

      const descripcion =
        `Cliente: ${cliente.name}\n` +
        `Equipo: ${equipo.trim()}\n` +
        `Problema: ${problema.trim()}\n` +
        `Motivo: ${motivo}`;

      const {
        data: workOrder,
        error: workOrderError,
      } = await supabase
        .from("work_orders")
        .insert({
          customer_id: clienteId,

          repair_id: repair.id,

          status: "open",

          title: titulo,

          description: descripcion,

          estimated_price: total,

          final_price: total,

          amount_paid:
            Number(deposito) || 0,

          notes: notasCompletas,

          visitType: motivo,
        })
        .select(
          "id, work_order_number"
        )
        .single();

      if (workOrderError) {
        console.error(
          "Error creando Work Order:",
          workOrderError
        );

        throw new Error(
          "La reparación fue creada, pero no se pudo crear la Work Order: " +
            workOrderError.message
        );
      }

      if (!workOrder) {
        throw new Error(
          "La Work Order no fue creada correctamente."
        );
      }

      // =====================================================
      // ÉXITO
      // =====================================================

      alert(
        "✓ CHECK-IN CREADO CORRECTAMENTE\n\n" +
          `Work Order: #${workOrder.work_order_number}\n` +
          `Reparación: #${repair.repair_number}\n\n` +
          `Cliente: ${cliente.name}\n` +
          `Equipo: ${equipo.trim()}\n` +
          `Motivo: ${motivo}\n` +
          `Total: $${total.toFixed(2)}\n` +
          `Depósito: $${(
            Number(deposito) || 0
          ).toFixed(2)}\n` +
          `Saldo: $${Math.max(
            saldo,
            0
          ).toFixed(2)}\n\n` +
          "La orden ya está registrada en Work Orders."
      );

      limpiarFormulario();
    } catch (error) {
      console.error(
        "ERROR CREANDO CHECK-IN:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al crear el Check-in."
      );
    } finally {
      setGuardando(false);
    }
  }

  const clienteSeleccionado =
    clientes.find(
      (cliente) =>
        cliente.id === clienteId
    );

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <div className="w-full bg-white text-slate-900">

      {/* =====================================================
          ENCABEZADO
      ===================================================== */}

      <div className="border-b-2 border-slate-300 bg-white px-5 py-6 md:px-8">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <span className="rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Check-in
              </span>

              <span className="text-xs text-slate-400">
                Nueva orden de trabajo
              </span>

            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Registrar cliente
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Registra la llegada del cliente y recopila
              toda la información del equipo.
            </p>

          </div>

          <button
            type="button"
            onClick={limpiarFormulario}
            className="rounded-md border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Limpiar formulario
          </button>

        </div>

      </div>

      {/* =====================================================
          CONTENIDO
      ===================================================== */}

      <div className="mx-auto max-w-[1400px] p-5 md:p-8">

        {/* ===================================================
            CLIENTE + RESUMEN
        =================================================== */}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">

          {/* CLIENTE */}

          <section className="rounded-lg border-2 border-slate-300 bg-white">

            <div className="border-b-2 border-slate-300 px-5 py-4">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="font-bold">
                    Cliente
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Selecciona un cliente existente
                    o crea uno nuevo.
                  </p>

                </div>

                <span className="text-xs font-semibold text-slate-400">
                  PASO 1
                </span>

              </div>

            </div>

            <div className="p-5">

              <div className="flex flex-col gap-3 md:flex-row">

                <select
                  value={clienteId}
                  onChange={(e) =>
                    setClienteId(
                      e.target.value
                    )
                  }
                  className="h-12 flex-1 rounded-md border-2 border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >

                  <option value="">
                    Seleccionar cliente
                  </option>

                  {clientes.map(
                    (cliente) => (
                      <option
                        key={cliente.id}
                        value={cliente.id}
                      >
                        {cliente.name}
                        {cliente.phone
                          ? ` — ${cliente.phone}`
                          : ""}
                      </option>
                    )
                  )}

                </select>

                <button
                  type="button"
                  onClick={() =>
                    setMostrarNuevoCliente(
                      true
                    )
                  }
                  className="h-12 rounded-md border-2 border-slate-900 bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  + Nuevo cliente
                </button>

              </div>

              {/* CLIENTE SELECCIONADO */}

              {clienteSeleccionado && (
                <div className="mt-4 flex items-center gap-3 rounded-md border-2 border-slate-300 bg-slate-50 p-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                    {clienteSeleccionado.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>

                    <p className="text-sm font-semibold">
                      {clienteSeleccionado.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {clienteSeleccionado.phone ||
                        "Sin teléfono registrado"}
                    </p>

                  </div>

                </div>
              )}

            </div>

          </section>

          {/* RESUMEN */}

          <section className="rounded-lg border-2 border-slate-300 bg-slate-50">

            <div className="border-b-2 border-slate-300 px-5 py-4">

              <h2 className="font-bold">
                Resumen
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Información actual de la orden.
              </p>

            </div>

            <div className="space-y-4 p-5">

              <Info label="Cliente">
                {clienteSeleccionado?.name ||
                  "No seleccionado"}
              </Info>

              <Info label="Motivo">
                {motivo}
              </Info>

              <Info label="Equipo">
                {equipo ||
                  "No especificado"}
              </Info>

              <div className="border-t-2 border-slate-300 pt-4">

                <div className="flex justify-between">

                  <span className="text-sm text-slate-500">
                    Total
                  </span>

                  <strong>
                    ${total.toFixed(2)}
                  </strong>

                </div>

                <div className="mt-2 flex justify-between">

                  <span className="text-sm text-slate-500">
                    Depósito
                  </span>

                  <strong>
                    $
                    {(Number(deposito) || 0).toFixed(2)}
                  </strong>

                </div>

                <div className="mt-2 flex justify-between">

                  <span className="text-sm text-slate-500">
                    Saldo
                  </span>

                  <strong>
                    ${Math.max(
                      saldo,
                      0
                    ).toFixed(2)}
                  </strong>

                </div>

              </div>

            </div>

          </section>

        </div>

        {/* ===================================================
            MOTIVO
        =================================================== */}

        <section className="mt-5 rounded-lg border-2 border-slate-300 bg-white">

          <SectionHeader
            title="Motivo de la visita"
            description="Selecciona el tipo de servicio solicitado."
            step="PASO 2"
          />

          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

            <MotivoButton
              icon="🔧"
              title="Reparación"
              description="Reparar un equipo"
              active={
                motivo === "Reparación"
              }
              onClick={() =>
                setMotivo("Reparación")
              }
            />

            <MotivoButton
              icon="🔍"
              title="Diagnóstico"
              description="Revisar un equipo"
              active={
                motivo === "Diagnóstico"
              }
              onClick={() =>
                setMotivo("Diagnóstico")
              }
            />

            <MotivoButton
              icon="💰"
              title="Venta"
              description="Venta de producto"
              active={
                motivo === "Venta"
              }
              onClick={() =>
                setMotivo("Venta")
              }
            />

            <MotivoButton
              icon="🛡️"
              title="Garantía"
              description="Trabajo de garantía"
              active={
                motivo === "Garantía"
              }
              onClick={() =>
                setMotivo("Garantía")
              }
            />

            <MotivoButton
              icon="🔄"
              title="Trade-In"
              description="Intercambiar equipo"
              active={
                motivo === "Trade-In"
              }
              onClick={() =>
                setMotivo("Trade-In")
              }
            />

            <MotivoButton
              icon="📱"
              title="Otro"
              description="Otro servicio"
              active={
                motivo === "Otro"
              }
              onClick={() =>
                setMotivo("Otro")
              }
            />

          </div>

        </section>

        {/* ===================================================
            INFORMACIÓN EQUIPO
        =================================================== */}

        <section className="mt-5 rounded-lg border-2 border-slate-300 bg-white">

          <SectionHeader
            title="Información del equipo"
            description="Identifica el dispositivo y describe el problema."
            step="PASO 3"
          />

          <div className="space-y-5 p-5">

            <div className="grid gap-4 md:grid-cols-2">

              <Field
                label="Equipo / Modelo *"
                value={equipo}
                onChange={setEquipo}
                placeholder="Ej. iPhone 15 Pro"
              />

              <Field
                label="IMEI / Serial"
                value={imei}
                onChange={setImei}
                placeholder="IMEI o número de serie"
              />

              <Field
                label="Contraseña del equipo"
                value={contrasena}
                onChange={setContrasena}
                placeholder="Opcional"
              />

            </div>

            <div>

              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Problema / descripción *
              </label>

              <textarea
                value={problema}
                onChange={(e) =>
                  setProblema(
                    e.target.value
                  )
                }
                rows={4}
                placeholder="Describe el problema que presenta el equipo..."
                className="w-full resize-none rounded-md border-2 border-slate-300 bg-white p-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />

            </div>

          </div>

        </section>

        {/* ===================================================
            CONDICIÓN
        =================================================== */}

        <section className="mt-5 rounded-lg border-2 border-slate-300 bg-white">

          <SectionHeader
            title="Condición física"
            description="Marca cualquier daño visible al recibir el equipo."
            step="PASO 4"
          />

          <div className="grid gap-2 p-5 sm:grid-cols-2 lg:grid-cols-4">

            <Condition
              label="Pantalla rota"
              checked={pantallaRota}
              onChange={setPantallaRota}
            />

            <Condition
              label="Golpes"
              checked={golpes}
              onChange={setGolpes}
            />

            <Condition
              label="Equipo doblado"
              checked={equipoDoblado}
              onChange={setEquipoDoblado}
            />

            <Condition
              label="Cámara dañada"
              checked={camaraDañada}
              onChange={setCamaraDañada}
            />

            <Condition
              label="No enciende"
              checked={noEnciende}
              onChange={setNoEnciende}
            />

            <Condition
              label="Daño por líquido"
              checked={dañoLiquido}
              onChange={setDañoLiquido}
            />

            <Condition
              label="Otro daño"
              checked={otroDaño}
              onChange={setOtroDaño}
            />

          </div>

        </section>

                {/* ===================================================
            ACCESORIOS
        =================================================== */}

        <section className="mt-5 rounded-lg border-2 border-slate-300 bg-white">

          <SectionHeader
            title="Accesorios entregados"
            description="Registra los accesorios que el cliente deja junto con el equipo."
            step="PASO 5"
          />

          <div className="p-5">

            <textarea
              value={accesorios}
              onChange={(e) =>
                setAccesorios(e.target.value)
              }
              rows={3}
              placeholder="Ej. Cargador, cable USB-C, case..."
              className="w-full resize-none rounded-md border-2 border-slate-300 bg-white p-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />

          </div>

        </section>

        {/* ===================================================
            PRECIOS
        =================================================== */}

        <section className="mt-5 rounded-lg border-2 border-slate-300 bg-white">

          <SectionHeader
            title="Precio y pago"
            description="Registra el precio estimado y cualquier depósito recibido."
            step="PASO 6"
          />

          <div className="grid gap-4 p-5 md:grid-cols-3">

            <Field
              label="Precio de diagnóstico"
              value={diagnosticoPrecio}
              onChange={setDiagnosticoPrecio}
              placeholder="0.00"
              type="number"
            />

            <Field
              label="Precio de reparación"
              value={reparacionPrecio}
              onChange={setReparacionPrecio}
              placeholder="0.00"
              type="number"
            />

            <Field
              label="Depósito / anticipo"
              value={deposito}
              onChange={setDeposito}
              placeholder="0.00"
              type="number"
            />

          </div>

          {/* RESUMEN DE DINERO */}

          <div className="mx-5 mb-5 grid gap-3 rounded-lg border-2 border-slate-300 bg-slate-50 p-5 md:grid-cols-3">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total estimado
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                ${total.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Depósito
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                $
                {(Number(deposito) || 0).toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Saldo pendiente
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                ${Math.max(
                  saldo,
                  0
                ).toFixed(2)}
              </p>
            </div>

          </div>

        </section>

        {/* ===================================================
            APROBACIÓN
        =================================================== */}

        <section className="mt-5 rounded-lg border-2 border-slate-300 bg-white">

          <SectionHeader
            title="Aprobación"
            description="Confirma si el cliente acepta el precio estimado."
            step="PASO 7"
          />

          <div className="p-5">

            <label
              className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-5 transition ${
                aprobado
                  ? "border-slate-700 bg-slate-50"
                  : "border-slate-300 bg-white hover:border-slate-400"
              }`}
            >

              <input
                type="checkbox"
                checked={aprobado}
                onChange={(e) =>
                  setAprobado(
                    e.target.checked
                  )
                }
                className="h-5 w-5 accent-slate-800"
              />

              <div>

                <p className="font-bold text-slate-900">
                  Cliente aprobó el precio estimado
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Confirma que el cliente acepta el costo.
                </p>

              </div>

            </label>

          </div>

        </section>

        {/* ===================================================
    POLÍTICAS Y FIRMA
=================================================== */}

<section className="mt-5 rounded-lg border-2 border-slate-300 bg-white">

  <SectionHeader
    title="Políticas y autorización"
    description="Revise las condiciones antes de firmar."
    step="PASO 8"
  />

  <div className="p-5">

    {/* POLÍTICAS */}

    <div className="rounded-md border-2 border-slate-200 bg-slate-50 p-4">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Políticas del servicio
      </p>

      <p className="mt-2 text-[11px] leading-5 text-slate-600">
        El diagnóstico previamente autorizado puede tener un
        costo y dicho cargo no será reembolsable cuando el
        diagnóstico haya sido realizado. Las reparaciones
        adicionales requieren autorización del cliente.
        El cliente es responsable de respaldar sus datos;
        SmartCenter no garantiza la conservación de información
        durante el servicio.
      </p>

      <p className="mt-2 text-[11px] leading-5 text-slate-600">
        El cliente deberá recoger el equipo dentro de 31 días
        después de ser notificado de que está listo. Después
        de dicho plazo, el equipo podrá considerarse no
        reclamado y SmartCenter podrá tomar las medidas
        permitidas por la legislación aplicable.
      </p>

    </div>

    {/* AUTORIZACIÓN */}

    <div className="mt-4 rounded-md border-2 border-slate-200 bg-white p-4">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Autorización y aceptación
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-600">
        Al proporcionar su firma electrónica, usted confirma
        que ha leído, comprendido y aceptado las políticas y
        condiciones del servicio de SmartCenter, incluyendo
        las condiciones relacionadas con el diagnóstico,
        reparación, datos del dispositivo y equipos no reclamados.
      </p>

    </div>

    {/* FIRMA */}

    <div className="mt-5">

      <div className="mb-2 flex items-center justify-between">

        <div>
          <p className="text-sm font-bold text-slate-900">
            Firma del cliente
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Firme con el dedo, stylus o mouse.
          </p>
        </div>

        {firma && (
          <span className="rounded-md border-2 border-slate-300 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
            ✓ Firma registrada
          </span>
        )}

      </div>

      <div className="overflow-hidden rounded-md border-2 border-slate-300 bg-white">

        <canvas
          ref={canvasRef}
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

            setDibujando(true);
          }}

          onPointerMove={(e) => {
            if (!dibujando) return;

            const canvas = e.currentTarget;
            const ctx = canvas.getContext("2d");

            if (!ctx) return;

            ctx.lineTo(
              e.nativeEvent.offsetX,
              e.nativeEvent.offsetY
            );

            ctx.stroke();
          }}

          onPointerUp={(e) => {
            const canvas = e.currentTarget;

            setDibujando(false);

            const data =
              canvas.toDataURL("image/png");

            setFirma(data);
          }}

          onPointerCancel={() => {
            setDibujando(false);
          }}

          className="block h-[220px] w-full touch-none bg-white"
        />

      </div>

      <button
        type="button"
        onClick={limpiarFirma}
        className="mt-3 rounded-md border-2 border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
      >
        Limpiar firma
      </button>

    </div>

  </div>

</section>

        {/* ===================================================
            NOTAS
        =================================================== */}

        <section className="mt-5 rounded-lg border-2 border-slate-300 bg-white">

          <SectionHeader
            title="Notas"
            description="Información adicional para el técnico."
            step="PASO 8"
          />

          <div className="p-5">

            <textarea
              value={notas}
              onChange={(e) =>
                setNotas(e.target.value)
              }
              rows={5}
              placeholder="Notas adicionales..."
              className="w-full resize-none rounded-md border-2 border-slate-300 bg-white p-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />

          </div>

        </section>

        {/* ===================================================
            RESUMEN FINAL
        =================================================== */}

        <section className="mt-5 rounded-lg border-2 border-slate-300 bg-white">

          <SectionHeader
            title="Resumen del Check-in"
            description="Revisa la información antes de crear la orden."
            step="PASO 9"
          />

          <div className="grid gap-5 p-5 md:grid-cols-2">

            <div className="space-y-3">

              <SummaryRow
                label="Cliente"
                value={
                  clienteSeleccionado?.name ||
                  "No seleccionado"
                }
              />

              <SummaryRow
                label="Teléfono"
                value={
                  clienteSeleccionado?.phone ||
                  "No registrado"
                }
              />

              <SummaryRow
                label="Motivo"
                value={motivo}
              />

              <SummaryRow
                label="Equipo"
                value={
                  equipo ||
                  "No especificado"
                }
              />

              <SummaryRow
                label="IMEI / Serial"
                value={
                  imei ||
                  "No proporcionado"
                }
              />

            </div>

            <div className="space-y-3">

              <SummaryRow
                label="Problema"
                value={
                  problema ||
                  "No especificado"
                }
              />

              <SummaryRow
                label="Accesorios"
                value={
                  accesorios ||
                  "Ninguno especificado"
                }
              />

              <SummaryRow
                label="Precio estimado"
                value={`$${total.toFixed(2)}`}
              />

              <SummaryRow
                label="Depósito"
                value={`$${(
                  Number(deposito) || 0
                ).toFixed(2)}`}
              />

              <SummaryRow
                label="Saldo"
                value={`$${Math.max(
                  saldo,
                  0
                ).toFixed(2)}`}
              />

            </div>

          </div>

          {/* BOTÓN */}

          <div className="border-t-2 border-slate-300 bg-slate-50 p-5">

            <button
              type="button"
              disabled={guardando}
              onClick={crearOrden}
              className="w-full rounded-md border-2 border-slate-900 bg-slate-900 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {guardando
                ? "Creando orden..."
                : "✓ Crear Check-in y Work Order"}

            </button>

            <p className="mt-3 text-center text-xs text-slate-500">
              Al crear el Check-in se registrará la reparación
              y se generará automáticamente la Work Order.
            </p>

          </div>

        </section>

      </div>

      {/* =====================================================
          MODAL NUEVO CLIENTE
      ===================================================== */}

      {mostrarNuevoCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <div className="w-full max-w-md rounded-xl border-2 border-slate-300 bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b-2 border-slate-300 px-5 py-4">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Nuevo cliente
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Registra la información del cliente.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setMostrarNuevoCliente(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-slate-300 text-lg font-bold text-slate-500 hover:bg-slate-50"
              >
                ×
              </button>

            </div>

            {/* FORMULARIO */}

            <div className="space-y-4 p-5">

              <Field
                label="Nombre completo *"
                value={nuevoNombre}
                onChange={setNuevoNombre}
                placeholder="Ej. Juan Pérez"
              />

              <Field
                label="Teléfono"
                value={nuevoTelefono}
                onChange={setNuevoTelefono}
                placeholder="Ej. (818) 555-1234"
              />

            </div>

            {/* BOTONES */}

            <div className="flex gap-3 border-t-2 border-slate-300 bg-slate-50 p-5">

              <button
                type="button"
                onClick={() =>
                  setMostrarNuevoCliente(false)
                }
                className="flex-1 rounded-md border-2 border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={creandoCliente}
                onClick={crearCliente}
                className="flex-1 rounded-md border-2 border-slate-900 bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {creandoCliente
                  ? "Guardando..."
                  : "Crear cliente"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/* ============================================================
   COMPONENTE: SECTION HEADER
   ============================================================ */

function SectionHeader({
  title,
  description,
  step,
}: {
  title: string;
  description: string;
  step?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b-2 border-slate-300 px-5 py-4">

      <div>

        <h2 className="font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>

      </div>

      {step && (
        <span className="hidden rounded-md border-2 border-slate-300 bg-slate-50 px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-500 sm:block">
          {step}
        </span>
      )}

    </div>
  );
}

/* ============================================================
   COMPONENTE: FIELD
   ============================================================ */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="h-12 w-full rounded-md border-2 border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />

    </div>
  );
}

/* ============================================================
   COMPONENTE: MOTIVO
   ============================================================ */

function MotivoButton({
  icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border-2 p-4 text-left transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-300 bg-white text-slate-900 hover:border-slate-500 hover:bg-slate-50"
      }`}
    >

      <div className="text-2xl">
        {icon}
      </div>

      <p className="mt-3 font-bold">
        {title}
      </p>

      <p
        className={`mt-1 text-xs ${
          active
            ? "text-slate-300"
            : "text-slate-500"
        }`}
      >
        {description}
      </p>

    </button>
  );
}

/* ============================================================
   COMPONENTE: CONDITION
   ============================================================ */

function Condition({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-md border-2 p-3 transition ${
        checked
          ? "border-slate-700 bg-slate-50"
          : "border-slate-300 bg-white hover:border-slate-400"
      }`}
    >

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(e.target.checked)
        }
        className="h-4 w-4 accent-slate-800"
      />

      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>

    </label>
  );
}

/* ============================================================
   COMPONENTE: INFO
   ============================================================ */

function Info({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>

      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {children}
      </p>

    </div>
  );
}

/* ============================================================
   COMPONENTE: SUMMARY ROW
   ============================================================ */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border-2 border-slate-300 bg-white px-4 py-3">

      <span className="text-xs font-semibold text-slate-500">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-semibold text-slate-900">
        {value}
      </span>

    </div>
  );
}