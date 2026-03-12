import React, { useEffect, useState } from "react";
import { BiDonateBlood, BiUserCircle } from "react-icons/bi";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../../../services/API";

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const storedUser = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;
  const currentUser = user || storedUser;
  const normalizedRole =
    currentUser?.role === "organisation" ? "organization" : currentUser?.role;
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(0);
  const showAnalytics =
    ["organization", "hospital", "admin"].includes(normalizedRole) &&
    location.pathname !== "/analytics";

  useEffect(() => {
    const getNotifications = async () => {
      try {
        const { data } = await API.get("/schedule/notifications");
        if (data?.success) {
          setNotificationCount(
            (data?.notifications || []).filter((item) => !item.read).length
          );
        }
      } catch (error) {
        console.log(error);
      }
    };

    getNotifications();
  }, [location.pathname]);

  // logout handler
  const handleLogout = () => {
    sessionStorage.clear();
    alert("Logout Successfully");
    navigate("/login");
  };

  return (
    <nav className="navbar app-navbar">
      <div className="container-fluid px-3 px-lg-4">
        <div className="navbar-brand h1 app-brand">
          <span className="brand-icon">
            <BiDonateBlood color="red" /> Blood Bank App
          </span>
        </div>
        <ul className="navbar-nav flex-row flex-wrap align-items-center header-actions">
          <li className="nav-item mx-2">
            <p className="nav-link user-chip">
              <span className="user-chip-text">
                <BiUserCircle /> Welcome{" "}
                {currentUser?.name ||
                  currentUser?.hospitalName ||
                  currentUser?.organizationName ||
                  currentUser?.organisationName}
              </span>
              <span className="badge bg-secondary text-uppercase">{normalizedRole}</span>
            </p>
          </li>
          {showAnalytics ? (
            <li className="nav-item mx-2">
              <Link to="/analytics" className="nav-link header-link">
                Analytics
              </Link>
            </li>
          ) : (
            <li className="nav-item mx-2">
              <Link to="/" className="nav-link header-link">
                Home
              </Link>
            </li>
          )}
          {normalizedRole !== "admin" && (
            <li className="nav-item mx-2">
              <Link to="/profile" className="nav-link header-link">
                Profile
              </Link>
            </li>
          )}
          <li className="nav-item mx-2">
            <Link to="/notifications" className="nav-link header-link">
              Notifications
              {notificationCount > 0 && (
                <span className="badge bg-danger ms-2">{notificationCount}</span>
              )}
            </Link>
          </li>
          <li className="nav-item mx-2">
            <button className="btn btn-danger header-logout" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;
