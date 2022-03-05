import http from './axios';

import { getToken } from './token.service';

let headers = {
    'Content-Type': 'application/json',
    'authorization': `Bearer ${getToken()}`
}

const create = data => {
    return http.post("/topics", data, { headers });
};

const getAll = (tab) => {
    return http.get(`/topics?tab=${tab}`, { headers });
};
const getOne = (id) => {
    return http.get(`/topics/${id}`, { headers });
};

const update = (data) => {
    headers.type = data.type;
    return http.put("/topics", data.data, { headers });
};

export default {
    create,
    getAll,
    update,
    getOne
};