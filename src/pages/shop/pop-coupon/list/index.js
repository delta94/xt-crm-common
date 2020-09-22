import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Form } from 'antd'
import { getCouponlist, getCouponDetail } from '../api'
import { getListColumns } from '../config'
import emitter from '@/util/events'
import { defaultConfig } from './config'
import CouponCardModal from '../coupon-card-modal'
import { ListPage, FormItem } from '@/packages/common/components'
import './index.scss'

function CouponList ({ form: { getFieldDecorator, getFieldsValue, resetFields }, history, match }) {
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pageSize: 10
  })
  const listRef = useRef(null)
  const [records, setRecords] = useState([])
  const [info, setInfo] = useState(null)
  const [visible, setVisible] = useState(false)
  const setModalVisible = async ({ visible, id }) => {
    const info = await getCouponDetail(id)
    setInfo(info)
    setVisible(visible)
  }
  useEffect(() => {
    console.log('pagination变了=>', pagination.page, pagination.pageSize)
    emitter.addListener('coupon.list.setVisible', setModalVisible)
    emitter.addListener('coupon.list.fetchData', () => listRef.list.refresh())
    return () => {
      emitter.removeListener('coupon.list.setVisible', setModalVisible)
      emitter.removeListener('coupon.list.fetchData', () => listRef.list.refresh())
    }
  }, [pagination.page, pagination.pageSize])
  return (
    <>
      {info && <CouponCardModal info={info} visible={visible} setVisible={setVisible} />}
      <ListPage
        namespace='coupon'
        reserveKey='coupon'
        formItemLayout={(
          <>
            <FormItem name='code' />
            <FormItem name='name' />
            <FormItem name='status' />
          </>
        )}
        tableProps={{
          scroll: {
            x: true
          }
        }}
        getInstance={ref => listRef.list = ref}
        formConfig={defaultConfig}
        api={getCouponlist}
        columns={getListColumns()}
      />
    </>
  )
}

CouponList.propTypes = {
  form: PropTypes.object,
  history: PropTypes.object,
  match: PropTypes.object

}
export default Form.create()(CouponList)