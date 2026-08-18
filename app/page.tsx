"use client";

import CheckIn from "./check-in/page";
import Clientes from "./clientes/page";
import Reparaciones from "./reparaciones/page";
import WorkOrders from "./work-orders/page";
import { useState } from "react";

type MenuItem = {
  name: string;
  icon: string;
  section?: string;
};

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    icon: "▦",
    section: "PRINCIPAL",
  },
  {
    name: "Check-in",
    icon: "↪",
    section: "PRINCIPAL",
  },
  {
    name: "Work Orders",
    icon: "▤",
    section: "PRINCIPAL",
  },

  {
    name: "Clientes",
    icon: "♙",
    section: "OPERACIONES",
  },
  {
    name: "Reparaciones",
    icon: "⌁",
    section: "OPERACIONES",
  },
  {
    name: "Pagos",
    icon: "$",
    section: "OPERACIONES",
  },
  {
    name: "IMEI Check",
    icon: "#",
    section: "OPERACIONES",
  },

  {
    name: "Website Orders",
    icon: "□",
    section: "WEBSITE",
  },
  {
    name: "Product Interest",
    icon: "◇",
    section: "WEBSITE",
  },

  {
    name: "Inventario",
    icon: "▥",
    section: "PARTES Y COMPRAS",
  },
  {
    name: "Compras",
    icon: "▱",
    section: "PARTES Y COMPRAS",
  },

  {
    name: "To-Do",
    icon: "☷",
    section: "PERSONAL",
  },
  {
    name: "Time Clock",
    icon: "◷",
    section: "PERSONAL",
  },
  {
    name: "Schedule",
    icon: "□",
    section: "PERSONAL",
  },
];

const dashboardStats = [
  {
    title: "Órdenes abiertas",
    value: "0",
    description: "Actualmente en proceso",
  },
  {
    title: "Esperando diagnóstico",
    value: "0",
    description: "Equipos por revisar",
  },
  {
    title: "Listos para recoger",
    value: "0",
    description: "Clientes por notificar",
  },
  {
    title: "Ventas de hoy",
    value: "$0.00",
    description: "Ingresos del día",
  },
];

