import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  View,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
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
import {
  TestIds,
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
} from '@react-native-firebase/admob'
import RNFS from 'react-native-fs'
import { VideoUtil } from '@/Utils'
import {
  enableStatisticsCallback,
  executeFFmpegAsync,
  executeFFmpeg,
  resetStatistics,
} from '@/Utils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Config } from '@/Config'

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

const bannerId = __DEV__ ? TestIds.BANNER : Config.BANNER_ID
const interstitialId = __DEV__ ? TestIds.INTERSTITIAL : Config.INTERSTITIAL_ID
const interstitial = InterstitialAd.createForAdRequest(interstitialId)

const IndexExampleContainer = props => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout, Images } = useTheme()
  const dispatch = useDispatch()

  const [progress, setProgress] = useState(0)
  const [finished, setFinished] = useState(false)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState(false)
  const [adLoaded, setAdLoaded] = useState(false)
  const [ads, setAds] = useState(null)

  const getPaymentStatus = async () => {
    let payment = await AsyncStorage.getItem('@payment')
    if (payment) {
      let payment_json = JSON.parse(payment)
      setAds(payment_json.ads)
    } else {
      setAds(true)
    }
  }

  useEffect(() => {
    getPaymentStatus()

    const eventListener = interstitial.onAdEvent(type => {
      if (type === AdEventType.LOADED) {
        setAdLoaded(true)
      }
    })

    interstitial.load()
    enableStatisticsCallback(statisticsCallback)
    runFFmpeg()

    return () => {
      eventListener()
    }
  }, [])

  useEffect(() => {
    if (started) {
      setProgress(1)
    }
  }, [started])

  const statisticsCallback = statistics => {
    // setStatistics(statistics)
    updateProgressDialog(statistics)
  }

  const updateProgressDialog = statistics => {
    if (statistics === undefined) {
      return
    }

    let timeInMilliseconds = statistics.time
    if (timeInMilliseconds > 0) {
      let duration = props?.route?.params?.duration
      // let duration = 30.526667
      let totalVideoDuration = duration * 1000

      let completePercentage = Math.round(
        (timeInMilliseconds * 99) / totalVideoDuration,
      )

      // bug: the first tick goes to max right away
      // let SSS = getStarted()

      // setStarted(true) // 2 ticks?

      // if (progress === 0)
      // oh. We can't read variables from the outside, we can only set them.
      // well we CAN read them, but statically. From when the method is first set up.
      setProgress(completePercentage)
      setStarted(true)
      // array of stat.time?
      // if (progress === 0) {
      //   setProgress(1)
      //   setStarted(true)
      // } else {
      //   setProgress(completePercentage)
      // }
      // setTicks(ticks + 3)

      // if (started) {
      //   setProgress(completePercentage)
      // } else {
      //   setStarted(true)
      // }
    }
  }

  const runFFmpeg = async () => {
    let {
      filePath,
      type,
      preset,
      width,
      height,
      time_start,
      time_end,
      volume,
      bitrate,
      framerate,
      no_extension,
    } = props?.route?.params

    let ffmpegCommand = ''

    let empty_advanced =
      !width &&
      !height &&
      (time_start === 0 || time_start === '00:00:00.000') &&
      (time_end === 0 || time_end === '00:00:00.000') &&
      !volume &&
      !bitrate &&
      !framerate

    if (type === 'basic' || empty_advanced) {
      let final_preset = empty_advanced ? 3 : preset
      ffmpegCommand = await VideoUtil.generateBasicCompressionScript(
        filePath,
        final_preset,
        width,
        height,
        no_extension,
      )
    } else {
      ffmpegCommand = VideoUtil.generateAdvancedCompressionScript(
        filePath,
        width,
        height,
        time_start,
        time_end,
        volume,
        bitrate,
        framerate,
        no_extension,
      )
    }

    executeFFmpeg(ffmpegCommand).then(async result => {
      if (result !== 0) {
        setFinished(true)
        setError(true) // red icon at the top.
      } else {
        setFinished(true)
        setProgress(99.9)
        setError(false)
        if (ads === null || ads === true) {
          showInterstitialAd()
        }
      }
    })
  }

  const showInterstitialAd = () => {
    let randomNumber = Math.random()
    if (randomNumber >= 0.5 && adLoaded) {
      interstitial.show()
    }
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
        source={
          finished ? Images.checkmark : error ? Images.error : Images.services
        }
      />
      <View style={{ alignItems: 'center' }}>
        <CircularSlider
          value={!started && progress !== 0 ? 1 : progress}
          trackWidth={15}
          showText={true}
          noThumb
          trackColor={finished ? '#00ff00' : error ? '#ff0000' : '#0079e3'}
        />

        <View style={{ marginTop: 15 }}>
          <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 20 }}>
            {finished
              ? Platform.OS === 'android'
                ? t('processing.finishedLabelAndroid')
                : t('processing.finishedLabel')
              : error
              ? t('processing.errorLabel')
              : t('processing.processingLabel')}
          </Text>

          <View
            style={{
              opacity: finished ? 1 : 0,
              marginTop: 15,
              alignItems: 'center',
            }}
          >
            <Button
              title={t('processing.finishButton')}
              containerStyle={{ width: 150, borderRadius: 5 }}
              titleStyle={{ fontFamily: 'Nunito-Regular', fontSize: 20 }}
              onPress={() => navigate('Input', {})}
            />
          </View>
        </View>
      </View>

      {ads === null ? (
        <View />
      ) : ads === false ? (
        <View />
      ) : (
        <BannerAd
          unitId={bannerId}
          size={BannerAdSize.SMART_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdLoaded={() => {}}
          onAdFailedToLoad={error => {}}
        />
      )}
    </View>
  )
}

export default IndexExampleContainer
