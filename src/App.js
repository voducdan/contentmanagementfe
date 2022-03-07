import './App.css';

import Home from './components/Home/home';
import Metadata from './components/Metadata/metadata';
import Login from './components/Auth/login';

import { Routes, Route } from "react-router-dom";

import TokenService from './services/token.service';

import { Layout, Button } from 'antd';
const { Header, Content } = Layout;

function App() {
    const handleLogout = () => {
        TokenService.removeToken();
        window.location.reload();
    }

    return (
        <div className="App">
            <Layout className='app-layout'>
                <Header
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <a href='/'>
                        <img src='/logo.png' />
                    </a>
                    <Button
                        type="primary"
                        onClick={handleLogout}>
                        Đăng xuất
                    </Button>
                </Header>
                <Content>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/metadata/:id" element={<Metadata />} />
                    </Routes>
                </Content>
            </Layout>
        </div>
    );
}

export default App;
