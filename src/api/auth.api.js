import api from "./axios";

export const registerUser = (data) => {
  return api.post("/accounts/register/", data);
};

export const loginUser = (data) => {
  return api.post("/accounts/login/", data);
};

export const verifyOTP = (data) => {
  return api.post("/accounts/verify-otp/", data);
};

export const forgotPassword = (data) => {
  return api.post("/accounts/forgot-password/", data);
};

export const resetPassword = (data) => {
  return api.post("/accounts/reset-password/", data);
};

export const getProfile = () => {
  return api.get("/accounts/profile/");
};

export const updateProfile = (data) => {
  return api.put("/accounts/profile/update/", data);
};

export const changePassword = (data) => {
  return api.post("/accounts/change-password/", data);
};

// Dashboard APIs
export const getAdminDashboard = () => {
  return api.get("/accounts/admin/dashboard/");
};

export const getInstructorDashboard = () => {
  return api.get("/accounts/instructor/dashboard/");
};

export const getStudentDashboard = () => {
  return api.get("/accounts/student/dashboard/");
};
