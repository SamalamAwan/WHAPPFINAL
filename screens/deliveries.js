import React, { useContext } from "react";
import { Button, Text, ToggleButton, useTheme, Headline, Subheading, TextInput, Portal, Dialog,ActivityIndicator, List, Card} from 'react-native-paper';
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
import { Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;

const DeliveryCard = ({props, navigation}) => {
  console.log(props.employeeAssigned)
  const [jobStatusColour, setJobStatusColour] = useState()
  React.useEffect(() => {
    if (props.employeeAssigned == 0){
      setJobStatusColour("red")
    }
    else if (props.employeeAssigned != 0){
      setJobStatusColour("orange")
    }
    if (props.confirmed == 1){
      setJobStatusColour("green")
    }

  },[props.confirmed, props.employeeAssigned])

  const { cards, colors } = useTheme();
  return (
    <Card onPress={() => navigation.navigate("Delivery", {company:props.supplierName, plate:props.truckPlateNumber, author:props.purchaseManager, id:props.id})} style={cards.card}>
      <Card.Content style={[styles.cardsContent, { borderLeftColor: jobStatusColour }]}>
      <View style={{minWidth:"100%"}}>
        <Card.Title titleStyle={{fontSize:14, fontWeight:"bold"}} subtitleStyle={{fontSize:14, fontWeight:"bold"}} title={props.supplierName} subtitle={props.truckPlateNumber} right={() => <Text style={{marginRight:10, color:colors.primary}}>{props.employeeAssignedName}</Text>} />
        </View>
      </Card.Content>
    </Card>
  )
};



const DeliveryAccordion = ({props, navigation}) => {
  const { colors } = useTheme();
  const [date, setDate] = React.useState(null)
  const [titleStyle, setTitleStyle] = React.useState({ fontWeight: "normal" });
  const [bold, setBold] = React.useState(null)
  const [collapsed, setCollapsed] = React.useState(null)
  const [expanded, setExpanded] = React.useState(true);
  const handlePress = () => setExpanded(!expanded);

  const [deliveryCards, setDeliveryCards] = React.useState(null);

  React.useEffect(() => {
    setBold(props.bolded)
    setCollapsed(props.collapsed)
    setDate(props.date)
    if (props.delivery != null){
      let deliveryList = Object.keys(props.delivery).map(key => (
        <DeliveryCard key={key} props={props.delivery[key]} navigation={navigation}/>
      ))
      setDeliveryCards(deliveryList);
    }
  }, [props])

  React.useEffect(() => {
    if (bold == true) {
      setTitleStyle({ fontWeight: "bold" })
      setExpanded(true)
    }
    if (collapsed == true) {
      setExpanded(false)
    }
  }, [bold, collapsed])

  return (
    <List.Accordion
    title={date}
    titleStyle={[titleStyle, { color: "#000000" }]} 
    style={{ width: windowWidth, backgroundColor: colors.accordionBG, color: "#000000" }}
    expanded={expanded}
    onPress={handlePress}
    >
      {deliveryCards}
    </List.Accordion>
  )
}


export const Deliveries = ({ navigation }) => {
  const { colors } = useTheme();
  const { Profile,updateAuthGlobal } = useContext(AuthContext);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(true);
  const [deliveryDates, setDeliveryDates] = useState(null);
  const [accordions, setAccordions] = useState(null);
  const [assignedUser, setAssignedUser] = useState('');
  const [allowed, setAllowed] = useState();


  const getCurrentDeliveries = React.useCallback(() => {
    console.log("ran")
    let apikey = apiKey
    let jwt = Profile.jwt
    let authGet = apikey + " " + jwt
    let data = {
        method: 'GET',
        mode: "cors", // no-cors, cors, *same-origin *=default
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authGet
        }
      };
    return fetch('https://api-veen-e.ewipro.com/v1/deliveries/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        console.log(responseData)
          setAllowed(responseData.allowed)
        if (responseData.deliveries){
          setDeliveryDates(responseData.deliveries)
        }
        setIsLoadingDeliveries(false)
      })
      .catch((error) => {
        alert(error)
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  },[Profile.jwt, Profile.userName, Profile.userToken, Profile.userType, updateAuthGlobal])


  useFocusEffect(
    React.useCallback(() => {
      setIsLoadingDeliveries(true)
      getCurrentDeliveries();
    }, [getCurrentDeliveries])
  );

  React.useEffect(() => {
    getCurrentDeliveries();
  }, [getCurrentDeliveries])

  React.useEffect(()=>{
    if (deliveryDates != null) {
      let deliveryDatesLists = Object.keys(deliveryDates).map(key => (
        <DeliveryAccordion key={key} props={deliveryDates[key]} navigation={navigation}/>
      ))
      setAccordions(deliveryDatesLists);
    }
  },[deliveryDates, navigation])
  
  return (
    <ScreenContainer>
       <ScrollView contentContainerStyle={styles.JobsScreenScroll}>
        {isLoadingDeliveries &&
          <ActivityIndicator animating={true} size="large" />
        }
        {!isLoadingDeliveries && (allowed || Profile.adminMode) && accordions}
        {!isLoadingDeliveries && !allowed && !Profile.adminMode && <Text>Permission denied.</Text>}
      </ScrollView>
    </ScreenContainer>
  );
};