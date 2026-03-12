import axios from "axios";
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = "http://localhost:5000/api/investors";

const getInvestors = () => {
    return axios.get(API_URL);
};

const searchInvestors = (key) => {
    return axios.get(API_URL + `?search=${key}`);
};

export const getProjectsFilter = createAsyncThunk('api/fetchProjectFilter', async () => {
    const result = await axios.get(API_URL + `/Filters`);
    return result.data;
});

export const searchInvestorByGeography = createAsyncThunk('api/searchInvestorByGeography', async (geogrphy) => {
    const queryString = `geography=${encodeURIComponent(geogrphy)}`;
    const result = await axios.get(API_URL + `/searchInvestorByGeography?${queryString}`);
    return result.data;
});

const InvestorsService = { getInvestors, searchInvestors, searchInvestorByGeography };

export default InvestorsService;