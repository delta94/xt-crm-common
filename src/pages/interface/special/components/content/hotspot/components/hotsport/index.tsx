import React, { useRef, useState, useEffect } from 'react'
import { Icon } from 'antd'
import classNames from 'classnames'
import styles from './styles.m.styl'

interface BlockProps {
  x: number
  y: number
  isTouch: boolean
  coordinate?: string
  left?: number
  top?: number
  width: number
  height: number
  active?: boolean
  onClick?: () => void
  onRemove?: () => void
}

function Block (props: BlockProps) {
  const elRef = useRef(null)
  const styleRef = useRef<React.CSSProperties>({
    position: 'absolute',
    top: props.top || 0,
    left: props.left || 0,
    width: props.width,
    height: props.height
  })
  const [active, setActive] = useState(false)
  const style = styleRef.current
  // console.log(style, 'style')
  const touchRef = useRef({
    isTouch: false,
    isSpanTouch: false,
    gapX: 0,
    gapY: 0,
    offsetLeft: 0,
    offsetTop: 0,
    initWidth: 0,
    initHeight: 0,
    spanCurrentIndex: 0
  })
  if (!props.isTouch) {
    touchRef.current.isTouch = false
    touchRef.current.isSpanTouch = false
  }
  function onMouseDown (e: any) {
    if (touchRef.current.isSpanTouch) {
      return
    }
    touchRef.current.isTouch = true
    const { pageX, pageY } = e
    const el = elRef.current as any
    const { x, y } = el.getClientRects()[0]
    touchRef.current.gapX = pageX - x
    touchRef.current.gapY = pageY - y
    touchRef.current.initWidth = el.clientWidth
    touchRef.current.initHeight = el.clientHeight
    touchRef.current.offsetLeft = el.offsetLeft
    touchRef.current.offsetTop = el.offsetTop
  }
  function onMouseUp () {
    touchRef.current.isTouch = false
  }
  function onMouseLeave () {
    setActive(false)
  }
  function onMouseEnter () {
    const el = elRef.current
    setActive(true)
  }
  if (touchRef.current.isTouch) {
    // console.log('if 1')
    const el: any = elRef.current
    const parentEl = el.parentElement
    const { x, y } = el.getClientRects()[0]
    let top = props.y + touchRef.current.offsetTop
    let left = props.x + touchRef.current.offsetLeft
    const width = touchRef.current.initWidth
    const height = touchRef.current.initHeight
    if (top < 0) {
      top = 0
    }
    if (top > parentEl.clientHeight - el.clientHeight) {
      top = parentEl.clientHeight - el.clientHeight
    }
    if (left > parentEl.clientWidth - el.clientWidth) {
      left = parentEl.clientWidth - el.clientWidth
    }
    if (left < 0) {
      left = 0
    }
    style.top = top
    style.left = left
    style.width = width
    style.height = height
  }
  if (touchRef.current.isSpanTouch) {
    // console.log('if 2')
    const spanCurrentIndex = touchRef.current.spanCurrentIndex
    const el: any = elRef.current
    const parentEl = el.parentElement
    let top = el.offsetTop
    let left = el.offsetLeft
    let width = touchRef.current.initWidth + props.x
    let height =touchRef.current.initHeight + props.y
    if ([0, 1, 3].indexOf(spanCurrentIndex) > -1) {
      width = touchRef.current.initWidth - props.x
      height = touchRef.current.initHeight - props.y
      top = touchRef.current.offsetTop + props.y
      left = touchRef.current.offsetLeft + props.x
    } else if ([2].indexOf(spanCurrentIndex) > -1) {
      top = touchRef.current.offsetTop + props.y
      width = touchRef.current.initWidth + props.x
      height = touchRef.current.initHeight - props.y
    } else if ([5].indexOf(spanCurrentIndex) > -1) {
      // 上、右不动
      left = touchRef.current.offsetLeft + props.x
      width = touchRef.current.initWidth - props.x
      height = touchRef.current.initHeight + props.y
    }
    width = width <= 2 ? 2 : width
    height = height <= 2 ? 2 : height
    if (width === 2) {
      left = el.offsetLeft
    }
    if (height === 2) {
      top = el.offsetTop
    }
    if (top < 0) {
      top = 0
    }
    if (top > parentEl.clientHeight - el.clientHeight) {
      top = parentEl.clientHeight - el.clientHeight
    }
    if (left < 0) {
      left = 0
    }
    if (left > parentEl.clientWidth - el.clientWidth) {
      left = parentEl.clientWidth - el.clientWidth
    }
    style.top = top
    style.left = left
    style.width = width
    style.height = height
  }
  const children = [0, 1, 2, 3, 4, 5, 6, 7]
  return (
    <div
      ref={elRef}
      style={{ ...style }}
      className={classNames(styles.block, { [styles.active]: props.active })}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      onClick={() => {
        if (props.onClick) {
          props.onClick()
        }
      }}
    >
      {
        children.map((v, k) => {
          return (
            <span
              key={k}
              onMouseDown={(e) => {
                const el = elRef.current as any
                touchRef.current.isSpanTouch = true
                touchRef.current.initWidth = el.clientWidth
                touchRef.current.initHeight = el.clientHeight
                touchRef.current.spanCurrentIndex = k
                touchRef.current.offsetLeft = el.offsetLeft
                touchRef.current.offsetTop = el.offsetTop
                // console.log('down 3')
              }}
            />
          )
        })
      }
      {props.active && (
        <Icon
          className={styles.close}
          type='close-circle'
          onClick={() => {
            if (props.onRemove) {
              props.onRemove()
            }
          }}
        />
      )}
    </div>
  )
}

