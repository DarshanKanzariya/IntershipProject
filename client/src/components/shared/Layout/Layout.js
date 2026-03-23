import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="app-shell">
      <div className="header">
        <Header />
      </div>
      <div className="row g-0 app-body">
        <div className="app-sidebar-col">
          <Sidebar />
        </div>
        <div className="app-main-col">
          <main className="app-content">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
