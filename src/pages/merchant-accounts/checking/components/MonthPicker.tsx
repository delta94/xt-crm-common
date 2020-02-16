import React from 'react'
import { max } from 'moment';
interface Props {
  onChange?: any
  value?: number[]
}
function getYears (): number[] {
  let maxYear = new Date().getFullYear()
  let minYear = 2019
  const years = []
  while (minYear <= maxYear) {
    years.push(maxYear)
    maxYear--
  }
  return years
}

function getMonths (): number[] {
  let i = 12
  const months = []
  while (i > 0) {
    months.push(i)
    i--
  }
  return months
}

interface State {
  value: number[]
}

class Main extends React.Component<Props, State> {
  public state: State = {
    value: []
  }
  public onChange (type: 'y' | 'm', e: any) {
    const selectedValue = Number(e.target.value)
    let value = this.state.value
    if (type === 'y') {
      value = [selectedValue]
    } else {
      value[1] = selectedValue
    }
    if (this.props.onChange) {
      this.props.onChange(value)
    }
    this.setState({
      value
    })
  }
  public render () {
    const { value } = this.state
    return (
      <div
      >
        <select
          className='mr10'
          onChange={this.onChange.bind(this, 'y')}
          value={value[0]}
          style={{verticalAlign: 'middle'}}
        >
          {getYears().map((item) => {
            return <option value={item} key={item}>{item}</option>
          })}
        </select>
        <select
          onChange={this.onChange.bind(this, 'm')}
          value={value[1] || ''}
          style={{verticalAlign: 'middle'}}
        >
          <option value=''>全部</option>
          {getMonths().map((item) => {
            return (
              <option value={item} key={item}>
                {item < 10 ? `0${item}` : item}
              </option>
            )
          })}
        </select>
      </div>
    )
  }
}
export default Main
