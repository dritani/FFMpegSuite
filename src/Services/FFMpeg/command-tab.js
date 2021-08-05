import React from 'react'
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { styles } from './style'
import { COMMAND_TEST_TOOLTIP_TEXT } from './tooltip'
import { showPopup, Toast } from './popup'
import {
  enableLogCallback,
  enableStatisticsCallback,
  executeFFmpeg,
  executeFFprobe,
  getLogLevel,
} from './react-native-ffmpeg-api-wrapper'
import { ffprint } from './util'
import DocumentPicker from 'react-native-document-picker'

export default class CommandTab extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      commandText: '',
      outputText: '',
      videoURI: '',
    }

    this.popupReference = React.createRef()
  }

  componentDidMount() {
    this.props.navigation.addListener('focus', _ => {
      this.clearLog()
      this.setActive()
    })
  }

  setActive() {
    ffprint('Command Tab Activated')
    enableLogCallback(this.logCallback)
    enableStatisticsCallback(undefined)
    showPopup(this.popupReference, COMMAND_TEST_TOOLTIP_TEXT)
  }

  logCallback = log => {
    this.appendLog(log.message)
  }

  appendLog(logMessage) {
    this.setState({ outputText: this.state.outputText + logMessage })
  }

  clearLog() {
    this.setState({ outputText: '' })
  }

  importVideo = async () => {
    // Pick a single file
    try {
      const res = await DocumentPicker.pick({
        // type: [DocumentPicker.types.images],
      })
      console.log(
        res.uri,
        res.type, // mime type
        res.name,
        res.size,
      )
      this.setState({ videoURI: res.uri })
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err
      }
    }
  }

  runFFmpeg = () => {
    this.clearLog()

    let ffmpegCommand = this.state.commandText

    getLogLevel().then(logLevel => ffprint(`Current log level is ${logLevel}.`))

    ffprint('Testing FFmpeg COMMAND synchronously.')

    ffprint(`FFmpeg process started with arguments\n\'${ffmpegCommand}\'`)

    executeFFmpeg(ffmpegCommand).then(result => {
      ffprint(`FFmpeg process exited with rc ${result}.`)
      if (result !== 0) {
        showPopup(
          this.popupReference,
          'Command failed. Please check output for the details.',
        )
      }
    })
  }

  runFFprobe = () => {
    this.clearLog()

    // let ffprobeCommand = this.state.commandText;
    let ffprobeCommand = this.state.videoURI

    ffprint('Testing FFprobe COMMAND synchronously.')

    ffprint(`FFprobe process started with arguments\n\'${ffprobeCommand}\'`)

    executeFFprobe(ffprobeCommand).then(result => {
      ffprint(`FFprobe process exited with rc ${result}.`)
      if (result !== 0) {
        showPopup(
          this.popupReference,
          'Command failed. Please check output for the details.',
        )
      }
    })
  }

  render() {
    return (
      <View style={styles.screenStyle}>
        <View style={styles.headerViewStyle}>
          <Text style={styles.headerTextStyle}>ReactNativeFFmpegTest</Text>
        </View>
        <View style={styles.textInputViewStyle}>
          <TextInput
            style={styles.textInputStyle}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Enter command"
            underlineColorAndroid="transparent"
            onChangeText={commandText => this.setState({ commandText })}
            value={this.state.commandText}
          />
        </View>
        <View style={styles.buttonViewStyle}>
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={this.importVideo}
          >
            <Text style={styles.buttonTextStyle}>IMPORT</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonViewStyle}>
          <TouchableOpacity style={styles.buttonStyle} onPress={this.runFFmpeg}>
            <Text style={styles.buttonTextStyle}>RUN FFMPEG</Text>
          </TouchableOpacity>
        </View>
        <Toast ref={this.popupReference} position="center" />
        <View style={styles.buttonViewStyle}>
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={this.runFFprobe}
          >
            <Text style={styles.buttonTextStyle}>RUN FFPROBE</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.outputViewStyle}>
          <ScrollView
            ref={view => {
              this.scrollViewReference = view
            }}
            onContentSizeChange={(width, height) =>
              this.scrollViewReference.scrollTo({ y: height })
            }
            style={styles.outputScrollViewStyle}
          >
            <Text style={styles.outputTextStyle}>{this.state.outputText}</Text>
          </ScrollView>
        </View>
      </View>
    )
  }
}
