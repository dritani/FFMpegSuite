import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  View,
  Button,
  ActivityIndicator,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { Brand } from '@/Components'
import { useTheme } from '@/Theme'
import FetchOne from '@/Store/User/FetchOne'
import ChangeTheme from '@/Store/Theme/ChangeTheme'
import { useTranslation } from 'react-i18next'
import { UserState } from '@/Store/User'
import { ThemeState } from '@/Store/Theme'
import { navigate } from '@/Navigators/Root'
import { TestIds, BannerAd, BannerAdSize } from '@react-native-firebase/admob'
import { launchImageLibrary } from 'react-native-image-picker'
import DocumentPicker from 'react-native-document-picker'
import { ListItem, Avatar } from 'react-native-elements'
import TouchableScale from 'react-native-touchable-scale'
import LinearGradient from 'react-native-linear-gradient'
import FileViewer from 'react-native-file-viewer'

const IndexExampleContainer = () => {
  const list = [
    {
      name: 'Amy Farha',
      avatar_url:
        'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
      subtitle: 'Vice President',
    },
    {
      name: 'Chris Jackson',
      avatar_url:
        'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
      subtitle: 'Vice Chairman',
    },
  ]
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

  const pushNext = (path: string, params: string) => {
    navigate(path, params)
  }

  const handleLibraryPick = () => {
    launchImageLibrary(
      {
        // mediaType: 'video'
      },
      res => {
        if (!res.didCancel) {
          console.log('res:')
          console.log(res)
          console.log('assets:')
          if (res.assets.length) {
            let filePath = res.assets[0].uri
            console.log(filePath)
            navigate('Options', { filePath })
          }
        }
        // assets.uri // => will be different for Android Check out the launchImageLibrary docs
      },
    )
  }

  const handleFilePick = async () => {
    try {
      const res = await DocumentPicker.pick({
        // type: [DocumentPicker.types.video], // => necessary
      })
      // this.setState({videoURI: res.uri})
      let filePath = res.uri
      navigate('Options', { filePath })
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err
      }
    }
  }

  const handleHistory = async () => {
    pushNext('Options', 'History')
    // try {
    //   const res = await DocumentPicker.pick({
    //     type: [DocumentPicker.types.allFiles],
    //   })
    //   await FileViewer.open(res.uri)
    // } catch (e) {

    // }
  }

  return (
    <View
      style={[
        Layout.fill,
        Layout.column,
        Layout.scrollSpaceBetween,
        // Layout.scrollSpaceStart,
        Gutters.smallHPadding,
        Common.backgroundWhite,
      ]}
    >
      <ScrollView>
        <View style={{ marginBottom: 40 }}>
          <Text
            style={{
              fontFamily: 'Nunito-ExtraBold',
              fontSize: 40,
              marginBottom: 15,
            }}
          >
            Input
          </Text>

          <ListItem
            containerStyle={{ borderRadius: 10, marginBottom: 15 }}
            key={'img1'}
            Component={TouchableScale}
            friction={90} //
            tension={100} // These props are passed to the parent component (here TouchableScale)
            activeScale={0.95} //
            linearGradientProps={{
              colors: ['#a459ab', '#911f9c'],
              start: { x: 1, y: 0 },
              end: { x: 0.2, y: 0 },
            }}
            ViewComponent={LinearGradient} // Only if no expo
            onPress={handleLibraryPick}
          >
            <Avatar source={Images.photoLibrary} />
            <ListItem.Content>
              <ListItem.Title
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontFamily: 'Nunito-Regular',
                }}
              >
                Photos
              </ListItem.Title>
              <ListItem.Subtitle
                style={{ color: 'white', fontFamily: 'Nunito-Regular' }}
              >
                Media Library
              </ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron color="white" />
          </ListItem>

          <ListItem
            containerStyle={{ borderRadius: 10 }}
            key={'img2'}
            Component={TouchableScale}
            friction={90} //
            tension={100} // These props are passed to the parent component (here TouchableScale)
            activeScale={0.95} //
            linearGradientProps={{
              colors: ['#71cef0', '#0cbafa'],
              start: { x: 1, y: 0 },
              end: { x: 0.2, y: 0 },
            }}
            ViewComponent={LinearGradient} // Only if no expo
            onPress={handleFilePick}
          >
            <Avatar source={Images.files} />
            <ListItem.Content>
              <ListItem.Title
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontFamily: 'Nunito-Regular',
                }}
              >
                Files
              </ListItem.Title>
              <ListItem.Subtitle
                style={{ color: 'white', fontFamily: 'Nunito-Regular' }}
              >
                Your Files App
              </ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron color="white" />
          </ListItem>
        </View>

        <View>
          <Text
            style={{
              fontFamily: 'Nunito-ExtraBold',
              fontSize: 40,
              marginBottom: 15,
            }}
          >
            Output
          </Text>
          <ListItem
            containerStyle={{ borderRadius: 10 }}
            key={'img3'}
            Component={TouchableScale}
            friction={90}
            tension={100}
            activeScale={0.95} //
            linearGradientProps={{
              colors: ['#3fc47f', '#03964a'],
              start: { x: 1, y: 0 },
              end: { x: 0.2, y: 0 },
            }}
            ViewComponent={LinearGradient}
            onPress={handleHistory}
          >
            <Avatar source={Images.history} />
            <ListItem.Content>
              <ListItem.Title
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontFamily: 'Nunito-Regular',
                }}
              >
                History
              </ListItem.Title>
              <ListItem.Subtitle
                style={{ color: 'white', fontFamily: 'Nunito-Regular' }}
              >
                Browse Converted Files
              </ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron color="white" />
          </ListItem>
        </View>
      </ScrollView>

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
