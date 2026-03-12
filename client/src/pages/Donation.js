import moment from "moment";
import React, { useEffect, useState } from "react";
import Layout from "../components/shared/Layout/Layout";
import API from "../services/API";
import { useSelector } from "react-redux";
import InputType from "../components/shared/Form/InputType";

const Donation = () => {
  const { user } = useSelector((state) => state.auth);
  const storedUser = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;
  const currentUser = user || storedUser;
  const [history, setHistory] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [organisation, setOrganisation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");

  const getDonationHistory = async () => {
    try {
      const { data } = await API.post("/inventory/get-inventory-hospital", {
        filters: {
          inventoryType: "in",
          donor: currentUser?._id,
        },
      });
      if (data?.success) {
        setHistory(data?.inventory || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getSchedules = async () => {
    try {
      const { data } = await API.get("/schedule/donation");
      if (data?.success) {
        setSchedules(data?.schedules || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getOrganisations = async () => {
    try {
      const { data } = await API.get("/inventory/get-orgnaisation");
      if (data?.success) {
        setOrganisations(data?.organisations || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDonationHistory();
    getSchedules();
    getOrganisations();
  }, [currentUser?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!organisation) {
        return alert("Please select an organisation");
      }

      if (!currentUser?.bloodGroup) {
        return alert("Please update your blood group in profile");
      }

      if (!quantity || !scheduleDate) {
        return alert("Please provide all fields");
      }

      const { data } = await API.post("/schedule/donation", {
        organisation,
        bloodGroup: currentUser?.bloodGroup,
        quantity,
        scheduleDate,
      });

      if (data?.success) {
        alert(data.message);
        setOrganisation("");
        setQuantity("");
        setScheduleDate("");
        getSchedules();
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to schedule donation");
    }
  };

  return (
    <Layout>
      <div className="container mt-4">
        <h3 className="mb-3">Schedule Blood Donation</h3>
        <form className="mb-5" onSubmit={handleSubmit}>
          <select
            className="form-select mb-3"
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
          >
            <option value="">Select Organization</option>
            {organisations.map((item) => (
              <option key={item._id} value={item._id}>
                {item.organizationName || item.organisationName}
              </option>
            ))}
          </select>
          <div className="mb-3">
            <label className="form-label">Blood Group</label>
            <input
              className="form-control"
              value={currentUser?.bloodGroup || ""}
              readOnly
            />
          </div>
          <InputType
            labelText={"Quantity (ML)"}
            labelFor={"quantity"}
            inputType={"number"}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <InputType
            labelText={"Schedule Date"}
            labelFor={"scheduleDate"}
            inputType={"datetime-local"}
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
          />
          <button className="btn btn-primary mt-2" type="submit">
            Schedule Donation
          </button>
        </form>

        <h3 className="mb-3">Scheduled Donations</h3>
        <table className="table mb-5">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Blood Group</th>
              <th>Quantity</th>
              <th>Schedule Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((record) => (
              <tr key={record._id}>
                <td>
                  {record.organisation?.organizationName ||
                    record.organisation?.organisationName}
                </td>
                <td>{record.bloodGroup}</td>
                <td>{record.quantity} ML</td>
                <td>{moment(record.scheduleDate).format("DD/MM/YYYY hh:mm A")}</td>
                <td>{record.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="mb-3">Donation History</h3>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Blood Group</th>
              <th scope="col">Inventory Type</th>
              <th scope="col">Quantity</th>
              <th scope="col">Organization</th>
              <th scope="col">Email</th>
              <th scope="col">Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record) => (
              <tr key={record._id}>
                <td>{record.bloodGroup}</td>
                <td>{record.inventoryType}</td>
                <td>{record.quantity}</td>
                <td>
                  {record.organisation?.organizationName ||
                    record.organisation?.organisationName ||
                    "-"}
                </td>
                <td>{record.email}</td>
                <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Donation;
