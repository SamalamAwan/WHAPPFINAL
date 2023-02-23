import React from "react";
import { TextInput, Text, Surface, Headline, Button, Title, Subheading, Portal, useTheme, Dialog, IconButton, Snackbar, ActivityIndicator, Modal } from 'react-native-paper';
import { View, Image, ImageBackground, Dimensions } from "react-native";
import { ScreenContainer } from '../ScreenContainer'
import { useRef, useState } from "react";
import styles from '../styles'
import { AuthContext } from "../context";
import { KeyboardAvoidingView } from "react-native-web";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { TouchableOpacity } from "react-native-gesture-handler";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const PhotoImage = ({image}) => {
  const [img64, setImg64] = React.useState(image)
  return (
    <ImageBackground source={require('../assets/imageload.png')} style={styles.photoBGimage}>
      <Image style={{ width: 50, height: 50, margin: 2 }}
        resizeMode="cover"
        source={{uri: `data:image/jpeg;base64,${image}`}} />
    </ImageBackground>
  )
}

const Photos = ({ photosGiven, sendPhotoToModal }) => {
  const { colors } = useTheme();
  const [photos, setPhotos] = React.useState(null)
  const { Profile, updateAuthGlobal } = React.useContext(AuthContext);

  React.useEffect(() => {
    if (photosGiven != null) {
      let photoArray = photosGiven
      let photos = Object.keys(photoArray).map(key => (
        <TouchableOpacity key={key} onPress={() => sendPhotoToModal(photoArray[key])}>
          <PhotoImage key={key} image={photoArray[key]} />
        </TouchableOpacity>
      ))
      setPhotos(photos)
    }
  }, [photosGiven, sendPhotoToModal])

  return (
    <View style={{ width: windowWidth, display: "flex", flexDirection: "row", flexWrap: "wrap", padding: 10, }}>
      {photos}
    </View>
  )
}

const PhotoDisplayer = ({ visible, hidePhotoViewer, photo }) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const hide = () =>{
    setIsLoading(true)
    hidePhotoViewer();
  }

  React.useEffect(()=>{
    (photo != '' ? setIsLoading(false) : null)
    //console.log(photo)
  },[photo])

  return (
    <Portal>
   
        <Modal visible={visible} onDismiss={hidePhotoViewer} style={{ width: windowWidth - 20, height: windowHeight - 80, backgroundColor: "#efefef", margin: 10, marginBottom: 0, borderWidth: 5, borderColor: colors.primary }}>
                {isLoading &&
        <ActivityIndicator animating={true} size="large" />
      }
          {!isLoading &&   <View style={{ width: windowWidth - 30, height: windowHeight, marginTop: 30 }}>
            <ReactNativeZoomableView
              maxZoom={90} 
              bindToBorders={true}
            >
              <Image
                style={{ width: windowWidth, minHeight: windowHeight - 100, resizeMode: 'contain' }}
                source={(photo != '') ? {
                  uri: `data:image/jpeg;base64,${photo}`
                } : require('../assets/imageload.png')} />
            </ReactNativeZoomableView>
          </View>}
          <View>
            <Button mode="contained" style={{backgroundColor:colors.notification}} onPress={() => hide()}>CLOSE</Button>
          </View>
        </Modal>

    </Portal>
  )
}


export const DamageItemScreen = ({ navigation, route }) => {
  const { Profile, updateAuthGlobal } = React.useContext(AuthContext);
  const { apiKey } = React.useContext(AuthContext);
  const { colors } = useTheme();
  const [image, setImage] = React.useState(null)
  const [currentPhotos, setCurrentPhotos] = React.useState(null)
  const [name, setName] = React.useState("");
  const [sku, setSku] = React.useState("")
  const [newQuantity, setNewQuantity] = React.useState()
  const [iD, setID] = React.useState("")
  const [error, setError] = React.useState("")
  const [photoForViewer, setPhotoForViewer] = React.useState('');
  const [quantity,setQuantity] = React.useState();
  const [photoDisplayVisible, setPhotoDisplayVisible] = React.useState(false)
  const [currentQuantity, setCurrentQuantity] = React.useState();

  const hidePhotoViewer = () => {
    setPhotoDisplayVisible(false);
  }
  const sendPhotoToModal = (photo) => {
    setPhotoForViewer(photo)
    setPhotoDisplayVisible(true);
  }


  React.useEffect(() => {
    if (route.params.itemPhotos){
    setCurrentPhotos(route.params.itemPhotos)
    }
    else{
      setCurrentPhotos(null)
    }
    setCurrentQuantity(route.params.stockQty)
    setImage(route.params.photo)
    setName(route.params.itemName)
    setSku(route.params.itemCode)
    setID(route.params.id)
  }, [route])

  const sumbitDamagePhotos = React.useCallback(() => {
    let quant = quantity;
    let ID = iD
    let photos = currentPhotos;
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
        "action": "stockDamageReport",
        "productID": ID,
        "stockQty": quant,
        "photosBase64": photos
    })
    };
    console.log(data);
    return fetch('https://api-veen-e.ewipro.com/v1/products/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
       console.log(responseData)
        setConfirmScreenVisible(false)
        if (responseData.status == true) {
          navigation.reset({
            index: 1,
            routes: [
              { name: 'Damage Report', error: "Success" },
            ],
          })
        }
        else {
          navigation.reset({
            index: 1,
            routes: [
              { name: 'Damage Report', error: "Error" },
            ],
          })
        }
      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });

  }, [Profile.jwt, Profile.userName, Profile.userToken, Profile.userType, apiKey, currentPhotos, iD, navigation, quantity, updateAuthGlobal])

  const startSubmitDamage = () => {
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
    setQuantity(text.replace(/[^0-9]/g, ''))
  }

  const [confirmScreenVisible, setConfirmScreenVisible] = React.useState(false);
  
