import React from "react";
import { useLocation, Link } from "react-router-dom";

export default function Result() {
  const { state } = useLocation();
  if (!state)
    return <p className="text-center mt-20 text-gray-500">Không có dữ liệu kết quả.</p>;

  return (
    <div className="text-center mt-20">
      <h2 className="text-4xl font-bold mb-6 text-gray-800">Kết quả của bạn 🎉</h2>
      <div className="bg-white p-6 rounded-xl shadow-md inline-block text-left">
        <p className="text-xl mb-2">
          <b>Điểm:</b> <span className="text-green-700">{state.score}</span>
        </p>
        <p className="text-sm text-gray-600 break-all">
          <b>attemptHash:</b> {state.attemptHash}
        </p>
      </div>
      <div className="mt-8">
        <Link
          to="/verify"
          className="text-blue-700 hover:text-blue-900 underline"
        >
          Tra cứu chứng chỉ với mã hash này
        </Link>
      </div>
    </div>
  );
}
