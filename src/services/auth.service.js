import http from './axios';

const login = (data) => {
    return http.post('/auth/login', data);
};

const register = (data) => {
    return http.post('/auth/register', data);
}

export default {
    login,
    register
};