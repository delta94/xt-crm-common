import React from 'react';
import { Form, Card, Input, InputNumber, Radio, Button, Table, message } from 'antd';
import { ColumnProps } from 'antd/es/table';
import CascaderCity from '@/components/cascader-city';
import classnames from 'classnames';
import styles from './style.module.scss';
import { withRouter } from 'react-router';
import { radioStyle } from '@/config';
import { flatten, intersectionWith, differenceWith, isEqual } from 'lodash'
import { templateAdd, templateModify, getDetail } from './api';
import { RadioChangeEvent } from 'antd/lib/radio';
import { formatPrice } from '@/util/format';
import { rankItem, Props, State } from './interface';


const mapReqRankList = (list: rankItem[]) => {
  return list.map((item: any, index: number) => {
    let { destinationList, ...rest } = item;
    return {
      ...rest,
      cost: item.cost * 100,
      destinationList,
      rankNo: index + 1,
      describe:
        destinationList &&
        destinationList.map((v: any) => `${v.name}（${v.children.length})`).join(' '),
    };
  });
};
/**
 * 映射特定区域数组
 * {
 *  cost, // 金额
 *  describe,
 *  destinationList,
 *  rankNo,
 *  rankType
 * }[]
 * @param list 
 */
const mapTemplateData= (list: rankItem[]) => {
  return (list || []).map((item: rankItem) => {
    return {
      ...item,
      cost: item.cost && formatPrice(item.cost),
    };
  });
};

const flattenCity = (destinationList: any[]) => {
  const childArr = (destinationList || []).map(v => (v && v.children || []))
  return flatten(childArr)
}

