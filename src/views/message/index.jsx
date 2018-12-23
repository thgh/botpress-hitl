import React from 'react'
import {
  Row,
  Col,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap'

import style from './style.scss'
import moment from 'moment'
import _ from 'lodash'
import ReactAudioPlayer from 'react-audio-player'

export default class Message extends React.Component {

  constructor() {
    super()
  }

  renderText() {
    return <p>{this.props.content.text}</p>
  }

  renderPostback() {
    const { platform, raw_message, text } = this.props.content
    if (platform === 'facebook') {
      const raw = fromRaw(raw_message)
      return <div className={style.action}>
        {raw.postback.title}
        <code>{text}</code>
      </div>
    }
    return <div className={style.action}>
      {text}
    </div>
  }

  renderQuickReply() {
    const { platform, raw_message, text } = this.props.content
    if (platform === 'facebook') {
      const raw = fromRaw(raw_message)
      return <div className={style.action}>
        {raw.message.text}
        <code>{text}</code>
      </div>
    }
    return <div className={style.action}>
      {text}
    </div>
  }

  renderImage() {
    return <img src={this.props.content.text}/>
  }

  renderVideo() {
    return <video controls>
      <source src={this.props.content.text} type="video/mp4" />
    </video>
  }

  renderAudio() {
    return <ReactAudioPlayer className={style.audio} src={this.props.content.text} />
  }

  renderContent() {
    const type = this.props.content.type

    if (type === "message" || type === "text") {
      return this.renderText()
    }
    else if (type === "postback") {
      return this.renderPostback()
    }
    else if (type === "quick_reply") {
      return this.renderQuickReply()
    }
    else if (type === "image") {
      return this.renderImage()
    }
    else if (type === "video") {
      return this.renderVideo()
    }
    else if (type === "audio") {
      return this.renderAudio()
    }
    return null;
  }

  renderMessageFromUser() {
    return (
      <div className={style.message + ' ' + style.fromUser}>
        {this.renderContent()}
      </div>
    )
  }

  renderMessageFromBot() {
    return (
      <div className={style.message + ' ' + style.fromBot}>
        {this.renderContent()}
      </div>
    )
  }

  renderMessage() {
    const date = moment(this.props.content.ts).format('DD MMM YYYY [at] LT')

    const tooltip = (
      <Tooltip id="tooltip">{date}</Tooltip>
    )

    if(this.props.content.direction === 'in') {
      return <OverlayTrigger placement="right" overlay={tooltip}>
        {this.renderMessageFromUser()}
      </OverlayTrigger>
    }

    return <OverlayTrigger placement="left" overlay={tooltip}>
      {this.renderMessageFromBot()}
    </OverlayTrigger>

  }

  render() {
    const renderedTypes = [
      "text",
      "message",
      "postback",
      "quick_reply",
      "image",
      "video",
      "audio"
    ]
    console.log('renderMessage', this.props.content.type, this.props.content)
    if (!_.includes(renderedTypes, this.props.content.type)) {
      return <p>{JSON.stringify(this.props.content.type)}</p> // <p>? other ? {JSON.stringify(this.props.content.type)}<br />{JSON.stringify(this.props.content.payload || this.props.content)}</p>
    }
    return (
      <Row>
        <Col md={12}>
          {this.renderMessage()}
        </Col>
      </Row>
    )
  }
}

function fromRaw (str) {
  return typeof str === 'string' ? JSON.parse(str) : str
}
