import 'antd/dist/antd.css';
import './home.style.css';

import TabPaneContent from './tabPane';

import { Tabs } from 'antd';

const { TabPane } = Tabs;

export default function Home() {

    const callback = (key) => {
    }
    return (
        <div
            style={{
                width: '90%',
                margin: '5%'
            }}
        >
            <Tabs
                className='topic-tab'
                defaultActiveKey="1"
                type="card"
                onChange={callback}
            >
                <TabPane tab="Bản quyền" key="1">
                    <TabPaneContent tab="1" />
                </TabPane>
                <TabPane tab="Sản xuất" key="2">
                    <TabPaneContent tab="2" />
                </TabPane>
                <TabPane tab="Đăng tải" key="3">
                    <TabPaneContent tab="3" />
                </TabPane>
            </Tabs>
        </div>
    )
}