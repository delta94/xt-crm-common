import React from 'react'
import { connect } from '@/util/utils'
import BaseCard from './components/baseCard'
import SkuCard from './components/skuCard'
import LogisCard from './components/logisCard'
import AuditCard from './components/auditCard'
import { unionBy } from 'lodash'
import { Button } from 'antd'
import * as api from './api'
import { parseQuery } from '@/util/utils'
import { initImgList } from '@/util/utils'

@connect(state => ({
  goodsInfo: state['shop.pop.goods.detail'].goodsInfo
}))
class GoodsDetail extends React.Component {
  query = parseQuery()

  state = {
    readonly: !!this.query.readonly
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData = () => {
    const { dispatch, match: { params: { id: productPoolId } } } = this.props;
    dispatch['shop.pop.goods.detail'].getGoodsInfo({ productPoolId });
  }

  getSpecKeys = (goodsInfo) => {
    // 1.根据后端的propertyId1, propertyId2组装成规格key数组
    let propertys = [{
      id: goodsInfo.propertyId1,
      name: goodsInfo.property1,
      specNameKey: 'propertyValue1',
      specPictureKey: 'imageUrl1'
    }, {
      id: goodsInfo.propertyId2,
      name: goodsInfo.property2,
      specNameKey: 'propertyValue2',
      specPictureKey: 'imageUrl2'
    }].filter(pitem => !!pitem.id);

    // 2.根据后端的skuList遍历获取规格key的其他一些元数据, 具体有key下面的一些数据, 如key为颜色,那么key下面的值有红色、绿色等数据
    propertys.forEach(pitem => {
      pitem.content = (goodsInfo.skuList || []).map(sitem => ({
        specName: sitem[pitem.specNameKey],
        specPicture: sitem[pitem.specPictureKey]
      }))
      pitem.content = unionBy(pitem.content, 'specName')
    })
    return propertys
  }

  getSpecVals = (goodsInfo) => {
    return goodsInfo?.skuList?.map((item) => {
      return {
        ...item,
        agencyCommission: item?.agencyCommission || 0.01
      }
    }) || []
  }

  render() {
    const { goodsInfo, match: { params: { id: productPoolId } }  } = this.props;

    let baseInfo = null, // 商品信息
      skuInfo = null, // 规格信息
      logisInfo = null, // 物流信息
      auditInfo = null; // 审核信息

    console.log(goodsInfo, this.getSpecVals(goodsInfo), 'nihaoa');

    if (goodsInfo) {
      baseInfo = {
        productCategory: goodsInfo.productCategoryVO && goodsInfo.productCategoryVO.combineName || '暂无数据',
        commission: (goodsInfo.productCategoryVO && (goodsInfo.productCategoryVO.agencyRate + goodsInfo.productCategoryVO.companyRate) || 0) + ' %',
        productName: goodsInfo.productName || '暂无数据',
        commissionIncreaseRate: goodsInfo.commissionIncreaseRate||0,
        productImage: goodsInfo.productImage?.split(',')?.map((url) => initImgList(url)?.[0]),
        listImage: goodsInfo.listImage ? goodsInfo.listImage?.split(',')?.map((url) => initImgList(url)?.[0]) : [],
        saleCount: goodsInfo.saleCount || 0,
        productCategoryVO: goodsInfo.productCategoryVO,
        status: goodsInfo.status
      }
      skuInfo = {
        specKeys: this.getSpecKeys(goodsInfo),
        specVals: this.getSpecVals(goodsInfo)
      }

      logisInfo = {
        bulk: goodsInfo.bulk || '暂无数据',
        weight: goodsInfo.weight || '暂无数据',
        withShippingFree: goodsInfo.withShippingFree,
        freightTemplateName: goodsInfo.freightTemplateName,
        freightTemplateId: goodsInfo.freightTemplateId,
        returnContact: goodsInfo.returnContact,
        returnPhone: goodsInfo.returnPhone,
        returnAddress: goodsInfo.returnAddress
      }

      auditInfo = {
        status: goodsInfo.status,
        channel: goodsInfo.channel,
        auditInfo: goodsInfo.auditInfo,
        auditStatus: goodsInfo.auditStatus,
        withdrawalType: goodsInfo.withdrawalType,
        withdrawalInfo: goodsInfo.withdrawalInfo
      }
    }
    return (
      <div>
        <BaseCard data={baseInfo} getInstance={(ref) => this.baseCardRef = ref} />
        <SkuCard goodsInfo={goodsInfo} data={skuInfo} />
        <LogisCard data={logisInfo} />
        <AuditCard data={auditInfo} productPoolId={productPoolId} />
        {!this.state.readonly && goodsInfo?.status === 1 && goodsInfo?.confirmStatus === 1 && (
          <div>
            <Button
              type='primary'
              className='mr10'
              onClick={async () => {
                let values = {}
                if (this.baseCardRef && goodsInfo.status === 1) {
                  await this.baseCardRef?.props.form.validateFields((error) => {
                    //
                    if (error) {
                      APP.error('请检查输入项')
                      return
                    }
                  })
                  values = this.baseCardRef?.props.form.getFieldsValue()
                  values.productImage = values.productImage?.map((item) => item.url)?.join(',')
                  values.listImage = values.listImage?.map((item) => item.url)?.join(',')
                }
                api.updateGoods({
                  ...values,
                  productPoolId: productPoolId,
                  productPoolSkuCommissionUpdateDTOList: goodsInfo.skuList?.map((item) => {
                    return {
                      agencyCommission: item.agencyCommission || 0.01,
                      companyCommission: item.companyCommission,
                      productPoolSkuId: item.skuId
                    }
                  })
                }).then(() => {
                  APP.success('商品修改成功')
                  this.fetchData()
                })
              }}
            >
              确定
            </Button>
            <Button
              onClick={() => {
                APP.history.push('/shop/pop-goods')
              }}
            >
              取消
            </Button>
          </div>
        )}
      </div>
    );
  }
}

export default GoodsDetail;
