import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  View,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native'
import { Button } from 'react-native-elements'
import { Brand, CircularSlider } from '@/Components'
import { useTheme } from '@/Theme'
import FetchOne from '@/Store/User/FetchOne'
import ChangeTheme from '@/Store/Theme/ChangeTheme'
import { useTranslation } from 'react-i18next'
import { UserState } from '@/Store/User'
import { ThemeState } from '@/Store/Theme'
import { navigate } from '@/Navigators/Root'
import { TestIds, BannerAd, BannerAdSize } from '@react-native-firebase/admob'
import RNFS from 'react-native-fs'
import { VideoUtil } from '@/Utils'
import {
  enableStatisticsCallback,
  executeFFmpegAsync,
  executeFFmpeg,
  resetStatistics,
} from '@/Utils'

// UI
// +spinning icon at the top => Checkmark when done
// +green color when 100%
// +put size before => size after somewhere
// +The compressed video has been saved to your files
// +Finish button => Pop to first screen.

// FFMpeg
// +receive FFMpeg file from screen 1
// +receive FFMPeg command params from screen 2
// +useEffect: call enableStatisticsCallback(statisticsCallback)
// +define statisticsCallback
// +updateProgressDialog: modify progress variable
// call runFFmpeg/encodeVideo
// +get it to the point where it can accept a file as input
// +find an arbitrary ffmpeg command and execute it

const IndexExampleContainer = props => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout, Images } = useTheme()
  const dispatch = useDispatch()

  const [progress, setProgress] = useState(0)
  const [finished, setFinished] = useState(false)
  // const [statistics, setStatistics] = useState(undefined)

  useEffect(() => {
    // setProgress(0)
    // setFinished(false)
    enableStatisticsCallback(statisticsCallback)
    runFFmpeg()
  }, [])

  const statisticsCallback = statistics => {
    console.log('statisticsCallback')
    console.log(statistics)
    // setStatistics(statistics)
    updateProgressDialog(statistics)
  }

  const updateProgressDialog = statistics => {
    // console.log('updateProgressDialog')
    // console.log('statistics')
    // console.log(statistics)

    if (statistics === undefined) {
      return
    }

    let timeInMilliseconds = statistics.time
    if (timeInMilliseconds > 0) {
      let totalVideoDuration = 30528
      // get Video Duration with ffProbe first?
      // asset.duration and asset.uri
      // how about file selection?? => react-native-media-meta
      // https://dev.to/saadbashar/finding-video-duration-react-native-456f
      let completePercentage = Math.round(
        (timeInMilliseconds * 99.9) / totalVideoDuration,
      )

      console.log('completePercentage')
      console.log(completePercentage)

      setProgress(completePercentage)
    }
  }

  const runFFmpeg = () => {
    let videoFile = `${RNFS.CachesDirectoryPath}/output.avi`
    VideoUtil.deleteFile(videoFile)

    // let filePath = props?.route?.params?.filePath
    // let type = props?.route?.params?.filePath
    let { filePath, type } = props?.route?.params
    let ffmpegCommand = ''
    console.log(filePath, type)

    // ffmpeg multiple filters:
    // -vf "movie=watermark.png [logo]; [in][logo] overlay=W-w-10:H-h-10, fade=in:0:20 [out]"

    // usethe faster 265 compression algorithm
    // -c:v libx265
    // width and height: 
    // -vf scale="720:480"
    // framerate: 
    // OR: -vf fps=30
    // bitrate: separate for audio and video
    // -b:v 1M -b:a 192k
    // presets:
    // -preset ultrafast, veryfast, medium (default), slower
    // ultrafast, superfast, veryfast, faster, fast, medium. Use the 4 fastest ones only
    // time_start, time_end
    //  ffmpeg -ss 00:01:00 -i input.mp4 -to 00:02:00 -c copy output.mp4
    // audio volume
    // -filter:a "volume=1.5" => 150% audio level of input.
    if (type === 'basic') {
      ffmpegCommand = `-i ${filePath} ${RNFS.CachesDirectoryPath}/output.avi`
    } else {
      ffmpegCommand = `-i ${filePath} ${RNFS.CachesDirectoryPath}/output.avi`
    }

    executeFFmpeg(ffmpegCommand).then(result => {
      console.log('result DONE!')
      console.log(result)
      if (result !== 0) {
        console.log('command failed')
        // error handling: make it red. Return/Finish
      } else {
        setFinished(true)
        // setProgress(99.9)
      }
    })
  }

  return (
    <View
      style={[
        Layout.fill,
        Layout.colBetweenCenter,
        Gutters.smallHPadding,
        Common.backgroundWhite,
      ]}
    >
      <Image
        style={{ width: 100, height: 100 }}
        source={finished ? Images.checkmark : Images.services}
      />
      <View style={{ alignItems: 'center' }}>
        <CircularSlider
          value={progress}
          trackWidth={15}
          showText={true}
          noThumb
          trackColor={finished ? '#00ff00' : '#0079e3'}
        />

        <View style={{ marginTop: 15 }}>
          <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 20 }}>
            {finished
              ? 'Video saved to Files'
              : 'Compressing video, please wait...'}
          </Text>

          <View
            style={{
              opacity: finished ? 1 : 0,
              marginTop: 15,
              alignItems: 'center',
            }}
          >
            {/* <View style={{ display: 'none' }}> */}
            <Button
              title="Finish"
              containerStyle={{ width: 150, borderRadius: 5 }}
              titleStyle={{ fontFamily: 'Nunito-Regular', fontSize: 20 }}
              onPress={() => navigate('Input')}
            />
          </View>
        </View>
      </View>

      <BannerAd
        unitId={TestIds.BANNER}
        size={BannerAdSize.SMART_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('Advert loaded')
        }}
        onAdFailedToLoad={error => {
          console.error('Advert failed to load: ', error)
        }}
      />
    </View>
  )
}

export default IndexExampleContainer
