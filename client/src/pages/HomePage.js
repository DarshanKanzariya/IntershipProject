import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, Link } from "react-router-dom";
import moment from "moment";
import Spinner from "../components/shared/Spinner";
import Layout from "../components/shared/Layout/Layout";
import Modal from "../components/shared/modal/Modal";
import API from "../services/API";

const getOrganizationName = (record) =>
  record?.organizationName || record?.organisationName || "-";

const SummaryCard = ({ title, value, link, linkLabel, subtitle }) => (
  <div className="col-md-6 col-xl-3">
    <div className="card shadow-sm border-0 h-100 stat-card">
      <div className="card-body">
        <div className="text-muted mb-2 stat-label">{title}</div>
        <h2 className="mb-1">{value}</h2>
        {subtitle ? <div className="text-muted small mb-2">{subtitle}</div> : null}
        {link ? (
          <Link to={link} className="quick-link">
            {linkLabel}
          </Link>
        ) : null}
      </div>
    </div>
  </div>
);

const DonorLanding = ({ currentUser }) => {
  const [schedules, setSchedules] = useState([]);
  const [camps, setCamps] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [scheduleRes, campRes, notificationRes] = await Promise.all([
          API.get("/schedule/donation"),
          API.get("/schedule/camp"),
          API.get("/schedule/notifications"),
        ]);

        if (scheduleRes.data?.success) {
          setSchedules(scheduleRes.data.schedules || []);
        }
        if (campRes.data?.success) {
          setCamps(campRes.data.camps || []);
        }
        if (notificationRes.data?.success) {
          setNotifications(notificationRes.data.notifications || []);
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadData();
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <Layout>
      <div className="container py-4 dashboard-shell">
        <div className="dashboard-hero mb-4">
          <h2>Welcome {currentUser?.name}</h2>
          <p className="text-muted mb-0">
            Blood Group: <strong>{currentUser?.bloodGroup || "Not set"}</strong>
          </p>
        </div>

        <div className="row g-3 mb-4">
          <SummaryCard
            title="Scheduled Donations"
            value={schedules.length}
            link="/donation"
            linkLabel="View Donation Page"
          />
          <SummaryCard
            title="Donation Camps"
            value={camps.length}
            subtitle="Available for participation"
          />
          <SummaryCard
            title="Unread Notifications"
            value={unreadCount}
            link="/notifications"
            linkLabel="Open Notifications"
          />
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card shadow-sm border-0 surface-card">
              <div className="card-body">
                <h4 className="card-title mb-3">Upcoming Donation Schedules</h4>
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>Organization</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.slice(0, 5).map((record) => (
                      <tr key={record._id}>
                        <td>{getOrganizationName(record.organisation)}</td>
                        <td>{moment(record.scheduleDate).format("DD/MM/YYYY hh:mm A")}</td>
                        <td>{record.status}</td>
                      </tr>
                    ))}
                    {!schedules.length && (
                      <tr>
                        <td colSpan="3">No donation schedules yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="card shadow-sm border-0 surface-card">
              <div className="card-body">
                <h4 className="card-title mb-3">Recent Notifications</h4>
                <div className="list-group list-group-flush">
                  {notifications.slice(0, 5).map((item) => (
                    <div className="list-group-item px-0" key={item._id}>
                      <strong>{item.title}</strong>
                      <div>{item.message}</div>
                    </div>
                  ))}
                  {!notifications.length && <div>No notifications yet.</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const OrganizationLanding = ({ currentUser, loading, error, data, getBloodRecords }) => {
  const [recentInventory, setRecentInventory] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [camps, setCamps] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    getBloodRecords();
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [recentRes, scheduleRes, campRes, notificationRes, analyticsRes] =
          await Promise.all([
            API.get("/inventory/get-recent-inventory"),
            API.get("/schedule/donation"),
            API.get("/schedule/camp"),
            API.get("/schedule/notifications"),
            API.get("/analytics/bloodGroups-data"),
          ]);

        if (recentRes.data?.success) {
          setRecentInventory(recentRes.data.inventory || []);
        }
        if (scheduleRes.data?.success) {
          setSchedules(scheduleRes.data.schedules || []);
        }
        if (campRes.data?.success) {
          setCamps(campRes.data.camps || []);
        }
        if (notificationRes.data?.success) {
          setNotifications(notificationRes.data.notifications || []);
        }
        if (analyticsRes.data?.success) {
          setAnalytics(analyticsRes.data.organisationAnalytics || []);
        }
      } catch (apiError) {
        console.log(apiError);
      }
    };

    loadDashboardData();
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const availableBlood = analytics.reduce(
    (total, item) => total + (item.availabeBlood > 0 ? item.availabeBlood : 0),
    0
  );
  const pendingSchedules = schedules.filter(
    (item) => item.status === "scheduled"
  ).length;

  return (
    <Layout>
      {error ? <span>{alert(error)}</span> : null}
      {loading ? (
        <Spinner />
      ) : (
        <div className="container py-4 dashboard-shell">
          <div className="dashboard-hero d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h2 className="mb-1">Welcome {getOrganizationName(currentUser)}</h2>
              <p className="text-muted mb-0">
                Manage blood stock, donor schedules, and donation camps from one place.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-success dashboard-cta"
              data-bs-toggle="modal"
              data-bs-target="#staticBackdrop"
            >
              Add Inventory
            </button>
          </div>

          <div className="row g-3 mb-4">
            <SummaryCard
              title="Available Blood"
              value={`${availableBlood} ML`}
              link="/analytics"
              linkLabel="Open Analytics"
            />
            <SummaryCard
              title="Inventory Records"
              value={data.length}
              subtitle="All in and out blood entries"
            />
            <SummaryCard
              title="Pending Donation Schedules"
              value={pendingSchedules}
              link="/donation-schedules"
              linkLabel="Manage Donation Schedules"
            />
            <SummaryCard
              title="Unread Notifications"
              value={unreadCount}
              link="/notifications"
              linkLabel="Open Notifications"
            />
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-8">
              <div className="card shadow-sm border-0 h-100 surface-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="card-title mb-0">Recent Inventory</h4>
                    <Link to="/analytics" className="quick-link">View Blood Analytics</Link>
                  </div>
                  <table className="table mb-0">
                    <thead>
                      <tr>
                        <th>Blood Group</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Donor</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInventory.map((record) => (
                        <tr key={record._id}>
                          <td>{record.bloodGroup}</td>
                          <td>{record.inventoryType}</td>
                          <td>{record.quantity} ML</td>
                          <td>{record.donor?.name || record.email || "-"}</td>
                          <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                        </tr>
                      ))}
                      {!recentInventory.length && (
                        <tr>
                          <td colSpan="5">No recent inventory records.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card shadow-sm border-0 mb-4 surface-card">
                <div className="card-body">
                  <h4 className="card-title mb-3">Upcoming Camps</h4>
                  <div className="list-group list-group-flush">
                    {camps.slice(0, 4).map((camp) => (
                      <div className="list-group-item px-0" key={camp._id}>
                        <strong>{camp.title}</strong>
                        <div>{camp.location}</div>
                        <small>{moment(camp.campDate).format("DD/MM/YYYY hh:mm A")}</small>
                      </div>
                    ))}
                    {!camps.length && <div>No camps scheduled yet.</div>}
                  </div>
                </div>
              </div>

              <div className="card shadow-sm border-0 surface-card">
                <div className="card-body">
                  <h4 className="card-title mb-3">Recent Notifications</h4>
                  <div className="list-group list-group-flush">
                    {notifications.slice(0, 4).map((item) => (
                      <div className="list-group-item px-0" key={item._id}>
                        <strong>{item.title}</strong>
                        <div>{item.message}</div>
                      </div>
                    ))}
                    {!notifications.length && <div>No notifications yet.</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0 surface-card">
            <div className="card-body">
              <h4 className="card-title mb-3">All Inventory Records</h4>
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>Blood Group</th>
                    <th>Inventory Type</th>
                    <th>Quantity</th>
                    <th>Donor Name</th>
                    <th>Donor Email</th>
                    <th>Time & Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((record) => (
                    <tr key={record._id}>
                      <td>{record.bloodGroup}</td>
                      <td>{record.inventoryType}</td>
                      <td>{record.quantity} ML</td>
                      <td>{record.donor?.name || "-"}</td>
                      <td>{record.email}</td>
                      <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                    </tr>
                  ))}
                  {!data.length && (
                    <tr>
                      <td colSpan="6">No inventory records available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Modal />
        </div>
      )}
    </Layout>
  );
};

const HospitalLanding = ({ currentUser }) => {
  const [recentInventory, setRecentInventory] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [camps, setCamps] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [inventorySummary, setInventorySummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [recentRes, organisationRes, campRes, notificationRes, analyticsRes] =
          await Promise.all([
            API.get("/inventory/get-recent-inventory"),
            API.get("/inventory/get-orgnaisation-for-hospital"),
            API.get("/schedule/camp"),
            API.get("/schedule/notifications"),
            API.get("/analytics/bloodGroups-data"),
          ]);

        const fetchedOrganisations = organisationRes.data?.success
          ? organisationRes.data.organisations || []
          : [];

        setRecentInventory(recentRes.data?.inventory || []);
        setOrganisations(fetchedOrganisations);
        setCamps(campRes.data?.camps || []);
        setNotifications(notificationRes.data?.notifications || []);
        setAnalytics(analyticsRes.data?.hospitalAnalytics || []);

        const summaries = await Promise.all(
          fetchedOrganisations.map(async (organisation) => {
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
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const totalReceived = analytics.reduce(
    (total, item) => total + (item.totalReceived || 0),
    0
  );
  const availableBloodGroups = Object.values(inventorySummary).reduce(
    (total, groups) => total + groups.length,
    0
  );

  if (loading) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4 dashboard-shell">
        <div className="dashboard-hero mb-4">
          <h2 className="mb-1">Welcome {currentUser?.hospitalName}</h2>
          <p className="text-muted mb-0">
            Track received blood, check organization stock, and manage donation camps.
          </p>
        </div>

        <div className="row g-3 mb-4">
          <SummaryCard
            title="Blood Received"
            value={`${totalReceived} ML`}
            link="/consumer"
            linkLabel="Open Consumer Records"
          />
          <SummaryCard
            title="Organizations"
            value={organisations.length}
            link="/organization"
            linkLabel="View Organizations"
          />
          <SummaryCard
            title="Available Blood Groups"
            value={availableBloodGroups}
            subtitle="Across connected organizations"
          />
          <SummaryCard
            title="Unread Notifications"
            value={unreadCount}
            link="/notifications"
            linkLabel="Open Notifications"
          />
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card shadow-sm border-0 mb-4 surface-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="card-title mb-0">Recent Blood Requests</h4>
                  <Link to="/consumer" className="quick-link">Open Consumer Page</Link>
                </div>
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>Blood Group</th>
                      <th>Quantity</th>
                      <th>Organization</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInventory.map((record) => (
                      <tr key={record._id}>
                        <td>{record.bloodGroup}</td>
                        <td>{record.quantity} ML</td>
                        <td>{getOrganizationName(record.organisation)}</td>
                        <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                      </tr>
                    ))}
                    {!recentInventory.length && (
                      <tr>
                        <td colSpan="4">No blood requests yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card shadow-sm border-0 surface-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="card-title mb-0">Organization Blood Availability</h4>
                  <Link to="/organization" className="quick-link">View Full Organization List</Link>
                </div>
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>Organization</th>
                      <th>Available Blood</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organisations.slice(0, 5).map((record) => (
                      <tr key={record._id}>
                        <td>{getOrganizationName(record)}</td>
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
                      </tr>
                    ))}
                    {!organisations.length && (
                      <tr>
                        <td colSpan="2">No organizations available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm border-0 mb-4 surface-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="card-title mb-0">Donation Camps</h4>
                  <Link to="/camp-schedule" className="quick-link">Manage Camps</Link>
                </div>
                <div className="list-group list-group-flush">
                  {camps.slice(0, 5).map((camp) => (
                    <div className="list-group-item px-0" key={camp._id}>
                      <strong>{camp.title}</strong>
                      <div>{camp.location}</div>
                      <small>{moment(camp.campDate).format("DD/MM/YYYY hh:mm A")}</small>
                    </div>
                  ))}
                  {!camps.length && <div>No camps scheduled yet.</div>}
                </div>
              </div>
            </div>

            <div className="card shadow-sm border-0 surface-card">
              <div className="card-body">
                <h4 className="card-title mb-3">Recent Notifications</h4>
                <div className="list-group list-group-flush">
                  {notifications.slice(0, 5).map((item) => (
                    <div className="list-group-item px-0" key={item._id}>
                      <strong>{item.title}</strong>
                      <div>{item.message}</div>
                    </div>
                  ))}
                  {!notifications.length && <div>No notifications yet.</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const HomePage = () => {
  const { loading, error, user } = useSelector((state) => state.auth);
  const storedUser = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;
  const currentUser = user || storedUser;
  const normalizedRole =
    currentUser?.role === "organisation" ? "organization" : currentUser?.role;
  const [data, setData] = useState([]);

  const getBloodRecords = async () => {
    try {
      const response = await API.get("/inventory/get-inventory");
      if (response.data?.success) {
        setData(response.data.inventory || []);
      }
    } catch (apiError) {
      console.log(apiError);
    }
  };

  if (normalizedRole === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (normalizedRole === "donor") {
    return <DonorLanding currentUser={currentUser} />;
  }

  if (normalizedRole === "hospital") {
    return <HospitalLanding currentUser={currentUser} />;
  }

  return (
    <OrganizationLanding
      currentUser={currentUser}
      loading={loading}
      error={error}
      data={data}
      getBloodRecords={getBloodRecords}
    />
  );
};

export default HomePage;
