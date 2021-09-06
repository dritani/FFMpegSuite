const checkReceipt = async () => {
    // platform detect
    // execute the function

    // if iOS
        // checkReceiptIOS
    // else android
        // checkReceiptAndroid
}

const checkReceiptIOS = async () => {
  let isValidated = false
  const receipt = await AsyncStorage.getItem('receipt')
  if (receipt) {
    const newReceipt = await getReceiptIOS() // RN-IAP
    const validated = await validateReceiptIos( // RN-IAP
      {
        'receipt-data': newReceipt,
        password: 'f5996c9602e64a26b42f1dc108ad6925', // shared secret
      },
      __DEV__,
    )

    if (validated !== false && validated.status === 0) {
      isValidated = true
      AsyncStorage.setItem('receipt', newReceipt)
    } else {
      isValidated = false
      AsyncStorage.removeItem('receipt')
    }
  }
  return isValidated
}

const checkReceiptAndroid = async () => {
  let isValidated = false
  const receipt = await AsyncStorage.getItem('receipt')
  if (receipt) {
    try {
      const purchases = await RNIap.getAvailablePurchases()
      console.debug('checkReceiptAndroid')
      let receipt = purchases[0].transactionReceipt
      if (Platform.OS === 'android' && purchases[0].purchaseToken) {
        receipt = purchases[0].purchaseToken
      }
      AsyncStorage.setItem('receipt', receipt)
      isValidated = true
    } catch (error) {
      isValidated = false
      AsyncStorage.removeItem('receipt')
    }
  }
  return isValidated
}

export default checkReceipt
