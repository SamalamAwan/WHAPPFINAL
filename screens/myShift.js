/* eslint-disable react/prop-types */
import React from "react";
import { ActivityIndicator, Button, Text, ToggleButton, useTheme, Avatar, Headline, Subheading, Surface, Snackbar, Portal, Modal, TextInput, Dialog, IconButton } from 'react-native-paper';
import { View, RefreshControl } from "react-native";
import { ScrollView } from 'react-native';
import { ScreenContainer } from '../ScreenContainer'
import { AuthContext } from "../context";
import * as Clipboard from 'expo-clipboard';
import * as Updates from 'expo-updates';
import * as FileSystem from 'expo-file-system';
import { Dimensions } from 'react-native';
import {TouchableOpacity } from "react-native-gesture-handler";
import Timeline from 'react-native-timeline-flatlist'
import styles from '../styles'
import { Splash } from "./splash";
import { apiKey } from "../context";
import { LinearGradient } from 'expo-linear-gradient';
import { LogBox } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressBar, Colors } from 'react-native-paper';
const windowWidth = Dimensions.get('window').width;
function convertTimestamp(timestamp, justTime) {
  var d = new Date(timestamp * 1000),	// Convert the passed timestamp to milliseconds
    yyyy = d.getFullYear(),
    mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
    dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
    hh = d.getHours(),
    h = hh,
    min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
    ampm = 'AM',
    time;

  if (hh > 12) {
    h = hh - 12;
    ampm = 'PM';
  } else if (hh === 12) {
    h = 12;
    ampm = 'PM';
  } else if (hh == 0) {
    h = 12;
  }

  // ie: 2013-02-18, 8:35 AM	
  if (justTime) {
    time = h + ':' + min + ' ' + ampm;
  }
  else {
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
  }

  return time;
}




