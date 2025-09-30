import { useState, useEffect } from 'react';
import { Card, Tabs, TabsProps, message, Form, Input, Button } from 'antd';
import { UserOutlined, NotificationOutlined, LockOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuth } from '@/store/auth';
import { NotificationSettingsForm } from '@/components/settings/NotificationSettingsForm';

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(false);
  const [passwordForm] = Form.useForm();

  if (!user) {
    return null;
  }

  const handlePasswordChange = async (values: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Here you would make an API call to change the password
      // const response = await fetch('/api/user/change-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values)
      // });

      message.success('Şifreniz başarıyla değiştirildi!');
      passwordForm.resetFields();
    } catch (error) {
      message.error('Şifre değiştirme işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const tabItems: TabsProps['items'] = [
    {
      key: 'notifications',
      label: (
        <span>
          <NotificationOutlined />
          <span>Bildirim Ayarları</span>
        </span>
      ),
      children: <NotificationSettingsForm />,
    },
  ];

  // Add profile tab for all users
  tabItems.unshift({
    key: 'profile',
    label: (
      <span>
        <UserOutlined />
        <span>Profil Bilgileri</span>
      </span>
    ),
    children: (
      <Card title="Profil Bilgileri" className="herbalife-card">
        <div className="space-y-4">
          <div>
            <div className="font-medium text-gray-500">Ad Soyad</div>
            <div className="text-lg">{(user as any)?.full_name || 'Belirtilmemiş'}</div>
          </div>
          <div>
            <div className="font-medium text-gray-500">E-posta</div>
            <div className="text-lg">{user.email}</div>
          </div>
          <div>
            <div className="font-medium text-gray-500">Rol</div>
            <div className="text-lg capitalize">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${user.role === 'superadmin' ? 'bg-secondary-500' : 'bg-primary-500'}`}></span>
              {user.role}
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-500">Kullanıcı ID</div>
            <div className="text-lg">{user.id}</div>
          </div>
        </div>
      </Card>
    ),
  });

  // Add password change tab for all users
  tabItems.push({
    key: 'password',
    label: (
      <span>
        <LockOutlined />
        <span>Şifre Değiştir</span>
      </span>
    ),
    children: (
      <Card title="Şifre Değiştir" className="herbalife-card">
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
          className="max-w-md"
        >
          <Form.Item
            label="Mevcut Şifre"
            name="currentPassword"
            rules={[
              { required: true, message: 'Lütfen mevcut şifrenizi girin!' },
              { min: 6, message: 'Şifre en az 6 karakter olmalıdır!' }
            ]}
          >
            <Input.Password
              placeholder="Mevcut şifrenizi girin"
              iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            label="Yeni Şifre"
            name="newPassword"
            rules={[
              { required: true, message: 'Lütfen yeni şifrenizi girin!' },
              { min: 6, message: 'Şifre en az 6 karakter olmalıdır!' },
              { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir!' }
            ]}
          >
            <Input.Password
              placeholder="Yeni şifrenizi girin"
              iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            label="Yeni Şifre Tekrar"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Lütfen yeni şifrenizi tekrar girin!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Şifreler eşleşmiyor!'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Yeni şifrenizi tekrar girin"
              iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="herbalife-button-primary w-full"
            >
              Şifreyi Değiştir
            </Button>
          </Form.Item>
        </Form>
      </Card>
    ),
  });

  return (
    <div className="container mx-auto p-3 sm:p-4 lg:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Hesap Ayarları</h1>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabPosition="left"
        items={tabItems}
        className="bg-white p-3 sm:p-4 rounded-lg shadow-herbalife herbalife-card"
      />
    </div>
  );
};

export default SettingsPage;
