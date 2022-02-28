import http from './axios';

const getAll = () => {
    return http.get("/statuses");
};

export default {
    getAll
};