import http from './axios';

const getAll = (tab) => {
    return http.get(`/statuses?tab=${tab}`);
};

export default {
    getAll
};