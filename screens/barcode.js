import React from "react";
import { TextInput, Text, Surface, Headline, Button, Title, Subheading, Appbar, Portal, Modal, useTheme, FAB, ActivityIndicator } from 'react-native-paper';
import { View, Image } from "react-native";
import { ScreenContainer } from '../ScreenContainer'
import { useRef, useState } from "react";
import styles from '../styles'
import { AuthContext, apiKey } from "../context";
import { Dimensions, KeyboardAvoidingView } from 'react-native';
import { useContext } from "react";

import { useFocusEffect } from '@react-navigation/native';







const PickUpItemFAB = ({pickUpLoading, showModal}) => {
  return (
    <FAB
      style={styles.fab}
      loading={pickUpLoading}
      color="#fff"
      label="Confirm Pick Up"
      icon="check"
      onPress={showModal}
    />
  )
}


export const BarcodeScreen = ({ navigation, route }) => {
  const { Profile } = React.useContext(AuthContext);
  const { apiKey } = React.useContext(AuthContext);
  const updatePickedUp = (itemID,quantityPicked, scanned) => {
    let apikey = apiKey
    let jwt = Profile.jwt
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
            "action": "pickUpDeliveryNoteItem",
            "deliveryNoteLineId": itemID,
            "qtyPickedUp": quantityPicked,
            "scanned": scanned
          }
        )
      };
      return fetch('https://api-veen-e.ewipro.com/v1/jobs/', data)
        .then((response) => {
          if (!response.ok) throw new Error(response.status);
          else return response.json();
        })
        .then((responseData) => {
          setIsLoading(false)
          setPickUpLoading(false)
          navigation.goBack()
        })
        .catch((error) => {
        });
  
    };
  }
  const getProductData = (sku) => {
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
            "sku": sku,
          }
        )
      };
      return fetch('https://api-veen-e.ewipro.com/v1/products/', data)
        .then((response) => {
          if (!response.ok) throw new Error(response.status);
          else return response.json();
        })
        .then((responseData) => {
            setImage(responseData.products[0].image_src)
            //console.log(responseData)
        })
        .catch((error) => {
        });
  
    };
  }

  const submitQuantityGrabbed = () => {
    setIsLoading(true)
    let qNeeded = parseInt(quantityNeeded)
    let qPicked = parseInt(quantityPicked)
    if (qPicked < qNeeded){
      updatePickedUp(route.params.itemID, qPicked, true)
    }
    if (qPicked > qNeeded){
      alert("too many items")
      setIsLoading(false)
    }
    if (qPicked == qNeeded){
      updatePickedUp(route.params.itemID, qPicked, true)
    }

  }

  const [isLoading, setIsLoading] = useState(false)
  const [pickUpLoading, setPickUpLoading] = useState(false);
  const [Barcode, setBarcode] = useState('');
  const [image, setImage] = useState(route.params.photo);
  const [itemSKU, setItemSKU] = useState(route.params.itemCode);
  const [quantityNeeded, setQuantityNeeded] = useState(route.params.itemQty)
  const [quantityPicked, setQuantityPicked] = useState(route.params.itemQty)
  const [itemName, setItemName] = useState(route.params.itemName);
  const [itemTintable, setItemTintable] = useState(route.params.itemTintable);
  const [noBarcode, setNoBarcode] = useState(true)
  const [Output, setOutput] = useState('');
  const ref_input = useRef();
  const [visible, setVisible] = React.useState(false);
  const { colors } = useTheme();
  const showModal = () => setVisible(true);
  const hideModal = () => {
    setVisible(false)
    setPickUpLoading(false)
  }
  const containerStyle = {backgroundColor: 'white', padding: 20, marginBottom:50};


  return (
    React.useEffect(() => {
      const test = navigation.addListener('focus', () => {
        setTimeout(() => {
          ref_input.current.focus()
        }, 100);
      });
      return test;
    }, []),

    
    React.useEffect(() => {
      if (Barcode == route.params.productBarcode) {
        showModal()
      }
      else if (Barcode != ''){
        alert("wrong barcode scanned\r\nYou scanned: "+Barcode+"\r\nExpected: "+ route.params.productBarcode) 
      }
      setBarcode('')
      setTimeout(() => {
        ref_input.current.focus()
      }, 100);
    }, [Barcode]),

    React.useEffect(() => {
      if (route.params.productBarcode == null) {
        setNoBarcode(true)
      }
      else {
        setNoBarcode(false)
      }
      //getProductData(route.params.itemCode)
    }, [route]),



    <ScreenContainer flexstart={true}>
      <Title style={{color:"#000000"}}>{itemSKU}</Title>
      <Subheading style={{textAlign:"center", padding:10, color:"#000000"}}>{itemName}</Subheading>
      <Surface style={styles.surface}>
        <Image style={styles.barcodeImage} source={{
          uri: image,
        }} />
      </Surface>
      {!noBarcode && <Headline  style={{textAlign:"center", padding:10,color:"#000000"}}>Scan assigned barcode now</Headline>}
      {/* {noBarcode && <Headline  style={{textAlign:"center", padding:10,color:"#000000"}}>No product barcode in system, please manually confirm</Headline>} */}
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
        
      {(!itemTintable || noBarcode || Profile.adminMode) && <PickUpItemFAB pickUpLoading={pickUpLoading} showModal={showModal} />}


      <Portal>

        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
        {isLoading &&
          <ActivityIndicator animating={true} size="large" />
        }
          <Headline>How many did you pick up?</Headline>
          <TextInput
          keyboardType="numeric"
      mode="outlined"
      label="Quantity"
      value={quantityPicked}
      onChangeText={(text) => setQuantityPicked(text)}
      placeholder="0"
      right={<TextInput.Affix text={"/"+quantityNeeded} />}
    />
    {!isLoading && <Button mode="contained" onPress={() => submitQuantityGrabbed()}>Submit</Button>}
        </Modal>

      </Portal>


    </ScreenContainer>
  )
};