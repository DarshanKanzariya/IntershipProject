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
        <div className="col-lg-3 col-xl-2">
          <Sidebar />
        </div>
        <div className="col-lg-9 col-xl-10">
          <main className="app-content">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
