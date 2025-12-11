import API from "../../../api/http";

const UserService = {
  getUsers: () => API.get("/api/admin/users"),
  deleteUser: (id) => API.delete(`/api/admin/users/${id}`),
  toggleLock: (id) => API.put(`/api/admin/users/${id}/toggle-lock`),
  resetPassword: (id) => API.put(`/api/admin/users/${id}/reset-password`)
};

export default UserService;
