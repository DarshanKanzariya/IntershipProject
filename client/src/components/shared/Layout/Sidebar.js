import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { menuByRole } from "./Menus/userMenu";
import "../../../styles/Layout.css";

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const menus = menuByRole[user?.role] || [];
console.log("Redux User:", user);
  return (
    <div className="sidebar">
      <div className="menu">
        {menus.map((menu) => {
          const isActive = location.pathname === menu.path;

          return (
            <div
              key={menu.name}
              className={`menu-item ${isActive ? "active" : ""}`}
            >
              <i className={menu.icon}></i>
              <Link to={menu.path}>{menu.name}</Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;