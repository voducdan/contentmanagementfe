import http from './axios';

const getAll = (parentId = null) => {
    const url = parentId ? `/categories?parent=${parentId}` : '/categories'
    return http.get(url);
};

export default {
    getAll
};