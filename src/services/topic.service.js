import http from './axios';

const create = data => {
    return http.post("/topics", data);
};

const getAll = (tab) => {
    return http.get(`/topics?tab=${tab}`);
};
const getOne = (id) => {
    return http.get(`/topics/${id}`);
};

const update = (data) => {
    return http.put("/topics", data);
};

export default {
    create,
    getAll,
    update,
    getOne
};