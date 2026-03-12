import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../components/shared/Layout/Layout";
import InputType from "../components/shared/Form/InputType";
import API from "../services/API";

const ScheduleCamp = () => {
  const { user } = useSelector((state) => state.auth);
  const storedUser = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;
  const currentUser = user || storedUser;
  const normalizedRole =
    currentUser?.role === "organisation" ? "organization" : currentUser?.role;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [campDate, setCampDate] = useState("");
  const [camps, setCamps] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const getCamps = async () => {
    try {
      const { data } = await API.get("/schedule/camp");
      if (data?.success) {
        setCamps(data?.camps || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCamps();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (submitting) {
        return;
      }

      if (!title || !location || !campDate) {
        return alert("Please provide all required fields");
      }

      setSubmitting(true);

      const { data } = await API.post("/schedule/camp", {
        title,
        description,
        location,
        campDate,
      });

      if (data?.success) {
        alert(data.message);
        setTitle("");
        setDescription("");
        setLocation("");
        setCampDate("");
        getCamps();
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to schedule camp");
    } finally {
      setSubmitting(false);
    }
  };

  if (!["hospital", "organization"].includes(normalizedRole)) {
    return (
      <Layout>
        <div className="container mt-4">
          <p>Camp scheduling is only available for hospitals and organizations.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mt-4">
        <h3 className="mb-3">Schedule Donation Camp</h3>
        <form className="mb-5" onSubmit={handleSubmit}>
          <InputType
            labelText={"Camp Title"}
            labelFor={"title"}
            inputType={"text"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <InputType
            labelText={"Description"}
            labelFor={"description"}
            inputType={"text"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <InputType
            labelText={"Location"}
            labelFor={"location"}
            inputType={"text"}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <InputType
            labelText={"Camp Date"}
            labelFor={"campDate"}
            inputType={"datetime-local"}
            value={campDate}
            onChange={(e) => setCampDate(e.target.value)}
          />
          <button className="btn btn-primary mt-2" type="submit" disabled={submitting}>
            {submitting ? "Scheduling..." : "Schedule Camp"}
          </button>
        </form>

        <h3 className="mb-3">Camp Schedules</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Description</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {camps.map((camp) => (
              <tr key={camp._id}>
                <td>{camp.title}</td>
                <td>{camp.location}</td>
                <td>{camp.description || "-"}</td>
                <td>{moment(camp.campDate).format("DD/MM/YYYY hh:mm A")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default ScheduleCamp;
