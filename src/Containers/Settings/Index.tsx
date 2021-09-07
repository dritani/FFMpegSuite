import React, { useState, useEffect, createContext, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  View,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  NativeModules,
  Share,
} from 'react-native'
import { Brand } from '@/Components'
import { useTheme } from '@/Theme'
import FetchOne from '@/Store/User/FetchOne'
import ChangeTheme from '@/Store/Theme/ChangeTheme'
import { useTranslation } from 'react-i18next'
import { UserState } from '@/Store/User'
import { ThemeState } from '@/Store/Theme'
// import RNIap, {
//   Product,
//   ProductPurchase,
//   PurchaseError,
//   InAppPurchase,
//   finishTransaction,
//   acknowledgePurchaseAndroid,
//   purchaseErrorListener,
//   purchaseUpdatedListener,
// } from 'react-native-iap'
import RNIap, {
  InAppPurchase,
  Product,
  PurchaseError,
  finishTransaction,
} from 'react-native-iap';
import i18n from 'i18next'
import Rate, { AndroidMarket } from 'react-native-rate'
import type { PickerItem } from 'react-native-woodpicker'
import { Picker } from 'react-native-woodpicker'
import { ListItem, Icon } from 'react-native-elements'
import { TestIds, BannerAd, BannerAdSize } from '@react-native-firebase/admob'
import AsyncStorage from '@react-native-async-storage/async-storage'

// let purchaseUpdateSubscription: EmitterSubscription
// let purchaseErrorSubscription: EmitterSubscription

