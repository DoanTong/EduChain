import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QuestionBlock from "../components/QuestionBlock";
import { http } from "../api/http";

export default function Practice() {
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await http.post("/attempts/start", { examId: 1 });
      setExam(data);
    })();
  }, []);

  const handleSubmit = async () => {
    const { data } = await http.post("/attempts/submit", {
      examId: exam.id,
      answers,
    });
    navigate("/result", { state: data });
  };

  if (!exam)
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        {exam.name}
      </h2>
      {exam.questions.map((q, idx) => (
        <QuestionBlock
          key={q.id}
          q={q}
          index={idx + 1}
          onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
        />
      ))}
      <div className="text-center mt-8">
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md transition"
        >
          Nộp bài
        </button>
      </div>
    </div>
  );
}
