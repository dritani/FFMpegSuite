import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { View, Button } from 'react-native'
import { Slider, Input, Text } from 'react-native-elements'
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

const IndexExampleContainer = () => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()

  const [selectedIndex, setSelectedIndex] = useState(0)

  const basicTab = () => {
    return (
      <View>
        {/* <Button></Button> */}
        {/* <Input></Input> */}
        <Slider value={0.33} />
        <Text>Hello</Text>
      </View>
    )
  }

  const advancedTab = () => {
    return (
      <View>
        {/* <Input></Input> */}
        <Slider value={0.66} />
        <Text>YO</Text>
      </View>
    )
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
          selectedIndex={selectedIndex}
          onTabPress={index => {
            setSelectedIndex(index)
            console.log(index)
          }}
        />
      </View>
      {selectedIndex === 0 && basicTab()}
      {selectedIndex === 1 && advancedTab()}
      <Button title="Start" onPress={() => navigate('Processing', '')} />
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
