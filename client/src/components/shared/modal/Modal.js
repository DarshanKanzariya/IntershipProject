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
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [transactionId, setTransactionId] = useState("");
  const [organisationInventory, setOrganisationInventory] = useState([]);
  const [emailLookupMessage, setEmailLookupMessage] = useState("");
  const { user } = useSelector((state) => state.auth);
  const storedUser = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;
  const currentUser = user || storedUser;
  const isHospital = currentUser?.role === "hospital";

  useEffect(() => {
    if (isHospital && currentUser?.email) {
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

  useEffect(() => {
    const lookupDonor = async () => {
      if (isHospital || !email.trim()) {
        setEmailLookupMessage("");
        return;
      }

      try {
        const { data } = await API.get(`/auth/user-by-email?email=${encodeURIComponent(email)}`);
        if (data?.success) {
          setBloodGroup(data?.user?.bloodGroup || "");
          setEmailLookupMessage(
            data?.user?.bloodGroup
              ? `Blood group detected: ${data.user.bloodGroup}`
              : "No blood group found for this donor"
          );
        }
      } catch (error) {
        setBloodGroup("");
        setEmailLookupMessage("");
      }
    };

    const timeoutId = setTimeout(lookupDonor, 300);
    return () => clearTimeout(timeoutId);
  }, [email, isHospital]);

  const resetFields = () => {
    setBloodGroup("");
    setQuantity("");
    setOrganisation("");
    setPaymentMethod("upi");
    setPaymentStatus("pending");
    setTransactionId("");
    setEmail(isHospital ? currentUser?.email || "" : "");
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

      if (isHospital && paymentMethod !== "cash") {
        if (!transactionId.trim()) {
          return alert("Please complete the transaction and enter the transaction ID");
        }

        if (paymentStatus !== "completed") {
          return alert("Complete the transaction before submitting the request");
        }
      }

      const { data } = await API.post("/inventory/create-inventory", {
        email,
        organisation: isHospital ? organisation : currentUser?._id,
        inventoryType: isHospital ? "out" : inventoryType,
        bloodGroup,
        quantity,
        paymentMethod: isHospital ? paymentMethod : undefined,
        paymentStatus: isHospital ? paymentStatus : undefined,
        transactionId: isHospital ? transactionId : undefined,
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
              {isHospital ? "Request Blood From Organization" : "Manage Blood Record"}
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

                <select
                  className="form-select mb-3"
                  aria-label="Select payment method"
                  value={paymentMethod}
                  onChange={(e) => {
                    const nextMethod = e.target.value;
                    setPaymentMethod(nextMethod);
                    setPaymentStatus(nextMethod === "cash" ? "completed" : "pending");
                    setTransactionId("");
                  }}
                >
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                  <option value="netbanking">Net Banking</option>
                </select>

                {paymentMethod !== "cash" && (
                  <div className="border rounded p-3 mb-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <div className="fw-semibold text-capitalize">
                          {paymentMethod} payment
                        </div>
                        <small className="text-muted">
                          Complete the transaction first, then submit the request.
                        </small>
                      </div>
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => setPaymentStatus("completed")}
                      >
                        Mark Transaction Complete
                      </button>
                    </div>

                    <InputType
                      labelText={"Transaction ID"}
                      labelFor={"transactionId"}
                      inputType={"text"}
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />

                    <div className="small">
                      Payment Status:{" "}
                      <strong className="text-capitalize">{paymentStatus}</strong>
                    </div>
                  </div>
                )}
              </>
            )}

            <InputType
              labelText={isHospital ? "Hospital Email" : "Donor Email"}
              labelFor={"donorEmail"}
              inputType={"email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {!isHospital && inventoryType === "in" && emailLookupMessage && (
              <div className="small text-success mb-2">{emailLookupMessage}</div>
            )}
            <select
              className="form-select"
              aria-label="Select blood group"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              disabled={!isHospital && inventoryType === "in" && !!bloodGroup}
            >
              <option value="">Select blood group</option>
              {bloodGroupOptions.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
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
