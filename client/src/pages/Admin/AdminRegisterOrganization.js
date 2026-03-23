import React from "react";
import { useSelector } from "react-redux";
import Layout from "../../components/shared/Layout/Layout";
import Form from "../../components/shared/Form/Form";
import Spinner from "../../components/shared/Spinner";

const AdminRegisterOrganization = () => {
  const { loading, error } = useSelector((state) => state.auth);

  return (
    <Layout>
      {error && <span>{alert(error)}</span>}
      {loading ? (
        <Spinner />
      ) : (
        <Form
          formTitle={"Add Organization Account"}
          submitBtn={"Create Organization"}
          formType={"register"}
          role={"organization"}
          registerEndpoint={"/admin/create-organization"}
          registerRedirectTo={"/org-list"}
          registerLoginPath={"/organization-login"}
        />
      )}
    </Layout>
  );
};

export default AdminRegisterOrganization;
