import React, { useState, useEffect } from 'react';
import ClipboardJS from 'clipboard';
import { Row, Button } from 'antd';
import { ModifyLogisticsInfo } from '../../components/modal';
import { enumRefundStatus } from '../../constant';
interface Props {
  data: AfterSalesInfo.data;
}
type CheckVO = AfterSalesInfo.CheckVO;
type OrderServerVO = AfterSalesInfo.OrderServerVO;
const LogisticsInformation: React.FC<Props> = ({ data }: Props) => {
  const [visible, setVisible]: useStateType<boolean> = useState<boolean>(false);
  let checkVO: CheckVO = Object.assign({}, data.checkVO);
  let orderServerVO: OrderServerVO = Object.assign({}, data.orderServerVO);
  useEffect(() => {
    new ClipboardJS('#copy-btn');
  }, []);
  return (
    (checkVO.returnExpressName || checkVO.returnExpressCode) ? <>
      <ModifyLogisticsInfo
        title="物流信息修改"
        visible={visible}
        expressName={checkVO.returnExpressName}
        expressCode={checkVO.returnExpressCode}
        onCancel={() => setVisible(false)}
      />
      <div>
        <h4>用户发货物流信息</h4>
        <Row>
          <span>物流公司：{checkVO.returnExpressName}</span>
          <span className="ml20">
            物流单号：<span id="copy-text">{checkVO.returnExpressCode}</span>
          </span>
          {orderServerVO.refundStatus === enumRefundStatus.OperatingOfGoods && (
            <>
              <Button
                id="copy-btn"
                type="primary"
                className="ml20"
                data-clipboard-target="#copy-text"
              >
                复制
              </Button>
              <Button type="primary" className="ml10" onClick={() => setVisible(true)}>
                修改
              </Button>
            </>
          )}
        </Row>
          <div>说明：{data.returnExpressRemark}</div>
      </div>
    </>: null
  );
};

export default LogisticsInformation;
