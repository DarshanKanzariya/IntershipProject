import moment from "moment";
import React, { useEffect, useState } from "react";
import Layout from "../components/shared/Layout/Layout";
import API from "../services/API";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const getNotifications = async () => {
    try {
      const { data } = await API.get("/schedule/notifications");
      if (data?.success) {
        setNotifications(data?.notifications || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const { data } = await API.put(`/schedule/notifications/${id}/read`);
      if (data?.success) {
        getNotifications();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout>
      <div className="container mt-4">
        <h3 className="mb-3">Notifications</h3>
        <div className="list-group">
          {notifications.map((item) => (
            <div
              key={item._id}
              className={`list-group-item ${item.read ? "" : "list-group-item-warning"}`}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="mb-1">{item.title}</h5>
                  <p className="mb-1">{item.message}</p>
                  <small>{moment(item.createdAt).format("DD/MM/YYYY hh:mm A")}</small>
                </div>
                {!item.read && (
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => markAsRead(item._id)}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
          {!notifications.length && (
            <div className="list-group-item">No notifications available.</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
