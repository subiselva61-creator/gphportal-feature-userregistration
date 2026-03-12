import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, Link, useSearchParams } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { login, register } from "../slices/auth";
import { clearMessage, setMessage } from "../slices/message";
import "../css_styles/login.css";

const Login = () => {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const { message } = useSelector((state) => state.message);
  const redirectMsg = searchParams.get('message');
  const [successful, setSuccessful] = useState(false);

  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);


  const initialValues = {
    email: "",
    password: "",
  };

  const signupInitialValues = {
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    address: "",
    businessname: "",
    vat: "",
  };

  const signupValidationSchema = Yup.object().shape({
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

  const validationSchema = Yup.object().shape({
    email: Yup.string().required("This field is required!"),
    password: Yup.string().required("This field is required!"),
  });

  const handleLogin = (formValue) => {
    const { email, password } = formValue;
    setLoading(true);

    dispatch(login({ email, password }))
      .unwrap()
      .then(() => {
        navigate("/home");
        window.location.reload();
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const handleRegister = (formValue) => {
    const { email, password, firstname, lastname, address, businessname, vat } = formValue;

    setSuccessful(false);

    dispatch(register({ email, password, firstname, lastname, address, businessname, vat }))
      .unwrap()
      .then(() => {
        setSuccessful(true);
        // navigate("/payment?registered=true&message=User registered successfully!");
        // navigate("/login?registered=true&message=User registered successfully!");
        // window.location.reload();
      })
      .catch(() => {
        setSuccessful(false);
      });
  };

  if (isLoggedIn) {
    return <Navigate to="/home" />;
  }

  return (
    <div>

      <section id="login-register">
        <div className="container">
          <div className="row">
            <div className="offset-md-2 col-md-8 offset-lg-3 col-lg-6">
              <ul className="nav nav-tabs" id="login-register-tabs" role="tablist">


                <li className="nav-item">
                  <a className="nav-link active" id="login-tab" data-toggle="tab" href="#login" role="tab" aria-controls="login" aria-selected="true">
                    <h3>Login</h3>
                  </a>
                </li>


                <li className="nav-item">
                  <a className="nav-link" id="register-tab" data-toggle="tab" href="#register" role="tab" aria-controls="register" aria-selected="false">
                    <h3>Register</h3>
                  </a>
                </li>

              </ul>
              <div className="tab-content">
                <div className="tab-pane active" id="login" role="tabpanel" aria-labelledby="login-tab">
                  <div className="ts-form">
                    <Formik
                      initialValues={initialValues}
                      validationSchema={validationSchema}
                      onSubmit={handleLogin}
                    >
                      {({ errors, touched }) => (
                        <Form>
                          <div className="form-group">
                            <Field
                              name="email" placeholder="Email"
                              type="text"
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
                            <Field
                              name="password"
                              type="password"
                              placeholder="Password"
                              className={
                                "form-control" +
                                (errors.password && touched.password ? " is-invalid" : "")
                              }
                            />
                            <ErrorMessage
                              name="password"
                              component="div"
                              className="invalid-feedback"
                            />
                          </div>

                          <div className="ts-center__vertical justify-content-between">


                            <div className="custom-control custom-checkbox mb-0">
                              {/* <input type="checkbox" className="custom-control-input" id="login-check" />
                        <label className="custom-control-label" for="login-check">Remember Me</label> */}
                            </div>

                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={loading}
                            >
                              {loading && (
                                <span className="spinner-border spinner-border-sm"></span>
                              )}
                              <span>Login</span>
                            </button>

                          </div>
                          <hr />
                          <a href="#" className="ts-text-small">
                            <i className="fa fa-sync-alt ts-text-color-primary mr-2"></i>
                            <span className="ts-text-color-light">I have forgot my password</span>
                          </a>
                        </Form>
                      )}
                    </Formik>
                    {(message || redirectMsg) && (
                      <div className="form-group">
                        <div className="alert alert-danger" role="alert">
                          {message || redirectMsg}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="tab-pane" id="register" role="tabpanel" aria-labelledby="register-tab">
                  <div className="ts-form">
                    <Formik
                      initialValues={signupInitialValues}
                      validationSchema={signupValidationSchema}
                      onSubmit={handleRegister}
                    >
                      {({ errors, touched }) => (
                        <Form>
                          {!successful && (
                            <div>
                              <div className="form-group">
                                <Field
                                  name="firstname"
                                  type="text" placeholder="First Name"
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
                                <Field
                                  name="lastname" placeholder="Last Name"
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
                                <Field placeholder="Email"
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
                                <Field placeholder="Password"
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
                                <Field placeholder="Address"
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
                                <Field placeholder="Business Name"
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
                                <Field placeholder="VAT"
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

                              <div className="ts-center__vertical justify-content-between">
                                <div className="custom-control custom-checkbox mb-0">
                                  {/* <input type="checkbox" className="custom-control-input" id="login-check" />
                        <label className="custom-control-label" for="login-check">Remember Me</label> */}
                                </div>

                                <div className="form-group">
                                  <button type="submit" className="btn btn-primary">
                                    Sign Up
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Form>
                      )}
                    </Formik>
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
