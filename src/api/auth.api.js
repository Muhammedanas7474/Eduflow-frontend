import api from "./axios";

export const sendOTP = (data) => {
    return api.post("/accounts/send-otp/", data);
};

export const verifyOTP = (data) =>{
    return api.post("/accounts/verify-otp/", data);
};

export const loginUser = (data) => {
  return api.post("/accounts/login/", data);
};
