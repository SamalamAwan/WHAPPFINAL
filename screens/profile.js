import React from "react";
import { Button, Text, ToggleButton, useTheme } from 'react-native-paper';

import {ScreenContainer} from '../ScreenContainer'
import { AuthContext } from "../context";
import * as Clipboard from 'expo-clipboard';
import * as Updates from 'expo-updates';
import * as FileSystem from 'expo-file-system';


export const Profile = () => {
    const { signOut, toggleAdmin } = React.useContext(AuthContext);
    const { Profile, toggleThemeGlobal, forceUpdate } = React.useContext(AuthContext);
    const { colors } = useTheme();
 const version = Updates.updateId
  const [updateVersion, setUpdateVersion] = React.useState('');
  const [log, setLog] = React.useState('')
  const tryForceUpdate = () =>{
    deleteCache()
    forceUpdate()
  }


  
  const deleteCache = async () => {
    try {
      const cacheDir = await FileSystem.cacheDirectory;
      if (cacheDir) {
        const cacheFiles = await FileSystem.readDirectoryAsync(cacheDir);
        for (let i = 0; i < cacheFiles.length; i++) {
          try {
          await FileSystem.deleteAsync(cacheDir + cacheFiles[i])
          }
          catch (e){
            setLog(e)
          }
        }
      }
    } catch (e) {
      setLog(e)
    }
  }



    const copyToClipboard = () => {
      Clipboard.setString(Profile.NFC);
    };  
    const [status, setStatus] = React.useState('checked');

    const onButtonToggle = () => {
      setStatus(status === 'unchecked' ? 'checked' : 'unchecked');
      toggleThemeGlobal(status)
    };
  
    React.useEffect(() => {
      setUpdateVersion(version)
    },[version])

    return (
      <ScreenContainer>
        <Text style={{color: "#000000"}}>Profile Screen</Text>
        <Button onPress={() => signOut()}>Sign Out</Button>
        <Button onPress={copyToClipboard}>Copy NFC Auth to clipboard</Button>
        <Button onPress={() => deleteCache()}>Clear Cache</Button>
        <Text>{log}</Text>
        <Button onPress={() => tryForceUpdate()}>Force Update</Button>
        <Text style={{color: "#000000"}}>{Profile.updateError}</Text>
        <Text style={{color: "#000000"}}>{Profile.updateError2}</Text>
        <ToggleButton
      icon="moon-waning-crescent"
      value="Light mode"
      color={"#000000"}
      size={50}
      status={status}
      onPress={onButtonToggle}
    />
            <Text style={{color: "#000000"}}>Device ID: {Profile.deviceId}</Text>
            <Text style={{color: "#000000"}}>Update ID: {updateVersion}</Text>
            <Text style={{color: "#000000"}}>Version: 1.4.0 13/12/2022</Text>
            {Profile.isAdmin == "1" && <Button onPress={() => toggleAdmin(Profile.adminMode)}>Admin Mode: {Profile.adminMode ? "On" : "Off"}</Button>}
      </ScreenContainer>
    );
  };