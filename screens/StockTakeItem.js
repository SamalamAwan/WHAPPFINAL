import React from "react";
import { TextInput, Text, Surface, Headline, Button, Title, Subheading, Portal, useTheme, Dialog, IconButton, Snackbar, ActivityIndicator } from 'react-native-paper';
import { View, Image } from "react-native";
import { ScreenContainer } from '../ScreenContainer'
import { useRef, useState } from "react";
import styles from '../styles'
import { AuthContext } from "../context";
import { KeyboardAvoidingView } from "react-native-web";







export const StockTakeItemScreen = ({ navigation, route }) => {
  const { Profile, updateAuthGlobal } = React.useContext(AuthContext);
  const { apiKey } = React.useContext(AuthContext);
  const { colors } = useTheme();
  const [image, setImage] = React.useState(null)
  const [name, setName] = React.useState("");
  const [sku, setSku] = React.useState("")
  const [stockQuantity, setStockQuantity] = React.useState(null)
  const [newQuantity, setNewQuantity] = React.useState()
  const [iD, setID] = React.useState("")
  const [error, setError] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  React.useEffect(() => {
    //console.log(route)
    setIsLoading(true);
    // setImage(route.params.photo)
    // setName(route.params.itemName)
    // setSku(route.params.itemCode)
    // setStockQuantity(route.params.stockQty ? route.params.stockQty : "")
    // setID(route.params.id ? route.params.id : "")
    if (route.params.itemCode) {
      lookupProduct();
    }
  }, [lookupProduct, route])


  const lookupProduct = React.useCallback(() => {
    if (route.params.itemCode) {
      let apikey = apiKey
      let jwt = Profile.jwt
      let authGet = apikey + " " + jwt
      let data = {
        method: 'POST',
        mode: "cors", // no-cors, cors, *same-origin *=default
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authGet
        },
        body: JSON.stringify({
          "action": "productsLookup",
          "sku": route.params.itemCode
        })
      };
      return fetch('https://api-veen-e.ewipro.com/v1/products/', data)
        .then((response) => {
          if (!response.ok) throw new Error(response.status);
          else return response.json();
        })
        .then((responseData) => {
          //console.log(responseData.products[0])
          if (responseData.products[0]) {
            setImage(responseData.products[0].image_src)
            setName(responseData.products[0].name)
            setSku(responseData.products[0].code)
            setStockQuantity(responseData.products[0].stockQty ? responseData.products[0].stockQty : "")
            setID(responseData.products[0].id ? responseData.products[0].id : "")
          }
          else{
            setError("Product Not Found")
          }
          setIsLoading(false);
        })
        .catch((error) => {
          if (error.message == "401") {
            updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
          }
        });
    }
  }, [Profile.jwt, Profile.userName, Profile.userToken, Profile.userType, apiKey, route.params.itemCode, updateAuthGlobal])

  const submitNewQuantity = React.useCallback(() => {
    let newstock = newQuantity;
    let ID = iD
    let apikey = apiKey
    let jwt = Profile.jwt
    let authGet = apikey + " " + jwt
    let data = {
      method: 'POST',
      mode: "cors", // no-cors, cors, *same-origin *=default
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authGet
      },
      body: JSON.stringify({
        "action": "stockTakeUpdate",
        "productID": ID,
        "stockQty": newstock
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/products/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        //console.log(responseData)
        setConfirmScreenVisible(false)
        if (responseData.status == true) {
          navigation.reset({
            index: 1,
            routes: [
              { name: 'Stock Take', error: "Success" },
            ],
          })
        }
        else {
          navigation.reset({
            index: 1,
            routes: [
              { name: 'Stock Take', error: "Error" },
            ],
          })
        }
      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });

  }, [Profile.jwt, Profile.userName, Profile.userToken, Profile.userType, apiKey, iD, navigation, newQuantity, updateAuthGlobal])

  const startSubmitNewQuantity = () => {
    setConfirmScreenVisible(true)
  }

  const closeConfirm = () => {
    setConfirmScreenVisible(false);
  }

  const [snackVisible, setSnackVisible] = React.useState(false);

  const onToggleSnackBar = () => setSnackVisible(!snackVisible);

  const onDismissSnackBar = () => {
    setSnackVisible(false);
    setError("");
  }
  React.useEffect(() => {
    if (error != "") {
      setSnackVisible(true)
    }
  }, [error])
  const containerStyle = { backgroundColor: 'white', padding: 20 };

  const handleNewQuantity = (text) => {
    setNewQuantity(text.replace(/[^0-9]/g, ''))
  }

  const [confirmScreenVisible, setConfirmScreenVisible] = React.useState(false);
  if (isLoading) {
    return (
      <ScreenContainer flexstart={true}>
        <ActivityIndicator animating={true} size="large" />
      </ScreenContainer>
    )
  }
  return (
    <ScreenContainer flexstart={true}>
      <Title style={{ color: "#000000", textAlign:"center" }}>{name}</Title>
      <Subheading style={{ textAlign: "center", padding: 5, color: "#000000" }}>{sku}</Subheading>
      <Surface style={styles.surface}>
        <Image style={styles.barcodeImage} source={{
          uri: image,
        }} />
      </Surface>
      {stockQuantity != "" && <Subheading style={{ color: "#000000" }}>Current Stock Quantity : {stockQuantity}</Subheading>}
      <Title style={{ color: "#000000" }}>Enter new quantity below</Title>
      <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingHorizontal: 50 }}>
        <TextInput
          keyboardType="numeric"
          mode="outlined"
          placeholder="New stock quantity"
          style={{ flex: 9, height: 38, margin: 0, padding: 0 }}
          onChangeText={(text) => handleNewQuantity(text)}
          value={newQuantity}
        />
        <Button style={{ backgroundColor: "green", display: "flex", padding: 0, height: 40, marginTop: 5, maxWidth: 50, justifyContent: "center" }} labelStyle={{ padding: 0, margin: 0, display: "none", fontSize: 30, textAlign: "center" }} contentStyle={{ padding: 0, margin: 0, display: "flex", justifyContent: "center", alignItems: "center" }} icon={"check"} iconColor="white" onPress={() => startSubmitNewQuantity()} />
      </View>
      <Portal>
        <Dialog visible={confirmScreenVisible} onDismiss={closeConfirm} style={containerStyle}>
          <Dialog.Title>Correct?</Dialog.Title>
          <Dialog.Content><Subheading>Old Stock: {stockQuantity}</Subheading>
            <Subheading>New Stock: {newQuantity}</Subheading></Dialog.Content>
          <Dialog.Actions style={{ display: "flex", justifyContent: "space-evenly", alignItems: "stretch" }}>
            <Button mode="contained" color="green" style={{ paddingHorizontal: 20 }} onPress={submitNewQuantity}>Yes</Button>
            <Button mode="contained" color="red" style={{ paddingHorizontal: 20 }} onPress={closeConfirm}>No</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar
        visible={snackVisible}
        onDismiss={onDismissSnackBar}
        duration={3000}
      >
        {error}
      </Snackbar>
    </ScreenContainer>
  )
};