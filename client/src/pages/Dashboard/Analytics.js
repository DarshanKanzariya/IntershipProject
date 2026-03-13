import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import moment from "moment";
import Layout from "../../components/shared/Layout/Layout";
import API from "./../../services/API";

const colors = [
  "#884A39",
  "#C38154",
  "#FFC26F",
  "#4F709C",
  "#4942E4",
  "#0079FF",
  "#FF0060",
  "#22A699",
];

const AnalyticsCards = ({ records = [], variant }) => {
  if (!records.length) {
    return <p className="m-3">No analytics data available yet.</p>;
  }

  return (
    <div className="d-flex flex-row flex-wrap">
      {records.map((record, i) => (
        <div
          className="card m-2 p-1"
          key={record.bloodGroup}
          style={{ width: "18rem", backgroundColor: colors[i % colors.length] }}
        >
          <div className="card-body">
            <h1 className="card-title bg-light text-dark text-center mb-3">
              {record.bloodGroup}
            </h1>
            {variant === "hospital" ? (
              <p className="card-text">
                Total Received : <b>{record.totalReceived}</b> (ML)
              </p>
            ) : (
              <>
                <p className="card-text">
                  Total In : <b>{record.totalIn}</b> (ML)
                </p>
                <p className="card-text">
                  Total Out : <b>{record.totalOut}</b> (ML)
                </p>
              </>
            )}
          </div>
          <div className="card-footer text-light bg-dark text-center">
            {variant === "hospital" ? (
              <>
                Total Consumed : <b>{record.totalReceived}</b> (ML)
              </>
            ) : (
              <>
                Total Available : <b>{record.availabeBlood}</b> (ML)
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const Analytics = () => {
  const { user } = useSelector((state) => state.auth);
  const storedUser = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;
  const currentUser = user || storedUser;
  const normalizedRole =
    currentUser?.role === "organisation" ? "organization" : currentUser?.role;
  const [organisationAnalytics, setOrganisationAnalytics] = useState([]);
  const [hospitalAnalytics, setHospitalAnalytics] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [error, setError] = useState("");

  const getBloodGroupData = async () => {
    try {
      const { data } = await API.get("/analytics/bloodGroups-data");

      if (data?.success) {
        setOrganisationAnalytics(data?.organisationAnalytics || []);
        setHospitalAnalytics(data?.hospitalAnalytics || []);
        setUserAnalytics(data?.userAnalytics || []);
      }
    } catch (error) {
      setError(
        error?.response?.data?.message || "Unable to load analytics data"
      );
    }
  };

  const getBloodRecords = async () => {
    try {
      const { data } = await API.get("/inventory/get-recent-inventory");
      if (data?.success) {
        setInventoryData(data?.inventory || []);
      }
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to load recent blood transactions"
      );
    }
  };

  useEffect(() => {
    getBloodGroupData();
    getBloodRecords();
  }, []);

  if (
    currentUser?.role &&
    !["organization", "hospital", "admin"].includes(normalizedRole)
  ) {
    return <Navigate to="/" replace />;
  }

  const showOrganisationAnalytics =
    normalizedRole === "organization" || normalizedRole === "admin";
  const showHospitalAnalytics =
    normalizedRole === "hospital" || normalizedRole === "admin";
  const isAdmin = normalizedRole === "admin";

  return (
    <Layout>
      {error && <p className="text-danger m-3">{error}</p>}

      {showOrganisationAnalytics && (
        <div className="container-fluid">
          <h2 className="m-3">
            {currentUser?.role === "admin"
              ? "Organization Analytics"
              : "Your Organization Analytics"}
          </h2>
          <AnalyticsCards records={organisationAnalytics} variant="organisation" />
        </div>
      )}

      {showHospitalAnalytics && (
        <div className="container-fluid mt-3">
          <h2 className="m-3">
            {currentUser?.role === "admin"
              ? "Hospital Analytics"
              : "Your Hospital Analytics"}
          </h2>
          <AnalyticsCards records={hospitalAnalytics} variant="hospital" />
        </div>
      )}

      {isAdmin && (
        <div className="container my-4">
          <h1 className="my-3">Registered User Analytics</h1>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">User</th>
                <th scope="col">Role</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">Joined</th>
                <th scope="col">Analysis</th>
              </tr>
            </thead>
            <tbody>
              {userAnalytics.map((record) => {
                let analysisText = "Admin account";

                if (record.role === "donor") {
                  analysisText = `Donations: ${record.metrics.donationCount} | Total Donated: ${record.metrics.totalDonated} ML`;
                } else if (record.role === "organization") {
                  analysisText =
                    `Records: ${record.metrics.recordCount} | In: ${record.metrics.totalIn} ML | ` +
                    `Out: ${record.metrics.totalOut} ML | Available: ${record.metrics.availableBlood} ML`;
                } else if (record.role === "hospital") {
                  analysisText =
                    `Requests: ${record.metrics.requestCount} | Total Received: ${record.metrics.totalReceived} ML`;
                }

                return (
                  <tr key={record.userId}>
                    <td>{record.name}</td>
                    <td className="text-capitalize">{record.role}</td>
                    <td>{record.email}</td>
                    <td>{record.phone}</td>
                    <td>{moment(record.createdAt).format("DD/MM/YYYY")}</td>
                    <td>{analysisText}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!userAnalytics.length && !error && <p>No registered user analytics found.</p>}
        </div>
      )}

      <div className="container my-3">
        <h1 className="my-3">
          {isAdmin
            ? "Recent Blood Transactions"
            : "Your Recent Blood Transactions"}
        </h1>
        <table className="table ">
          <thead>
            <tr>
              <th scope="col">Blood Group</th>
              <th scope="col">Inventory Type</th>
              <th scope="col">Quantity</th>
              <th scope="col">Donor Email</th>
              {isAdmin && <th scope="col">Organization</th>}
              {(isAdmin || normalizedRole === "hospital") && (
                <th scope="col">Hospital</th>
              )}
              <th scope="col">TIme & Date</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((record) => (
              <tr key={record._id}>
                <td>{record.bloodGroup}</td>
                <td>{record.inventoryType}</td>
                <td>{record.quantity} (ML)</td>
                <td>{record.email}</td>
                {isAdmin && (
                  <td>
                    {record.organisation?.organizationName ||
                      record.organisation?.organisationName ||
                      "-"}
                  </td>
                )}
                {(isAdmin || normalizedRole === "hospital") && (
                  <td>{record.hospital?.hospitalName || "-"}</td>
                )}
                <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!inventoryData.length && !error && <p>No recent blood transactions found.</p>}
      </div>
    </Layout>
  );
};

export default Analytics;
