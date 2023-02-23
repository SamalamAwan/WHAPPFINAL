import React, { useContext } from "react";
import { Button, Text, ToggleButton, useTheme, Headline, Subheading, TextInput, Portal, Dialog, ActivityIndicator, List, Card, FAB, Surface, Paragraph, Modal } from 'react-native-paper';
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
import { Dimensions, Keyboard } from 'react-native';
import { Profile } from "./profile";
const windowWidth = Dimensions.get('window').width;


const ManagerDropDialog = ({ visible, hideDialog, setConfirmDropJobDialogVisible, setManagerDropScanned, setDropLoading }) => {
  const containerStyle = { backgroundColor: 'white', padding: 20 };
  const { Profile } = useContext(AuthContext)
  const [QR, setQR] = useState('');
  const ref_input = useRef();
  const [isLoading, setIsLoading] = React.useState(false)


  const checkIfManager = (authstring) => {
    setIsLoading(true)
    let authstringArr = authstring.split("-")
    let userToken = authstringArr[0]
    let userType = authstringArr[1]
    let userName = authstringArr[2]
    let data = {
      method: 'POST',
      mode: "cors", // no-cors, cors, *same-origin *=default
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "username": userName,
        "auth_key": userToken,
        "updateAuth": true,
        "user_type": userType,
        "deviceID": Profile.deviceID
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/authenticate/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        if (responseData.token.data.manager == "1") {
          setManagerDropScanned(true)
          setIsLoading(false)
          hideDialog()
          alert("Manager scanned!")
          setConfirmDropJobDialogVisible(true)
          setDropLoading(false)
        }
        else {
          setIsLoading(false)
          hideDialog()
          alert("User is not a manager")
        }
        setDropLoading(false)
      })
      .catch((error) => {
        alert("Unable to log in - " + error.toString());
        setIsLoading(false)
        hideDialog()
        alert("User is not a manager")
        setDropLoading(false)
      });

  }

  React.useEffect(() => {
    if (visible) {
      const interval2 = setInterval(() => {
        ref_input.current.focus()
      }, 100);
      return () => clearInterval(interval2);
    }
  }, [visible])


  return (
    <Portal>
      <Modal visible={visible} onDismiss={hideDialog} contentContainerStyle={containerStyle}>
        {!isLoading &&
          <View style={{ alignSelf: "center", alignContent: "center", display: "flex" }}><Subheading>Scan Manager badge</Subheading>
            <MaterialCommunityIcons style={{ alignSelf: "center" }} name="barcode-scan" size={50} color="#0078D7" />
          </View>}
        {isLoading &&
          <ActivityIndicator animating={true} size="large" />
        }
        <TextInput
          style={{ width: 0, height: 0 }}
          autoFocus={true}
          clearTextOnFocus={true}
          placeholder="QR"
          placeholderTextColor="#003f5c"
          onChangeText={(text) => checkIfManager(text)}
          value={QR}
          ref={ref_input}
          showSoftInputOnFocus={false} />
      </Modal>
    </Portal>
  )
}


const ConfirmDropDialog = ({ visible, hideDialog, finishDropDelivery }) => {
  const containerStyle = { backgroundColor: 'white', padding: 20 };
  return (
    <Portal>
      <Modal visible={visible} onDismiss={hideDialog} contentContainerStyle={containerStyle}>
        <Headline>Drop Job?</Headline>
        <Button onPress={() => finishDropDelivery()}>Yes</Button>
        <Button onPress={() => hideDialog()}>No</Button>
      </Modal>
    </Portal>
  )
}

const ConfirmCompleteDialog = ({ visible, hideDialog, finishCompleteDelivery }) => {
  const containerStyle = { backgroundColor: 'white', padding: 20 };
  return (
    <Portal>
      <Modal visible={visible} onDismiss={hideDialog} contentContainerStyle={containerStyle}>
        <Headline>Complete Job?</Headline>
        <Button onPress={() => finishCompleteDelivery()}>Yes</Button>
        <Button onPress={() => hideDialog()}>No</Button>
      </Modal>
    </Portal>
  )
}


