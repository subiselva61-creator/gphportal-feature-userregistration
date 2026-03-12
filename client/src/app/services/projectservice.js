import axios from "axios";
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

const API_URL = "http://localhost:5000/api/projects";

const getProjects = () => {
    return axios.get(API_URL);
};

const searchProjects = (key) => {
    return axios.get(API_URL + `?search=${key}`);
};

export const searchProjectsById = createAsyncThunk('api/fetchData', async (key) => {
    const queryString = `ids=${encodeURIComponent(JSON.stringify(key))}`;
    const result = await axios.get(API_URL + `/byIds?${queryString}`);
    return result.data;
});

export const getProjectsFilter = createAsyncThunk('api/fetchProjectFilter', async () => {
    const result = await axios.get(API_URL + `/Filters`);
    return result.data;
});


const ProjectService = { getProjects, searchProjects, searchProjectsById, getProjectsFilter };

export default ProjectService;