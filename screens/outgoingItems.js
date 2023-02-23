import React from "react";
import { TextInput, Text, Surface, Headline, Button, Title, Subheading, Appbar, Portal, Modal, useTheme, FAB, ActivityIndicator, Searchbar, Card, Avatar, Colors, List, Badge} from 'react-native-paper';
import { View, Image, ScrollView } from "react-native";
import { ScreenContainer } from '../ScreenContainer'
import { useRef, useState } from "react";
import styles from '../styles'
import { AuthContext, apiKey } from "../context";
import { Dimensions, KeyboardAvoidingView } from 'react-native';
import { useContext } from "react";
import { useFocusEffect } from '@react-navigation/native';


const ProductCard = ({ product }) => {
  const [itemName, setItemName] = useState('')
  const [itemCode, setItemCode] = useState('')
  const [itemQty, setItemQty] = useState('')



  const { cards } = useTheme();
  const { Profile } = useContext(AuthContext)
  const [photo, setPhoto] = React.useState('../assets/imageload.png')
  React.useEffect(() => {
    setItemName(product.product_name)
    setItemCode(product.product_code)
    setItemQty(product.quantity)
    setPhoto(product.product_photo)
  }, [product])

  
  const RightContent = () => {
    return (
      <View style={{ flexDirection: "row" }}>
    <Badge size={30} style={{ fontSize: 16, color: "#fff", backgroundColor: "green", width: 60 }}>
        {itemQty}
    </Badge>
    </View>
    )
  }


    
  const LeftContent = () => <Image style={{minWidth:50, minHeight:50}} source={{
    uri: photo,
  }} />



  return (
    <Card style={cards.cardsItems}>
      <Card.Content style={[styles.cardsContent, { borderLeftColor: "black" }]}>
        <View style={{minWidth:"100%"}}>
          <Card.Title
            titleStyle={cards.itemTitle}
            subtitleStyle={cards.itemSubtitle}
            title={itemName}
            subtitle={itemCode}
            right={RightContent}
            rightStyle={{ marginRight: 20 }}
            left={LeftContent}
            />
</View>

      </Card.Content>

    </Card>
  )
};




const DateAccordion = ({ date }) => {
  const [expanded, setExpanded] = React.useState(false);
  const handlePress = () => setExpanded(!expanded);
  const { colors } = useTheme();
  const [titleStyle, setTitleStyle] = React.useState({ fontWeight: "normal" });
  const windowWidth = Dimensions.get('window').width;
  const [dateKey, setDateKey] = React.useState('')
  const [products, setProducts] = React.useState([])
  const [productCards, setProductCards] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    setExpanded(date.expanded)
    setDateKey(date.date)
    setProducts(date.products)
  }, [date])

  React.useEffect(() => {
    let productArray = [];
    let productCardsList = null;
    if (products.length > 0) {
      productArray = products;
      productCardsList = Object.keys(productArray).map(key => {
        return (
          <ProductCard key={key} product={productArray[key]}/>
        )
      })
      setProductCards(productCardsList)
      setIsLoading(false)
    }
    return () => { productArray = []; productCardsList = null; setIsLoading(true) }
  }, [products])

  return (
    <List.Accordion expanded={expanded} title={dateKey} titleStyle={[titleStyle, { color: "#000000" }]} style={{ width: windowWidth, backgroundColor: colors.accordionBG, color: "#000000" }} onPress={handlePress}>
      {isLoading && <ActivityIndicator animating={true} size="large" />}
      {!isLoading && productCards}
    </List.Accordion>
  )
};

export const OutgoingItemsScreen = ({ navigation, route }) => {

  const { Profile } = React.useContext(AuthContext)
  const [dates, setDates] = React.useState(null)
  const [accordions, setAccordions] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const getItems = () => {
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
        "action": "getProductsForConsignments"
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/reports/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json()
      }).then((responseData) => {
        setDates(responseData.dates)
      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  }


  React.useEffect(() => {
    getItems();
    return () => {
      setDates(null)
    }
  }, [])


  React.useEffect(() => {
    let dateArray = dates;
    let DateAccordions = null;
    if (dateArray) {
      DateAccordions = Object.keys(dateArray).map(key => {
        return (
          <DateAccordion key={key} date={dateArray[key]} />
        )
      })
      setAccordions(DateAccordions)
      setIsLoading(false)
    }
    return () => { dateArray = null; DateAccordions = null; }
  }, [dates])


  return (
    <ScreenContainer flexstart={true}>
      
    <ScrollView contentContainerStyle={styles.JobsScreenScroll} removeClippedSubviews={true}>
     {isLoading && <ActivityIndicator animating={true} size="large" />}
      {!isLoading && accordions}
      </ScrollView>
    </ScreenContainer>
  )
};