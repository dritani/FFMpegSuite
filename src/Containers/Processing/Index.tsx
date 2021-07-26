import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  View,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Button,
} from 'react-native'
import { Brand, CircularSlider } from '@/Components'
import { useTheme } from '@/Theme'
import FetchOne from '@/Store/User/FetchOne'
import ChangeTheme from '@/Store/Theme/ChangeTheme'
import { useTranslation } from 'react-i18next'
import { UserState } from '@/Store/User'
import { ThemeState } from '@/Store/Theme'
import { navigate } from '@/Navigators/Root'

// spinning icon at the top => Checkmark when done
// green color when 100%
// put size before => size after somewhere
// The compressed video has been saved to your files
// Finish button => Pop to first screen.

// receive FFMpeg file from screen 1
// receive FFMPeg command params from screen 2

const IndexExampleContainer = () => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout, Images } = useTheme()
  const dispatch = useDispatch()

  const user = useSelector((state: { user: UserState }) => state.user.item)
  const fetchOneUserLoading = useSelector(
    (state: { user: UserState }) => state.user.fetchOne.loading,
  )
  const fetchOneUserError = useSelector(
    (state: { user: UserState }) => state.user.fetchOne.error,
  )

  const [userId, setUserId] = useState('1')

  const fetch = (id: string) => {
    setUserId(id)
    if (id) {
      dispatch(FetchOne.action(id))
    }
  }

  const changeTheme = ({ theme, darkMode }: Partial<ThemeState>) => {
    dispatch(ChangeTheme.action({ theme, darkMode }))
  }

  return (
    <View
      style={[
        Layout.fill,
        Layout.colAroundCenter,
        Gutters.smallHPadding,
        Common.backgroundWhite,
      ]}
    >
      {/* <Image style={{ width: 100, height: 100 }} source={Images.checkmark} /> */}
      <Image style={{ width: 100, height: 100 }} source={Images.services} />
      <View>
        <CircularSlider value={45} trackWidth={15} showText={true} noThumb />

        <Text>Compressing video, please wait...</Text>
        <Text>Video saved to Files</Text>
        <Button title="Finish" onPress={() => navigate('Input')} />
      </View>

      <View />
    </View>
  )
}

export default IndexExampleContainer
