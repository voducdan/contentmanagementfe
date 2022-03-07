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
    return http.put("/topics", data.data, {
        headers: { type: data.type }
    });
};

const deleteTopic = (id) => {
    return http.delete(`/topics/${id}`);
};

const getMaxTab = (topicId) => {
    return http.get(`/topics/maxtab/${topicId}`);
};

export default {
    create,
    getAll,
    update,
    getOne,
    getMaxTab,
    deleteTopic
};