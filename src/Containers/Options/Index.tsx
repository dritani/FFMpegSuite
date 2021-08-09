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

// presets
// compression ratio
// width, height
// time range (max 45s)

// advanced
// volume
// bitrate
// framerate
// width, height
// time (full)

const IndexExampleContainer = props => {
  const { t } = useTranslation()

  const { Common, Fonts, Gutters, Layout } = useTheme()

  const [selectedIndex, setSelectedIndex] = useState(0)

  const [width, setWidth] = useState(400)
  const [height, setHeight] = useState(400)
  const [volume, setVolume] = useState(100)
  const [time_start, setTimeStart] = useState(0)
  const [time_end, setTimeEnd] = useState(300)
  const [framerate, setFramerate] = useState(30) // fps
  const [bitrate, setBitrate] = useState(1200)
  const [preset, setPreset] = useState('ultrafast') // ffmpeg has normal, fast, fastest?
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
        <View>
          <Button title="fastest" />
          <Button title="faster" />
          <Button title="normal" />
          <Button title="slower" />
        </View>
        <StepIndicator
          customStyles={customStyles}
          currentPosition={currentPosition}
          labels={labels}
        />
        <View>
          <Input type="text" placeholder="Width" />
          <Input type="text" placeholder="Height" />
        </View>
      </View>
    )
  }

  const advancedTab = () => {
    return (
      <View>
        <View>
          <Input type="text" placeholder="Width" />
          <Input type="text" placeholder="Height" />
        </View>

        <Input type="text" placeholder="Bitrate" />
        <Input type="text" placeholder="Framerate" />

        <MultiSlider values={[100, 200]} />
        <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 20 }}>Time</Text>

        <Slider
          thumbTintColor="blue"
          value={0.33}
          thumbStyle={{ height: 30, width: 30 }}
        />
        <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 20 }}>
          Volume
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
            values={['Basic', 'Advanced']}
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
            title="Start"
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
