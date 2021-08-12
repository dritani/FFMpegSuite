import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  View,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Share,
} from 'react-native'
import { Brand } from '@/Components'
import { useTheme } from '@/Theme'
import FetchOne from '@/Store/User/FetchOne'
import ChangeTheme from '@/Store/Theme/ChangeTheme'
import { useTranslation } from 'react-i18next'
import { UserState } from '@/Store/User'
import { ThemeState } from '@/Store/Theme'
import RNIap, {
  Product,
  ProductPurchase,
  PurchaseError,
  acknowledgePurchaseAndroid,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap'
import i18n from 'i18next'
import Rate, { AndroidMarket } from 'react-native-rate'
import type { PickerItem } from 'react-native-woodpicker'
import { Picker } from 'react-native-woodpicker'
import { ListItem, Icon } from 'react-native-elements'

const IndexExampleContainer = () => {
  const { t } = useTranslation()

  const [pickedLang, setPickedLang] = useState<PickerItem>({
    label: '🇺🇸 English',
    value: 'en',
  })

  const languages: Array<PickerItem> = [
    { label: '🇺🇸 English', value: 'en' },
    { label: '🇨🇳 中文', value: 'zh' },
  ]

  const handleSelectLanguage = (lng: PickerItem) => {
    console.log('lng')
    console.log(lng)
    setPickedLang(lng)
    i18n.changeLanguage(lng.value)
    // setPickedLang(lng)
  }

  const { Common, Fonts, Gutters, Layout } = useTheme()

  const itemSkus = Platform.select({
    ios: ['888', '999'],
    android: ['888', '999'],
  })

  const changeLanguage = () => {
    console.log()
    // popup
    // i18n.changeLanguage('zh')
  }

  const handlePurchaseAds = () => {}

  const handlePurchasePro = () => {}

  const handleRestorePurchases = async () => {
    try {
      const purchases = await RNIap.getAvailablePurchases()
      const newState = { premium: false, ads: true }
      let restoredTitles = []

      purchases.forEach(purchase => {
        switch (purchase.productId) {
          case 'com.example.premium':
            newState.premium = true
            restoredTitles.push('Premium Version')
            break

          case 'com.example.no_ads':
            newState.ads = false
            restoredTitles.push('No Ads')
            break

          // case 'com.example.coins100':
          //   await RNIap.consumePurchaseAndroid(purchase.purchaseToken)
          // CoinStore.addCoins(100)
        }
      })
      // Alert.alert('Restore Successful', 'You successfully restored the following purchases: ' + restoredTitles.join(', '));
    } catch (err) {
      console.warn(err) // standardized err.code and err.message available
      // Alert.alert(err.message);
    }
  }

  const handleRate = () => {
    const options = {
      AppleAppID: '2193813192', // after publishin?
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
    <View style={[Layout.fill, Layout.column, { backgroundColor: '#f2f2f2' }]}>
      <View style={Gutters.smallTMargin}>
        <ListItem key="row_lang" topDivider bottomDivider>
          <Icon name="globe-outline" type="ionicon" />
          <ListItem.Content>
            <View style={Layout.rowBetween}>
              <Text style={Fonts.blackSettings}>{t('settings.language')}</Text>
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
        <ListItem key={'row_recommend'} bottomDivider onPress={handleRecommend}>
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
          onPress={handlePurchaseAds}
        >
          <Icon name="close-circle-outline" type="ionicon" />
          <ListItem.Content>
            <View style={Layout.rowBetween}>
              <Text style={Fonts.blackSettings}>{t('settings.removeAds')}</Text>
              <Text style={Fonts.greySettings}>$ 0.99</Text>
              {/* <ListItem.Chevron /> */}
            </View>
          </ListItem.Content>
        </ListItem>
        <ListItem key={'row_pro'} bottomDivider onPress={handlePurchasePro}>
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
  )
}

export default IndexExampleContainer
