import React from "react";
import { useTheme, Headline, Surface, Button, Subheading, FAB, Card, Portal, Dialog, TextInput, Appbar, Caption, Snackbar  } from 'react-native-paper';
import { ScreenContainer } from '../ScreenContainer'
import { Dimensions, TouchableOpacity, View, ScrollView } from 'react-native';
const windowWidth = Dimensions.get('window').width;
import styles from '../styles'
import { AuthContext } from "../context";
import { IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useContext, useState, useRef } from "react";
import { apiKey } from "../context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchableHighlight } from "react-native-gesture-handler";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export const CourierCollectionScreen = () => {
  const { colors } = useTheme();
  const [scanLoading, setScanLoading] = React.useState(false);
  const { cards } = useTheme();
  const [scansList, setScansList] = React.useState(null);
  const [scanBarcodeScreenVisible, setScanBarcodeScreenVisible] = React.useState(false);
  const containerStyle = { backgroundColor: 'white', padding: 20 };
  const [scanCards, setScanCards] = React.useState(null);
  const { Profile, updateAuthGlobal } = React.useContext(AuthContext)
  const [Barcode, setBarcode] = useState('');
  const [courierErrorScreenVisible, setCourierErrorScreenVisible] = React.useState(false);  
  const [courierErrorHolder, setCourierErrorHolder] = React.useState(null)
  const showDifferentCourierError = (labelObj) =>{
    setCourierErrorScreenVisible(true)
    setCourierErrorHolder(labelObj)
  }
  const [snackVisible, setSnackVisible] = React.useState(false);
  const [error, setError] = useState("");


  const getSavedScans = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@courierCollections')
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch(e) {
      // error reading value
    }
  }

  const removeSavedScans = async () => {
    try {
      await AsyncStorage.removeItem('@courierCollections')
    } catch(e) {
      // remove error
    }
  }

  const sendSameCourier = () => {
    let Allscans = scansList
    let newScan = courierErrorHolder
    if (Allscans.find((e) => e.consignmentNumber == newScan.consignmentNumber)) {
      setError("Item already scanned")
    }
    if (Allscans) {
      setScansList(Allscans => [...Allscans, newScan])
    }
    else{
      setScansList(newScan)
    }
    closeCourierError()
  }
  


  const sendScan = (barcode) => {
    let apikey = apiKey
    let Allscans = scansList
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
        "action": "courierBarcodeLookup",
        "barcodeScanned": barcode
      })
    };

    return fetch('https://api-veen-e.ewipro.com/v1/jobs/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        console.log(responseData)
        if (responseData.status == true) {
          if (Allscans) {
            if (Allscans.find((e) => e.consignmentNumber == responseData.details.consignmentNumber)) {
              setError("Item already scanned")
              closeScanner();
              return;
            }
            if (Allscans.find((e) => e.deliveryCourierName != responseData.details.deliveryCourierName)) {
              showDifferentCourierError(responseData.details)
              return;
            }
            else {
              setScansList(Allscans => [...Allscans, responseData.details])
            }
          }
          else {
            setScansList([responseData.details])
          }

        }
        else {
          setError("No pallet found")
        }
        closeScanner();
      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  }

  const closeScanner = () => {
    setScanBarcodeScreenVisible(false);
    setScanLoading(false);
  }

  const closeCourierError = () => {
    setCourierErrorScreenVisible(false);
  }

  const startScan = () => {
    setScanBarcodeScreenVisible(true);
    setScanLoading(true);
  }

  const ScanCard = ({ props, removeCard }) => {
    return (
      <Card style={cards.cardsItemsThin}>
        <Card.Content style={styles.cardsContentThin}>
        <View style={{minWidth:"100%"}}>
          <Card.Title style={{minHeight:40}} titleStyle={{fontSize:14, fontWeight:"normal", margin:0, padding:0}} subtitleStyle={{fontSize:14, fontWeight:"normal", margin:0, padding:0, lineHeight:14}} title={props.customerCompanyName} subtitle={props.customerName} right={() => <View style={{flexDirection:"row", justifyContent:"center", alignItems:"center"}}><Headline style={{fontSize:20, fontWeight:"bold"}}>{props.deliveryCourierName}</Headline><IconButton size={30} icon="close-circle" color="red" onPress={() => removeCard(props.consignmentNumber)}/></View>}/>
</View>
        </Card.Content>

      </Card>
    )
  }


  const removeCard = React.useCallback((consID) => {
    if (scansList != null){
      let scansListArray = scansList;
      console.log(scansListArray)
      let newScans = scansListArray.filter((e) => e.consignmentNumber != consID)
        setScansList(newScans)
    }
  },[scansList])

  React.useEffect(() => {
    if (scansList != null) {
      let scansListArray = scansList
      let scans = Object.keys(scansListArray).map(key => (
        <ScanCard key={key} props={scansListArray[key]} removeCard={removeCard} />
      ))
      setScanCards(scans)
    }
    else{
      setScanCards(null)
    }
  }, [removeCard, scansList])

  React.useEffect(() => {
    if (scansList != null){
    saveScans(scansList)
    }
  }, [scansList])


  const onToggleSnackBar = () => setSnackVisible(!snackVisible);

  const onDismissSnackBar = () => {
    setSnackVisible(false);
    setError("");
  }
  React.useEffect(() => {
    if (error != ""){
      setSnackVisible(true)
    }
  },[error])
  
  useFocusEffect(
    React.useCallback(() => {
    getSavedScans().then((data) => {
      if (data != null){
        setScansList(data)
      }
      else{
        setScansList(null)
      }
    })
  },[])
  );

  const saveScans = async (value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('@courierCollections', jsonValue)
    } catch (e) {
      //error
    }
  }

  const submitScans = () =>{
    let scansToSend = []
    let scansListArray = scansList
    for (let i = 0; i < scansListArray.length; i++) {
      scansToSend.push({"consignmentID":scansListArray[i].consignmentNumber})
    }
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
        "action": "courierPickUpConfirmation",
        "items": scansToSend
    })
    };
    console.log(data)
    return fetch('https://api-veen-e.ewipro.com/v1/jobs/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        console.log(responseData)
        if (responseData.status == true) {
          setError("Success")
          console.log(responseData)
          setScansList(null)
          removeSavedScans()
        }
        else{
          setError("fail")
          console.log(responseData)
        }
      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  }


  const BOTTOM_APPBAR_HEIGHT = 50;
  const { bottom } = useSafeAreaInsets();
  return (
    <ScreenContainer>
           
      <ScrollView contentContainerStyle={styles.JobsScreenScroll}>
      {/* <ScrollView style={{ display: "flex", flex:1, justifyContent: "flex-start", alignItems: "flex-start" }}> */}
        {scanCards}
        </ScrollView>
      <Appbar
      style={[
        styles.bottom,
        {
          height: BOTTOM_APPBAR_HEIGHT + bottom,
          backgroundColor: colors.primary,
        },
      ]}
      safeAreaInsets={{ bottom }}
    >
      <View style={{display:"flex", flexDirection:"row", justifyContent:"space-between", alignItems:"center"}}>
      <View style={{display:"flex", flexDirection:"row", flex:2}}>
      <MaterialCommunityIcons name="barcode-scan" size={30} color={"#fff"} style={{paddingHorizontal:10}} />
      <Subheading style={{color:"#fff"}}>Scan labels</Subheading>
      </View>
      <View style={{display:"flex", flexDirection:"row", flex:1}}>
        <TouchableOpacity onPress={() => submitScans()}>
      <Button icon={"check"} color={"green"} mode="contained">Submit</Button>
      </TouchableOpacity>
      </View>
      </View>
    </Appbar>

      <Portal>
        <Dialog visible={courierErrorScreenVisible} onDismiss={closeCourierError} style={containerStyle}>
          <Dialog.Title>Last item was from a different courier to items already scanned.</Dialog.Title>
          <Dialog.Content><Subheading>Is this okay?</Subheading></Dialog.Content>
          <Dialog.Actions style={{display:"flex", justifyContent:"space-evenly", alignItems:"stretch"}}>
            <Button mode="contained" color="green" style={{paddingHorizontal:20}} onPress={sendSameCourier}>Yes</Button>
            <Button mode="contained" color="red" style={{paddingHorizontal:20}} onPress={closeCourierError}>No</Button>
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


      <TextInput
            style={{ width: 0, height: 0 }}
            autoFocus={true}
            clearTextOnFocus={true}
            placeholder="Barcode"
            placeholderTextColor="#003f5c"
            onChangeText={(text) => sendScan(text)}
            value={Barcode}
            showSoftInputOnFocus={false} />
    </ScreenContainer>
  );
};


