import api from "./axios";

// Get all users
export const getUsers = () => {
  return api.get("/accounts/admin/users/");
};

// Create user
export const createUser = (data) => {
  return api.post("/accounts/admin/users/", data);
};

// Activate / deactivate user
export const updateUserStatus = (id, is_active) => {
  return api.patch(`/accounts/admin/users/${id}/status/`, {
    is_active,
  });
};
