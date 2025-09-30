import { useState } from 'react'
import { Form, Input, Button, Switch, message } from 'antd'
import { eventsService } from '@/services/events'
import { useNavigate } from 'react-router-dom'
import MapSelector from '@/components/MapSelector'

const { TextArea } = Input

interface EventFormData {
  title: string
  description: string
  location: string
  start_time: string
  end_time: string
  is_online: boolean
  online_link: string
  location_lat: number
  location_lng: number
}

export default function EventCreate() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, address: string} | null>(null)
  const navigate = useNavigate()

  const onFinish = async (values: EventFormData) => {
    setLoading(true)
    try {
      const eventData: any = {
        ...values,
        start_time: values.start_time ? new Date(values.start_time).toISOString() : undefined,
        end_time: values.end_time ? new Date(values.end_time).toISOString() : undefined,
      }

      // Only include location coordinates for offline events
      if (!values.is_online && selectedLocation) {
        eventData.location_lat = selectedLocation.lat
        eventData.location_lng = selectedLocation.lng
      }

      await eventsService.create(eventData)
      message.success('Etkinlik başarıyla oluşturuldu!')
      navigate('/events')
    } catch (error) {
      message.error('Etkinlik oluşturulurken bir hata oluştu.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleOnlineToggle = (checked: boolean) => {
    setIsOnline(checked)
    if (checked) {
      // When switching to online, clear location data
      setSelectedLocation(null)
      form.setFieldsValue({ location: undefined })
    } else {
      // When switching to offline, clear online link
      form.setFieldsValue({ online_link: undefined })
    }
  }

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng, address })
    form.setFieldsValue({ location: address })
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6" style={{ position: 'relative', zIndex: 0 }}>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold mb-2">Yeni Etkinlik Oluştur</h1>
        <p className="text-gray-600">Etkinlik bilgilerini doldurarak yeni bir etkinlik oluşturun.</p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          is_online: false,
          location: undefined,
          online_link: undefined,
        }}
        className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Form.Item
              label="Etkinlik Başlığı"
              name="title"
              rules={[{ required: true, message: 'Etkinlik başlığı gerekli!' }]}
            >
              <Input placeholder="Etkinlik başlığını girin" />
            </Form.Item>
          </div>

          <div>
            <Form.Item label="Etkinlik Türü" name="is_online" valuePropName="checked">
              <Switch
                checkedChildren="Çevrimiçi"
                unCheckedChildren="Yüzyüze"
                onChange={handleOnlineToggle}
              />
            </Form.Item>
          </div>
        </div>

        <Form.Item
          label="Açıklama"
          name="description"
          rules={[{ required: true, message: 'Açıklama gerekli!' }]}
        >
          <TextArea
            placeholder="Etkinlik açıklamasını girin"
            rows={4}
          />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            label="Başlangıç Tarihi ve Saati"
            name="start_time"
            rules={[{ required: true, message: 'Başlangıç tarihi gerekli!' }]}
          >
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              style={{ zIndex: 1000 }}
              min={new Date().toISOString().slice(0, 16)}
            />
          </Form.Item>

          <Form.Item
            label="Bitiş Tarihi ve Saati"
            name="end_time"
          >
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              style={{ zIndex: 1000 }}
            />
          </Form.Item>
        </div>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.is_online !== currentValues.is_online}
        >
          {({ getFieldValue }) =>
            !getFieldValue('is_online') ? (
              <>
                <Form.Item
                  label="Konum"
                  name="location"
                  rules={[{ required: true, message: 'Konum gerekli!' }]}
                >
                  <Input placeholder="Etkinlik konumunu girin" />
                </Form.Item>

                <div className="mt-4">
                  <Form.Item label="Konum Seçimi">
                    <MapSelector
                      onLocationSelect={handleLocationSelect}
                      initialLocation={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : undefined}
                    />
                  </Form.Item>
                  {selectedLocation && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-700">
                        <strong>✅ Seçilen Konum:</strong> {selectedLocation.address}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Form.Item
                label="Çevrimiçi Bağlantı"
                name="online_link"
                rules={[
                  { required: true, message: 'Çevrimiçi bağlantı gerekli!' },
                  { type: 'url', message: 'Geçerli bir URL girin!' }
                ]}
              >
                <Input placeholder="Zoom, Teams veya diğer platform bağlantısını girin" />
              </Form.Item>
            )
          }
        </Form.Item>

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
          <Button onClick={() => navigate('/events')}>
            İptal
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Etkinlik Oluştur
          </Button>
        </div>
      </Form>
    </div>
  )
}
