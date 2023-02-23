import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { ScreenContainer } from '../ScreenContainer'
import styles from '../styles'
import { Title, Surface, Text, Card, Paragraph, Avatar, ActivityIndicator, Button, useTheme, List, Chip } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from "../context";
import { apiKey } from "../context";
import { useContext, useState } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { Splash } from './splash'
import { Dimensions } from 'react-native';
const windowWidth = Dimensions.get('window').width;

const JobCard = (props) => {
  const [jobID, setJobID] = useState(props.props.id)
  const [jobName, setJobName] = useState(props.props.pointName)
  const [jobDate, setJobDate] = useState(props.jobDate)
  const [jobStatusColour, setJobStatusColour] = useState(props.props.statusDetails.borderColor)
  const [jobType, setJobType] = useState('')
  const [icon, setIcon] = useState('')
  const [style, setStyle] = useState('#387c2b')
  const { cards } = useTheme();
  const [tinted, setTinted] = useState('noTint');
  const [tintedColour, setTintedColour] = useState('white');

  React.useEffect(() => {
    switch (props.props.consignmentType) {
      case "1":
        setJobType("Pick up")
        setIcon('package-up')
        setStyle("#387c2b")
        break;
      case "2":
        setJobType("Driver")
        setIcon('truck-delivery')
        setStyle("#0078d7")
        break;
      case "3":
        setJobType("Unknown")
        break;
      case "4":
        setJobType("Courier")
        setIcon('cube-send')
        setStyle("#fedb00")
        break;
    }
    setJobID(props.props.id)
    setJobName(props.props.pointName)
    setJobDate(props.jobDate)
    setJobStatusColour(props.props.statusDetails.borderColor)
    if (props.props.pointTinted == null) {
      setTinted("noTint")
    }
    if (props.props.pointTinted == false) {
      if (parseInt(props.props.tinter.id) > 0) {
        setTinted("tintingStarted")
      }
      if (parseInt(props.props.tinter.id) == 0) {
        setTinted("hasTintable")
      }
    }
    if (props.props.pointTinted == true) {
      setTinted("tinted")
    }
  }, [props])


  React.useEffect(() => {
    if (tinted == "hasTintable") {
      setTintedColour("red")
    }
    if (tinted == "tintingStarted") {
      setTintedColour("orange")
    }
    if (tinted == "tinted") {
      setTintedColour("green")
    }
  }, [tinted])

  const LeftContent = () => <Avatar.Icon size={38} icon={icon} color={"white"} style={{backgroundColor:style}} />
  const RightContent = () => <MaterialCommunityIcons style={{ marginHorizontal: 10 }} name="palette" size={30} color={tintedColour}/>


  return (
    <TouchableOpacity onPress={() => props.navigation.navigate('Delivery Notes', { jobID, jobDate, icon, style, isFromStockControl:false })}>
    <Card style={cards.card} >
      <Card.Content style={[styles.cardsContent, { borderLeftColor: jobStatusColour }]}>
      <View style={{minWidth:"100%"}}>
        <Card.Title title={jobName} subtitleStyle={styles.cardsubTitle} titleStyle={styles.cardtitle} subtitle={"Job #" + jobID} left={LeftContent} right={tinted != "noTint" ? RightContent : null}/>
        </View>
      </Card.Content>
    </Card>
    </TouchableOpacity>
  )
};

const FilterChip = ({ courierID, courier, courierKey, handleChipChange }) => {
  const { colors } = useTheme();
  const [selected, setSelected] = useState(false);
  const getColour = (courierName, selected) => {
    let col = '';
    let deselected = '';
    switch (courierName) {
      case "DX":
        col = "#009FE7"
        deselected = "#a8b2bc"
        break;
      case "TPN":
        col = "#004B96"
        deselected = "#a2a5b1"
        break;
      case "Royal Mail":
        col = "#C70F15"
        deselected = "#bfa39d"
        break;
      case "Inxpress":
        col = "#6eb43f"
        deselected = "#adb5a5"
        break;
      case "APC":
        col = "#192A67"
        deselected = "#a09faa"
        break;
      case "EWI Driver":
        col = "#0078d7"
        deselected = "#a7acba"
        break;
      default:
        col = colors.primary;
        deselected = "#b5b5b5";
    }
    if (selected) {
      return col;
    }
    else {
      return deselected;
    }
  };


  const chipPressed = (courier, courierID) => {
    handleChipChange(courier, !selected, courierKey, courierID)
    selected ? setSelected(false) : setSelected(true)
  }


  return (
    <Chip selectedColor={"#FFFFFF"}
      selected={selected}
      style={{ backgroundColor: getColour(courier, selected), marginHorizontal: 5, marginVertical: 2 }}
      onPress={() => chipPressed(courier, courierID)} textStyle={{ color: "#FFFFFF", fontWeight: selected ? "bold" : "normal" }}>
      {courier}
    </Chip>
  )

};

