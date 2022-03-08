import { useState } from 'react';

import { Form, Input, Button, Modal } from 'antd';

import Auth from '../../services/auth.service';
import Token from '../../services/token.service';

export default function Login() {
    const [openLoginModal, setOpenLoginModal] = useState(false);
    const [loginErr, setLoginErr] = useState(null);

    const onFinish = async (values) => {
        try {
            const res = await Auth.login(values);
            const data = await res.data;
            const token = data.token;
            Token.setToken(token);
            window.location.href = '/';
        }
        catch (err) {
            setOpenLoginModal(true);
            setLoginErr(err.response.data.message);
        }
    };

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Modal
                title={null}
                visible={openLoginModal}
                onOk={() => { setOpenLoginModal(false); setLoginErr(null) }}
                footer={[
                    <Button key="submit" type="primary" onClick={() => { setOpenLoginModal(false); setLoginErr(null) }}>
                        Đóng
                    </Button>,
                ]}
            >
                <h3
                    style={{
                        color: 'red'
                    }}
                >
                    {loginErr}
                </h3>
            </Modal>
            <Form
                style={{
                    marginTop: '100px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    flexDirection: 'column',
                    width: '40%',
                    height: '100%'
                }}
                name="basic"
                onFinish={onFinish}
                autoComplete="off"
            >
                <h1
                    style={{
                        textAlign: 'left',
                        width: '40%',
                        color: 'white'
                    }}
                >Đăng nhập</h1>

                <Form.Item
                    style={{
                        width: '100%',
                    }}
                    name="email"
                    rules={[{ required: true, message: 'Vui lòng nhập email !' }]}
                >
                    <Input placeholder='Email' />
                </Form.Item>

                <Form.Item
                    style={{
                        width: '100%',
                    }}
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập password!' }]}
                >
                    <Input.Password placeholder='Password' />
                </Form.Item>

                <Form.Item
                    style={{
                        width: '100%',
                    }}
                    wrapperCol={{ offset: 8, span: 16 }}
                >
                    <Button type="primary" htmlType="submit">
                        Đăng nhập
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}