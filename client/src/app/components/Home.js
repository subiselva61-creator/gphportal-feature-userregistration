import React, { useState, useEffect, useMemo, Modal } from "react";
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { Marker, Popup, Circle, Tooltip, CircleMarker, useMap } from 'react-leaflet'
import ProjectService from '../services/projectservice'
import 'leaflet/dist/leaflet.css';
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const projStatus = {
  New: 'green',
  InProgress: 'lightgreen',
  Live: 'blue',
  Delayed: 'yellow',
  FinDifficult: 'red',
  Stopped: 'black',
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

export default function App() {

  const dispatch = useDispatch();
  const [content, setContent] = useState([data])
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [popupData, setPopupData] = React.useState(data);
  const [isActive, setIsActive] = React.useState();
  const { ProjectsFilter } = useSelector((state) => {
    return state.api;
  });
  const [projectFilter, setProjectFilter] = useState({ region: 'None', status: 'None', year: 'None', bankable: 'None' });


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
        {data.map((element) => (
          <>
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
                <div className="infobox-wrapper ts-show" style={{ backgroundColor: "white", zIndex: 9999, padding: "10px", borderRadius: "5px" }}>
                  {/* <a href="#"> */}
                  <div className="ts-form">
                    <span className="ts-close" onClick={handleClose} ></span>
                    <p><b>Name: {popupData && popupData.name}</b></p>
                    <p className="description"><b>About: {popupData && popupData.description}</b></p>
                    <p><b>Geographic:</b> {popupData && popupData.geographic}</p>
                    <p><b>Production Type:</b> {popupData && popupData.productionType}</p>
                    <p><b>Projected Year:</b> {popupData && popupData.projectedYear}</p>
                    <p><b>Capacity:</b> {popupData && popupData.capacity}</p>
                    <p style={{ color: projStatus[popupData.status] }}><b>Status:</b> {popupData && popupData.status}</p>
                    <button className="btn btn-primary" onClick={handleClose} style={{ width: "100%" }}>
                      Close
                    </button>
                  </div>
                  {/* </a> */}
                </div>
              </Popup >
            </CircleMarker>
          </>
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

  return (<div className="child">

    <div class="row card-header bg-secondary  vh-100 align-items-center justify-content-center" style={{ width: "100vw" }}>
      {Object.entries(projStatus).map(([key, value]) => (
        <div className="col-6 col-md-2 mb-3"><span class="dot" style={{ backgroundColor: value, float: "left" }}></span><p style={{ float: "left", marginLeft: "1px" }}>{key}</p></div>
      ))}
    </div>
    <div class="row" style={{ height: "40vh", width: "100vw" }}>
      <MapContainer center={center} zoom={2} minZoom={2} scrollWheelZoom={true} style={{ height: "38vh", width: "97vw", position: "absolute" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <TooltipCircle data={content} />
      </MapContainer>
    </div>
    <hr />
    <div class="row">
      <div class="col card-header bg-secondary row-header">
        Filter Projects
      </div>
    </div>
    <div class="row card-header bg-secondary">
      <div className="col" style={{ marginRight: "10px", marginTop: "10px" }}>
        <div class="btn-group dropdown">
          <button class="btn btn-secondary dropdown-toggle" type="button" id="regionfilter" data-toggle="dropdown" aria-expanded="true">
            {projectFilter.region === 'None' ? 'Region' : projectFilter.region}
            <span class="caret"></span>
          </button>
          <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
            {ProjectsFilter && ProjectsFilter.region.map((element) => (
              <a class="dropdown-item" onClick={handleClick} name="region">{element}</a>
            ))}
          </ul>
        </div>
      </div>
      <div className="col" style={{ marginRight: "10px", marginTop: "10px" }}>
        <div class="btn-group dropdown" >
          <button class="btn btn-secondary dropdown-toggle" type="button" id="statusfilter" data-toggle="dropdown" aria-expanded="true">
            {projectFilter.status === 'None' ? 'Status' : projectFilter.status}
            <span class="caret"></span>
          </button>
          <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
            {ProjectsFilter && ProjectsFilter.status.map((element) => (
              <a class="dropdown-item" onClick={handleClick} name="status">{element}</a>
            ))}
          </ul>
        </div>

      </div>
      <div className="col" style={{ marginRight: "10px", marginTop: "10px" }}>
        <div class="btn-group dropdown">
          <button class="btn btn-secondary dropdown-toggle" type="button" id="yearfilter" data-toggle="dropdown" aria-expanded="true">
            {projectFilter.year === 'None' ? 'Year' : projectFilter.year}
            <span class="caret"></span>
          </button>
          <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
            {ProjectsFilter && ProjectsFilter.year.map((element) => (
              <a class="dropdown-item" onClick={handleClick} name="year">{element}</a>
            ))}
          </ul>
        </div>

      </div>

      <div className="col" style={{ marginRight: "10px", marginTop: "10px" }}>
        <div class="btn-group dropdown">
          <button class="btn btn-secondary dropdown-toggle" type="button" id="bankablefilter" data-toggle="dropdown" aria-expanded="true">
            {projectFilter.bankable === 'None' ? 'Bankable' : projectFilter.bankable}
            <span class="caret"></span>
          </button>
          <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
            {ProjectsFilter && ProjectsFilter.bankable.map((element) => (
              <a class="dropdown-item" onClick={handleClick} name="bankable">{element}</a>
            ))}
          </ul>
        </div></div>
    </div>

    <hr />
    <div class="row">
      <div class="col card-header bg-secondary row-header">
        Featured Projects
      </div>
    </div>
    <div class="scrolling-wrapper row flex-row flex-nowrap mt-4 pb-4 pt-2">
      {
        content.map((element) => (
          <div className="col" key={element.id}>
            <div className="card">
              <h5 className="card-title">{element.name}</h5>
              <p className="card-text">Region: {element.geographic}</p>
              <p className="card-text">Status: {element.status}</p>
              <p className="card-text">Product Type: {element.productionType}</p>
              <p className="card-text">Projected Year: {element.projectedYear}</p>
              <p className="card-text">Capacity: {element.capacity}</p>
            </div>
          </div>))
      }
    </div>
  </div >
  );
}