import axios from "axios";

export default axios.create({
    baseURL: `${process.env.REACT_APP_API_PROTOCAL}://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api`,
    headers: {
        "Content-type": "application/json"
    }
});