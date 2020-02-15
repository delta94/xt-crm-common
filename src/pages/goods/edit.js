import React from 'react';
import { Modal, Card, Input, Button, message, Radio, Select, Cascader } from 'antd';
import UploadView from '@/components/upload';
import { mapTree, treeToarr, formatMoneyBeforeRequest } from '@/util/utils';
import { map, size, filter, assign, forEach, cloneDeep, split, isEmpty } from 'lodash';
import { getStoreList, setProduct, getGoodsDetial, getStrategyByCategory, getCategoryList, get1688Sku, getTemplateList } from './api';
import { getAllId, gotoPage, initImgList } from '@/util/utils';
import { radioStyle } from '@/config';
import SkuList from './components/sku';
import SupplierSelect from './components/supplier-select';
import { TemplateList } from '@/components';
import styles from './edit.module.scss';
import { Form, FormItem, If } from '@/packages/common/components';
import ProductCategory from './components/product-category';
import { detailResponse } from './sku-sale/adapter';
import { defaultConfig } from './sku-sale/config';
import ProductSeletor from './sku-sale/components/product-seletor';
import DraggableUpload from './components/draggable-upload';
const replaceHttpUrl = imgUrl => {
  return (imgUrl || '').replace('https://assets.hzxituan.com/', '').replace('https://xituan.oss-cn-shenzhen.aliyuncs.com/', '');
};

class GoodsEdit extends React.Component {
  detail = {};
  specs = [];
  state = {
    speSelect: [],
    templateOptions: [],
    spuName: [],
    spuPicture: [],
    GGName: '',
    data: [],
    propertyId1: '',
    propertyId2: '',
    productCategoryVO: {},
    noSyncList: [], // 供应商skuID，商品编码, 库存，警戒库存，
    returnContact: '',
    returnPhone: '',
    returnAddress: '',
    showImage: false,
    strategyData: null,
    productCustomsDetailVOList: [],
    supplierInfo: {},
    // 供应商列表加载状态
    fetching: false,
    productSeletorVisible: false
  };
  constructor(props) {
    super(props);
    this.id = props.match.params.id;
  }
  componentDidMount() {
    this.getCategoryList();
  }

  /** 获取商品类目 */
  getCategoryList = () => {
    getCategoryList().then(res => {
      const arr = Array.isArray(res) ? res : [];
      const categoryList = arr.map(org => mapTree(org));
      this.setState(
        {
          categoryList,
        },
        () => {
          const id = this.id
          /** 编辑 */
          if (id) {
            this.getGoodsDetial(res);
          } else {
            this.props.form.setFieldsValue({ showNum: 1 })
            getTemplateList().then(opts => {
              this.setState({ templateOptions: opts });
            })
          }
        }
      )
    })
  }
  /** 获取商品详情 */
  getGoodsDetial = list => {
    const {
      form: { setFieldsValue },
      match: {
        params: { id },
      },
    } = this.props;
    getGoodsDetial({ productId: id }).then((res = {}) => {
      const arr2 = treeToarr(list);
      this.detail = {...res}
      const categoryId =
        res.productCategoryVO && res.productCategoryVO.id
          ? getAllId(arr2, [res.productCategoryVO.id], 'pid').reverse()
          : [];
      this.specs = [
        {
          title: res.property1,
          content: [],
        },
        {
          title: res.property2,
          content: [],
        },
      ];
      let showImage = false;
      map(res.skuList, item => {
        item.costPrice = Number(item.costPrice / 100);
        item.salePrice = Number(item.salePrice / 100);
        item.marketPrice = Number(item.marketPrice / 100);
        item.cityMemberPrice = Number(item.cityMemberPrice / 100);
        item.managerMemberPrice = Number(item.managerMemberPrice / 100);
        item.areaMemberPrice = Number(item.areaMemberPrice / 100);
        item.headPrice = Number(item.headPrice / 100);
        if (item.imageUrl1) {
          showImage = true;
        }
      });
      let productImage = [];
      map(split(res.productImage, ','), (item, key) => {
        productImage = productImage.concat(initImgList(item));
      });

      let listImage = [];
      map(res.listImage ? res.listImage.split(',') : [], (item, key) => {
        listImage = listImage.concat(initImgList(item));
      });
      this.specs = this.getSpecs(res.skuList);
      this.getSupplierInfo(res.storeId);
      this.setState({
        data: res.skuList || [],
        speSelect: this.specs,
        propertyId1: res.propertyId1,
        propertyId2: res.propertyId2,
        returnContact: res.returnContact,
        returnPhone: res.returnPhone,
        returnAddress: res.returnAddress,
        showImage,
        productCustomsDetailVOList: res.productCustomsDetailVOList || []
      });
      setFieldsValue({
        productType: res.productType,
        interception: res.interception,
        showNum: res.showNum !== undefined ? res.showNum : 1,
        freightTemplateId: res.freightTemplateId ? String(res.freightTemplateId) : '',
        description: res.description,
        productCode: res.productCode,
        productId: res.productId,
        productName: res.productName,
        productShortName: res.productShortName,
        property1: res.property1,
        property2: res.property2,
        storeId: res.storeId,
        status: Number(res.status),
        bulk: res.bulk,
        weight: res.weight,
        withShippingFree: res.withShippingFree,
        coverUrl: initImgList(res.coverUrl),
        videoCoverUrl: initImgList(res.videoCoverUrl),
        videoUrl: initImgList(res.videoUrl),
        deliveryMode: res.deliveryMode,
        barCode: res.barCode,
        bannerUrl: initImgList(res.bannerUrl),
        returnPhone: res.returnPhone,
        listImage,
        productImage,
        storeProductId: res.storeProductId,
        categoryId,
        isAuthentication: res.isAuthentication,
        isCalculateFreight: res.isCalculateFreight
      });
      this.getStrategyByCategory(categoryId[0]);
      getTemplateList().then(opts => {
        const isRepeat = opts.some(opt => opt.freightTemplateId === res.freightTemplateId)
        if (!isRepeat && res.freightTemplateId) {
          opts = opts.concat({
            freightTemplateId: res.freightTemplateId,
            templateName: res.freightTemplateName
          })
        }
        this.setState({ templateOptions: opts });
      })
    })
  }

