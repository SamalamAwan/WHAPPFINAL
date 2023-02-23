import React from "react";
import { TextInput, Text, Surface, Headline, Button, Title, Subheading, Appbar, Portal, Modal, useTheme, FAB, ActivityIndicator, Searchbar, Card, Avatar, Colors, Snackbar } from 'react-native-paper';
import { View, Image, ScrollView } from "react-native";
import { ScreenContainer } from '../ScreenContainer'
import { useRef, useState } from "react";
import styles from '../styles'
import { AuthContext, apiKey } from "../context";
import { Dimensions, KeyboardAvoidingView } from 'react-native';
import { useContext } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";




const ProductCard = ({props, goToProduct}) => {
  const [itemName, setItemName] = useState('')
  const [itemCode, setItemCode] = useState('')
  const [barcode, setBarcode] = useState('')
  const [photo, setPhoto] = useState('')
  const [id, setId] = useState('')
  const [stockQuantity, setStockQuantity] = useState(null)
  
  const { cards } = useTheme();
  const { colors } = useTheme();
  React.useEffect(() => {
    setItemName(props.name)
    setItemCode(props.code)
    setPhoto(props.image_src)
    setId(props.id)
    setStockQuantity(props.stockQty)
  }, [props])

  const LeftContent = () =>         <Image style={{minWidth:50, minHeight:50}} source={{
    uri: photo,
  }} />
  
  const RightContent = () =>        <Text style={{marginBottom:12, marginRight:12, fontWeight:"bold" }}>In stock: {stockQuantity ? stockQuantity : 0}</Text>


  return (
    <Card style={cards.cardsItems} onPress={() => goToProduct(props)}>
      <Card.Content style={[styles.cardsContent, { borderLeftColor: stockQuantity > 0 ? "green" : "red" }]}>
      <View style={{minWidth:"100%"}}>
        <Card.Title title={itemCode} subtitleStyle={cards.subTitle} titleStyle={cards.title} subtitle={itemName} left={photo ? LeftContent : null} right={RightContent} rightStyle={{display:"flex",justifyContent:"flex-end", alignSelf:"flex-end"}}/>
        </View>
      </Card.Content>
    </Card>
  )
};



export const StockTakeFindScreen = ({ navigation, route }) => {
  const [SKU, setSKU] = React.useState("");
  const [error, setError] = React.useState("");
  const [products, setProducts] = React.useState([]);
  const [productCards, setProductCards] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [barcodeInput, setBarcodeInput] = React.useState('');
  const barcodeSearchInput = React.useRef();
  

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
      //console.log(data)
      return fetch('https://api-veen-e.ewipro.com/v1/products/', data)
        .then((response) => {
          if (!response.ok) throw new Error(response.status);
          else return response.json();
        })
        .then((responseData) => {
          //console.log(responseData)
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
  
  const sendScan = (barcode) => {
    if (barcode != ''){
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
            "barcode": barcode
        }
        )
      };
      //console.log(data)
      return fetch('https://api-veen-e.ewipro.com/v1/products/', data)
        .then((response) => {
          if (!response.ok) throw new Error(response.status);
          else return response.json();
        })
        .then((responseData) => {
          //console.log(responseData)
          if (responseData.status == false){
            setError(responseData.message)
          }
          else{
            setError('')
            if (responseData.products.length > 1){
              setProducts(responseData.products)
            }
            else{
              goToProduct(responseData.products[0])
            }
          }
        })
        .catch((error) => {
        });
  
    }
  }
  }


  const startSendScan = (barcode) => {
    setBarcodeInput(barcode)
    //console.log(barcode)
    setBarcodeInput('')
    sendScan(barcode)
    //goToProduct({id:null, barcode:null, code:null, image_src:null})
  }

  const goToProduct = React.useCallback((product) => {
    let id = product.id
    let barcode = product.barcode
    let itemCode = product.code
    let itemName = product.name
    let photo = product.image_src
    let stockQty = product.stockQty
    navigation.navigate('Stock Take Item', {itemCode})
   //console.log(product)
  },[navigation])


  React.useEffect(() => {
    if (barcodeSearchInput.current) {
    const unsubscribe = navigation.addListener('transitionEnd', () => {
      setBarcodeInput("")
      barcodeSearchInput.current.focus();
    })
    return unsubscribe;
  }
  }, [navigation, barcodeSearchInput])


  React.useEffect(() => {
    let productList = products;
    if (productList != null) {
      let cards = Object.keys(productList).map(key => (
        <ProductCard key={key} props={productList[key]} goToProduct={goToProduct} navigation={navigation} />
      ))
      setProductCards(cards)
    }
  },[goToProduct, navigation, products])
  const [snackVisible, setSnackVisible] = React.useState(false);

  const [error2, setError2] = React.useState("");
  const onToggleSnackBar = () => setSnackVisible(!snackVisible);
  const {colors} = useTheme();
  const BOTTOM_APPBAR_HEIGHT = 50;
  const { bottom } = useSafeAreaInsets();
  const onDismissSnackBar = () => {
    setSnackVisible(false);
    setError2("");
  }

  React.useEffect(()=>{
    if (route.error){
      setError2(route.error)
    }
  },[route])

  React.useEffect(() => {
    if (error2 != ""){
      setSnackVisible(true)
    }
  },[error2])

  return(
     <ScreenContainer flexstart={true}>
      <Searchbar
      placeholder="Search Product SKUS"
      onChangeText={(query) => onChangeSearch(query)}
      value={searchQuery}
      onEndEditing={() => barcodeSearchInput.current.focus()}
    /> 
    <Text>{error}</Text>
    <ScrollView contentContainerStyle={styles.JobsScreenScroll}>
    {productCards}
    <TextInput
            style={{ width: 0, height: 0 }}
            autoFocus={true}
            clearTextOnFocus={true}
            placeholder="Barcode"
            placeholderTextColor="#003f5c"
            onChangeText={(text) => startSendScan(text)}
            value={barcodeInput}
            showSoftInputOnFocus={false} 
            ref={barcodeSearchInput}
            />
    </ScrollView>
         <Appbar
      style={[
        styles.bottom,
        {
          height: BOTTOM_APPBAR_HEIGHT + bottom,
          backgroundColor: colors.primary,
        },
      ]}
      safeAreaInsets={{ bottom }}
    >
      <View style={{display:"flex", flexDirection:"row", justifyContent:"space-between", alignItems:"center"}}>
      <View style={{display:"flex", flexDirection:"row", flex:2}}>
      <MaterialCommunityIcons name="barcode-scan" size={30} color={"#fff"} style={{paddingHorizontal:10}} />
      <Subheading style={{color:"#fff"}}>Scan product barcode to find item</Subheading>
      </View>
      </View>
    </Appbar>
    <Snackbar
visible={snackVisible}
onDismiss={onDismissSnackBar}
duration={3000}
>
{error2}
</Snackbar>
    </ScreenContainer>
  )
};