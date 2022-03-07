import axios from "axios";

import { getToken } from './token.service';

export default axios.create({
    baseURL: `${process.env.REACT_APP_API_BASE_URL}/api`,
    headers: {
        "Content-type": "application/json",
        "authorization": `Bearer ${getToken()}`
    }
});