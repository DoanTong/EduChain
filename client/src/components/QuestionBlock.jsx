import React from "react";
export default function QuestionBlock({ q, index, onChange }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-5 hover:shadow-md transition">
      <h4 className="text-lg font-semibold text-gray-800 mb-3">
        Câu {index}: {q.content}
      </h4>
      <div className="space-y-2">
        {q.choices.map((c) => (
          <label
            key={c}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
          >
            <input
              type="radio"
              name={`q_${q.id}`}
              onChange={() => onChange(c)}
              className="accent-blue-700"
            />
            <span>{c}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
