import { useState, useEffect } from "react";

import { useParams } from "react-router-dom";

import TopicService from '../../services/topic.service';
import CategoryService from '../../services/category.service';
import TokenService from '../../services/token.service';

import {
    Form,
    Input,
    Select,
    Button,
    Row,
    Col,
    Upload,
    Modal
} from "antd";
import { UploadOutlined } from '@ant-design/icons';
const { Option } = Select;


export default function Metadata() {
    const [topic, setTopic] = useState(null);
    const [topicCancel, setTopicCancel] = useState(null);
    const [categoriesLevel1, setCategoriesLevel1] = useState([]);
    const [categoriesLevel2, setCategoriesLevel2] = useState([]);
    const [openUpdateTopicMetaModal, setOpenUpdateTopicMetaModal] = useState(false);
    const [updateTopicMetaErr, setUpdateTopicMetaErr] = useState(false);
    const [deleteTopicErr, setDeleteTopicErr] = useState(false);
    const { id } = useParams();

    const [topicMetaForm] = Form.useForm();

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
        if (!TokenService.getToken()) {
            window.location.href = '/login'
        }
        if (id) {
            fetchTopic(id);
        }
    }, [id]);

    useEffect(() => {
        if (topic && topic.tab >= 2) {
            getCategories();
            getCategories(topic.category_level_1);
        }
    }, [topic]);

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

    const handleSelectCategoryLevel1 = async (e) => {
        getCategories(e);
        topicMetaForm.setFieldsValue({
            category_level_2: null
        })
    }

    const handleDeleteTopic = async () => {
        try {
            const res = await TopicService.deleteTopic(id);
            window.location.href = '/'
        }
        catch (err) {
            setDeleteTopicErr(true);
        }
    }

    const onFinish = async (values) => {
        try {
            const formData = new FormData();
            if (values.coverImg) {
                formData.append("coverImg", values.coverImg.file);
            }
            formData.append("id", topic['id']);
            formData.append("translation", values['translation']);
            formData.append("author", values.author);
            formData.append("buy_permission", values.buy_permission);
            formData.append("category_level_1", values.category_level_1);
            formData.append("category_level_2", values.category_level_2);
            formData.append("contract_note", values.contract_note);
            formData.append("contract_term", values.contract_term);
            formData.append("contracted_at", values.contracted_at);
            formData.append("copyright_trustee", values.copyright_trustee);
            formData.append("cover_price", values.cover_price);
            formData.append("description", values.description);
            formData.append("keywords", values.keywords);
            formData.append("original_name", values.original_name);
            formData.append("partner_note", values.partner_note);
            formData.append("produce_cost", values.produce_cost);
            formData.append("royalty", values.royalty);
            formData.append("short_description", values.short_description);
            formData.append("status", values.status);
            formData.append("translation_cost", values.translation_cost);
            formData.append("type_of_sale", values.type_of_sale);
            formData.append("vi_name", values.vi_name);
            formData.append("voice_note", values.voice_note);
            formData.append("release_date", values.release_date);
            formData.append("post_production_cost", values.post_production_cost);
            formData.append("control_cost", values.control_cost);
            formData.append("agency", values.agency);
            formData.append("copyright_price", values.copyright_price);
            formData.append("updated_at", new Date().toISOString());
            const res = await TopicService.update({ data: formData, type: 'metadata' });
            const data = await res.data.data;
            setTopic(data);
            setOpenUpdateTopicMetaModal(true);
        }
        catch (err) {
            setOpenUpdateTopicMetaModal(true);
            setUpdateTopicMetaErr(true);
        }
    }

    const coverImgProps = {
        name: 'coverImg'
    }

    return (
        topic ? (
            <div>
                <div
                    style={{
                        margin: '30px 10%',
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}
                >
                    <Button
                        type="danger"
                        onClick={handleDeleteTopic}>
                        Xo?? ????? t??i
                    </Button>
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    <Form
                        name="topicMeta"
                        form={topicMetaForm}
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
                            category_level_2: topic.category_level_2 ? topic.category_level_2.split(',').map(Number) : topic.category_level_2,
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
                            translation: topic.translation,
                            agency: topic.agency,
                            control_cost: topic.control_cost,
                            post_production_cost: topic.post_production_cost,
                            release_date: topic.release_date
                        }}
                    >
                        <Row>
                            <Col span={topic.tab === 1 ? 24 : 8}>
                                <Form.Item colon={false} onChange={(e) => { console.log(e) }}
                                    label="T??n g???c"
                                    name="original_name"
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item colon={false}
                                    label="T??n ti???ng vi???t"
                                    name="vi_name"
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item colon={false}
                                    label="T??t ph???"
                                    name="short_description"
                                >
                                    <Input.TextArea />
                                </Form.Item>
                                <Form.Item colon={false}
                                    label="T??c gi???"
                                    name="author"
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item colon={false}
                                    label="????n v??? u??? th??c b???n quy???n"
                                    name="copyright_trustee"
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item colon={false}
                                    label="Agency"
                                    name="agency"
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item colon={false}
                                    label="T??? kho?? g???i nh???"
                                    name="keywords"
                                >
                                    <Input placeholder="M???i t??? kho?? c??ch nhau b???ng d???u ','" />
                                </Form.Item>
                                <Form.Item colon={false}
                                    label="C???n ?????i t??c d???ch"
                                    name="translation"
                                >
                                    <Select
                                        allowClear
                                    >
                                        <Option value={true}>C??</Option>
                                        <Option value={false}>Kh??ng</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item colon={false}
                                    label="Tr???ng th??i"
                                    name="status"
                                >
                                    <Input disabled />
                                </Form.Item>
                                {
                                    (topic.status_id === 10 || topic.status_id === 11) && (
                                        <Form.Item colon={false}
                                            label="L?? do k???t th??c ????? t??i"
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
                                                    label="Category t???ng 1"
                                                    name="category_level_1"
                                                >
                                                    <Select
                                                        onChange={handleSelectCategoryLevel1}
                                                    >
                                                        {
                                                            categoriesLevel1.map(i => (
                                                                <Option key={i.id} value={Number(i.id)}>{i.name}</Option>
                                                            ))
                                                        }
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item colon={false}
                                                    label="Category t???ng 2"
                                                    name="category_level_2"
                                                >
                                                    <Select
                                                        allowClear
                                                        mode="multiple"
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
                                                    label="Gi?? b??a"
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
                                                    label="Ph?? s???n xu???t"
                                                    name="produce_cost"
                                                >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item colon={false}
                                                    label="M?? t??? playlist"
                                                    name="description"
                                                >
                                                    <Input.TextArea />
                                                </Form.Item>
                                                <Form.Item colon={false}
                                                    label="Ghi ch?? v??? ?????i t??c d???ch"
                                                    name="partner_note"
                                                >
                                                    <Input.TextArea />
                                                </Form.Item>
                                                <Form.Item colon={false}
                                                    label="L??u ?? gi???ng ?????c"
                                                    name="voice_note"
                                                >
                                                    <Input.TextArea />
                                                </Form.Item>
                                                <Form.Item colon={false}
                                                    label="L??u ?? kh??c"
                                                    name="contract_note"
                                                >
                                                    <Input.TextArea />
                                                </Form.Item>
                                                <Form.Item
                                                    name="coverImg"
                                                >
                                                    <Upload {...coverImgProps} beforeUpload={() => false} >
                                                        <Button icon={<UploadOutlined />}>Click ????? upload ???nh b??a</Button>
                                                    </Upload>
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item colon={false}
                                                    label="Ng??y k?? H??"
                                                    name="contracted_at"
                                                >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item colon={false}
                                                    label="Th???i h???n H??"
                                                    name="contract_term"
                                                >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item colon={false}
                                                    label="Ph?? BQ"
                                                    name="copyright_price"
                                                >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item colon={false}
                                                    label="Ph?? d???ch"
                                                    name="translation_cost"
                                                >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item colon={false}
                                                    label="Ph?? d?? so??t"
                                                    name="control_cost"
                                                >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item colon={false}
                                                    label="Ph?? h???u k???"
                                                    name="post_production_cost"
                                                >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item colon={false}
                                                    label="Mua quy???n g??"
                                                    name="buy_permission"
                                                >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item colon={false}
                                                    label="Th???i h???n ph??t h??nh"
                                                    name="release_date"
                                                >
                                                    <Input />
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
                            <Button
                                key="submit"
                                htmlType="submit"
                                type="primary"
                            >
                                L??u
                            </Button>
                        </div>
                    </Form>
                    <Modal
                        title={null}
                        visible={openUpdateTopicMetaModal}
                        footer={[
                            <Button key="submit" type="primary" onClick={() => { setOpenUpdateTopicMetaModal(false); setUpdateTopicMetaErr(false) }}>
                                ????ng
                            </Button>,
                        ]}
                    >
                        {updateTopicMetaErr ? "C???p nh???t ????? t??i kh??ng th??nh c??ng, vui l??ng th??? l???i sau!" : "C???p nh???t ????? t??i th??nh c??ng!"}
                    </Modal>
                    <Modal
                        title={null}
                        visible={deleteTopicErr}
                        footer={[
                            <Button key="submit" type="primary" onClick={() => { setDeleteTopicErr(false) }}>
                                ????ng
                            </Button>,
                        ]}
                    >
                        {"Xo?? ????? t??i kh??ng th??nh c??ng, vui l??ng th??? l???i sau!"}
                    </Modal>
                </div >
            </div>
        ) : ''
    )
}