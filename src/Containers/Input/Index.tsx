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
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NativeModules, Platform, Alert } from 'react-native'
import i18n from 'i18next'
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions'
import { Config } from '@/Config'
import RNFS from 'react-native-fs'
import RNFetchBlob from 'rn-fetch-blob'

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
    if (Platform.OS === 'ios') {
      // AsyncStorage => NOPE!!! Check every time.
      check(PERMISSIONS.IOS.PHOTO_LIBRARY)
        .then(result => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              Alert.alert(
                'Error',
                'Importing images is not available on this device.',
              )
              break
            case RESULTS.DENIED:
              // The permission has not been requested / is denied but requestable
              request(PERMISSIONS.IOS.PHOTO_LIBRARY).then(result => {
                switch (result) {
                  case RESULTS.UNAVAILABLE:
                    // This feature is not available (on this device / in this context)
                    break
                  case RESULTS.DENIED:
                    // The permission has not been requested / is denied but requestable
                    break
                  case RESULTS.LIMITED:
                    // The permission is limited: some actions are possible
                    openPicker()
                    break
                  case RESULTS.GRANTED:
                    // The permission is granted
                    openPicker()
                    break
                  case RESULTS.BLOCKED:
                    // The permission is denied and not requestable anymore
                    break
                }
              })
              break
            case RESULTS.LIMITED:
              // The permission is limited: some actions are possible
              openPicker()
              break
            case RESULTS.GRANTED:
              // The permission is granted
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
        async res => {
          setAllowPicker(true)
          console.log('res')
          console.log(res)
          if (res && !res.didCancel) {
            if (res && res.assets && res.assets.length) {
              let asset = res.assets[0]
              console.log('assets image picker')
              console.log(asset.uri)
              // content://com.google.android.apps.photos.contentprovider/0/2/mediakey%3A%2Flocal%253A66cda7a8-78e7-4437-8718-c42b61d89494/ORIGINAL/NONE/video%2Fmpeg/273752150
              // ^ doesn't work
              // importing worked though??
              // let filePath = decodeURIComponent(asset.uri)
              // console.log('filePath')
              // console.log(filePath)
              let filePath = asset.uri
              // this works, but in the end gives:
              // [NULL @ 0xe5de94e0] Unable to find a suitable output format for '/data/user/0/ml.devcraft.VideoCompressor/files/1235143560'

              // content://com.google.android.apps.photos.contentprovider/0/2/mediakey:/local%3A66cda7a8-78e7-4437-8718-c42b61d89494/ORIGINAL/NONE/video/mpeg/1523332324
              // ^ permission denial requires the provider be exported, or grantUriPermission()
              if (filePath.startsWith('content://')) {
                const uriComponents = filePath.split('/')
                console.log('uriComponents')
                console.log(uriComponents)
                // uriComponents
                // ["content:", "", "com.google.android.apps.photos.contentprovider", "0", "2", "mediakey%3A%2Flocal%253A66cda7a8-78e7-4437-8718-c42b61d89494", "ORIGINAL", "NONE", "video%2Fmpeg", "374009142"]
                const fileNameAndExtension =
                  uriComponents[uriComponents.length - 1]
                console.log('fileNameAndExtension')
                console.log(fileNameAndExtension)

                // need to add the extension in the next screen through FFMpeg and MIME types, using a switch statement
                // default case: .mp4
                const destPath = `${RNFS.TemporaryDirectoryPath}/${fileNameAndExtension}.mp4`
                await RNFS.copyFile(filePath, destPath)

                console.log('destPath image')
                console.log(destPath)
                // navigate('Options', { filePath })

                navigate('Options', { filePath: destPath })
              } else {
                let fp = decodeURIComponent(asset.uri)
                navigate('Options', { filePath: fp })
              }
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

      console.log('assets file picker')
      console.log(res.uri)
      // content://com.android.providers.downloads.documents/document/raw%3A%2Fstorage%2Femulated%2F0%2FDownload%2Fsample2.mp4
      // ^ doesn't work. No such file or directory
      // let filePath = decodeURIComponent(res.uri)
      let filePath = res.uri
      console.log('filePath')
      console.log(filePath)
      // content://com.android.providers.downloads.documents/document/raw:/storage/emulated/0/Download/sample2.mp4
      // ^ Permission Denial requires that you obtain access using ACTION_OPEN_DOCUMENT or related APIs
      if (filePath.startsWith('content://')) {
        const stat = await RNFetchBlob.fs.stat(filePath)
        console.log('stat')
        console.log(stat)
        navigate('Options', { filePath: stat.path }) 
        // const uriComponents = filePath.split('/')
        // console.log('uriComponents')
        // console.log(uriComponents)
        // const fileNameAndExtension = uriComponents[uriComponents.length - 1]
        // const destPath = `${RNFS.TemporaryDirectoryPath}/${fileNameAndExtension}`
        // await RNFS.copyFile(filePath, destPath)
        // // let filePath = decodeURIComponent(asset.uri)
        // // navigate('Options', { filePath })
        // console.log('destPath file')
        // console.log(destPath)
        // navigate('Options', { filePath: destPath })
      } else {
        let fp = decodeURIComponent(res.uri)
        navigate('Options', { filePath: fp })
      }
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
