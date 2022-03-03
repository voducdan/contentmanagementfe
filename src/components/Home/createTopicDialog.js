import TopicService from '../../services/topic.service';
import './home.style.css';

import {
    Modal,
    Form,
    Input,
    Select,
    Button
} from "antd";

const { Option } = Select;

export default function CreateTopic(props) {
    const { isModalVisible, setIsModalVisible, appendTopic } = props;
    const [form] = Form.useForm();

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const onFinish = (values) => {
        values['tab'] = 1;
        values['status_id'] = 1;
        TopicService.create(values)
            .then(res => {
                const data = res.data;
                appendTopic(data.data);
                handleOk();
                form.resetFields();
            })
            .catch(e => { console.log(e) })

    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <Modal
            title="Tạo đề tài mới"
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={null}
        >
            <Form
                name="createTopic"
                form={form}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Form.Item
                    label="Tên gốc"
                    name="original_name"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Tên tiếng việt"
                    name="vi_name"
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Tít phụ"
                    name="short_description"
                    rules={[{ required: true, message: 'Vui lòng điền tích phụ' }]}
                >
                    <Input.TextArea />
                </Form.Item>
                <Form.Item
                    label="Tác giả"
                    name="author"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Đơn vị uỷ thác bản quyền"
                    name="copyright_trustee"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Từ khoá gợi nhớ"
                    name="keywords"
                >
                    <Input placeholder="Mỗi từ khoá cách nhau bằng dấu ','" />
                </Form.Item>
                <Form.Item
                    label="Bản dịch"
                    name="translation"
                >
                    <Select
                        allowClear
                    >
                        <Option value={true}>Có</Option>
                        <Option value={false}>Không</Option>
                    </Select>
                </Form.Item>
                <Button key="back" onClick={handleCancel}>
                    Thoát
                </Button>,
                <Button
                    key="submit"
                    htmlType="submit"
                    type="primary"
                >
                    Lưu
                </Button>
            </Form>
        </Modal>
    )
}