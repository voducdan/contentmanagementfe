import { useState, useEffect } from 'react';

import { format } from 'date-fns';
import differenceInDays from 'date-fns/differenceInDays'

import TopicService from '../../services/topic.service';
import StatusService from '../../services/status.service';
import TopicCancelService from '../../services/topicCancel.service';

import CreateTopic from './createTopicDialog';

import {
    Table,
    Button,
    Select,
    Modal,
    Form,
    Input
} from 'antd';

const { Option } = Select;

const CopyrightTab = ({ data, statuses, setData }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [openReasonModal, setOpenReasonModal] = useState(false);
    const [currentTopic, setCurrentTopic] = useState(null);
    const [currentStatus, setCurrentStatus] = useState(null);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const updateTopic = async (body) => {
        const res = await TopicService.update(body);
        const updatedTopic = await res.data.data;
        const copyData = [...data];
        const updatedTopicIdx = copyData.findIndex(i => i.id === updatedTopic.id);
        updatedTopic['key'] = updatedTopic['id'];
        copyData[updatedTopicIdx] = updatedTopic;
        setData(copyData);
    }

    function handleMenuClick(e, id) {
        const status = Number(e);
        const topicUpdatedData = {
            id,
            last_modified_status: new Date()
        };
        if ([10, 11].includes(status)) {
            // handle pop up to fill reason of canceling
            setOpenReasonModal(true);
            setCurrentTopic(id);
            setCurrentStatus(status);
        }
        else if (status === 12) {
            // handle pop up to fill topic detail
        }
        else {
            // update topic status
            topicUpdatedData['status_id'] = status;
        }
        updateTopic(topicUpdatedData);
    }



    const appendTopic = (topic) => {
        topic['key'] = topic.id;
        const copyData = [...data];
        copyData.push(topic);
        setData(copyData);
    }

    const handleCancelTopicOk = () => {

    }

    const handleCancelTopicFail = () => {

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
    return (
        <div>
            <Modal
                title="Lý do kết thúc đề tài"
                visible={openReasonModal}
                onOk={handleCancelTopicOk}
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
                <Table columns={columns} dataSource={data} />
            </div>
        </div>
    )
};

export default function TabPaneContent({ tab }) {
    const [topics, setTopic] = useState([]);
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        const fetchTopics = async () => {
            const res = await TopicService.getAll();
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

        fetchTopics();
        fetchStatuses();
    }, [])

    switch (tab) {
        case '1':
            return (
                <CopyrightTab data={topics} statuses={statuses} setData={setTopic} />
            )
    }
}