interface Props {
  className?: string
  onChange?: (value: any) => void
  value?: string[]
  onBlockClick?: (current: number) => void
  onRemove?: (index: number) => void
}

interface State {
  x: number
  y: number
  isTouch: boolean,
  current: number
}

class Main extends React.Component<Props, State> {
  public state: State = {
    x: 0,
    y: 0,
    isTouch: false,
    current: 0
  }
  public isTouch = false
  public initPageX = 0
  public initPyageY= 0
  public onMouseMove = (e: any) => {
    const { pageX, pageY } = e
    const el = this.refs.el as any
    const { x, y } = el.getClientRects()[0]
    if (this.isTouch) {
      // console.log(this.isTouch, 'mv 1')
      this.setState({
        x: pageX - this.initPageX,
        y: pageY - this.initPyageY
      })
    }
  }
  public onChange (index?: number) {
    const el = this.refs.el as Element
    const children: HTMLCollection = el.children
    const w = el.clientWidth
    const h = el.clientHeight
    let i = 0
    const coordinates = []
    const precision = 4
    while (i < children.length) {
      const item = children.item(i) as any
      if (item && i !== index) {
        const x1 = APP.fn.round(item.offsetLeft / w, precision)
        const y1 = APP.fn.round(item.offsetTop / h, precision)
        const x2 = APP.fn.round((item.offsetLeft + item.clientWidth) / w, precision)
        const y2 = APP.fn.round((item.offsetTop + item.clientHeight) / h, precision)
        coordinates.push([x1, y1, x2, y2].join(','))
      }
      i++
    }
    console.log(coordinates, 'coordinates')
    if (this.props.onChange) {
      this.props.onChange(coordinates)
    }
  }
  public onRemove (index: number) {
    if (this.props.onRemove) {
      this.props.onRemove(index)
    }
  }
  public render () {
    const { className } = this.props
    const { x, y } = this.state
    const coordinates = this.props.value || []
    console.log(coordinates, 'coordinates')
    return (
      <div
        ref='el'
        className={classNames(styles.hotsport, className)}
        onMouseMove={this.onMouseMove}
        onMouseDown={(e) => {
          const { pageX, pageY } = e
          this.initPageX = pageX
          this.initPyageY = pageY
          this.isTouch = true
          this.setState({
            x: 0,
            y: 0
          })
          this.forceUpdate()
          // console.log('down top')
        }}
        onMouseUp={() => {
          this.isTouch = false
          // this.forceUpdate()
          this.onChange()
        }}
        onMouseLeave={() => {
          console.log('leave')
          this.isTouch = false
          // this.forceUpdate()
          this.onChange()
        }}
      >
        {
          coordinates.map((item, index) => {
            const el = this.refs.el as Element
            const [x1, y1, x2, y2] = item ? item.split(',') : [0, 0, 0, 0]
            const width = el.clientWidth * (+x2 - +x1)
            const height = el.clientHeight * (+y2 - +y1)
            const left = el.clientWidth * (+x1)
            const top = el.clientHeight * (+y1)
            return (
              <Block
                key={item}
                left={left}
                top={top}
                width={width}
                height={height}
                isTouch={this.isTouch}
                x={x}
                y={y}
                active={this.state.current === index}
                onRemove={this.onRemove.bind(this, index)}
                onClick={() => {
                  if (this.props.onBlockClick) {
                    this.props.onBlockClick(index)
                  }
                  this.setState({
                    current: index
                  })
                }}
              />
            )
          })
        }
      </div>
    )
  }
}
export default Main
