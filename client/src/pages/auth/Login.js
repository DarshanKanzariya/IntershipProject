import React from "react";
import { Link } from "react-router-dom";
import { LOGIN_BANNER } from "./authImages";

const Login = () => {
  return (
    <div className="auth-shell">
      <div className="auth-stage auth-stage--wide">
        <div className="auth-visual">
          <img src={LOGIN_BANNER} alt="loginSelectionImage" className="auth-visual-image" />
          <div className="auth-visual-overlay" />
          <div className="auth-visual-copy">
            <p className="auth-kicker">Life Flow</p>
            <h1>Access the blood network from a sharper control panel.</h1>
            <p>
              Track donations, hospital requests, schedules, and notifications from one
              focused workspace.
            </p>
            <div className="auth-stat-row">
              <div className="auth-stat-card">
                <strong>Donor Access</strong>
                <span>Join camps and schedule donations</span>
              </div>
              <div className="auth-stat-card">
                <strong>Protected Flows</strong>
                <span>Role-based routes for each account type</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="auth-stage auth-stage--form">
        <div className="auth-panel auth-selector-panel">
          <div className="auth-form-header">
            <p className="auth-kicker">Sign In</p>
            <h1>Choose your entry point</h1>
            <p className="auth-subtitle">
              Public access starts with the donor portal. Other roles use their dedicated
              routes.
            </p>
          </div>
          <div className="auth-selector-grid">
            <Link to="/donor-login" className="auth-selector-card">
              <span className="auth-selector-label">Donor Login</span>
              <small>Book donations and join active camps</small>
            </Link>
          </div>
          <p className="auth-switch-text mt-4">
            Not registered yet?
            <Link to="/register"> Create your donor account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
