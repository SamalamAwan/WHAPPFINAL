import React from "react";
import { TextInput, Text, Surface, Headline, Button, Title, Subheading, Appbar, Portal, Modal, useTheme, FAB, ActivityIndicator, Searchbar, Card, Avatar, Colors, Snackbar, List, IconButton } from 'react-native-paper';
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
// import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import react from "react";
const windowWidth = Dimensions.get('window').width;


const ProductCard = ({props, navigation}) => {
  const [itemName, setItemName] = useState(props.name)
  const [itemCode, setItemCode] = useState(props.code)
  const [photo, setPhoto] = useState(props.image_src)
  const [id, setId] = useState(props.id)
  
  const { cards } = useTheme();
  const { colors } = useTheme();

  const LeftContent = () =>         <Image style={{minWidth:50, minHeight:50}} source={{
    uri: photo,
  }} />
  
  //const RightContent = () =>        <Text style={{marginBottom:12, marginRight:12, fontWeight:"bold" }}>In gfj</Text>


  return (
    <Card style={cards.cardsItems} onPress={() => navigation.navigate("Stock Take Item", {itemCode})}>
      <Card.Content style={[styles.cardsContent, { borderLeftColor:"red" }]}>
      <View style={{minWidth:"100%"}}>
        <Card.Title title={itemCode} subtitleStyle={cards.subTitle} titleStyle={cards.title} subtitle={itemName} left={photo ? LeftContent : null} 
        // right={RightContent} 
        // rightStyle={{display:"flex",justifyContent:"flex-end", alignSelf:"flex-end"}}
        />
        </View>
      </Card.Content>
    </Card>
  )
};



