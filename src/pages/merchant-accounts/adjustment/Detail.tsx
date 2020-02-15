import React from 'react'
import { Button } from 'antd'
import If from '@/packages/common/components/if'
import Adjustment from './components/Adjustment'
import Audit from './components/Audit'
import styles from './style.module.styl'
import * as api from './api'
import { InfoResponse } from './interface'
interface Props {
  id?: number | undefined
  onOk?: () => void
  onCancel?: () => void
}

interface State {
  /** 调整单状态 10待采购审核、20待财务审核、30审核通过、40审核不通过、50已失效 */
  trimStatus?: 10 | 20 | 30 | 40 | 50
}

class Main extends React.Component<Props, State> {
  public adjustmentRef: Adjustment
  /** 采购 */
  public audit1Ref: Audit
  /** 财务 */
  public audit2Ref: Audit
  public state: State = {
  }
  public componentDidMount () {
    this.fetchData()
  }
  public fetchData () {
    const id = this.props.id
    if (id) {
      api.fetchInfo(id).then((res) => {
        this.setState({
          trimStatus: res.trimStatus
        })
        this.setValues(res)
      })
    }
  }
  public setValues (values: InfoResponse) {
    this.adjustmentRef.form.setValues(values)
  }
  public addAdjustment () {
    // api.addAdjustment()
  }
  public validateField () {
    this.adjustmentRef.form.props.form.validateFields((err, value) => {
      console.log(value, '-------')
      value = {
        ...value,
        trimImgUrl: (value.trimImgUrl || []).map((item: {url: string}) => item.url).join(','),
        trimFileUrl: (value.trimFileUrl || []).map((item: {url: string}) => item.url).join(',')
      }
      // api.addAdjustment(value).then(() => {
      //   if (this.props.onOk) {
      //     this.props.onOk()
      //   }
      // })
    })
  }
  public toAudit () {
    this.audit1Ref.form.props.form.validateFields((err, value) => {
      console.log(value, '11111111-------')
      value.trimId = this.props.id
      value.trimFileUrl = JSON.stringify(value.trimFileUrl)
      value.trimImgUrl = JSON.stringify(value.trimImgUrl)
      api.toAudit(value)
    })
  }
  public render () {
    return (
      <div className={styles.detail}>
        <div className={styles['detail-title']}>调整单信息</div>
        <Adjustment
          ref={(ref) => { this.adjustmentRef = ref as Adjustment }}
          readonly={!!this.props.id}
        />
        <If condition={true}>
          <div className={styles['detail-title']}>采购审核信息</div>
          <Audit
            ref={(ref) => { this.audit1Ref = ref as Audit }}
          />
        </If>
        <If condition={true}>
          <div className={styles['detail-title']}>财务审核信息</div>
          <Audit
            ref={(ref) => { this.audit2Ref = ref as Audit }}
          />
        </If>
        <hr style={{opacity: .3}} />
        <div className='text-right'>
          <Button
            className='mr10'
            onClick={() => {
              // this.validateField.bind(this)
              this.toAudit()
            }}
            type='primary'
          >
            确定
          </Button>
          <Button
            onClick={() => {
              if (this.props.onCancel) {
                this.props.onCancel()
              }
            }}
          >
            取消
          </Button>
        </div>
      </div>
    )
  }
}
export default Main
