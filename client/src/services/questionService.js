import axios from 'axios';

const API_URL = 'http://localhost:5000/api/questions';

const addQuestion = async (questionData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL, questionData, config);
    return response.data.data;
};

const updateQuestion = async (id, questionData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(`${API_URL}/${id}`, questionData, config);
    return response.data.data;
};

const deleteQuestion = async (id, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data.data;
};

const questionService = {
    addQuestion,
    updateQuestion,
    deleteQuestion
};

export default questionService;

