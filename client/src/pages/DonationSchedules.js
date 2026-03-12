import moment from "moment";
import React, { useEffect, useState } from "react";
import Layout from "../components/shared/Layout/Layout";
import API from "../services/API";
import { useSelector } from "react-redux";

const DonationSchedules = () => {
  const { user } = useSelector((state) => state.auth);
  const storedUser = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;
  const currentUser = user || storedUser;
  const normalizedRole =
    currentUser?.role === "organisation" ? "organization" : currentUser?.role;
  const [schedules, setSchedules] = useState([]);

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

  useEffect(() => {
    getSchedules();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await API.put(`/schedule/donation/${id}/status`, {
        status,
      });
      if (data?.success) {
        alert(data.message);
        getSchedules();
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to update donation status");
    }
  };

  if (normalizedRole !== "organization") {
    return (
      <Layout>
        <div className="container mt-4">
          <p>Donation schedule updates are only available for organizations.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mt-4">
        <h3 className="mb-3">Scheduled Blood Donations</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Donor</th>
              <th>Blood Group</th>
              <th>Quantity</th>
              <th>Schedule Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((record) => (
              <tr key={record._id}>
                <td>{record.donor?.name || "-"}</td>
                <td>{record.bloodGroup}</td>
                <td>{record.quantity} ML</td>
                <td>{moment(record.scheduleDate).format("DD/MM/YYYY hh:mm A")}</td>
                <td>{record.status}</td>
                <td>
                  {record.status === "scheduled" ? (
                    <>
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() => updateStatus(record._id, "donated")}
                      >
                        Donated
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => updateStatus(record._id, "not-donated")}
                      >
                        Not Donated
                      </button>
                    </>
                  ) : (
                    <span>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default DonationSchedules;
