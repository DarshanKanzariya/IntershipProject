import React, { useState } from "react";

const InputType = ({
  labelText,
  labelFor,
  inputType,
  value,
  onChange,
  name,
}) => {
  const isPasswordField = inputType === "password";
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const resolvedInputType =
    isPasswordField && isPasswordVisible ? "text" : inputType;

  return (
    <>
      <div className="mb-1">
        <label htmlFor={labelFor} className="form-label">
          {labelText}
        </label>
        <div className="position-relative">
          <input
            id={labelFor}
            type={resolvedInputType}
            className={`form-control ${isPasswordField ? "pe-5" : ""}`}
            name={name}
            value={value}
            onChange={onChange}
          />
          {isPasswordField && (
            <button
              type="button"
              className="btn border-0 bg-transparent position-absolute top-50 end-0 translate-middle-y d-flex align-items-center justify-content-center px-3 text-secondary"
              onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            >
              {isPasswordVisible ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M13.359 11.238l1.147 1.147-.708.707-1.273-1.273A8.658 8.658 0 0 1 8 13C3 13 0 8 0 8a14.146 14.146 0 0 1 3.343-3.95L1.146 1.854l.708-.708 12.213 12.213-.708.707zM4.048 4.755A12.12 12.12 0 0 0 1.202 8C1.898 9.01 4.197 12 8 12a7.64 7.64 0 0 0 3.775-.98l-1.06-1.06a3 3 0 0 1-4.07-4.07L5.477 4.72a7.024 7.024 0 0 0-1.43.035z" />
                  <path d="M11.297 8.469l-2.766-2.766a2 2 0 0 1 2.766 2.766zm-1.063-4.109A7.634 7.634 0 0 0 8 4c-.332 0-.658.021-.978.062l-.847-.847A8.584 8.584 0 0 1 8 3c5 0 8 5 8 5a13.16 13.16 0 0 1-2.258 2.983l-.728-.728A12.255 12.255 0 0 0 14.798 8c-.697-1.01-2.996-4-6.798-4-.483 0-.94.048-1.367.14l-.8-.8A8.68 8.68 0 0 1 8 3c.775 0 1.52.101 2.234.36z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M16 8s-3-5-8-5-8 5-8 5 3 5 8 5 8-5 8-5zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                  <path d="M8 5.5A2.5 2.5 0 1 0 8 10.5 2.5 2.5 0 0 0 8 5.5zm0 1A1.5 1.5 0 1 1 8 9.5 1.5 1.5 0 0 1 8 6.5z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default InputType;
