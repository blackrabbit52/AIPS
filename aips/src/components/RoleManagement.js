import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    message,
    Space,
    Popconfirm,
    Tag
} from 'antd';
import authService from '../services/authService';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        try {
            const data = await authService.getAllRoles();
            setRoles(data);
        } catch (error) {
            message.error('Failed to load roles');
        }
    };

    const handleCreateRole = async (values) => {
        try {
            await authService.createRole(values);
            message.success('Role created successfully');
            setIsModalVisible(false);
            form.resetFields();
            loadRoles();
        } catch (error) {
            message.error('Failed to create role');
        }
    };

    const handleDeleteRole = async (id) => {
        try {
            await authService.deleteRole(id);
            message.success('Role deleted successfully');
            loadRoles();
        } catch (error) {
            message.error('Failed to delete role');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Permissions',
            dataIndex: 'permissions',
            key: 'permissions',
            render: (permissions) => (
                <Space>
                    {permissions.map(permission => (
                        <Tag key={permission} color="blue">
                            {permission}
                        </Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="link" onClick={() => handleEditRole(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this role?"
                        onConfirm={() => handleDeleteRole(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Button
                type="primary"
                onClick={() => setIsModalVisible(true)}
                style={{ marginBottom: 16 }}
            >
                Create Role
            </Button>

            <Table
                columns={columns}
                dataSource={roles}
                rowKey="id"
            />

            <Modal
                title="Create Role"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={handleCreateRole}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label="Role Name"
                        rules={[{ required: true, message: 'Please input role name!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item
                        name="permissions"
                        label="Permissions"
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select permissions"
                        >
                            <Select.Option value="user:read">Read Users</Select.Option>
                            <Select.Option value="user:create">Create Users</Select.Option>
                            <Select.Option value="user:update">Update Users</Select.Option>
                            <Select.Option value="user:delete">Delete Users</Select.Option>
                            <Select.Option value="role:read">Read Roles</Select.Option>
                            <Select.Option value="role:create">Create Roles</Select.Option>
                            <Select.Option value="role:update">Update Roles</Select.Option>
                            <Select.Option value="role:delete">Delete Roles</Select.Option>
                            <Select.Option value="role:assign">Assign Roles</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Create
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RoleManagement; 