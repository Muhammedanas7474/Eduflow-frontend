export const isAuthenticated = () => {
  return !!localStorage.getItem("access");
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const logout = () => {
  localStorage.clear();
  window.location.href = "/";
};
