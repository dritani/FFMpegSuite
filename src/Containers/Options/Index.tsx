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
        Gutters.smallHPadding,
        Common.backgroundWhite,
      ]}
    >
      <View
        style={[
          Layout.row,
          Layout.rowHCenter,
          Gutters.smallHPadding,
          Gutters.largeVMargin,
          // Common.backgroundPrimary,
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
  )
}

export default IndexExampleContainer
