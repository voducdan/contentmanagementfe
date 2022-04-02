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
                    // rules={[{ required: true, message: 'Vui lòng điền tên gốc' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Tên tiếng việt"
                    name="vi_name"
                    rules={[{ required: true, message: 'Vui lòng điền tên tiếng việt' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Tít phụ"
                    name="short_description"
                >
                    <Input.TextArea />
                </Form.Item>
                <Form.Item
                    label="Tác giả"
                    name="author"
                    // rules={[{ required: true, message: 'Vui lòng điền tác giả' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Đơn vị uỷ thác bản quyền"
                    name="copyright_trustee"
                    // rules={[{ required: true, message: 'Vui lòng điền đơn vị uỷ thác bản quyền' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Agency"
                    name="agency"
                    // rules={[{ required: true, message: 'Vui lòng điền Agency' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Từ khoá gợi nhớ"
                    name="keywords"
                    // rules={[{ required: true, message: 'Vui lòng điền từ khoá gợi nhớ' }]}
                >
                    <Input placeholder="Mỗi từ khoá cách nhau bằng dấu ','" />
                </Form.Item>
                <Form.Item
                    label="Cần đối tác dịch"
                    name="translation"
                    // rules={[{ required: true, message: 'Vui lòng chọn bản dịch' }]}
                >
                    <Select
                        allowClear
                    >
                        <Option value={true}>Có</Option>
                        <Option value={false}>Không</Option>
                    </Select>
                </Form.Item>
                <Button
                    style={{
                        marginRight: '10px'
                    }}
                    key="back"
                    onClick={handleCancel}
                >
                    Thoát
                </Button>
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