  //通过类目id查询是否有定价策略
  getStrategyByCategory = (categoryId) => {
    getStrategyByCategory({ categoryId })
      .then(strategyData => {
        this.setState({
          strategyData
        })
    })
  }

  /** 获取规格结婚 */
  getSpecs(skuList = []) {
    const specs = this.specs
    specs.map((item) => {
      item.content = []
      return item
    })
    map(skuList, (item, key) => {
      if (
        item.propertyValue1 &&
        specs[0] &&
        specs[0].content.findIndex(val => val.specName === item.propertyValue1) === -1
      ) {
        specs[0].content.push({
          specName: item.propertyValue1,
          specPicture: item.imageUrl1,
        });
      }
      if (
        item.propertyValue2 &&
        specs[1] &&
        specs[1].content.findIndex(val => val.specName === item.propertyValue2) === -1
      ) {
        specs[1].content.push({
          specName: item.propertyValue2,
        });
      }
    });
    this.specs = filter(specs, item => !!item.title);
    return this.specs;
  }
  // 根据供应商ID查询供应商信息
  getSupplierInfo = (id) => {
    getStoreList({ pageSize: 5000, id }).then(res => {
      const records = res.records || []
      let supplierInfo = {}
      if (records.length >= 1) {
        supplierInfo = records[0];
      }
      this.setState({
        supplierInfo,
        interceptionVisible: supplierInfo.category == 1 ? false : true,
      })
    })
  }
  sync1688Sku = () => {
    const {
      form: { validateFields },
    } = this.props;
    validateFields((err, vals) => {
      if(!vals.storeProductId) return;
      get1688Sku(vals.storeProductId).then(data=>{
        // showImage={this.state.showImage}
        if (!data) {
          return
        }
        this.specs = [
          {
            title: data.attributeName1,
            content: []
          },
          {
            title: data.attributeName2,
            content: []
          }
        ]
        const skus = (data.skus || []).map((item) => {
          return {
            ...item,
            stock: item.inventory,
            storeProductSkuId: item.storeSkuId,
            deliveryMode:2
          }
        })
        this.specs = this.getSpecs(skus);
        this.setState({
          speSelect: this.specs,
          data: skus
        })
      })
    })
  }

