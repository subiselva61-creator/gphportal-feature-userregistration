import { createSlice } from '@reduxjs/toolkit';
import { searchProjectsById, getProjectsFilter } from './projectservice';
import { searchInvestorByGeography } from './investorservice';

const initialState = {
    loading: false, error: null, Projects: [],
    ProjectsFilter: { region: [], status: [], year: [], bankable: [] },
    Investors: []
};
const apiSlice = createSlice({
    name: 'api',
    initialState,
    reducers: {
        setFilteredProjects: (state, action) => {
            // payload should be an object with properties to merge into state
            return { ...state, ...action.payload };
        },
        setFilteredtInvestor: (state, action) => {
            return { ...state, ...action.payload };
        },
        getFilteredInvestor: (state, action) => {
            return { ...state, ...action.payload };
        },
        getFilteredProjects: (state, action) => {
            return { ...state, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchProjectsById.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.Projects = action.payload;
            })
            .addCase(searchProjectsById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error ? action.error.message : 'Error fetching projects by id';
            })
            .addCase(getProjectsFilter.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                // ensure shape: { region:[], status:[], year:[], bankable:[] }
                state.ProjectsFilter = action.payload || { region: [], status: [], year: [], bankable: [] };
            })
            .addCase(getProjectsFilter.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error ? action.error.message : 'Error fetching project filters';
            })
            .addCase(searchInvestorByGeography.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.Investors = action.payload;
            })
            .addCase(searchInvestorByGeography.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error ? action.error.message : 'Error fetching investors by geography';
            });
    },
});

const { reducer, actions } = apiSlice;

export const { setFilteredProjects, getFilteredProjects, getFilteredInvestor, setFilteredtInvestor } = actions
export default reducer;