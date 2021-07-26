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
  const [pickedLang, setPickedLang] = useState<PickerItem>()
  const languages: Array<PickerItem> = [
    { label: '🇺🇸 English', value: 'en' },
    { label: '🇫🇷 Français', value: 'fr' },
    { label: '🇨🇳 中文', value: 'zh' },
    { label: '🇯🇵 日本語', value: 'jp' },
    { label: '🇩🇪 Deutsche', value: 'de' },
  ]

  const list = [
    {
      title: 'Language',
      icon: 'av-timer',
    },
    {
      title: 'Dark Mode',
      icon: 'flight-takeoff',
    },
  ]

  const handleSelectLanguage = (lng: string) => {
    console.log(lng)
    // setPickedLang(lng)
    // i18n.changeLanguage(lng)
  }

  const { Common, Fonts, Gutters, Layout } = useTheme()
  const dispatch = useDispatch()
  const itemSkus = Platform.select({
    ios: ['888', '999'],
    android: ['888', '999'],
  })

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

  const changeLanguage = () => {
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
    <View style={[Layout.fill, Layout.column]}>
      {/* Gutters.smallHPadding */}
      <TouchableOpacity
        style={[Common.button.outline, Gutters.regularBMargin]}
        onPress={changeLanguage}
      >
        <Text style={Fonts.textRegular}>Language</Text>
      </TouchableOpacity>
      <Picker
        item={pickedLang}
        items={languages}
        onItemChange={setPickedLang}
        title="Language Picker"
        placeholder="Select Language"
        isNullable
        //backdropAnimation={{ opactity: 0 }}
        //mode="dropdown"
        //isNullable
        //disable
      />
      <View>
        {list.map((item, i) => (
          <ListItem key={i} bottomDivider topDivider>
            <Icon name={item.icon} />
            <ListItem.Content>
              {/* <ListItem.Title>{item.title}</ListItem.Title> */}
              <View
                style={{
                  flex: 1,
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontSize: 17, color: 'black' }}>Hello</Text>
                <Text style={{ fontSize: 17, color: 'grey' }}>Hello</Text>
              </View>
            </ListItem.Content>
            {/* <ListItem.Content>
              <View
                style={{
                  flex: 1,
                  flexGrow: 1,
                  flexDirection: 'row',
                  alignContent: 'flex-end',
                  justifyContent: 'flex-end',
                }}
              >
                <Text style={{ fontSize: 17, color: 'grey' }}>Hello</Text>
              </View>
            </ListItem.Content> */}
          </ListItem>
        ))}
      </View>
      <TouchableOpacity
        style={[Common.button.outline, Gutters.regularBMargin]}
        onPress={handlePurchaseAds}
      >
        <Text style={Fonts.textRegular}>Remove Ads - $0.99</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[Common.button.outline, Gutters.regularBMargin]}
        onPress={handlePurchasePro}
      >
        <Text style={Fonts.textRegular}>Pro version - $1.99 </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[Common.button.outline, Gutters.regularBMargin]}
        onPress={handleRestorePurchases}
      >
        <Text style={Fonts.textRegular}>Restore Purchases</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[Common.button.outline, Gutters.regularBMargin]}
        onPress={handleRate}
      >
        <Text style={Fonts.textRegular}>Rate Us!</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[Common.button.outline, Gutters.regularBMargin]}
        onPress={handleRecommend}
      >
        <Text style={Fonts.textRegular}>Recommend App</Text>
      </TouchableOpacity>
    </View>
  )
}

export default IndexExampleContainer
