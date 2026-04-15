import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Card, Row, Col, Statistic, Progress, Skeleton, Empty, Tag, App as AntdApp } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, RocketOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getProjects, addProject, editProject, deleteProject } from '../api';
import { useNavigate } from 'react-router-dom';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();
    const navigate = useNavigate();
    
    // استخدام نظام الإشعارات الجديد (Required for fixed UI)
    const { message: messageApi } = AntdApp.useApp();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        // رسالة بدء التحميل عبر الـ API الجديد
        const hideLoading = messageApi.loading('جاري تحميل المشاريع من السيرفر...', 0);
        setLoading(true);
        
        try {
            const res = await getProjects();
            setProjects(res.data);
            messageApi.success(`تم تحميل ${res.data.length} مشاريع بنجاح`);
        } catch (error) {
            console.error(error);
            messageApi.error(`فشل تحميل المشاريع!`);
        } finally {
            hideLoading();
            setLoading(false);
        }
    };

    const showModal = (project = null) => {
        setEditingProject(project);
        if (project) {
            form.setFieldsValue(project);
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        setLoading(true);
        try {
            const values = await form.validateFields();
            if (editingProject) {
                await editProject(editingProject.id, values);
                messageApi.success('تم تحديث المشروع بنجاح');
            } else {
                await addProject(values);
                messageApi.success('تم إضافة المشروع بنجاح');
            }
            setIsModalVisible(false);
            fetchProjects();
        } catch (error) {
            messageApi.error('حدث خطأ أثناء الحفظ');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteProject(id);
            messageApi.success('تم حذف المشروع');
            fetchProjects();
        } catch (error) {
            messageApi.error('فشل في حذف المشروع');
        }
    };

    // فلترة المشاريع بناءً على البحث
    const filteredProjects = projects.filter(p => 
        p.name.toLowerCase().includes(searchText.toLowerCase()) || 
        (p.description && p.description.toLowerCase().includes(searchText.toLowerCase()))
    );

    // حساب إحصائيات سريعة
    const totalProjects = projects.length;
    const totalTasks = projects.reduce((sum, p) => sum + (p.tasks_count || 0), 0);
    const totalCompleted = projects.reduce((sum, p) => sum + (p.completed_tasks_count || 0), 0);

    const columns = [
        { 
            title: 'اسم المشروع', 
            dataIndex: 'name', 
            key: 'name',
            render: (text) => <strong>{text}</strong>
        },
        { title: 'الوصف', dataIndex: 'description', key: 'description' },
        { 
            title: 'التقدم', 
            key: 'progress', 
            render: (text, record) => {
                const percent = record.tasks_count > 0 
                                ? Math.round((record.completed_tasks_count / record.tasks_count) * 100) 
                                : 0;
                return (
                    <div style={{ width: 150 }}>
                        <Progress percent={percent} size="small" status={percent === 100 ? 'success' : 'active'} />
                        <small>{record.completed_tasks_count} من {record.tasks_count} مهام مكتملة</small>
                    </div>
                );
            }
        },
        {
            title: 'الإجراءات',
            key: 'actions',
            render: (text, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => navigate(`/tasks/${record.id}`)}>المهام</Button>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)} type="primary" ghost />
                    <Popconfirm title="حذف المشروع؟" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} danger ghost />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '20px' }}>
            {/* بطاقات الإحصائيات (UI Improvement) */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card bordered={false} style={{ background: '#e6f7ff', borderLeft: '4px solid #1890ff' }}>
                        <Statistic title="إجمالي المشاريع" value={totalProjects} prefix={<RocketOutlined />} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} style={{ background: '#f6ffed', borderLeft: '4px solid #52c41a' }}>
                        <Statistic title="المهام المكتملة" value={totalCompleted} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} style={{ background: '#fff7e6', borderLeft: '4px solid #faad14' }}>
                        <Statistic title="إجمالي المهام" value={totalTasks} prefix={<ClockCircleOutlined />} />
                    </Card>
                </Col>
            </Row>

            <Card 
                title={<span><RocketOutlined style={{ marginRight: 8 }} /> لوحة التحكم بالمشاريع</span>}
                extra={
                    <Space>
                        <Input 
                            placeholder="بحث في المشاريع..." 
                            prefix={<SearchOutlined />} 
                            onChange={e => setSearchText(e.target.value)}
                            style={{ width: 250 }}
                        />
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>إضافة مشروع</Button>
                    </Space>
                }
            >
                {loading && projects.length === 0 ? (
                    <Skeleton active numberOfLines={10} />
                ) : (
                    <Table 
                        columns={columns} 
                        dataSource={filteredProjects} 
                        rowKey="id" 
                        pagination={{ pageSize: 5 }}
                        locale={{ emptyText: <Empty description="لا توجد مشاريع حالياً" /> }}
                    />
                )}
            </Card>

            <Modal
                title={editingProject ? 'تعديل مشروع' : 'إضافة مشروع جديد'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                okText="حفظ"
                cancelText="إلغاء"
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="اسم المشروع" rules={[{ required: true, message: 'يرجى إدخال اسم المشروع' }]}>
                        <Input placeholder="مثال: تطوير تطبيق الجوال" />
                    </Form.Item>
                    <Form.Item name="description" label="وصف المشروع">
                        <Input.TextArea placeholder="اكتب وصفاً مختصراً للمشروع هنا..." rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProjectsPage;