const DeliveryBanner = ({props, assignedUserName}) => {
  console.log(props)
  const {colors} = useTheme();
  return (
    <Surface style={{ flexDirection: "row", justifyContent: "flex-start", padding: 15, width: windowWidth, backgroundColor: colors.notesBG, marginBottom: 1 }}>
      <View style={{ flex: 5 }}>
        <Subheading style={{ fontWeight: "bold", marginTop: 0, color: "#000000" }}>{props.company}</Subheading >
        <Paragraph style={{ color: "#000000" }}>{props.plate}</Paragraph>
      </View>
      <View style={{ flex: 3, justifyContent: "space-between" }}>
        <Text style={{ textAlign: "right", fontSize: 12, color: colors.primary, fontWeight: "bold" }}>Author: {props.author}</Text>
        <Text style={{ textAlign: "right", fontSize: 12, color: "red", fontWeight: "bold" }}>{assignedUserName != null && assignedUserName != "" ? "Collector:" + assignedUserName : ""}</Text>
      </View>
    </Surface>
  )
}

const PickUpDeliveryFAB = ({ pickUpLoading, startPickUpDelivery }) => {
  const { Profile, updateAuthGlobal } = useContext(AuthContext)
  const [shiftActive, setShiftActive] = React.useState(false)
  const checkIfClockedIn = React.useCallback(() => {
    let apikey = apiKey
    let jwt = Profile.jwt
    let authGet = apikey + " " + jwt
    let userID = Profile.id
    let data = {
      method: 'POST',
      mode: "cors", // no-cors, cors, *same-origin *=default
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authGet
      },
      body: JSON.stringify({
        "action": "getCurrentShift",
        "userID": userID
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/employees/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        if (responseData.shiftActive) {
          setShiftActive(true)
        }
        else {
          setShiftActive(false)
        }
      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  }, [Profile.id, Profile.jwt, Profile.userName, Profile.userToken, Profile.userType, updateAuthGlobal])

  React.useEffect(() => {
    checkIfClockedIn()
  }, [checkIfClockedIn])

  return (
    <FAB
      style={Profile.adminMode ? styles.fabRaised : styles.fab}
      loading={pickUpLoading}
      color="#fff"
      label="Pick Up Delivery"
      icon="check"
      onPress={() => shiftActive ? startPickUpDelivery() : alert("Please clock in first using the My Shift page.")}
    />
  )
}

const DropDeliveryFAB = ({ dropLoading, startDropDelivery }) => {
  const { Profile, updateAuthGlobal } = useContext(AuthContext)
  const [shiftActive, setShiftActive] = React.useState(false)
  const checkIfClockedIn = React.useCallback(() => {
    let apikey = apiKey
    let jwt = Profile.jwt
    let authGet = apikey + " " + jwt
    let userID = Profile.id
    let data = {
      method: 'POST',
      mode: "cors", // no-cors, cors, *same-origin *=default
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authGet
      },
      body: JSON.stringify({
        "action": "getCurrentShift",
        "userID": userID
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/employees/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        if (responseData.shiftActive) {
          setShiftActive(true)
        }
        else {
          setShiftActive(false)
        }
      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  }, [Profile.id, Profile.jwt, Profile.userName, Profile.userToken, Profile.userType, updateAuthGlobal])

  React.useEffect(() => {
    checkIfClockedIn()
  }, [checkIfClockedIn])

  return (
    <FAB
      style={styles.fabRaisedX}
      loading={dropLoading}
      color="#fff"
      label="Drop Delivery Job"
      icon="cancel"
      onPress={() => shiftActive ? startDropDelivery() : alert("Please clock in first using the My Shift page.")}
    />
  )
}


const CompleteDeliveryFAB = ({ completeLoading, startCompleteDelivery }) => {
  const { Profile, updateAuthGlobal } = useContext(AuthContext)
  const [shiftActive, setShiftActive] = React.useState(false)
  const checkIfClockedIn = React.useCallback(() => {
    let apikey = apiKey
    let jwt = Profile.jwt
    let authGet = apikey + " " + jwt
    let userID = Profile.id
    let data = {
      method: 'POST',
      mode: "cors", // no-cors, cors, *same-origin *=default
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authGet
      },
      body: JSON.stringify({
        "action": "getCurrentShift",
        "userID": userID
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/employees/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        if (responseData.shiftActive) {
          setShiftActive(true)
        }
        else {
          setShiftActive(false)
        }
      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  }, [Profile.id, Profile.jwt, Profile.userName, Profile.userToken, Profile.userType, updateAuthGlobal])

  React.useEffect(() => {
    checkIfClockedIn()
  }, [checkIfClockedIn])

  return (
    <FAB
      style={styles.fabGreen}
      loading={completeLoading}
      color="#fff"
      label="Complete Delivery Job"
      icon="check"
      onPress={() => shiftActive ? startCompleteDelivery() : alert("Please clock in first using the My Shift page.")}
    />
  )
}

const ProductCard = ({confirmed, props, assignedUser, productHandler}) => {
  const { cards } = useTheme();
  const [currentQuantity, setCurrentQuantity] = useState(props.quantity);
  const {Profile} = useContext(AuthContext);
  const [isAssignedToUser, setIsAssignedToUser] = useState(false)
  const [prodInfo, setProdInfo] = useState();
  React.useEffect(() => {
    let currentInfo = { 
      "productID": props.productID,
      "deliveryLineID": props.deliveryLineID,
      "quantityDelivered": currentQuantity,
      "quantityOrdered": props.quantity,
    }
    setProdInfo(currentInfo);
  },[props, currentQuantity])

  const handleText = React.useCallback((text) => {
    setCurrentQuantity(text)
    productHandler(props.deliveryLineID, props.productID, text, props.quantity)
  },[productHandler, props.deliveryLineID, props.productID, props.quantity])

  React.useEffect(() => {
    setCurrentQuantity(props.quantity)
    handleText(currentQuantity)
    if (Profile.id == assignedUser && confirmed == 0){
      setIsAssignedToUser(true)
    }
    else{
      setIsAssignedToUser(false)
    }
  },[Profile.id, assignedUser, confirmed, currentQuantity, handleText, props])


  const RightContent = (isAssignedToUser, currentQuantity, setCurrentQuantity, originalQuantity) => {
    if (isAssignedToUser){
      return (
        <TextInput
    mode="outlined"
    label="Quantity"
    placeholder={originalQuantity}
    value={currentQuantity}
    keyboardType='numeric'
    style={{marginRight:10, marginVertical:10, width:120}}
    onChangeText={text => handleText(text)}
    right={<TextInput.Affix text={"/"+originalQuantity} />}
    />
      )
    }
    else{
      return <Text style={{marginRight:10}}>{originalQuantity}</Text>
    }
  }

  return (
    <Card style={cards.card}>
      <Card.Content style={[styles.cardsContent]}>
      <View style={{minWidth:"100%"}}>
        <Card.Title title={props.code} subtitle={props.name} right={() => RightContent(isAssignedToUser, currentQuantity, setCurrentQuantity, props.quantity)}
     />
     </View>
      </Card.Content>
    </Card>
  )
}


const ProductList = ({confirmed, products, assignedUser, productHandler}) => {
  const {colors} = useTheme();
  const [expanded, setExpanded] = React.useState(true);
  const handlePress = () => setExpanded(!expanded);
  const [productCards, setProductCards] = React.useState(false);
  const [currentProducts, setCurrentProducts] = React.useState();

  React.useEffect(()=>{
    if (products != null){
      let productList = Object.keys(products).map(key => (
        <ProductCard confirmed={confirmed} key={key} props={products[key]} assignedUser={assignedUser} productHandler={productHandler}/>
      ))
      setProductCards(productList);
    }
  },[assignedUser, confirmed, productHandler, products])

  return (
    <List.Accordion
    title={"Products"}
    titleStyle={{fontWeight:"bold", color: "#000000" }} 
    style={{ width: windowWidth, backgroundColor: colors.accordionBG, color: "#000000" }}
    expanded={expanded}
    onPress={handlePress}
    >
      {productCards}
    </List.Accordion>
  )
}


export const Delivery = ({ route, navigation }) => {
  const [isLoadingDelivery, setIsLoadingDelivery] = React.useState(true);
  const { Profile, updateAuthGlobal } = React.useContext(AuthContext);
  const [products, setProducts] = React.useState(null)
  const [pickUpLoading, setPickUpLoading] = React.useState(false)
  const [dropLoading, setDropLoading] = React.useState(false)
  const [completeLoading, setCompleteLoading] = React.useState(false)
  const [assignedUser, setAssignedUser] = React.useState();
  const [assignedUserName, setAssignedUserName] = React.useState();
  const [confirmDropDeliveryDialogVisible, setConfirmDropDeliveryDialogVisible] = React.useState(false)
  const [confirmCompleteDeliveryDialogVisible, setConfirmCompleteDeliveryDialogVisible] = React.useState(false)
  const [managerDropDialogVisible, setManagerDropDialogVisible] = React.useState(false)
  const [managerDropScanned, setManagerDropScanned] = React.useState(false)
  const [completedProducts, setCompletedProducts] = React.useState([]);
  const [deliveryID, setDeliveryID] = React.useState(null);
  const [confirmed, setConfirmed] = React.useState(false);

  const getDeliveryProducts = React.useCallback(() => {
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
        "action": "getDeliveryDetails",
        "deliveryID": route.params.id
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/deliveries/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        console.log(responseData)
        if (responseData.message){
        alert(responseData.message)
        }
        if (responseData.deliveries){
          if (responseData.deliveries[0].delivery){
            setProducts(responseData.deliveries[0].delivery[0].products)
            setDeliveryID(responseData.deliveries[0].delivery[0].id)
            setAssignedUser(responseData.deliveries[0].delivery[0].employeeAssigned)
            setAssignedUserName(responseData.deliveries[0].delivery[0].employeeAssignedName)
            setConfirmed(responseData.deliveries[0].delivery[0].confirmed)
            setIsLoadingDelivery(false)
          }
        }
      })
      .catch((error) => {
        alert(error)
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  }, [Profile.jwt, Profile.userName, Profile.userToken, Profile.userType, route.params.id, updateAuthGlobal])

  const pickUpDelivery = React.useCallback(() => {
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
        "action": "pickUpJob",
        "deliveryID": route.params.id
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/deliveries/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        console.log(responseData)
        if (responseData.message){
          alert(responseData.message)
          }
        getDeliveryProducts();
        setPickUpLoading(false);
      })
      .catch((error) => {
        alert(error)
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  }, [Profile.jwt, Profile.userName, Profile.userToken, Profile.userType, getDeliveryProducts, route.params.id, updateAuthGlobal])

  const dropDelivery = React.useCallback(() => {
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
        "action": "dropTheJob",
        "deliveryID": route.params.id
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/deliveries/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        console.log(responseData)
        if (responseData.message){
          alert(responseData.message)
          }
        getDeliveryProducts();
        setManagerDropDialogVisible(false);
        setConfirmDropDeliveryDialogVisible(false);
        setDropLoading(false)

      })
      .catch((error) => {
        alert(error)
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  }, [Profile.jwt, Profile.userName, Profile.userToken, Profile.userType, getDeliveryProducts, route.params.id, updateAuthGlobal])

  const completeDelivery  = React.useCallback(() => {
    let apikey = apiKey
    let jwt = Profile.jwt
    let products = completedProducts
    let authGet = apikey + " " + jwt
    let data = {
      method: 'POST',
      mode: "cors", // no-cors, cors, *same-origin *=default
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authGet
      },
      body: JSON.stringify({
        "action": "completeTheJob",
        "deliveryID": deliveryID,
        "products": products,
    })
    };
    console.log(data)
    return fetch('https://api-veen-e.ewipro.com/v1/deliveries/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        console.log(responseData)
        if (responseData.message){
        alert(responseData.message)
        }
        getDeliveryProducts();
        setConfirmCompleteDeliveryDialogVisible(false)
      })
      .catch((error) => {
        alert(error)
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
          setConfirmCompleteDeliveryDialogVisible(false)
        }
      });
  }, [Profile.jwt, Profile.userName, Profile.userToken, Profile.userType, completedProducts, deliveryID, getDeliveryProducts, updateAuthGlobal])

  React.useEffect(() => {
    getDeliveryProducts();
  }, [getDeliveryProducts])


  const startPickUpDelivery = () => {
    setPickUpLoading(true)
    pickUpDelivery()
  }

  const startDropDelivery = () => {
    if (!managerDropScanned && !Profile.adminMode) {
      setManagerDropDialogVisible(true)
    } else {
      setConfirmDropDeliveryDialogVisible(true)
    }
    setDropLoading(true)
  }

  const startCompleteDelivery = () => {
    setCompleteLoading(true)
    setConfirmCompleteDeliveryDialogVisible(true)
  }

  const finishCompleteDelivery = () =>{
    completeDelivery();
    setCompleteLoading(false);
  }

  const finishDropDelivery = () =>{
    dropDelivery();
    setDropLoading(false);
  }

  const hideConfirmDropDialog = () => {
    setConfirmDropDeliveryDialogVisible(false);
    setDropLoading(false)
  }

  const hideManagerDropDialog = () => {
    setManagerDropDialogVisible(false);
    setDropLoading(false)
  }

  const hideCompleteDeliveryDialog = () => {
    setConfirmCompleteDeliveryDialogVisible(false)
    setCompleteLoading(false)
  }

  const productHandler = (deliveryLineID, product, quantityArrived, quantityOrdered) => {
    let completedProductArray = completedProducts;
    let productCompleted = {
      "productID": product,
      "deliveryLineID": deliveryLineID,
      "quantityDelivered": quantityArrived,
      "quantityOrdered": quantityOrdered
    }
    if (completedProductArray.find((e) => e.deliveryLineID == productCompleted.deliveryLineID )) {
      let index = completedProductArray.findIndex((e) => e.deliveryLineID == productCompleted.deliveryLineID )
      console.log(index)
      console.log(productCompleted.deliveryLineID)
      completedProductArray[index] = productCompleted;
    }
    else{
      completedProductArray.push(productCompleted)
    }

    //completedProducts.push(productCompleted)
    setCompletedProducts(completedProductArray)
  }

    React.useEffect(() => {
      Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
      Keyboard.addListener('keyboardDidHide', _keyboardDidHide);
  
      // cleanup function
      return () => {
        Keyboard.removeListener('keyboardDidShow', _keyboardDidShow);
        Keyboard.removeListener('keyboardDidHide', _keyboardDidHide);
      };
    }, []);
  
    const [keyboardStatus, setKeyboardStatus] = useState(false);
    const _keyboardDidShow = () => setKeyboardStatus(true);
    const _keyboardDidHide = () => setKeyboardStatus(false);



  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.NotesScreenScroll}>
        {isLoadingDelivery &&
          <ActivityIndicator animating={true} size="large" />
        }
        {!isLoadingDelivery && <DeliveryBanner products={products} props={route.params} assignedUserName={assignedUserName} />}
        {!isLoadingDelivery && <ProductList confirmed={confirmed} products={products} assignedUser={assignedUser} productHandler={productHandler}/>}
      </ScrollView>
      {assignedUser == 0 && <PickUpDeliveryFAB startPickUpDelivery={startPickUpDelivery} pickUpLoading={pickUpLoading} />}
      {assignedUser == Profile.id && confirmed == 0 && !keyboardStatus && <DropDeliveryFAB startDropDelivery={startDropDelivery} dropLoading={dropLoading} />}
      <ConfirmDropDialog visible={confirmDropDeliveryDialogVisible} hideDialog={hideConfirmDropDialog} finishDropDelivery={finishDropDelivery} />
      <ManagerDropDialog visible={managerDropDialogVisible} hideDialog={hideManagerDropDialog} setConfirmDropDeliveryDialogVisible={setConfirmDropDeliveryDialogVisible} setManagerDropScanned={setManagerDropScanned} setDropLoading={setDropLoading} />
      <ConfirmCompleteDialog visible={confirmCompleteDeliveryDialogVisible} hideDialog={hideCompleteDeliveryDialog} finishCompleteDelivery={finishCompleteDelivery}/>
      {assignedUser == Profile.id && confirmed == 0 && !keyboardStatus && <CompleteDeliveryFAB startCompleteDelivery={startCompleteDelivery} completeLoading={completeLoading}/>}
    </ScreenContainer>
  );
};