import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import InputType from "./../Form/InputType";
import API from "./../../../services/API";

const bloodGroupOptions = ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"];

const Modal = ({ organisations: hospitalOrganisations = [] }) => {
  const [inventoryType, setInventoryType] = useState("in");
  const [bloodGroup, setBloodGroup] = useState("");
  const [quantity, setQuantity] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [organisationInventory, setOrganisationInventory] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const storedUser = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;
  const currentUser = user || storedUser;
  const isHospital = currentUser?.role === "hospital";

  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
    if (isHospital) {
      setInventoryType("out");
    }
  }, [currentUser?.email, isHospital]);

  useEffect(() => {
    const getOrganisationInventory = async () => {
      if (!isHospital || !organisation) {
        setOrganisationInventory([]);
        return;
      }

      try {
        const { data } = await API.get(
          `/inventory/organisation-inventory/${organisation}`
        );
        if (data?.success) {
          setOrganisationInventory(data?.inventory || []);
        }
      } catch (error) {
        console.log(error);
        setOrganisationInventory([]);
      }
    };

    getOrganisationInventory();
  }, [isHospital, organisation]);

  const resetFields = () => {
    setBloodGroup("");
    setQuantity("");
    setOrganisation("");
    setEmail(currentUser?.email || "");
    if (!isHospital) {
      setInventoryType("in");
    }
  };

  const handleModalSubmit = async () => {
    try {
      if (!bloodGroup || !quantity || !email) {
        return alert("Please Provide All Fields");
      }

      if (isHospital && !organisation) {
        return alert("Please Select Organization");
      }

      const { data } = await API.post("/inventory/create-inventory", {
        email,
        organisation: isHospital ? organisation : currentUser?._id,
        inventoryType: isHospital ? "out" : inventoryType,
        bloodGroup,
        quantity,
      });

      if (data?.success) {
        alert("New Record Created");
        resetFields();
        window.location.reload();
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to create inventory");
      console.log(error);
      window.location.reload();
    }
  };

  return (
    <div
      className="modal fade"
      id="staticBackdrop"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex={-1}
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="staticBackdropLabel">
              {isHospital ? "Add Hospital Inventory" : "Manage Blood Record"}
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            {!isHospital && (
              <div className="d-flex mb-3">
                Blood Type: &nbsp;
                <div className="form-check ms-3">
                  <input
                    type="radio"
                    name="inRadio"
                    checked={inventoryType === "in"}
                    value="in"
                    onChange={(e) => setInventoryType(e.target.value)}
                    className="form-check-input"
                  />
                  <label htmlFor="in" className="form-check-label">
                    IN
                  </label>
                </div>
                <div className="form-check ms-3">
                  <input
                    type="radio"
                    name="inRadio"
                    checked={inventoryType === "out"}
                    value="out"
                    onChange={(e) => setInventoryType(e.target.value)}
                    className="form-check-input"
                  />
                  <label htmlFor="out" className="form-check-label">
                    OUT
                  </label>
                </div>
              </div>
            )}

            {isHospital && (
              <>
                <select
                  className="form-select mb-3"
                  aria-label="Select organization"
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                >
                  <option value="">Select organization</option>
                  {hospitalOrganisations.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.organizationName || item.organisationName}
                    </option>
                  ))}
                </select>

                {!!organisationInventory.length && (
                  <div className="border rounded p-3 mb-3 bg-light">
                    <h6 className="mb-2">Available Blood In Organization</h6>
                    <div className="row g-2">
                      {organisationInventory.map((item) => (
                        <div className="col-6" key={item.bloodGroup}>
                          <div className="d-flex justify-content-between border rounded px-2 py-1 bg-white">
                            <span>{item.bloodGroup}</span>
                            <strong>{item.availableQuantity} ML</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <select
              className="form-select"
              aria-label="Select blood group"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
            >
              <option value="">Select blood group</option>
              {bloodGroupOptions.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            <InputType
              labelText={isHospital ? "Hospital Email" : "Donor Email"}
              labelFor={"donorEmail"}
              inputType={"email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputType
              labelText={"Quanitity (ML)"}
              labelFor={"quantity"}
              inputType={"number"}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleModalSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
