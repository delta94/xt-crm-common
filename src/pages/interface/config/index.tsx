import React from 'react'
import { Form, Input, Button, Row, Col } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import * as api from './api'
import UploadView from '../../../components/upload';
import { initImgList } from '@/util/utils';
interface Props extends FormComponentProps {}
interface State {
  title: string,//标题
  iconBackgroudImg: string, //icon背景图
  iconColor: string, //icon文字颜色
  navigationBackgroudImg: string //导航栏背景图
}
const replaceHttpUrl = (imgUrl: string ) => {
  return imgUrl.replace('https://assets.hzxituan.com/', '').replace('https://xituan.oss-cn-shenzhen.aliyuncs.com/', '');
}

const formLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
};
class Main extends React.Component<Props, State> {
  public constructor (props: Props) {
    super(props)
    this.onSubmit = this.onSubmit.bind(this)
  }
  public state: State = {
    title: '', 
    iconBackgroudImg: 'string',
    iconColor: 'string',
    navigationBackgroudImg: 'string'
  }
  public componentDidMount () {
    //获取详情信息
    api.getHomeStyle().then((res: any) => {
      console.log('getHomeStyle', res)
      this.setState({
        title: res.title,
        iconBackgroudImg: res.iconBackgroudImg,
        iconColor: res.iconColor,
        navigationBackgroudImg: res.navigationBackgroudImg
      })
    })
  }
  //提交
  public onSubmit () {
    this.props.form.validateFields((err, value) => {
      if (err) {
        return
      }
    
      
      const params = {
        title: value.title,
        iconBackgroudImg: value.iconBackgroudImg && replaceHttpUrl(value.iconBackgroudImg[0].durl),
        iconColor: value.iconColor,
        navigationBackgroudImg: value.navigationBackgroudImg && replaceHttpUrl(value.navigationBackgroudImg[0].durl),
      }
      console.log('params', params)
      
      api.editHomeStyle( params ).then((res) => {
        console.log('保存成功', res)
        APP.success('保存成功')
      })
    })
  }
  
  public render () {
    const { getFieldDecorator } = this.props.form
    const { title, iconBackgroudImg, iconColor, navigationBackgroudImg } = this.state
    
    return (
      <div
        style={{
          background: '#FFFFFF',
          padding: 20,
          minHeight: 400
        }}
      >
        <Form
          {...formLayout}
          onSubmit={this.onSubmit}
        >
          <Form.Item label='标题' required={true}>
            {
              getFieldDecorator('title', {
                initialValue: title,
                rules: [{
                  required: true,
                  message: '标题不能为空'
                }]
              })(
                <Input placeholder="请输入标题" />
              )
            }
          </Form.Item>
          <Form.Item label="导航栏背景图" required={true}>
            {getFieldDecorator('navigationBackgroudImg', {
              initialValue: initImgList(navigationBackgroudImg),
              rules: [
                {
                  required: true,
                  message: '请上传导航栏背景图'
                },
              ],
            })(<UploadView accept=".jpg, .jpeg, .png" placeholder="上传背景图图" listType="picture-card" listNum={1} size={.3} />)}
            <div>
              1、该背景图主要用在首页顶部导航栏，必填项。<br/>
              2、图片格式支持png、jpg、gif格式。<br/>
              3、图片尺寸为XX，大小不超过Xkb。
            </div>
          </Form.Item>
          <Form.Item label="icon背景图" >
            {getFieldDecorator('iconBackgroudImg', {
              initialValue: initImgList(iconBackgroudImg),
              rules: [
                {
                  required: false,
                  message: '图片格式不正确'
                },
              ],
            })(<UploadView accept=".jpg, .jpeg, .png" placeholder="上传icon图" listType="picture-card" listNum={1} size={.3} />)}
            <div>
              1、该背景图主要用在首页icon区域，非必填项，默认白色背景图<br/>
              2、图片格式支持png、jpg、gif格式。。<br/>
              3、图片尺寸为XX，大小不超过Xkb。
            </div>
          </Form.Item>
          <Form.Item label='icon名称色值：'>
            {
              getFieldDecorator('iconColor', {
                initialValue: iconColor,
                rules: [{
                  required: true,
                  message: 'icon名称值不正确'
                }]
              })(
                <Input maxLength={7} placeholder="请输入首页icon名称的色值，如#333333" />
              )
            }
            <div>
                <p>1.该色值主要用在首页icon名称，必填项，默认黑色#333333。</p>
                <p>2.色值范围是#000000~#FFFFFF。</p>
            </div>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">保 存</Button>
          </Form.Item>
        </Form>
      </div>
    )
  }
}
export default Form.create()(Main)