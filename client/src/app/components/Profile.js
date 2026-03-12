import React from "react";
import { Navigate } from 'react-router-dom';
import { useSelector } from "react-redux";

const Profile = () => {
  const { user: currentUser } = useSelector((state) => state.auth);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container">
      <header className="jumbotron">
        <h3>
          <strong>{currentUser.name}</strong> Profile
        </h3>
      </header>
      <p>
        <strong><div className="labelText">Email:</div></strong> {currentUser.email}
      </p>
      <p>
        <strong><div className="labelText">Address:</div></strong> {currentUser.address}
      </p>
      <p>
        <strong><div className="labelText">BusinessName:</div></strong> {currentUser.businessName}
      </p>
      <p>
        <strong><div className="labelText">Vat:</div></strong> {currentUser.vat}
      </p>
      <p>
        <strong><div className="labelText">Payment Status:</div></strong> {currentUser.paymentStatus}
      </p>
      <strong>Authorities:</strong>
      <ul>
        {currentUser.roles &&
          currentUser.roles.map((role, index) => <li key={index}>{role}</li>)}
      </ul>
    </div>
  );
};

export default Profile;
