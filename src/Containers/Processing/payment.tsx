import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from 'react'
import AsyncStorage from '@react-native-community/async-storage'
import {
  Alert,
  EmitterSubscription,
  Platform,
  Linking,
  ActivityIndicator,
  AppState,
} from 'react-native'
import Styled from 'styled-components/native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import SplashScreen from 'react-native-splash-screen'

import ENV from '~/env'
import { ThemeContext } from '~/Context'
import { ActionSheet } from '~/Component'

import RNIap, {
  InAppPurchase,
  SubscriptionPurchase,
  finishTransaction,
  purchaseErrorListener,
  purchaseUpdatedListener,
  Subscription,
  PurchaseError,
} from 'react-native-iap'

import { checkReceipt } from './checkReceipt'

let purchaseUpdateSubscription: EmitterSubscription
let purchaseErrorSubscription: EmitterSubscription

const itemSubs = Platform.select({
  default: [ENV.subscriptionId],
})

const Container = Styled.View`
`
const TitleContainer = Styled.View`
  justify-content: center;
  align-items: center;
  padding: 16px;
`
const Title = Styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }: { theme: Theme }): string => theme.black};
`
const SubTitle = Styled.Text`
  font-size: 16px;
  color: ${({ theme }: { theme: Theme }): string => theme.black};
`
const DescriptionContainer = Styled.View`
  padding: 0 24px;
  width: 100%;
`
const Description = Styled.Text`
  font-size: 14px;
  color: ${({ theme }: { theme: Theme }): string => theme.black};
`
const PurchaseButton = Styled.TouchableOpacity`
  margin: 16px;
  padding: 16px;
  border-radius: 10px;
  background-color: ${({ theme }: { theme: Theme }): string => theme.black};
  justify-content: center;
  align-items: center;
`
const PurchaseLabel = Styled.Text`
  color: ${({ theme }: { theme: Theme }): string => theme.white};
  font-size: 16px;
`
const Terms = Styled.Text`
  font-size: 12px;
  color: ${({ theme }: { theme: Theme }): string => theme.black};
`
const Link = Styled.Text`
  color: ${({ theme }: { theme: Theme }): string => theme.primary};
`
const LoadingContainer = Styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
`
const LoadingBackground = Styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }: { theme: Theme }): string =>
    theme.isLightTheme ? theme.black : theme.white};
  opacity: 0.8;
