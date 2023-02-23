import React from "react";
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView } from "react-native";
import { ScreenContainer } from '../ScreenContainer'
import styles from '../styles'
import { Title, Surface, Text, Card, Paragraph, Avatar, Subheading, Caption, Headline, Badge, Appbar, List, TextInput, useTheme } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from "../context";
import { apiKey } from "../context";
import { useContext, useState } from "react";

import { useFocusEffect } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import { Splash } from './splash'

const windowWidth = Dimensions.get('window').width;


const Comment = () => {
  return (
    <KeyboardAvoidingView style={{ width: windowWidth, padding: 20 }} behavior={"position"}>
      <Subheading style={{ alignSelf: "flex-start" }}>Comments</Subheading>
      <TextInput label={"Comments"} mode={"outlined"} placeholder={"Type your comment here..."} multiline={true} />
    </KeyboardAvoidingView>
  )
}

const BottomBar = () => {

  const { Profile } = React.useContext(AuthContext);

  return (
    <View style={{ width: windowWidth, bottom: 0 }}>
      <Appbar style={{ justifyContent: "space-around" }}>
        <Appbar.Action
          icon="check"
          onPress={() => alert("send updated delivery note and comment")}
        />
      </Appbar>
    </View>
  )
}

const ItemCard = (props) => {

  React.useEffect(()=>{
    console.log(props)
  },[props])

  const [isFromStockControl, setIsFromStockControl] = useState(props.isFromStockControl)
  const [itemID, setItemID] = useState(props.props.deliveryNoteLineId)
  const [jobType, setJobType] = useState('')
  const [icon, setIcon] = useState('')
  const [unfinished, setUnfinished] = useState(false)
  const [itemName, setItemName] = useState(props.props.productName)
  const [itemQty, setItemQty] = useState(props.needed)
  const [itemQtyPicked, setItemQtyPicked] = useState(props.pickedUp)
  const [itemCode, setItemCode] = useState(props.props.productCode)
  const [jobStatusColour, setJobStatusColour] = useState('#fff')
  const [productBarcode, setProductBarcode] = useState('')
  const { cards } = useTheme();
  const [itemTinted, setItemTinted] = React.useState(props.props.tinted)
  const [itemTintable, setItemTintable] = React.useState(props.props.tintable)
  const [packerForJob, setPackerForJob] = React.useState(props.packer)
  const { Profile } = useContext(AuthContext)
  const [photo, setPhoto] = React.useState(props.photo)


  const RightContent = () => {
    return (
      <View style={{ flexDirection: "row" }}>
  {itemTintable == true && !itemTinted &&
    <MaterialCommunityIcons style={{ alignSelf: "flex-end", display: "flex" }} name="palette" size={30} color="#737373" />
  }
   {itemTintable == true && itemTinted &&
    <MaterialCommunityIcons style={{ alignSelf: "flex-end", display: "flex" }} name="palette" size={30} color="green" />
  }
    <Badge size={30} style={{ fontSize: 16, color: "#fff", backgroundColor: jobStatusColour, width: 60 }}>
      {unfinished ? itemQtyPicked + "/" + itemQty : itemQty}
    </Badge>
    </View>
    )
  }

  React.useEffect(() => {
    if (itemTintable != ''){
      setProductBarcode(props.tintingBarcode)
    }
    else{
      setProductBarcode(props.props.productBarcode)
    }
    setItemQty(props.needed)
    setItemQtyPicked(props.pickedUp)
    let qNeeded = parseInt(itemQty)
    let qPicked = parseInt(itemQtyPicked)
    if (qPicked != 0 && qPicked < qNeeded) {
      setUnfinished(true)
    }
    else {
      setUnfinished(false)
    }
    switch (props.props.pickedUp) {
      case "0":
        setJobStatusColour("#fc0000")
        break;
      case "1":
        setJobStatusColour("#0078d7")
        break;
      case "2":
        if (unfinished) {
          setJobStatusColour("orange")
        }
        else {
          setJobStatusColour("#00cf53")
        }
        break;
    }
  }, [props, itemQtyPicked, itemQty, itemTintable, unfinished])

  return (
    <Card style={cards.cardsItems}
      onPress={() => {
        Profile.adminMode ? props.navigation.navigate('Barcode', { itemID, productBarcode, itemCode, itemName, itemQty, photo, itemTintable }) : props.isFromStockControl ? alert("You are stock controller.") : props.status == "-2" ? alert("Please pick up the job first.") : props.props.pickedUp == "2" ? alert("Item already complete") : packerForJob != Profile.id ? alert("This is not your job.") : itemTintable == true && itemTinted == false ? alert("Items have not finished tinting") : props.navigation.navigate('Barcode', { itemID, productBarcode, itemCode, itemName, itemQty, photo, itemTintable })
      }}>
      <Card.Content style={[styles.cardsContent, { borderLeftColor: jobStatusColour }]}>
      <View style={{minWidth:"100%"}}>
          <Card.Title
            titleStyle={cards.itemTitle}
            subtitleStyle={cards.itemSubtitle}
            title={itemName}
            subtitle={itemCode}
            right={RightContent}
            rightStyle={{ marginRight: 20 }} />
</View>

      </Card.Content>

    </Card>
  )
};

