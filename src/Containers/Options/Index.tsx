import React, { useState } from 'react'
import { View } from 'react-native'
import { Slider, Input, Text, Button } from 'react-native-elements'
import { useTheme } from '@/Theme'
import { useTranslation } from 'react-i18next'
import SegmentedControlTab from 'react-native-segmented-control-tab'
import { navigate } from '@/Navigators/Root'
import { TestIds, BannerAd, BannerAdSize } from '@react-native-firebase/admob'
import MultiSlider from '@ptomasroos/react-native-multi-slider'
import StepIndicator from 'react-native-step-indicator'


// width, height
// number inputBackground// keypad only
// check that they are numbers, otherwise refuse to push
// greater than 1, less than 10000
// greater than 1, less than 10000

// framerate
  // greater than 1, less than 1000

// bitrate: 50k - 1M

// time
  // 0 => 00:00:00
  // video max length accurately. convert seconds to hours:minutes:seconds in display
  // max selected by default

// volume
  // 0 to 5, default is 1






// presets
// compression ratio
// width, height
// time range (max 45s)

// advanced
// volume
// bitrate
// framerate
// time (full)

const IndexExampleContainer = props => {
  const { t } = useTranslation()

  const { Common, Fonts, Gutters, Layout } = useTheme()

  const [selectedIndex, setSelectedIndex] = useState(0)

  const [width, setWidth] = useState(null)
  const [height, setHeight] = useState(null)
  const [volume, setVolume] = useState(null)
  const [time_start, setTimeStart] = useState(null)
  const [time_end, setTimeEnd] = useState(null)
  const [framerate, setFramerate] = useState(null)
  const [bitrate, setBitrate] = useState(null)
  const [preset, setPreset] = useState(null) // ffmpeg has normal, fast, fastest?
  // might be better to use crf values

  const [currentPosition] = useState(0)
  const labels = [
    'Cart',
    'Delivery Address',
    'Order Summary',
    'Payment Method',
    'Track',
  ]

  const customStyles = {
    stepIndicatorSize: 25,
    currentStepIndicatorSize: 30,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 3,
    stepStrokeCurrentColor: '#fe7013',
    stepStrokeWidth: 3,
    stepStrokeFinishedColor: '#fe7013',
    stepStrokeUnFinishedColor: '#aaaaaa',
    separatorFinishedColor: '#fe7013',
    separatorUnFinishedColor: '#aaaaaa',
    stepIndicatorFinishedColor: '#fe7013',
    stepIndicatorUnFinishedColor: '#ffffff',
    stepIndicatorCurrentColor: '#ffffff',
    stepIndicatorLabelFontSize: 13,
    currentStepIndicatorLabelFontSize: 13,
    stepIndicatorLabelCurrentColor: '#fe7013',
    stepIndicatorLabelFinishedColor: '#ffffff',
    stepIndicatorLabelUnFinishedColor: '#aaaaaa',
    labelColor: '#999999',
    labelSize: 13,
    currentStepLabelColor: '#fe7013',
  }

  const basicTab = () => {
    return (
      <View>
        {/* <View>
          <Button title="fastest" onPress={() => {}} />
          <Button title="faster" />
          <Button title="normal" />
          <Button title="slower" />
        </View> */}
        {/* <StepIndicator
          customStyles={customStyles}
          currentPosition={currentPosition}
          labels={labels}
        /> */}

        
        <View
        //  style={{ flex: 1 }}
        >
          <Input style={{flex: 1}} type="number" placeholder={t('options.widthLabel')} />
          <Text>X</Text>
          <Input style={{flex: 1}} type="number" placeholder={t('options.heightLabel')} />
        </View>
        {/* <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 100,
          }}
        >
          <Input
            style={{ marginTop: 40 }}
            label={t('options.widthLabel')}
            type="number"
            placeholder="optional1"
          />
          <Input
            label={t('options.heightLabel')}
            type="number"
            placeholder="optional2"
          />
        </View> */}
      </View>
    )
  }

  const advancedTab = () => {
    return (
      <View>
        <View>
          <Input type="text" placeholder={t('options.widthLabel')} />
          <Input type="text" placeholder={t('options.heightLabel')} />
        </View>

        <Input type="text" placeholder={t('options.bitrateLabel')} />
        <Input type="text" placeholder={t('options.framerateLabel')} />

        <MultiSlider values={[100, 200]} />
        <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 20 }}>{t('options.timeLabel')}</Text>

        <Slider
          thumbTintColor="blue"
          value={0.33}
          thumbStyle={{ height: 30, width: 30 }}
        />
        <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 20 }}>
          {t('options.volumeLabel')}
        </Text>
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

export default IndexExampleContainer
