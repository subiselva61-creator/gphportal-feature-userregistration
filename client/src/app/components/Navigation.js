import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import "../css_styles/navbar.css";

const Navigation = ({ currentUser, logOut, showAdminBoard }) => {
    const [borderStyle, setBorderStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const navRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        if (navRef.current) {
            const updateBorder = () => {
                const activeItem = navRef.current.querySelector(".active");
                if (activeItem) {
                    const navRect = navRef.current.getBoundingClientRect();
                    const activeRect = activeItem.getBoundingClientRect();

                    setBorderStyle({
                        left: activeRect.left - navRect.left,
                        width: activeRect.width,
                        opacity: 1,
                    });
                } else {
                    setBorderStyle((prev) => ({ ...prev, opacity: 0 }));
                }
            };

            // Initial calculation with a small delay to ensure rendering
            const timer = setTimeout(updateBorder, 50);

            // Recalculate on window resize
            window.addEventListener('resize', updateBorder);

            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', updateBorder);
            };
        }
    }, [location.pathname, currentUser]);

    const isLoginPage = location.pathname === '/login';

    return (
        <header className="header_section long_section px-0">
            <nav className={`navbar navbar-expand-lg custom_nav-container glass-navbar${isLoginPage ? ' login-page-navbar' : ''}`}>
                <NavLink
                    to={"/"}
                    className="navbar-brand"
                    style={({ isActive }) => (isActive ? { fontWeight: "bold" } : undefined)}
                >
                    <img src="logo-png3.png" alt="logo" width="70px" />
                </NavLink>
                <button
                    className="navbar-toggler navbar-dark"
                    type="button"
                    data-toggle="collapse"
                    data-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"> </span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <div className="d-flex mx-auto flex-column flex-lg-row align-items-center" style={{ position: "relative" }} ref={navRef}>
                        <div
                            className="border-effect"
                            style={{
                                left: `${borderStyle.left}px`,
                                width: `${borderStyle.width}px`,
                                opacity: borderStyle.opacity,
                            }}
                        ></div>
                        <ul className="navbar-nav">
                            {currentUser && (
                                <li className="nav-item">
                                    <NavLink
                                        to={"/home"}
                                        className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                                    >
                                        Home
                                    </NavLink>
                                </li>
                            )}
                            {currentUser && (
                                <li className="nav-item">
                                    <NavLink
                                        to={"/project"}
                                        className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                                    >
                                        Projects
                                    </NavLink>
                                </li>
                            )}
                            {currentUser && (
                                <li className="nav-item">
                                    <NavLink
                                        to={"/investor"}
                                        className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                                    >
                                        Investor
                                    </NavLink>
                                </li>
                            )}
                            {currentUser && (
                                <li className="nav-item">
                                    <NavLink
                                        to={"/ai-matching-engine"}
                                        className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                                    >
                                        AI Matching Engine
                                    </NavLink>
                                </li>
                            )}
                            {showAdminBoard && (
                                <li className="nav-item">
                                    <NavLink
                                        to={"/admin"}
                                        className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                                    >
                                        Admin Board
                                    </NavLink>
                                </li>
                            )}
                            {currentUser && (
                                <li className="nav-item">
                                    <NavLink
                                        to={"/user"}
                                        className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                                    >
                                        User
                                    </NavLink>
                                </li>
                            )}
                            {currentUser && (
                                <li className="nav-item">
                                    <NavLink
                                        to={"/profile"}
                                        className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                                    >
                                        Profile
                                    </NavLink>
                                </li>
                            )}
                            {currentUser && (
                                <li className="nav-item">
                                    <a href="/login" className="nav-link" onClick={logOut}>
                                        LogOut
                                    </a>
                                </li>
                            )}
                            {!currentUser && (
                                <li className="nav-item">
                                    <NavLink
                                        to={"/home"}
                                        className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                                    >
                                        Home
                                    </NavLink>
                                </li>
                            )}
                            {!currentUser && (
                                <li className="nav-item">
                                    <NavLink
                                        to={"/login"}
                                        className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                                    >
                                        Login
                                    </NavLink>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navigation;
