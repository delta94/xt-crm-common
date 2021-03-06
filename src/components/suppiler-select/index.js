import React, { Component } from 'react';
import { Select } from 'antd';
import { map } from 'lodash';
import { getStoreList } from './api';

const { Option } = Select;
export default class SupplierSelect extends Component {
  state = {
    supplier: [],
  };
  componentDidMount() {
    this.query();
  }
  query = () => {
    getStoreList({
      page: 1,
      pageSize: 5000,
    }).then((res = {}) => {
      this.setState({
        supplier: res.records,
      });
    });
  };
  render() {
    const { supplier } = this.state;
    return (
      <Select placeholder="全部" style={{ width: 300 }} {...this.props} showSearch
      filterOption={(inputValue, option) =>{
        return option.props.children.indexOf(inputValue) > -1;
      }}>
        <Option value="">全部</Option>
        {map(supplier, item => (
          <Option value={item.id} key={item.id}>{item.name}</Option>
        ))}
      </Select>
    );
  }
}
