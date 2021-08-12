import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as resources from './resources'
import { NativeModules, Platform } from 'react-native'

// detect default device language and set accordingly here
const locale =
  Platform.OS === 'ios'
    ? NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
    : NativeModules.I18nManager.localeIdentifier

// should I check here if the language has been saved previously? Indeed.
i18n.use(initReactI18next).init({
  resources: {
    ...Object.entries(resources).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: {
          translation: value,
        },
      }),
      {},
    ),
  },
  lng: locale.substring(0, 2), // 'en'
  fallbackLng: 'en',
})

export default i18n
