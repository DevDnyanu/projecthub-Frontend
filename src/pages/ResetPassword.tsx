import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Password reset is now handled inline on the login page via OTP.
// Redirect any old /reset-password links to /login.
const ResetPassword = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate("/login", { replace: true }); }, [navigate]);
  return null;
};

export default ResetPassword;
