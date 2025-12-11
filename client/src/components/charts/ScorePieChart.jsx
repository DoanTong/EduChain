// src/components/charts/ScorePieChart.jsx
import React from "react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Legend } from "recharts";

export default function ScorePieChart() {
  const data = [
    { name: "0 - 50% (Yếu)", value: 20 },
    { name: "50 - 70% (Trung bình)", value: 45 },
    { name: "70 - 90% (Khá)", value: 30 },
    { name: "90 - 100% (Giỏi)", value: 5 },
  ];

  const COLORS = ["#ff6b6b", "#4dabf7", "#1dd1a1", "#feca57"];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={85}
          innerRadius={50}
          paddingAngle={3}
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => `${v}%`} />
        <Legend
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          iconSize={10}
          wrapperStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
