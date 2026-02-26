import axios from 'axios';

const API_URL = 'http://localhost:5000/api/exams';


const getExams = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(API_URL, config);
    return response.data.data;
};


const createExam = async (examData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL, examData, config);
    return response.data.data;
};


const getExam = async (id, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/${id}`, config);
    return response.data.data;
};


const deleteExam = async (id, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
};

const updateExam = async (id, examData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(`${API_URL}/${id}`, examData, config);
    return response.data.data;
};

const examService = {
    getExams,
    createExam,
    getExam,
    deleteExam,
    updateExam,
};

export default examService;

