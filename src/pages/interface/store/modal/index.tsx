import React from 'react'
import CouponModal from '@/components/coupon-modal'
interface State {
  visible: boolean
  selectedRowKeys: any
}

export interface Payload {
  success?: any
}
export interface ModalProps {
  show(payload: Payload,rows:any): void
  hide: () => void
}

function Main (WrappedComponent: React.ComponentType<any>) {
  return class extends React.Component<any, State> {
    public state: State = {
      visible: false,
      selectedRowKeys: []
    }
    public payload: Payload = {
      success: () => {},

    }
    public modal: ModalProps = {
      show: (payload: Payload,rows: any) => {
        this.payload = payload
        let selectedRowKeys: any[]=[]
        rows&&rows.map((item: any)=>{
          item.id=item.couponId||item.id
          selectedRowKeys.push(parseInt(item.id))
        })
        console.log(selectedRowKeys,'1111')
        this.setState({ 
          visible: true, 
          selectedRowKeys
        })
      },
      hide: () => {
        this.setState({ visible: false })
      },
    }
    public render () {
      const { visible, selectedRowKeys } = this.state
      console.log(selectedRowKeys,'1111')
      return (
        <>
          <CouponModal
            selectedRowKeys={selectedRowKeys}
            type='checkbox'
            processPayload={(payload: any) => {
              payload.isDelete = undefined
              payload.receivePattern = undefined
              return payload
            }}
            maxCheckedNum={3}
            visible={visible}
            onCancel={this.modal.hide}
            onOk={(ids, rows) => {
              this.setState({
                selectedRowKeys: ids
              }, this.payload.success.bind(null, rows, this.modal.hide))
            }}
          />
          <WrappedComponent modal={this.modal} {...this.props}/>
        </>
      )
    }
  }
}
export default Main