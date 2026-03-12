import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import ProjectService from "../services/projectservice";
import InvestorsService from "../services/investorservice";

import "../css_styles/ai-matching-engine.css";

const DEFAULT_FILTER_VALUE = 'Any';

export default function AiMatchingEngine() {
    const dispatch = useDispatch();
    const { isLoggedIn } = useSelector((state) => state.auth);
    const { ProjectsFilter } = useSelector((state) => state.api || {});

    const [query, setQuery] = useState("");
    const [projects, setProjects] = useState([]);
    const [investors, setInvestors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedInvestor, setSelectedInvestor] = useState(null);
    const [scope, setScope] = useState('combined');

    const [projectFilters, setProjectFilters] = useState({
        region: DEFAULT_FILTER_VALUE,
        status: DEFAULT_FILTER_VALUE,
        year: DEFAULT_FILTER_VALUE,
        bankable: DEFAULT_FILTER_VALUE,
    });

    const [investorFilters, setInvestorFilters] = useState({
        type: DEFAULT_FILTER_VALUE,
        geography: DEFAULT_FILTER_VALUE,
        minInvestment: '',
        maxInvestment: '',
    });

    const projectRef = useRef(null);
    const investorRef = useRef(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [pRes, iRes] = await Promise.all([
                ProjectService.getProjects(),
                InvestorsService.getInvestors(),
            ]);
            setProjects(pRes.data || []);
            setInvestors(iRes.data || []);
            try { dispatch(ProjectService.getProjectsFilter()); } catch (e) { }
        } catch (err) {
            console.error("AiMatchingEngine load error", err);
            setProjects([]);
            setInvestors([]);
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        if (isLoggedIn) fetchAll();
    }, [fetchAll, isLoggedIn]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!query) {
                fetchAll();
                return;
            }
            setLoading(true);
            Promise.all([
                ProjectService.searchProjects(encodeURIComponent(query)),
                InvestorsService.searchInvestors(encodeURIComponent(query)),
            ])
                .then(([p, i]) => {
                    setProjects(p.data || []);
                    setInvestors(i.data || []);
                })
                .catch(err => console.error("Search error", err))
                .finally(() => setLoading(false));
        }, 350);
        return () => clearTimeout(timer);
    }, [query, fetchAll]);

    const filterProjects = (list) => {
        return list.filter(p => {
            if (projectFilters.region !== DEFAULT_FILTER_VALUE && p.geographic !== projectFilters.region) return false;
            if (projectFilters.status !== DEFAULT_FILTER_VALUE && p.status !== projectFilters.status) return false;
            if (projectFilters.year !== DEFAULT_FILTER_VALUE && String(p.projectedYear) !== projectFilters.year) return false;
            if (projectFilters.bankable !== DEFAULT_FILTER_VALUE && String(p.bankable) !== projectFilters.bankable) return false;
            return true;
        });
    };

    const filterInvestors = (list) => {
        return list.filter(i => {
            if (investorFilters.type !== DEFAULT_FILTER_VALUE && i.type !== investorFilters.type) return false;
            if (investorFilters.geography !== DEFAULT_FILTER_VALUE && i.geography !== investorFilters.geography) return false;
            const min = investorFilters.minInvestment ? Number(investorFilters.minInvestment) : null;
            const max = investorFilters.maxInvestment ? Number(investorFilters.maxInvestment) : null;
            if (min !== null && Number(i.investmentSize) < min) return false;
            if (max !== null && Number(i.investmentSize) > max) return false;
            return true;
        });
    };

    const applyFilters = async () => {
        setLoading(true);
        try {
            // Send filters to server to reduce data transferred and processing on client
            const projectFilterPayload = {
                region: projectFilters.region === DEFAULT_FILTER_VALUE ? 'None' : projectFilters.region,
                status: projectFilters.status === DEFAULT_FILTER_VALUE ? 'None' : projectFilters.status,
                year: projectFilters.year === DEFAULT_FILTER_VALUE ? 'None' : projectFilters.year,
                bankable: projectFilters.bankable === DEFAULT_FILTER_VALUE ? 'None' : projectFilters.bankable,
            };

            const investorFilterPayload = {
                type: investorFilters.type === DEFAULT_FILTER_VALUE ? 'Any' : investorFilters.type,
                geography: investorFilters.geography === DEFAULT_FILTER_VALUE ? 'Any' : investorFilters.geography,
                minInvestment: investorFilters.minInvestment ? Number(investorFilters.minInvestment) : null,
                maxInvestment: investorFilters.maxInvestment ? Number(investorFilters.maxInvestment) : null,
            };

            const [pRes, iRes] = await Promise.all([
                ProjectService.searchProjects(encodeURIComponent(JSON.stringify(projectFilterPayload))),
                InvestorsService.searchInvestors(encodeURIComponent(JSON.stringify(investorFilterPayload))),
            ]);

            let projList = pRes.data || [];
            let invList = iRes.data || [];

            if (scope === 'combined') {
                setProjects(projList);
                setInvestors(invList);
            }
            else if (scope === 'projects') {
                setProjects(projList);
            }
            else if (scope === 'investors') {
                setInvestors(invList);
            }
        } catch (err) {
            console.error('Apply filters error', err);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setProjectFilters({
            region: DEFAULT_FILTER_VALUE,
            status: DEFAULT_FILTER_VALUE,
            year: DEFAULT_FILTER_VALUE,
            bankable: DEFAULT_FILTER_VALUE,
        });
        setInvestorFilters({
            type: DEFAULT_FILTER_VALUE,
            geography: DEFAULT_FILTER_VALUE,
            minInvestment: '',
            maxInvestment: '',
        });
        setScope('combined');
        setQuery('');
        fetchAll();
    };

    const scroll = (ref, amount) => {
        ref?.current?.scrollBy({ left: amount, behavior: 'smooth' });
    };

    if (!isLoggedIn) return <Navigate to="/login" />;

    return (
        <div className="ai-matching-engine-container">
            <div className="ai-matching-full-bg"></div>
            <div className="ai-matching-layout">
                <div className="ai-matching-side-heading">
                    <h1>AI MATCHING ENGINE</h1>
                </div>

                <div className="ai-matching-content-box">
                    <div className="row" style={{ margin: 0 }}>
                        {/* Filters Sidebar */}
                        <div className="col-md-3">
                            <div className="ai-matching-engine-filters">
                                <h6>Scope</h6>
                                <div className="btn-group mb-3" role="group">
                                    {['combined', 'projects', 'investors'].map(s => (
                                        <button
                                            key={s}
                                            className={`btn ${scope === s ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => setScope(s)}
                                        >
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                <h6>Project Filters</h6>
                                {['region', 'status', 'year'].map(filter => (
                                    <div className="form-group mb-2" key={filter}>
                                        <label style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>
                                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                        </label>
                                        <select
                                            className="form-control combined-search-filters form-select"
                                            value={projectFilters[filter]}
                                            onChange={(e) => setProjectFilters({ ...projectFilters, [filter]: e.target.value })}
                                        >
                                            {ProjectsFilter?.[filter]?.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}

                                <h6 className="mt-3">Investor Filters</h6>
                                <div className="form-group mb-2">
                                    <label style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>Type</label>
                                    <select
                                        className="form-control combined-search-filters form-select"
                                        value={investorFilters.type}
                                        onChange={(e) => setInvestorFilters({ ...investorFilters, type: e.target.value })}
                                    >
                                        {Array.from(new Set(investors.map(i => i.type).filter(Boolean))).map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group mb-2">
                                    <label style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>Geography</label>
                                    <select
                                        className="form-control combined-search-filters form-select"
                                        value={investorFilters.geography}
                                        onChange={(e) => setInvestorFilters({ ...investorFilters, geography: e.target.value })}
                                    >
                                        {Array.from(new Set(investors.map(i => i.geography).filter(Boolean))).map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                </div>

                                {['minInvestment', 'maxInvestment'].map(field => (
                                    <div className="form-group mb-2" key={field}>
                                        <label style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>
                                            {field === 'minInvestment' ? 'Min Investment' : 'Max Investment'}
                                        </label>
                                        <input
                                            className="form-control"
                                            value={investorFilters[field]}
                                            onChange={(e) => setInvestorFilters({ ...investorFilters, [field]: e.target.value })}
                                            placeholder={field === 'minInvestment' ? 'e.g. 100000' : 'e.g. 5000000'}
                                        />
                                    </div>
                                ))}

                                <div className="d-flex justify-content-between mt-3">
                                    <button className="btn btn-primary" onClick={applyFilters}>Apply</button>
                                    <button className="btn btn-outline-secondary" onClick={resetFilters}>Reset</button>
                                </div>
                            </div>
                        </div>

                        {/* Results Section */}
                        <div className="col-md-9">
                            <div className="ai-matching-engine-results">
                                <div className="ai-matching-engine-input-group">
                                    <input
                                        aria-label="Search projects and investors"
                                        className="form-control"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search by name, geography, status, investor..."
                                    />
                                    <button className="btn btn-secondary" onClick={() => { setQuery(''); fetchAll(); }}>Reset</button>
                                </div>

                                {loading && <div className="ai-matching-engine-loading">Loading...</div>}

                                <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                                {/* Projects Section */}
                                <div>
                                    <div className="ai-matching-engine-section-header">Projects</div>
                                    <div style={{ position: 'relative', marginTop: '0.75rem' }}>
                                        <button
                                            className="ai-matching-engine-scroll-btn"
                                            onClick={() => scroll(projectRef, -370)}
                                            style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                                        >
                                            ‹
                                        </button>
                                        <div ref={projectRef} className="ai-matching-engine-scrolling-wrapper row flex-row flex-nowrap pb-4 pt-2">
                                            {projects.length > 0 ? projects.map(p => (
                                                <div className="col" key={p.id || p._id} style={{ minWidth: '300px', maxWidth: '380px', marginRight: '0.25rem', paddingLeft: '0.25rem', paddingRight: '0.25rem' }}>
                                                    <div className="ai-matching-engine-card h-100">
                                                        <h5 className="card-title">{p.name}</h5>
                                                        <p className="card-text">Region: {p.geographic}</p>
                                                        <p className="card-text">Status: {p.status}</p>
                                                        <p className="card-text">Type: {p.productionType}</p>
                                                        <p className="card-text">Year: {p.projectedYear}</p>
                                                        <div className="d-flex flex-wrap" style={{ gap: '6px' }}>
                                                            {(p.investors || []).slice(0, 4).map(inv => (
                                                                <button
                                                                    key={inv.id || inv._id}
                                                                    className="btn btn-outline-secondary btn-sm"
                                                                    onClick={() => setSelectedInvestor(inv)}
                                                                >
                                                                    {inv.name}
                                                                </button>
                                                            ))}
                                                            {p.investors && p.investors.length > 4 && (
                                                                <span className="text-muted">+{p.investors.length - 4} more</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : <div className="col-12 ai-matching-engine-empty">No projects found</div>}
                                        </div>
                                        <button
                                            className="ai-matching-engine-scroll-btn"
                                            onClick={() => scroll(projectRef, 370)}
                                            style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                                        >
                                            ›
                                        </button>
                                    </div>
                                </div>

                                <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                                {/* Investors Section */}
                                <div>
                                    <div className="ai-matching-engine-section-header">Investors</div>
                                    <div style={{ position: 'relative', marginTop: '0.75rem' }}>
                                        <button
                                            className="ai-matching-engine-scroll-btn"
                                            onClick={() => scroll(investorRef, -370)}
                                            style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                                        >
                                            ‹
                                        </button>
                                        <div ref={investorRef} className="ai-matching-engine-scrolling-wrapper row flex-row flex-nowrap pb-4 pt-2">
                                            {investors.length > 0 ? investors.map(inv => (
                                                <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3 d-flex align-items-stretch" key={inv.id || inv._id} style={{ minWidth: '260px', marginRight: '0.75rem' }}>
                                                    <div className="ai-matching-engine-card h-100" style={{ width: '100%' }}>
                                                        <div className="d-flex align-items-left justify-content-left my-3">
                                                            {inv.logo && <img src={inv.logo} alt={`${inv.name} logo`} className="img-fluid" style={{ maxHeight: "40px", maxWidth: "60px", objectFit: "contain", marginRight: "10px" }} />}
                                                            <h5 className="card-title mb-0">{inv.name}</h5>
                                                        </div>
                                                        <p className="card-text"><b>Country:</b> {inv.country}</p>
                                                        <p className="card-text"><b>Investment Size:</b> {inv.investmentSize}</p>
                                                        <p className="card-text"><b>Strategy:</b> {inv.strategy}</p>
                                                        <div className="d-flex" style={{ gap: '6px' }}>
                                                            <button className="btn btn-primary btn-sm" onClick={() => setSelectedInvestor(inv)}>Quick View</button>
                                                            <button className="btn btn-outline-secondary btn-sm">Save</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : <div className="col-12 ai-matching-engine-empty">No investors found</div>}
                                        </div>
                                        <button
                                            className="ai-matching-engine-scroll-btn"
                                            onClick={() => scroll(investorRef, 370)}
                                            style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                                        >
                                            ›
                                        </button>
                                    </div>
                                </div>

                                {/* Quick View Drawer */}
                                {selectedInvestor && (
                                    <div style={{ position: 'fixed', right: 20, top: 80, width: 380, maxWidth: 'calc(100% - 40px)', zIndex: 9999 }}>
                                        <div className="ai-matching-engine-drawer">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h5 className="card-title">{selectedInvestor.name}</h5>
                                                <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedInvestor(null)}>Close</button>
                                            </div>
                                            <div className="card-body" style={{ padding: 0 }}>
                                                {selectedInvestor.logo && <img src={selectedInvestor.logo} alt={selectedInvestor.name} style={{ maxHeight: 60, maxWidth: 80, marginBottom: 8 }} />}
                                                <p><b>Country:</b> {selectedInvestor.country}</p>
                                                <p><b>Investment Size:</b> {selectedInvestor.investmentSize}</p>
                                                <p><b>Strategy:</b> {selectedInvestor.strategy}</p>
                                                <p><b>Notable Activity:</b> {selectedInvestor.notableActivity}</p>
                                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                                    <button className="btn btn-primary btn-sm">Contact</button>
                                                    <button className="btn btn-outline-secondary btn-sm">Request Intro</button>
                                                    <button className="btn btn-secondary btn-sm">View Profile</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}