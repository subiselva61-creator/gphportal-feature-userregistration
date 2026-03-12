import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import ProjectService from "../services/projectservice";
import InvestorsService from "../services/investorservice";
import "../css_styles/combined-search.css";

export default function CombinedSearch() {
    const dispatch = useDispatch();
    const { isLoggedIn } = useSelector((state) => state.auth);
    const { ProjectsFilter } = useSelector((state) => state.api || {});

    const [query, setQuery] = useState("");
    const [projects, setProjects] = useState([]);
    const [investors, setInvestors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedInvestor, setSelectedInvestor] = useState(null);
    const [scope, setScope] = useState('combined'); // 'projects' | 'investors' | 'combined'

    const [projectFilters, setProjectFilters] = useState({ region: 'None', status: 'None', year: 'None', bankable: 'None' });
    const [investorFilters, setInvestorFilters] = useState({ type: 'Any', geography: 'Any', minInvestment: '', maxInvestment: '' });

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
            // load filters into redux (ProjectService.getProjectsFilter is a thunk)
            try { dispatch(ProjectService.getProjectsFilter()); } catch (e) { }
        } catch (err) {
            console.error("CombinedSearch load error", err);
            setProjects([]);
            setInvestors([]);
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        if (isLoggedIn) fetchAll();
    }, [fetchAll, isLoggedIn]);

    // debounce search
    useEffect(() => {
        const t = setTimeout(() => {
            if (!query) { fetchAll(); return; }
            setLoading(true);
            Promise.all([
                ProjectService.searchProjects(encodeURIComponent(query)),
                InvestorsService.searchInvestors(encodeURIComponent(query)),
            ]).then(([p, i]) => {
                setProjects(p.data || []);
                setInvestors(i.data || []);
            }).catch(err => {
                console.error("Search error", err);
            }).finally(() => setLoading(false));
        }, 350);
        return () => clearTimeout(t);
    }, [query, fetchAll]);

    const applyFilters = async () => {
        setLoading(true);
        try {
            const [pRes, iRes] = await Promise.all([
                ProjectService.getProjects(),
                InvestorsService.getInvestors(),
            ]);
            let projList = pRes.data || [];
            let invList = iRes.data || [];

            // apply simple project filters client-side
            projList = projList.filter(p => {
                if (projectFilters.region !== 'None' && p.geographic !== projectFilters.region) return false;
                if (projectFilters.status !== 'None' && p.status !== projectFilters.status) return false;
                if (projectFilters.year !== 'None' && String(p.projectedYear) !== String(projectFilters.year)) return false;
                if (projectFilters.bankable !== 'None' && String(p.bankable) !== String(projectFilters.bankable)) return false;
                return true;
            });

            // apply simple investor filters client-side
            invList = invList.filter(i => {
                if (investorFilters.type !== 'Any' && i.type && i.type !== investorFilters.type) return false;
                if (investorFilters.geography !== 'Any' && i.geography && i.geography !== investorFilters.geography) return false;
                const min = investorFilters.minInvestment ? Number(investorFilters.minInvestment) : null;
                const max = investorFilters.maxInvestment ? Number(investorFilters.maxInvestment) : null;
                if (min !== null && i.investmentSize && Number(i.investmentSize) < min) return false;
                if (max !== null && i.investmentSize && Number(i.investmentSize) > max) return false;
                return true;
            });

            // combined semantics: keep projects that have at least one matched investor
            if (scope === 'combined') {
                const invNames = new Set(invList.map(ii => ii.name));
                projList = projList.filter(p => {
                    const pInvs = p.investors || [];
                    if (pInvs.length === 0) return false;
                    return pInvs.some(pi => (pi.id && invList.find(ii => ii.id === pi.id)) || invNames.has(pi.name));
                });
            }

            // depending on scope, show appropriate lists
            if (scope === 'investors') {
                setProjects([]);
                setInvestors(invList);
            } else {
                setProjects(projList);
                // also show matched investors in the investors pane
                setInvestors(invList);
            }
        } catch (err) {
            console.error('Apply filters error', err);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setProjectFilters({ region: 'None', status: 'None', year: 'None', bankable: 'None' });
        setInvestorFilters({ type: 'Any', geography: 'Any', minInvestment: '', maxInvestment: '' });
        setScope('combined');
        setQuery('');
        fetchAll();
    }

    const scroll = (ref, amount) => {
        if (ref?.current) ref.current.scrollBy({ left: amount, behavior: 'smooth' });
    };

    if (!isLoggedIn) return <Navigate to="/login" />;

    return (
        <div className="combined-search-container">
            <div className="combined-search-heading">Search Projects & Investors</div>

            <div className="row" style={{ marginTop: 12 }}>
                <div className="col-md-3">
                    <div className="combined-search-filters">
                        <h6>Scope</h6>
                        <div className="btn-group mb-3" role="group">
                            <button className={`btn ${scope === 'combined' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setScope('combined')}>Combined</button>
                            <button className={`btn ${scope === 'projects' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setScope('projects')}>Projects</button>
                            <button className={`btn ${scope === 'investors' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setScope('investors')}>Investors</button>
                        </div>

                        <h6>Project Filters</h6>
                        <div className="form-group mb-2">
                            <label style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>Region</label>
                            <select className="form-control" value={projectFilters.region} onChange={(e) => setProjectFilters({ ...projectFilters, region: e.target.value })}>
                                <option value="None">Any</option>
                                {ProjectsFilter && ProjectsFilter.region && ProjectsFilter.region.map(r => (<option key={r} value={r}>{r}</option>))}
                            </select>
                        </div>
                        <div className="form-group mb-2">
                            <label style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>Status</label>
                            <select className="form-control" value={projectFilters.status} onChange={(e) => setProjectFilters({ ...projectFilters, status: e.target.value })}>
                                <option value="None">Any</option>
                                {ProjectsFilter && ProjectsFilter.status && ProjectsFilter.status.map(s => (<option key={s} value={s}>{s}</option>))}
                            </select>
                        </div>
                        <div className="form-group mb-2">
                            <label style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>Year</label>
                            <select className="form-control" value={projectFilters.year} onChange={(e) => setProjectFilters({ ...projectFilters, year: e.target.value })}>
                                <option value="None">Any</option>
                                {ProjectsFilter && ProjectsFilter.year && ProjectsFilter.year.map(y => (<option key={y} value={y}>{y}</option>))}
                            </select>
                        </div>

                        <h6 className="mt-3">Investor Filters</h6>
                        <div className="form-group mb-2">
                            <label style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>Type</label>
                            <select className="form-control" value={investorFilters.type} onChange={(e) => setInvestorFilters({ ...investorFilters, type: e.target.value })}>
                                <option value="Any">Any</option>
                                {/* derive types from investors list */}
                                {Array.from(new Set(investors.map(i => i.type).filter(Boolean))).map(t => (<option key={t} value={t}>{t}</option>))}
                            </select>
                        </div>
                        <div className="form-group mb-2">
                            <label style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>Geography</label>
                            <select className="form-control" value={investorFilters.geography} onChange={(e) => setInvestorFilters({ ...investorFilters, geography: e.target.value })}>
                                <option value="Any">Any</option>
                                {Array.from(new Set(investors.map(i => i.geography).filter(Boolean))).map(g => (<option key={g} value={g}>{g}</option>))}
                            </select>
                        </div>
                        <div className="form-group mb-2">
                            <label style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>Min Investment</label>
                            <input className="form-control" value={investorFilters.minInvestment} onChange={(e) => setInvestorFilters({ ...investorFilters, minInvestment: e.target.value })} placeholder="e.g. 100000" />
                        </div>
                        <div className="form-group mb-2">
                            <label style={{ fontSize: '0.85rem', color: '#e0e7ff' }}>Max Investment</label>
                            <input className="form-control" value={investorFilters.maxInvestment} onChange={(e) => setInvestorFilters({ ...investorFilters, maxInvestment: e.target.value })} placeholder="e.g. 5000000" />
                        </div>

                        <div className="d-flex justify-content-between mt-3">
                            <button className="btn btn-primary" onClick={applyFilters}>Apply</button>
                            <button className="btn btn-outline-secondary" onClick={resetFilters}>Reset</button>
                        </div>
                    </div>
                </div>
                <div className="col-md-9">
                    <div className="combined-search-results">
                        <div className="combined-search-input-group">
                            <input
                                aria-label="Search projects and investors"
                                className="form-control"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by name, geography, status, investor..."
                            />
                            <button className="btn btn-secondary" onClick={() => { setQuery(''); fetchAll(); }}>Reset</button>
                        </div>

                        {loading && <div className="combined-search-loading">Loading...</div>}

                        <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                        <div>
                            <div className="combined-search-section-header">
                                Projects
                            </div>
                            <div style={{ position: 'relative', marginTop: '0.75rem' }}>
                                <button className="combined-search-scroll-btn" onClick={() => scroll(projectRef, -370)} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>‹</button>
                                <div ref={projectRef} className="combined-search-scrolling-wrapper row flex-row flex-nowrap pb-4 pt-2">
                                    {Array.isArray(projects) && projects.length > 0 ? projects.map(p => (
                                        <div className="col" key={p.id || p._id} style={{ minWidth: '300px', maxWidth: '380px', marginRight: '0.75rem' }}>
                                            <div className="combined-search-card h-100">
                                                <h5 className="card-title">{p.name}</h5>
                                                <p className="card-text">Region: {p.geographic}</p>
                                                <p className="card-text">Status: {p.status}</p>
                                                <p className="card-text">Type: {p.productionType}</p>
                                                <p className="card-text">Year: {p.projectedYear}</p>
                                                <div className="d-flex flex-wrap" style={{ gap: '6px' }}>
                                                    {(p.investors || []).slice(0, 4).map(inv => (
                                                        <button key={inv.id || inv._id} className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedInvestor(inv)}>{inv.name}</button>
                                                    ))}
                                                    {p.investors && p.investors.length > 4 && (
                                                        <span className="text-muted">+{p.investors.length - 4} more</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )) : <div className="col-12 combined-search-empty">No projects found</div>}
                                </div>
                                <button className="combined-search-scroll-btn" onClick={() => scroll(projectRef, 370)} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>›</button>
                            </div>
                        </div>

                        <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                        <div>
                            <div className="combined-search-section-header">
                                Investors
                            </div>
                            <div style={{ position: 'relative', marginTop: '0.75rem' }}>
                                <button className="combined-search-scroll-btn" onClick={() => scroll(investorRef, -370)} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>‹</button>
                                <div ref={investorRef} className="combined-search-scrolling-wrapper row flex-row flex-nowrap pb-4 pt-2">
                                    {Array.isArray(investors) && investors.length > 0 ? investors.map(inv => (
                                        <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3 d-flex align-items-stretch" key={inv.id || inv._id} style={{ minWidth: '260px', marginRight: '0.75rem' }}>
                                            <div className="combined-search-card h-100" style={{ width: '100%' }}>
                                                <div className="d-flex align-items-left justify-content-left my-3">
                                                    {inv.logo && (<img src={inv.logo} alt={inv.name + " logo"} className="img-fluid" style={{ maxHeight: "40px", maxWidth: "60px", objectFit: "contain", marginRight: "10px" }} />)}
                                                    <h5 className="card-title mb-0">{inv.name}</h5>
                                                </div>
                                                <p className="card-text"><b>Country: </b>{inv.country}</p>
                                                <p className="card-text"><b>Investment Size: </b>{inv.investmentSize}</p>
                                                <p className="card-text"><b>Strategy: </b>{inv.strategy}</p>
                                                <div className="d-flex" style={{ gap: '6px' }}>
                                                    <button className="btn btn-primary btn-sm" onClick={() => setSelectedInvestor(inv)}>Quick View</button>
                                                    <button className="btn btn-outline-secondary btn-sm">Save</button>
                                                </div>
                                            </div>
                                        </div>
                                    )) : <div className="col-12 combined-search-empty">No investors found</div>}
                                </div>
                                <button className="combined-search-scroll-btn" onClick={() => scroll(investorRef, 370)} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>›</button>
                            </div>
                        </div>

                        {/* Right drawer for quick view */}
                        {selectedInvestor && (
                            <div style={{ position: 'fixed', right: 20, top: 80, width: 380, maxWidth: 'calc(100% - 40px)', zIndex: 9999 }}>
                                <div className="combined-search-drawer">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h5 className="card-title">{selectedInvestor.name}</h5>
                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedInvestor(null)}>Close</button>
                                    </div>
                                    <div className="card-body" style={{ padding: 0 }}>
                                        {selectedInvestor.logo && (<img src={selectedInvestor.logo} alt={selectedInvestor.name} style={{ maxHeight: 60, maxWidth: 80, marginBottom: 8 }} />)}
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
    );
}
