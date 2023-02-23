import React from "react";
import { ActivityIndicator, Button, Text, IconButton, useTheme } from 'react-native-paper';
import { View, TouchableOpacity, Image, BackHandler } from "react-native";
import { ScreenContainer } from '../ScreenContainer'
import { Camera, CameraType } from 'expo-camera';
import { useContext, useState, useRef, useEffect } from "react";
import styles from '../styles'
import { apiKey, AuthContext } from "../context";
import { HeaderBackButton } from '@react-navigation/stack';
import { Splash } from "./splash";
import { useFocusEffect } from "@react-navigation/native";

export const CameraScreen = (props) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [photostate, setphotostate] = useState("DEFAULT");
  const [type, setType] = useState(CameraType.back);
  const [jobID, setJobId] = useState(props.route.params.jobID)
  const [isFromStockControl, setIsFromStockControl] = useState(props.route.params.isFromStockControl)
  const cameraInstance = useRef();
  const [photoArray, setPhotoArray] = useState([])
  const { colors } = useTheme()
  const { Profile } = useContext(AuthContext)
  const [captureDisabled, setCaptureDisabled] = useState(false)
  const [confirmDisabled, setConfirmDisabled] = useState(true)
  const [currentPhotos, setCurrentPhotos] = useState(false)
  const [isSaving, setIsSaving] = useState(false)


  // React.useLayoutEffect(() => {
  //   props.navigation.setOptions({
  //     headerLeft: (props) => (
  //       <HeaderBackButton
  //         {...props}
  //         onPress={() => {
  //           sendPhotos(photoArray)
  //         }}
  //       />
  //     ),
  //   });
  // }, [props.navigation, photoArray]);
  useFocusEffect(
    React.useCallback(() => {
      
      const onBackPress = () => {
        sendPhotos(photoArray, false)
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [])
  );

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('blur', () => {
      sendPhotos(photoArray, true)
    });

    return unsubscribe;
  }, [props.navigation]);

  const sendPhotos = (photoArray, backpress) => {
    let action = "uploadJobPhotos";
    if (isFromStockControl == true){
      action = "uploadJobPhotosQC";
    }
    console.log(action)
    setConfirmDisabled(true)
    setIsSaving(true)
    let apikey = apiKey
    if (Profile.jwt != null) {
      let authGet = apikey + " " + Profile.jwt
      let data = {
        method: 'POST',
        mode: "cors", // no-cors, cors, *same-origin *=default
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authGet
        },
        body: JSON.stringify({
          "action": action,
          "consignmentID": parseInt(jobID),
          "photosBase64": photoArray,
        })
      };
      return fetch('https://api-veen-e.ewipro.com/v1/jobs/', data)
        .then((response) => {
          if (!response.ok) throw new Error(response.status);
          else return response.json();
        })
        .then((responseData) => {
          if(!backpress){
          props.navigation.goBack()
          }
          if (photoArray.length > 0) {
            alert("Photos saved, you may upload up to 5 photos at a time.")
          }
        })
        .catch((error) => {
          props.navigation.goBack()
          if (error.message == "500"){
            alert("Error 500, this could be because the job is too old.")
          }
          else{
          alert(error)
          }
        });
    }
  }



  const takePicture = async (props) => {
    setCaptureDisabled(true)
    setConfirmDisabled(true)
    if (cameraInstance) {
      let data = null;
      const options = { quality: 0.75, base64: true };
      const photo = await cameraInstance.current.takePictureAsync(options)
      let newArray = [...photoArray, photo.base64]
      setPhotoArray(newArray)
      newArray = []
    }
  };

  useEffect(() => {
    if (photoArray.length > 0) {
      setConfirmDisabled(false)
    }
    let photoList = photoArray
    let photos = Object.keys(photoList).map(key => (
      <Image
        style={{
          width: 50,
          height: 100,
          resizeMode: 'contain',
          flex: 1,
          alignSelf: "flex-end",
          justifyContent: "flex-end",
          alignContent: "flex-end",
          alignItems: "flex-end",
          margin: 1,
          padding: 0,
        }}
        source={{
          uri:
            'data:image/png;base64,' + photoList[key]
        }}
        key={key} />
    ))
    setCurrentPhotos(photos)
    if (photoArray.length > 4) {
      setCaptureDisabled(true)
      sendPhotos(photoArray, false)
    }
    else {
      setCaptureDisabled(false)
    }
  }, [photoArray])


  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  if (isSaving) {
    return <Splash />
  }

  return (
    <ScreenContainer>
      <View style={{
        display: "flex",
        flexDirection: "row",
        margin: 0,
        padding: 0,
        top: 5,
        right: 5,
        width: 200,
        height: 100,
        zIndex: 200,
        position: "absolute"
      }}>
        {currentPhotos}
      </View>
      <Camera style={styles.camera} type={type} ref={cameraInstance}>
      </Camera>
      <IconButton
        icon="plus-box"
        disabled={captureDisabled}
        style={{ backgroundColor: colors.primary, position: "absolute", bottom: 0, margin: 20 }}
        color={"#FFFFFF"}
        size={50}
        onPress={() => takePicture(props)}
      />
      <IconButton
        icon="check"
        disabled={confirmDisabled}
        style={{ backgroundColor: colors.primary, position: "absolute", bottom: 0, margin: 20, right: 20 }}
        color={"#FFFFFF"}
        size={50}
        onPress={() => sendPhotos(photoArray, false)}
      />
    </ScreenContainer>
  );
}