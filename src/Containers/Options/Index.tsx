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
  const [ratio, setRatio] = useState('normal') // ffmpeg has normal, fast, fastest?

  const basicTab = () => {
    return (
      <View>
        {/* <Button></Button> */}
        {/* <Input></Input> */}
        <Slider
          thumbTintColor="blue"
          value={0.33}
          thumbStyle={{ height: 30, width: 30 }}
        />
        <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 20 }}>
          Hello
        </Text>
      </View>
    )
  }

  const advancedTab = () => {
    return (
      <View>
        {/* <Input></Input> */}
        <Slider value={0.66} />
        <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 20 }}>YO</Text>
      </View>
    )
  }

  const handleStart = () => {
    let filePath = props?.route?.params?.filePath
    console.log(filePath)
    let ffmpeg = {
      filePath,
      // width
      // height
      // volume
      // bitrate
      // framerate
      // time_start
      // time_end
      // ratio
    }
    if (filePath) {
      navigate('Processing', ffmpeg)
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
              console.log(index)
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
