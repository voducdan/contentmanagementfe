import './App.css';

import Home from './components/Home/home';
import Metadata from './components/Metadata/metadata';
import Login from './components/Auth/login';

import { Routes, Route } from "react-router-dom";

import { Layout } from 'antd';

function App() {
    return (
        <div className="App">
            <Layout className='app-layout'>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/metadata/:id" element={<Metadata />} />
                </Routes>
            </Layout>
        </div>
    );
}

export default App;
