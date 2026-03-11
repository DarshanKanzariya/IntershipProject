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
  const [data, setData] = useState([]);

  useEffect(() => {
    //find org records
    const getOrg = async () => {
      try {
        if (currentUser?.role === "donor") {
          const { data } = await API.get("/inventory/get-orgnaisation");
          if (data?.success) {
            setData(data?.organisations);
          }
        }
        if (currentUser?.role === "hospital") {
          const { data } = await API.get(
            "/inventory/get-orgnaisation-for-hospital"
          );
          if (data?.success) {
            setData(data?.organisations);
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
            <th scope="col">Date</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((record) => (
            <tr key={record._id}>
              <td>{record.organisationName}</td>
              <td>{record.email}</td>
              <td>{record.phone}</td>
              <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default OrganisationPage;