`

interface Props {
  children: JSX.Element | Array<JSX.Element>
}

const IAPContext = createContext<IAPContext>({
  isSubscription: false,
  subscription: undefined,
  showPurchase: () => {},
})

const IAPProvider = ({ children }: Props): JSX.Element => {
  const [showLoading, setShowLoading] = useState<boolean>(false)
  const [isSubscription, setIsSubscription] = useState<boolean>(false)
  const [subscription, setSubscription] = useState<Subscription | undefined>(
    undefined,
  )
  const actionSheetRef = useRef<ActionSheet>(null)
  const { theme } = useContext<ThemeContext>(ThemeContext)

  const showPurchase = () => {
    actionSheetRef.current?.open()
  }

  const _checkReceipt = async () => {
    const isValidated = await checkReceipt()

    setIsSubscription(isValidated)
    setTimeout(() => {
      SplashScreen.hide()
    }, 1000)
  }

  const _requestSubscription = () => {
    setShowLoading(true)
    if (subscription) {
      RNIap.requestSubscription(subscription.productId)
    }
  }

  const _restorePurchases = () => {
    setShowLoading(true)
    RNIap.getAvailablePurchases()
      .then(purchases => {
        console.debug('restorePurchases')
        let receipt = purchases[0].transactionReceipt
        if (Platform.OS === 'android' && purchases[0].purchaseToken) {
          receipt = purchases[0].purchaseToken
        }
        AsyncStorage.setItem('receipt', receipt)
        setShowLoading(false)
        setIsSubscription(true)
        Alert.alert(
          ENV.language['restore successful'],
          ENV.language['you have successfully restored your purchase history'],
          [
            {
              text: ENV.language.ok,
              onPress: () => actionSheetRef.current?.close(),
            },
          ],
        )
      })
      .catch(err => {
        console.debug('restorePurchases')
        console.error(err)
        setShowLoading(false)
        setIsSubscription(false)
        AsyncStorage.removeItem('receipt')
        Alert.alert(
          ENV.language['restore failed'],
          ENV.language['restore failed reason'],
        )
      })
  }

  const _initIAP = useCallback(async (): Promise<void> => {
    RNIap.clearProductsIOS()

    try {
      const result = await RNIap.initConnection()
      await RNIap.flushFailedPurchasesCachedAsPendingAndroid()
      if (result === false) {
        Alert.alert(ENV.language["couldn't get in-app-purchase information"])
        return
      }
    } catch (err) {
      console.debug('initConnection')
      console.error(err.code, err.message)
      Alert.alert(ENV.language['fail to get in-app-purchase information'])
    }

    purchaseUpdateSubscription = purchaseUpdatedListener(
      (purchase: InAppPurchase | SubscriptionPurchase) => {
        console.debug('purchaseUpdatedListener')
        setShowLoading(false)
        setTimeout(() => {
          actionSheetRef.current?.close()
        }, 400)
        const receipt =
          Platform.OS === 'ios'
            ? purchase.transactionReceipt
            : purchase.purchaseToken
        if (receipt) {
          finishTransaction(purchase)
            .then(() => {
              AsyncStorage.setItem('receipt', receipt)
              setIsSubscription(true)
            })
            .catch(() => {
              setIsSubscription(false)
              Alert.alert(
                ENV.language['purchase is failed'],
                ENV.language['the purchase is failed'],
              )
            })
        }
      },
    )

    purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.debug('purchaseErrorListener')
        console.error(error)
        setShowLoading(false)
        if (error.code !== 'E_USER_CANCELLED') {
          Alert.alert(
            ENV.language['purchase is failed'],
            ENV.language['the purchase is failed'],
          )
        }
      },
    )

    const subscriptions = await RNIap.getSubscriptions(itemSubs)
    setSubscription({
      ...subscriptions[0],
    })
  }, [])

  const handleAppStateChange = (nextAppState: string): void => {
    if (nextAppState === 'active') {
      _checkReceipt()
    }
  }

  useEffect(() => {
    _initIAP()
    _checkReceipt()
    AppState.addEventListener('change', handleAppStateChange)

    return (): void => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove()
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove()
      }
      if (handleAppStateChange) {
        AppState.removeEventListener('change', handleAppStateChange)
      }
    }
  }, [])

  return (
    <IAPContext.Provider
      value={{
        isSubscription,
        subscription,
        showPurchase,
      }}
    >
      {children}
      <ActionSheet
        ref={actionSheetRef}
        height={Platform.OS === 'ios' ? 380 : 420}
        disableClose={showLoading}
        customStyles={{
          container: {
            backgroundColor: theme.white,
          },
        }}
      >
        {subscription && (
          <Container>
            <TitleContainer>
              <Title>{subscription.title.split(' (')[0]}</Title>
              <SubTitle>{subscription.description}</SubTitle>
            </TitleContainer>
            <DescriptionContainer>
              <Description>
                <Icon name="information-outline" />{' '}
                {
                  ENV.language[
                    "I'm developing the app alone. So your subscription is a great help to me"
                  ]
                }
              </Description>
              <Description>
                {'  '}
                {
                  ENV.language[
                    'Your subscription helps me keep the good words app'
                  ]
                }
              </Description>
              <Description>
                {'  '}
                {
                  ENV.language[
                    'Learn vocabulary without ads for the price of a cup of coffee each month'
                  ]
                }
              </Description>
            </DescriptionContainer>
            <PurchaseButton
              onPress={() => {
                _requestSubscription()
              }}
            >
              <PurchaseLabel>
                {subscription.localizedPrice} / {ENV.language.month}
              </PurchaseLabel>
            </PurchaseButton>
            <DescriptionContainer>
              <Terms>
                - {ENV.language['Already subscribed?']}{' '}
                <Link onPress={() => _restorePurchases()}>
                  {ENV.language['Restoring purchases']}
                </Link>
              </Terms>
              <Terms>- {ENV.language['cancel the purchase']}</Terms>
              {Platform.OS === 'ios' && (
                <Terms>
                  - {ENV.language['payment is charged to your iTunes account']}
                </Terms>
              )}
              <Terms>
                - {ENV.language['If you have any question,']}{' '}
                <Link
                  onPress={() =>
                    Linking.openURL(
                      'https://dev-yakuza.posstree.com/ko/contact/',
                    )
                  }
                >
                  Contact
                </Link>{' '}
                {ENV.language.us}
              </Terms>
              <Terms>
                - {ENV.language['see the']}
                <Link
                  onPress={() =>
                    Linking.openURL(
                      'https://dev-yakuza.posstree.com/privacy/ko/',
                    )
                  }
                >
                  {ENV.language['terms of use']}
                </Link>{' '}
                {ENV.language.details}
              </Terms>
            </DescriptionContainer>
          </Container>
        )}
        {showLoading && (
          <LoadingContainer>
            <LoadingBackground />
            <ActivityIndicator color={theme.primary} size="large" />
          </LoadingContainer>
        )}
      </ActionSheet>
    </IAPContext.Provider>
  )
}

export { IAPProvider, IAPContext }
