import 'antd/dist/antd.css';
import TabPaneContent from './tabPane';

import { Tabs } from 'antd';

const { TabPane } = Tabs;

export default function Home() {

    const callback = (key) => {
        console.log(key);
    }
    return (
        <div
            style={{
                width: '90%',
                margin: '5%'
            }}
        >
            <TabPaneContent key="1" />
            <Tabs defaultActiveKey="1" type="card" onChange={callback}>
                <TabPane tab="Bản quyền" key="1">
                    <TabPaneContent key="1" />
                </TabPane>
                <TabPane tab="Sản xuất" key="2">
                    Sản xuất
                </TabPane>
                <TabPane tab="Đăng tải" key="3">
                    Đăng tải
                </TabPane>
            </Tabs>``
        </div>
    )
}