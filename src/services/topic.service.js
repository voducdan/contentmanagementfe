import http from './axios';

const create = data => {
    return http.post("/topics", data);
};

const getAll = () => {
    return http.get("/topics");
};

export default {
    create,
    getAll
};