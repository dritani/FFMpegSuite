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
  const [width, setWidth] = useState(null)
  const [height, setHeight] = useState(null)
  const [volume, setVolume] = useState(0.166)
  const [time_start, setTimeStart] = useState(null)
  const [time_end, setTimeEnd] = useState(null)
  const [framerate, setFramerate] = useState(null)
  const [bitrate, setBitrate] = useState(null)
  const [preset] = useState(null) // ffmpeg has normal, fast, fastest?
  // might be better to use crf values

  const [currentPreset, setPreset] = useState(2)
  const labels = [t('options.slowerLabel'), '', '', t('options.fasterLabel')]

  useEffect(() => {
    let ffprobeCommand = props?.route?.params?.filePath
    getMediaInformation(ffprobeCommand).then(result => {
      console.log(`result: ${result}`)
      if (result !== 0) {
        
      }
    })
  }, [])

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
      <View>
        <View
          style={[
            styles.container,
            { flexDirection: 'column', justifyContent: 'flex-start' },
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
                keyboardType="numeric"
                placeholder="-"
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
                keyboardType="numeric"
                placeholder="-"
              />
            </View>
          </View>
        </View>
        <View style={{ marginTop: 100 }} />
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
      </View>
    )
  }

  const advancedTab = () => {
    return (
      <ScrollView
        scrollEnabled={scrollEnabled}
        containerStyle={[
          styles.container,
          { flexDirection: 'column', justifyContent: 'flex-start' },
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
              keyboardType="numeric"
              placeholder="-"
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
              keyboardType="numeric"
              placeholder="-"
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
              keyboardType="numeric"
              placeholder="-"
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
              keyboardType="numeric"
              placeholder="-"
            />
          </View>
        </View>
        <View
          style={[styles.container, { flexDirection: 'row', marginTop: 40 }]}
        >
          <View
            style={{
              height: 50,
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
              containerStyle={{ marginLeft: 10 }}
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
              step={25}
              values={[100, 200]}
              onValuesChange={a => console.log(a)}
              sliderLength={350}
              onValuesChangeStart={() => setScrollEnabled(false)}
              onValuesChangeFinish={() => setScrollEnabled(true)}
            />
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text
                style={[
                  Gutters.smallLMargin,
                  { fontFamily: 'Nunito-Regular', fontSize: 15 },
                ]}
              >
                00:00:00
              </Text>
              <Text style={[{ fontFamily: 'Nunito-Regular', fontSize: 15 }]}>
                51 s
              </Text>
              <Text
                style={[
                  Gutters.smallRMargin,
                  { fontFamily: 'Nunito-Regular', fontSize: 15 },
                ]}
              >
                00:31:15
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
              100 %
            </Text>
          </View>
        </View>
      </ScrollView>
    )
  }

  const handleStart = () => {
    let filePath = props?.route?.params?.filePath
    let duration = props?.route?.params?.duration
    let ffmpeg = {
      filePath,
      duration,
      type: selectedIndex === 0 ? 'basic' : 'advanced',
      preset,
      width,
      height,
      time_start,
      time_end,
      volume,
      bitrate,
      framerate,
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
      ]}
    >
      <View>
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
        <View
          style={{
            alignItems: 'center',
            marginTop: 15,
          }}
        >
          <Button
            title={t('options.startButton')}
            titleStyle={{ fontFamily: 'Nunito-Regular', fontSize: 20 }}
            containerStyle={{ width: 150, borderRadius: 5 }}
            onPress={handleStart}
          />
        </View>
      </View>
      <BannerAd
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
      />
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
