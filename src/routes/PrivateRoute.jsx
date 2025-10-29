import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user) {
    // Not logged in
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but not authorized
    return <Navigate to="/home" />;
  }

  return children;
}
