import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  Pressable,
  Image,
  TouchableOpacity,
} from 'react-native'
import { ListItem, Slider, Input, Text, Button, Icon } from 'react-native-elements'
import { useTheme } from '@/Theme'
import { useTranslation } from 'react-i18next'
import SegmentedControlTab from 'react-native-segmented-control-tab'
import { navigate } from '@/Navigators/Root'
import { TestIds, BannerAd, BannerAdSize } from '@react-native-firebase/admob'
import MultiSlider from '@ptomasroos/react-native-multi-slider'
import StepIndicator from 'react-native-step-indicator'
import { getMediaInformation } from '@/Utils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RNIap from 'react-native-iap'
import LinearGradient from 'react-native-linear-gradient'
import TouchableScale from 'react-native-touchable-scale'

// 3 changes:
// +Time selector right => Add a Margin
// +Keyboard Avoiding View
// Bottom View (no ads) add a Height => test this.

// add payment functionalities

// accurate duration to fix circular bug.

// edge cases numerical

// premium popup

// Photo permission rejected

// ffprobe on the file received
// detect if the file is longer than 3 minutes
// save prefs: default speed & advanced tab or not - don't bother

// test scrollview on an iPhone 4 simulator
// add it to the Basic Tab as well

// test the numerical inputs on a real device;
// popup numerical keyboard, SafeKeyboard.
// Video Converter app; how does it handle converting the same file twice, teh filename??? How do the competitors handle it?
// first principles solution: (1), (2), last 4 before extension, OR: timestamp hash
// Google: ffmpeg output same file type
// Payment popup/modal needed before? How about after??
// Volume Slider: min 0, max 5, default 1. setVolume. If value is !== 1 in the next screen.

// in THIS screen.
// DEFAULT_VOLUME
// if volume !== DEFAULT_VOLUME
//   let new_volume = null
//   navigate('Processing', {volume: null})
// Processing screen just checks for null, accepts whatever else it receives.

// also check the numerical inputs for wonky shit like alphabetical letters right before pushing to Processing
// Time
// min default is always 0
// max default is FFProbe's resulting video duration, rounded, floored, or ceil-ed
// 00:00:00 => Display only
// actual scrubbing value should be in seconds? Yes.

// before pushing to processing, compare rounded down max to current max; If it's a match, don't feed in that parameter. Set it null

// Click Basic Start longer than 3 minutes => Premium popup with 'Unlock longer than 3 minutes with such and such)
// Advanced without pro => Similar popup, different message at the top

// width, height
// number inputBackground// keypad only
// check that they are numbers, otherwise refuse to push
// greater than 10, less than 10000
// greater than 10, less than 10000

// framerate
// greater than 1, less than 1000

// bitrate: 50k - 1M ???

// time
// 0 => 00:00:00
// video max length accurately. convert seconds to hours:minutes:seconds in display
// max selected by default
// max 3m free

// volume
// 0 to 5, default is 1

// Premium button => crown, locked. Click => Buy

