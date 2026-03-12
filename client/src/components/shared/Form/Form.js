import React, { useState } from "react";
import InputType from "./InputType";
import { Link } from "react-router-dom";
import { handleLogin, handleRegister } from "../../../services/authService";

const registerRoles = [
  { value: "donor", label: "Donor" },
  { value: "hospital", label: "Hospital" },
  { value: "organization", label: "Organization" },
];

const roleLabels = {
  admin: "Admin",
  donor: "Donor",
  hospital: "Hospital",
  organization: "Organization",
};

const bloodGroups = ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"];

const Form = ({ formType, submitBtn, formTitle, role, showRegisterLink = true }) => {
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
        onSubmit={(e) => {
          if (formType === "login") {
            return handleLogin(e, activeRole, email, password);
          } else if (formType === "register") {
            return handleRegister(
              e,
              activeRole,
              name,
              bloodGroup,
              hospitalName,
              organizationName,
              email,
              password,
              phone,
            );
          }
        }}
      >
        <h1 className="text-center">{formTitle}</h1>
        <hr />
        {formType === "login" && role && (
          <p className="text-center text-muted">
            Signing in as <strong>{roleLabels[role]}</strong>
          </p>
        )}
        {formType === "register" && (
          <div className="mb-3">
            <p className="mb-2">Select Register Type</p>
            <div className="d-flex gap-2 flex-wrap">
              {registerRoles.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`btn ${
                    activeRole === item.value ? "btn-primary" : "btn-outline-primary"
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
                        <label htmlFor="bloodGroup" className="form-label">
                          Blood Group
                        </label>
                        <select
                          id="bloodGroup"
                          className="form-select"
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

        <div className="d-flex flex-row justify-content-between">
          {formType === "login" ? (
            showRegisterLink ? (
              <p>
                Not registerd yet ? Register
                <Link to="/register"> Here !</Link>
              </p>
            ) : (
              <span />
            )
          ) : (
            <p>
              Already user? Go to
              <Link to="/login"> Login !</Link>
            </p>
          )}
          <button className="btn btn-primary" type="submit">
            {submitBtn}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;
