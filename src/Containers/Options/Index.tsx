import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Slider, Input, Text, Button } from 'react-native-elements'
import { useTheme } from '@/Theme'
import { useTranslation } from 'react-i18next'
import SegmentedControlTab from 'react-native-segmented-control-tab'
import { navigate } from '@/Navigators/Root'
import { TestIds, BannerAd, BannerAdSize } from '@react-native-firebase/admob'
import MultiSlider from '@ptomasroos/react-native-multi-slider'
import StepIndicator from 'react-native-step-indicator'
import { getMediaInformation } from '@/Utils'

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
  const { Common, Fonts, Gutters, Layout } = useTheme()

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollEnabled, setScrollEnabled] = useState(true)
  const labels = [t('options.slowerLabel'), '', '', t('options.fasterLabel')]

  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [bitrate, setBitrate] = useState(0)
  const [framerate, setFramerate] = useState(0)
  const [time_start, setTimeStart] = useState(100)
  const [time_end, setTimeEnd] = useState(200)
  const [total_time, setTotalTime] = useState(0)
  const [display_start, setDisplayStart] = useState(0)
  const [display_end, setDisplayEnd] = useState(0)
  const [send_start, setSendStart] = useState(0)
  const [send_end, setSendEnd] = useState(0)
  // const [seconds, setSeconds] = useState(0)
  const [volume, setVolume] = useState(0.1666)
  const [currentPreset, setPreset] = useState(2)

  useEffect(() => {
    let ffprobeCommand = props?.route?.params?.filePath
    setTotalTime(props?.route?.params?.duration)
    handleTimeSlider([0, 300])
    getMediaInformation(ffprobeCommand).then(result => {
      console.log(`FFPROBE: ${result}`)
      console.log(result.getMediaProperties())
      console.log(result.getAllProperties())
      if (result !== 0) {
        //
      }
    })
  }, [])

  const getDisplayString = seconds => {
    return new Date(seconds * 1000).toISOString().substr(11, 8)
  }
  
  const getSendString = seconds => {
    return new Date(seconds * 1000).toISOString().substr(11, 8)
  }

  const handleTimeSlider = a => {
    let delta = ((a[1] - a[0]) / 300) * props?.route?.params?.duration
    let dur = Math.round((delta + Number.EPSILON) * 100) / 100

    let seconds_start = (a[0] / 300) * props?.route?.params?.duration
    let formatted_start = getDisplayString(seconds_start)

    let seconds_end = (a[1] / 300) * props?.route?.params?.duration
    let formatted_end = getDisplayString(seconds_end)

    // "1970-01-01T00:16:40.500Z"
    // if seconds < 3600

    setTimeStart(a[0])
    setTimeEnd(a[1])
    setTotalTime(dur)
    setDisplayStart(formatted_start)
    setDisplayEnd(formatted_end)
    setSendStart(formatted_start)
    setSendEnd(formatted_end)
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
                marginRight: 15,
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
              max={300}
              step={0.1}
              values={[time_start, time_end]}
              // markerSize={1}
              onValuesChange={handleTimeSlider}
              sliderLength={320}
              onValuesChangeStart={() => setScrollEnabled(false)}
              onValuesChangeFinish={() => setScrollEnabled(true)}
            />
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
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
                {`${total_time} s`}
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
          titleStyle={{ fontFamily: 'Nunito-Regular', fontSize: 20 }}
          containerStyle={{ width: 150, borderRadius: 5 }}
          onPress={handleStart}
        />
      </View>
    )
  }

  const handleStart = () => {
    let filePath = props?.route?.params?.filePath
    let duration = props?.route?.params?.duration

    let ffmpeg = {
      filePath,
      duration,
      type: selectedIndex === 0 ? 'basic' : 'advanced',
      currentPreset,
      width,
      height,
      bitrate,
      framerate,
      time_start,
      time_end,
      volume: volume === 0.1666 ? 0 : volume * 6, // done
    }
    navigate('Processing', ffmpeg)
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
      </View>

      <View
        // style={{ justifyContent: 'flex-end'}}
        style={{ height: 50 }}
      />
      {/* <BannerAd
          unitId={TestIds.BANNER}
          size={BannerAdSize.SMART_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdLoaded={() => {
            // console.log('Advert loaded')
          }}
          onAdFailedToLoad={error => {
            // console.error('Advert failed to load: ', error)
          }}
        /> */}
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
