import React from "react";
import { useSelector } from "react-redux";
import Layout from "../../components/shared/Layout/Layout";
import Form from "../../components/shared/Form/Form";
import Spinner from "../../components/shared/Spinner";

const AdminRegisterHospital = () => {
  const { loading, error } = useSelector((state) => state.auth);

  return (
    <Layout>
      {error && <span>{alert(error)}</span>}
      {loading ? (
        <Spinner />
      ) : (
        <Form
          formTitle={"Add Hospital Account"}
          submitBtn={"Create Hospital"}
          formType={"register"}
          role={"hospital"}
          registerEndpoint={"/admin/create-hospital"}
          registerRedirectTo={"/hospital-list"}
          registerLoginPath={"/hospital-login"}
        />
      )}
    </Layout>
  );
};

export default AdminRegisterHospital;
