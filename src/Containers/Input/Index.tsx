import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useTheme } from '@/Theme'
import { useTranslation } from 'react-i18next'
import { navigate } from '@/Navigators/Root'
import { TestIds, BannerAd, BannerAdSize } from '@react-native-firebase/admob'
import { launchImageLibrary } from 'react-native-image-picker'
import DocumentPicker from 'react-native-document-picker'
import { ListItem, Avatar } from 'react-native-elements'
import TouchableScale from 'react-native-touchable-scale'
import LinearGradient from 'react-native-linear-gradient'
import FileViewer from 'react-native-file-viewer'
import MediaMeta from 'react-native-media-meta'
import RNFS from 'react-native-fs'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NativeModules, Platform, Alert } from 'react-native'
import i18n from 'i18next'
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions'
import { Config } from '@/Config'

const bannerId = __DEV__ ? TestIds.BANNER : Config.BANNER_ID

const IndexExampleContainer = () => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout, Images } = useTheme()

  const [ads, setAds] = useState(null)
  const [allowPicker, setAllowPicker] = useState(true)

  const getSavedLocale = async () => {
    let locale = 'en'
    let language = await AsyncStorage.getItem('@language')

    if (language) {
      locale = language
    } else {
      let platform_language =
        Platform.OS === 'ios'
          ? NativeModules.SettingsManager.settings.AppleLocale ||
            NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
          : NativeModules.I18nManager.localeIdentifier
      locale = platform_language.substring(0, 2)
    }

    i18n.changeLanguage(locale)
  }

  const getPaymentStatus = async () => {
    let payment = await AsyncStorage.getItem('@payment')
    if (payment) {
      // initially it might not exist.
      let payment_json = JSON.parse(payment)
      setAds(payment_json.ads)
    } else {
      setAds(true)
    }
  }

  const handleLibraryPick = () => {
    // if (1) {
    //   openPicker()
    // }
    // return
    if (Platform.OS === 'ios') {
      // AsyncStorage => NOPE!!! Check every time.
      check(PERMISSIONS.IOS.PHOTO_LIBRARY)
        .then(result => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              console.log('Error: unavailable')
              Alert.alert(
                'Error',
                'Importing images is not available on this device.',
              )
              break
            case RESULTS.DENIED:
              console.log(
                'The permission has not been requested / is denied but requestable',
              )
              request(PERMISSIONS.IOS.PHOTO_LIBRARY).then(result => {
                switch (result) {
                  case RESULTS.UNAVAILABLE:
                    console.log(
                      'This feature is not available (on this device / in this context)',
                    )
                    break
                  case RESULTS.DENIED:
                    console.log(
                      'The permission has not been requested / is denied but requestable',
                    )
                    break
                  case RESULTS.LIMITED:
                    console.log(
                      'The permission is limited: some actions are possible',
                    )
                    openPicker()
                    break
                  case RESULTS.GRANTED:
                    console.log('The permission is granted')
                    openPicker()
                    break
                  case RESULTS.BLOCKED:
                    console.log(
                      'The permission is denied and not requestable anymore',
                    )
                    break
                }
              })
              break
            case RESULTS.LIMITED:
              console.log(
                'The permission is limited: some actions are possible',
              )
              openPicker()
              break
            case RESULTS.GRANTED:
              console.log('The permission is granted')
              openPicker()
              break
            case RESULTS.BLOCKED:
              Alert.alert(
                'Permissions',
                'Please grant the app image library permissions in Settings.',
              )
              break
          }
        })
        .catch(error => {
          Alert.alert(
            'Permissions',
            'Please grant the app image library permissions in Settings.',
          )
        })
    } else {
      openPicker()
    }
  }

  const openPicker = () => {
    if (allowPicker) {
      setAllowPicker(false)
      launchImageLibrary(
        {
          mediaType: 'video',
        },
        res => {
          setAllowPicker(true)
          if (!res.didCancel) {
            if (res.assets.length) {
              console.log('res')
              console.log(res)
              let asset = res.assets[0]
              let filePath = decodeURIComponent(asset.uri)
              // let duration = asset.duration
              navigate('Options', { filePath })
            }
          }
          // assets.uri // => will be different for Android Check out the launchImageLibrary docs
        },
      )
    }
  }

  const handleFilePick = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.video], // => necessary
      })

      let filePath = decodeURIComponent(res.uri)
      console.log('res: ', res)

      navigate('Options', { filePath })
      // MediaMeta.get(filePath)
      //   .then(metadata => {
      //     console.log('file pick successful: ', metadata)
      //     let duration = metadata.duration
      //     navigate('Options', { filePath, duration })
      //   })
      //   .catch(err => {
      //     console.log('file pick error: ', err)
      //   })
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        throw err
      }
    }
  }

  const handleHistory = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        mode: 'open',
      })
      await FileViewer.open(res.uri)
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        throw err
      }
    }
  }

  useEffect(() => {
    getPaymentStatus()
    getSavedLocale()
  }, [])

  return (
    <View
      style={[
        Layout.fill,
        Layout.column,
        Layout.scrollSpaceBetween,
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
            {t('input.inputLabel')}
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
                {t('input.photosTitle')}
              </ListItem.Title>
              <ListItem.Subtitle
                style={{ color: 'white', fontFamily: 'Nunito-Regular' }}
              >
                {t('input.photosSubtitle')}
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
                {t('input.filesTitle')}
              </ListItem.Title>
              <ListItem.Subtitle
                style={{ color: 'white', fontFamily: 'Nunito-Regular' }}
              >
                {t('input.filesSubtitle')}
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
            {t('input.outputLabel')}
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
                {t('input.historyTitle')}
              </ListItem.Title>
              <ListItem.Subtitle
                style={{ color: 'white', fontFamily: 'Nunito-Regular' }}
              >
                {t('input.historySubtitle')}
              </ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron color="white" />
          </ListItem>
        </View>
      </ScrollView>

      {ads === null ? (
        <View />
      ) : ads === false ? (
        <View />
      ) : (
        <BannerAd
          unitId={bannerId}
          size={BannerAdSize.SMART_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdLoaded={() => {}}
          onAdFailedToLoad={error => {}}
        />
      )}
    </View>
  )
}

export default IndexExampleContainer
