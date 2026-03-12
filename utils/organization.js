const ORGANIZATION_ROLES = ["organization", "organisation"];

const isOrganizationRole = (role) => ORGANIZATION_ROLES.includes(role);

const organizationRoleQuery = { $in: ORGANIZATION_ROLES };

const normalizeRole = (role) =>
  role === "organisation" ? "organization" : role;

const getOrganizationName = (user) =>
  user?.organizationName || user?.organisationName || "";

module.exports = {
  ORGANIZATION_ROLES,
  isOrganizationRole,
  organizationRoleQuery,
  normalizeRole,
  getOrganizationName,
};
