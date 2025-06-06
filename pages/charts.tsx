
import React from 'react';
import { Layout, Typography } from 'antd';
import BottomNav from '../components/BottomNav';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function Charts() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 16px' }}>
        <Title level={3} style={{ color: 'white', margin: '16px 0' }}>
          Charts
        </Title>
      </Header>
      <Content style={{ padding: '16px', paddingBottom: '60px' }}>
        <div>Charts Page - Coming Soon</div>
      </Content>
      <BottomNav onFilterClick={() => {}} />
    </Layout>
  );
}