React.useEffect(()=>{
  console.log("current input", quantity)
  console.log("server input", currentQuantity)
  console.log(quantity >= currentQuantity)
},[quantity, currentQuantity])

  return (
    <ScreenContainer flexstart={true}>
      <Title style={{ color: "#000000", marginHorizontal:20, textAlign:"center" }}>{name}</Title>
      <Subheading style={{ textAlign: "center", padding: 5, color: "#000000" }}>{sku}</Subheading>
      <Surface style={styles.surfaceSmall}>
        <Image style={styles.barcodeImage} source={{
          uri: image,
        }} />
      </Surface>
      <Subheading style={{ color: "#000000", marginHorizontal:20, textAlign:"center"}}>1) Enter how many items were damaged</Subheading>
      <Subheading style={{ color: "#000000", marginHorizontal:20, textAlign:"center"}}>2) Add Photos</Subheading>
      <View style={{display:"flex", flexDirection:"row", marginHorizontal:20}}>
      <TextInput
          keyboardType="numeric"
          mode="outlined"
          style={{height:40,lineHeight:30, maxHeight:46,minHeight:46, width:130, flex:3, top:0}}
          dense={true}
          placeholder="# of Products"
          onChangeText={(text) => handleNewQuantity(text)}
          value={quantity}
        />
         
         <Button style={{flex:2, backgroundColor: colors.primary, display: "flex", padding: 0, height: 40, marginTop: 6,marginHorizontal:10, justifyContent: "center" }} labelStyle={{ padding: 0, margin: 0, fontSize: 15, textAlign: "center" }} contentStyle={{ padding: 0, margin: 0, display: "flex", justifyContent: "center", alignItems: "center" }} icon={"camera-plus"} iconColor="white" onPress={() => navigation.navigate('Damage Camera', {currentPhotos: currentPhotos})}>Add Photos</Button>
         </View>
         <View>
          <Text>
            <Photos photosGiven={currentPhotos} sendPhotoToModal={sendPhotoToModal}  />
          </Text>
         </View>
         {photoDisplayVisible && <PhotoDisplayer visible={photoDisplayVisible} hidePhotoViewer={hidePhotoViewer} photo={photoForViewer} />}
         <Button style={{ backgroundColor: currentPhotos && quantity && quantity <= currentQuantity ? "green" : "grey", display: "flex", padding: 0, height: 40, marginTop: 5, justifyContent: "center" }} labelStyle={{ padding: 0, margin: 0, fontSize: 15, textAlign: "center" }} contentStyle={{ padding: 0, margin: 0, display: "flex", justifyContent: "center", alignItems: "center" }} icon={"check"} disabled={currentPhotos && quantity && quantity <= currentQuantity ? false : true } iconColor="white" onPress={() => startSubmitDamage()}>Submit</Button>
        {quantity >= currentQuantity && <Text style={{color:"red", marginTop:10}}>Quantity can't be greater than quantity in stock!</Text>}
      <Portal>
        <Dialog visible={confirmScreenVisible} onDismiss={closeConfirm} style={containerStyle}>
          <Dialog.Title>Are you sure?</Dialog.Title>
          <Dialog.Actions style={{ display: "flex", justifyContent: "space-evenly", alignItems: "stretch" }}>
            <Button mode="contained" color="green" style={{ paddingHorizontal: 20 }} onPress={sumbitDamagePhotos}>Yes</Button>
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