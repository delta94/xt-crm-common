import { filterMoney, filterUploadFile } from '../sku-stock/adapter';
import { SkuSaleProps } from '../components/sku';
import { replaceHttpUrl } from '../sku-stock/adapter';
import { statusEnums } from '../sku-stock/config';
import { omit } from 'lodash';

const fields: string[] = ['costPrice', 'salePrice', 'marketPrice', 'cityMemberPrice', 'managerMemberPrice', 'areaMemberPrice', 'headPrice'];

// 过滤新增、编辑销售商品请求
export function formRequest(payload: any) {
  console.log('payload =>', payload)
  const skuList: SkuSaleProps[] = payload.skuList || [];
  let result: Record<string, any> = filterUploadFile(payload)
  result.skuAddList = skuList.map(item => {
    item = filterMoney(item, 'req', fields);
    item.imageUrl1 = replaceHttpUrl(item.imageUrl1);
    return item;
  });
  result.freightTemplateId = +payload.freightTemplateId;
  result.categoryId = Array.isArray(payload.categoryId) ? payload.categoryId[2] : '';
  return { ...payload, ...result };
}

// 过滤销售商品详情
export function formResponse(res: any) {
  const skuList: any[] = res.skuList || [];
  res = filterUploadFile(res || {}, 'res');
  res.skuList = skuList.map((item: any) => {
    item = filterMoney(item, 'res', fields);
    return item;
  });
  res.showImage = skuList.every(v => !!v.imageUrl1);
  res.freightTemplateId = res.freightTemplateId ? res.freightTemplateId + '' : '';
  res.status = +res.status;
  res.productCustomsDetailVOList = res.productCustomsDetailVOList || [];
  return res;
}

// 过滤库存商品详情响应
export function baseProductResponse(res: any) {
  res = filterUploadFile(res, 'res');
  const skuList: any[] = res.skuList || []
  res.skuList = skuList.map(item => {
    const result = filterMoney(item, 'res');
    result.productBasicBarCode = item.barCode;
    result.productBasicSkuCode = item.skuCode;
    result.productBasicSpuCode = res.productCode;
    // 所有入库商品默认仓库发货，不再进行发货方式的编辑
    result.deliveryMode = 1;
    return { ...omit(item, ['barCode', 'skuCode']), ...result};
  })
  res.showImage = skuList.every(v => !!v.imageUrl1);
  return omit(res, ['productCode']);
}

// 过滤库存
export function baseProductPageResponse(res: any) {
  res.records = (res.records || []).map((item: any) => {
    item.statusText = statusEnums[item.status];
    return item;
  });
  return res;
}