export default function Home() {
  const [seccionActiva, setSeccionActiva] =
    useState<string>("Dashboard");

  function seleccionarSeccion(nombre: string) {
    setSeccionActiva(nombre);
  }

  function renderContenido() {
    if (seccionActiva === "Check-in") {
      return <CheckIn />;
    }

    if (seccionActiva === "Work Orders") {
      return <WorkOrders />;
    }

    if (seccionActiva === "Clientes") {
      return <Clientes />;
    }

    if (seccionActiva === "Reparaciones") {
      return <Reparaciones />;
    }

    if (seccionActiva === "Dashboard") {
      return (
        <Dashboard
          seleccionarSeccion={seleccionarSeccion}
        />
      );
    }

    return (
      <SeccionProximamente
        nombre={seccionActiva}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ========================================================= */}
      {/* SIDEBAR                                                   */}
      {/* ========================================================= */}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[270px] border-r-2 border-slate-300 bg-white md:flex md:flex-col">

        {/* LOGO */}

        <div className="flex h-[82px] items-center border-b-2 border-slate-300 px-7">

          <div>

            <h1 className="text-[25px] font-bold tracking-tight text-slate-900">
              SmartCenter
            </h1>

            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Sistema de gestión
            </p>

          </div>

        </div>

        {/* MENU */}

        <div className="flex-1 overflow-y-auto px-4 py-6">

          {Array.from(
            new Set(
              menuItems.map(
                (item) => item.section
              )
            )
          ).map((section) => (

            <div
              key={section}
              className="mb-7"
            >

              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                {section}
              </p>

              <div className="space-y-1">

                {menuItems
                  .filter(
                    (item) =>
                      item.section === section
                  )
                  .map((item) => {

                    const activo =
                      seccionActiva ===
                      item.name;

                    return (

                      <button
                        key={item.name}
                        onClick={() =>
                          seleccionarSeccion(
                            item.name
                          )
                        }
                        className={`group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[14px] font-medium transition ${
                          activo
                            ? "border-2 border-slate-300 bg-slate-100 text-slate-950"
                            : "border-2 border-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                        }`}
                      >

                        <span
                          className={`flex h-6 w-6 items-center justify-center text-[17px] ${
                            activo
                              ? "text-slate-950"
                              : "text-slate-400 group-hover:text-slate-700"
                          }`}
                        >
                          {item.icon}
                        </span>

                        <span>
                          {item.name}
                        </span>

                      </button>

                    );
                  })}

              </div>

            </div>

          ))}

        </div>

        {/* USER */}

        <div className="border-t-2 border-slate-300 p-4">

          <div className="flex items-center gap-3 rounded-md border-2 border-slate-300 bg-slate-50 px-3 py-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
              A
            </div>

            <div className="min-w-0">

              <p className="truncate text-sm font-semibold text-slate-900">
                Administrador
              </p>

              <p className="truncate text-xs text-slate-500">
                SmartCenter
              </p>

            </div>

          </div>

        </div>

      </aside>

      {/* ========================================================= */}
      {/* MAIN AREA                                                 */}
      {/* ========================================================= */}

      <div className="min-h-screen md:ml-[270px]">

        {/* TOP BAR */}

        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b-2 border-slate-300 bg-white px-5 md:px-8">

          {/* MOBILE BRAND */}

          <div className="md:hidden">

            <p className="text-lg font-bold">
              SmartCenter
            </p>

          </div>

          {/* SEARCH */}

          <div className="hidden md:block">

            <div className="flex h-10 w-[360px] items-center gap-3 rounded-md border-2 border-slate-300 bg-slate-50 px-4">

              <span className="text-slate-400">
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />

              <span className="rounded border-2 border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                Ctrl K
              </span>

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="ml-auto flex items-center gap-4">

            <button className="hidden text-sm text-slate-500 transition hover:text-slate-900 lg:block">
              $0.00
            </button>

            <button className="relative flex h-9 w-9 items-center justify-center rounded-md text-lg text-slate-500 hover:bg-slate-50">
              ♧

              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="h-6 w-[2px] bg-slate-300" />

            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                A
              </div>

            </div>

          </div>

        </header>

        {/* PAGE HEADER */}

        <div className="border-b-2 border-slate-300 bg-white px-5 py-5 md:px-8">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
                {seccionActiva}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {descripcionSeccion(
                  seccionActiva
                )}
              </p>

            </div>

          </div>

        </div>

        {/* CONTENT */}

        <main className="min-h-[calc(100vh-145px)] bg-white">
          {renderContenido()}
        </main>

      </div>

    </div>
  );
}


/* =============================================================== */
/* DASHBOARD                                                       */
/* =============================================================== */

