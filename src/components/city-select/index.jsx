import React, { Component } from 'react'
import { createForm } from 'rc-form'
import { Cascader } from 'antd'
import getCity from './addressData'
import PropTypes from 'prop-types'

//先配置修饰器 没有配置的话用把 @createForm()删掉
//然后把最后一行 export default CitySelect;  换成 export default createForm()(CitySelect)
@createForm()
class CitySelect extends Component {
  // props类型检查
  static propTypes = {
    //  监听选择
    onChange: PropTypes.func,
    // 获取选择值
    getSelectedValues: PropTypes.func,
    // 默认值
    value: PropTypes.array,
    style: PropTypes.object,
    labelInValue: PropTypes.bool,
    type: PropTypes.string,
    form: PropTypes.object
  }
  constructor (props) {
    super(props)
    this.city = getCity(props.type)
  }
  onCascaderChange = (selectedValues) => {
    const {
      onChange,
      getSelectedValues,
      labelInValue = false
    } = this.props
    const result = []
    // 递归查询城市所有数据
    function findCityData (city) {
      city.forEach((item) => {
        const { label, value, children } = item
        if (selectedValues.includes(value)) {
          result.push({ label, value })
        }
        if (children && children.length) {
          findCityData(children)
        }
      })
    }
    findCityData(this.city)
    console.log(result, 'result')
    // 分发监听
    if (onChange) {
      onChange(labelInValue ? result : selectedValues)
    }
    getSelectedValues && getSelectedValues(result)
  }

  componentDidMount () {
    const {
      form: { setFieldsValue },
      value: selectedValues
    } = this.props

    if (!selectedValues || !selectedValues.length) {
      return
    }

    const result = []
    // 递归查询城市名称数据
    function findLabel (children) {
      children.forEach((item) => {
        const { label, value, children } = item
        if (selectedValues.includes(label)) {
          result.push(value)
        }
        if (children && children.length) {
          findLabel(children)
        }
      })
    }
    // 卡省份解决县或市名称一样的问题
    this.city.forEach((item) => {
      const { label, value, children } = item
      if (selectedValues.includes(label)) {
        result.push(value)
        if (children && children.length) {
          findLabel(children)
        }
      }
    })
    // 设置默认值
    setFieldsValue({ city: result })
  }

  render () {
    const { style = null, labelInValue, value = [] } = this.props
    let cascaderValue = []
    if (labelInValue) {
      cascaderValue = value.map(item => item.value)
    } else {
      cascaderValue = value
    }
    return (
      <div style={style}>
        <Cascader
          options={this.city}
          // {...getFieldProps("city", {
          //   initialValue: this.props.value,
          //   onChange: this.onCascaderChange,
          //   rules: [{ required: true }]
          // })}
          value={cascaderValue}
          onChange={this.onCascaderChange}
          placeholder='请选择城市'
        />
      </div>
    )
  }
}

export default CitySelect
