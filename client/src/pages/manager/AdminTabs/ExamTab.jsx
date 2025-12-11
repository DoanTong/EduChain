import React from "react";
import {
  BookOpen,
  PlusCircle,
  Pencil,
  Trash2,
  Users,
  Loader2,
} from "lucide-react";
import "../AdminDashboard.css";

function ExamTab({
  userRole,
  exams,
  showCreateForm,
  setShowCreateForm,
  newExam,
  setNewExam,
  handleCreateExam,
  selectedExam,
  fetchResults,
  navigate,
  handleDeleteExam,
  results,
  issued,
  loading,
  issueCertificate,
  txHash,
}) {
  return (
    <div className="adm-main">
      
      {/* LEFT: DANH SÁCH PART */}
      <div className="adm-left">
        <div className="adm-section-title">
          <BookOpen className="adm-icon-blue" />
          Danh sách Part (TOEIC)
        </div>

        {userRole === "admin" && (
          <button
            className="adm-btn-primary"
            onClick={() => setShowCreateForm((v) => !v)}
          >
            <PlusCircle size={18} />
            Tạo Part mới
          </button>
        )}

        {/* FORM TẠO PART */}
        {showCreateForm && (
          <div className="adm-create-form">
            <h3>Tạo Part TOEIC</h3>

            <input
              className="adm-input"
              type="number"
              placeholder="Part Number (1 - 7)"
              value={newExam.partNumber || ""}
              onChange={(e) =>
                setNewExam({ ...newExam, partNumber: Number(e.target.value) })
              }
            />

            <input
              className="adm-input"
              placeholder="Tên Part (VD: Photographs / Conversations...)"
              value={newExam.title}
              onChange={(e) =>
                setNewExam({ ...newExam, title: e.target.value })
              }
            />

            <textarea
              className="adm-textarea"
              placeholder="Mô tả Part"
              value={newExam.description}
              onChange={(e) =>
                setNewExam({ ...newExam, description: e.target.value })
              }
            />

            {/* <input
              className="adm-input"
              type="number"
              placeholder="Thời lượng (phút)"
              value={newExam.durationMinutes}
              onChange={(e) =>
                setNewExam({
                  ...newExam,
                  durationMinutes: Number(e.target.value),
                })
              }
            /> */}

            <input
              className="adm-input"
              type="number"
              placeholder="Số câu hỏi"
              value={newExam.totalQuestions}
              onChange={(e) =>
                setNewExam({
                  ...newExam,
                  totalQuestions: Number(e.target.value),
                })
              }
            />
            <button className="adm-btn-primary" onClick={handleCreateExam}>
              Lưu Part
            </button>
          </div>
        )}

        {/* LIST PARTS */}
        {exams.map((exam) => (
          <div
            key={exam._id}
            className={`adm-exam-item ${
              selectedExam === exam._id ? "active" : ""
            }`}
            onClick={() => fetchResults(exam._id)}
          >
            <div className="adm-exam-left">
              <span className="adm-exam-name">
                Part {exam.partNumber}: {exam.title}
              </span>
              <span className="adm-exam-count">
                {exam.totalQuestions} câu • {exam.durationMinutes} phút •{" "}
                {exam.difficulty}
              </span>
            </div>

            <div className="adm-exam-actions">
              <button
                className="adm-btn-edit"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/questions/${exam._id}`);
                }}
              >
                <Pencil size={16} />
              </button>

              <button
                className="adm-btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteExam(exam._id);
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT: KẾT QUẢ & CHỨNG CHỈ */}
      <div className="adm-right">
        <div className="adm-section-title">
          <Users className="adm-icon-green" />
          Kết quả của Part
        </div>

        {!selectedExam ? (
          <p className="no-data">Chọn một Part để xem kết quả.</p>
        ) : results.length === 0 ? (
          <p className="no-data">Chưa có thí sinh nào.</p>
        ) : (
          <div className="table-container">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Học viên</th>
                  <th>Ví</th>
                  <th>Điểm</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {results.map((r, i) => {
                  const wallet = r.walletAddress;
                  const isIssued = r.hasCertificate || issued.includes(wallet);

                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{r.fullName || "Không rõ"}</td>
                      <td className="adm-wallet">{wallet}</td>
                      <td>{r.score}</td>
                      <td>
                        {isIssued ? (
                          <span className="adm-issued">Đã cấp</span>
                        ) : (
                          <span className="adm-not-pass">Chưa cấp</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="adm-btn-issue"
                          disabled={loading || isIssued}
                          onClick={() =>
                            issueCertificate(
                              wallet,
                              selectedExam,
                              r.metadataUri || "",
                              r.contentHash || ""
                            )
                          }
                        >
                          {loading ? (
                            <Loader2 size={16} className="spin" />
                          ) : (
                            "Cấp"
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {txHash && (
              <div className="adm-tx-box">
                Tx:{" "}
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="adm-tx-link"
                >
                  {txHash}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExamTab;
