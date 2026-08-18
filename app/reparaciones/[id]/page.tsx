"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Repair = {
  id: string;
  repair_number: number;
  customer_id: string;
  device_brand: string | null;
  device_model: string | null;
  imei: string | null;
  problem: string;
  diagnosis: string | null;
  status: string;
  estimated_price: number;
  final_price: number;
  amount_paid: number;
  notes: string | null;

  signature_reception: string | null;
  policies_accepted: boolean;

  created_at: string;
};

function obtenerEstado(status: string) {
  switch (status) {
    case "received":
      return {
        label: "Recibido",
        className:
          "border-slate-300 bg-slate-50 text-slate-700",
      };

    case "in_repair":
      return {
        label: "En reparación",
        className:
          "border-slate-400 bg-slate-100 text-slate-800",
      };

    case "ready":
      return {
        label: "Listo para recoger",
        className:
          "border-slate-500 bg-slate-200 text-slate-900",
      };

    case "delivered":
      return {
        label: "Entregado",
        className:
          "border-slate-800 bg-slate-900 text-white",
      };

    default:
      return {
        label: status,
        className:
          "border-slate-300 bg-white text-slate-700",
      };
  }
}

export default function ReparacionDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [repair, setRepair] =
    useState<Repair | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function cargarReparacion() {
      const { id } = await params;

      const supabase = createClient();

      const { data, error } =
        await supabase
          .from("repairs")
          .select("*")
          .eq("id", id)
          .single();

      if (error) {
        console.error(error);
      } else {
        setRepair(data);
      }

      setLoading(false);
    }

    cargarReparacion();
  }, [params]);

  /* =====================================================
     CARGANDO
  ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">

          <div className="rounded-lg border-2 border-slate-200 bg-white p-8">
            <p className="text-sm font-semibold text-slate-500">
              Cargando reparación...
            </p>
          </div>

        </div>
      </main>
    );
  }

  /* =====================================================
     NO ENCONTRADA
  ===================================================== */

  if (!repair) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">

          <div className="rounded-lg border-2 border-slate-200 bg-white p-8">

            <div className="mb-4 inline-flex rounded-md border-2 border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              Error
            </div>

            <h1 className="text-2xl font-bold">
              Reparación no encontrada
            </h1>

            <button
              onClick={() =>
                (window.location.href =
                  "/reparaciones")
              }
              className="mt-6 rounded-md border-2 border-slate-900 bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-black"
            >
              ← Volver a Reparaciones
            </button>

          </div>

        </div>
      </main>
    );
  }

  const estado = obtenerEstado(
    repair.status
  );

  const saldo =
    Number(repair.final_price || 0) -
    Number(repair.amount_paid || 0);

  return (
    <main className="min-h-screen bg-white text-slate-900">

      <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">

        {/* =====================================================
            VOLVER
        ===================================================== */}

        <button
          onClick={() =>
            (window.location.href =
              "/reparaciones")
          }
          className="mb-6 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          ← Volver a Reparaciones
        </button>

        {/* =====================================================
            ENCABEZADO
        ===================================================== */}

        <div className="mb-7 rounded-lg border-2 border-slate-200 bg-white p-6">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="mb-3 inline-flex rounded-md border-2 border-slate-900 bg-slate-900 px-3 py-1.5 text-sm font-bold text-white">
                REPARACIÓN #
                {repair.repair_number}
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                {repair.device_brand ||
                  "Equipo"}{" "}
                {repair.device_model ||
                  ""}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Detalles de la reparación
              </p>

            </div>

            <div
              className={`w-fit rounded-md border-2 px-4 py-2 text-sm font-bold ${estado.className}`}
            >
              {estado.label}
            </div>

          </div>

        </div>

        {/* =====================================================
            INFORMACIÓN PRINCIPAL
        ===================================================== */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* =================================================
              EQUIPO
          ================================================= */}

          <section className="rounded-lg border-2 border-slate-200 bg-white p-6">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-xl font-bold text-slate-900">
                Equipo
              </h2>

              <span className="rounded-md border-2 border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                DEVICE
              </span>

            </div>

            <div className="space-y-4">

              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Marca
                </p>

                <p className="font-semibold text-slate-900">
                  {repair.device_brand ||
                    "No especificada"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Modelo
                </p>

                <p className="font-semibold text-slate-900">
                  {repair.device_model ||
                    "No especificado"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                  IMEI
                </p>

                <p className="font-mono text-sm font-semibold text-slate-900">
                  {repair.imei ||
                    "No registrado"}
                </p>
              </div>

            </div>

          </section>

          {/* =================================================
              REPARACIÓN
          ================================================= */}

          <section className="rounded-lg border-2 border-slate-200 bg-white p-6">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-xl font-bold text-slate-900">
                Reparación
              </h2>

              <span className="rounded-md border-2 border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                SERVICE
              </span>

            </div>

            <div className="space-y-5">

              <div>

                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Problema reportado
                </p>

                <div className="rounded-md border-2 border-slate-200 bg-slate-50 p-4">

                  <p className="text-sm leading-6 text-slate-800">
                    {repair.problem}
                  </p>

                </div>

              </div>

              <div>

                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Diagnóstico
                </p>

                <div className="rounded-md border-2 border-slate-200 bg-slate-50 p-4">

                  <p className="text-sm leading-6 text-slate-800">
                    {repair.diagnosis ||
                      "Diagnóstico pendiente"}
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              PRECIOS
          ================================================= */}

          <section className="rounded-lg border-2 border-slate-200 bg-white p-6">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-xl font-bold text-slate-900">
                Precios
              </h2>

              <span className="rounded-md border-2 border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                PAYMENT
              </span>

            </div>

            <div className="space-y-4">

              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">

                <span className="text-sm text-slate-500">
                  Precio estimado
                </span>

                <span className="font-semibold text-slate-900">
                  $
                  {Number(
                    repair.estimated_price ||
                      0
                  ).toFixed(2)}
                </span>

              </div>

              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">

                <span className="text-sm text-slate-500">
                  Precio final
                </span>

                <span className="text-lg font-bold text-slate-900">
                  $
                  {Number(
                    repair.final_price ||
                      0
                  ).toFixed(2)}
                </span>

              </div>

              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">

                <span className="text-sm text-slate-500">
                  Cantidad pagada
                </span>

                <span className="font-semibold text-slate-900">
                  $
                  {Number(
                    repair.amount_paid ||
                      0
                  ).toFixed(2)}
                </span>

              </div>

              <div className="flex items-center justify-between pt-1">

                <span className="font-bold text-slate-900">
                  Saldo
                </span>

                <span className="text-xl font-bold text-slate-900">
                  $
                  {saldo.toFixed(2)}
                </span>

              </div>

            </div>

          </section>

          {/* =================================================
              ESTADO Y NOTAS
          ================================================= */}

          <section className="rounded-lg border-2 border-slate-200 bg-white p-6">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-xl font-bold text-slate-900">
                Estado
              </h2>

              <span className="rounded-md border-2 border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                STATUS
              </span>

            </div>

            <div>

              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Estado actual
              </p>

              <div
                className={`inline-flex rounded-md border-2 px-4 py-2 text-sm font-bold ${estado.className}`}
              >
                {estado.label}
              </div>

            </div>

            <div className="mt-6">

              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Notas
              </p>

              <div className="rounded-md border-2 border-slate-200 bg-slate-50 p-4">

                <p className="text-sm leading-6 text-slate-700">
                  {repair.notes ||
                    "Sin notas"}
                </p>

              </div>

            </div>

          </section>

        </div>

        {/* =====================================================
            INFORMACIÓN DEL REGISTRO
        ===================================================== */}

        <section className="mt-5 rounded-lg border-2 border-slate-200 bg-slate-50 p-5">

          <div className="flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">

            <div>
              <span className="font-bold text-slate-700">
                Número de reparación:
              </span>{" "}
              <span className="text-slate-500">
                #{repair.repair_number}
              </span>
            </div>

            <div>
              <span className="font-bold text-slate-700">
                Registrada:
              </span>{" "}
              <span className="text-slate-500">
                {new Date(
                  repair.created_at
                ).toLocaleString()}
              </span>
            </div>

          </div>

        </section>

        {/* =====================================================
            FIRMA DE RECEPCIÓN
        ===================================================== */}

        <section className="mt-5 rounded-lg border-2 border-slate-200 bg-white p-6">

          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                AUTORIZACIÓN
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Firma de recepción
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Firma registrada durante el Check-in del equipo.
              </p>

            </div>

            {repair.signature_reception ? (
              <div className="rounded-md border-2 border-slate-300 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
                ✓ Firma registrada
              </div>
            ) : (
              <div className="rounded-md border-2 border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-500">
                Sin firma
              </div>
            )}

          </div>

          {repair.signature_reception ? (

            <div>

              <div className="overflow-hidden rounded-lg border-2 border-slate-300 bg-white">

                <img
                  src={repair.signature_reception}
                  alt="Firma del cliente"
                  className="block h-auto max-h-[300px] w-full object-contain"
                />

              </div>

              <div className="mt-4 flex flex-col gap-2 rounded-md border-2 border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Aceptación de políticas
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {repair.policies_accepted
                      ? "✓ El cliente aceptó las políticas del servicio."
                      : "No consta aceptación de políticas."}
                  </p>

                </div>

                <div
                  className={`w-fit rounded-md border-2 px-3 py-1.5 text-xs font-bold ${
                    repair.policies_accepted
                      ? "border-slate-800 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-500"
                  }`}
                >
                  {repair.policies_accepted
                    ? "ACEPTADAS"
                    : "NO ACEPTADAS"}
                </div>

              </div>

            </div>

          ) : (

            <div className="rounded-md border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">

              <p className="text-sm font-semibold text-slate-500">
                Esta reparación no tiene una firma de recepción registrada.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Las reparaciones creadas antes de implementar la firma pueden no tener este registro.
              </p>

            </div>

          )}

        </section>

      </div>

    </main>
  );
}