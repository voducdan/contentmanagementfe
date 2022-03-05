const getToken = function () {
    const token = localStorage.getItem('token');
    return token;
}

const removeToken = function () {
    localStorage.removeItem('token');
}

const setToken = function (token, role) {
    localStorage.setItem('token', token)
}


module.exports = {
    getToken,
    removeToken,
    setToken
}