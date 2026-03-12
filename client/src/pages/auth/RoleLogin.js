import React from "react";
import { useSelector } from "react-redux";
import { Link, Navigate, useParams } from "react-router-dom";
import Form from "../../components/shared/Form/Form";
import Spinner from "../../components/shared/Spinner";
import { LOGIN_BANNER } from "./authImages";

const validRoles = {
  donor: "Donor Login",
  hospital: "Hospital Login",
  organization: "Organization Login",
  organisation: "Organization Login",
};

const RoleLogin = () => {
  const { role } = useParams();
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
        <div className="row g-0">
          <div className="col-md-8 form-banner">
            <img src={LOGIN_BANNER} alt="loginImage" />
          </div>
          <div className="col-md-4 form-container">
            <Form
              formTitle={validRoles[role]}
              submitBtn={"Login"}
              formType={"login"}
              role={role}
            />
            <div className="mt-3">
              <Link to="/login">Back to Login Types</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoleLogin;
