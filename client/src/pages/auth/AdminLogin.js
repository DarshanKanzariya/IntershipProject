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
        <div className="row g-0">
          <div className="col-md-8 form-banner">
            <img src={LOGIN_BANNER} alt="adminLoginImage" />
          </div>
          <div className="col-md-4 form-container">
            <Form
              formTitle={"Admin Login"}
              submitBtn={"Login"}
              formType={"login"}
              role={"admin"}
              showRegisterLink={false}
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

export default AdminLogin;
