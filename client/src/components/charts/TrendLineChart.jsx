import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

export default function TrendLineChart() {
  const data = [
    { date: "T1", score: 55 },
    { date: "T2", score: 60 },
    { date: "T3", score: 65 },
    { date: "T4", score: 80 },
    { date: "T5", score: 75 },
  ];

  return (
    <div style={{
      background: "#fff",
      padding: 20,
      borderRadius: 18,
      boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
      border: "1px solid #f3f3f3",
      height: 330
    }}>

      <h3 style={{ marginBottom: 4, fontSize: 18, fontWeight: 600 }}>Xu hướng điểm theo thời gian</h3>
      <p style={{ marginBottom: 14, fontSize: 13, color: "#777" }}>
        Mức độ cải thiện điểm số qua từng lần làm bài.
      </p>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6c5ce7" />
              <stop offset="100%" stopColor="#a29bfe" />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(v) => [`${v}%`, "Điểm"]} />

          <Legend
            verticalAlign="top"
            formatter={() => "Điểm số (%)"}
            wrapperStyle={{ fontSize: 12, marginBottom: 10 }}
          />

          <Line
            type="monotone"
            dataKey="score"
            stroke="url(#lineColor)"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