const mapCitys = (list: rankItem[]) => {
  return (list || []).reduce((prev: any[], item: rankItem) => prev.concat(flattenCity(item.destinationList)), [])
}
class edit extends React.Component<Props, State> {
  // editIndex等于-1为添加
  editIndex: number = -1
  /** 所有市区组成的数组 */
  citys: any[] = []
  state: State = {
    visible: false,
    templateData: [],
    /** 通用省市区 */
    destinationList: [],
  };
  /**
   * 获取运费模板详情
   */
  async getDetail() {
    const res = (await getDetail(this.props.match.params.id)) || {};
    this.props.form.setFieldsValue({
      templateName: res.templateName,
      commonCost: formatPrice(res.commonCost),
    });
    let templateData = mapTemplateData(res.rankList);
    this.citys = mapCitys(res.rankList)
    this.setState({
      templateData,
    });
  }
  componentDidMount() {
    if (this.props.match.params.id) {
      this.getDetail();
    }
  }
  /**
   * 新增编辑提交
   */
  haveSave = () => {
    this.props.form.validateFields(async (errors, values) => {
      let { templateData } = this.state;
      if (!errors) {
        if (templateData.some((item: rankItem) => item.rankType === 1 && item.cost !== 0 && !item.cost)) {
          message.error('发货地区运费是必填项');
          return;
        }
        const params = {
          templateName: values.templateName,
          commonCost: values.commonCost * 100,
          rankList: mapReqRankList(templateData),
        };
        let res = false;
        let { id } = this.props.match.params;
        if (id) {
          res = await templateModify({
            freightTemplateId: id,
            ...params,
          });
        } else {
          res = await templateAdd(params);
        }
        if (res) {
          message.success('保存成功');
          this.props.history.push('/template/page');
        }
      }
    });
  };
  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const editColumns: ColumnProps<rankItem>[] = [
      {
        title: '编号',
        key: 'index',
        width: 80,
        render: (text: any, record: rankItem, index: number) => {
          return index + 1;
        }
      },
      {
        title: '目的地',
        dataIndex: 'destinationList',
        key: 'destinationList',
        render: (destinationList: any = [], record: rankItem, index: number) => {
          return (
            <div className={styles.areas}>
              <div style={{ maxWidth: '90%' }}>
                {destinationList.map((v: any) => (
                  <span key={v.id}>
                    {v.name}（{v.children.length}）
                  </span>
                ))}
              </div>
              <div className={styles.operate}>
                <Button
                  type="link"
                  onClick={() => {
                    this.setState({
                      destinationList,
                      visible: true,
                    });
                    this.editIndex = index;
                  }}
                >
                  编辑
                </Button>
              </div>
            </div>
          );
        },
      },
      {
        title: '运费/元',
        key: 'fare',
        render: (text: any, record: rankItem, index: number) => {
          return (
            <Radio.Group
              onChange={(e: RadioChangeEvent) => {
                const { templateData } = this.state;
                templateData[index].rankType = e.target.value;
                if (e.target.value === 0) {
                  templateData[index].cost = ''
                } 
                this.setState({
                  templateData,
                });
              }}
              value={record.rankType}
            >
              <Radio value={1} style={radioStyle}>
                <InputNumber
                  placeholder="请输入"
                  value={record.cost}
                  precision={2}
                  onChange={(value: any) => {
                    const { templateData } = this.state;
                    templateData[index].cost = value;
                    this.setState({
                      templateData,
                    });
                  }}
                  min={0}
                  max={9999}
                  style={{ width: 80 }}
                />
              </Radio>
              <Radio value={0} style={radioStyle}>
                不发货
              </Radio>
            </Radio.Group>
          );
        },
      },
      {
        title: '操作',
        key: 'operate',
        render: (text: any, record: rankItem, index: number) => {
          return (
            <Button
              type="link"
              onClick={() => {
                this.setState((state) => {
                  const templateData = [...state.templateData]
                  templateData.splice(index, 1)
                  return {
                    templateData 
                  }
                });
              }}
            >
              删除
            </Button>
          );
        },
      },
    ];
    return (
      <>
        <CascaderCity
          visible={this.state.visible}
          value={this.state.destinationList}
          onOk={(destinationList: any) => {
            if (Array.isArray(destinationList) && destinationList.length === 0) {
              message.error('请选择地区')
              return
            }
            const checkedCity = flattenCity(destinationList)
            /** 求交集 */
            const intersect = intersectionWith(this.citys, checkedCity, isEqual)
            const msg = intersect.map(v => v.name).join(',')
            const isIntersect = intersect.length > 0
            let { templateData } = this.state;
            /** 编辑 */
            if (this.editIndex > -1) {
              /** 编辑的市区列表 */
              const editCity = flattenCity(templateData[this.editIndex].destinationList)
              /** 求编辑行选中目的地和citys的差集 */
              const diffCitys = differenceWith(this.citys, editCity, isEqual)
              /** 再和选中市区做交集比较，如果交集长度大于0，则不可以编辑，因为重复了 */
              const intersectCity = intersectionWith(checkedCity, diffCitys, isEqual)
              /** 排除自身 */
              if (intersectCity) {
                message.error(`${msg}不能重复，请重新选择`)
                return
              }
              this.citys = this.citys.filter(city => {
                return editCity.some(item => {
                  return item.id !== city.id
                })
              })
              templateData[this.editIndex].destinationList = destinationList;
            }
            /** 添加 */
            else {
              if (isIntersect) {
                message.error(`${msg}不能重复，请重新选择`)
                return
              }
              templateData = [...templateData, { destinationList, rankType: 1, cost: '' }];
            }
            /** 求并集 */
            this.citys = this.citys.concat(checkedCity)
            this.setState({
              destinationList,
              templateData,
              visible: false,
            });
          }}
          onCancel={() => {
            this.setState({
              visible: false,
            });
          }}
        />
        <Card title="运费模板设置">
          <Form labelCol={{ span: 2 }} wrapperCol={{ span: 20 }}>
            <Form.Item label="模板名称" required={true}>
              {getFieldDecorator('templateName', {
                rules: [
                  {
                    required: true,
                    message: '请输入模板名称',
                  },
                ],
              })(<Input placeholder="请输入模板名称" style={{ width: 200 }} />)}
            </Form.Item>
            <Form.Item label="运费设置">
              <Card
                type="inner"
                title={
                  <Form.Item required={true}>
                    <span>默认运费：</span>
                    {getFieldDecorator('commonCost', {
                      rules: [
                        {
                          required: true,
                          message: '请输入默认运费',
                        },
                      ],
                    })(
                    <InputNumber
                      placeholder="请输入"
                      min={0}
                      max={9999}
                      precision={2}
                      style={{ width: 80 }}
                    />)}
                    <span className="ml10">元</span>
                  </Form.Item>
                }
              >
                <Button
                  type="primary"
                  onClick={() => {
                    this.editIndex = -1;
                    this.setState({
                      destinationList: [],
                      visible: true
                    });
                  }}
                >
                  为指定地区添加运费
                </Button>
                <Table
                  rowKey="rankNo"
                  className={classnames('mt10', styles.fare)}
                  columns={editColumns}
                  pagination={false}
                  dataSource={this.state.templateData}
                ></Table>
              </Card>
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 2 }}>
              <Button type="primary" onClick={this.haveSave}>
                保存
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </>
    );
  }
}
export default Form.create()(withRouter(edit));
