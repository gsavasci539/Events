import { useEffect, useState } from 'react';
import { notificationSettingsService, NotificationSettings } from '@/services/notificationSettings';
import { Button, Card, Form, Input, Switch, Tabs, TabsProps, message } from 'antd';
import { useAuth } from '@/store/auth';

type FormValues = Partial<NotificationSettings>;

const { TabPane } = Tabs;
const { Item } = Form;
const { Password } = Input;

export const NotificationSettingsForm = () => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  const { user } = useAuth();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await notificationSettingsService.getMySettings();
      form.setFieldsValue(settings);
    } catch (error) {
      console.error('Failed to load notification settings', error);
      message.error('Bildirim ayarları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      await notificationSettingsService.updateMySettings(values);
      message.success('Bildirim ayarlarınız başarıyla güncellendi');
    } catch (error) {
      console.error('Failed to update notification settings', error);
      message.error('Bildirim ayarları güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const tabItems: TabsProps['items'] = [
    {
      key: 'email',
      label: 'E-posta Ayarları',
      children: (
        <div className="space-y-4">
          <Item name="email_enabled" valuePropName="checked">
            <Switch
              checkedChildren="Açık"
              unCheckedChildren="Kapalı"
              onChange={(checked: boolean) => form.setFieldsValue({ email_enabled: checked })}
            />
            <span className="ml-2">E-posta bildirimlerini etkinleştir</span>
          </Item>
          
          <Item noStyle shouldUpdate>
            {({ getFieldValue }) =>
              getFieldValue('email_enabled') && (
                <div className="space-y-4">
                  <Item
                    name="email_from"
                    label="Gönderen E-posta"
                    rules={[
                      { required: true, message: 'Gönderen e-posta adresi gereklidir' },
                      { type: 'email', message: 'Geçerli bir e-posta adresi giriniz' },
                    ]}
                  >
                    <Input placeholder="ornek@firma.com" />
                  </Item>
                  
                  <Item
                    name="email_server"
                    label="SMTP Sunucusu"
                    rules={[{ required: true, message: 'SMTP sunucusu gereklidir' }]}
                  >
                    <Input placeholder="smtp.firma.com" />
                  </Item>
                  
                  <Item
                    name="email_port"
                    label="Port"
                    rules={[{ required: true, message: 'Port numarası gereklidir' }]}
                  >
                    <Input type="number" placeholder="587" />
                  </Item>
                  
                  <Item name="email_username" label="Kullanıcı Adı">
                    <Input />
                  </Item>
                  
                  <Item name="email_password" label="Şifre">
                    <Password placeholder="Şifre değiştirmek istemiyorsanız boş bırakın" />
                  </Item>
                  
                  <Item name="email_use_tls" valuePropName="checked">
                    <Switch />
                    <span className="ml-2">TLS kullan</span>
                  </Item>
                </div>
              )
            }
          </Item>
        </div>
      ),
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp Ayarları',
      children: (
        <div className="space-y-4">
          <Item name="whatsapp_enabled" valuePropName="checked">
            <Switch
              checkedChildren="Açık"
              unCheckedChildren="Kapalı"
              onChange={(checked: boolean) => form.setFieldsValue({ whatsapp_enabled: checked })}
            />
            <span className="ml-2">WhatsApp bildirimlerini etkinleştir</span>
          </Item>
          
          <Item noStyle shouldUpdate>
            {({ getFieldValue }) =>
              getFieldValue('whatsapp_enabled') && (
                <div className="space-y-4">
                  <Item
                    name="twilio_account_sid"
                    label="Twilio Account SID"
                    rules={[{ required: true, message: 'Account SID gereklidir' }]}
                  >
                    <Input />
                  </Item>
                  
                  <Item
                    name="twilio_auth_token"
                    label="Twilio Auth Token"
                    rules={[{ required: true, message: 'Auth Token gereklidir' }]}
                  >
                    <Password />
                  </Item>
                  
                  <Item
                    name="twilio_phone_number"
                    label="Twilio Telefon Numarası"
                    rules={[{ required: true, message: 'Telefon numarası gereklidir' }]}
                  >
                    <Input placeholder="+901234567890" />
                  </Item>
                </div>
              )
            }
          </Item>
        </div>
      ),
    },
    {
      key: 'sms',
      label: 'SMS Ayarları',
      children: (
        <div>
          <Item name="sms_enabled" valuePropName="checked">
            <Switch
              checkedChildren="Açık"
              unCheckedChildren="Kapalı"
              onChange={(checked: boolean) => form.setFieldsValue({ sms_enabled: checked })}
            />
            <span className="ml-2">SMS bildirimlerini etkinleştir</span>
          </Item>
          <p className="text-gray-500 mt-2">
            SMS gönderimi için WhatsApp ayarlarındaki Twilio bilgileri kullanılacaktır.
          </p>
        </div>
      ),
    },
  ];

  return (
    <Card title="Bildirim Ayarları" loading={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          email_enabled: false,
          email_use_tls: true,
          whatsapp_enabled: false,
          sms_enabled: false,
        }}
      >
        <Tabs activeKey={activeTab} onChange={(key: string) => setActiveTab(key)}>
          {tabItems.map((tab) => (
            <Tabs.TabPane key={tab.key} tab={tab.label}>
              {tab.children}
            </Tabs.TabPane>
          ))}
        </Tabs>
        
        <div className="mt-6">
          <Button type="primary" htmlType="submit" loading={loading}>
            Ayarları Kaydet
          </Button>
        </div>
      </Form>
    </Card>
  );
};
