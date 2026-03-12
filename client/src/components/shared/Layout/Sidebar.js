import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { menuByRole } from "./Menus/userMenu";
import "../../../styles/Layout.css";

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const storedUser = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;
  const currentUser = user || storedUser;
  const menuRole =
    currentUser?.role === "organisation" ? "organization" : currentUser?.role;
  const menus = menuByRole[menuRole] || [];

  return (
    <div className="sidebar">
      <div className="sidebar-inner">
        <div className="sidebar-brand">
          <div className="sidebar-eyebrow">Blood Bank</div>
          <h5 className="mb-0">Navigation</h5>
        </div>
        <div className="menu">
        {menus.map((menu) => {
          const isActive = location.pathname === menu.path;

          return (
            <div
              key={menu.name}
              className={`menu-item ${isActive ? "active" : ""}`}
            >
              <Link to={menu.path}>
                <i className={menu.icon}></i>
                <span>{menu.name}</span>
              </Link>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
