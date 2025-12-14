import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/http";
import "./QuestionEditor.css";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

// Import các editor theo Part
import Part1Editor from "../questions/part1/Part1Editor";
import Part2Editor from "../questions/part2/Part2Editor";
import Part3Editor from "../questions/part3/Part3Editor";

import Part5Editor from "./Part5Editor";
import Part6Editor from "./Part6Editor";
import Part7Editor from "./Part7Editor";

function QuestionEditor() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await API.get(`/api/exams/${examId}`);
        const examData = res.data?.data || {};
        setExam(examData);
      } catch (err) {
        console.error(err);
        toast.error("Không tải được thông tin kỳ thi");
      } finally {
        setLoading(false);
      }
    };

    if (examId) fetchExam();
  }, [examId]);

  if (loading) {
    return <div className="qe-container">Đang tải dữ liệu...</div>;
  }

  if (!exam) {
    return <div className="qe-container">Không tìm thấy kỳ thi</div>;
  }

  const commonHeader = (
    <div className="qe-header">
      <button className="qe-back" onClick={() => navigate("/admin")}>
        <ArrowLeft size={18} /> Quay lại trang quản trị
      </button>

      <div className="qe-title-wrap">
        <h2 className="qe-title">Chỉnh sửa câu hỏi — Part {exam.partNumber}</h2>
        <p className="qe-subtitle">
          Bài thi: <strong>{exam.title}</strong>
          {exam.description && <> — <span>{exam.description}</span></>}
        </p>
      </div>
    </div>
  );

  const commonProps = { exam, examId };

  let PartComponent;
  switch (exam.partNumber) {
    case 1:
      PartComponent = Part1Editor;
      break;
    case 2:
      PartComponent = Part2Editor;
      break;
    case 3:
      PartComponent = Part3Editor;
      break;
    case 4:
      PartComponent = Part3Editor;
      break;
    case 5:
      PartComponent = Part5Editor;
      break;
    case 6:
      PartComponent = Part6Editor;
      break;
    case 7:
      PartComponent = Part7Editor;
      break;
    default:
      PartComponent = Part5Editor; // fallback dùng editor thường
  }

  return (
    <div className="qe-container">
      {commonHeader}
      <PartComponent {...commonProps} />
    </div>
  );
}

export default QuestionEditor;
