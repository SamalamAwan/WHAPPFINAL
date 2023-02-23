import React from "react";
import { TextInput, Text, Surface, Headline, Button, Title, Subheading, Portal, useTheme, Dialog } from 'react-native-paper';
import { View, Image } from "react-native";
import { ScreenContainer } from '../ScreenContainer'
import { useRef, useState } from "react";
import styles from '../styles'
import { AuthContext } from "../context";







export const AssignBarcodeScreen = ({ navigation, route }) => {
  const { Profile } = React.useContext(AuthContext);
  const { apiKey } = React.useContext(AuthContext);

  const [Barcode, setBarcode] = useState('');
  const [BarcodeConfirm, setBarcodeConfirm] = useState('');
  const [image, setImage] = useState(null);
  const [id, setId] = useState(route.params.id);
  const [itemSKU, setItemSKU] = useState(route.params.itemCode);
  const [itemName, setItemName] = useState(route.params.itemName);
  const [currentBarcode, setCurrentBarcode] = useState(route.params.barcode);
  const [error, setError] = useState('');
  const [scanned, setScanned] = useState('');
  const ref_input = useRef();
  const ref_input2 = useRef();
  const { colors } = useTheme();
  const [visible, setVisible] = React.useState(false);
  const showConfirmPopup = () => setVisible(true);
  const hideModal = () => {
    setVisible(false)
  }

  const OverwriteBarcode = (barcode) => {
    let jwt = Profile.jwt
    let apikey = apiKey
    if (jwt != null) {
      let authGet = apikey + " " + jwt
      let data = {
        method: 'POST',
        mode: "cors", // no-cors, cors, *same-origin *=default
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authGet
        },
        body: JSON.stringify(
          {
            "action": "assignBarcode",
            "productID": parseInt(id),
            "barcode": parseInt(barcode),
            "override": true
          }
        )
      };
            return fetch('https://api-veen-e.ewipro.com/v1/products/', data)
              .then((response) => {
                if (!response.ok) throw new Error(response.status);
                else return response.json();
              })
              .then((responseData) => {
                console.log(responseData)
                if (responseData.status == false){
                  setError(responseData.message)
                }
                else{
                  setError(responseData.message)
                  setCurrentBarcode(barcode)
                  setScanned('')
                  setBarcode('')
                  setBarcodeConfirm('')
                }
                hideModal()
              })
              .catch((error) => {
                alert(error)
              });
         
    }
  }

  return (
    React.useEffect(() => {
      const test = navigation.addListener('focus', () => {
        setTimeout(() => {
          ref_input.current.focus()
        }, 100);
      });
      return test;
    }, [navigation]),


    React.useEffect(() => {
      if (visible){
        const interval = setInterval(() => {
          ref_input2.current.focus()
        }, 100);
        return () => clearInterval(interval);
      }
      else{
        const interval2 = setInterval(() => {
          ref_input.current.focus()
        }, 100);
        return () => clearInterval(interval2);
      }
    }, [visible]),

    React.useEffect(() => {
      setImage(route.params.photo);
      setItemSKU(route.params.itemCode);
      setItemName(route.params.itemName);
      setCurrentBarcode(route.params.barcode);
      setId(route.params.id)
    }, [route.params]),

    React.useEffect(() => {
      if (Barcode != '') {
        showConfirmPopup()
        setScanned(Barcode)
      }
      setBarcode('')
      setTimeout(() => {
        ref_input.current.focus()
      }, 100);
    }, [Barcode]),


    React.useEffect(() => {
      console.log(BarcodeConfirm)
      console.log(scanned)
      if (BarcodeConfirm != '') {
        if (BarcodeConfirm == scanned){
          OverwriteBarcode(scanned)
        }
        else{
          setError("Confirmed Scan did not match first scan.")
          hideModal()
        }
      }
      setBarcodeConfirm('')
      setTimeout(() => {
        ref_input2.current.focus()
      }, 100);
    }, [BarcodeConfirm]),


    <ScreenContainer flexstart={true}>
      <Title style={{ color: "#000000" }}>{itemSKU}</Title>
      <Subheading style={{ textAlign: "center", padding: 5, color: "#000000" }}>{itemName}</Subheading>
      {currentBarcode != null && <Headline style={{ textAlign: "center", padding: 10, color: "#000000" }}>Current Barcode: {currentBarcode}</Headline>}

      {currentBarcode == null && <Headline style={{ textAlign: "center", padding: 10, color: "#000000" }}>Product has no barcode</Headline>}
      <Surface style={styles.surface}>
        <Image style={styles.barcodeImage} source={{
          uri: image,
        }} />
      </Surface>

      <Headline style={{ textAlign: "center", padding: 2, color: "#000000", fontSize: 18 }}>Scan barcode now to assign to product</Headline>
      {error != '' && <Subheading style={{ textAlign: "center", padding: 5, color: error == "Barcode assigned." ? "green" : "red" }}>{error == "Barcode assigned." ? error : "Error: " + error}</Subheading>}


      <TextInput
        style={{
          width: 0,
          height: 0
        }}
        autoFocus={true}
        clearTextOnFocus={true}
        placeholder="Barcode"
        placeholderTextColor="#003f5c"
        onChangeText={(text) => setBarcode(text)}
        value={Barcode}
        ref={ref_input}
        showSoftInputOnFocus={false} />
      <Portal>

        <Dialog visible={visible} onDismiss={hideModal}>
          <Dialog.Title style={{textAlign:"center"}}>Overwrite barcode?</Dialog.Title>
          <Dialog.Content style={{ display: "flex", flexDirection: "row", justifyContent:"space-evenly" }}>
            <View>
            <Text>Current barcode </Text>
            <Text>{currentBarcode == null ? "No Barcode" : currentBarcode}</Text> 
            </View>
            <View>
            <Text>New barcode</Text>
            <Text>{scanned}</Text> 
            </View>
          </Dialog.Content>
          <Dialog.Title style={{textAlign:"center", color:"red"}}>SCAN BARCODE AGAIN TO CONFIRM</Dialog.Title>
          <Dialog.Actions style={{ display: "flex", flexDirection: "row", justifyContent:"space-evenly" }}>
            <Button mode="flat" onPress={() => hideModal()}>Cancel</Button>
          </Dialog.Actions>

        </Dialog>

      </Portal>
      <TextInput
        style={{
          width: 0,
          height: 0
        }}
        autoFocus={true}
        clearTextOnFocus={true}
        placeholder="Barcode"
        placeholderTextColor="#003f5c"
        onChangeText={(text) => setBarcodeConfirm(text)}
        value={BarcodeConfirm}
        ref={ref_input2}
        showSoftInputOnFocus={false} />
    </ScreenContainer>
  )
};