const IndexExampleContainer = () => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()

  const languages: Array<PickerItem> = [
    { label: '🇺🇸 English', value: 'en' },
    { label: '🇨🇳 中文', value: 'zh' },
    { label: '🇫🇷 Français', value: 'fr' },
    { label: '🇩🇪 Deutsch', value: 'de' },
    { label: '🇯🇵 日本', value: 'ja' },
    { label: '🇪🇸 Española', value: 'es' },
    { label: '🇧🇷 Português', value: 'pt' },
    { label: '🇮🇹 Italiana', value: 'it' },
  ]

  const [pickedLang, setPickedLang] = useState<PickerItem>({
    label: '🇺🇸 English',
    value: 'en',
  })

  const itemSkus = Platform.select({
    ios: ['videoCompressor.noAds', 'videoCompressor.pro'],
    android: ['videoCompressor.noAds', 'videoCompressor.pro'], // todo
  })

  const [productsList, setProductsList] = useState([])

  const IAPContext = createContext<IAPContext>({
    isSubscription: false,
    subscription: undefined,
    showPurchase: () => {},
  })

  const getProducts = useCallback(async (): Promise<void> => {
    RNIap.clearProductsIOS()

    try {
      const result = await RNIap.initConnection()
      // await RNIap.flushFailedPurchasesCachedAsPendingAndroid()
    } catch (err) {
      //
    }

    const products = await RNIap.getProducts(itemSkus)
    products.forEach((product) => {
      product.type = 'inapp'
    })

    console.log('products: ')
    console.log(products)

    setProductsList(products)
  }, [productsList])

  useEffect(() => {
    initializePicker()
    getProducts()
  }, [])

  const initializePicker = async () => {
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

    let lang_filter = languages.filter(lng => lng.value === locale)
    if (lang_filter.length > 0) {
      setPickedLang(lang_filter[0])
    }
  }

  const handleSelectLanguage = (lng: PickerItem) => {
    setPickedLang(lng)
    i18n.changeLanguage(lng.value)
    AsyncStorage.setItem('@language', lng.value)
  }

  const handlePurchase = (item: Product): void => {
    RNIap.requestPurchase(item.productId)
  }

  const handleRestorePurchases = async () => {
    try {
      const purchases = await RNIap.getAvailablePurchases()
      const newState = { premium: false, ads: true }
      let restoredTitles = []

      purchases.forEach(purchase => {
        switch (purchase.productId) {
          case 'videoCompressor.pro':
            newState.premium = true
            restoredTitles.push('Premium Version')
            break

          case 'videoCompressor.noAds':
            newState.ads = false
            restoredTitles.push('No Ads')
            break
        }
      })

      // setState
      Alert.alert('Restore Successful', 'You successfully restored the following purchases: ' + restoredTitles.join(', '));
    } catch (err) {
      console.warn(err) // standardized err.code and err.message available
    }
  }

  const handleRate = () => {
    const options = {
      AppleAppID: '2193813192', // after publishing?
      GooglePackageName: 'ml.devcraft.videocompressor',
      AmazonPackageName: 'ml.devcraft.videocompressor',
      // OtherAndroidURL: 'http://www.randomappstore.com/app/47172391',
      preferredAndroidMarket: AndroidMarket.Google,
      preferInApp: false,
      openAppStoreIfInAppFails: true,
      fallbackPlatformURL: 'http://www.mywebsite.com/myapp.html', // put your app link
    }
    Rate.rate(options, success => {
      if (success) {
        // this technically only tells us if the user successfully went to the Review Page. Whether they actually did anything, we do not know.
        // this.setState({rated:true})
        // setRated(true)
      }
    })
  }

  const handleRecommend = async () => {
    try {
      const result = await Share.share({
        message: 'google.com',
      })
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      // alert(error.message)
    }
  }

  // language picker component:
  // https://github.com/thodubois/react-native-woodpicker
  return (
    <View
      style={[
        Layout.fill,
        Layout.column,
        { backgroundColor: '#f2f2f2', justifyContent: 'space-between' },
      ]}
    >
      <View>
        <View style={Gutters.smallTMargin}>
          <ListItem key="row_lang" topDivider bottomDivider>
            <Icon name="globe-outline" type="ionicon" />
            <ListItem.Content>
              <View style={Layout.rowBetween}>
                <Text style={Fonts.blackSettings}>
                  {t('settings.language')}
                </Text>
                <Picker
                  item={pickedLang}
                  items={languages}
                  // onItemChange={setPickedLang}
                  onItemChange={handleSelectLanguage}
                  title="Language Picker"
                  placeholder="Select Language"
                  isNullable
                  //backdropAnimation={{ opactity: 0 }}
                  //mode="dropdown"
                  //isNullable
                  //disable
                />
              </View>
            </ListItem.Content>
          </ListItem>
          <ListItem key={'row_rating'} bottomDivider onPress={handleRate}>
            <Icon name="star" type="ionicon" />
            <ListItem.Content>
              <View style={Layout.rowBetween}>
                <Text style={Fonts.blackSettings}>{t('settings.rateUs')}</Text>
                <ListItem.Chevron />
              </View>
            </ListItem.Content>
          </ListItem>
          <ListItem
            key={'row_recommend'}
            bottomDivider
            onPress={handleRecommend}
          >
            <Icon name="share-social" type="ionicon" />
            <ListItem.Content>
              <View style={Layout.rowBetween}>
                <Text style={Fonts.blackSettings}>
                  {t('settings.recommendApp')}
                </Text>
                <ListItem.Chevron />
              </View>
            </ListItem.Content>
          </ListItem>
        </View>

        <View style={Gutters.smallTMargin}>
          <ListItem
            key={'row_ads'}
            topDivider
            bottomDivider
            // onPress={handlePurchaseAds}
            onPress={() => handlePurchase('ads')}
          >
            <Icon name="close-circle-outline" type="ionicon" />
            <ListItem.Content>
              <View style={Layout.rowBetween}>
                <Text style={Fonts.blackSettings}>
                  {t('settings.removeAds')}
                </Text>
                <Text style={Fonts.greySettings}>$ 0.99</Text>
                {/* <ListItem.Chevron /> */}
              </View>
            </ListItem.Content>
          </ListItem>
          <ListItem 
            key={'row_pro'}
            bottomDivider
            // onPress={handlePurchasePro}
            onPress={() => handlePurchase('pro')}
          >
            <Icon name="key" type="ionicon" />
            <ListItem.Content>
              <View style={Layout.rowBetween}>
                <Text style={Fonts.blackSettings}>
                  {t('settings.proVersion')}
                </Text>
                <Text style={Fonts.greySettings}>$ 1.99</Text>
                {/* <ListItem.Chevron /> */}
              </View>
            </ListItem.Content>
          </ListItem>
          <ListItem
            key={'row_restore'}
            bottomDivider
            onPress={handleRestorePurchases}
          >
            <Icon name="refresh" type="ionicon" />
            <ListItem.Content>
              <View style={Layout.rowBetween}>
                <Text style={Fonts.blackSettings}>
                  {t('settings.restorePurchases')}
                </Text>
                <ListItem.Chevron />
              </View>
            </ListItem.Content>
          </ListItem>
        </View>
      </View>

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
