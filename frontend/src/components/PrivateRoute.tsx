import React from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  component: React.ComponentType;
  isAuthenticated: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, isAuthenticated }) => {
  return isAuthenticated ? <Component /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
