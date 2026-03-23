import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import moment from "moment";
import Layout from "../../components/shared/Layout/Layout";
import API from "./../../services/API";

const getMetricValue = (record, variant) => {
  if (variant === "hospital") {
    return record.totalReceived || 0;
  }

  return record.availabeBlood || 0;
};

const AnalyticsSection = ({ title, records = [], variant }) => {
  const maxValue = Math.max(...records.map((item) => getMetricValue(item, variant)), 0);

  return (
    <div className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">{title}</h2>
        <span className="text-muted">Chart + table view</span>
      </div>

      <div className="border rounded-4 p-3 bg-white shadow-sm mb-3">
        {records.length ? (
          records.map((record) => {
            const metricValue = getMetricValue(record, variant);
            const width = maxValue ? `${(metricValue / maxValue) * 100}%` : "0%";

            return (
              <div className="mb-3" key={record.bloodGroup}>
                <div className="d-flex justify-content-between mb-1">
                  <strong>{record.bloodGroup}</strong>
                  <span>{metricValue} ML</span>
                </div>
                <div className="progress" style={{ height: '12px' }}>
                  <div
                    className={`progress-bar ${variant === "hospital" ? "bg-danger" : "bg-success"}`}
                    style={{ width }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="mb-0">No analytics data available yet.</p>
        )}
      </div>

      <div className="table-responsive border rounded-4 bg-white shadow-sm">
        <table className="table mb-0">
          <thead>
            <tr>
              <th>Blood Group</th>
              {variant === "hospital" ? (
                <th>Total Received</th>
              ) : (
                <>
                  <th>Total In</th>
                  <th>Total Out</th>
                  <th>Available</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.bloodGroup}>
                <td>{record.bloodGroup}</td>
                {variant === "hospital" ? (
                  <td>{record.totalReceived} ML</td>
                ) : (
                  <>
                    <td>{record.totalIn} ML</td>
                    <td>{record.totalOut} ML</td>
                    <td>{record.availabeBlood} ML</td>
                  </>
                )}
              </tr>
            ))}
            {!records.length && (
              <tr>
                <td colSpan={variant === "hospital" ? 2 : 4}>
                  No analytics data available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
  const [commissionSummary, setCommissionSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const getBloodGroupData = async () => {
      try {
        const { data } = await API.get("/analytics/bloodGroups-data");

        if (data?.success) {
          setOrganisationAnalytics(data?.organisationAnalytics || []);
          setHospitalAnalytics(data?.hospitalAnalytics || []);
          setUserAnalytics(data?.userAnalytics || []);
          setCommissionSummary(data?.commissionSummary || null);
        }
      } catch (fetchError) {
        setError(
          fetchError?.response?.data?.message || "Unable to load analytics data"
        );
      }
    };

    const getBloodRecords = async () => {
      try {
        const { data } = await API.get("/inventory/get-recent-inventory");
        if (data?.success) {
          setInventoryData(data?.inventory || []);
        }
      } catch (fetchError) {
        setError(
          fetchError?.response?.data?.message ||
            "Unable to load recent blood transactions"
        );
      }
    };

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
      <div className="container-fluid">
        {error && <p className="text-danger mb-4">{error}</p>}

        {isAdmin && commissionSummary && (
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="border rounded-4 p-3 bg-white shadow-sm">
                <div className="text-muted">Admin Commission</div>
                <h3 className="mb-0">Rs. {commissionSummary.totalCommission || 0}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="border rounded-4 p-3 bg-white shadow-sm">
                <div className="text-muted">Approved Transactions</div>
                <h3 className="mb-0">{commissionSummary.transactionCount || 0}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="border rounded-4 p-3 bg-white shadow-sm">
                <div className="text-muted">Hospital Payments</div>
                <h3 className="mb-0">Rs. {commissionSummary.totalRevenue || 0}</h3>
              </div>
            </div>
          </div>
        )}

        {showOrganisationAnalytics && (
          <AnalyticsSection
            title={
              isAdmin ? "Organization Analytics" : "Your Organization Analytics"
            }
            records={organisationAnalytics}
            variant="organisation"
          />
        )}

        {showHospitalAnalytics && (
          <AnalyticsSection
            title={isAdmin ? "Hospital Analytics" : "Your Hospital Analytics"}
            records={hospitalAnalytics}
            variant="hospital"
          />
        )}

        {isAdmin && (
          <div className="mb-5">
            <h2 className="mb-3">Registered User Analytics</h2>
            <div className="table-responsive border rounded-4 bg-white shadow-sm">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Metrics</th>
                  </tr>
                </thead>
                <tbody>
                  {userAnalytics.map((record) => {
                    let analysisText = "Admin account";

                    if (record.role === "donor") {
                      analysisText = `Donations: ${record.metrics.donationCount} | Donated: ${record.metrics.totalDonated} ML`;
                    } else if (record.role === "organization") {
                      analysisText = `In: ${record.metrics.totalIn} ML | Out: ${record.metrics.totalOut} ML | Available: ${record.metrics.availableBlood} ML | Commission: Rs. ${record.metrics.totalCommissionPaid || 0}`;
                    } else if (record.role === "hospital") {
                      analysisText = `Requests: ${record.metrics.requestCount} | Approved: ${record.metrics.approvedRequestCount} | Declined: ${record.metrics.declinedRequestCount} | Received: ${record.metrics.totalReceived} ML | Paid: Rs. ${record.metrics.totalSpent || 0}`;
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
                  {!userAnalytics.length && (
                    <tr>
                      <td colSpan="6">No registered user analytics found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mb-4">
          <h2 className="mb-3">
            {isAdmin ? "Recent Blood Transactions" : "Your Recent Blood Transactions"}
          </h2>
          <div className="table-responsive border rounded-4 bg-white shadow-sm">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Blood Group</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Donor Email</th>
                  {isAdmin && <th>Organization</th>}
                  {(isAdmin || normalizedRole === "hospital") && <th>Hospital</th>}
                  <th>Time & Date</th>
                </tr>
              </thead>
              <tbody>
                {inventoryData.map((record) => (
                  <tr key={record._id}>
                    <td>{record.bloodGroup}</td>
                    <td>{record.quantity} ML</td>
                    <td className="text-capitalize">{record.requestStatus || record.inventoryType}</td>
                    <td className="text-capitalize">{record.paymentMethod || "-"}</td>
                    <td>{record.totalAmount ? `Rs. ${record.totalAmount}` : "-"}</td>
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
                {!inventoryData.length && (
                  <tr>
                    <td colSpan={isAdmin ? "9" : "7"}>
                      No recent blood transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
