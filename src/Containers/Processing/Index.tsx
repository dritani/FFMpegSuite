import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  View,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native'
import { Button, Icon } from 'react-native-elements'
import { Brand, CircularSlider } from '@/Components'
import { useTheme } from '@/Theme'
import FetchOne from '@/Store/User/FetchOne'
import ChangeTheme from '@/Store/Theme/ChangeTheme'
import { useTranslation } from 'react-i18next'
import { UserState } from '@/Store/User'
import { ThemeState } from '@/Store/Theme'
import { navigate } from '@/Navigators/Root'
import { TestIds, BannerAd, BannerAdSize } from '@react-native-firebase/admob'

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

  const [finished, setFinished] = useState(false)

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

  useEffect(() => {
    setTimeout(() => {
      setFinished(true)
      setProgress(99.9)
    }, 2500)
  }, [])

  const changeTheme = ({ theme, darkMode }: Partial<ThemeState>) => {
    dispatch(ChangeTheme.action({ theme, darkMode }))
  }

  const [progress, setProgress] = useState(25)

  return (
    <View
      style={[
        Layout.fill,
        Layout.colBetweenCenter,
        Gutters.smallHPadding,
        Common.backgroundWhite,
      ]}
    >
      <Image
        style={{ width: 100, height: 100 }}
        source={finished ? Images.checkmark : Images.services}
      />
      <View style={{alignItems: 'center'}}>
        <CircularSlider
          value={progress}
          trackWidth={15}
          showText={true}
          noThumb
          trackColor={finished ? '#00ff00' : '#0079e3'}
        />

        <View style={{marginTop: 15}}>
          <Text style={{fontFamily: 'Nunito-Regular', fontSize: 20}}>
            {finished
              ? 'Video saved to Files'
              : 'Compressing video, please wait...'}
          </Text>

          <View style={{ opacity: finished ? 1 : 0, marginTop: 15 }}>
            {/* <View style={{ display: 'none' }}> */}
            <Button
              icon={
                <Icon
                  name="checkmark-circle-outline"
                  size={20}
                  color="white"
                  type="ionicon"
                />
              }
              title="Finish"
              titleStyle={{marginLeft: 10, fontFamily: 'Nunito-Regular', fontSize: 20}}
              onPress={() => navigate('Input')} 
            />
          </View>
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
