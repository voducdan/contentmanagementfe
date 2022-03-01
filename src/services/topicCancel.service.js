import http from './axios';

const create = data => {
    return http.post("/topic-cancel", data);
};

export default {
    create
}