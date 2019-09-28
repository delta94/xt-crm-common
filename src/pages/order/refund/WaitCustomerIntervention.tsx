import React from 'react';
import { FormComponentProps } from 'antd/lib/form';
import CustomerProcessInfo from './components/CustomerProcessInfo';
import LogisticsInformation from './components/LogisticsInformation';
import SupplierProcessInfo from './components/SupplierProcessInfo';
interface WaitCustomerInterventionState {
}
interface WaitCustomerInterventionProps extends FormComponentProps {

}
/**
 * 待客服介入
 */
class WaitCustomerIntervention extends React.Component<WaitCustomerInterventionProps, WaitCustomerInterventionState>{
  render() {
    return (
      <>
        <CustomerProcessInfo /> 
        <LogisticsInformation />
        <SupplierProcessInfo />
      </>
    )
  }
}
export default WaitCustomerIntervention;