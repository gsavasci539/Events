import { useState } from 'react';
import { Card, Row, Col, Avatar, Button, message, Tag, Form, Input, Select } from 'antd';
import { UserOutlined, MailOutlined, IdcardOutlined, TeamOutlined, EditOutlined, PhoneOutlined, CalendarOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useAuth } from '@/store/auth';
import { useNavigate } from 'react-router-dom';
import { usersService } from '@/services/users';

const { Option } = Select;

const ProfilePage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm] = Form.useForm();

  if (!user) {
    return null;
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      editForm.resetFields();
      setIsEditing(false);
    } else {
      // Start editing
      editForm.setFieldsValue({
        full_name: user.full_name || '',
        email: user.email,
        role: user.role
      });
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async (values: any) => {
    setLoading(true);
    try {
      // Update user profile in backend
      const updatePayload: any = {
        full_name: values.full_name,
        email: values.email
      };

      // Only include role if user is superadmin
      if (user.role === 'superadmin' && values.role) {
        updatePayload.role = values.role;
      }

      const updatedUser = await usersService.update(user.id, updatePayload);

      // Update user context with new data
      login(localStorage.getItem('token') || '', {
        id: updatedUser.id,
        email: updatedUser.email,
        full_name: updatedUser.full_name || undefined,
        role: updatedUser.role
      });

      message.success('Profil bilgileriniz başarıyla güncellendi!');
      setIsEditing(false);

    } catch (error) {
      console.error('Profile update error:', error);
      message.error('Profil güncelleme işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Get full name from database fullname field
  const getFullName = () => {
    if (user.full_name && user.full_name.trim() !== '') {
      return user.full_name;
    }
    // Fallback to email username if no full_name
    return user.email.split('@')[0];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Profil Bilgileri</h1>
        <Button
          type={isEditing ? "default" : "primary"}
          icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
          onClick={handleEditToggle}
          className={isEditing ? "border-red-500 text-red-500 hover:bg-red-50" : "herbalife-button-primary"}
        >
          {isEditing ? 'İptal' : 'Düzenle'}
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card className="text-center herbalife-card">
            <Avatar
              size={120}
              className="bg-primary-500 text-white mb-4 herbalife-button-primary"
            >
              {getFullName() !== user.email.split('@')[0] ? getInitials(getFullName()) : <UserOutlined />}
            </Avatar>
            <h2 className="text-lg font-semibold mb-2">
              {getFullName()}
            </h2>
            <Tag
              color={user.role === 'superadmin' ? 'orange' : 'green'}
              className="mb-2"
            >
              {user.role === 'superadmin' ? 'Super Admin' : 'Distributor'}
            </Tag>
            <p className="text-gray-500 capitalize flex items-center justify-center">
              <TeamOutlined className="mr-2" />
              {user.role}
            </p>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Kişisel Bilgiler" className="herbalife-card">
            {isEditing ? (
              <Form
                form={editForm}
                layout="vertical"
                onFinish={handleSaveProfile}
                initialValues={{
                  full_name: user.full_name || '',
                  email: user.email,
                  role: user.role
                }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Ad Soyad"
                      name="full_name"
                      rules={[
                        { required: true, message: 'Ad soyad gerekli!' },
                        { pattern: /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, message: 'Ad soyad sadece harf ve boşluk içerebilir!' },
                        { min: 2, message: 'Ad soyad en az 2 karakter olmalıdır!' },
                        { max: 50, message: 'Ad soyad en fazla 50 karakter olabilir!' }
                      ]}
                    >
                      <Input placeholder="Adınızı ve soyadınızı girin" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="E-posta"
                      name="email"
                      rules={[
                        { required: true, message: 'E-posta gerekli!' },
                        { type: 'email', message: 'Geçerli bir e-posta adresi girin!' }
                      ]}
                    >
                      <Input placeholder="E-posta adresinizi girin" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Rol"
                      name="role"
                    >
                      <Select disabled={user.role !== 'superadmin'}>
                        <Option value="distributor">Dağıtıcı</Option>
                        <Option value="superadmin">Super Admin</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Kullanıcı ID"
                    >
                      <Input value={user.id} disabled />
                    </Form.Item>
                  </Col>
                </Row>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    icon={<CloseOutlined />}
                    onClick={handleEditToggle}
                    disabled={loading}
                  >
                    İptal
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    htmlType="submit"
                    loading={loading}
                    className="herbalife-button-primary"
                  >
                    Kaydet
                  </Button>
                </div>
              </Form>
            ) : (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <UserOutlined className="text-primary-500 mr-3 text-lg" />
                    <div>
                      <div className="text-sm text-gray-500">Ad Soyad</div>
                      <div className="font-medium">{getFullName()}</div>
                    </div>
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <MailOutlined className="text-primary-500 mr-3 text-lg" />
                    <div>
                      <div className="text-sm text-gray-500">E-posta</div>
                      <div className="font-medium">{user.email}</div>
                    </div>
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <IdcardOutlined className="text-primary-500 mr-3 text-lg" />
                    <div>
                      <div className="text-sm text-gray-500">Kullanıcı ID</div>
                      <div className="font-medium">#{user.id}</div>
                    </div>
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <TeamOutlined className="text-primary-500 mr-3 text-lg" />
                    <div>
                      <div className="text-sm text-gray-500">Rol</div>
                      <div className="font-medium capitalize">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${user.role === 'superadmin' ? 'bg-secondary-500' : 'bg-primary-500'}`}></span>
                        {user.role === 'superadmin' ? 'Super Admin' : 'Distributor'}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            )}
          </Card>

          <Card title="Hesap Bilgileri" className="herbalife-card mt-4">
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Son Giriş</div>
                <div className="font-medium">Bugün</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Üyelik Tarihi</div>
                <div className="font-medium">Ocak 2024</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Hesap Durumu</div>
                <div className="font-medium text-green-600 flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full mr-2 bg-green-500"></span>
                  Aktif
                </div>
              </div>
            </div>
          </Card>

          <Card title="Sistem Bilgileri" className="herbalife-card mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Kullanıcı Türü</div>
                <div className="font-medium">{user.role === 'superadmin' ? 'Yönetici' : 'Dağıtıcı'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Oturum Durumu</div>
                <div className="font-medium text-green-600">Aktif Oturum</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Profil Tamamlanma</div>
                <div className="font-medium">
                  {user.full_name ? '100%' : '75%'} Tamamlandı
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Son Güncelleme</div>
                <div className="font-medium">Bugün</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
