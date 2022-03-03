import { useState, useEffect } from "react";

import { useParams } from "react-router-dom";

import TopicService from '../../services/topic.service';
import CategoryService from '../../services/category.service';

import {
    Form,
    Input,
    Select,
    Button,
    Row,
    Col,
    Upload
} from "antd";
import { UploadOutlined } from '@ant-design/icons';
const { Option } = Select;


export default function Metadata() {
    const [topic, setTopic] = useState(null);
    const [topicCancel, setTopicCancel] = useState(null);
    const [categoriesLevel1, setCategoriesLevel1] = useState([]);
    const [categoriesLevel2, setCategoriesLevel2] = useState([]);
    const [currentCategoryLevel1, setCurrentCategoryLevel1] = useState(null);
    const [currentCategoryLevel2, setCurrentCategoryLevel2] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        async function fetchTopic(id) {
            const res = await TopicService.getOne(id);
            const data = await res.data.data;
            if ([10, 11].includes(data.status_id)) {
                const topicCancelData = await res.data.topicCancel;
                setTopicCancel(topicCancelData);
            }
            setTopic(data);
        }
        if (id) {
            fetchTopic(id);
        }
    }, [id]);

    useEffect(() => {
        const getCategories = async (parentId = null) => {
            const res = await CategoryService.getAll(parentId);
            const categories = await res.data.data;
            if (parentId) {
                setCategoriesLevel2(categories);
            }
            else {
                setCategoriesLevel1(categories);
            }
        }
        if (topic && topic.tab >= 2) {
            getCategories();
            getCategories(topic.category_level_1);
        }
    }, [topic]);

    useEffect(() => {
        if (categoriesLevel1.length > 0) {
            const categorylevel1Name = categoriesLevel1[categoriesLevel1.findIndex(i => Number(i.id) === topic.category_level_1)]['name'];
            setCurrentCategoryLevel1(categorylevel1Name);
        }
    }, [categoriesLevel1]);

    useEffect(() => {
        if (categoriesLevel2.length > 0) {
            const categorylevel2Name = categoriesLevel2[categoriesLevel2.findIndex(i => Number(i.id) === topic.category_level_2)]['name'];
            setCurrentCategoryLevel2(categorylevel2Name);
        }
    }, [categoriesLevel2]);

    const onFinish = () => {

    }

    const coverImgProps = {
        name: 'coverImg'
    }

    return (
        topic ? (
            <div
                style={{
                    marginTop: '30px',
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <Form
                    name="topicMeta"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onFinish}
                    autoComplete="off"
                    initialValues={{
                        original_name: topic.original_name,
                        vi_name: topic.vi_name,
                        short_description: topic.short_description,
                        author: topic.author,
                        copyright_trustee: topic.copyright_trustee,
                        keywords: topic.keywords,
                        status: topic.status.name,
                        category_level_1: topic.category_level_1,
                        category_level_2: topic.category_level_2,
                        description: topic.description,
                        type_of_sale: topic.type_of_sale,
                        contracted_at: topic.contracted_at,
                        contract_term: topic.contract_term,
                        cover_price: topic.cover_price,
                        royalty: topic.royalty,
                        copyright_price: topic.copyright_price,
                        translation_cost: topic.translation_cost,
                        produce_cost: topic.produce_cost,
                        buy_permission: topic.buy_permission,
                        partner_note: topic.partner_note,
                        voice_note: topic.voice_note,
                        contract_note: topic.contract_note,
                        translation: topic.translation ? 'Có' : 'Không',
                    }}
                >
                    <Row>
                        <Col span={topic.tab === 1 ? 24 : 8}>
                            <Form.Item colon={false} onChange={(e) => { console.log(e) }}
                                label="Tên gốc"
                                name="original_name"
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item colon={false}
                                label="Tên tiếng việt"
                                name="vi_name"
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item colon={false}
                                label="Tít phụ"
                                name="short_description"
                                rules={[{ required: true, message: 'Vui lòng điền tích phụ' }]}
                            >
                                <Input.TextArea />
                            </Form.Item>
                            <Form.Item colon={false}
                                label="Tác giả"
                                name="author"
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item colon={false}
                                label="Đơn vị uỷ thác bản quyền"
                                name="copyright_trustee"
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item colon={false}
                                label="Từ khoá gợi nhớ"
                                name="keywords"
                            >
                                <Input placeholder="Mỗi từ khoá cách nhau bằng dấu ','" />
                            </Form.Item>
                            <Form.Item colon={false}
                                label="Bản dịch"
                                name="translation"
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item colon={false}
                                label="Trạng thái"
                                name="status"
                            >
                                <Input disabled />
                            </Form.Item>
                            {
                                (topic.status.id === 10 || topic.status.id === 11) && (
                                    <Form.Item colon={false}
                                        label="Lý do kết thúc đề tài"
                                        name="reason_of_canceling"
                                    >
                                        <Input.TextArea defaultValue={topicCancel.reason} />
                                    </Form.Item>
                                )
                            }
                        </Col>
                        {
                            topic.tab >= 2 && (
                                <Col span={16}>
                                    <Row>
                                        <Col span={12}>
                                            <Form.Item colon={false}
                                                label="Category tầng 1"
                                                name="category_level_1"
                                            >
                                                <Select
                                                    onChange={(e) => { }}
                                                >
                                                    {
                                                        categoriesLevel1.map(i => (
                                                            <Option key={i.id} value={Number(i.id)}>{i.name}</Option>
                                                        ))
                                                    }
                                                </Select>
                                            </Form.Item>
                                            <Form.Item colon={false}
                                                label="Category tầng 2"
                                                name="category_level_2"
                                            >
                                                <Select
                                                    allowClear
                                                >
                                                    {
                                                        categoriesLevel2.map(i => (
                                                            <Option key={i.id} value={Number(i.id)}>{i.name}</Option>
                                                        ))
                                                    }
                                                </Select>
                                            </Form.Item>
                                            <Form.Item colon={false}
                                                label="Kinh doanh"
                                                name="type_of_sale"
                                            >
                                                <Select
                                                    allowClear
                                                >
                                                    <Option value='Vip'>Vip</Option>
                                                    <Option value='Free'>Free</Option>
                                                    <Option value='Coin'>Coin</Option>
                                                </Select>
                                            </Form.Item>
                                            <Form.Item colon={false}
                                                label="Giá bìa"
                                                name="cover_price"
                                            >
                                                <Input />
                                            </Form.Item>
                                            <Form.Item colon={false}
                                                label="Royalty%"
                                                name="royalty"
                                            >
                                                <Input />
                                            </Form.Item>
                                            <Form.Item colon={false}
                                                label="Phí sản xuất"
                                                name="produce_cost"
                                            >
                                                <Input />
                                            </Form.Item>
                                            <Form.Item colon={false}
                                                label="Mô tả playlist"
                                                name="description"
                                            >
                                                <Input.TextArea />
                                            </Form.Item>
                                            <Form.Item colon={false}
                                                label="Ghi chú về đối tác dịch"
                                                name="partner_note"
                                            >
                                                <Input.TextArea />
                                            </Form.Item>
                                            <Form.Item colon={false}
                                                label="Lưu ý giọng đọc"
                                                name="voice_note"
                                            >
                                                <Input.TextArea />
                                            </Form.Item>
                                            <Form.Item colon={false}
                                                label="Lưu ý khác trong HĐ"
                                                name="contract_note"
                                            >
                                                <Input.TextArea />
                                            </Form.Item>
                                            <Form.Item
                                                name="coverImg"
                                            >
                                                <Upload {...coverImgProps} beforeUpload={() => false} >
                                                    <Button icon={<UploadOutlined />}>Click để upload ảnh bìa</Button>
                                                </Upload>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item colon={false}
                                                label="Ngày ký HĐ"
                                                name="contracted_at"
                                            >
                                                <Input.TextArea />
                                            </Form.Item>
                                            <Form.Item colon={false}
                                                label="Thời hạn HĐ"
                                                name="contract_term"
                                            >
                                                <Input.TextArea />
                                            </Form.Item>
                                            <Form.Item colon={false}
                                                label="copyright_price BQ"
                                                name="keywords"
                                            >
                                                <Input.TextArea />
                                            </Form.Item>
                                            <Form.Item colon={false}
                                                label="Phí dịch"
                                                name="translation_cost"
                                            >
                                                <Input.TextArea />
                                            </Form.Item>
                                            <Form.Item colon={false}
                                                label="Mua quyền gì"
                                                name="buy_permission"
                                            >
                                                <Input.TextArea />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>
                            )
                        }
                    </Row>
                    <div
                        style={{
                            textAlign: 'center'
                        }}
                    >
                        <Button key="back" onClick={() => { }}>
                            Thoát
                        </Button>,
                        <Button
                            key="submit"
                            htmlType="submit"
                            type="primary"
                        >
                            Lưu
                        </Button>
                    </div>
                </Form>
            </div >
        ) : ''
    )
}