export const StockTakeMissingScreen = ({ navigation, route }) => {
  const [SKU, setSKU] = React.useState("");
  const [error, setError] = React.useState("");
  const [products, setProducts] = React.useState([]);
  const [productGroups, setProductGroups] = React.useState();
  const [productCards, setProductCards] = React.useState([]);
  const [lists, setLists] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [barcodeInput, setBarcodeInput] = React.useState('');
  const barcodeSearchInput = React.useRef();
  const [isLoading, setIsLoading] = React.useState(true);

  const onChangeSearch = (query) => {
    sendQuery(query)
    setSearchQuery(query);
    }

  const {Profile} = React.useContext(AuthContext)
  // const sendQuery = (sku) =>{
  //   let jwt = Profile.jwt
  //   let apikey = apiKey
  //   if (jwt != null) {
  //     let authGet = apikey + " " + jwt
  //     let data = {
  //       method: 'POST',
  //       mode: "cors", // no-cors, cors, *same-origin *=default
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': authGet
  //       },
  //       body: JSON.stringify(
  //         {
  //           "action": "productsLookup",
  //           "sku": sku
  //       }
  //       )
  //     };
  //     //console.log(data)
  //     return fetch('https://api-veen-e.ewipro.com/v1/products/', data)
  //       .then((response) => {
  //         if (!response.ok) throw new Error(response.status);
  //         else return response.json();
  //       })
  //       .then((responseData) => {
  //         //console.log(responseData)
  //         if (responseData.status == false){
  //           setError(responseData.message)
  //         }
  //         else{
  //           setError('')
  //           setProducts(responseData.products)
  //         }
  //       })
  //       .catch((error) => {
  //       });
  
  //   };
  // }
  
  // const sendScan = (barcode) => {
  //   if (barcode != ''){
  //   let jwt = Profile.jwt
  //   let apikey = apiKey
  //   if (jwt != null) {
  //     let authGet = apikey + " " + jwt
  //     let data = {
  //       method: 'POST',
  //       mode: "cors", // no-cors, cors, *same-origin *=default
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': authGet
  //       },
  //       body: JSON.stringify(
  //         {
  //           "action": "productsLookup",
  //           "barcode": barcode
  //       }
  //       )
  //     };
  //     //console.log(data)
  //     return fetch('https://api-veen-e.ewipro.com/v1/products/', data)
  //       .then((response) => {
  //         if (!response.ok) throw new Error(response.status);
  //         else return response.json();
  //       })
  //       .then((responseData) => {
  //         console.log(responseData)
  //         if (responseData.status == false){
  //           setError(responseData.message)
  //         }
  //         else{
  //           setError('')
  //           if (responseData.products.length > 1){
  //             setProducts(responseData.products)
  //           }
  //           else{
  //             goToProduct(responseData.products[0])
  //           }
  //         }
  //       })
  //       .catch((error) => {
  //       });
  
  //   }
  // }
  // }


  // const startSendScan = (barcode) => {
  //   setBarcodeInput(barcode)
  //   console.log(barcode)
  //   setBarcodeInput('')
  //   sendScan(barcode)
  //   //goToProduct({id:null, barcode:null, code:null, image_src:null})
  // }

  const getProducts = (dateSent) =>{
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
            "action": "missingStockTake",
            "startDate": dateSent
        }
        )
      };
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
            setProductGroups(responseData.groups)            
          }
        })
        .catch((error) => {
        });
  
    };
  }

  React.useEffect(() => {
    let groupList = productGroups;
    //console.log(groupList)
    setLists(null)
    if (groupList) {
      let groupListElements = Object.keys(groupList).map(key => (
        <ProductGroup key={key} props={groupList[key]} navigation={navigation} count={key} />
      ))
      setLists(groupListElements)
      setIsLoading(false);
    }
    if (!groupList) {
      setLists(null)
    }
  }, [navigation, productGroups]);


  const ProductGroup = ({props, navigation}) => {
    const [products, setProducts] = React.useState(null);
    const [cards, setCards] = React.useState(null);
    const [code, setCode] = React.useState(null)
    const [name, setName] = React.useState(null)
    const [collapsed, setCollapsed] = React.useState(true)
    const [expanded, setExpanded] = React.useState(true);
    const handlePress = () => setExpanded(!expanded);
    const { colors } = useTheme();
    const [titleStyle, setTitleStyle] = React.useState({ fontWeight: "normal" });
  
    React.useEffect(() => {
      setProducts(props.products)
      setCode(props.code)
      setName(props.name)
      setCollapsed(props.collapsed)
    }, [props])
  
    React.useEffect(() => {
      if (collapsed == true) {
        setExpanded(false)
      }
      else{
        setExpanded(true)
      }
    }, [collapsed])
  
  
    React.useEffect(() => {
      let productList = products;
      if (productList != null) {
        let cards = Object.keys(productList).map(key => (
          <ProductCard key={key} props={productList[key]} navigation={navigation} />
        ))
        setCards(cards)
      }
    }, [navigation, products]);
  
  
  
    return (
      <View style={{marginBottom:5,width: windowWidth-20, backgroundColor: expanded ? "#0078d7" : "#e5e5e5", color: "#000000", borderRadius:(expanded ? 0 : 10),borderTopLeftRadius:10,borderTopRightRadius:10,overflow:"hidden"}}>
        <>
      <List.Accordion
        title={code} 
        titleStyle={[titleStyle, { color: expanded ? "white" : "#000000", fontWeight:"bold"}]}
         style={{width: windowWidth-20, backgroundColor: expanded ? "#0078d7" : "#e5e5e5", color: "#000000", borderRadius:(expanded ? 0 : 10),borderTopLeftRadius:10,borderTopRightRadius:10,overflow:"hidden"}}
          expanded={expanded} onPress={handlePress} 
          right={
          ({isExpanded}) =>
          {
            return(
            <IconButton color="black"
              icon={isExpanded ? "arrow-up" : "plus"}
              animated={true}
              iconColor={"black"}
              size={30}
              style={{
                right:-7, top:0, margin:(0,0,0,0), padding:(0,0,0,0), borderRadius:0, minHeight:"100%", flex:1, flexShrink:1, height:10,
              }}
            />)
          }
        }>
          <>
      <View style={{backgroundColor:"#ccc"}}>
      {cards}
      </View>
      </>
      </List.Accordion>
      </>
      </View>
    )
  };

  const goToProduct = React.useCallback((product) => {
    let id = product.id
    let barcode = product.barcode
    let itemCode = product.code
    let itemName = product.name
    let photo = product.image_src
    let stockQty = product.stockQty
    navigation.navigate('Stock Take Item', { id, barcode, itemCode, itemName, photo, stockQty })
   //console.log(product)
  },[navigation])


  // React.useEffect(() => {
  //   if (barcodeSearchInput.current) {
  //   const unsubscribe = navigation.addListener('transitionEnd', () => {
  //     setBarcodeInput("")
  //     barcodeSearchInput.current.focus();
  //   })
  //   return unsubscribe;
  // }
  // }, [navigation, barcodeSearchInput])


  // React.useEffect(() => {
  //   let productList = products;
  //   if (productList != null) {
  //     let cards = Object.keys(productList).map(key => (
  //       <ProductCard key={key} props={productList[key]} goToProduct={goToProduct} navigation={navigation} />
  //     ))
  //     setProductCards(cards)
  //   }
  // },[goToProduct, navigation, products])

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

  //Time input
  const dateConst = new Date()
  const [date, setDate] = React.useState(new Date());
  const [year, setYear] = React.useState(String(dateConst.getFullYear()));
  
  const [month, setMonth] = React.useState(String(dateConst.getMonth()+1));

  const [day, setDay] = React.useState(String(dateConst.getDate()));

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate;
    setDate(currentDate);
  };

  //END Time Input

  React.useEffect(()=>{
    const selectedDate = year+"-"+month+"-"+day;
    //console.log("here",selectedDate)
    getProducts(selectedDate);
  },[year,month,day])

  const handleNewDate = (type, value) =>{
    setLists(null)
    setIsLoading(true);
    if (type == "year"){
      setYear(value.replace(/[^0-9]/g, ''));
    }
    if (type == "month"){
      setMonth(value.replace(/[^0-9]/g, ''));
    }
    if (type == "day"){
      setDay(value.replace(/[^0-9]/g, ''));
    }
  }



  return(
     <ScreenContainer flexstart={true}>
      <View style={{ display: "flex", flexDirection: "row", paddingHorizontal:10, paddingTop:10}}>
        <TextInput
          label="Year"
          mode="outlined"
          dense={true}
          keyboardType={"numeric"}
          style={{ flex: 1, maxHeight: 60 }}
          value={year}
          onChangeText={(text)=>handleNewDate("year",text)}
        />
                <TextInput
          label="Month"
          mode="outlined"
          keyboardType={"numeric"}
          dense={true}
          style={{ flex: 1, maxHeight: 60 }}
          value={month}
          onChangeText={(text)=>handleNewDate("month",text)}
        />
                <TextInput
          label="Day"
          mode="outlined"
          keyboardType={"numeric"}
          dense={true}
          style={{ flex: 1, maxHeight: 60 }}
          value={day}
          onChangeText={(text)=>handleNewDate("day",text)}
        />
      </View>
       <Text>{error}</Text>
    <ScrollView contentContainerStyle={{...styles.JobsScreenScroll, paddingHorizontal:10, maxWidth:windowWidth}}>
    {isLoading && <ActivityIndicator animating={true} size="large"/>} 
    <>
    {lists}
    </> 
    </ScrollView>
         {/* <Appbar
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
      </View>
      </View>
    </Appbar> */}
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