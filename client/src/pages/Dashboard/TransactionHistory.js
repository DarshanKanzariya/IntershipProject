import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import moment from "moment";
import { useSelector } from "react-redux";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";

const BLOOD_GROUPS = ["all", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const STATUS_OPTIONS = ["all", "pending", "accepted", "declined", "completed"];
const PAYMENT_OPTIONS = ["all", "cash", "razorpay"];

const TransactionHistory = () => {
  const { user } = useSelector((state) => state.auth);
  const storedUser = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;
  const currentUser = user || storedUser;
  const normalizedRole =
    currentUser?.role === "organisation" ? "organization" : currentUser?.role;

  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    status: "all",
    paymentMethod: "all",
    bloodGroup: "all",
  });
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const { status, paymentMethod, bloodGroup } = filters;

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await API.get("/inventory/transaction-history", {
          params: { status, paymentMethod, bloodGroup },
        });

        if (data?.success) {
          setTransactions(data?.transactions || []);
        }
      } catch (fetchError) {
        setError(
          fetchError?.response?.data?.message ||
            "Unable to load transaction history"
        );
      } finally {
        setLoading(false);
      }
    };

    if (["hospital", "organization"].includes(normalizedRole)) {
      fetchTransactionHistory();
    }
  }, [normalizedRole, status, paymentMethod, bloodGroup]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await API.get("/inventory/transaction-history/export", {
        params: { status, paymentMethod, bloodGroup },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `${normalizedRole}-transaction-history-${moment().format(
        "YYYY-MM-DD"
      )}.csv`;

      link.href = downloadUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (downloadError) {
      setError(
        downloadError?.response?.data?.message ||
          "Unable to download transaction history"
      );
    } finally {
      setDownloading(false);
    }
  };

  if (currentUser?.role && !["organization", "hospital"].includes(normalizedRole)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <div className="container-fluid">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h2 className="mb-1">Transaction History</h2>
            <p className="text-muted mb-0">
              {normalizedRole === "hospital"
                ? "Track all blood requests raised by your hospital."
                : "Review every hospital transaction handled by your organization."}
            </p>
          </div>
          <button
            className="btn btn-success"
            onClick={handleDownload}
            disabled={downloading}
          >
            <i className="fa-solid fa-download me-2"></i>
            {downloading ? "Downloading..." : "Download CSV"}
          </button>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All Statuses" : option}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Payment Method</label>
            <select
              className="form-select"
              name="paymentMethod"
              value={filters.paymentMethod}
              onChange={handleFilterChange}
            >
              {PAYMENT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All Payment Methods" : option}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Blood Group</label>
            <select
              className="form-select"
              name="bloodGroup"
              value={filters.bloodGroup}
              onChange={handleFilterChange}
            >
              {BLOOD_GROUPS.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All Blood Groups" : option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-danger mb-3">{error}</p>}

        <div className="table-responsive border rounded-4 bg-white shadow-sm">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Blood Group</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Transaction ID</th>
                {normalizedRole === "hospital" ? (
                  <th>Organization</th>
                ) : (
                  <th>Hospital</th>
                )}
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((record) => (
                <tr key={record._id}>
                  <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                  <td>{record.bloodGroup}</td>
                  <td>{record.quantity} ML</td>
                  <td className="text-capitalize">{record.requestStatus || "-"}</td>
                  <td className="text-capitalize">
                    {record.paymentMethod || "-"}
                    {record.paymentStatus ? ` (${record.paymentStatus})` : ""}
                  </td>
                  <td>{record.totalAmount ? `Rs. ${record.totalAmount}` : "-"}</td>
                  <td>{record.transactionId || "-"}</td>
                  {normalizedRole === "hospital" ? (
                    <td>
                      {record.organisation?.organizationName ||
                        record.organisation?.organisationName ||
                        "-"}
                    </td>
                  ) : (
                    <td>{record.hospital?.hospitalName || "-"}</td>
                  )}
                  <td>{record.email}</td>
                </tr>
              ))}
              {!transactions.length && !loading && (
                <tr>
                  <td colSpan="9">No transactions found for the selected filters.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan="9">Loading transaction history...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default TransactionHistory;
