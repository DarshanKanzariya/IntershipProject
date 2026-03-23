import React, { useEffect, useState } from "react";
import Layout from "./../../components/shared/Layout/Layout";
import moment from "moment";
import { useSelector } from "react-redux";
import API from "../../services/API";

const OrganisationPage = () => {
  // get current user
  const { user } = useSelector((state) => state.auth);
  const storedUser = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;
  const currentUser = user || storedUser;
  const normalizedRole =
    currentUser?.role === "organisation" ? "organization" : currentUser?.role;
  const [data, setData] = useState([]);
  const [inventorySummary, setInventorySummary] = useState({});
  const [requests, setRequests] = useState([]);

  const getRequests = async () => {
    try {
      const { data } = await API.get("/inventory/organisation-requests");
      if (data?.success) {
        setRequests(data?.requests || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    //find org records
    const getOrg = async () => {
      try {
        if (normalizedRole === "donor") {
          const { data } = await API.get("/inventory/get-orgnaisation");
          if (data?.success) {
            setData(data?.organisations);
          }
        }
        if (normalizedRole === "hospital") {
          const { data } = await API.get(
            "/inventory/get-orgnaisation-for-hospital"
          );
          if (data?.success) {
            setData(data?.organisations);

            const summaries = await Promise.all(
              (data?.organisations || []).map(async (organisation) => {
                const response = await API.get(
                  `/inventory/organisation-inventory/${organisation._id}`
                );

                const available =
                  response?.data?.inventory?.filter(
                    (item) => item.availableQuantity > 0
                  ) || [];

                return [organisation._id, available];
              })
            );

            setInventorySummary(Object.fromEntries(summaries));
          }
        }
        if (normalizedRole === "organization") {
          getRequests();
        }
      } catch (error) {
        console.log(error);
      }
    };
    getOrg();
  }, [currentUser, normalizedRole]);

  const updateRequestStatus = async (requestId, status) => {
    try {
      const { data } = await API.put(`/inventory/organisation-requests/${requestId}`, {
        status,
      });
      alert(data?.message);
      getRequests();
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to update request");
    }
  };

  return (
    <Layout>
      {normalizedRole === "organization" && (
        <>
          <h3 className="mb-3">Hospital Blood Requests</h3>
          <table className="table mb-5">
            <thead>
              <tr>
                <th scope="col">Hospital</th>
                <th scope="col">Blood Group</th>
                <th scope="col">Quantity</th>
                <th scope="col">Payment</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
                <th scope="col">Date</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((record) => (
                <tr key={record._id}>
                  <td>{record.hospital?.hospitalName || "-"}</td>
                  <td>{record.bloodGroup}</td>
                  <td>{record.quantity} ML</td>
                  <td className="text-capitalize">{record.paymentMethod || "-"}</td>
                  <td>{record.totalAmount ? `Rs. ${record.totalAmount}` : "-"}</td>
                  <td className="text-capitalize">{record.requestStatus}</td>
                  <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                  <td>
                    {record.requestStatus === "pending" ? (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => updateRequestStatus(record._id, "accepted")}
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => updateRequestStatus(record._id, "declined")}
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted">No action</span>
                    )}
                  </td>
                </tr>
              ))}
              {!requests.length && (
                <tr>
                  <td colSpan="8">No hospital requests yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
      {normalizedRole !== "organization" && (
        <table className="table ">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              {normalizedRole === "hospital" && (
                <th scope="col">Available Blood</th>
              )}
              <th scope="col">Date</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((record) => (
              <tr key={record._id}>
                <td>{record.organizationName || record.organisationName}</td>
                <td>{record.email}</td>
                <td>{record.phone}</td>
                {normalizedRole === "hospital" && (
                  <td>
                    {(inventorySummary[record._id] || []).length
                      ? inventorySummary[record._id]
                          .map(
                            (item) =>
                              `${item.bloodGroup}: ${item.availableQuantity} ML`
                          )
                          .join(", ")
                      : "No blood available"}
                  </td>
                )}
                <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
};

export default OrganisationPage;
