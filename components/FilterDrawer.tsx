import React from 'react';
import { Drawer, Form, Input, Select, Button, Slider, Space } from 'antd';
import { useTokenStore } from '../stores/useTokenStore';

interface FilterDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const { setFilters } = useTokenStore();

  const handleApply = () => {
    const values = form.getFieldsValue();
    setFilters({
      category: values.category,
      priceRange: values.priceRange,
      marketCapRange: values.marketCapRange,
      search: values.search,
    });
    onClose();
  };

  return (
    <Drawer
      title="Filter Tokens"
      placement="bottom"
      onClose={onClose}
      open={visible}
      height={400}
      extra={
        <Space>
          <Button
            onClick={() => {
              form.resetFields();
              setFilters({});
            }}
          >
            Reset
          </Button>
          <Button type="primary" onClick={handleApply}>
            Apply
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item name="category" label="Category">
          <Select
            mode="multiple"
            placeholder="Select categories"
            options={[
              { label: 'Memecoin', value: 'memecoin' },
              { label: 'DeFi', value: 'defi' },
              { label: 'Altcoin', value: 'altcoin' },
              { label: 'Bitcoin', value: 'bitcoin' },
            ]}
          />
        </Form.Item>
        <Form.Item name="priceRange" label="Price Range (USD)">
          <Slider range min={0} max={150000} step={1000} defaultValue={[0, 150000]} />
        </Form.Item>
        <Form.Item name="marketCapRange" label="Market Cap Range (USD)">
          <Slider
            range
            min={0}
            max={3000000000000}
            step={100000000}
            defaultValue={[0, 3000000000000]}
          />
        </Form.Item>
        <Form.Item name="search" label="Search">
          <Input placeholder="Search by name or symbol" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default FilterDrawer;