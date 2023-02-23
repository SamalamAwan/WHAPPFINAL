import React, { useContext } from "react";
import { Button, Text, ToggleButton, useTheme, Headline, Subheading, TextInput, Portal, Dialog } from 'react-native-paper';
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView } from "react-native";
import { ScreenContainer } from '../ScreenContainer'
import { AuthContext } from "../context";
import * as Clipboard from 'expo-clipboard';
import * as Updates from 'expo-updates';
import * as FileSystem from 'expo-file-system';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef, useState } from "react";
import styles from '../styles'
import { apiKey } from "../context";


export const QualityControl = ({ navigation }) => {
  const { colors } = useTheme();
  const ref_input = useRef();
  const {Profile, updateAuthGlobal} = useContext(AuthContext)


  const [Barcode, setBarcode] = useState('');
  const [jobIdInputVisible, setJobIdInputVisible] = useState(false);
  const [searchedJobID, setSearchedJobID] = useState('')
  const showJobIdInput = () => setJobIdInputVisible(true);
  const hideJobIdInput = () => {
    setSearchedJobID('')
    setJobIdInputVisible(false)
  }


  const handleResponse = React.useCallback((data) => {
    if (data.status == false){
      alert(data.message)
    }
    if (data.numerOfConsigments == 1){
    let selectedJob = data.consigments[0].consigment[0]
    let icon = null;
    let style = null;
    switch (selectedJob.consignmentType) {
      case "1":
        icon = 'package-up'
        style = styles.avatarIconPickup
        break;
      case "2":
        icon = 'truck-delivery'
        style = styles.avatarIconDriver
        break;
      case "3":
        icon = 'cube-send'
        style = styles.avatarIconCourier
        break;
      case "4":
        icon = 'cube-send'
        style = styles.avatarIconCourier
        break;
    }
    navigation.navigate('JobStack', { screen: 'Delivery Notes', params: {jobID: selectedJob.id, jobDate: selectedJob.date, icon: icon, style:style, isFromStockControl:true } })
    }
  },[])

  const getFilteredJobByCourierLabel = React.useCallback((labelNo) => {
    let apikey = apiKey
    console.log(labelNo)
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
          "action": "getJobDetails",
          "barcode": labelNo
        })
      };
    return fetch('https://api-veen-e.ewipro.com/v1/jobs/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        console.log(responseData)
        handleResponse(responseData)
      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  }, [Profile.jwt, Profile.userName, Profile.userToken, Profile.userType, handleResponse, updateAuthGlobal])


  const getFilteredJobByJobID = React.useCallback((JobID) => {   
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
          "action": "getJobDetails",
          "consignmentID": JobID
        })
      };
    return fetch('https://api-veen-e.ewipro.com/v1/jobs/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        hideJobIdInput()
        handleResponse(responseData)
      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  }, [Profile.jwt, Profile.userName, Profile.userToken, Profile.userType, handleResponse, updateAuthGlobal])


  React.useEffect(() => {
    if (Barcode != '') {
      getFilteredJobByCourierLabel(Barcode)
    }
    setBarcode('')
    setTimeout(() => {
      ref_input.current.focus()
    }, 100);
  }, [Barcode, getFilteredJobByCourierLabel])

  return (
    <ScreenContainer>
      <View style={{ flex: 4, justifyContent: "center", alignItems: "center" }}>
        <Headline>Scan Courier Label Now</Headline>
        <MaterialCommunityIcons style={{ alignSelf: "center" }} name="barcode-scan" size={200} color={colors.primary} />
      </View>
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Subheading>Nothing to scan?</Subheading>
        <Button mode={"contained"} onPress={showJobIdInput}>Enter Job ID</Button>
      </View>



      <Portal>

        <Dialog visible={jobIdInputVisible} onDismiss={hideJobIdInput} style={{marginBottom:300}}>
          <Dialog.Title style={{ textAlign: "center" }}>Job ID</Dialog.Title>
          <Dialog.Content style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly" }}>

            <TextInput
              keyboardType='numeric'
              onChangeText={(text) => setSearchedJobID(text)}
              value={searchedJobID}
              style={{ width: 100 }}
            />

          </Dialog.Content>
          <Dialog.Actions style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly" }}>
  
            <Button mode="flat" onPress={() => getFilteredJobByJobID(searchedJobID)}>Find Job</Button>
            <Button mode="flat" onPress={() => hideJobIdInput()}>Cancel</Button>

          </Dialog.Actions>
        </Dialog>
  
      </Portal>
    </ScreenContainer>
  );
};