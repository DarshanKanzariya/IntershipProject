import { userLogin, userRegister } from "../redux/features/auth/authActions";
import store from "../redux/store";

export const handleLogin = (e, role, email, password) => {
  e.preventDefault();
  try {
    if (!role || !email || !password) {
      return alert("Please Privde All Feilds");
    }
    store.dispatch(userLogin({ role, email, password}));
  } catch (error) {
    console.log(error);
  }
};

export const handleRegister = (
  e,
  role,
  name,
  bloodGroup,
  hospitalName,
  organizationName,
  email,
  password,
  phone,
) => {
  e.preventDefault();
  try {
    store.dispatch(
      userRegister({
        role,
        name,
        bloodGroup,
        hospitalName,
        organizationName,
        email,
        password,
        phone,
      }),
    );
  } catch (error) {
    console.log(error);
  }
};
