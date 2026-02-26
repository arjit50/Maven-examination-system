import axios from 'axios';

const API_URL = 'http://localhost:5000/api/materials';

const getMaterials = async (token) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.get(API_URL, config);
    return response.data.data;
};

const createMaterial = async (materialData, token) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.post(API_URL, materialData, config);
    return response.data.data;
};

const deleteMaterial = async (id, token) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
};

const uploadFile = async (file, token) => {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        },
    };
    const response = await axios.post(`${API_URL}/upload`, formData, config);
    return response.data.data;
};

const materialService = {
    getMaterials,
    createMaterial,
    deleteMaterial,
    uploadFile,
};

export default materialService;

