"use client";

import { HelpCircle } from "lucide-react";
import { useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const metrics = {
  saldo: [
    { date: "Ene", value: 25000 },
    { date: "Feb", value: 28000 },
    { date: "Mar", value: 27000 },
    { date: "Abr", value: 32000 },
    { date: "May", value: 35000 },
    { date: "Jun", value: 34000 },
  ],
  flujo: [
    { date: "Ene", ingresos: 15000, salidas: 12000 },
    { date: "Feb", ingresos: 18000, salidas: 13000 },
    { date: "Mar", ingresos: 16000, salidas: 14000 },
    { date: "Abr", ingresos: 19000, salidas: 15000 },
    { date: "May", ingresos: 21000, salidas: 16000 },
    { date: "Jun", ingresos: 20000, salidas: 15500 },
  ],
  rendimiento: [
    { date: "Ene", value: 2.5 },
    { date: "Feb", value: 2.8 },
    { date: "Mar", value: 3.1 },
    { date: "Abr", value: 3.0 },
    { date: "May", value: 3.4 },
    { date: "Jun", value: 3.6 },
  ],
  intereses: [
    { date: "Ene", value: 500 },
    { date: "Feb", value: 600 },
    { date: "Mar", value: 550 },
    { date: "Abr", value: 700 },
    { date: "May", value: 800 },
    { date: "Jun", value: 750 },
  ],
};

type MetricType = "saldo" | "flujo" | "rendimiento" | "intereses";

export function Graphs() {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("saldo");

  const formatValue = (value: number) => {
    if (selectedMetric === "rendimiento") {
      return `${value}%`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="w-full max-w-[800px] self-center px-10 md:px-0">
      {/* Metric Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "saldo", label: "Saldo promedio mensual" },
          { id: "flujo", label: "Ingresos & salidas" },
          { id: "rendimiento", label: "Rendimiento" },
          { id: "intereses", label: "Intereses pendientes" },
        ].map((metric) => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id as MetricType)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedMetric === metric.id
                ? "bg-[#A7E96B] text-black"
                : "bg-[#F4F5F2] text-gray-600"
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      {/* Chart */}

      <div className="bg-[#F8FAF5] rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {selectedMetric === "saldo" && "Saldo promedio mensual"}
            {selectedMetric === "flujo" && "Ingresos & salidas"}
            {selectedMetric === "rendimiento" &&
              "Rendimiento en cuenta de inversión"}
            {selectedMetric === "intereses" && "Intereses pendientes"}
          </h2>
          <button className="text-gray-500">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={
                selectedMetric === "flujo"
                  ? metrics.flujo
                  : metrics[selectedMetric].map(
                      (item: { date: string; value: number }) => ({
                        date: item.date,
                        value: item.value,
                      }),
                    )
              }
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#666" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#666" }}
                tickFormatter={(value: number) => formatValue(value)}
              />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
                formatter={(value: number) => [formatValue(value)]}
              />
              {selectedMetric === "flujo" ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#A7E96B"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="salidas"
                    stroke="#FF6B6B"
                    strokeWidth={2}
                    dot={false}
                  />
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#A7E96B"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