export const ItemsScreen = ({ navigation, route }) => {

  const [items, setItems] = React.useState(null);
  const [cards, setCards] = React.useState(null)
  const [noteID, setNoteID] = React.useState(route.params.noteID)
  const [noteTinted, setNoteTinted] = React.useState(route.params.tinted)
  const [isFromStockControl, setIsFromStockControl] = React.useState(route.params.isFromStockControl)
  const { Profile } = useContext(AuthContext);
  const [jobID, setJobID] = React.useState(route.params.jobID)
  const [jobDate, setJobDate] = React.useState(route.params.jobDate)
  const [packer, setPacker] = React.useState(route.params.packer)
  const [jobStatus, setJobStatus] = React.useState()
  const [expanded, setExpanded] = React.useState(true);
  const handlePress = () => setExpanded(!expanded);
  const { colors } = useTheme();
  const [expanded2, setExpanded2] = React.useState(true);
  const handlePress2 = () => setExpanded2(!expanded2);
  const [tintingBarcode, setTintingBarcode] = React.useState(route.params.tintingBarcode)

  
  const getProductData = (jwt2, sku2) => {
    const jwt = jwt2;
    const sku = sku2
    let authGet = apiKey + " " + jwt
    let data = {
      method: 'GET',
      mode: "cors", // no-cors, cors, *same-origin *=default
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authGet
      },
    };
    return fetch('https://api-veen-e.ewipro.com/v1/products/?sku=' + sku, data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        //console.log(responseData)
      })
      .catch((error) => {
        alert(error)
      });
  }

  const sendJwtAndNoteIDForItems = (jwt, noteID, jobID) => {
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
        body: JSON.stringify({
          "action": "getJobDetails",
          "consignmentID": jobID
        })
      };
      return fetch('https://api-veen-e.ewipro.com/v1/jobs/', data)
        .then((response) => {
          if (!response.ok) throw new Error(response.status);
          else return response.json();
        })
        .then((responseData) => {
          let currentJob = (responseData.consigments[0].consigment[0])
          let currentNote = currentJob.deliveryNotes.find((n) => n.id == noteID)
          let jobStatus = currentJob.status
          setPacker(currentJob.packer.id)
          setItems(currentNote.deliveryNotesLines)
          setJobStatus(jobStatus)
        })
        .catch((error) => {
          console.log(error)
        });
    }
  }

  React.useEffect(() => {
    sendJwtAndNoteIDForItems(Profile.jwt, noteID, jobID)
    getProductData(Profile.jwt)
  }, [Profile, noteID, jobID, jobDate]);

  useFocusEffect(
    React.useCallback(() => {
      sendJwtAndNoteIDForItems(Profile.jwt, noteID, jobID)
    }, [Profile])
  );

  React.useEffect(() => {
    sendJwtAndNoteIDForItems(Profile.jwt, noteID, jobID)
  }, [])

  React.useEffect(() => {
    let itemList = items;
    let status = jobStatus

    if (itemList != null) {
      let cards = Object.keys(itemList).map(key => 
      (
       
        <ItemCard key={key} props={itemList[key]} isFromStockControl={isFromStockControl} pickedUp={itemList[key].pickedUpQty} needed={itemList[key].productQty} navigation={navigation} status={status} noteTinted={noteTinted} packer={packer} tintingBarcode={tintingBarcode} photo={itemList[key].productPhotoUri} />
      ))
      setCards(cards)
    }
  }, [items, jobStatus]);

  if (!cards) {
    return (
      <Splash />
    )
  }


  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.JobsScreenScroll}>
        <List.Accordion
          title={"Materials"} titleStyle={{ color: "#000000" }} style={{ width: windowWidth, backgroundColor: colors.accordionBG }} expanded={expanded} onPress={handlePress}>
          {cards}
        </List.Accordion>
      </ScrollView>
    </ScreenContainer>
  );
};

