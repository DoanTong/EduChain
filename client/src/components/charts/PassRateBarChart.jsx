import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

export default function PassRateBarChart() {
  const data = [
    { exam: "Part 1", pass: 70 },
    { exam: "Part 2", pass: 55 },
    { exam: "Part 3", pass: 62 },
    { exam: "Part 4", pass: 80 },
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

      <h3 style={{ marginBottom: 4, fontSize: 18, fontWeight: 600 }}>Tỉ lệ hoàn thành bài thi</h3>
      <p style={{ marginBottom: 14, fontSize: 13, color: "#777" }}>
        Phần trăm học viên trả lời đúng từng phần của bài thi.
      </p>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart barSize={34} data={data}>
          <defs>
            <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6c5ce7" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#a29bfe" stopOpacity={0.8} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="exam" />
          <YAxis />
          <Tooltip formatter={(v) => `${v}%`} />

          <Legend
            verticalAlign="top"
            formatter={() => "Tỉ lệ đúng (%)"}
            wrapperStyle={{ fontSize: 12, marginBottom: 10 }}
          />

          <Bar dataKey="pass" fill="url(#barColor)" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
