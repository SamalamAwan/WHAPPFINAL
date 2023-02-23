import React from "react";
import { ActivityIndicator, Button, Text, IconButton, useTheme } from 'react-native-paper';
import { View, TouchableOpacity, Image } from "react-native";
import { ScreenContainer } from '../ScreenContainer'
import { Camera } from 'expo-camera';
import { useContext, useState, useRef, useEffect } from "react";
import styles from '../styles'
import { apiKey, AuthContext } from "../context";
import { HeaderBackButton } from '@react-navigation/stack';
import { Splash } from "./splash";

export const CameraDamageScreen = (props) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [photostate, setphotostate] = useState("DEFAULT");
  const [type, setType] = useState(Camera.Constants.Type.back);
  const cameraInstance = useRef();
  const [photoArray, setPhotoArray] = useState([]);
  const { colors } = useTheme();
  const { Profile } = useContext(AuthContext);
  const [captureDisabled, setCaptureDisabled] = useState(false)
  const [confirmDisabled, setConfirmDisabled] = useState(true)
  const [currentPhotos, setCurrentPhotos] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = React.useState("");

  React.useLayoutEffect(() => {
    let nav = props.navigation
    props.navigation.setOptions({
      headerLeft: (props) => (
        <HeaderBackButton
          {...props}
          onPress={() => {
            sendPhotos(photoArray, nav)
          }}
        />
      ),
    });
  }, [props.navigation, photoArray]);




  const sendPhotos = (photoArray, navigation) =>  {
    navigation.navigate({
      name: 'Damage Item',
      params: { itemPhotos: photoArray },
      merge: true,
    });
  }



  const takePicture = async (props) => {
    setCaptureDisabled(true)
    setConfirmDisabled(true)
    if (cameraInstance) {
      let data = null;
      const options = { quality: 0, base64: true };
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
    if (photoArray.length >= 2) {
      setCaptureDisabled(true)
      setError("Max Photos")
    }
    else {
     setCaptureDisabled(false)
    }
  }, [photoArray, props.navigation])

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
      <Camera style={styles.camera} type={type} ref={cameraInstance} ratio="5:3" pictureSize="1280x768">
      </Camera>
      <IconButton
        icon={captureDisabled ? "cancel" : "plus-box"}
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
        onPress={() => sendPhotos(photoArray, props.navigation)}
      />
      {error != "" && <Text style={{backgroundColor:"rgba(0,0,0,0)", color:"red", fontWeight:"bold", fontSize:15, position: "absolute", bottom: 0, margin: 20 }}>
        {error}
      </Text>}
    </ScreenContainer>
  );
}