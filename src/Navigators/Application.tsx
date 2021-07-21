import React, { useEffect, useState, FunctionComponent } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import {
  InputContainer,
  OptionsContainer,
  ProcessingContainer,
  ResultsContainer,
  SettingsContainer,
} from '@/Containers'
import { useSelector } from 'react-redux'
import { NavigationContainer } from '@react-navigation/native'
import { navigate, navigationRef } from '@/Navigators/Root'
import { Button, SafeAreaView, StatusBar } from 'react-native'
import { useTheme } from '@/Theme'
import { StartupState } from '@/Store/Startup'

const Stack = createStackNavigator()

let MainNavigator: FunctionComponent | null

// @refresh reset
const ApplicationNavigator = () => {
  const { Layout, darkMode, NavigationTheme } = useTheme()
  const { colors } = NavigationTheme
  const [isApplicationLoaded, setIsApplicationLoaded] = useState(false)
  const applicationIsLoading = useSelector(
    (state: { startup: StartupState }) => state.startup.loading,
  )

  const screenOptions = () => {
    return {
      title: '',
      headerRight: () => (
        <Button title="Settings" onPress={() => navigate('Settings')} />
      ),
    }
  }

  useEffect(() => {
    if (MainNavigator == null && !applicationIsLoading) {
      MainNavigator = require('@/Navigators/Main').default
      setIsApplicationLoaded(true)
    }
  }, [applicationIsLoading])

  // on destroy needed to be able to reset when app close in background (Android)
  useEffect(
    () => () => {
      setIsApplicationLoaded(false)
      MainNavigator = null
    },
    [],
  )

  return (
    <SafeAreaView style={[Layout.fill, { backgroundColor: colors.card }]}>
      <NavigationContainer theme={NavigationTheme} ref={navigationRef}>
        <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
        <Stack.Navigator
          headerMode="float"
          initialRouteName="Input"
          // title="title"
          // headerTitle="headerTitle"
          // navigationOptions={{
          //   // title: 'nav title',
          //   // headerTitle: 'nav headerTitle',
          //   headerRight: 'Settings',
          // }}
          // options={{
          //   headerRight:"Settings"
          // }}
        >
          {/* <Stack.Navigator> */}
          <Stack.Screen
            options={screenOptions}
            name="Input"
            component={InputContainer}
          />
          <Stack.Screen name="Options" component={OptionsContainer} />
          <Stack.Screen name="Processing" component={ProcessingContainer} />
          <Stack.Screen name="Results" component={ResultsContainer} />
          <Stack.Screen name="Settings" component={SettingsContainer} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  )
}

export default ApplicationNavigator
