import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, Typography, ConfigProvider, Space, Button, Tag, App as AntdApp } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function MainApp() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
          fontFamily: 'Tahoma, Arial, sans-serif',
        },
      }}
    >
      {/* استخدام مكون App لضمان عمل الإشعارات (message/notification) بشكل صحيح */}
      <AntdApp>
        <Router>
          <Layout style={{ height: '100vh', overflow: 'hidden' }}>
            {/* ترويسة ثابتة مع توسيط النص */}
            <Header style={{ 
              display: 'flex', 
              justifyContent: 'center', // توسيط الترويسة
              alignItems: 'center',
              padding: '0 25px',
              background: '#001529',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 10,
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Title level={4} style={{ margin: 0, color: '#fff' }}>
                  نظام إدارة المشاريع
                </Title>
                <Tag color="blue">Professional v1.0</Tag>
              </div>
              
              {/* أيقونة جانبية لعدم كسر التوسيط */}
              <div style={{ position: 'absolute', right: '25px' }}>
                <Button 
                  type="text" 
                  icon={<GithubOutlined />} 
                  style={{ color: '#fff' }} 
                  onClick={() => window.open('https://github.com/ENGEyad', '_blank')}
                />
              </div>
            </Header>
            
            {/* المحتوى هو الجزء الوحيد الذي يسمح بـ Scroll داخلي */}
            <Content style={{ 
              flex: 1,
              overflowY: 'auto', // تمرير داخلي فقط
              padding: '24px', 
              background: '#f0f2f5' 
            }}>
              <div style={{ 
                maxWidth: '1200px', 
                margin: '0 auto',
                paddingBottom: '20px'
              }}>
                <Routes>
                  <Route path="/" element={<ProjectsPage />} />
                  <Route path="/tasks/:projectId" element={<TasksPage />} />
                </Routes>
              </div>
            </Content>

            {/* قاع الصفحة ثابت في مكانه */}
            <Footer style={{ 
              textAlign: 'center', 
              background: '#001529',
              color: 'rgba(255,255,255,0.65)',
              padding: '12px 20px',
              flexShrink: 0,
              zIndex: 10
            }}>
              <Space direction="vertical" size={0}>
                  <div style={{ fontSize: '14px' }}>Project Management ©2026 Crafted with ❤️Eng.Eyad Mufleh</div>
                  <div style={{ fontSize: '11px', opacity: 0.5 }}>جميع الحقوق محفوظة  </div>
              </Space>
            </Footer>
          </Layout>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
}

const rootElement = document.getElementById('app');
if (rootElement) {
    createRoot(rootElement).render(<MainApp />);
}