function Dashboard({
  seleccionarSeccion,
}: {
  seleccionarSeccion: (
    nombre: string
  ) => void;
}) {

  return (

    <div className="p-5 md:p-8">

      {/* WELCOME */}

      <div className="mb-8">

        <h3 className="text-2xl font-bold text-slate-900">
          Bienvenido a SmartCenter
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Administra clientes, reparaciones y órdenes de trabajo desde un solo lugar.
        </p>

      </div>


      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {dashboardStats.map(
          (stat) => (

            <div
              key={stat.title}
              className="rounded-lg border-2 border-slate-300 bg-white p-5"
            >

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {stat.title}
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {stat.value}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {stat.description}
              </p>

            </div>

          )
        )}

      </div>


      {/* QUICK ACTIONS */}

      <div className="mt-10">

        <div className="mb-4">

          <h3 className="text-lg font-bold">
            Acciones rápidas
          </h3>

          <p className="text-sm text-slate-500">
            Accede rápidamente a las operaciones más utilizadas.
          </p>

        </div>


        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          <button
            onClick={() =>
              seleccionarSeccion(
                "Check-in"
              )
            }
            className="group rounded-lg border-2 border-slate-300 bg-white p-5 text-left transition hover:border-slate-500 hover:shadow-sm"
          >

            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border-2 border-slate-300 bg-slate-100 text-xl">
              ↪
            </div>

            <h4 className="font-semibold">
              Nuevo Check-in
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              Registrar la llegada de un cliente.
            </p>

          </button>


          <button
            onClick={() =>
              seleccionarSeccion(
                "Work Orders"
              )
            }
            className="group rounded-lg border-2 border-slate-300 bg-white p-5 text-left transition hover:border-slate-500 hover:shadow-sm"
          >

            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border-2 border-slate-300 bg-slate-100 text-xl">
              ▤
            </div>

            <h4 className="font-semibold">
              Work Orders
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              Ver y administrar órdenes de trabajo.
            </p>

          </button>


          <button
            onClick={() =>
              seleccionarSeccion(
                "Clientes"
              )
            }
            className="group rounded-lg border-2 border-slate-300 bg-white p-5 text-left transition hover:border-slate-500 hover:shadow-sm"
          >

            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border-2 border-slate-300 bg-slate-100 text-xl">
              ♙
            </div>

            <h4 className="font-semibold">
              Clientes
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              Consultar y administrar clientes.
            </p>

          </button>


          <button
            onClick={() =>
              seleccionarSeccion(
                "Reparaciones"
              )
            }
            className="group rounded-lg border-2 border-slate-300 bg-white p-5 text-left transition hover:border-slate-500 hover:shadow-sm"
          >

            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border-2 border-slate-300 bg-slate-100 text-xl">
              ⌁
            </div>

            <h4 className="font-semibold">
              Reparaciones
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              Administrar equipos y reparaciones.
            </p>

          </button>

        </div>

      </div>


      {/* RECENT ORDERS */}

      <div className="mt-10 overflow-hidden rounded-lg border-2 border-slate-300">

        <div className="flex items-center justify-between border-b-2 border-slate-300 px-5 py-4">

          <div>

            <h3 className="font-bold">
              Órdenes recientes
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Últimas órdenes registradas.
            </p>

          </div>

          <button
            onClick={() =>
              seleccionarSeccion(
                "Work Orders"
              )
            }
            className="text-sm font-semibold text-slate-700 hover:text-black"
          >
            Ver todas →
          </button>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="border-b-2 border-slate-300 bg-slate-50">

              <tr>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Orden
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Cliente
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Equipo
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Estado
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </th>

              </tr>

            </thead>

            <tbody>

              <tr className="border-b-2 border-slate-200">

                <td className="px-5 py-5 font-semibold">
                  —
                </td>

                <td className="px-5 py-5 text-slate-500">
                  No hay registros
                </td>

                <td className="px-5 py-5 text-slate-500">
                  —
                </td>

                <td className="px-5 py-5">

                  <span className="rounded-full border-2 border-slate-300 px-3 py-1 text-xs text-slate-500">
                    Sin órdenes
                  </span>

                </td>

                <td className="px-5 py-5 text-right font-semibold">
                  $0.00
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
/* =============================================================== */
/* SECCIÓN PRÓXIMAMENTE                                            */
/* =============================================================== */

function SeccionProximamente({
  nombre,
}: {
  nombre: string;
}) {
  return (
    <div className="p-5 md:p-8">

      <div className="rounded-lg border-2 border-slate-300 bg-white p-8 text-center">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border-2 border-slate-300 bg-slate-50 text-2xl text-slate-500">
          ◇
        </div>

        <h3 className="mt-5 text-xl font-bold text-slate-900">
          {nombre}
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Esta sección estará disponible próximamente.
        </p>

      </div>

    </div>
  );
}


/* =============================================================== */
/* DESCRIPCIONES DEL MENÚ                                          */
/* =============================================================== */

function descripcionSeccion(
  nombre: string
) {
  switch (nombre) {

    case "Dashboard":
      return "Resumen general de las operaciones de SmartCenter.";

    case "Check-in":
      return "Registra la llegada de clientes y equipos.";

    case "Work Orders":
      return "Administra y da seguimiento a las órdenes de trabajo.";

    case "Clientes":
      return "Consulta y administra la información de tus clientes.";

    case "Reparaciones":
      return "Administra equipos, diagnósticos y reparaciones.";

    case "Pagos":
      return "Controla pagos, depósitos y saldos pendientes.";

    case "IMEI Check":
      return "Consulta y verifica información de dispositivos.";

    case "Website Orders":
      return "Administra las órdenes provenientes del sitio web.";

    case "Product Interest":
      return "Consulta productos en los que los clientes han mostrado interés.";

    case "Inventario":
      return "Controla piezas, productos y existencias.";

    case "Compras":
      return "Administra compras y proveedores.";

    case "To-Do":
      return "Organiza tus tareas pendientes.";

    case "Time Clock":
      return "Controla las horas de trabajo.";

    case "Schedule":
      return "Consulta y administra el horario.";

    default:
      return "Administra esta sección de SmartCenter.";
  }
}