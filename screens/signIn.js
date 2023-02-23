import React, { useState, useRef } from "react";
import { View, TouchableOpacity, Text, Image, ImageBackground, KeyboardAvoidingView } from "react-native";
import { AuthContext } from "../context";
import { useTheme, TextInput, Button, IconButton, Portal, Modal, Subheading, ActivityIndicator } from 'react-native-paper';
import { ScreenContainer } from "../ScreenContainer";
import styles from '../styles'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

export const SignIn = () => {
  const { signIn, updateAuthGlobal, setRelog } = React.useContext(AuthContext);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setuserType] = useState('2');
  const [QR, setQR] = useState('');
  const {colors} = useTheme();

  const [devSignInHit, setDevSignIn] = useState(false)

  const [visible, setVisible] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const ref_input = useRef();
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: 'white', padding: 5, margin: 10, display:"flex", height:300};
  const {Profile} = React.useContext(AuthContext)
  React.useEffect(() => {
    if (!visible){
      const interval = setInterval(() => {
        ref_input.current.focus()
      }, 100);
      return () => clearInterval(interval);
    }
  }, [visible])



  const sendQR = React.useCallback((QR) => {
    setIsLoading(true)
    let data = (QR.split("-"))
    updateAuthGlobal(data[2], data[0], userType)
    return () => {data = "";setIsLoading(false)}
  },[updateAuthGlobal, userType])

  React.useEffect(() =>{
    if (QR != ""){
    sendQR(QR)
    }
  },[QR, sendQR])

  const devSignIn = React.useCallback(() => {
    setUserName("sawan")
    setPassword("Sa2022!!")
    setDevSignIn(true)
  },[])

  React.useEffect(() =>{
    if (devSignInHit == true){
    getAuth()
    }
  },[devSignInHit, getAuth])


  const getAuth = React.useCallback(() => {

    let data = {
      method: 'POST',
      mode: "cors", // no-cors, cors, *same-origin *=default
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "username":userName,
      "password":password,
      "updateAuth":false,
      "user_type":userType,
      "deviceID": Profile.deviceId
    })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/authenticate/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        //console.log(responseData)
        signIn(responseData.auth_key, responseData.jwt, responseData.token.data.user_type, responseData.username, responseData.namesurname, responseData.user_id, responseData.token.data.administrator,responseData.token.data.supervisor, responseData.token.data.manager, responseData.token.data.user_class_name, responseData.token.data.branchName, responseData.token.privilegesStructure, responseData.token.data.userClass);
        setRelog(false)
      })
      .catch((error) => {
        alert("Unable to log in - " + error.toString());
      });
  },[Profile.deviceId, password, setRelog, signIn, userName, userType])

  return (
    <ScreenContainer nomargin={true}>
      <ImageBackground source={require('../assets/loginBG.png')} style={styles.BGimage}>
      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
        <KeyboardAvoidingView contentContainerStyle={styles.loginContainer} behavior={"padding"} keyboardVerticalOffset={60}>
      <View style={styles.loginWrapper}>

      {/* <ToggleButton.Row onValueChange={value => setuserType(value)} style={styles.toggleButtonGroup} value={userType}>
        <ToggleButton icon="account-supervisor" value="1" style={userType == 1 ? [styles.toggleButton,{backgroundColor: colors.primary}] : styles.toggleButton} color={userType == 1 ? colors.accent : colors.disabled} />
        <ToggleButton icon="package-variant-closed" value="2" style={userType == 2 ? [styles.toggleButton,{backgroundColor: colors.primary}] : styles.toggleButton} color={userType == 2 ? colors.accent : colors.disabled}  />
      </ToggleButton.Row> */}
      <TextInput
      mode="flat"
      underlineColor={"#eee"}
      style={[styles.logInInput, {marginTop:10}]}
        placeholder="Username"
        placeholderTextColor="#CECECE"
        onChangeText={text => setUserName(text)}
        value={userName} />
      <TextInput
            underlineColor={"#eee"}
      mode="flat"
            style={styles.logInInput}
        secureTextEntry
        placeholder="Password"
        placeholderTextColor="#CECECE"
        onChangeText={text => setPassword(text)}
        value={password}/>

      <Button mode="contained" style={styles.logInButton} labelStyle={{color:"#FFFFFF", textAlignVertical:"center"}} onPress={() => getAuth()}>LOGIN</Button>
      <Button mode="outlined" style={styles.logInButton} labelStyle={{ color: colors.primary, textAlignVertical: "center" }} onPress={() => hideModal()}>USE CARD</Button>
      <TouchableOpacity>
    </TouchableOpacity>
</View>
</KeyboardAvoidingView>
        </Modal>
      </Portal>
      <IconButton
        icon="card-bulleted-off"
        style={{ backgroundColor: colors.primary, position: "absolute", top: 0, margin: 20, right:0, padding:0, width:50, height:50 }}
        color={"#FFFFFF"}
        iconColor={"#FFFFFF"}
        size={30}
        onPress={() => showModal()}
      />
        {(Constants.appOwnership == "expo" || Constants.experienceUrl == "http://localhost:19006") && <IconButton
        icon="auto-fix"
        style={{ backgroundColor: colors.primary, position: "absolute", top: 0, margin: 20, left:0, padding:0, width:50, height:50 }}
        color={"#FFFFFF"}
        size={30}
        onPress={() => devSignIn()}
      />
    }
      <Image
           style={styles.SignInLogo}
           source={require('../assets/logo-ewistore-main-blue2021.png')}
           resizeMode={"contain"}
      />

<View style={{
        flexDirection: 'row',
        position: 'relative',
        height: 50,
        paddingHorizontal:60,
        marginBottom: 20
      }}>
        <TouchableOpacity 
        style={userType == 2 ? [styles.toggleButton,styles.toggleButtonActive] : styles.toggleButton}
        onPress={() => setuserType("2")}>
          <Text style={userType == 2 ? [styles.toggleButtonText,styles.toggleButtonTextActive] : styles.toggleButtonText}>
            Packer
        </Text>
        </TouchableOpacity>
        <TouchableOpacity 
                style={userType == 1 ? [styles.toggleButton,styles.toggleButtonActive] : styles.toggleButton}
        onPress={() => setuserType("1")}>
        <Text style={userType == 1 ? [styles.toggleButtonText,styles.toggleButtonTextActive] : styles.toggleButtonText}>
           Manager
        </Text>
        </TouchableOpacity>
      </View>
{!isLoading &&
            <View style={{ alignSelf: "center", alignContent: "center", display: "flex" }}><Subheading>Scan user QR Code now</Subheading>
          
              <MaterialCommunityIcons style={{ alignSelf: "center" }} name="qrcode-scan" size={50} color="#0078D7" />
            </View>}
          {isLoading &&
            <ActivityIndicator animating={true} size="large" />
          }
          <TextInput
            style={{ width: 0, height: 0 }}
            autoFocus={true}
            clearTextOnFocus={true}
            placeholder="Barcode"
            placeholderTextColor="#003f5c"
            onChangeText={(text) => setQR(text)}
            value={QR}
            ref={ref_input}
            showSoftInputOnFocus={false} />
</ImageBackground>
    </ScreenContainer>
  );
};
