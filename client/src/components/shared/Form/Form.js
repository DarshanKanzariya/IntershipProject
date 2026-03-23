import React, { useState } from "react";
import InputType from "./InputType";
import { Link } from "react-router-dom";
import { handleLogin, handleRegister } from "../../../services/authService";

const registerRoles = [
  { value: "donor", label: "Donor" },
];

const roleLabels = {
  admin: "Admin",
  donor: "Donor",
  hospital: "Hospital",
  organization: "Organization",
};

const bloodGroups = ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"];

const Form = ({
  formType,
  submitBtn,
  formTitle,
  role,
  showRegisterLink = true,
  registerEndpoint = "/auth/register",
  registerRedirectTo = "/login",
  registerLoginPath = "/login",
}) => {
  const [selectedRole, setSelectedRole] = useState("donor");
  const [name, setName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const activeRole = role || selectedRole;

  return (
    <div className="auth-panel">
      <form
        className="auth-form"
        onSubmit={(e) => {
          if (formType === "login") {
            return handleLogin(e, activeRole, email, password);
          } else if (formType === "register") {
            return handleRegister(
              e,
              {
                endpoint: registerEndpoint,
                redirectTo: registerRedirectTo,
                role: activeRole,
                name,
                bloodGroup,
                hospitalName,
                organizationName,
                email,
                password,
                phone,
              },
            );
          }
        }}
      >
        <div className="auth-form-header">
          <p className="auth-kicker">{formType === "login" ? "Secure Access" : "Create Access"}</p>
          <h1>{formTitle}</h1>
          <p className="auth-subtitle">
            {formType === "login"
              ? "Sign in to continue into the blood bank workspace."
              : "Create your donor account to schedule donations and join camps."}
          </p>
        </div>
        {formType === "login" && role && (
          <p className="auth-role-chip">
            Signing in as <strong>{roleLabels[role]}</strong>
          </p>
        )}
        {formType === "register" && !role && (
          <div className="mb-3">
            <p className="mb-2 auth-section-label">Select Register Type</p>
            <div className="d-flex gap-2 flex-wrap">
              {registerRoles.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`auth-role-button ${
                    activeRole === item.value ? "active" : ""
                  }`}
                  onClick={() => setSelectedRole(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {(() => {
          switch (true) {
            case formType === "login": {
              return (
                <>
                  <InputType
                    labelText={"email"}
                    labelFor={"forEmail"}
                    inputType={"email"}
                    name={"email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <InputType
                    labelText={"Password"}
                    labelFor={"forPassword"}
                    inputType={"password"}
                    name={"password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </>
              );
            }
            case formType === "register": {
              return (
                <>
                  {activeRole === "donor" && (
                    <>
                      <InputType
                        labelText={"Name"}
                        labelFor={"forName"}
                        inputType={"text"}
                        name={"name"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <div className="mb-3">
                        <label htmlFor="bloodGroup" className="form-label auth-section-label">
                          Blood Group
                        </label>
                        <select
                          id="bloodGroup"
                          className="form-select auth-input"
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                        >
                          <option value="">Select Blood Group</option>
                          {bloodGroups.map((group) => (
                            <option key={group} value={group}>
                              {group}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  {activeRole === "hospital" && (
                    <InputType
                      labelText={"Hospital Name"}
                      labelFor={"forHospitalName"}
                      inputType={"text"}
                      name={"hospitalName"}
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                    />
                  )}
                  {activeRole === "organization" && (
                    <InputType
                      labelText={"Organization Name"}
                      labelFor={"fororganisationName"}
                      inputType={"text"}
                      name={"organizationName"}
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                    />
                  )}
                  <InputType
                    labelText={"email"}
                    labelFor={"forEmail"}
                    inputType={"email"}
                    name={"email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <InputType
                    labelText={"Password"}
                    labelFor={"forPassword"}
                    inputType={"password"}
                    name={"password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputType
                    labelText={"Phone"}
                    labelFor={"forPhone"}
                    inputType={"text"}
                    name={"phone"}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </>
              );
            }
            default: {
              return null;
            }
          }
        })()}

        <div className="auth-form-footer">
          {formType === "login" ? (
            showRegisterLink ? (
              <p className="auth-switch-text">
                New here?
                <Link to="/register"> Create an account</Link>
              </p>
            ) : (
              <span />
            )
          ) : (
            <p className="auth-switch-text">
              Already have an account?
              <Link to={registerLoginPath}> Sign in</Link>
            </p>
          )}
          <button className="btn auth-submit-btn" type="submit">
            {submitBtn}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;
