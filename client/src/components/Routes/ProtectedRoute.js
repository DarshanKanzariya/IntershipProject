import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "../../redux/features/auth/authActions";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  if (sessionStorage.getItem("token")) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