export const MyShiftScreen = (props) => {


  React.useEffect(() => {
    if (LogBox) {
      LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
    }
  }, [])


  //#region state
  const { signOut, toggleAdmin } = React.useContext(AuthContext);
  const { Profile, toggleThemeGlobal, forceUpdate, updateAuthGlobal } = React.useContext(AuthContext);
  const { colors } = useTheme();
  const [profileImage, setProfileImage] = React.useState("")
  const [data, setData] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isShiftLoading, setIsShiftLoading] = React.useState(true)
  const [isBreakLoading, setIsBreakLoading] = React.useState(true)
  const [othersActiveLoading, setOthersActiveLoading] = React.useState(true)
  const [othersActive, setOthersActive] = React.useState(null)
  const [activeAvatars, setActiveAvatars] = React.useState(null)
  const [timeStarted, setTimeStarted] = React.useState("")
  const [shiftActive, setShiftActive] = React.useState(false)
  const [breakActive, setBreakActive] = React.useState(false)
  const [message, setMessage] = React.useState("")
  const [breakMessage, setBreakMessage] = React.useState("")
  const [breakStatusMessage, setBreakStatusMessage] = React.useState("")
  const [clockError, setClockError] = React.useState("")
  const [timeClocked, setTimeClocked] = React.useState([])
  const [breakTimeClocked, setBreakTimeClocked] = React.useState([])
  const [countingTimeClocked, setCountingTimeClocked] = React.useState("")
  const [countingBreakTimeClocked, setCountingBreakTimeClocked] = React.useState("")
  const [breakStarted, setBreakStarted] = React.useState("")
  const [timelineData, setTimelineData] = React.useState([])
  const [schedule, setSchedule] = React.useState(null)
  const [visible, setVisible] = React.useState(false);
  const onDismissSnackBar = () => { setVisible(false) };
  const [scheduleStart, setScheduleStart] = React.useState("")
  const [scheduleStop, setScheduleStop] = React.useState("")
  const [stampStart, setStampStart] = React.useState(10)
  const [percentWorked, setPercentWorked] = React.useState(0)
  const [timeStampNow, setTimeStampNow] = React.useState(0)
  const [isCurrentUser, setIsCurrentUser] = React.useState(true)
  const [name, setName] = React.useState("")
  const [managerScanned, setManagerScanned] = React.useState(false)
  const [managerDialogVisible, setManagerDialogVisible] = React.useState(false)
  const [tooEarly, setTooEarly] = React.useState(false)
  //#endregion

  const getShiftData = React.useCallback(() => {
    let apikey = apiKey
    let jwt = Profile.jwt
    let authGet = apikey + " " + jwt
    let userID = Profile.id
    if (props.route.params) {
      if (parseInt(userID) != parseInt(props.route.params.userID)) {
        userID = props.route.params.userID
        setIsCurrentUser(false)
      }
      else {
        setIsCurrentUser(true)
      }
    }
    else {
      setIsCurrentUser(true)
    }


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
        console.log(responseData)
        setShiftActive(responseData.shiftActive)
        if (responseData.shiftActive) {
          setName(responseData.details.nameSurname)
          setOthersActive(responseData.details.othersActive)
          let safeTimeStarted = convertTimestamp(responseData.details.stampStart, true)
          setTimeStarted(safeTimeStarted)
          setTimeClocked([responseData.details.elapsed.h, responseData.details.elapsed.i, responseData.details.elapsed.s])
          setCountingTimeClocked((responseData.details.elapsed.h != 0 ? responseData.details.elapsed.h + "h : " : "") + (responseData.details.elapsed.i != 0 ? responseData.details.elapsed.i + "m : " : "") + (responseData.details.elapsed.s != 0 ? responseData.details.elapsed.s + "s " : ""))
          setTimeStampNow(responseData.details.timeStampNow)
          setSchedule(responseData.details.scheduleDetails)
          if (responseData.details.scheduleDetails) {
            setStampStart(responseData.details.stampStart)
            let timeNeeded = responseData.details.scheduleDetails.plannedShiftEndStamp - responseData.details.stampStart
            let timeWorked = responseData.details.timeStampNow - responseData.details.stampStart
            let percentWorked = timeWorked / timeNeeded
            if (percentWorked > 1) {
              percentWorked = 1;
            }
            setPercentWorked(percentWorked)
          }
        }
        else {
          setMessage(responseData.message)
        }

        setTimelineData(responseData.timeLine)


        setIsShiftLoading(false)

        getBreakData()

        setRefreshing(false)
      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  }, [Profile, props.route.params, getBreakData, updateAuthGlobal])


  const clockIn = () => {
    let apikey = apiKey
    let jwt = Profile.jwt
    let device = Profile.deviceID
    let authGet = apikey + " " + jwt
    let data = {
      method: 'POST',
      mode: "cors", // no-cors, cors, *same-origin *=default
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authGet
      },
      body: JSON.stringify({
        "action": "clockIN",
        "deviceID": device
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/employees/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        if (responseData.message) {
          setVisible(true)
          setBreakMessage(responseData.message)
        }
        else {
          setVisible(false)
          setBreakMessage("")
        }
        getShiftData()

      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  }
  const clockOut = (supervisorApproved) => {
    let apikey = apiKey
    let jwt = Profile.jwt
    let device = Profile.deviceID
    let authGet = apikey + " " + jwt
    let data = {
      method: 'POST',
      mode: "cors", // no-cors, cors, *same-origin *=default
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authGet
      },
      body: JSON.stringify({
        "action": "clockOUT",
        "deviceID": device,
        "supervisorApproved": supervisorApproved
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/employees/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        if (responseData.message) {
          setVisible(true)
          setBreakMessage(responseData.message)
        }
        else {
          setVisible(false)
          setBreakMessage("")
        }
        if (responseData.tooEarly == true) {
          setTooEarly(true)
        }
        else {
          setTooEarly(false)
        }
        getShiftData()
      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  }
  const hideManagerDialog = () => {
    setManagerDialogVisible(false);
  }
  const breakStart = () => {
    let apikey = apiKey
    let jwt = Profile.jwt
    let device = Profile.deviceID
    let authGet = apikey + " " + jwt
    let data = {
      method: 'POST',
      mode: "cors", // no-cors, cors, *same-origin *=default
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authGet
      },
      body: JSON.stringify({
        "action": "breakStart",
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/employees/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        getShiftData()
        getBreakData()
        if (responseData.message) {
          setVisible(true)
          setBreakMessage(responseData.message)
        }
        else {
          setVisible(false)
          setBreakMessage("")
        }
      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  }
  const breakStop = () => {
    let apikey = apiKey
    let jwt = Profile.jwt
    let device = Profile.deviceID
    let authGet = apikey + " " + jwt
    let data = {
      method: 'POST',
      mode: "cors", // no-cors, cors, *same-origin *=default
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authGet
      },
      body: JSON.stringify({
        "action": "breakStop",
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/employees/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        getShiftData()
        getBreakData()
        if (responseData.message) {
          setVisible(true)
          setBreakMessage(responseData.message)
        }
        else {
          setVisible(false)
          setBreakMessage("")
        }
      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  }
  const getBreakData = React.useCallback(() => {
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
        "action": "getCurrentBreak"
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/employees/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        setBreakActive(responseData.breakActive)
        if (!responseData.breakActive) {
          setBreakStatusMessage(responseData.message)
        }
        else {
          setBreakStatusMessage("")
          setBreakStarted(convertTimestamp(responseData.details.stampStart, true))
          setBreakTimeClocked([responseData.details.elapsed.h, responseData.details.elapsed.i, responseData.details.elapsed.s])
          setCountingBreakTimeClocked((responseData.details.elapsed.h != 0 ? responseData.details.elapsed.h + "h : " : "") + (responseData.details.elapsed.i != 0 ? responseData.details.elapsed.i + "m : " : "") + (responseData.details.elapsed.s != 0 ? responseData.details.elapsed.s + "s " : ""))
        }
        setIsBreakLoading(false)
      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });



  }, [Profile.jwt, Profile.userName, Profile.userToken, Profile.userType, updateAuthGlobal])

  React.useEffect(() => {
    setIsBreakLoading(true)
    setIsShiftLoading(true)
    getShiftData()
    getBreakData()
    return () => false;
  }, [getBreakData, getShiftData])

  React.useEffect(() => {
    let data = timelineData
    let newData = [];
    for (let i = 0; i < data.length; i++) {
      let newObj = {
        time: data[i].time,
        title: data[i].title,
        description: data[i].description,
        icon: <MaterialCommunityIcons name={data[i].icon} size={15} color={data[i].iconColor != "" ? data[i].iconColor : "#FFFFFF"} />,
        imageUrl: data[i].imageUrl,
        lineColor: data[i].lineColor,
        circleColor: data[i].circleColor != "" ? data[i].circleColor : colors.lightenedPrimary,
        eventContainerStyle: { backgroundColor: data[i].title.indexOf("Break") > -1 ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.4)", marginBottom: data[i].title == "Clock-Out" ? 20 : 0, marginTop: 10, marginHorizontal: 10, borderBottomRightRadius: 30, borderTopRightRadius: 10, borderEndColor: colors.primary, borderEndWidth: 5, borderTopWidth: data[i].title == "Clock-In" ? 2 : 0, borderTopColor: "lime", borderBottomWidth: data[i].title == "Clock-Out" ? 2 : 0, borderBottomColor: "red" }
      }
      newData.push(newObj)
    }
    setData(newData)
    return () => { newData = []; data = null; }
  }, [colors.lightenedPrimary, colors.primary, "#FFFFFF", timelineData])

  React.useEffect(() => {

    if (props.route.params) {
      setProfileImage("https://veen-e.ewipro.com:7443/images/employees/" + props.route.params.username + ".jpg")
    }
    else {
      setProfileImage("https://veen-e.ewipro.com:7443/images/employees/" + Profile.userName + ".jpg")
    }
    return () => setProfileImage("https://veen-e.ewipro.com:7443/images/employees/" + Profile.userName + ".jpg")
  }, [Profile, props])

  React.useEffect(() => {
    console.log(isShiftLoading, isBreakLoading)
    if (!isShiftLoading && !isBreakLoading) {
      setIsLoading(false)
    }
  }, [isShiftLoading, isBreakLoading])


  const startTimer = () => {
    let timeClockedArray = timeClocked
    let hours = timeClockedArray[0]
    let minutes = timeClockedArray[1]
    let seconds = timeClockedArray[2]
    seconds++;
    if (seconds > 59) {
      minutes++;
      if (minutes > 59) {
        hours++;
        minutes = 0
      }
      seconds = 0
    }
    setTimeClocked([hours, minutes, seconds])
    setCountingTimeClocked((hours != 0 ? hours + "h : " : "") + (minutes != 0 ? minutes + "m : " : "") + (seconds != 0 ? seconds + "s " : ""))
  }
  const startBreakTimer = () => {
    let breakTimeClockedArray = breakTimeClocked
    let hours = breakTimeClockedArray[0]
    let minutes = breakTimeClockedArray[1]
    let seconds = breakTimeClockedArray[2]
    seconds++;
    if (seconds > 59) {
      minutes++;
      if (minutes > 59) {
        hours++;
        minutes = 0
      }
      seconds = 0
    }
    setBreakTimeClocked([hours, minutes, seconds])
    setCountingBreakTimeClocked((hours != 0 ? hours + "h : " : "") + (minutes != 0 ? minutes + "m : " : "") + (seconds != 0 ? seconds + "s " : ""))
  }


  let started = false;
  React.useEffect(() => {
    if (!started) {
      const interval = setInterval(() => {
        startTimer()
        started = true
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeClocked])

  let started2 = false;
  React.useEffect(() => {
    if (!started2) {
      const interval2 = setInterval(() => {
        startBreakTimer()
        started2 = true
      }, 1000);
      return () => clearInterval(interval2);
    }
  }, [breakTimeClocked])

  const ActiveAvatar = ({ user }) => {
    const [userPercentWorked, setUserPercentWorked] = React.useState(1)
    const [userPicture, setUserPicture] = React.useState("https://veen-e.ewipro.com:7443/images/employees/" + user.username + ".jpg");
    const barStyle = {backgroundColor:"white", borderRadius:2}

    React.useEffect(() => {
      if (user.scheduleDetails) {
        let timeNeeded = user.scheduleDetails.plannedShiftEndStamp - user.stampStart
        let timeWorked = timeStampNow - user.stampStart
        let percentWorked = timeWorked / timeNeeded
        if (percentWorked > 1) {
          percentWorked = 1;
        }
        setUserPercentWorked(percentWorked)
      }
      return () => { setUserPicture("https://veen-e.ewipro.com:7443/images/employees/" + user.username + ".jpg") }
    }, [user.scheduleDetails, user.stampStart, user.username, userPicture])


    return (

      <TouchableOpacity onPress={() => { props.navigation.navigate('My Shift', user) }} style={{ flex: 1, paddingHorizontal: 10, justifyContent: "flex-end", alignItems: "flex-start", display: "flex", flexDirection: "column" }}>
        <Avatar.Image size={40} style={{ marginHorizontal: 3, flex: 1, backgroundColor: "rgba(0,0,0,0)" }} source={{ uri: userPicture }} />

        {user.scheduleDetails && <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", alignItems: "flex-start" }}>

          <View style={{ flex: 4 }}>
            <ProgressBar progress={userPercentWorked} color={"lime"} style={barStyle} />
          </View>
        </View>}
      </TouchableOpacity>
    )
  }

  React.useEffect(() => {
    let activeList = othersActive
    if (activeList != null) {
      let avatars = Object.keys(activeList).map(key => (
        <ActiveAvatar key={key} user={activeList[key]} />
      ))
      setActiveAvatars(avatars)
    }
    else {
      setActiveAvatars(null)
    }
    setOthersActiveLoading(false)
    return () => { activeList = null; }
  }, [othersActive])

  React.useEffect(() => {
   if (managerScanned){
     setTimeout(function(){
      setManagerScanned(false)
      setVisible(true)
      setBreakMessage("Manager scan Expired")
     },60000)
   }
  }, [managerScanned])

  React.useEffect(() => {
    let scheduleObj = schedule
    if (scheduleObj) {
      setScheduleStart(scheduleObj.shiftStarts > 12 ? (scheduleObj.shiftStarts - 12) + "pm" : scheduleObj.shiftStarts + "am")
      setScheduleStop(scheduleObj.shiftEnds > 12 ? (scheduleObj.shiftEnds - 12) + "pm" : scheduleObj.shiftEnds + "am")
      //plannedShiftEndStamp
    }
    return () => scheduleObj = null;
  }, [schedule])

  const [refreshing, setRefreshing] = React.useState(false);


  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getShiftData();
  }, [getShiftData]);


  const containerStyle = { backgroundColor: 'white', padding: 20 };
  const [QR, setQR] = React.useState('');
  const ref_input = React.useRef();
  const [isLoadingScan, setIsLoadingScan] = React.useState(false)
  const checkIfManager = (authstring) => {
    setIsLoadingScan(true)
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
          setManagerScanned(true)
          setIsLoadingScan(false)
          hideManagerDialog()
          setVisible(true)
          setBreakMessage("Manager scanned! Please try clock out again.")
          setTooEarly(false)
        }
        else {
          setIsLoadingScan(false)
          setManagerScanned(false)
          hideManagerDialog()
          setVisible(true)
          setBreakMessage("User is not a manager")
        }
      })
      .catch((error) => {
        alert("Unable to log in - " + error.toString());
        setManagerScanned(false)
        setIsLoadingScan(false)
        hideManagerDialog()
        setVisible(true)
        setBreakMessage("User is not a manager")
      });

  }
  React.useEffect(() => {
    if (managerDialogVisible) {
      const interval2 = setInterval(() => {
        ref_input.current.focus()
      }, 100);
      return () => clearInterval(interval2);
    }
  }, [managerDialogVisible])


  if (isLoading) {
    return <Splash />
  }
  else {

    return (
      <ScreenContainer flexstart halfmargin>

        
        <LinearGradient
          // Background Linear Gradient
          colors={[colors.primary, colors.darkenedPrimary]}
        >
          <ScrollView 
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />}
          >

            <Surface style={{ display: "flex", width: windowWidth, alignSelf: "center", flexDirection: "column" }}>
              <LinearGradient
                // Background Linear Gradient
                colors={[colors.darkenedPrimary, "rgba(0,20,55,1)"]}
              >
                {(!isShiftLoading && !isBreakLoading) && <View style={{ flex: 1, display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 5 }}>

                  <View style={{ flex: 1, paddingHorizontal: 10, justifyContent: "flex-end", alignItems: "center", display: "flex", flexDirection: "column" }}>
                    {profileImage == "" && <ActivityIndicator />}
                    {profileImage != "" && <Avatar.Image size={80} source={{ uri: profileImage }} />}
                    {schedule != null && <View style={{ justifyContent: "center", alignItems: "center", display: "flex", flexDirection: "column" }}>
                      <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", alignItems: "flex-start" }}>
                        <MaterialCommunityIcons name="folder-clock-outline" size={15} color={"#FFFFFF"} style={{ flex: 1, marginTop: -6 }} />
                        <View style={{ flex: 4 }}>
                          <ProgressBar progress={percentWorked} color={"lime"} style={{backgroundColor:"white", borderWidth:1, borderColor:"white", borderRadius:2, height:5}} />
                        </View>
                      </View>
                      <Text style={{ color: "#FFFFFF" }}>{scheduleStart} - {scheduleStop}</Text>

                    </View>}
                  </View>
                  {!shiftActive && <View style={{ flex: 3, }}><Text style={{ textAlign: "center", color: "#FFFFFF", fontWeight: "bold" }}>{message}</Text></View>}
                  {shiftActive && <View style={{ flex: 3, display: "flex", flexDirection: "column" }}>
                    {(!breakActive || !isCurrentUser) && <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
                      <MaterialCommunityIcons name="clock-fast" size={40} color={"#FFFFFF"} style={{ maxWidth: 50, flex: 1, textAlign: "right" }} />
                      <Headline style={{ textAlign: "left", color: "#FFFFFF", fontWeight: "bold", marginLeft: 5, flex: 4 }}>{countingTimeClocked}</Headline>
                      {!isCurrentUser && <IconButton
                        icon="account-arrow-left"
                        color={Colors.red500}
                        style={{ flex: 1 }}
                        size={30}
                        onPress={() => props.navigation.navigate('My Shift')}
                      />
                      }
                    </View>
                    }
                    {(breakActive && isCurrentUser) && <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
                      <MaterialCommunityIcons name="clock-fast" size={40} color={colors.accent} style={{ maxWidth: 50, flex: 1, textAlign: "right" }} />
                      <Headline style={{ textAlign: "left", color: "#FFFFFF", fontWeight: "bold", flex: 4, marginLeft: 5 }}>{countingBreakTimeClocked}</Headline>
                      <View style={{ flex: 1 }}>
                        <Text style={{ textAlign: "center", color: "#FFFFFF", fontWeight: "bold", fontSize: 10 }}>Break time started at:</Text>
                        <Text style={{ textAlign: "center", color: "#FFFFFF", fontWeight: "bold", fontSize: 10 }}> {breakStarted}</Text>
                      </View>
                    </View>
                    }
                    {shiftActive && <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
                      <MaterialCommunityIcons name="clock-check-outline" size={20} color={"#FFFFFF"} style={{ maxWidth: 50, flex: 1, textAlign: "right" }} />
                      <Headline style={{ textAlign: "left", color: "#FFFFFF", fontWeight: "bold", fontSize: 15, flex: 4, marginLeft: 5 }}> {timeStarted}</Headline>
                      {!isCurrentUser && <View style={{ flex: 1 }}></View>}
                    </View>
                    }
                    {!isCurrentUser && <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
                      <Headline style={{ textAlign: "center", color: "cyan", fontWeight: "bold", fontSize: 15 }}> {name}</Headline>
                    </View>
                    }


                  </View>
                  }
                  {/* <View style={{display:"flex", alignItems:"flex-start", justifyContent:"flex-start"}}>
                  <IconButton 
                    icon={"account-cog"}
                    color={colors.primary}
                    onPress={() => props.navigation.navigate('User Details')}
                    style={{backgroundColor:"white", marginRight:20}}
                    />
                                   <Text style={{fontSize:50, opacity:0}}> .</Text>
</View> */}
                </View>
                }
                {isShiftLoading || isBreakLoading &&
                  <View style={{ flex: 1, display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 5 }}>
                    <ActivityIndicator size="large" animating={true} />
                  </View>
                }
              </LinearGradient>

            </Surface>



            {(activeAvatars != null && activeAvatars != [] && activeAvatars != "" && shiftActive) && <Surface style={{ display: "flex", marginBottom: 2, width: windowWidth, alignSelf: "center", flexDirection: "column" }}>
              <LinearGradient
                // Background Linear Gradient
                colors={["rgba(0,20,55,1)", colors.darkenedPrimary]}
              >
                <Text style={{ textAlign: "left", color: "#FFFFFF", fontWeight: "bold", fontSize: 10, marginLeft: 10, marginVertical: 5 }}>Also working</Text>
                {(!isShiftLoading && !isBreakLoading) && <ScrollView horizontal={true} style={{ marginHorizontal: 10, marginBottom: 5 }}>
                  {othersActiveLoading && <ActivityIndicator size={"small"} animating={true} />}
                  {!othersActiveLoading && activeAvatars}
                </ScrollView>
                }
                {isShiftLoading || isBreakLoading && <ScrollView horizontal={true} style={{ marginHorizontal: 10, marginBottom: 5 }}>
                  <ActivityIndicator size="large" animating={true} />
                </ScrollView>
                }
              </LinearGradient>
            </Surface>
            }

            {isCurrentUser && <View style={{ display: "flex", width: windowWidth, flexDirection: "row", justifyContent: "center", alignItems: "center", marginVertical: 5, flexWrap:"wrap" }}>
              {!shiftActive && <Button mode="contained" style={{ margin: 2, backgroundColor: "green" }} onPress={() => clockIn()}>Clock In</Button>}
              {shiftActive && !breakActive && <Button style={{ margin: 2, backgroundColor: "#efca00" }} mode="contained" onPress={() => breakStart()}>Take a break</Button>}
              {shiftActive && breakActive && <Button style={{ margin: 2, backgroundColor: "orange" }} mode="contained" onPress={() => breakStop()}>End break</Button>}
              {shiftActive && !breakActive && <Button style={{ margin: 2, backgroundColor: "red" }} mode="contained" onPress={() => clockOut(managerScanned)}>Clock Out</Button>}
            </View>
            }
            {clockError != "" && <View style={{ display: "flex", width: windowWidth, flexDirection: "row" }}>
              <Text style={{ color: "red" }}>{clockError}</Text>
            </View>}








            {(!isShiftLoading && !isBreakLoading) && <Timeline
              data={data}
              style={{ width: windowWidth, marginVertical: 20, }}
              separator={false}
              lineColor={colors.accent}
              circleColor={colors.lightenedPrimary}
              timeContainerStyle={{ minWidth: 52, paddingLeft: 5 }}
              timeStyle={{ textAlign: 'center', backgroundColor: colors.primary, color: "#FFFFFF", padding: 5, borderRadius: 13 }}
              titleStyle={{ color: "#FFFFFF" }}
              innerCircle={'icon'}
              iconDefault={<MaterialCommunityIcons name="circle-medium" size={15} color={"#FFFFFF"} />}
              circleSize={30}
              descriptionStyle={{ color: "#d9d9d9" }}
            />
            }
            {isShiftLoading || isBreakLoading &&
              <ActivityIndicator size="large" animating={true} />
            }
          </ScrollView>
        </LinearGradient>


        <Snackbar
          visible={visible}
          onDismiss={onDismissSnackBar}
          action={tooEarly && !managerScanned ? {
            label: "Get Manager Approval",
            onPress: () => {
              onDismissSnackBar()
              if (!managerDialogVisible) {
                setManagerDialogVisible(true)
              }
            }
          }
            :
            {
              label: "OK",
              onPress: () => {
                onDismissSnackBar()
              }
            }}
          duration={5000}
        >
          {breakMessage}
        </Snackbar>


        <Portal>
          <Modal visible={managerDialogVisible} onDismiss={hideManagerDialog} contentContainerStyle={containerStyle}>
            {!isLoadingScan &&
              <View style={{ alignSelf: "center", alignContent: "center", display: "flex" }}><Subheading>Scan manager badge</Subheading>
                <MaterialCommunityIcons style={{ alignSelf: "center" }} name="barcode-scan" size={50} color="#0078D7" />
              </View>}
            {isLoadingScan &&
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
      </ScreenContainer>
    );
  }
};