const IndexExampleContainer = props => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout, Images } = useTheme()

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollEnabled, setScrollEnabled] = useState(true)
  const labels = [t('options.slowerLabel'), '', '', t('options.fasterLabel')]
  const MAX_MULTISLIDER = 300

  const [modalVisible, setModalVisible] = useState(false)

  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [bitrate, setBitrate] = useState(0)
  const [framerate, setFramerate] = useState(0)
  const [time_start, setTimeStart] = useState(100)
  const [time_end, setTimeEnd] = useState(300)
  const [total_time, setTotalTime] = useState('')
  const [display_start, setDisplayStart] = useState(0)
  const [display_end, setDisplayEnd] = useState(0)
  const [send_start, setSendStart] = useState(0)
  const [send_end, setSendEnd] = useState(0)
  // const [seconds, setSeconds] = useState(0)
  const [volume, setVolume] = useState(0.1666)
  const [currentPreset, setPreset] = useState(2)
  const [ads, setAds] = useState(null)
  const [pro, setPro] = useState(null)

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
    setTotalTime(props?.route?.params?.duration)
    handleTimeSlider([0, 300])

    let ffprobeCommand = props?.route?.params?.filePath
    getMediaInformation(ffprobeCommand).then(result => {
      console.log(`FFPROBE: ${result}`)
      // result.getMediaProperties().duration
      // result.getMediaProperties().size
      // if bigger than 1500000 and !pro

      if (result !== 0) {
        // error. do jack shit.
      }
    })
  }, [])

  const getDateString = seconds => {
    return new Date(seconds * 1000).toISOString()
  }

  const handleTimeSlider = a => {
    let delta = ((a[1] - a[0]) / 300) * props?.route?.params?.duration
    let dur = Math.round((delta + Number.EPSILON) * 100) / 100

    let hours = Math.floor(dur / 3600)
    let hour_remainder = dur % 3600
    let minutes = Math.floor(hour_remainder / 60)
    let seconds = hour_remainder % 60
    let string_duration = ''

    if (hours) {
      string_duration += `${hours} h `
    }

    if (minutes) {
      string_duration += `${minutes} m `
    }

    string_duration += `${seconds} s`

    let formatted_start = '',
      final_start = ''
    let seconds_start = (a[0] / 300) * props?.route?.params?.duration
    let string_start = getDateString(seconds_start)
    final_start = string_start.substr(11, 12)
    if (seconds_start < 3600) {
      formatted_start = string_start.substr(14, 8)
    } else {
      formatted_start = string_start.substr(11, 8)
    }

    let formatted_end = '',
      final_end = ''
    let seconds_end = (a[1] / 300) * props?.route?.params?.duration
    let string_end = getDateString(seconds_end)
    final_end = string_start.substr(11, 12)
    if (seconds_end < 3600) {
      formatted_end = string_end.substr(14, 8)
    } else {
      formatted_end = string_end.substr(11, 8)
    }

    setTimeStart(a[0])
    setTimeEnd(a[1])
    setTotalTime(string_duration)
    setDisplayStart(formatted_start)
    setDisplayEnd(formatted_end)
    setSendStart(final_start)
    setSendEnd(final_end)
  }

  const customStyles = {
    stepIndicatorSize: 25,
    currentStepIndicatorSize: 30,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 3,
    stepStrokeCurrentColor: '#0066ff',
    stepStrokeWidth: 3,
    stepStrokeFinishedColor: '#0066ff',
    stepStrokeUnFinishedColor: '#0066ff',
    separatorFinishedColor: '#0066ff',
    separatorUnFinishedColor: '#0066ff',
    stepIndicatorFinishedColor: '#ffffff',
    stepIndicatorUnFinishedColor: '#ffffff',
    stepIndicatorCurrentColor: '#0066ff',
    stepIndicatorLabelFontSize: 15,
    currentStepIndicatorLabelFontSize: 15,
    stepIndicatorLabelCurrentColor: '#ffffff',
    stepIndicatorLabelFinishedColor: '#0066ff',
    stepIndicatorLabelUnFinishedColor: '#0066ff',
    labelColor: '#000000',
    labelSize: 15,
    currentStepLabelColor: '#000000',
    labelFontFamily: 'Nunito-Regular',
  }

  const basicTab = () => {
    return (
      <ScrollView>
        <View
          style={[
            styles.container,
            {
              flexDirection: 'column',
              justifyContent: 'flex-start',
            },
          ]}
        >
          {/* <Text>Preset</Text> */}
          <View style={[styles.container, { flexDirection: 'row' }]}>
            <View style={[styles.box]}>
              <Text
                style={[
                  Gutters.smallLMargin,
                  { fontFamily: 'Nunito-Regular', fontSize: 15 },
                ]}
              >
                {t('options.widthLabel')}
              </Text>
              <Input
                style={[{ fontFamily: 'Nunito-Regular', fontSize: 15 }]}
                type="number"
                keyboardType="number-pad"
                placeholder="-"
                onChange={e => setWidth(parseInt(e.nativeEvent.text, 10))}
              />
            </View>
            <View style={[styles.box]}>
              <Text
                style={[
                  Gutters.smallLMargin,
                  { fontFamily: 'Nunito-Regular', fontSize: 15 },
                ]}
              >
                {t('options.heightLabel')}
              </Text>
              <Input
                style={[{ fontFamily: 'Nunito-Regular', fontSize: 15 }]}
                type="number"
                keyboardType="number-pad"
                placeholder="-"
                onChange={e => setHeight(parseInt(e.nativeEvent.text, 10))}
              />
            </View>
          </View>
        </View>
        <View style={{ marginTop: 40 }} />
        <Text
          style={[
            Gutters.smallLMargin,
            { fontFamily: 'Nunito-Regular', fontSize: 15 },
          ]}
        >
          {t('options.compressionLabel')}
        </Text>
        <View style={{ marginTop: 20 }} />
        <StepIndicator
          customStyles={customStyles}
          currentPosition={currentPreset}
          labels={labels}
          stepCount={5}
          onPress={e => setPreset(e)}
        />

        {startButton()}
      </ScrollView>
    )
  }

  const advancedTab = () => {
    return (
      <ScrollView
        scrollEnabled={scrollEnabled}
        containerStyle={[
          styles.container,
          {
            flexDirection: 'column',
            justifyContent: 'flex-start',
          },
        ]}
      >
        <View style={[styles.container, { flexDirection: 'row' }]}>
          <View style={[styles.box]}>
            <Text
              style={[
                Gutters.smallLMargin,
                { fontFamily: 'Nunito-Regular', fontSize: 15 },
              ]}
            >
              {t('options.widthLabel')}
            </Text>
            <Input
              style={[{ fontFamily: 'Nunito-Regular', fontSize: 15 }]}
              type="number"
              keyboardType="number-pad"
              placeholder="-"
              onChange={e => setWidth(parseInt(e.nativeEvent.text, 10))}
            />
          </View>
          <View style={[styles.box]}>
            <Text
              style={[
                Gutters.smallLMargin,
                { fontFamily: 'Nunito-Regular', fontSize: 15 },
              ]}
            >
              {t('options.heightLabel')}
            </Text>
            <Input
              style={[{ fontFamily: 'Nunito-Regular', fontSize: 15 }]}
              type="number"
              keyboardType="number-pad"
              placeholder="-"
              onChange={e => setHeight(parseInt(e.nativeEvent.text, 10))}
            />
          </View>
        </View>
        <View
          style={[styles.container, { flexDirection: 'row', marginTop: 40 }]}
        >
          <View style={[styles.box]}>
            <Text
              style={[
                Gutters.smallLMargin,
                { fontFamily: 'Nunito-Regular', fontSize: 15 },
              ]}
            >
              {t('options.bitrateLabel')}
            </Text>
            <Input
              style={[{ fontFamily: 'Nunito-Regular', fontSize: 15 }]}
              type="number"
              keyboardType="number-pad"
              placeholder="-"
              onChange={e => setBitrate(parseInt(e.nativeEvent.text, 10))}
            />
          </View>
          <View style={[styles.box]}>
            <Text
              style={[
                Gutters.smallLMargin,
                { fontFamily: 'Nunito-Regular', fontSize: 15 },
              ]}
            >
              {t('options.framerateLabel')}
            </Text>
            <Input
              style={[{ fontFamily: 'Nunito-Regular', fontSize: 15 }]}
              type="number"
              keyboardType="number-pad"
              placeholder="-"
              onChange={e => setFramerate(parseInt(e.nativeEvent.text, 10))}
            />
          </View>
        </View>
        <View
          style={[styles.container, { flexDirection: 'row', marginTop: 40 }]}
        >
          <View
            style={{
              height: 50,
              width: '100%',
              flex: 1,
            }}
          >
            <Text
              style={[
                Gutters.smallLMargin,
                { fontFamily: 'Nunito-Regular', fontSize: 15 },
              ]}
            >
              {t('options.timeLabel')}
            </Text>
            <MultiSlider
              containerStyle={{
                marginLeft: 15,
                marginRight: 10,
                marginTop: 15,
                width: '100%',
                flex: 1,
              }}
              selectedStyle={{ height: 4, backgroundColor: '#0066ff' }}
              unselectedStyle={{ height: 4 }}
              markerStyle={{
                shadowColor: 'transparent',
                boxShadow: 'none',
                borderWidth: 0,
                borderColor: 'transparent',
                backgroundColor: '#0066ff',
                height: 25,
                width: 25,
              }}
              snapped={true}
              smoothSnapped={true}
              min={0}
              max={MAX_MULTISLIDER}
              step={0.1}
              values={[time_start, time_end]}
              // markerSize={1}
              onValuesChange={handleTimeSlider}
              sliderLength={320}
              onValuesChangeStart={() => setScrollEnabled(false)}
              onValuesChangeFinish={() => setScrollEnabled(true)}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 15,
              }}
            >
              <Text
                style={[
                  Gutters.regularLMargin,
                  { fontFamily: 'Nunito-Regular', fontSize: 15 },
                ]}
              >
                {/* 00:00:00 */}
                {display_start}
              </Text>
              <Text style={[{ fontFamily: 'Nunito-Regular', fontSize: 15 }]}>
                {total_time}
              </Text>
              <Text
                style={[
                  Gutters.regularRMargin,
                  { fontFamily: 'Nunito-Regular', fontSize: 15 },
                ]}
              >
                {/* 00:31:15 */}
                {display_end}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={[styles.container, { flexDirection: 'row', marginTop: 60 }]}
        >
          <View
            style={{
              height: 50,
              width: '100%',
            }}
          >
            <Text
              style={[
                Gutters.smallLMargin,
                { fontFamily: 'Nunito-Regular', fontSize: 15 },
              ]}
            >
              {t('options.volumeLabel')}
            </Text>
            <Slider
              style={{ width: '95%', alignSelf: 'center' }}
              thumbTintColor="#0066ff"
              minimumTrackTintColor="#0066ff"
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={value => {
                return setVolume(value)
              }}
              thumbStyle={{ height: 25, width: 25 }}
            />
            <Text
              style={{
                alignSelf: 'center',
                fontFamily: 'Nunito-Regular',
                fontSize: 15,
              }}
            >
              {`${Math.round(volume * 600)} %`}
            </Text>
          </View>
        </View>

        {startButton()}
      </ScrollView>
    )
  }

  const startButton = () => {
    return (
      <View
        style={{
          alignItems: 'center',
          marginTop: 50,
        }}
      >
        <Button
          title={t('options.startButton')}
          icon={
            selectedIndex === 1 &&
            !pro && (
              <Icon
                name="lock-closed"
                size={20}
                color="white"
                type="ionicon"
                style={{ marginRight: 10 }}
              />
            )
          }
          titleStyle={{ fontFamily: 'Nunito-Regular', fontSize: 20 }}
          containerStyle={
            selectedIndex === 1 && !pro
              ? { width: 150, borderRadius: 5, opacity: 0.7 }
              : { width: 150, borderRadius: 5 }
          }
          onPress={selectedIndex === 1 && !pro ? toggleModal : handleStart}
        />
      </View>
    )
  }

  const toggleModal = () => {
    setModalVisible(!modalVisible)
  }

  const handleStart = () => {
    let filePath = props?.route?.params?.filePath
    let duration = props?.route?.params?.duration

    let final_type = selectedIndex === 0 ? 'basic' : 'advanced'

    let final_width = 0,
      final_height = 0

    if (width > 0 && height > 0) {
      final_width = width
      final_height = height
    } else if (width > 0) {
      final_height = -1
    } else if (height > 0) {
      final_width = -1
    } else {
      final_width = 0
      final_height = 0
    }

    let final_start = 0
    let final_end = 0

    if (time_start > 0) {
      final_start = send_start
    }

    if (final_end === MAX_MULTISLIDER) {
      final_end = 0
    } else {
      final_end = send_end
    }

    let final_volume = volume === 0.1666 ? 0 : volume * 6

    let ffmpeg = {
      filePath,
      duration, // todo: proper one
      type: final_type, // done
      currentPreset, // done
      width: final_width, // done
      height: final_height, // done
      bitrate, // done
      framerate, // done
      time_start: final_start, //
      time_end: final_end, //
      volume: final_volume, // done
    }
    console.log('ffmpeg')
    console.log(ffmpeg)
    navigate('Processing', ffmpeg)
  }

  const handleRestorePurchases = async () => {
    try {
      const purchases = await RNIap.getAvailablePurchases()

      let ads_status = true,
        pro_status = false
      purchases.forEach(purchase => {
        switch (purchase.productId) {
          case 'videoCompressor.pro':
            pro_status = true
            break

          case 'videoCompressor.noAds':
            ads_status = false
            break
        }
      })

      setAds(ads_status)
      setPro(pro_status)

      let payment_status = {
        ads: ads_status,
        pro: pro_status,
      }

      await AsyncStorage.setItem('@payment', JSON.stringify(payment_status))

      Alert.alert('Restore Successful', 'Purchases successfully restored!')
    } catch (err) {
      Alert.alert(
        'Restore Unsuccessful',
        'There was an error while restoring purchases.',
      )
    }
  }

  const handlePurchasePro = async () => {
    try {
      const purchase = await RNIap.requestPurchase('videoCompressor.pro')

      if (purchase) {
        setPro(true)

        if (purchase) {
          setPro(true)

          let new_payment = {
            ads: true,
            pro: true,
          }

          let payment = await AsyncStorage.getItem('@payment')
          if (payment) {
            let payment_json = JSON.parse(payment)
            new_payment.ads = payment_json.ads
          }

          await AsyncStorage.setItem('@payment', JSON.stringify(new_payment))
        }
      }
    } catch (err) {
      // should be handled automatically by iOS
      // Alert.alert('Purchase Erorr', 'The purchase could not be completed.')
    }
  }

  return (
    <View
      style={[
        Layout.fill,
        Layout.column,
        Layout.justifyContentBetween,
        Gutters.smallHPadding,
        Common.backgroundWhite,
        // { flex: 1 }
      ]}
    >
      <View style={{ flex: 1 }}>
        <View
          style={[
            Layout.row,
            Layout.rowHCenter,
            Gutters.smallHPadding,
            Gutters.largeVMargin,
          ]}
        >
          <SegmentedControlTab
            values={[t('options.basicTab'), t('options.advancedTab')]}
            tabTextStyle={{ fontFamily: 'Nunito-Regular', fontSize: 15 }}
            selectedIndex={selectedIndex}
            onTabPress={index => {
              setSelectedIndex(index)

              // console.log(index)
            }}
          />
        </View>
        {selectedIndex === 0 && basicTab()}
        {selectedIndex === 1 && advancedTab()}

        <Modal
          animationType="slide"
          // transparent={true}
          presentationStyle="pageSheet"
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible)
          }}
        >
          <LinearGradient
            colors={['#7d88ff', '#58a3ff', '#8fd6ff', '#bde9ff', '#cfedfc', '#ffffff']}
            style={{ flex: 1 }}
          >
            <ScrollView
              style={[Layout.fill, Gutters.smallHPadding]}
            >
              <TouchableOpacity onPress={toggleModal}>
                <Text
                  style={{
                    fontFamily: 'Nunito-ExtraBold',
                    fontSize: 35,
                    color: 'white',
                  }}
                >
                  x
                </Text>
              </TouchableOpacity>

              <View style={{ alignItems: 'center' }}>
                <Image
                  style={{ width: 80, height: 80 }}
                  source={Images.crown}
                />
                <Text style={[Fonts.textRegular, { color: 'white' , fontFamily: 'Nunito-ExtraBold', fontSize: 25 }]}>
                  Pro Version
                </Text>
              </View>

              <View style={{backgroundColor: 'green', borderRadius: 10, padding: 15 }}>
                <Text style={{color: 'white'}}>
                  Feature1 - Feature2
                </Text>
              </View>

              <ListItem
                containerStyle={{ borderRadius: 10, marginBottom: 15 }}
                key={'img1'}
                Component={TouchableScale}
                friction={90} //
                tension={100} // These props are passed to the parent component (here TouchableScale)
                activeScale={0.95} //
                linearGradientProps={{
                  colors: ['#a459ab', '#911f9c'],
                  start: { x: 0, y: 1 },
                  end: { x: 0, y: 0 },
                }}
                ViewComponent={LinearGradient} // Only if no expo
                onPress={handlePurchasePro}
              >
                <ListItem.Content>
                  <ListItem.Title
                    style={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontFamily: 'Nunito-Regular',
                    }}
                  >
                    Hello
                  </ListItem.Title>
                </ListItem.Content>
              </ListItem>

              {/* <TouchableOpacity
                style={[Gutters.regularBMargin]}
                onPress={handlePurchasePro}
              >
                <Text style={[Fonts.textRegular, { color: 'black' }]}>
                  Buy Pro
                </Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                style={[Gutters.regularBMargin]}
                onPress={handleRestorePurchases}
              >
                <Text style={[Fonts.textRegular, { color: 'black' }]}>
                  Restore Purchases
                </Text>
              </TouchableOpacity>
              
            </ScrollView>
          </LinearGradient>
        </Modal>
      </View>

      {ads === null ? (
        <View style={{ height: 50 }} />
      ) : ads === false ? (
        <View />
      ) : (
        <BannerAd
          unitId={TestIds.BANNER}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // height: '100%',
    // marginTop: 8,
    // backgroundColor: 'aliceblue',
  },
  box: {
    width: '50%',
    height: 50,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'oldlace',
    alignSelf: 'flex-start',
    marginHorizontal: '1%',
    marginBottom: 6,
    minWidth: '48%',
    textAlign: 'center',
  },
  selected: {
    backgroundColor: 'coral',
    borderWidth: 0,
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'coral',
  },
  selectedLabel: {
    color: 'white',
  },
  label: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 24,
  },
})

export default IndexExampleContainer
