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
      } catch (error) {
        console.log(error);
      }
    };
    getOrg();
  }, [currentUser]);

  return (
    <Layout>
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
    </Layout>
  );
};

export default OrganisationPage;
