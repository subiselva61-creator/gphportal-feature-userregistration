import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from "react-router-dom";
import "./App.css";
import Navigation from "./app/components/Navigation";

import Login from "./app/components/Login";
import Register from "./app/components/Register";
import Project from "./app/components/Project";
import HomePage_2 from "./app/components/HomePage_2";
import Investor from "./app/components/Investor";
import AiMatchingEngine from "./app/components/AiMatchingEngine";
import Profile from "./app/components/Profile";
import BoardUser from "./app/components/BoardUser";
import BoardModerator from "./app/components/BoardModerator";
import BoardAdmin from "./app/components/BoardAdmin";
import { logout } from "./app/slices/auth";
import EventBus from "./app/common/EventBus";
import PaymentComponent from "./app/components/PaymentComponent";
import GlassFilter from "./app/components/GlassFilter";
import ErrorBoundary from "./app/common/ErrorBoundary";
import FloatingLines from "./app/components/FloatingLines";
import LaserFlow from "./app/components/LaserFlow";

const GlobalBackground = () => {
  const location = useLocation();

  return (
    <>
      {/* Floating lines: behind page content */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -2,
        pointerEvents: 'none'
      }}>
        <FloatingLines
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[5, 5, 5]}
          lineDistance={[5, 5, 5]}
          bendRadius={5.0}
          bendStrength={-0.5}
          interactive={true}
          parallax={true}
        />
      </div>

      {/* Laser flow: above background but below main content */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1, pointerEvents: 'none', transition: 'opacity 350ms ease', opacity: location.pathname.includes('/ai-matching-engine') ? 1 : 0 }}>
        <LaserFlow
          color="#a855f7"
          verticalSizing={3.0}
          horizontalSizing={0.8}
          fogIntensity={0.95}
          wispIntensity={30.0}
          wispDensity={2.0}
          flowSpeed={0.5}
          flowStrength={1.0}
          horizontalBeamOffset={0.0}
          verticalBeamOffset={0.0}
          style={{ mixBlendMode: 'screen' }}
          enabled={location.pathname.includes('/ai-matching-engine')}
        />
      </div>
    </>
  );
};

const App = () => {
  const [showModeratorBoard, setShowModeratorBoard] = useState(false);
  const [showAdminBoard, setShowAdminBoard] = useState(false);

  const { user: currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const logOut = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      setShowModeratorBoard(currentUser.roles.includes("USER"));
      setShowAdminBoard(currentUser.roles.includes("ADMIN"));
    } else {
      setShowModeratorBoard(false);
      setShowAdminBoard(false);
    }

    EventBus.on("logout", () => {
      logOut();
    });

    return () => {
      EventBus.remove("logout");
    };
  }, [currentUser, logOut]);

  return (
    <Router>
      <ErrorBoundary>
        {/* Conditional global background */}
        <GlobalBackground />

        <div>
          <GlassFilter />
          <Navigation currentUser={currentUser} logOut={logOut} showAdminBoard={showAdminBoard} />
          <div className="parent">
            <Routes>
              <Route path="/" element={<HomePage_2 />} />
              <Route path="/home" element={<HomePage_2 />} />
              <Route path="/project" element={<Project />} />
              <Route path="/ai-matching-engine" element={<AiMatchingEngine />} />
              <Route path="/investor" element={<Investor />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/user" element={<BoardUser />} />
              <Route path="/mod" element={<BoardModerator />} />
              <Route path="/admin" element={<BoardAdmin />} />
              <Route path="/payment" element={<PaymentComponent />} />
            </Routes >
          </div >
        </div >
      </ErrorBoundary >
    </Router >
  );
};

export default App;
