import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import moment from "moment";
import API from "../../services/API";
import { useSelector } from "react-redux";
import Modal from "../../components/shared/modal/Modal";

const Consumer = () => {
  const { user } = useSelector((state) => state.auth);
  const storedUser = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;
  const currentUser = user || storedUser;
  const [data, setData] = useState([]);
  const [organisations, setOrganisations] = useState([]);

  useEffect(() => {
    const getConsumerRecords = async () => {
      try {
        const { data } = await API.post("/inventory/get-inventory-hospital", {
          filters: {
            inventoryType: "out",
            hospital: currentUser?._id,
          },
        });
        if (data?.success) {
          setData(data?.inventory);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getOrganisations = async () => {
      try {
        const { data } = await API.get("/inventory/get-orgnaisation-for-hospital");
        if (data?.success) {
          setOrganisations(data?.organisations || []);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getConsumerRecords();
    getOrganisations();
  }, [currentUser?._id]);

  return (
    <Layout>
      <div className="container mt-4">
        <h4
          className="mb-4"
          data-bs-toggle="modal"
          data-bs-target="#staticBackdrop"
          style={{ cursor: "pointer" }}
        >
          <i className="fa-solid fa-plus text-success"></i>
          &nbsp;Add Inventory
        </h4>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Blood Group</th>
              <th scope="col">Inventory TYpe</th>
              <th scope="col">Quantity</th>
              <th scope="col">Organization</th>
              <th scope="col">Email</th>
              <th scope="col">Date</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((record) => (
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
        <Modal organisations={organisations} />
      </div>
    </Layout>
  );
};

export default Consumer;
