import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, Tag, Space, Card, Skeleton, Empty, Breadcrumb, App as AntdApp } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowRightOutlined, CheckCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { getTasks, addTask, updateTask, deleteTask } from '../api';

const { Option } = Select;

const TasksPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [form] = Form.useForm();
    
    // استخدام نظام الإشعارات الجديد
    const { message: messageApi } = AntdApp.useApp();

    useEffect(() => {
        fetchTasks();
    }, [projectId, filterStatus]);

    const fetchTasks = async () => {
        const hideLoading = messageApi.loading('جاري تحميل المهام...', 0);
        setLoading(true);
        try {
            const res = await getTasks(projectId, filterStatus);
            setTasks(res.data);
            messageApi.success(`تم جلب ${res.data.length} مهام بنجاح`);
        } catch (error) {
            messageApi.error('فشل جلب المهام');
        } finally {
            hideLoading();
            setLoading(false);
        }
    };

    const showModal = (task = null) => {
        setEditingTask(task);
        if (task) {
            form.setFieldsValue(task);
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const values = await form.validateFields();
            if (editingTask) {
                await updateTask(editingTask.id, values);
                messageApi.success('تم تحديث المهمة');
            } else {
                await addTask({ ...values, project_id: projectId });
                messageApi.success('تم إضافة المهمة');
            }
            setIsModalVisible(false);
            fetchTasks();
        } catch (error) {
            const serverErrors = error.response?.data?.errors;
            if (serverErrors) {
                const errorMessages = Object.values(serverErrors).flat().join(' | ');
                messageApi.error(`فشل الحفظ: ${errorMessages}`);
            } else {
                messageApi.error('حدث خطأ أثناء الحفظ');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteTask(id);
            messageApi.success('تم حذف المهمة');
            fetchTasks();
        } catch (error) {
            messageApi.error('فشل الحذف');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateTask(id, { status: newStatus });
            messageApi.success('تم تحديث الحالة');
            fetchTasks();
        } catch (error) {
            messageApi.error('فشل التحديث');
        }
    };

    const getStatusTag = (status) => {
        switch (status) {
            case 'completed':
                return <Tag color="success" icon={<CheckCircleOutlined />}>مكتملة</Tag>;
            case 'in_progress':
                return <Tag color="processing" icon={<SyncOutlined spin />}>قيد التنفيذ</Tag>;
            default:
                return <Tag color="default" icon={<ClockCircleOutlined />}>قيد الانتظار</Tag>;
        }
    };

    const columns = [
        { title: 'العنوان', dataIndex: 'title', key: 'title', render: text => <strong>{text}</strong> },
        { title: 'الوصف', dataIndex: 'description', key: 'description' },
        { 
            title: 'الحالة', 
            dataIndex: 'status', 
            key: 'status',
            render: (status, record) => (
                <Select 
                    defaultValue={status} 
                    style={{ width: 130 }} 
                    onChange={(val) => handleStatusChange(record.id, val)}
                    variant="borderless"
                >
                    <Option value="pending">قيد الانتظار</Option>
                    <Option value="in_progress">قيد التنفيذ</Option>
                    <Option value="completed">مكتملة</Option>
                </Select>
            )
        },
        { 
            title: 'التصنيف', 
            dataIndex: 'status', 
            key: 'status_tag', 
            render: (status) => getStatusTag(status) 
        },
        {
            title: 'الإجراءات',
            key: 'actions',
            render: (text, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)} size="small" />
                    <Popconfirm title="حذف؟" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} danger size="small" />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '10px' }}>
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item><a onClick={() => navigate('/')}>المشاريع</a></Breadcrumb.Item>
                <Breadcrumb.Item>إدارة المهام</Breadcrumb.Item>
            </Breadcrumb>

            <Card 
                title={<span><ArrowRightOutlined onClick={() => navigate('/')} style={{ cursor: 'pointer', marginLeft: 10 }} /> تفاصيل المشروع والمهام</span>}
                extra={
                    <Space>
                        <Select 
                            placeholder="فلترة حسب الحالة" 
                            style={{ width: 180 }} 
                            value={filterStatus} 
                            onChange={setFilterStatus}
                        >
                            <Option value="">جميع الحالات</Option>
                            <Option value="pending">قيد الانتظار</Option>
                            <Option value="in_progress">قيد التنفيذ</Option>
                            <Option value="completed">مكتملة</Option>
                        </Select>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>إضافة مهمة</Button>
                    </Space>
                }
            >
                {loading && tasks.length === 0 ? (
                    <Skeleton active />
                ) : (
                    <Table 
                        columns={columns} 
                        dataSource={tasks} 
                        rowKey="id" 
                        pagination={{ pageSize: 5 }}
                        locale={{ emptyText: <Empty description="لا توجد مهام لهذا المشروع" /> }}
                    />
                )}
            </Card>

            <Modal
                title={editingTask ? 'تعديل مهمة' : 'إضافة مهمة'}
                open={isModalVisible}
                onOk={handleSave}
                onCancel={() => setIsModalVisible(false)}
                okText="حفظ"
                cancelText="إلغاء"
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="title" label="عنوان المهمة" rules={[{ required: true, message: 'عنوان المهمة مطلوب' }]}>
                        <Input placeholder="مثال: إنشاء واجهة المستخدم" />
                    </Form.Item>
                    <Form.Item name="description" label="وصف المهمة" rules={[{ required: true, message: 'الرجاء كتابة وصف للمهمة' }]}>
                        <Input.TextArea rows={3} placeholder="اشرح تفاصيل المهمة هنا..." />
                    </Form.Item>
                    <Form.Item name="status" label="الحالة" initialValue="pending">
                        <Select>
                            <Option value="pending">قيد الانتظار</Option>
                            <Option value="in_progress">قيد التنفيذ</Option>
                            <Option value="completed">مكتملة</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TasksPage;
