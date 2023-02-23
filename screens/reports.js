import React from "react";
import { TextInput, Text, Surface, Headline, Button, Title, Subheading, Appbar, Portal, Modal, useTheme, FAB, ActivityIndicator, Searchbar, Card, Avatar, Colors, DataTable, List } from 'react-native-paper';
import { View, Image, ScrollView } from "react-native";
import { ScreenContainer } from '../ScreenContainer'
import { useRef, useState } from "react";
import styles from '../styles'
import { AuthContext, apiKey } from "../context";
import { Dimensions, KeyboardAvoidingView } from 'react-native';
import { useContext } from "react";
import { useFocusEffect } from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;


const TableRow = ({user}) => {
  const [userId, setUserId] = React.useState(user.userID)
  const [name, setName] = React.useState(user.userName)
  const [closedJobs, setClosedJobs] = React.useState(user.closedJobs)


  React.useEffect(() =>{
    setUserId(user.userID)
    setName(user.userName)
    setClosedJobs(user.closedJobs)
  },[user])


  return (
    <DataTable.Row style={{width:windowWidth}}>
    <DataTable.Cell>{name}</DataTable.Cell>    
    <DataTable.Cell numeric>{closedJobs}</DataTable.Cell>
  </DataTable.Row>
  )
  
}

const DayAccordion = ({data, navigation}) => {
  const [date, setDate] = React.useState("")
  const [bolded, setBolded] = React.useState(false)
  const [closedJobs, setClosedJobs] = React.useState([])
  const [table, setTable] = React.useState(null)


  const [rowAmount, setRowAmount] = React.useState(0)


  const numberOfItemsPerPageList = [2, 3, 4];
  const [page, setPage] = React.useState(0);
  const [numberOfItemsPerPage, onItemsPerPageChange] = React.useState(numberOfItemsPerPageList[0]);
  const from = page * numberOfItemsPerPage;
  const to = Math.min((page + 1) * numberOfItemsPerPage, rowAmount);

  React.useEffect(() => {
     setPage(0);
  }, [numberOfItemsPerPage]);


  React.useEffect(() =>{
    setDate(data.date)
    setBolded(data.bolded)
    setClosedJobs(data.closedJobs)
    let closedJobsArray = []
    let tables = null;
    if (data.closedJobs.length > 0){
      closedJobsArray = data.closedJobs;
      tables =  Object.keys(closedJobsArray).map(key => (
       <TableRow key={key} user={closedJobsArray[key]} navigation={navigation} />
     ))
     setRowAmount(tables.length)
     setTable(tables)
    }
    return () => {closedJobsArray=[]; tables = null;}
  },[data])


  return (
    <List.Accordion
      title={date} style={{ width: windowWidth}} titleStyle={{fontWeight:bolded ? "bold" : "normal"}}>
              <DataTable>
        <DataTable.Header>
          <DataTable.Title>Name</DataTable.Title>
          <DataTable.Title numeric>Jobs Closed</DataTable.Title>
        </DataTable.Header>
        {closedJobs == [] && <Text>No Jobs Closed on this day.</Text>}
        {closedJobs != [] && table}


        </DataTable>
    </List.Accordion>
  )
  
}

export const ReportsScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = React.useState(true)
  const [data, setData] = React.useState([])
  const [rows, setRows]  = React.useState(null)


  const {Profile, updateAuthGlobal} = React.useContext(AuthContext)
  const getStats = () =>{
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
            "action": "getClosedJobsStats"
        }
        )
      };
      return fetch('https://api-veen-e.ewipro.com/v1/reports/', data)
        .then((response) => {
          if (!response.ok) throw new Error(response.status);
          else return response.json();
        })
        .then((responseData) => {
          console.log(responseData)
          setData(responseData.dates)
        })
        .catch((error) => {
          if (error.message == "401") {
            updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
          }
        });
  
    };
  }

  React.useEffect(() => {
getStats()
  }, [])

  React.useEffect(() => {
   let dataArray = []
   console.log(data)
   let rowsList = null;
   if (data){
     dataArray = data;
    rowsList =  Object.keys(dataArray).map(key => (
      dataArray[key].closedJobs.length > 0 ? <DayAccordion key={key} data={dataArray[key]} navigation={navigation} /> : null
    ))
    console.log(rowsList)
    setRows(rowsList)
    setIsLoading(false)
   }
   return () => {dataArray=[]; rowsList = null;}
      }, [data])
    


  return(
     <ScreenContainer flexstart={true}>
         <ScrollView contentContainerStyle={styles.JobsScreenScroll}>
     {isLoading && <ActivityIndicator animating={true} size="large" />}
      {!isLoading && rows}
      </ScrollView>
    </ScreenContainer>
  )
};