import React, { useState, useEffect, useMemo, Modal, useRef } from "react";
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { Marker, Popup, Circle, Tooltip, CircleMarker, useMap } from 'react-leaflet'
import InvestorsService from '../services/investorservice'
import { setFilteredtInvestor } from '../services/slice'
import 'leaflet/dist/leaflet.css';
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import 'flag-icons/css/flag-icons.min.css';
import '../css_styles/invostor.css';
import '../css_styles/invostor_map.css';
import InvestorCard from './InvestorCard';
import usePointerGlow from './usePointerGlow';
const _ = require('lodash');


const projStatus = {
  New: 'green',
  InProgress: 'lightgreen',
  Live: 'blue',
  Delayed: 'yellow',
  Stopped: 'red',
};
const center = [30, 10]
const data = {};

export default function App() {

  const dispatch = useDispatch();
  const { Investors } = useSelector((state) => {
    return state.api;
  });
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [popupData, setPopupData] = React.useState(data);
  const [isActive, setIsActive] = React.useState();
  const [geographies, setGeographies] = useState([]);
  const scrollRef = useRef(null);
  usePointerGlow();

  useEffect(() => {
    if (isLoggedIn) {
      InvestorsService.getInvestors().then(
        (response) => {
          setGeographies(["all-All", ...new Set(response.data.map(e => e.geography))]);
          dispatch(setFilteredtInvestor({ Investors: response.data }));
        },
        (error) => {
          const _content =
            (error.response && error.response.data) ||
            error.message ||
            error.toString();
          dispatch(setFilteredtInvestor({ Investors: [] })); // Set to empty array on error to avoid crash
          console.error("Error loading investors:", _content);
        }
      );
    }
  }, [isLoggedIn, dispatch]);


  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  function TooltipCircle({ data }) {
    const map = useMap();
    if (!data || !Array.isArray(data)) {
      return (<div></div>);
    }
    const handleClose = () => {
      setIsActive('');
      map.setView(center, 2.5);
    }

    return (
      <div>
        {data.map((element) => (
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
              pathOptions={{ fillColor: projStatus["Live"], color: projStatus["Live"], fillOpacity: 0.3 }}
              radius={10}>
            </CircleMarker>
          </React.Fragment>
        ))
        }
      </div >
    );
  }

  const filterInvestorByGeography = async (event) => {
    event.preventDefault();
    try {
      const geogrphy = event.currentTarget.getAttribute("name");
      dispatch(InvestorsService.searchInvestorByGeography(geogrphy));
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
    <div style={{ maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "0 24px" }}>
      <div className="investor-map-wrapper">
        <MapContainer center={center} zoom={2} minZoom={2} scrollWheelZoom={true} className="investor-map">
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <TooltipCircle data={Investors} />
        </MapContainer>

        {/* Geography filter buttons positioned at bottom of map */}
        <div className="geography-filters-container">
          {geographies &&
            (geographies.map((element) => (
              <a href="#" className="geography-filter-btn" onClick={filterInvestorByGeography} name={element} key={element}>
                <span className={`fi fi-${element.split('-')[0]?.toLowerCase()} geography-flag`}></span>
                <span className="geography-name">{element.split('-')[1]}</span>
              </a>
            )))
          }
        </div>
      </div>
    </div>

    <div className="container-fluid mt-4">

      <div className="row">
        <div className="col-12" style={{ position: 'relative', textAlign: 'center' }}>
          <div className="row-header">
            Global & Multilateral Investors
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
          {Investors && Array.isArray(Investors) &&
            (Investors.map((element) => (
              <div className="col-auto" key={element.id} style={{ width: '400px', marginBottom: '1.5rem' }}>
                <InvestorCard investor={element} />
              </div>)))
          }
        </div>
      </div>
    </div>
  </div >
  );
}