const JobsList = (props) => {
  const [jobs2, setJobs2] = React.useState(null);
  const [cards, setCards] = React.useState(null);
  const [date, setDate] = React.useState(null)
  const [bold, setBold] = React.useState(null)
  const [collapsed, setCollapsed] = React.useState(null)
  const [expanded, setExpanded] = React.useState(true);
  const handlePress = () => setExpanded(!expanded);
  const { colors } = useTheme();
  const [titleStyle, setTitleStyle] = React.useState({ fontWeight: "normal" });

  React.useEffect(() => {
    setJobs2(props.props.consigment)
    setDate(props.props.date)
    setBold(props.props.bolded)
    setCollapsed(props.props.collapsed)
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


  React.useEffect(() => {
    let jobsList = jobs2;
    if (jobsList != null) {
      let cards = Object.keys(jobsList).map(key => (
        <JobCard key={key} props={jobsList[key]} jobDate={date} navigation={props.navigation} />
      ))
      setCards(cards)
    }
  }, [date, jobs2]);



  return (
    <List.Accordion
      title={date} titleStyle={[titleStyle, { color: colors.AccordionText }]} style={{ width: windowWidth, backgroundColor: colors.accordionBG, color: colors.AccordionText }} expanded={expanded} onPress={handlePress}>
      {cards}
    </List.Accordion>
  )
};

export const JobsScreen = ({ navigation, route }) => {
  const [jobs, setJobs] = React.useState(null);
  const [lists, setLists] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [noJobs, setNoJobs] = React.useState(false);
  const { Profile, updateAuthGlobal } = React.useContext(AuthContext);
  const { setDate } = React.useContext(AuthContext);
  const { colors } = useTheme();
  const [filters, setFilters] = useState([])
  const [noFilterText, setNoFilterText] = useState('')
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)

  const getFilteredJobs = React.useCallback(() => {
    let apikey = apiKey
    let jwt = Profile.jwt
    let authGet = apikey + " " + jwt
    let filterIDS = filters.map(a => parseInt(a.id))
    let data = {
        method: 'POST',
        mode: "cors", // no-cors, cors, *same-origin *=default
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authGet
        },
        body: JSON.stringify({
          "action": "getJobsFiltered",
          "filters": [
            {
                "name": filterIDS[0] == 99 ? "delivery_type" : "delivery_courier",
                "value": filterIDS[0] == 99 ? "2" : filterIDS,
                "match_method": "="
            }
        ]
        })
      };
    return fetch('https://api-veen-e.ewipro.com/v1/jobs/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        let numerOfConsigments = responseData.numerOfConsigments;
        if (numerOfConsigments > 0) {
          setJobs(responseData.consigments)
          setNoFilterText('')
        }
        else {
          setNoFilterText("No jobs for current filters, showing all jobs.")
          sendJwtForJobs(Profile.jwt)
        }
        setIsLoadingJobs(false)
      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
        else{
          console.log(error)
        }
      });
  },[Profile.jwt, Profile.userName, Profile.userToken, Profile.userType, filters, sendJwtForJobs, updateAuthGlobal])

  React.useEffect(() => {
    sendJwtForJobs(Profile.jwt)
  }, [Profile.jwt, sendJwtForJobs])

  const sendJwtForJobs = React.useCallback((jwt) => {
    let apikey = apiKey
    if (jwt != null) {
      let authGet = apikey + " " + jwt
      let data = {
        method: 'GET',
        mode: "cors", // no-cors, cors, *same-origin *=default
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authGet
        }
      };
      return fetch('https://api-veen-e.ewipro.com/v1/jobs/', data)
        .then((response) => {
          if (!response.ok) throw new Error(response.status);
          else return response.json();
        })
        .then((responseData) => {
          if (responseData.numerOfConsigments > 0) {
            setJobs(responseData.consigments)
          }
          else {
            setNoJobs(true)
            setIsLoading(false)
          }
        })
        .catch((error) => {
          if (error.message == "401") {
            updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
          }
        });
    }
  }, [Profile.userName, Profile.userToken, Profile.userType, updateAuthGlobal])

  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true)
      sendJwtForJobs(Profile.jwt)
    }, [Profile.jwt, sendJwtForJobs])
  );

  const [couriers, setCouriers] = React.useState([])

  const getCouriers = React.useCallback(() => {
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
        body: JSON.stringify({
          "action": "getCouriersList",
        })
      };
      return fetch('https://api-veen-e.ewipro.com/v1/jobs/', data)
        .then((response) => {
          if (!response.ok) throw new Error(response.status);
          else return response.json();
        })
        .then((responseData) => {
          setCouriers(responseData.couriers)
        })
        .catch((error) => {
          if (error.message == "401") {
            updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
          }
        });
    }
  },[Profile.jwt, Profile.userName, Profile.userToken, Profile.userType, updateAuthGlobal])



  React.useEffect(() => {
    getCouriers()
    let jobsList = jobs;
    setLists(null)
    if (jobsList) {
      let jobsLists = Object.keys(jobsList).map(key => (
        <JobsList key={key} props={jobsList[key]} navigation={navigation} count={key} />
      ))
      setLists(jobsLists)
      setIsLoading(false)
      setIsLoadingJobs(false)
      setNoJobs(false)
    }
    if (!jobs) {
      setNoJobs(true)
    }
  }, [getCouriers, jobs]);



  const [filterChips, setFilterChips] = React.useState(null);
  React.useEffect(() => {
    if (couriers) {
      const handleChipChange = (chipname, state, key, ID) => {
        setIsLoadingJobs(true)
        let currentFilters = filters
        let chipState = {
          name: chipname,
          id: ID,
          key: key,
          state: state
        }
        let newFilters = []
        if (state == true) {
          newFilters = [...currentFilters, chipState]
        }
        else {
          newFilters = currentFilters.filter((n) => n.key != chipState.key)
        }
        setFilters(newFilters)
      }
      let filterList = couriers;
      filterList = [...filterList, { id: 99, name: "EWI Driver" }]
      let chips = Object.keys(filterList).map(key => {
        return (
          <FilterChip key={key} courierKey={key} courierID={filterList[key].id} courier={filterList[key].name} handleChipChange={handleChipChange} />
        )
      })
      setFilterChips(chips)
    }
  }, [couriers, filters]);


  React.useEffect(() => {
    if (filters.length > 0) {
      getFilteredJobs()
    }
    else {
      sendJwtForJobs(Profile.jwt)
    }
  }, [filters, Profile.jwt, getFilteredJobs, sendJwtForJobs]);


  if (isLoading) {
    return (
      <Splash />
    )
  }

  if (noJobs) {
    return (
      <ScreenContainer>
        <Title>No jobs Available</Title>
        <Button mode="contained" style={styles.refreshButton} labelStyle={{ color: "#FFFFFF", textAlignVertical: "center" }} onPress={() => sendJwtForJobs(Profile.jwt)}>Refresh jobs</Button>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.JobsScreenScroll}>
        <View style={{ display: "flex", flexDirection: "row", maxWidth: windowWidth, flexWrap: "wrap", padding: 5 }}>
          {filterChips}
        </View>
        {noFilterText != '' && <Text style={{color:"red",fontWeight:"bold"}}>{noFilterText}</Text>}
        {isLoadingJobs &&
          <ActivityIndicator animating={true} size="large" />
        }
        {!isLoadingJobs && lists}
      </ScrollView>
    </ScreenContainer>
  );
};

