import React from 'react'
import { Tabs } from 'antd'
import TabItem from './TabItem'
const { TabPane } = Tabs
class Main extends React.Component {
  public config: {title: string, key: number}[] = [
    {title: '全部', key: 0},
    {title: '待采购审核', key: 10},
    {title: '待财务审核', key: 20},
    {title: '审核通过', key: 30},
    {title: '审核不通过', key: 40},
    {title: '已失效', key: 50}
  ]
  public render () {
    return (
      <div style={{background: '#FFFFFF', padding: 20}}>
        <Tabs
          // type='card'
          tabBarStyle={{marginBottom: 0}}
        >
          {
            this.config.map((item) => {
              return (
                <TabPane tab={item.title} key={String(item.key)}>
                  <TabItem
                    status={item.key}
                  />
                </TabPane>
              )
            })
          }
        </Tabs>
      </div>
    )
  }
}
export default Main
