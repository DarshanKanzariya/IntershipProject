import React from "react";
import Form from "../../components/shared/Form/Form";
import { useSelector } from "react-redux";
import Spinner from "../../components/shared/Spinner";
import { REGISTER_BANNER } from "./authImages";

const Register = () => {
  const { loading, error } = useSelector((state) => state.auth);
  return (
    <>
      {error && <span>{alert(error)}</span>}
      {loading ? (
        <Spinner />
      ) : (
        <div className="auth-shell">
          <div className="auth-stage auth-stage--wide">
            <div className="auth-visual auth-visual--emerald">
              <img src={REGISTER_BANNER} alt="registerImage" className="auth-visual-image" />
              <div className="auth-visual-overlay" />
              <div className="auth-visual-copy">
                <p className="auth-kicker">Donor Registration</p>
                <h1>Turn intention into available blood, faster.</h1>
                <p>
                  Create your donor account to schedule donations, participate in camps,
                  and stay updated with blood bank activity.
                </p>
                <div className="auth-stat-row">
                  <div className="auth-stat-card">
                    <strong>Quick Setup</strong>
                    <span>Donor profile, blood group, and contact details</span>
                  </div>
                  <div className="auth-stat-card">
                    <strong>Active Participation</strong>
                    <span>Donation camps and schedule tracking included</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="auth-stage auth-stage--form">
            <Form
              formTitle={"Register Form"}
              submitBtn={"Register"}
              formType={"register"}
              role={"donor"}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Register;
