import React, { useEffect, useState } from "react";
import { RoleService } from "./RoleService";
import "./roles.css";
import { Shield, Save, RefreshCcw, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function RoleManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    RoleService.getUsers()
      .then((res) => {
        setUsers(res.data?.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateLocalRole = (id, role) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, role } : u))
    );
  };

  const saveRole = async (id, role) => {
    try {
      await RoleService.updateRole(id, role);
      toast.success("Cập nhật quyền thành công!");
    } catch (e) {
      toast.error("Lỗi khi cập nhật quyền!");
    }
  };

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;

  return (
    <div className="role-container">

      {/* Nút quay lại */}
      <button className="role-back-btn" onClick={() => navigate("/admin")}>
        <ArrowLeft size={18} /> Quay lại
      </button>

      {/* Tiêu đề */}
      <h1 className="role-title flex items-center gap-3">
        <Shield size={32} className="text-blue-600" />
        Phân quyền người dùng
      </h1>

      {/* Bảng người dùng */}
      <div className="role-card">
        <table className="role-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Quyền</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name || "Không tên"}</td>
                <td>{u.email}</td>

                <td>
                  <select
                    className="role-select"
                    value={u.role}
                    onChange={(e) => updateLocalRole(u._id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                <td>
                  <button
                    onClick={() => saveRole(u._id, u.role)}
                    className="role-save-btn"
                  >
                    <Save size={16} /> Lưu
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          className="role-reload-btn"
          onClick={() => window.location.reload()}
        >
          <RefreshCcw size={16} /> Tải lại
        </button>
      </div>
    </div>
  );
}

export default RoleManagement;
