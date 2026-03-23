import React from "react";
import { useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import Form from "../../components/shared/Form/Form";
import Spinner from "../../components/shared/Spinner";
import { LOGIN_BANNER } from "./authImages";

const validRoles = {
  donor: "Donor Login",
  hospital: "Hospital Login",
  organization: "Organization Login",
  organisation: "Organization Login",
};

const RoleLogin = ({ role }) => {
  const { loading, error } = useSelector((state) => state.auth);

  if (!validRoles[role]) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {error && <span>{alert(error)}</span>}
      {loading ? (
        <Spinner />
      ) : (
        <div className="auth-shell">
          <div className="auth-stage auth-stage--wide">
            <div className="auth-visual auth-visual--slate">
              <img src={LOGIN_BANNER} alt="loginImage" className="auth-visual-image" />
              <div className="auth-visual-overlay" />
              <div className="auth-visual-copy">
                <p className="auth-kicker">Restricted Route</p>
                <h1>{validRoles[role]}</h1>
                <p>
                  This route is reserved for a dedicated account type, with role-specific
                  access to analytics, inventory, or request workflows.
                </p>
              </div>
            </div>
          </div>
          <div className="auth-stage auth-stage--form">
            <Form
              formTitle={validRoles[role]}
              submitBtn={"Login"}
              formType={"login"}
              role={role}
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

export default RoleLogin;
