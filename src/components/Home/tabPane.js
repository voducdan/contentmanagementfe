import { useState, useEffect } from 'react';

import { format } from 'date-fns';
import add from 'date-fns/add';

import TopicService from '../../services/topic.service';
import StatusService from '../../services/status.service';
import TopicCancelService from '../../services/topicCancel.service';
import CategoryService from '../../services/category.service';
import DateService from '../../services/date.service';

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
    const [topicsStatusGroup1, setTopicsStatusGroup1] = useState([]);
    const [topicsStatusGroup2, setTopicsStatusGroup2] = useState([]);
    const [topicsStatusGroup3, setTopicsStatusGroup3] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [openReasonModal, setOpenReasonModal] = useState(false);
    const [openTopicDetailModal, setOpenTopicDetailModal] = useState(false);
    const [currentTopic, setCurrentTopic] = useState(null);
    const [currentStatus, setCurrentStatus] = useState(null);
    const [categoriesLevel1, setCategoriesLevel1] = useState([]);
    const [categoriesLevel2, setCategoriesLevel2] = useState([]);
    const [filteredStatus, setFilteredStatus] = useState([]);
    const [filterTopicName, setFilterTopicName] = useState([]);
    const [isUnauthen, setIsUnauthen] = useState(false);
    const [maxStatus, setMaxStatus] = useState({});
    const [updateTopicDetailForm] = Form.useForm();
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await TopicService.getAll(1);
                const data = await res.data.data;
                const dataWithKey = data.map(i => {
                    i.key = i.id;
                    return i;
                });
                setTopic(dataWithKey);
            }
            catch (err) {
                if (err.response.status === 401 || err.response.status === 403) {
                    setIsUnauthen(true);
                }
            }
        };

        const fetchStatuses = async () => {
            const res = await StatusService.getAll(1);
            const data = await res.data.data;
            setStatuses(data);
        };

        fetchStatuses();
        fetchTopics();
    }, []);

    useEffect(() => {
        const fetchNextTabStatus = async () => {
            let topicMaxStatus = {};
            for (let t of topics) {
                const res = await TopicService.getNextTabStatus(t.topic_id, t.tab);
                const data = await res.data;
                topicMaxStatus[t.topic_id] = data.status;
            }
            setMaxStatus(topicMaxStatus);
        }

        fetchNextTabStatus();
        const topicGroup1 = topics.filter(i => [1, 2].includes(i.status.id));
        const topicGroup2 = topics.filter(i => ![10, 11, 12, 1, 2].includes(i.status.id));
        const topicGroup3 = topics.filter(i => [10, 11, 12].includes(i.status.id));
        setTopicsStatusGroup1([...topicGroup1]);
        setTopicsStatusGroup2([...topicGroup2]);
        setTopicsStatusGroup3([...topicGroup3]);
        const topicStatus = topics.map(i => ({
            value: i.status.id,
            text: i.status.name
        }));
        const topicFiltered = topics.map(i => ({
            value: i.id,
            text: i.vi_name
        }));
        const distinctTopicName = [...new Map(topicFiltered.map(i => [i['value'], i])).values()];
        setFilterTopicName(distinctTopicName);
        const distinctTopicStatus = [...new Map(topicStatus.map(i => [i['value'], i])).values()];
        setFilteredStatus(distinctTopicStatus);
    }, [topics]);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const updateTopic = async (body) => {
        const res = await TopicService.update({ data: body, type: '' });
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
            last_modified_status: new Date().toISOString(),
            updated_at: new Date().toISOString()
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
            topicUpdatedData['completed_at'] = null;
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

    const StatusMenu = ({ translation, id, status, disabled }) => {
        const filteredStatuses = translation === true ? statuses : statuses.filter(i => !(i.id === 8 || i.id === 9));
        return (
            <Select disabled={disabled} className='status-menu-select' defaultValue={status} onChange={(e) => { handleMenuClick(e, id) }}>
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
            if (values.coverImg && values.coverImg.file) {
                formData.append("coverImg", values.coverImg.file);
            }
            formData.append("id", currentTopic || null);
            formData.append("status_id", currentStatus);
            formData.append("category_level_1", values.categoryLevel1 || null);
            formData.append("category_level_2", values.categoryLevel2 || null);
            formData.append("description", values.description || null);
            formData.append("type_of_sale", values.typeOfSale || null);
            formData.append("contracted_at", values.contractedAt || null);
            formData.append("contract_term", values.contractTerm || null);
            formData.append("cover_price", values.coverPrice || null);
            formData.append("royalty", values.royalty || null);
            formData.append("copyright_price", values.copyrightPrice || null);
            formData.append("translation_cost", values.translationCost || null);
            formData.append("buy_permission", values.buyPermission || null);
            formData.append("partner_note", values.partnerNote || null);
            formData.append("voice_note", values.voiceNote || null);
            formData.append("contract_note", values.contractNote || null);
            formData.append("release_date", values.release_date || null);
            formData.append("last_modified_status", new Date().toISOString());
            formData.append("completed_at", new Date().toISOString());
            const res = await TopicService.update({ data: formData, type: '' });
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
            title: 'T??n ????? t??i',
            key: 'vi_name',
            dataIndex: ['vi_name', 'topic_id'],
            filters: filterTopicName,
            filterSearch: true,
            onFilter: (value, record) => record.id === value,
            sorter: (a, b) => a.vi_name.localeCompare(b.vi_name),
            render: (_, data) => {
                return (
                    <>
                        <a href={`/metadata/${data.topic_id}`} target='_blank'>{data.vi_name}</a>
                    </>
                )
            }
        },
        {
            title: 'Tr???ng th??i',
            key: 'status',
            dataIndex: ['status', 'translation'],
            filters: filteredStatus,
            onFilter: (value, record) => record.status.id === value,
            sorter: (a, b) => a.status.name.localeCompare(b.status.name),
            render: (_, data) => {
                return (
                    <>
                        <StatusMenu disabled={maxStatus[data.topic_id] === 20} style={{ width: 'max-content' }} status={data.status.id} translation={data.translation} id={data.id} />
                    </>
                )
            }
        },
        {
            title: 'Ng??y t???o',
            key: 'created_at',
            dataIndex: 'created_at',
            render: created_at => (
                <>
                    {format(new Date(created_at), 'dd/MM/yyyy')}
                </>
            )
        },
        {
            title: 'Ng??y c???p nh???t tr???ng th??i g???n nh???t',
            key: 'last_modified_status',
            dataIndex: 'last_modified_status',
            render: last_modified_status => (
                <>
                    {format(new Date(last_modified_status), 'dd/MM/yyyy')}
                </>
            )
        },
        {
            title: 'S??? ng??y k??? t??? ng??y t???o',
            key: 'created_at',
            dataIndex: 'created_at',
            render: created_at => (
                <>
                    {DateService.daydiff(new Date(), new Date(created_at))}
                </>
            )
        },
        {
            title: 'S??? ng??y k??? t??? ng??y c???p nh???t g???n nh???t',
            key: 'last_modified_status',
            dataIndex: 'last_modified_status',
            render: last_modified_status => (
                <>
                    {DateService.daydiff(new Date(), new Date(last_modified_status))}
                </>
            )
        },
        {
            title: 'Ng??y ho??n t???t',
            key: 'completed_at',
            dataIndex: 'completed_at',
            render: completed_at => (
                <>
                    {completed_at === null ? '' : format(new Date(completed_at), 'dd/MM/yyyy')}
                </>
            )
        },
    ];

    const coverImgProps = {
        name: 'coverImg'
    }

    return (
        <div>
            {
                (!isUnauthen) && (
                    <div>
                        <Modal
                            title="L?? do k???t th??c ????? t??i"
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
                                    rules={[{ required: true, message: 'Vui l??ng ??i???n l?? do k???t th??c ????? t??i' }]}
                                >
                                    <Input.TextArea />
                                </Form.Item>
                                <Button key="back" onClick={handleCancel}>
                                    Tho??t
                                </Button>,
                                <Button
                                    key="submit"
                                    htmlType="submit"
                                    type="primary"
                                >
                                    L??u
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
                                    label="Category t???ng 1"
                                    name="categoryLevel1"
                                rules={[{ required: true, message: 'Vui l??ng ??i???n category t???ng 1' }]}
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
                                    label="Category t???ng 2"
                                    name="categoryLevel2"
                                rules={[{ required: true, message: 'Vui l??ng ??i???n category t???ng 2' }]}
                                >
                                    <Select
                                        mode="multiple"
                                        defaultValue={[]}
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
                                    label="M?? t??? playlist"
                                    name="description"
                                rules={[{ required: true, message: 'Vui l??ng ??i???n m?? t??? playlist' }]}
                                >
                                    <Input.TextArea />
                                </Form.Item>
                                <Form.Item
                                    label="Kinh doanh"
                                    name="typeOfSale"
                                rules={[{ required: true, message: 'Vui l??ng ??i???n kinh doanh' }]}
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
                                    label="Ng??y k?? H??"
                                    name="contractedAt"
                                rules={[{ required: true, message: 'Vui l??ng ??i???n ng??y k?? H??' }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Th???i h???n H??"
                                    name="contractTerm"
                                rules={[{ required: true, message: 'Vui l??ng ??i???n th???i h???n H??' }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Gi?? b??a"
                                    name="coverPrice"
                                rules={[{ required: true, message: 'Vui l??ng ??i???n gi?? b??a' }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Royalty"
                                    name="royalty"
                                rules={[{ required: true, message: 'Vui l??ng ??i???n royalty' }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Ph?? BQ"
                                    name="copyrightPrice"
                                rules={[{ required: true, message: 'Vui l??ng ??i???n ph?? BQ' }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Ph?? d???ch"
                                    name="translationCost"
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Mua quy???n g??"
                                    name="buyPermission"
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Th???i h???n ph??t h??nh"
                                    name="release_date"
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Ghi ch?? v??? ?????i t??c d???ch"
                                    name="partnerNote"
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="L??u ?? gi???ng ?????c"
                                    name="voiceNote"
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="L??u ?? kh??c"
                                    name="contractNote"
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="coverImg"
                                >
                                    <Upload {...coverImgProps} beforeUpload={() => false} >
                                        <Button icon={<UploadOutlined />}>Click ????? upload ???nh b??a</Button>
                                    </Upload>
                                </Form.Item>
                                <Button key="back" onClick={handleCancel}>
                                    Tho??t
                                </Button>,
                                <Button
                                    key="submit"
                                    htmlType="submit"
                                    type="primary"
                                >
                                    L??u
                                </Button>
                            </Form>
                        </Modal>
                        <div className='create-topic-btn-container'>
                            <Button
                                onClick={showModal}
                                type='primary'
                                shape='round'
                            >
                                + T???o ????? t??i m???i
                            </Button>
                            <CreateTopic
                                isModalVisible={isModalVisible}
                                setIsModalVisible={setIsModalVisible}
                                appendTopic={appendTopic}
                            />
                            <Table
                                className='topic-table topic-table-gr1'
                                columns={columns}
                                dataSource={topicsStatusGroup1}
                                pagination={{ defaultPageSize: 5 }}
                            />
                            <Table
                                className='topic-table topic-table-gr2'
                                columns={columns}
                                dataSource={topicsStatusGroup2}
                                pagination={{ defaultPageSize: 10 }}
                            />
                            <Table
                                className='topic-table topic-table-gr3'
                                columns={columns}
                                dataSource={topicsStatusGroup3}
                                pagination={{ defaultPageSize: 10 }}
                            />
                        </div>
                    </div>
                )
            }
            {
                isUnauthen && (
                    <h1
                        style={{
                            textAlign: 'center',
                            color: 'white'
                        }}
                    >User hi???n t???i kh??ng th??? xem n???i dung n??y!</h1>
                )
            }
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
    const [filteredStatus, setFilteredStatus] = useState([]);
    const [filterTopicName, setFilterTopicName] = useState([]);
    const [isUnauthen, setIsUnauthen] = useState(false);
    const [maxStatus, setMaxStatus] = useState({});


    const [numOfExpectedDayForm] = Form.useForm();

    useEffect(() => {
        const fetchTopics = async () => {
            try {

                const res = await TopicService.getAll(2);
                const data = await res.data.data;
                const dataWithKey = data.map(i => {
                    i.key = i.id;
                    return i;
                });
                setTopic(dataWithKey);
            }
            catch (err) {
                if (err.response.status === 401 || err.response.status === 403) {
                    setIsUnauthen(true);
                }
            }
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
        numOfExpectedDayForm.setFieldsValue({ expected_completetion_day: prefill });
    }, [numOfExpectedDayForm, prefill]);

    useEffect(() => {
        const fetcNextTabStatus = async () => {
            let topicMaxStatus = {};
            for (let t of topics) {
                const res = await TopicService.getNextTabStatus(t.topic_id, t.tab);
                const data = await res.data;
                topicMaxStatus[t.topic_id] = data.status;
            }
            setMaxStatus(topicMaxStatus);
        }

        fetcNextTabStatus();
        const topicFiltered = topics.map(i => ({
            value: i.id,
            text: i.vi_name
        }));
        const distinctTopicName = [...new Map(topicFiltered.map(i => [i['value'], i])).values()];
        setFilterTopicName(distinctTopicName);
        const topicStatus = topics.map(i => ({
            value: i.status.id,
            text: i.status.name
        }));
        const distinctTopicStatus = [...new Map(topicStatus.map(i => [i['value'], i])).values()];
        setFilteredStatus(distinctTopicStatus);
    }, [topics]);

    const updateTopic = async (body) => {
        const res = await TopicService.update({ data: body, type: '' });
        const updatedTopic = await res.data.data;
        const copyData = [...topics];
        const updatedTopicIdx = copyData.findIndex(i => i.id === updatedTopic.id);
        updatedTopic['key'] = updatedTopic['id'];
        copyData[updatedTopicIdx] = updatedTopic;
        setTopic(copyData);
    }

    const addTopicToUploadTab = async (status) => {
        const updatedTopicIdx = topics.findIndex(i => i.id === currentTopic);
        console.log(topics[updatedTopicIdx])
        const updatedTopic = { ...topics[updatedTopicIdx] };
        delete updatedTopic['status'];
        delete updatedTopic['id'];
        delete updatedTopic['key'];
        updatedTopic['tab'] = 3;
        updatedTopic['status_id'] = status + 1;
        updatedTopic['created_on_upload_tab'] = new Date().toISOString();
        await TopicService.create(updatedTopic);
    }

    const handleMenuClick = async (e, id) => {
        const status = Number(e);
        const prefillExpectedCompletionDay = statuses[statuses.findIndex(i => i.id === e)]['prefill'];
        setCurrentTopic(id);
        setCurrentStatus(status);
        setPrefill(prefillExpectedCompletionDay);
        const topicUpdatedData = {
            id,
            last_modified_status: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        if ([14, 15, 16, 17, 18, 19].includes(status)) {
            setOnOpenExpectedDayModal(true);
        }
        else if (status === 20) {
            topicUpdatedData['status_id'] = status;
            topicUpdatedData['completed_produce_at'] = new Date().toISOString();
            await updateTopic(topicUpdatedData);
            await addTopicToUploadTab(status);
        }
        else {
            // update topic status
            topicUpdatedData['status_id'] = status;
            topicUpdatedData['completed_produce_at'] = null;
            await updateTopic(topicUpdatedData);
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
            expected_completion_day: expected_completion_day,
            completed_produce_at: null
        };
        updateTopic(topicUpdatedData);
        setOnOpenExpectedDayModal(false);
    }

    const StatusMenu = ({ id, status, disabled }) => {
        return (
            <Select disabled={disabled} className='status-menu-select' defaultValue={status} onChange={(e) => { handleMenuClick(e, id) }}>
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
            title: 'T??n ????? t??i',
            key: 'vi_name',
            dataIndex: ['vi_name', 'topic_id'],
            filters: filterTopicName,
            filterSearch: true,
            onFilter: (value, record) => record.id === value,
            sorter: (a, b) => a.vi_name.localeCompare(b.vi_name),
            render: (_, data) => {
                return (
                    <>
                        <a href={`/metadata/${data.topic_id}`} target='_blank'>{data.vi_name}</a>
                    </>
                )
            }
        },
        {
            title: 'Tr???ng th??i',
            key: 'status',
            dataIndex: ['status', 'translation'],
            filters: filteredStatus,
            onFilter: (value, record) => record.status.id === value,
            sorter: (a, b) => a.status.name.localeCompare(b.status.name),
            render: (_, data) => {
                return (
                    <>
                        <StatusMenu disabled={maxStatus[data.topic_id] === 25} style={{ width: 'max-content' }} status={data.status.id} id={data.id} />
                    </>
                )
            }
        },
        {
            title: 'Ng??y t???o',
            key: 'created_on_produce_tab',
            dataIndex: 'created_on_produce_tab',
            render: created_at => (
                <>
                    {format(new Date(created_at), 'dd/MM/yyyy')}
                </>
            )
        },
        {
            title: 'Ng??y c???p nh???t tr???ng th??i g???n nh???t',
            key: 'last_modified_status',
            dataIndex: 'last_modified_status',
            render: last_modified_status => (
                <>
                    {format(new Date(last_modified_status), 'dd/MM/yyyy')}
                </>
            )
        },
        {
            title: 'S??? ng??y k??? t??? ng??y t???o',
            key: 'created_on_produce_tab',
            dataIndex: 'created_on_produce_tab',
            render: created_at => (
                <>
                    {DateService.daydiff(new Date(), new Date(created_at))}
                </>
            )
        },
        {
            title: 'S??? ng??y k??? t??? ng??y c???p nh???t g???n nh???t',
            key: 'last_modified_status',
            dataIndex: 'last_modified_status',
            render: last_modified_status => (
                <>
                    {DateService.daydiff(new Date(), new Date(last_modified_status))}
                </>
            )
        },
        {
            title: 'Ng??y d??? ki???n ho??n t???t',
            key: 'expected_completion_day',
            dataIndex: 'expected_completion_day',
            render: expected_completion_day => (
                <>
                    {expected_completion_day === null ? '' : format(new Date(expected_completion_day), 'dd/MM/yyyy')}
                </>
            )
        },
        {
            title: 'Ng??y ho??n t???t',
            key: 'completed_produce_at',
            dataIndex: 'completed_produce_at',
            render: completed_produce_at => (
                <>
                    {completed_produce_at === null ? '' : format(new Date(completed_produce_at), 'dd/MM/yyyy')}
                </>
            )
        },
    ];

    return (
        <div>
            {
                (!isUnauthen) && (
                    <div>
                        <Modal
                            title="Ng??y ho??n t???t d??? ki???n"
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
                                    label='S??? ng??y d??? ki???n ho??n t???t'
                                    name="expected_completetion_day"
                                rules={[{ required: true, message: 'Vui l??ng ??i???n s??? ng??y d??? ki???n ho??n t???t' }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Button key="back" onClick={handleCancel}>
                                    Tho??t
                                </Button>,
                                <Button
                                    key="submit"
                                    htmlType="submit"
                                    type="primary"
                                >
                                    L??u
                                </Button>
                            </Form>
                        </Modal>
                        <Table className='topic-table' columns={columns} dataSource={topics} />
                    </div>
                )
            }
            {
                isUnauthen && (
                    <h1
                        style={{
                            textAlign: 'center',
                            color: 'white'
                        }}
                    >User hi???n t???i kh??ng th??? xem n???i dung n??y!</h1>
                )
            }
        </div>
    )
}

const UploadTab = () => {
    const [topics, setTopic] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [isUnauthen, setIsUnauthen] = useState(false);
    const [filteredStatus, setFilteredStatus] = useState([]);
    const [filterTopicName, setFilterTopicName] = useState([]);
    const [currentTopic, setCurrentTopic] = useState(null);
    const [currentStatus, setCurrentStatus] = useState(null);
    const [onOpenProduceCost, setOnOpenProduceCost] = useState(false);

    const [procudeCostForm] = Form.useForm();

    const onFinishEnterProduceCost = async (values) => {
        const body = values;
        const topicUpdatedData = {
            id: currentTopic,
            status_id: currentStatus,
            last_modified_status: new Date().toISOString(),
            completed_upload_at: new Date().toISOString(),
            produce_cost: body['produce_cost'],
            control_cost: body['control_cost'],
            post_production_cost: body['post_production_cost']
        };
        updateTopic(topicUpdatedData);
        setOnOpenProduceCost(false);
    }

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await TopicService.getAll(3);
                if (res.status === 401 || res.status === 403) {
                    console.log(res.data.message)
                }
                const data = await res.data.data;
                const dataWithKey = data.map(i => {
                    i.key = i.id;
                    return i;
                });
                setTopic(dataWithKey);
            }
            catch (err) {
                if (err.response.status === 401 || err.response.status === 403) {
                    setIsUnauthen(true);
                }
            }
        };
        const fetchStatuses = async () => {
            const res = await StatusService.getAll(3);
            const data = await res.data.data;
            setStatuses(data);
        };

        fetchStatuses();
        fetchTopics();
    }, []);

    useEffect(() => {
        const topicFiltered = topics.map(i => ({
            value: i.id,
            text: i.vi_name
        }));
        const distinctTopicName = [...new Map(topicFiltered.map(i => [i['value'], i])).values()];
        setFilterTopicName(distinctTopicName);
        const topicStatus = topics.map(i => ({
            value: i.status.id,
            text: i.status.name
        }));
        const distinctTopicStatus = [...new Map(topicStatus.map(i => [i['value'], i])).values()];
        setFilteredStatus(distinctTopicStatus);
    }, [topics]);

    const updateTopic = async (body) => {
        const res = await TopicService.update({ data: body, type: '' });
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
            last_modified_status: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        setCurrentTopic(id);
        setCurrentStatus(status);
        if (status === 25) {
            setOnOpenProduceCost(true);
        } else {
            topicUpdatedData['completed_upload_at'] = null;
            updateTopic(topicUpdatedData);
        }
    }

    const StatusMenu = ({ id, status }) => {
        return (
            <Select className='status-menu-select' defaultValue={status} onChange={(e) => { handleMenuClick(e, id) }}>
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
            title: 'T??n ????? t??i',
            key: 'vi_name',
            dataIndex: ['vi_name', 'topic_id'],
            filters: filterTopicName,
            filterSearch: true,
            onFilter: (value, record) => record.id === value,
            sorter: (a, b) => a.vi_name.localeCompare(b.vi_name),
            render: (_, data) => {
                return (
                    <>
                        <a href={`/metadata/${data.topic_id}`} target='_blank'>{data.vi_name}</a>
                    </>
                )
            }
        },
        {
            title: 'Tr???ng th??i',
            key: 'status',
            dataIndex: ['status', 'translation'],
            filters: filteredStatus,
            onFilter: (value, record) => record.status.id === value,
            sorter: (a, b) => a.status.name.localeCompare(b.status.name),
            render: (_, data) => {
                return (
                    <>
                        <StatusMenu style={{ width: 'max-content' }} status={data.status.id} id={data.id} />
                    </>
                )
            }
        },
        {
            title: 'Ng??y t???o',
            key: 'created_on_upload_tab',
            dataIndex: 'created_on_upload_tab',
            render: created_on_upload_tab => (
                <>
                    {format(new Date(created_on_upload_tab), 'dd/MM/yyyy')}
                </>
            )
        },
        {
            title: 'Ng??y c???p nh???t tr???ng th??i g???n nh???t',
            key: 'last_modified_status',
            dataIndex: 'last_modified_status',
            render: last_modified_status => (
                <>
                    {format(new Date(last_modified_status), 'dd/MM/yyyy')}
                </>
            )
        },
        {
            title: 'S??? ng??y k??? t??? ng??y t???o',
            key: 'created_on_upload_tab',
            dataIndex: 'created_on_upload_tab',
            render: created_on_upload_tab => (
                <>
                    {DateService.daydiff(new Date(), new Date(created_on_upload_tab))}
                </>
            )
        },
        {
            title: 'S??? ng??y k??? t??? ng??y c???p nh???t g???n nh???t',
            key: 'last_modified_status',
            dataIndex: 'last_modified_status',
            render: last_modified_status => (
                <>
                    {DateService.daydiff(new Date(), new Date(last_modified_status))}
                </>
            )
        },
        {
            title: 'Ng??y on air',
            key: 'completed_upload_at',
            dataIndex: 'completed_upload_at',
            render: completed_upload_at => (
                <>
                    {completed_upload_at === null ? '' : format(new Date(completed_upload_at), 'dd/MM/yyyy')}
                </>
            )
        }
    ];

    return (

        <div>
            <Modal
                title="Ph?? s???n xu???t"
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
                        label='Ph?? s???n xu???t'
                        name="produce_cost"
                        rules={[{ required: true, message: 'Vui l??ng ??i???n ph?? s???n xu???t' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label='Ph?? d?? so??t'
                        name="control_cost"
                        rules={[{ required: true, message: 'Vui l??ng ??i???n ph?? d?? so??t' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label='Ph?? h???u k???'
                        name="post_production_cost"
                        rules={[{ required: true, message: 'Vui l??ng ??i???n ph?? h???u k???' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Button key="back" onClick={() => { setOnOpenProduceCost(false) }}>
                        Tho??t
                    </Button>,
                    <Button
                        key="submit"
                        htmlType="submit"
                        type="primary"
                    >
                        L??u
                    </Button>
                </Form>
            </Modal>
            {
                (!isUnauthen) && (

                    <Table className='topic-table' columns={columns} dataSource={topics} />
                )
            }
            {
                isUnauthen && (
                    <h1
                        style={{
                            textAlign: 'center',
                            color: 'white'
                        }}
                    >User hi???n t???i kh??ng th??? xem n???i dung n??y!</h1>
                )
            }
        </div>
    )
}

export default function TabPaneContent({ tab }) {
    switch (tab) {
        case '1':
            return (
                <CopyrightTab tab={tab} />
            )
        case '2':
            return (
                <ProductionTab tab={tab} />
            )
        case '3':
            return (
                <UploadTab tab={tab} />
            )
        default:
            return (
                <CopyrightTab tab={tab} />
            )
    }
}