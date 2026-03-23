import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Form from "../../components/shared/Form/Form";
import Spinner from "../../components/shared/Spinner";
import { LOGIN_BANNER } from "./authImages";

const AdminLogin = () => {
  const { loading, error } = useSelector((state) => state.auth);

  return (
    <>
      {error && <span>{alert(error)}</span>}
      {loading ? (
        <Spinner />
      ) : (
        <div className="auth-shell">
          <div className="auth-stage auth-stage--wide">
            <div className="auth-visual auth-visual--admin">
              <img src={LOGIN_BANNER} alt="adminLoginImage" className="auth-visual-image" />
              <div className="auth-visual-overlay" />
              <div className="auth-visual-copy">
                <p className="auth-kicker">Admin Control</p>
                <h1>Manage account authority and platform operations.</h1>
                <p>
                  Use the admin route to manage organizations, hospitals, analytics,
                  and overall system activity.
                </p>
              </div>
            </div>
          </div>
          <div className="auth-stage auth-stage--form">
            <Form
              formTitle={"Admin Login"}
              submitBtn={"Login"}
              formType={"login"}
              role={"admin"}
              showRegisterLink={false}
            />
            <div className="mt-3 auth-back-link">
              <Link to="/login">Back to Login Types</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminLogin;
