import React from "react";
import { TextInput, Text, Surface, Headline, Button, Title, Subheading, Appbar, Portal, Modal, useTheme, FAB, ActivityIndicator, Searchbar, Card, Avatar, Colors } from 'react-native-paper';
import { View, Image, ScrollView } from "react-native";
import { ScreenContainer } from '../ScreenContainer'
import { useRef, useState } from "react";
import styles from '../styles'
import { AuthContext, apiKey } from "../context";
import { Dimensions, KeyboardAvoidingView } from 'react-native';
import { useContext } from "react";
import { useFocusEffect } from '@react-navigation/native';




const ProductCard = (props) => {
  const [itemName, setItemName] = useState('')
  const [itemCode, setItemCode] = useState('')
  const [barcode, setBarcode] = useState('')
  const [photo, setPhoto] = useState('')
  const [id, setId] = useState('')
  
  const { cards } = useTheme();
  const { colors } = useTheme();
  React.useEffect(() => {
    setItemName(props.props.name)
    setItemCode(props.props.code)
    setBarcode(props.props.barcode)
    setPhoto(props.props.image_src)
    setId(props.props.id)
  }, [props])

  const LeftContent = () =>         <Image style={{minWidth:50, minHeight:50}} source={{
    uri: photo,
  }} />
  
  const RightContent = () =>        <Text style={{marginBottom:12, marginRight:12, fontWeight:"bold" }}>{itemCode}</Text>


  return (
    <Card style={cards.cardsItems} onPress={() => props.navigation.navigate('Assign Barcode', { id, barcode, itemCode, itemName, photo})}>
      <Card.Content style={[styles.cardsContent, { borderLeftColor: barcode !=null ? "green" : "red" }]}>
      <View style={{minWidth:"100%"}}>
        <Card.Title title={itemName} subtitleStyle={cards.subTitle} titleStyle={cards.title} subtitle={barcode != null ? "Current barcode:"+barcode : "No barcode"} left={photo ? LeftContent : null} right={RightContent} rightStyle={{display:"flex",justifyContent:"flex-end", alignSelf:"flex-end"}}/>
        </View>
      </Card.Content>
    </Card>
  )
};



export const FindItemScreen = ({ navigation, route }) => {
  const [SKU, setSKU] = React.useState("");
  const [error, setError] = React.useState("");
  const [products, setProducts] = React.useState([]);
  const [productCards, setProductCards] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const onChangeSearch = (query) => {
    sendQuery(query)
    setSearchQuery(query);
    }

  const {Profile} = React.useContext(AuthContext)
  const sendQuery = (sku) =>{
    let jwt = Profile.jwt
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
        body: JSON.stringify(
          {
            "action": "productsLookup",
            "sku": sku
        }
        )
      };
      console.log(data)
      return fetch('https://api-veen-e.ewipro.com/v1/products/', data)
        .then((response) => {
          if (!response.ok) throw new Error(response.status);
          else return response.json();
        })
        .then((responseData) => {
          console.log(responseData)
          if (responseData.status == false){
            setError(responseData.message)
          }
          else{
            setError('')
            setProducts(responseData.products)
          }
        })
        .catch((error) => {
        });
  
    };
  }

  React.useEffect(() => {
    const test = navigation.addListener('focus', () => {
      setProductCards([])
      sendQuery(searchQuery)
    });
    return test;
  }, [searchQuery]),


  React.useEffect(() => {
    let productList = products;
    if (productList != null) {
      let cards = Object.keys(productList).map(key => (
        <ProductCard key={key} props={productList[key]} navigation={navigation} />
      ))
      setProductCards(cards)
    }
  },[products])

  return(
     <ScreenContainer flexstart={true}>
      <Headline>Enter Product SKU</Headline>
      <Searchbar
      placeholder="Search Product SKUS"
      onChangeText={onChangeSearch}
      value={searchQuery}
    />
    <Text>{error}</Text>
    <ScrollView contentContainerStyle={styles.JobsScreenScroll}>
    {productCards}
    </ScrollView>
    </ScreenContainer>
  )
};