import React, { useState, useEffect, useRef } from "react";
import SpotlightCard from './SpotlightCard';
import usePointerGlow from './usePointerGlow';
import StarBorder from './StarBorder';
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { Marker, Popup, Circle, Tooltip, CircleMarker, useMap } from 'react-leaflet'
import ProjectService from '../services/projectservice'
import 'leaflet/dist/leaflet.css';
import '../css_styles/project.css';
import '../css_styles/map.css';
import '../css_styles/project_status_indicator.css';
import '../css_styles/filter_projects.css';
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const projStatus = {
    New: 'green',
    InProgress: 'lightgreen',
    Live: 'blue',
    Delayed: 'yellow',
    Stopped: 'red',
};
const center = [30, 10]
const data = {
    "name": "Solar Power Plant",
    "description": "A solar power plant project aimed at generating renewable energy.",
    "latLon": ["34.0522", "-118.2437"],
    "geographic": "Los Angeles, CA",
    "productionType": "Solar",
    "projectedYear": "2025",
    "capacity": "100 MW",
    "status": "Live"
};

export default function Project() {

    const dispatch = useDispatch();
    const [content, setContent] = useState([data]);
    const { isLoggedIn } = useSelector((state) => state.auth);
    const [popupData, setPopupData] = React.useState(data);
    const [isActive, setIsActive] = React.useState();
    const { ProjectsFilter } = useSelector((state) => {
        return state.api;
    });
    const [projectFilter, setProjectFilter] = useState({ region: 'None', status: 'None', year: 'None', bankable: 'None' });
    const scrollRef = useRef(null);
    usePointerGlow();


    useEffect(() => {
        if (isLoggedIn) {
            ProjectService.getProjects().then(
                (response) => {
                    setContent(response.data);
                    dispatch(ProjectService.getProjectsFilter());
                },
                (error) => {
                    const _content =
                        (error.response && error.response.data) ||
                        error.message ||
                        error.toString();
                    setContent(_content);
                }
            );
        }
    }, []);

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    function TooltipCircle({ data }) {
        const map = useMap();
        const handleClose = () => {
            setIsActive('');
            map.setView(center, 2.5);
        }
        data = data || {};
        return (
            <div>
                {Array.isArray(data) && data.map((element) => (
                    <React.Fragment key={element.id}>
                        <CircleMarker
                            center={element.latLon}
                            id={element.id}
                            eventHandlers={{
                                click: (e) => {
                                    setPopupData(element);
                                    setIsActive('active');
                                    map.setView(
                                        element.latLon,
                                        10
                                    );
                                },
                            }}
                            pathOptions={{ fillColor: projStatus[element.status], color: projStatus[element.status], fillOpacity: 0.3 }}
                            radius={10}>
                            <Popup>
                                <div className="infobox-wrapper ts-show">
                                    <div className="ts-form">
                                        <span className="ts-close" onClick={handleClose} ></span>
                                        <p><b>Name:</b> {popupData && popupData.name}</p>
                                        <p className="description"><b>About:</b> {popupData && popupData.description}</p>
                                        <p><b>Geographic:</b> {popupData && popupData.geographic}</p>
                                        <p><b>Production Type:</b> {popupData && popupData.productionType}</p>
                                        <p><b>Projected Year:</b> {popupData && popupData.projectedYear}</p>
                                        <p><b>Capacity:</b> {popupData && popupData.capacity}</p>
                                        <p><b>Status:</b> <span style={{ color: projStatus[popupData.status], fontWeight: 'bold' }}>{popupData && popupData.status}</span></p>
                                        <button className="btn btn-primary" onClick={handleClose}>
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </Popup >
                        </CircleMarker>
                    </React.Fragment>
                ))
                }
            </div >
        );
    }

    const handleClick = async (event) => {
        event.preventDefault();
        const filter = { ...projectFilter, [event.target.name]: event.target.text };
        setProjectFilter(filter);
        try {
            ProjectService.searchProjects(JSON.stringify(filter)).then(
                (response) => {
                    setContent(response.data);
                },
                (error) => {
                    const _content =
                        (error.response && error.response.data) ||
                        error.message ||
                        error.toString();

                    setContent(_content);
                }
            );
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Scroll functions for left/right navigation
    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: -370, // Card width + gap
                behavior: 'smooth'
            });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: 370, // Card width + gap
                behavior: 'smooth'
            });
        }
    };

    return (<div className="child">

        <div className="section-heading-shiny">
            Explore Global Green Energy Projects
        </div>

        <p className="section-description">
            Browse and analyze our international portfolio of green energy projects. Track development progress, view operational status, and access technical and financial data. Investors and stakeholders can use this space to evaluate opportunities and monitor future-focused clean energy initiatives.
        </p>

        <div className="row card-header align-items-center justify-content-center" style={{ width: "100%" }}>
            {Object.entries(projStatus).map(([key, value]) => (
                <div className="col-auto mb-3 d-flex align-items-center" key={key} style={{ minWidth: 'auto !important', padding: '0 15px !important' }}>
                    <span className="dot" style={{ backgroundColor: value, color: value }}></span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'white' }}>{key}</span>
                </div>
            ))}
        </div>
        <div className="map-wrapper" style={{ maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "0 24px", height: "600px", position: "relative" }}>
            <StarBorder
                as="div"
                className="w-100 h-100"
                color="cyan"
                speed="5s"
                thickness={3}
                style={{ width: '100%', height: '100%' }}
            >
                {/* Filter Dropdowns Overlay */}
                <div className="map-filter-overlay">
                    <div className="col-auto" style={{ minWidth: 'auto !important' }}>
                        <div className="btn-group dropup">
                            <button className="btn btn-secondary dropdown-toggle" type="button" id="regionfilter" data-toggle="dropdown" aria-expanded="true">
                                {projectFilter.region === 'None' ? 'Region' : projectFilter.region}
                                <span className="caret ml-2"></span>
                            </button>
                            <ul className="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
                                {ProjectsFilter && ProjectsFilter.region.map((element) => (
                                    <a className="dropdown-item" onClick={handleClick} name="region" key={element}>{element}</a>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="col-auto" style={{ minWidth: 'auto !important' }}>
                        <div className="btn-group dropup">
                            <button className="btn btn-secondary dropdown-toggle" type="button" id="statusfilter" data-toggle="dropdown" aria-expanded="true">
                                {projectFilter.status === 'None' ? 'Status' : projectFilter.status}
                                <span className="caret ml-2"></span>
                            </button>
                            <ul className="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
                                {ProjectsFilter && ProjectsFilter.status.map((element) => (
                                    <a className="dropdown-item" onClick={handleClick} name="status" key={element}>{element}</a>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="col-auto" style={{ minWidth: 'auto !important' }}>
                        <div className="btn-group dropup">
                            <button className="btn btn-secondary dropdown-toggle" type="button" id="yearfilter" data-toggle="dropdown" aria-expanded="true">
                                {projectFilter.year === 'None' ? 'Year' : projectFilter.year}
                                <span className="caret ml-2"></span>
                            </button>
                            <ul className="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
                                {ProjectsFilter && ProjectsFilter.year.map((element) => (
                                    <a className="dropdown-item" onClick={handleClick} name="year" key={element}>{element}</a>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="col-auto" style={{ minWidth: 'auto !important' }}>
                        <div className="btn-group dropup">
                            <button className="btn btn-secondary dropdown-toggle" type="button" id="bankablefilter" data-toggle="dropdown" aria-expanded="true">
                                {projectFilter.bankable === 'None' ? 'Bankable' : projectFilter.bankable}
                                <span className="caret ml-2"></span>
                            </button>
                            <ul className="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
                                {ProjectsFilter && ProjectsFilter.bankable.map((element) => (
                                    <a className="dropdown-item" onClick={handleClick} name="bankable" key={element}>{element}</a>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <MapContainer center={center} zoom={2} minZoom={2} scrollWheelZoom={true} attributionControl={false} style={{ height: "100%", width: "100%", borderRadius: "var(--radius-lg)" }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <TooltipCircle data={content} />
                </MapContainer>
            </StarBorder>
        </div>

        <div className="container-fluid mt-4">
            <div className="row">
                <div className="col-12" style={{ position: 'relative', textAlign: 'center' }}>
                    <div className="row-header">
                        Featured Projects
                    </div>
                </div>
            </div>

            <div style={{ position: 'relative' }}>
                <button className="scroll-btn scroll-btn-left" onClick={scrollLeft} style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>

                <button className="scroll-btn scroll-btn-right" onClick={scrollRight} style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>

                <div ref={scrollRef} className="scrolling-wrapper exact-glow-wrapper row flex-row flex-nowrap pb-4 pt-2">
                    {
                        Array.isArray(content) ? content.map((element, index) => (
                            <div className="col-auto" key={element.id} style={{ width: '350px' }}>
                                <SpotlightCard project={element} />
                            </div>)) : <div className="col-12 text-white">{content}</div>
                    }
                </div>
            </div>
        </div>
    </div >
    );
}