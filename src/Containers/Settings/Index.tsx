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
  Alert,
} from 'react-native'
import { Brand } from '@/Components'
import { useTheme } from '@/Theme'
import FetchOne from '@/Store/User/FetchOne'
import ChangeTheme from '@/Store/Theme/ChangeTheme'
import { useTranslation } from 'react-i18next'
import { UserState } from '@/Store/User'
import { ThemeState } from '@/Store/Theme'
import { Config } from '@/Config'

import RNIap, {
  InAppPurchase,
  Product,
  PurchaseError,
  finishTransaction,
} from 'react-native-iap'
import i18n from 'i18next'
import Rate, { AndroidMarket } from 'react-native-rate'
import type { PickerItem } from 'react-native-woodpicker'
import { Picker } from 'react-native-woodpicker'
import { ListItem, Icon } from 'react-native-elements'
import { TestIds, BannerAd, BannerAdSize } from '@react-native-firebase/admob'
import AsyncStorage from '@react-native-async-storage/async-storage'

const bannerId = __DEV__ ? TestIds.BANNER : Config.BANNER_ID

const IndexExampleContainer = () => {
  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()

  const [ads, setAds] = useState(null)
  const [pro, setPro] = useState(null)
  const [ads_price, setAdsPrice] = useState('$0.99')
  const [pro_price, setProPrice] = useState('$1.99')

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

  const getProducts = async () => {
    // let prices = AsyncStorage.getItem('@localizedPrices')
    // let localizedPrices = {}    
    // if (prices) {
    //   localizedPrices = JSON.parse(prices)
    //   setAdsPrice(localizedPrices.ads_price)
    //   setProPrice(localizedPrices.pro_price)
    // } else {
    //   // 
    // }

    RNIap.clearProductsIOS()

    try {
      const result = await RNIap.initConnection()
      await RNIap.flushFailedPurchasesCachedAsPendingAndroid()
    } catch (err) {
      console.log(err) // error fetching product info
    }

    const products = await RNIap.getProducts(itemSkus)
    let ad = products.filter(a => a.productId === 'videoCompressor.noAds')
    let pr = products.filter(a => a.productId === 'videoCompressor.pro')

    if (ad.length > 0 && pr.length > 0) {
      let ad_pr = ad[0].localizedPrice
      let pr_pr = pr[0].localizedPrice
      setAdsPrice(ad_pr)
      setProPrice(pr_pr)

      // let localizedPrices = {
      //   ads_price: ad_pr,
      //   pro_price: pr_pr,
      // }
      // AsyncStorage.setItem(
      //   '@localizedPrices',
      //   JSON.stringify(localizedPrices),
      // )
    }
  }

  const getPaymentStatus = async () => {
    let payment = await AsyncStorage.getItem('@payment')
    if (payment) {
      let payment_json = JSON.parse(payment)
      setAds(payment_json.ads)
      setPro(payment_json.pro)
    } else {
      setAds(true)
      setPro(false)
    }
  }

  useEffect(() => {
    getPaymentStatus()
    initializePicker()
    getProducts() // only need this for localized prices??? only the first time?
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

  const handlePurchaseAds = async () => {
    try {
      const purchase = await RNIap.requestPurchase('videoCompressor.noAds')

      if (purchase) {
        setAds(false)

        let new_payment = {
          ads: false,
          pro: false,
        }

        let payment = await AsyncStorage.getItem('@payment')
        if (payment) {
          let payment_json = JSON.parse(payment)
          new_payment.pro = payment_json.pro
        }

        // this is kind of cringe but it works

        await AsyncStorage.setItem('@payment', JSON.stringify(new_payment))
      }
    } catch (err) {
      console.log('purchase NoAds Settings error:')
      console.log(err)
      // should be handled automatically by iOS
      // Alert.alert('Purchase Erorr', 'The purchase could not be completed.')
    }
  }

  const handlePurchasePro = async () => {
    try {
      const purchase = await RNIap.requestPurchase('videoCompressor.pro')

      if (purchase) {
        setPro(true)

        if (purchase) {
          setPro(true)

          let new_payment = {
            ads: true,
            pro: true,
          }

          let payment = await AsyncStorage.getItem('@payment')
          if (payment) {
            let payment_json = JSON.parse(payment)
            new_payment.ads = payment_json.ads
          }

          await AsyncStorage.setItem('@payment', JSON.stringify(new_payment))
        }
      }
    } catch (err) {
      console.log('purchase Pro Settings error:')
      console.log(err)
      // should be handled automatically by iOS
      // Alert.alert('Purchase Erorr', 'The purchase could not be completed.')
    }
  }

  // purchase object:
  /*
{ transactionReceipt: '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',
  transactionDate: 1631099333000,
  productId: 'videoCompressor.noAds',
  transactionId: '1000000874119604' }
 Purchase Started !!
 Purchase Successful !!
2021-09-08 13:09:24.764669+0200 FFMpegSuite[4864:740650] [javascript] purchase
2021-09-08 13:09:24.765771+0200 FFMpegSuite[4864:740650] [javascript] {
  transactionReceipt: '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',
  transactionDate: 1631099362000,
  productId: 'videoCompressor.pro',
  transactionId: '1000000874120395' }
  */

  const handleRestorePurchases = async () => {
    try {
      const purchases = await RNIap.getAvailablePurchases()

      let ads_status = true,
        pro_status = false
      purchases.forEach(purchase => {
        switch (purchase.productId) {
          case 'videoCompressor.pro':
            pro_status = true
            break

          case 'videoCompressor.noAds':
            ads_status = false
            break
          default:
            break
        }
      })

      setAds(ads_status)
      setPro(pro_status)

      let payment_status = {
        ads: ads_status,
        pro: pro_status,
      }

      await AsyncStorage.setItem('@payment', JSON.stringify(payment_status))

      Alert.alert('Restore Successful', 'Purchases successfully restored!')
    } catch (err) {
      console.log('restore purchases Settings error:')
      console.log(err)
      Alert.alert(
        'Restore Unsuccessful',
        'There was an error while restoring purchases.',
      )
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
      fallbackPlatformURL: 'https://apps.apple.com/US/app/id2193813192?l=en', // put your app link
    }
    Rate.rate(options, success => {
      if (success) {
        console.log('rating success')
        console.log(success)
        // this technically only tells us if the user successfully went to the Review Page. Whether they actually did anything, we do not know.
        // this.setState({rated:true})
        // setRated(true)
      } else {
        console.log('rating error')
        console.log(success)
      }
    })
  }

  const handleRecommend = async () => {
    try {
      const result = await Share.share({
        message: 'https://apps.apple.com/US/app/id2193813192?l=en',
      })
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('dismissed')
      }
    } catch (error) {
      console.log('error')
      console.log(error)
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
                <Text style={[Fonts.blackSettings, Fonts.nunitoRegular]}>
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
                  textInputStyle={{fontFamily: 'Nunito-Regular'}}
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
                <Text style={[Fonts.blackSettings, Fonts.nunitoRegular]}>{t('settings.rateUs')}</Text>
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
                <Text style={[Fonts.blackSettings, Fonts.nunitoRegular]}>
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
            onPress={handlePurchaseAds}
            disabled={ads === null || !ads}
          >
            <Icon name="close-circle-outline" type="ionicon" />
            <ListItem.Content>
              <View style={Layout.rowBetween}>
                <Text style={[Fonts.blackSettings, Fonts.nunitoRegular]}>
                  {t('settings.removeAds')}
                </Text>
                <Text style={[Fonts.greySettings, Fonts.nunitoRegular]}>
                  {ads !== null ? (ads ? ads_price : '👑') : ''}
                </Text>
                {/* <ListItem.Chevron /> */}
              </View>
            </ListItem.Content>
          </ListItem>
          <ListItem
            key={'row_pro'}
            bottomDivider
            onPress={handlePurchasePro}
            disabled={pro === null || pro}
          >
            <Icon name="key" type="ionicon" />
            <ListItem.Content>
              <View style={Layout.rowBetween}>
                <Text style={[Fonts.blackSettings, Fonts.nunitoRegular]}>
                  {t('settings.proVersion')}
                </Text>
                <Text style={[Fonts.greySettings, Fonts.nunitoRegular]}>
                  {pro !== null ? (pro ? '👑' : pro_price) : ''}
                </Text>

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
                <Text style={[Fonts.blackSettings, Fonts.nunitoRegular]}>
                  {t('settings.restorePurchases')}
                </Text>
                <ListItem.Chevron />
              </View>
            </ListItem.Content>
          </ListItem>
        </View>
      </View>

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
