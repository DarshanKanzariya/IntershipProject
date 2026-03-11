export const menuByRole = {
  organisation: [
    {
      name: "Inventory",
      path: "/",
      icon: "fa-solid fa-warehouse",
    },
    {
      name: "Donor",
      path: "/donor",
      icon: "fa-solid fa-hand-holding-medical",
    },
    {
      name: "Hospital",
      path: "/hospital",
      icon: "fa-solid fa-hospital",
    },
  ],

  admin: [
    {
      name: "Donor List",
      path: "/donor-list",
      icon: "fa-solid fa-users",
    },
    {
      name: "Hospital List",
      path: "/hospital-list",
      icon: "fa-solid fa-hospital",
    },
    {
      name: "Organisation List",
      path: "/org-list",
      icon: "fa-solid fa-building",
    },
  ],

  donor: [
    {
      name: "Organisation",
      path: "/organisation",
      icon: "fa-solid fa-building-ngo",
    },
    {
      name: "Donation",
      path: "/donation",
      icon: "fa-solid fa-hand-holding-heart",
    },
  ],

  hospital: [
    {
      name: "Organisation",
      path: "/organisation",
      icon: "fa-solid fa-building-ngo",
    },
    {
      name: "Consumer",
      path: "/consumer",
      icon: "fa-solid fa-user-injured",
    },
  ],
};