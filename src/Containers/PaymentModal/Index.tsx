import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  View,
  ActivityIndicator,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
} from 'react-native'
import { Brand } from '@/Components'
import { goBack } from '@/Navigators/Root'
import { useTheme } from '@/Theme'
import FetchOne from '@/Store/User/FetchOne'
import ChangeTheme from '@/Store/Theme/ChangeTheme'
import { useTranslation } from 'react-i18next'
import { UserState } from '@/Store/User'
import { ThemeState } from '@/Store/Theme'

const IndexExampleContainer = () => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
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
    <View style={[Layout.fill, Layout.colCenter, Gutters.smallHPadding]}>
      <Text style={[Fonts.textRegular, Gutters.smallBMargin]}>DarkMode :</Text>

      <TouchableOpacity
        style={[Common.button.rounded, Gutters.regularBMargin]}
        onPress={() => changeTheme({ darkMode: null })}
      >
        <Text style={Fonts.textRegular}>Auto</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[Common.button.outlineRounded, Gutters.regularBMargin]}
        onPress={() => changeTheme({ darkMode: true })}
      >
        <Text style={Fonts.textRegular}>Dark</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[Common.button.outline, Gutters.regularBMargin]}
        onPress={() => changeTheme({ darkMode: false })}
      >
        <Text style={Fonts.textRegular}>Light</Text>
      </TouchableOpacity>

      <Button onPress={() => goBack()} title="Dismiss" />
    </View>
  )
}

export default IndexExampleContainer
