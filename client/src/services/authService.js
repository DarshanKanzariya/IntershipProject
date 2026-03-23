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
  formData,
) => {
  e.preventDefault();
  try {
    store.dispatch(userRegister(formData));
  } catch (error) {
    console.log(error);
  }
};
