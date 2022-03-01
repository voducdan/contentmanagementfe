import http from './axios';

const create = data => {
    return http.post("/topics", data);
};

const getAll = () => {
    return http.get("/topics");
};

const update = (data) => {
    return http.put("/topics", data);
};

export default {
    create,
    getAll,
    update
};