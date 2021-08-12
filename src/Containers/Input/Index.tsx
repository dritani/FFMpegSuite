import React, { useState, useEffect } from 'react'
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

const IndexExampleContainer = () => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout, Images } = useTheme()

  const handleLibraryPick = () => {
    launchImageLibrary(
      {
        mediaType: 'video',
      },
      res => {
        if (!res.didCancel) {
          if (res.assets.length) {
            let asset = res.assets[0]
            let filePath = asset.uri
            let duration = asset.duration
            navigate('Options', { filePath, duration })
          }
        }
        // assets.uri // => will be different for Android Check out the launchImageLibrary docs
      },
    )
  }

  const handleFilePick = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.video], // => necessary
      })

      let filePath = res.uri
      console.log('res: ', res)

      navigate('Options', { filePath, duration: 31 })
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
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err
      }
    }
  }

  const handleHistory = async () => {
    // WORKS!!! But there is no longer any need.
    // let folderPath = `${RNFS.DocumentDirectoryPath}/Hello`
    // RNFS.mkdir(folderPath, {
    //   NSURLIsExcludedFromBackupKey: true,
    // })
    // console.log('directory "Hello" created')

    // pushNext('Options', 'History')
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        mode: 'open',
      })
      await FileViewer.open(res.uri)
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err
      }
    }
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

      {/* <View>
        
      </View> */}
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
