import React, { useEffect, useState } from "react";
import {
  Users,
  Lock,
  Unlock,
  RotateCcw,
  Trash,
  ChevronLeft,
  Search,
} from "lucide-react";
import UserService from "./UserService";
import { toast } from "react-toastify";
import "./userManagement.css";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("all");

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await UserService.getUsers();
      setUsers(res.data.data || []);
    } catch (err) {
      toast.error("Lỗi tải danh sách người dùng!");
    }
  };

  const applyFilter = () => {
    return users.filter((u) => {
      const matchKeyword =
        u.name?.toLowerCase().includes(keyword.toLowerCase()) ||
        u.email?.toLowerCase().includes(keyword.toLowerCase());

      const matchRole = filter === "all" || filter === u.role;

      return matchKeyword && matchRole;
    });
  };

  const toggleLock = async (user) => {
    try {
      await UserService.toggleLock(user._id);

      // Update UI ngay lập tức
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, locked: !u.locked } : u
        )
      );

      toast.success(
        user.locked ? "Đã mở khóa tài khoản!" : "Đã khóa tài khoản!"
      );
    } catch (err) {
      toast.error("Lỗi khi thay đổi trạng thái!");
    }
  };

  const resetPassword = async (user) => {
    try {
      await UserService.resetPassword(user._id);
      toast.success("Đặt lại mật khẩu thành công!");
    } catch (err) {
      toast.error("Lỗi đặt lại mật khẩu!");
    }
  };

  const deleteUser = async (user) => {
    if (!confirm("Bạn chắc chắn muốn xóa người dùng này?")) return;

    try {
      await UserService.deleteUser(user._id);

      setUsers((prev) => prev.filter((u) => u._id !== user._id));

      toast.success("Đã xóa người dùng!");
    } catch (err) {
      toast.error("Lỗi khi xóa người dùng!");
    }
  };

  return (
    <div className="um-container">

      {/* HEADER */}
      <div className="um-header">
        <button className="um-back-btn" onClick={() => history.back()}>
          <ChevronLeft size={20} />
          Quay lại
        </button>

        <h1 className="um-title">
          <Users size={32} className="text-blue-600" />
          Quản lý người dùng
        </h1>
      </div>

      {/* SEARCH + FILTER */}
      <div className="um-controls">
        <div className="um-search">
          <Search className="um-search-icon" size={18} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <select
          className="um-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Tất cả</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="um-table-wrapper">
        <table className="um-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Quyền</th>
              <th>Trạng thái</th>
              <th className="text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {applyFilter().map((user) => (
              <tr key={user._id} className="um-fade">
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role === "admin" ? "Admin" : "User"}</td>

                {/* STATUS */}
                <td>
                  {user.locked ? (
                    <span className="um-badge um-red">Đã khóa</span>
                  ) : (
                    <span className="um-badge um-green">Hoạt động</span>
                  )}
                </td>

                {/* ACTION BUTTONS */}
                <td>
                  <div className="um-actions">

                    {/* LOCK / UNLOCK */}
                    <div className="um-tip-wrap">
                      <button
                        className="um-btn um-lock"
                        onClick={() => toggleLock(user)}
                      >
                        {user.locked ? (
                          <Unlock size={18} />
                        ) : (
                          <Lock size={18} />
                        )}
                      </button>
                      <span className="um-tip">
                        {user.locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                      </span>
                    </div>

                    {/* RESET PASSWORD */}
                    <div className="um-tip-wrap">
                      <button
                        className="um-btn um-reset"
                        onClick={() => resetPassword(user)}
                      >
                        <RotateCcw size={18} />
                      </button>
                      <span className="um-tip">Đặt lại mật khẩu</span>
                    </div>

                    {/* DELETE */}
                    <div className="um-tip-wrap">
                      <button
                        className="um-btn um-delete"
                        onClick={() => deleteUser(user)}
                      >
                        <Trash size={18} />
                      </button>
                      <span className="um-tip">Xóa người dùng</span>
                    </div>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
