import React from "react";
import {TextInput, Text,Surface, Headline, Button, Portal} from 'react-native-paper';
import { View, Image} from "react-native";
import {ScreenContainer} from '../ScreenContainer'
import { useRef, useState } from "react";
import styles from '../styles'



export const BarcodeModal = ({ navigation, route }) => {  
  const [Barcode, setBarcode] = useState('');
  const [Output, setOutput] = useState('');
  const ref_input = useRef();
  return(
  <Portal>
      <Surface  style={styles.surface}>
        <Image style={styles.barcodeImage} source={{
          uri: 'https://via.placeholder.com/200x200',
        }} />
      </Surface>
    <Headline>Scan shelf barcode now</Headline>
      <TextInput
        style={{width: 0,
          height: 0}}
        autoFocus={true}
        clearTextOnFocus={true} 
        placeholder="Barcode" 
        placeholderTextColor="#003f5c" 
        onChangeText={(text) => setBarcode(text)}
        value={Barcode}
        ref={ref_input}
        showSoftInputOnFocus={false} />
    <Button mode="contained" onPress={() => navigation.navigate("Items", {toConfirm: {confirm:true, itemID:route.params.itemID}})}>Manually confirm (can't scan)</Button>
    </Portal>
)};