  /**
   * 新增/编辑操作
   */
  handleSave = (status) => {
    const {
      form: { validateFields },
      match: {
        params: { id },
      },
    } = this.props;

    const { speSelect, data, propertyId1, propertyId2 } = this.state;

    validateFields((err, vals) => {
      if (err) {
        APP.error('请检查输入项')
        return
      }
      vals.freightTemplateId = +vals.freightTemplateId
      if (err) {
        APP.error('请检查必填项')
        return
      }
      if (!err) {
        if (speSelect.find((item) => { return item.content.length === 0 })) {
          APP.error('请添加商品规格')
          return
        }
        if (size(speSelect) === 0) {
          message.error('请添加规格');
          return false;
        }

        if (size(data) === 0) {
          message.error('请添加sku项');
          return false;
        }
        if (vals.withShippingFree === 0 && !vals.freightTemplateId) {
          message.error('请选择运费模板');
          return;
        }
        const property = {};
        if (id) {
          assign(property, {
            propertyId1,
            propertyId2: speSelect[1] && propertyId2,
          });
        }
        // let isExistImg = true
        // let isNotExistImg = true
        const skuAddList = forEach(cloneDeep(data), item => {
          // if (item.imageUrl1) {
          //   isNotExistImg = false
          // }
          // if (!item.imageUrl1) {
          //   isExistImg = false
          // }
          item.imageUrl1 = replaceHttpUrl(item.imageUrl1);
          item.costPrice = formatMoneyBeforeRequest(item.costPrice);
          item.salePrice = formatMoneyBeforeRequest(item.salePrice);
          item.marketPrice = formatMoneyBeforeRequest(item.marketPrice);
          item.cityMemberPrice = formatMoneyBeforeRequest(item.cityMemberPrice);
          item.managerMemberPrice = formatMoneyBeforeRequest(item.managerMemberPrice);
          item.areaMemberPrice = formatMoneyBeforeRequest(item.areaMemberPrice);
          item.headPrice = formatMoneyBeforeRequest(item.headPrice);
        });
        /** isNotExistImg为false存在图片上传, isExistImg为false存在未上传图片*/
        // if (!isNotExistImg && !isExistImg) {
        //   APP.error('存在未上传的商品图')
        //   return
        // }
        const productImage = [];
        map(vals.productImage, item => {
          productImage.push(replaceHttpUrl(item.url));
        });

        const listImage = [];
        map(vals.listImage, item => {
          listImage.push(replaceHttpUrl(item.url));
        });
        /** 推送至仓库中即为下架，详情和列表页状态反了 */
        vals.status =  status === undefined ? vals.status : status
        for (let item of skuAddList) {
          if (!+item.marketPrice || !+item.costPrice || !+item.salePrice || !+item.headPrice || !+item.areaMemberPrice || !+item.cityMemberPrice || !+item.managerMemberPrice) {
            return void APP.error('市场价、成本价、销售价、团长价、社区管理员价、城市合伙人价、公司管理员价必填且不能为0');
          }
        }
        const params = {
          ...vals,
          returnContact: this.state.returnContact,
          returnPhone: this.state.returnPhone,
          returnAddress: this.state.returnAddress,
          property1: speSelect[0] && speSelect[0].title,
          property2: speSelect[1] && speSelect[1].title,
          skuAddList,
          coverUrl: vals.coverUrl && replaceHttpUrl(vals.coverUrl[0].url),
          videoCoverUrl:
            vals.videoCoverUrl && vals.videoCoverUrl[0]
              ? replaceHttpUrl(vals.videoCoverUrl[0].url)
              : '',
          videoUrl: vals.videoUrl && vals.videoUrl[0] ? replaceHttpUrl(vals.videoUrl[0].url) : '',
          listImage: listImage.join(','),
          productImage: productImage.join(','),
          ...property,
          bannerUrl: vals.bannerUrl && replaceHttpUrl(vals.bannerUrl[0].url),
          categoryId: Array.isArray(vals.categoryId) ? vals.categoryId[2] : '',
        };
        setProduct({ productId: id, ...params }).then(res => {
          if (!res) return;
          if (id) {
            res && message.success('编辑数据成功');
          } else {
            res && message.success('添加数据成功');
          }
          gotoPage('/goods/list');
        });
      }
    });
  };
  handleDeleteAll = () => {
    Modal.confirm({
      title: '提示',
      content: '确认要删除全部图片吗?',
      onOk: () => {
        this.props.form.setFieldsValue({ listImage: [] });
      },
    });
  };
  isShowDeleteAll = () => {
    const listImage = this.props.form.getFieldValue('listImage');
    return listImage && listImage.length > 0;
  };
  handleInput = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    })
  }

  supplierChange = (value, options) => {
    let data = this.state.data
    const { form: { resetFields, getFieldsValue, setFieldsValue } } = this.props;
    const currentSupplier = options.find(item => item.id === value) || {};
    const { category } = currentSupplier
    let { productType } = getFieldsValue()
    if (category === 1) {
      resetFields('interception');
      this.setState({
        interceptionVisible: false
      })
    } else {
      resetFields('interception', '0');
      this.setState({
        interceptionVisible: true
      })
    }
    if (currentSupplier.category === 3) {
      productType = 10
    }
    // 普通供应商商品类型为0
    productType = [3, 4].indexOf(currentSupplier.category) > -1 ? productType : 0
    if (category === 4) {
      productType = 20
      this.props.form.setFieldsValue({isAuthentication: 1})
    } else if (category === 3) {
      productType = productType === 20 ? 0 : productType
      this.props.form.setFieldsValue({
        isAuthentication: 1
      })
    }
    setFieldsValue({
      productType
    })
    if (currentSupplier.category === 4) {
      data = data.map((item) => {
        return {
          ...item,
          deliveryMode: productType === 20 ? 4 : (item.deliveryMode === 4 ? 2 : item.deliveryMode)
        }
      })
    } else {
      data = data.map((item) => {
        return {
          ...item,
          deliveryMode: item.deliveryMode === 4 ? 2 : item.deliveryMode
        }
      })
    }
    this.setState({
      data,
      supplierInfo: currentSupplier
    })
  }
  // 校验商品条码
  checkBarCode = () => {}
  // 校验库存商品ID
  checkBaseProductId = () => {}
  render() {
    const { getFieldDecorator, getFieldsValue } = this.props.form;
    const { interceptionVisible, productSeletorVisible, productCustomsDetailVOList, supplierInfo } = this.state;
    const {
      match: {
        params: { id },
      },
    } = this.props;
    const { productType, status } = getFieldsValue()
    console.log(productType, supplierInfo, supplierInfo.category === 4, 'productCustomsDetailVOList')
    return (
      <Form
        getInstance={ref => this.form = ref}
        config={defaultConfig}
        namespace='sku'
      >
        <ProductSeletor visible={productSeletorVisible}/>
        <Card title='添加/编辑商品'>
          <FormItem verifiable name='warehouseType' />
          <FormItem
            label='商品条码'
            inner={(form) => {
              return (
                <>
                  {form.getFieldDecorator('barCode', {
                    rules: [{
                      validator(rule, value, callback) {
                        if (value) {
                          if (/^\d{0,20}$/.test(value)) {
                            callback();
                          } else {
                            callback('仅支持数字，20个字符以内');
                          }
                        } else {
                          callback();
                        }
                      }
                    }]
                  })(
                    <Input
                      style={{ width: 172 }}
                      placeholder='请输入商品条码'
                    />
                  )}
                  <Button
                    className='ml10'
                    onClick={this.checkBarCode}
                  >
                    校验
                  </Button>
                </>
              )
            }}
          />
          <FormItem
            label='库存商品ID'
            required
            inner={(form) => {
              return (
                <>
                  {form.getFieldDecorator('baseProductId', {
                    rules: [{
                      required: true,
                      message: '请输入库存商品ID'
                    }]
                  })(
                    <Input
                      style={{ width: 172 }}
                      placeholder='请输入库存商品ID'
                    />
                  )}
                  <Button
                    className='ml10'
                    onClick={this.checkBaseProductId}
                  >
                    校验
                  </Button>
                </>
              );
            }}
          />
          <FormItem verifiable name='productName' />
          <FormItem
            label='商品类目'
            inner={(form) => {
              return form.getFieldDecorator('categoryId', {
                rules: [{
                  required: true,
                  message: '请选择商品类目'
                }, {
                  validator(rule, value, callback) {
                    if (!value || value.length === 0) {
                      callback('请选择类目');
                    }
                    callback();
                  }
                }],
                onChange: (val) => {
                  this.getStrategyByCategory(val[0])
                }
              })(
                <ProductCategory
                  style={{ width: 250 }}
                />
              )
            }}
          />
          <FormItem verifiable name='productShortName' />
          <FormItem name='productCode' />
          <FormItem verifiable name='description' />
          <FormItem
            required
            label='供应商'
            inner={(form) => {
              return form.getFieldDecorator('storeId', {
                rules: [
                  {
                    required: true,
                    message: '请输入供应商',
                  }
                ],
                onChange: this.supplierChange
              })(
                <SupplierSelect
                  style={{ width: 172 }}
                  disabled={this.id && supplierInfo.category === 4}
                  options={isEmpty(supplierInfo) ? [] : [supplierInfo]}
                />
              )
            }}
          />
          <FormItem
            label='供应商商品ID'
            inner={(form) => {
              return (
                <>
                  {form.getFieldDecorator('storeProductId')(
                    <Input
                      style={{ width: 172 }}
                      placeholder='请填写供货商商品ID'
                    />
                  )}
                  <If condition={!id}>
                    <Button
                      className='ml10'
                      onClick={this.sync1688Sku}
                    >
                      同步1688规格信息
                    </Button>
                  </If>
                </>
              );
            }}
          />
          <FormItem
            name='interception'
            hidden={!interceptionVisible}
            controlProps={{
              disabled: productType === 20
            }}
          />
          <FormItem
            label='商品类型'
            required
            style={{
              display: [3, 4].indexOf(supplierInfo.category) > -1 ? 'inherit' : 'none'
            }}
          >
            {getFieldDecorator('productType', {
              initialValue: 0,
              rules: [
                {
                  required: true,
                  message: '请选择商品类型'
                }
              ]
            })(
              <Select
                disabled={this.id !== undefined && supplierInfo.category !== 3}
                onChange={(value) => {
                  /** 海淘商品 */
                  if ([10, 20].indexOf(value) > -1) {
                    this.props.form.setFieldsValue({
                      isAuthentication: 1
                    })
                  } else {
                    this.props.form.setFieldsValue({isAuthentication: 0})
                  }
                  if (value === 20) {
                    this.props.form.setFieldsValue({interception: 0})
                  }
                  const data = (this.state.data || []).map((item) => {
                    item.skuCode = ''
                    item.deliveryMode = value === 20 ? 4 : 2
                    return item
                  })
                  this.setState({
                    data
                  })
                }}
              >
                {supplierInfo.category !== 4 && <Select.Option value={0}>普通商品</Select.Option>}
                {supplierInfo.category === 3 && <Select.Option value={10}>一般海淘商品</Select.Option>}
                {supplierInfo.category === 4 && <Select.Option value={20}>保税仓海淘商品</Select.Option>}
              </Select>
            )}
          </FormItem>
          <FormItem
            label='实名认证'
            required
          >
            {getFieldDecorator('isAuthentication', {
              initialValue: 0,
              rules: [
                {
                  required: true,
                  message: '请选择实名认证'
                }
              ]
            })(
              <Radio.Group
                disabled={[10, 20].indexOf(productType) > -1}
              >
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem
            label='商品视频封面'
            inner={(form) => {
              return form.getFieldDecorator('videoCoverUrl')(
                <UploadView
                  placeholder='上传视频封面'
                  listType='picture-card'
                  listNum={1}
                  size={0.3}
                />
              )
            }}
          />
          <FormItem
            label='商品视频'
            inner={(form) => {
              return form.getFieldDecorator('videoUrl')(
                <UploadView
                  placeholder='上传视频'
                  fileType='video'
                  listType='picture-card'
                  listNum={1}
                  size={5}
                />
              )
            }}
          />
          <FormItem
            label='商品主图'
            required={true}
            inner={(form) => {
              return form.getFieldDecorator('coverUrl', {
                rules: [
                  {
                    required: true,
                    message: '请设置商品主图',
                  },
                ],
              })(
                <UploadView
                  placeholder='上传主图'
                  listType='picture-card'
                  listNum={1}
                  size={0.3}
                />
              )
            }}
          />
          <FormItem
            label='商品图片'
            required={true}
            help={
              <>
                <div>1.本地上传图片大小不能超过300kb</div>
                <div>2.商品图片最多上传5张图片</div>
              </>
            }
          >
            {getFieldDecorator('productImage', {
              rules: [
                {
                  required: true,
                  message: '请上传商品图片',
                },
              ],
            })(
              <DraggableUpload className={styles['goods-detail-draggable']} listNum={5} size={0.3} placeholder='上传商品图片' />
            )}
          </FormItem>
          <FormItem
            label='banner图片'
            required={true}
            help={<span>(建议尺寸700*320，300kb内)</span>}
          >
            {getFieldDecorator('bannerUrl', {
              rules: [
                {
                  required: true,
                  message: '请设置banner图片',
                },
              ],
            })(
              <UploadView placeholder='上传banner图片' listType='picture-card' listNum={1} size={.3} />
            )}
          </FormItem>
          <FormItem name='showNum' />
        </Card>
        <SkuList
          form={this.props.form}
          type={productType}
          productCustomsDetailVOList={productCustomsDetailVOList}
          showImage={this.state.showImage}
          specs={this.state.speSelect}
          dataSource={this.state.data}
          strategyData={this.state.strategyData}
          onChange={(value, specs, showImage) => {
            this.setState({
              data: value,
              speSelect: specs,
              showImage,
            });
          }}
        />
        <Card
          title='物流信息'
          style={{
            marginTop: 10
          }}
        >
          <FormItem name='bulk' />
          <FormItem name='weight' />
          <FormItem
            label='运费设置'
            inner={(form) => {
              return form.getFieldDecorator('withShippingFree', {
                initialValue: 0
              })(
                <Radio.Group>
                  <Radio
                    style={radioStyle}
                    value={1}
                  >
                    包邮
                  </Radio>
                  <Radio
                    style={radioStyle}
                    value={0}
                  >
                    {this.form && this.form.props.form.getFieldDecorator('freightTemplateId')(
                      <TemplateList
                        dataSource={this.state.templateOptions}
                      />
                    )}
                  </Radio>
                </Radio.Group>
              )
            }}
          />
          <FormItem
            label='单独计算运费'
          >
            {getFieldDecorator('isCalculateFreight', {
              initialValue: 0,
              rules: [
                {
                  required: true,
                  message: '请选择是否进行单独计算运费'
                }
              ]
            })(
              <Radio.Group>
                <Radio value={0}>
                  否
                </Radio>
                <Radio value={1}>
                  是
                </Radio>
                <span style={{color: 'red'}}>*商品会叠加运费</span>
              </Radio.Group>,
            )}
          </FormItem>
          <FormItem
            label='退货地址'
            wrapperCol={{
              span: 18,
            }}
          >
            <div>
              <Input
                style={{ width: 160, marginRight: 10 }}
                className={styles['no-error']}
                name='returnContact'
                placeholder='收货人姓名'
                value={this.state.returnContact}
                onChange={this.handleInput}
              />
              {getFieldDecorator('returnPhone', {
                rules: [
                  {
                    max: 12,
                    message: '收货人电话格式不正确'
                  }
                ]
              })(
                <Input
                  style={{ width: 160, marginRight: 10 }}
                  placeholder='收货人电话'
                  name='returnPhone'
                  type='tel'
                  maxLength={12}
                  onChange={this.handleInput}
                />
              )}
              {/* <FormItem
                name='returnPhone'
              /> */}
              <Input
                style={{ width: 250 }}
                className={styles['no-error']}
                name='returnAddress'
                value={this.state.returnAddress}
                placeholder='收货人详细地址'
                onChange={this.handleInput}
              />
            </div>
          </FormItem>
        </Card>
        <Card style={{ marginTop: 10 }}>
          <FormItem
            label='商品详情页'
            inner={(form) => {
              const listImage = form.getFieldValue('listImage');
              const isExist = Array.isArray(listImage) && listImage.length > 0;
              return (
                <>
                  <div className='mb20'>
                    {form.getFieldDecorator('listImage')(
                      <DraggableUpload
                        className={styles['goods-draggable']}
                        id={'shop-detail'}
                        listNum={20}
                        size={0.3}
                        placeholder='上传商品详情图'
                      />
                    )}
                  </div>
                  <If condition={isExist}>
                    <Button
                      type='primary'
                      onClick={this.handleDeleteAll}
                    >
                      一键删除
                    </Button>
                  </If>
                </>
              )
            }}
          />
          <FormItem
            name='status'
            hidden={status === 2}
          />
          <FormItem>
            <Button
              className='mr10'
              type='primary'
              onClick={this.handleSave}
            >
              保存
            </Button>
            <Button
              className='mr10'
              type='danger'
              onClick={() => {
                APP.history.go(-1)
              }
            }>
              返回
            </Button>
            <If condition={status === 2}>
              <Button
                onClick={() => {
                  this.handleSave(3);
                }}>
                推送至待上架
              </Button>
            </If>
          </FormItem>
        </Card>
      </Form>
    );
  }
}

export default Form.create()(GoodsEdit);
