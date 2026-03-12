import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../components/shared/Layout/Layout";
import InputType from "../components/shared/Form/InputType";
import API from "../services/API";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const storedUser = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;
  const currentUser = user || storedUser;
  const normalizedRole =
    currentUser?.role === "organisation" ? "organization" : currentUser?.role;
  const [name, setName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setName(currentUser.name || "");
    setBloodGroup(currentUser.bloodGroup || "");
    setHospitalName(currentUser.hospitalName || "");
    setOrganizationName(
      currentUser.organizationName || currentUser.organisationName || ""
    );
    setEmail(currentUser.email || "");
    setPhone(currentUser.phone || "");
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (password && password !== confirmPassword) {
        return alert("New password and confirm password do not match");
      }

      const payload = {
        email,
        phone,
      };

      if (normalizedRole === "donor") {
        payload.name = name;
        payload.bloodGroup = bloodGroup;
      }

      if (normalizedRole === "hospital") {
        payload.hospitalName = hospitalName;
      }

      if (normalizedRole === "organization") {
        payload.organizationName = organizationName;
      }

      if (password) {
        payload.oldPassword = oldPassword;
        payload.password = password;
        payload.confirmPassword = confirmPassword;
      }

      const { data } = await API.put("/auth/update-profile", payload);

      if (data?.success) {
        sessionStorage.setItem("user", JSON.stringify(data.user));
        alert(data.message);
        window.location.reload();
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to update profile");
    }
  };

  return (
    <Layout>
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <h2 className="mb-4">Profile</h2>
            <form onSubmit={handleSubmit}>
              {normalizedRole === "donor" && (
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
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                    </select>
                  </div>
                </>
              )}

              {normalizedRole === "hospital" && (
                <InputType
                  labelText={"Hospital Name"}
                  labelFor={"forHospitalName"}
                  inputType={"text"}
                  name={"hospitalName"}
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                />
              )}

              {normalizedRole === "organization" && (
                <InputType
                  labelText={"Organization Name"}
                  labelFor={"forOrganizationName"}
                  inputType={"text"}
                  name={"organizationName"}
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />
              )}

              <InputType
                labelText={"Email"}
                labelFor={"forEmail"}
                inputType={"email"}
                name={"email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <InputType
                labelText={"Phone"}
                labelFor={"forPhone"}
                inputType={"text"}
                name={"phone"}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <InputType
                labelText={"Old Password"}
                labelFor={"forOldPassword"}
                inputType={"password"}
                name={"oldPassword"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <InputType
                labelText={"New Password"}
                labelFor={"forPassword"}
                inputType={"password"}
                name={"password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputType
                labelText={"Confirm Password"}
                labelFor={"forConfirmPassword"}
                inputType={"password"}
                name={"confirmPassword"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button type="submit" className="btn btn-primary mt-3">
                Update Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
