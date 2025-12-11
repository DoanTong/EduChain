import API from "../../../api/http";

export const RoleService = {
  getUsers: () => API.get("/api/admin/users"),
  updateRole: (userId, role) =>
    API.put(`/api/admin/users/${userId}/role`, { role }),
};
