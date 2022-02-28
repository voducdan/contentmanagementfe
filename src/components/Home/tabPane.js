import { useState, useEffect } from 'react';

import { format } from 'date-fns';
import differenceInDays from 'date-fns/differenceInDays'

import { DownOutlined } from '@ant-design/icons';

import TopicService from '../../services/topic.service';
import StatusService from '../../services/status.service';

import CreateTopic from './createTopicDialog';

import {
    Table,
    Button,
    Menu,
    Dropdown
} from 'antd';

const CopyrightTab = ({ data, statuses }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    };

    function handleMenuClick(e) {
        console.log('Click on menu item.');
        console.log('click', e);
    }

    const statusMenu = (
        <Menu onClick={handleMenuClick}>
            {
                statuses.map(i => (
                    <Menu.Item key={i.id} >
                        {i.name}
                    </Menu.Item>
                ))
            }
        </Menu>
    );

    const columns = [
        {
            title: 'Tên đề tài',
            key: 'original_name',
            dataIndex: 'original_name',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            render: status => (
                <>
                    <Dropdown overlay={statusMenu}>
                        <Button>
                            {status.name} <DownOutlined />
                        </Button>
                    </Dropdown>

                </>
            )
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
            const res = await StatusService.getAll();
            const data = await res.data.data;
            setStatuses(data);
        };

        fetchTopics();
        fetchStatuses();
    }, [])

    switch (tab) {
        case '1':
            return (
                <CopyrightTab data={topics} statuses={statuses} />
            )
    }
}