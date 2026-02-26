import axios from 'axios';

const API_URL = 'http://localhost:5000/api/submissions';

const submitExam = async (submissionData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL, submissionData, config);
    return response.data.data;
};

const getMySubmissions = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/my`, config);
    return response.data.data;
};

const getExamSubmissions = async (examId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}/exam/${examId}`, config);
    return response.data.data;
};

const submissionService = {
    submitExam,
    getMySubmissions,
    getExamSubmissions,
};

export default submissionService;

