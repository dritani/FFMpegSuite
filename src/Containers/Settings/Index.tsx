import React, { useState, useEffect} from 'react'
import {
  View,
  Text,
  Platform,
  NativeModules,
  Share,
  Alert,
} from 'react-native'
import { useTheme } from '@/Theme'
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
    { label: '🇰🇷 한국인', value: 'ko' },
    { label: '🇷🇺 русский', value: 'ru' },
    { label: '🇮🇳 हिंदी', value: 'hi' },
  ]

  const [pickedLang, setPickedLang] = useState<PickerItem>({
    label: '🇺🇸 English',
    value: 'en',
  })

  const itemSkus = Platform.select({
    ios: ['videoCompressor.noAds', 'videoCompressor.pro'],
    android: ['videocompressor.noads', 'videocompressor.pro'],
    // amazon? Make them lowercase too in their console.
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
      
    }

    const products = await RNIap.getProducts(itemSkus)
    let ad = products.filter(
      a => a.productId.toLowerCase() === 'videocompressor.noads',
    )
    let pr = products.filter(
      a => a.productId.toLowerCase() === 'videocompressor.pro',
    )

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
      let productId = itemSkus[0]
      const purchase = await RNIap.requestPurchase(productId)

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
      // should be handled automatically by iOS
      // Alert.alert('Purchase Erorr', 'The purchase could not be completed.')
    }
  }

  const handlePurchasePro = async () => {
    try {
      let productId = itemSkus[1]
      const purchase = await RNIap.requestPurchase(productId)

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
      // should be handled automatically by iOS
      // Alert.alert('Purchase Erorr', 'The purchase could not be completed.')
    }
  }

  const handleRestorePurchases = async () => {
    try {
      const purchases = await RNIap.getAvailablePurchases()

      let ads_status = true,
        pro_status = false
      purchases.forEach(purchase => {
        switch (purchase.productId.toLowerCase()) {
          case 'videocompressor.pro':
            pro_status = true
            break
          case 'videocompressor.noads':
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
      Alert.alert(
        'Restore Unsuccessful',
        'There was an error while restoring purchases.',
      )
    }
  }

  const handleRate = () => {
    const options = {
      AppleAppID: '1576425812', // after publishing?
      GooglePackageName: 'ml.devcraft.videocompressor', // PascalCase? check console
      AmazonPackageName: 'ml.devcraft.videocompressor', // PascalCase? 
      // OtherAndroidURL: 'http://www.randomappstore.com/app/47172391',
      preferredAndroidMarket: AndroidMarket.Google,
      preferInApp: false,
      openAppStoreIfInAppFails: true,
      fallbackPlatformURL: 'https://apps.apple.com/US/app/id1576425812?l=en', // put your app link
    }
    Rate.rate(options, success => {
      if (success) {
        // this technically only tells us if the user successfully went to the Review Page. Whether they actually did anything, we do not know.
        // this.setState({rated:true})
        // setRated(true)
      } else {
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
      }
    } catch (error) {
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
