import { useState, useEffect } from 'react';

import { format } from 'date-fns';
import differenceInDays from 'date-fns/differenceInDays';
import add from 'date-fns/add';

import TopicService from '../../services/topic.service';
import StatusService from '../../services/status.service';
import TopicCancelService from '../../services/topicCancel.service';
import CategoryService from '../../services/category.service';

import CreateTopic from './createTopicDialog';

import {
    Table,
    Button,
    Select,
    Modal,
    Form,
    Input,
    Upload
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Option } = Select;

const CopyrightTab = () => {
    const [topics, setTopic] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [openReasonModal, setOpenReasonModal] = useState(false);
    const [openTopicDetailModal, setOpenTopicDetailModal] = useState(false);
    const [currentTopic, setCurrentTopic] = useState(null);
    const [currentStatus, setCurrentStatus] = useState(null);
    const [categoriesLevel1, setCategoriesLevel1] = useState([]);
    const [categoriesLevel2, setCategoriesLevel2] = useState([]);
    const [updateTopicDetailForm] = Form.useForm();

    useEffect(() => {
        const fetchTopics = async () => {
            const res = await TopicService.getAll(1);
            const data = await res.data.data;
            const dataWithKey = data.map(i => {
                i.key = i.id;
                return i;
            });
            setTopic(dataWithKey);
        };
        const fetchStatuses = async () => {
            const res = await StatusService.getAll(1);
            const data = await res.data.data;
            setStatuses(data);
        };

        fetchStatuses();
        fetchTopics();
    }, []);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const updateTopic = async (body) => {
        const res = await TopicService.update(body);
        const updatedTopic = await res.data.data;
        const copyData = [...topics];
        const updatedTopicIdx = copyData.findIndex(i => i.id === updatedTopic.id);
        updatedTopic['key'] = updatedTopic['id'];
        copyData[updatedTopicIdx] = updatedTopic;
        setTopic(copyData);
    }

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

    const handleSelectCategoryLevel1 = (value) => {
        getCategories(value);
    }

    function handleMenuClick(e, id) {
        const status = Number(e);
        const topicUpdatedData = {
            id,
            last_modified_status: new Date().toISOString()
        };
        setCurrentTopic(id);
        setCurrentStatus(status);
        if ([10, 11].includes(status)) {
            // handle pop up to fill reason of canceling
            setOpenReasonModal(true);
        }
        else if (status === 12) {
            // handle pop up to fill topic detail
            getCategories();
            setOpenTopicDetailModal(true);
        }
        else {
            // update topic status
            topicUpdatedData['status_id'] = status;
            updateTopic(topicUpdatedData);
        }
    }

    const appendTopic = (topic) => {
        topic['key'] = topic.id;
        const copyData = [...topics];
        copyData.push(topic);
        setTopic(copyData);
    }
    const handleCancelTopicFail = () => {
        setOpenReasonModal(false);
    }

    const StatusMenu = ({ translation, id, status }) => {
        const filteredStatuses = translation === true ? statuses : statuses.filter(i => !(i.id === 8 || i.id === 9));
        return (
            <Select defaultValue={status} onChange={(e) => { handleMenuClick(e, id) }}>
                {
                    filteredStatuses.map(i => (
                        <Option key={i.id} value={i.id}>{i.name}</Option>
                    ))
                }
            </Select>
        )
    };


    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const onFinish = async (values) => {
        const body = values;
        body['id_topic'] = currentTopic;
        const topicUpdatedData = {
            id: currentTopic,
            status_id: currentStatus,
            last_modified_status: new Date(),
            completed_at: new Date()
        };
        await TopicCancelService.create(body);
        updateTopic(topicUpdatedData);
        setOpenReasonModal(false);
    };

    const handleCancel = () => {
        setOpenReasonModal(false);
    };

    const handleEnterTopicDetailFail = () => {
        setOpenTopicDetailModal(false);
    };

    const onFinishEnterTopicDetail = async (values) => {
        try {
            const formData = new FormData();
            formData.append("coverImg", values.coverImg.file);
            formData.append("id", currentTopic);
            formData.append("status_id", currentStatus);
            formData.append("category_level_1", values.categoryLevel1);
            formData.append("category_level_2", values.categoryLevel2);
            formData.append("description", values.description);
            formData.append("type_of_sale", values.typeOfSale);
            formData.append("contracted_at", values.contractedAt);
            formData.append("contract_term", values.contractTerm);
            formData.append("cover_price", values.coverPrice);
            formData.append("royalty", values.royalty);
            formData.append("copyright_price", values.copyrightPrice);
            formData.append("translation_cost", values.translationCost);
            formData.append("buy_permission", values.buyPermission);
            formData.append("partner_note", values.partnerNote);
            formData.append("voice_note", values.voiceNote);
            formData.append("contract_note", values.contractNote);
            formData.append("last_modified_status", new Date().toISOString());
            formData.append("completed_at", new Date().toISOString());
            const res = await TopicService.update(formData);
            const returnedTopic = await res.data.data;
            const topicTab2 = { ...returnedTopic };
            delete topicTab2['id'];
            delete topicTab2['status'];
            topicTab2['tab'] = 2;
            topicTab2['status_id'] = currentStatus + 1;
            topicTab2['created_on_produce_tab'] = new Date().toISOString();
            await TopicService.create(topicTab2);
            const copyData = [...topics];
            const updatedTopicIdx = copyData.findIndex(i => i.id === returnedTopic.id);
            copyData[updatedTopicIdx]['status'] = returnedTopic['status'];
            copyData[updatedTopicIdx]['completed_at'] = returnedTopic['completed_at'];
            setTopic(copyData);
            setOpenTopicDetailModal(false);
            updateTopicDetailForm.resetFields();
        }
        catch (err) {
            console.log(err)
        }

    };

    const onFinishEnterTopicDetailFailed = async (values) => {

    };

    const columns = [
        {
            title: 'Tên đề tài',
            key: 'original_name',
            dataIndex: 'original_name',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: ['status', 'translation'],
            render: (_, data) => {
                return (
                    <>
                        <StatusMenu style={{ width: 'max-content' }} status={data.status.id} translation={data.translation} id={data.id} />
                    </>
                )
            }
        },
        {
            title: 'Ngày tạo',
            key: 'created_at',
            dataIndex: 'created_at',
            render: created_at => (
                <>
                    {format(new Date(created_at), 'MM/dd/yyyy')}
                </>
            )
        },
        {
            title: 'Ngày cập nhật trạng thái gần nhất',
            key: 'last_modified_status',
            dataIndex: 'last_modified_status',
            render: last_modified_status => (
                <>
                    {format(new Date(last_modified_status), 'MM/dd/yyyy')}
                </>
            )
        },
        {
            title: 'Số ngày kể từ ngày tạo',
            key: 'created_at',
            dataIndex: 'created_at',
            render: created_at => (
                <>
                    {differenceInDays(new Date(), new Date(created_at))}
                </>
            )
        },
        {
            title: 'Số ngày kể từ ngày cập nhật gần nhất',
            key: 'last_modified_status',
            dataIndex: 'last_modified_status',
            render: last_modified_status => (
                <>
                    {differenceInDays(new Date(), new Date(last_modified_status))}
                </>
            )
        },
        {
            title: 'Ngày hoàn tất',
            key: 'completed_at',
            dataIndex: 'completed_at',
            render: completed_at => (
                <>
                    {completed_at === null ? '' : format(new Date(completed_at), 'MM/dd/yyyy')}
                </>
            )
        },
    ];

    const coverImgProps = {
        name: 'coverImg'
    }

    return (
        <div>
            <Modal
                title="Lý do kết thúc đề tài"
                visible={openReasonModal}
                onCancel={handleCancelTopicFail}
                footer={null}
            >
                <Form
                    name="reasonOfCancelTopicForm"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        name="reason"
                        rules={[{ required: true, message: 'Vui lòng điền lý do kết thúc đề tài' }]}
                    >
                        <Input.TextArea />
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
            <Modal
                title=""
                visible={openTopicDetailModal}
                onCancel={handleEnterTopicDetailFail}
                footer={null}
            >
                <Form
                    form={updateTopicDetailForm}
                    name="reasonOfCancelTopicForm"
                    onFinish={onFinishEnterTopicDetail}
                    onFinishFailed={onFinishEnterTopicDetailFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Category tầng 1"
                        name="categoryLevel1"
                    >
                        <Select
                            allowClear
                            onChange={handleSelectCategoryLevel1}
                        >
                            {
                                categoriesLevel1.map(i => (
                                    <Option key={i.id} value={i.id}>{i.name}</Option>
                                ))
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Category tầng 2"
                        name="categoryLevel2"
                    >
                        <Select
                            allowClear
                        >
                            {
                                categoriesLevel2.map(i => (
                                    <Option key={i.id} value={i.id}>{i.name}</Option>
                                ))
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Mô tả playlisy"
                        name="description"
                    >
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item
                        label="Kinh doanh"
                        name="typeOfSale"
                    >
                        <Select
                            allowClear
                        >
                            <Option value='Vip'>Vip</Option>
                            <Option value='Free'>Free</Option>
                            <Option value='Coin'>Coin</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Ngày ký HĐ"
                        name="contractedAt"
                    >
                        <Input placeholder="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item
                        label="Thời hạn HĐ"
                        name="contractTerm"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Giá bìa"
                        name="coverPrice"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Royalty"
                        name="royalty"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Phí BQ"
                        name="copyrightPrice"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Phí dịch"
                        name="translationCost"
                        rules={[{ required: true, message: 'Vui lòng điền phí dịch' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Mua quyền gì"
                        name="buyPermission"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Ghi chú về đối tác dịch"
                        name="partnerNote"
                        rules={[{ required: true, message: 'Vui lòng điền ghi chú về đối tác dịch' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Lưu ý giọng đọc"
                        name="voiceNote"
                        rules={[{ required: true, message: 'Vui lòng điền lưu ý giọng đọc' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Lưu ý khác trong HĐ"
                        name="contractNote"
                        rules={[{ required: true, message: 'Vui lòng điền lưu ý khác trong HĐ' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="coverImg"
                    >
                        <Upload {...coverImgProps} beforeUpload={() => false} >
                            <Button icon={<UploadOutlined />}>Click để upload ảnh bìa</Button>
                        </Upload>
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
            <div className='create-topic-btn-container'>
                <Button
                    onClick={showModal}
                    type='primary'
                    shape='round'
                >
                    + Tạo đề tài mới
                </Button>
                <CreateTopic
                    isModalVisible={isModalVisible}
                    setIsModalVisible={setIsModalVisible}
                    appendTopic={appendTopic}
                />
                <Table columns={columns} dataSource={topics} />
            </div>
        </div>
    )
};

const ProductionTab = () => {
    const [topics, setTopic] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [prefill, setPrefill] = useState(0);
    const [currentTopic, setCurrentTopic] = useState(null);
    const [currentStatus, setCurrentStatus] = useState(null);
    const [onOpenExpectedDayModal, setOnOpenExpectedDayModal] = useState(false);
    const [onOpenProduceCost, setOnOpenProduceCost] = useState(false);

    const [numOfExpectedDayForm, procudeCostForm] = Form.useForm();

    useEffect(() => {
        const fetchTopics = async () => {
            const res = await TopicService.getAll(2);
            const data = await res.data.data;
            const dataWithKey = data.map(i => {
                i.key = i.id;
                return i;
            });
            setTopic(dataWithKey);
        };
        const fetchStatuses = async () => {
            const res = await StatusService.getAll(2);
            const data = await res.data.data;
            setStatuses(data);
        };

        fetchStatuses();
        fetchTopics();
    }, []);

    useEffect(() => {
        numOfExpectedDayForm.setFieldsValue({ expected_completetion_day: prefill })
    }, [numOfExpectedDayForm, prefill])

    const updateTopic = async (body) => {
        const res = await TopicService.update(body);
        const updatedTopic = await res.data.data;
        const copyData = [...topics];
        const updatedTopicIdx = copyData.findIndex(i => i.id === updatedTopic.id);
        updatedTopic['key'] = updatedTopic['id'];
        copyData[updatedTopicIdx] = updatedTopic;
        setTopic(copyData);
    }

    const handleMenuClick = (e, id) => {
        const status = Number(e);
        const prefillExpectedCompletionDay = statuses[statuses.findIndex(i => i.id === e)]['prefill'];
        const topicUpdatedData = {
            id,
            last_modified_status: new Date().toISOString()
        };
        setCurrentTopic(id);
        setCurrentStatus(status);
        setPrefill(prefillExpectedCompletionDay);
        if ([14, 15, 16, 17, 18, 19].includes(status)) {
            // handle pop up to fill reason of canceling
            setOnOpenExpectedDayModal(true);
        }
        else if (status === 20) {
            // handle pop up to fill topic detail
            setOnOpenProduceCost(true);
        }
        else {
            // update topic status
            topicUpdatedData['status_id'] = status;
            updateTopic(topicUpdatedData);
        }
    }

    const handleCancel = () => {
        setOnOpenExpectedDayModal(false);
    };

    const handleCancelTopicFail = () => {
        setOnOpenExpectedDayModal(false);
    }

    const onFinish = async (values) => {
        const body = values;
        const currTopicIdx = topics.findIndex(i => i.id === currentTopic);
        const expected_completion_day = add(new Date(topics[currTopicIdx]['last_modified_status']), { days: Number(body['expected_completetion_day']) });
        const topicUpdatedData = {
            id: currentTopic,
            status_id: currentStatus,
            last_modified_status: new Date().toISOString(),
            expected_completion_day: expected_completion_day
        };
        updateTopic(topicUpdatedData);
        setOnOpenExpectedDayModal(false);
    }

    const onFinishEnterProduceCost = async (values) => {
        const body = values;
        const topicUpdatedData = {
            id: currentTopic,
            status_id: currentStatus,
            last_modified_status: new Date().toISOString(),
            completed_produce_at: new Date().toISOString(),
            produce_cost: body['produce_cost']
        };
        updateTopic(topicUpdatedData);
        const updatedTopicIdx = topics.findIndex(i => i.id === currentTopic);
        const updatedTopic = { ...topics[updatedTopicIdx] };
        delete updatedTopic['status'];
        delete updatedTopic['id'];
        updatedTopic['tab'] = 3;
        updatedTopic['status_id'] = currentStatus + 1;
        updatedTopic['created_on_upload_tab'] = new Date().toISOString();
        await TopicService.create(updatedTopic);
        setOnOpenProduceCost(false);
    }

    const StatusMenu = ({ id, status }) => {
        return (
            <Select defaultValue={status} onChange={(e) => { handleMenuClick(e, id) }}>
                {
                    statuses.map(i => (
                        <Option key={i.id} value={i.id}>{i.name}</Option>
                    ))
                }
            </Select>
        )
    };

    const columns = [
        {
            title: 'Tên đề tài',
            key: 'original_name',
            dataIndex: 'original_name',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: ['status', 'translation'],
            render: (_, data) => {
                return (
                    <>
                        <StatusMenu style={{ width: 'max-content' }} status={data.status.id} id={data.id} />
                    </>
                )
            }
        },
        {
            title: 'Ngày tạo',
            key: 'created_on_produce_tab',
            dataIndex: 'created_on_produce_tab',
            render: created_at => (
                <>
                    {format(new Date(created_at), 'MM/dd/yyyy')}
                </>
            )
        },
        {
            title: 'Ngày cập nhật trạng thái gần nhất',
            key: 'last_modified_status',
            dataIndex: 'last_modified_status',
            render: last_modified_status => (
                <>
                    {format(new Date(last_modified_status), 'MM/dd/yyyy')}
                </>
            )
        },
        {
            title: 'Số ngày kể từ ngày tạo',
            key: 'created_on_produce_tab',
            dataIndex: 'created_on_produce_tab',
            render: created_at => (
                <>
                    {differenceInDays(new Date(), new Date(created_at))}
                </>
            )
        },
        {
            title: 'Số ngày kể từ ngày cập nhật gần nhất',
            key: 'last_modified_status',
            dataIndex: 'last_modified_status',
            render: last_modified_status => (
                <>
                    {differenceInDays(new Date(), new Date(last_modified_status))}
                </>
            )
        },
        {
            title: 'Ngày dự kiến hoàn tất',
            key: 'expected_completion_day',
            dataIndex: 'expected_completion_day',
            render: expected_completion_day => (
                <>
                    {expected_completion_day === null ? '' : format(new Date(expected_completion_day), 'MM/dd/yyyy')}
                </>
            )
        },
        {
            title: 'Ngày hoàn tất',
            key: 'completed_produce_at',
            dataIndex: 'completed_produce_at',
            render: completed_produce_at => (
                <>
                    {completed_produce_at === null ? '' : format(new Date(completed_produce_at), 'MM/dd/yyyy')}
                </>
            )
        },
    ];

    return (
        <div>
            <Modal
                title="Ngày hoàn tất dự kiến"
                visible={onOpenExpectedDayModal}
                onCancel={handleCancelTopicFail}
                footer={null}
            >
                <Form
                    name="numOfExpectedDayForm"
                    form={numOfExpectedDayForm}
                    onFinish={onFinish}
                    autoComplete="off"
                    initialValues={{ expected_completetion_day: prefill }}
                >
                    <Form.Item
                        label='Số ngày dự kiến hoàn tất'
                        name="expected_completetion_day"
                        rules={[{ required: true, message: 'Vui lòng điền số ngày dự kiến hoàn tất' }]}
                    >
                        <Input />
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
            <Modal
                title="Phí sản xuất"
                visible={onOpenProduceCost}
                onCancel={() => { setOnOpenProduceCost(false) }}
                footer={null}
            >
                <Form
                    name="numOfExpectedDayForm"
                    form={procudeCostForm}
                    onFinish={onFinishEnterProduceCost}
                    autoComplete="off"
                >
                    <Form.Item
                        label='Phí sản xuất'
                        name="produce_cost"
                        rules={[{ required: true, message: 'Vui lòng điền phí sản xuất' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Button key="back" onClick={() => { setOnOpenProduceCost(false) }}>
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
            <Table columns={columns} dataSource={topics} />
        </div>
    )
}

const UploadTab = () => {
    const [topics, setTopic] = useState([]);
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        const fetchTopics = async () => {
            const res = await TopicService.getAll(3);
            const data = await res.data.data;
            const dataWithKey = data.map(i => {
                i.key = i.id;
                return i;
            });
            setTopic(dataWithKey);
        };
        const fetchStatuses = async () => {
            const res = await StatusService.getAll(3);
            const data = await res.data.data;
            setStatuses(data);
        };

        fetchStatuses();
        fetchTopics();
    }, []);

    const updateTopic = async (body) => {
        const res = await TopicService.update(body);
        const updatedTopic = await res.data.data;
        const copyData = [...topics];
        const updatedTopicIdx = copyData.findIndex(i => i.id === updatedTopic.id);
        updatedTopic['key'] = updatedTopic['id'];
        copyData[updatedTopicIdx] = updatedTopic;
        setTopic(copyData);
    }

    const handleMenuClick = (e, id) => {
        const status = Number(e);
        const topicUpdatedData = {
            id,
            status_id: status,
            last_modified_status: new Date().toISOString()
        };
        if (status === 25) {
            // handle pop up to fill topic detail
            topicUpdatedData['completed_upload_at'] = new Date().toISOString();
        }
        updateTopic(topicUpdatedData);
    }

    const StatusMenu = ({ id, status }) => {
        return (
            <Select defaultValue={status} onChange={(e) => { handleMenuClick(e, id) }}>
                {
                    statuses.map(i => (
                        <Option key={i.id} value={i.id}>{i.name}</Option>
                    ))
                }
            </Select>
        )
    };

    const columns = [
        {
            title: 'Tên đề tài',
            key: 'original_name',
            dataIndex: 'original_name',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: ['status', 'translation'],
            render: (_, data) => {
                return (
                    <>
                        <StatusMenu style={{ width: 'max-content' }} status={data.status.id} id={data.id} />
                    </>
                )
            }
        },
        {
            title: 'Ngày tạo',
            key: 'created_on_upload_tab',
            dataIndex: 'created_on_upload_tab',
            render: created_on_upload_tab => (
                <>
                    {format(new Date(created_on_upload_tab), 'MM/dd/yyyy')}
                </>
            )
        },
        {
            title: 'Ngày cập nhật trạng thái gần nhất',
            key: 'last_modified_status',
            dataIndex: 'last_modified_status',
            render: last_modified_status => (
                <>
                    {format(new Date(last_modified_status), 'MM/dd/yyyy')}
                </>
            )
        },
        {
            title: 'Số ngày kể từ ngày tạo',
            key: 'created_on_upload_tab',
            dataIndex: 'created_on_upload_tab',
            render: created_on_upload_tab => (
                <>
                    {differenceInDays(new Date(), new Date(created_on_upload_tab))}
                </>
            )
        },
        {
            title: 'Số ngày kể từ ngày cập nhật gần nhất',
            key: 'last_modified_status',
            dataIndex: 'last_modified_status',
            render: last_modified_status => (
                <>
                    {differenceInDays(new Date(), new Date(last_modified_status))}
                </>
            )
        },
        {
            title: 'Ngày on air',
            key: 'completed_upload_at',
            dataIndex: 'completed_upload_at',
            render: completed_upload_at => (
                <>
                    {completed_upload_at === null ? '' : format(new Date(completed_upload_at), 'MM/dd/yyyy')}
                </>
            )
        }
    ];

    return (
        <div>
            <Table columns={columns} dataSource={topics} />
        </div>
    )
}

export default function TabPaneContent({ tab }) {

    switch (tab) {
        case '1':
            return (
                <CopyrightTab />
            )
        case '2':
            return (
                <ProductionTab />
            )
        case '3':
            return (
                <UploadTab />
            )
        default:
            return (
                <CopyrightTab />
            )
    }
}