import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { View } from 'react-native'
import { Slider, Input, Text, Button } from 'react-native-elements'
// import { Brand } from '@/Components'
import { useTheme } from '@/Theme'
import { useTranslation } from 'react-i18next'
import { UserState } from '@/Store/User'
import { ThemeState } from '@/Store/Theme'
import SegmentedControlTab from 'react-native-segmented-control-tab'
import { navigate } from '@/Navigators/Root'
import { TestIds, BannerAd, BannerAdSize } from '@react-native-firebase/admob'
import MultiSlider from '@ptomasroos/react-native-multi-slider'

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
  const [type, setType] = useState('basic')

  const basicTab = () => {
    return (
      <View>
        <View>
          <Button title="fastest" />
          <Button title="faster" />
          <Button title="normal" />
          <Button title="slower" />
        </View>
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
      type,
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
