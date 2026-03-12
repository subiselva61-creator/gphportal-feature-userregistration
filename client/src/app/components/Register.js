import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { Route, Navigate, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { register } from "../slices/auth";
import { clearMessage, setMessage } from "../slices/message";

const Register = () => {
  const [successful, setSuccessful] = useState(false);

  const { message } = useSelector((state) => state.message);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  const initialValues = {
    username: "",
    email: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("This is not a valid email.")
      .required("This field is required!"),
    password: Yup.string()
      .test(
        "len",
        "The password must be between 6 and 40 characters.",
        (val) =>
          val && val.toString().length >= 6 && val.toString().length <= 40
      )
      .required("This field is required!"),
    firstname: Yup.string()
      .required("This field is required!"),
    lastname: Yup.string()
      .required("This field is required!"),
    address: Yup.string()
      .required("This field is required!"),
    businessname: Yup.string()
      .required("This field is required!"),
    vat: Yup.string()
      .required("This field is required!"),
  });

  const handleRegister = (formValue) => {
    const { email, password, firstname, lastname, address, businessname, vat } = formValue;

    setSuccessful(false);

    dispatch(register({ email, password, firstname, lastname, address, businessname, vat }))
      .unwrap()
      .then(() => {
        setSuccessful(true);
        navigate("/payment?registered=true&message=User registered successfully!");
        // navigate("/login?registered=true&message=User registered successfully!");
        // window.location.reload();
      })
      .catch(() => {
        setSuccessful(false);
      });
  };

  return (
    <div className="col-md-12 signup-form">
      <div className="card card-container">
        <img
          src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
          alt="profile-img"
          className="profile-img-card"
        />
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleRegister}
        >
          {({ errors, touched }) => (
            <Form>
              {!successful && (
                <div>
                  <div className="form-group">
                    <label htmlFor="firstname">First Name</label>
                    <Field
                      name="firstname"
                      type="text"
                      className={
                        "form-control" +
                        (errors.firstname && touched.firstname
                          ? " is-invalid"
                          : "")
                      }
                    />
                    <ErrorMessage
                      name="firstname"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastname">Last Name</label>
                    <Field
                      name="lastname"
                      type="text"
                      className={
                        "form-control" +
                        (errors.lastname && touched.lastname
                          ? " is-invalid"
                          : "")
                      }
                    />
                    <ErrorMessage
                      name="lastname"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <Field
                      name="email"
                      type="email"
                      className={
                        "form-control" +
                        (errors.email && touched.email ? " is-invalid" : "")
                      }
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <Field
                      name="password"
                      type="password"
                      className={
                        "form-control" +
                        (errors.password && touched.password
                          ? " is-invalid"
                          : "")
                      }
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <Field
                      name="address"
                      type="text"
                      className={
                        "form-control" +
                        (errors.address && touched.address
                          ? " is-invalid"
                          : "")
                      }
                    />
                    <ErrorMessage
                      name="address"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="businessname">Buiness Name</label>
                    <Field
                      name="businessname"
                      type="text"
                      className={
                        "form-control" +
                        (errors.businessname && touched.businessname
                          ? " is-invalid"
                          : "")
                      }
                    />
                    <ErrorMessage
                      name="businessname"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="vat">VAT</label>
                    <Field
                      name="vat"
                      type="text"
                      className={
                        "form-control" +
                        (errors.vat && touched.vat
                          ? " is-invalid"
                          : "")
                      }
                    />
                    <ErrorMessage
                      name="vat"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>

                  <div className="form-group">
                    <button type="submit" className="btn btn-primary btn-block">
                      Sign Up
                    </button>
                  </div>

                  <div className="form-group">
                    <Link to={"/login"}>
                      <button
                        type="submit"
                        className="btn btn-primary btn-block"
                      >
                        <span>Login</span>
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>

      {
        message && (
          <div className="form-group">
            <div
              className={
                successful ? "alert alert-success" : "alert alert-danger"
              }
              role="alert"
            >
              {message}
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Register;
