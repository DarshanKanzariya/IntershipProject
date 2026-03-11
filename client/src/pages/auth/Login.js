import React from "react";
import { Link } from "react-router-dom";
import { LOGIN_BANNER } from "./authImages";

const Login = () => {
  return (
    <div className="row g-0">
      <div className="col-md-8 form-banner">
        <img src={LOGIN_BANNER} alt="loginSelectionImage" />
      </div>
      <div className="col-md-4 form-container">
        <div className="auth-panel">
          <h1 className="text-center">Select Login Type</h1>
          <hr />
          <div className="d-grid gap-3">
            <Link to="/login/donor" className="btn btn-outline-primary">
              Donor Login
            </Link>
            <Link to="/login/hospital" className="btn btn-outline-primary">
              Hospital Login
            </Link>
            <Link to="/login/organisation" className="btn btn-outline-primary">
              Organisation Login
            </Link>
          </div>
          <p className="mt-4">
            Not registered yet?
            <Link to="/register"> Register Here!</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
