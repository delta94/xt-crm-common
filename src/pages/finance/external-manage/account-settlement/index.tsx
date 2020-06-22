/**
 * 一次性财务结算外部明细
 */
import React from 'react'
import Image from '@/components/Image'
import classNames from 'classnames'
import { ListPage, Alert, FormItem } from '@/packages/common/components'
import { ListPageInstanceProps } from '@/packages/common/components/list-page'
import { AlertComponentProps } from '@/packages/common/components/alert'
import { Tag, Popconfirm, Button } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { getFieldsConfig } from './config'
import * as api from './api'
interface Props extends AlertComponentProps {
}
class Main extends React.Component<Props> {
  public listpage: ListPageInstanceProps
  public columns: any = [{
    title: '财务结算ID',
    dataIndex: 'nickName',
    width: 300
  }, {
    title: '财务结算流水',
    dataIndex: 'fansTotal',
    width: 200,
    align: 'center'
  }, {
    dataIndex: 'anchorIdentityType',
    title: '收支类型',
    width: 150
  }, {
    dataIndex: 'anchorId',
    title: '账务金额',
    width: 120,
    align: 'center'
  }, {
    dataIndex: 'anchorLevel',
    title: '账务对象类型',
    width: 100
  }, {
    dataIndex: 'anchorLevel',
    title: '账务对象ID',
    width: 100
  }, {
    dataIndex: 'anchorLevel',
    title: '分账对象名称',
    width: 100
  }, {
    dataIndex: 'anchorLevel',
    title: '原因',
    width: 100
  }, {
    dataIndex: 'anchorLevel',
    title: '创建时间',
    width: 100
  }, {
    dataIndex: 'anchorLevel',
    title: '三方处理流水',
    width: 100
  }, {
    dataIndex: 'anchorLevel',
    title: '三方处理结果',
    width: 100
  }, {
    dataIndex: 'anchorLevel',
    title: '三方处理完成时间',
    width: 100
  }]
  public refresh () {
    this.listpage.refresh()
  }
  public render () {
    return (
      <div
        style={{
          background: '#FFFFFF'
        }}
      >
        <ListPage
          getInstance={(ref) => this.listpage = ref}
          columns={this.columns}
          tableProps={{
            rowKey: 'anchorId'
          }}
          addonAfterSearch={(
            <div>
              <Button
                type='primary'
                onClick={() => {
                }}
              >
                批量导出
              </Button>
            </div>
          )}
          formConfig={getFieldsConfig()}
          formItemLayout={(
            <>
              <FormItem name='memberId' />
              <FormItem name='nickName' />
              <FormItem name='anchorIdentityType' />
              <FormItem name='anchorLevel' />
              <FormItem name='status1' />
              <FormItem name='status2' />
            </>
          )}
          api={api.getAnchorList}
        />
      </div>
    )
  }
}
export default Alert(Main)
