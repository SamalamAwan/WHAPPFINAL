import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { ScreenContainer } from '../ScreenContainer'
import styles from '../styles'
import { Title, Surface, Text, useTheme, Badge, Button } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from "../context";
import { apiKey } from "../context";
import { useContext, useState, useRef } from "react";
import { Profile } from "./profile";





const JobsBadge = () => {
  const { Profile, updateAuthGlobal } = React.useContext(AuthContext);

  const [jobsNumber, setJobsNumber] = React.useState(null);

  const { colors } = useTheme();

  React.useEffect(() => {
    sendJwtForJobs(Profile.jwt)
  }, [Profile.jwt, sendJwtForJobs])


  const sendJwtForJobs = React.useCallback((jwt)=> {
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
            setJobsNumber(responseData.numerOfConsigments)
          }
        })
        .catch((error) => {
          if (error.message == "401") {
            updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
          }
        });
    }
  },[]);

if (jobsNumber > 0){
  return (
    <Badge size={30} style={{ backgroundColor: colors.accent, color: "#707070", position:"absolute", right:45, top:20 }}>{jobsNumber}</Badge>
  );
}
else{
  return null;
}
}



const HomeIcon = (props) => {
  const [jobs, setJobs] = useState(false)
  const { homeShortcut } = useTheme();

  React.useEffect(()=>{
    setJobs(props.jobs)
    return () => setJobs(false)
  },[props])

  return (
    <Surface style={homeShortcut.Surface}>
      <View style={homeShortcut.SurfaceItem}>{props.Icon}
      </View>
      <View style={homeShortcut.SurfaceItem}>
        <Title style={homeShortcut.homeIconTitle}>{props.Title}</Title>
      </View>
      {jobs && <JobsBadge />}
    </Surface>

  )
}
const JobsIcon = () => {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name="badge-account" size={50} color={colors.homeIcon} />
  );
}

const DeliveryIcon = () => {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name="truck-delivery" size={50} color={colors.homeIcon} />
  );
}

const ProfileIcon = () => {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name="account-hard-hat" size={50} color={colors.homeIcon} />
  );
}

const HelpIcon = () => {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name="feature-search" size={50} color={colors.homeIcon} />
  );
}

const FeedbackIcon = () => {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name="bug-check" size={50} color={colors.homeIcon} />
  );
}


const MyShiftIcon = () => {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name="account-clock" size={50} color={colors.homeIcon} />
  );
}


const SupervisorIcon = () => {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name="account-child" size={50} color={colors.homeIcon} />
  );
}

const ManagerIcon = () => {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name="briefcase-account" size={50} color={colors.homeIcon} />
  );
}

const StockControlIcon = () => {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name="account-cowboy-hat" size={50} color={colors.homeIcon} />
  );
}

const CollectionsIcon = () => {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name="arrow-up-bold-box" size={50} color={colors.homeIcon} />
  );
}


export const HomeScreen = ({ navigation }) => {
  const  {Profile, PermLevels, setFamiliarNameGlobal} = React.useContext(AuthContext);
  const [canSeeSupervisors, setCanSeeSupervisors] = React.useState(false)
  const [canSeeStockControl, setCanSeeStockControl] = React.useState(false)
  const [canSeeManagers, setCanSeeManagers] = React.useState(false);


  React.useEffect(() => {
  if (PermLevels != null){
    let perms = PermLevels;
  let currentPerms = perms.filter((n) => n.value <= Profile.userPermLevel)
  if (currentPerms != null && currentPerms.length > 0){
  if (currentPerms.filter((e) => e.name == "UC_MANAGER").length > 0){
    setCanSeeManagers(true);
  }
  else{
    setCanSeeManagers(false)
  }
  if (currentPerms.filter((e) => e.name == "UC_SUPERVISOR").length > 0){
    setCanSeeSupervisors(true);
  }
  else{
    setCanSeeSupervisors(false)
  }
  if (currentPerms.filter((e) => e.name == "UC_QC").length > 0){
    setCanSeeStockControl(true);
  }
  else{
    setCanSeeStockControl(false)
  }
  let highestPerm = currentPerms.reduce((max, perm) => max.value > perm.value ? max : perm);
  setFamiliarNameGlobal(highestPerm.familiarName)
  }
  }
  },[PermLevels, Profile, setFamiliarNameGlobal])

  return (
    <ScreenContainer style={styles.HomeScreen}>
      <ScrollView contentContainerStyle={styles.HomeScreenScroll}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('JobStack')}><HomeIcon Title="JOBS" subText="View your Jobs" Icon={<JobsIcon />} jobs={true} /></TouchableOpacity>
        {Profile.adminMode && <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Collections')}><HomeIcon Title="COLLECTIONS" subText="STOCK CONTROL" Icon={<CollectionsIcon />} /></TouchableOpacity>}
        {canSeeSupervisors && <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Supervisors')}><HomeIcon Title="SUPERVISORS" subText="View Inventory" Icon={<SupervisorIcon />} /></TouchableOpacity>}
        {canSeeManagers && <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Managers')}><HomeIcon Title="MANAGERS" subText="View Inventory" Icon={<ManagerIcon />} /></TouchableOpacity>}
        {canSeeStockControl && <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Quality Control')}><HomeIcon Title="QUALITY CONTROL" subText="QUALITY CONTROL" Icon={<StockControlIcon />} /></TouchableOpacity>}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('My Shift Tabs')}><HomeIcon Title="MY SHIFT" subText="View your Jobs" Icon={<MyShiftIcon />} /></TouchableOpacity> 
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Profile')}><HomeIcon Title="PROFILE" subText="View your Profile" Icon={<ProfileIcon />} /></TouchableOpacity>
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('DeliveriesStack')}><HomeIcon Title={"INCOMING DELIVERIES"} subText="View Deliveries" Icon={<DeliveryIcon />} /></TouchableOpacity>
        {/*<TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Feedback')}><HomeIcon Title="FEEDBACK" subText="Send Feedback" Icon={<FeedbackIcon />} /></TouchableOpacity>*/}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Courier Collection')}><HomeIcon Title="COURIER COLLECTIONS" subText="Send Items" Icon={<CollectionsIcon />} /></TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  )
};


