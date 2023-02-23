import { StatusBar } from 'expo-status-bar';
import React, { useContext } from 'react';
import { Provider as PaperProvider, Dialog, Paragraph, Button, Portal } from 'react-native-paper';
import Navigation from './navigation/navigation';
import { Splash } from './screens/splash'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthContext } from "./context";
import { lightTheme, darkTheme } from './theme'
import * as Updates from 'expo-updates';
import { ScreenContainer } from './ScreenContainer'
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';


import * as Device from 'expo-device';


const androidName = Device.deviceName


// eslint-disable-next-line react/display-name
export default () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [userToken, setUserToken] = React.useState(null);
  const [userType, setUserType] = React.useState(null);
  const [userClassName, setUserClassName] = React.useState(null);
  const [userName, setUserName] = React.useState(null);
  const [userNameLogin, setUserNameLogin] = React.useState(null)
  const [userID, setUserID] = React.useState(null);
  const [isAdmin, setIsAdmin] = React.useState(null);
  const [userPermLevel, setUserPermLevel] = React.useState(null);
  const [adminMode, setAdminMode] = React.useState(false);
  const [isSupervisor, setIsSupervisor] = React.useState(null);
  const [isManager, setIsManager] = React.useState(null);
  const [dateGlobal, setDateGlobal] = React.useState(null);
  const [permLevels, setPermLevels] = React.useState(null);
  const [branchName, setBranchName] = React.useState(null);
  const [jwt, setJwt] = React.useState(null);
  const [authNFC, setAuthNFC] = React.useState(null);
  const [visible, setVisible] = React.useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);
  // eslint-disable-next-line no-unused-vars
  const [wifiIcon, setWifiIcon] = React.useState(false)
  // eslint-disable-next-line no-unused-vars
  const [wifiColour, setWifiColour] = React.useState(0)
  const [updateError, setUpdateError] = React.useState('')
  const [updateError2, setUpdateError2] = React.useState('')

  {/*
  const handleConnectionChange = (state) => {
    //console.log(state)
    if (!state.isConnected) {
      setWifiIcon("wifi-strength-off-outline");
      setWifiColour("#ff0000");
    }
    else {
      if (state.details.strength <= 10) {
        setWifiIcon("wifi-strength-outline");
        setWifiColour("#fa0000");
      }
      if (state.details.strength <= 25 && state.details.strength > 10) {
        setWifiIcon("wifi-strength-1");
        setWifiColour("#f26c00");
      }
      if (state.details.strength <= 50 && state.details.strength > 25) {
        setWifiIcon("wifi-strength-2");
        setWifiColour("#d5a5000");
      }
      if (state.details.strength <= 75 && state.details.strength > 50) {
        setWifiIcon("wifi-strength-3");
        setWifiColour("#a0d500");
      }
      if (state.details.strength > 75) {
        setWifiIcon("wifi-strength-4");
        setWifiColour("#00ff00");
      }
    }
  }

  const netInfo = useNetInfo();

  React.useEffect(() => {
    const intervalWifiCheck = setInterval(() => {
      //console.log(netInfo)
      //handleConnectionChange(myInfo)
    }, 5000);
    return () => clearInterval(intervalWifiCheck);
  }, [])
*/}

  const handleUrl = React.useCallback((url) => {
    let newUrl = Linking.parse(url.url);
    if (newUrl.queryParams) {
      if (newUrl.queryParams.authKey && newUrl.queryParams.userType && newUrl.queryParams.user) {
        //saveAuth(newUrl.queryParams.authKey, newUrl.queryParams.userType, newUrl.queryParams.user).then(
        updateAuth(newUrl.queryParams.user, newUrl.queryParams.authKey, newUrl.queryParams.userType)
        //);
      }
    }
  }, [updateAuth]);


  const getUpdate = React.useCallback(async () => {
    try {
      const update = await Updates.checkForUpdateAsync()
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        showDialog()
      }
    } catch (e) {
      // handle or log error
    }
  }, [])


  const tryForceUpdate = async () => {
    setUpdateError2("got to step 1")
    try {
      setUpdateError2("got to step 2")
      const update = await Updates.checkForUpdateAsync()
      if (update.isAvailable) {
        setUpdateError2("got to step 3")
        await Updates.fetchUpdateAsync();
        try {
          setUpdateError2("got to step 4")
          await Updates.reloadAsync();
        } catch (e) {
          setUpdateError("error loading update:" + e)
        }
      }
    } catch (e) {
      setUpdateError("error checking update:" + e)
    }
  }

  const doUpdate = async () => {
    try {
      await Updates.reloadAsync();
    } catch (e) {
      alert("error:" + e)
    }
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
          catch (e) {
            console.log(e)
          }
        }
      }
    } catch (e) {
      console.log(e)
    }
  }



  const ClearProfile = () => {
    setJwt('')
    setUserToken('')
    setAuthNFC('')
    setUserType('')
    setUserName('')
    setDateGlobal('')
    setUserID('')
    setUserNameLogin('')
    setInitialState('')
  }

  const [initialState, setInitialState] = React.useState();
  const [needsRelog, setNeedsRelog] = React.useState(false);
  const [theme, setTheme] = React.useState(lightTheme)
  const [familiarName, setFamiliarName] = React.useState("");
  const signInLocal = (auth_key, jwt, userType, userName, name, id, isAdmin, isSupervisor, isManager, userClassName, branchname, currentPermLevels, userPermLevel) => {
    setUserToken(auth_key);
    setUserType(userType)
    setJwt(jwt);
    setUserID(id)
    setUserNameLogin(userName)
    setIsAdmin(isAdmin)
    setIsSupervisor(isSupervisor)
    setIsManager(isManager)
    //saveAuth(auth_key, userType, userName)
    setUserName(name)
    setNeedsRelog(false)
    setAdminMode(false)
    setUserClassName(userClassName)
    setBranchName(branchname)
    setPermLevels(currentPermLevels)
    setUserPermLevel(userPermLevel)
  }
  // eslint-disable-next-line no-unused-vars
  const [deviceId, setDeviceId] = React.useState(androidName)
  const authContext = React.useMemo(() => {
    return {
      Profile: {
        jwt: jwt,
        userToken: userToken,
        NFC: authNFC,
        userType: userType,
        name: userName,
        date: dateGlobal,
        id: userID,
        userName: userNameLogin,
        state: initialState,
        needsRelog: needsRelog,
        deviceId: deviceId,
        isAdmin: isAdmin,
        isSupervisor: isSupervisor,
        isManager: isManager,
        adminMode: adminMode,
        updateError: updateError,
        updateError2: updateError2,
        userClassName:userClassName,
        branchName: branchName,
        userPermLevel: userPermLevel,
        familiarName: familiarName,
      },
      PermLevels: permLevels,
      setAppState: (state) => {
        setInitialState(state)
      },
      toggleThemeGlobal: (status) => {
        if (status == "checked") {
          setTheme(darkTheme)
        }
        if (status == "unchecked") {
          setTheme(lightTheme)
        }
      },
      setFamiliarNameGlobal: (name) =>{
        setFamiliarName(name)
      },
      toggleAdmin: (currentMode) => {
        setAdminMode(!currentMode)
      },
      setRelog: (relog) => {
        setNeedsRelog(relog)
      },
      signIn: (auth_key, jwt, userType, userName, name, id, isAdmin, isSupervisor, isManager, userClassName, branchname, currentPermLevels, userPermLevel) => {
        setUserToken(auth_key);
        setUserType(userType)
        setJwt(jwt);
        setUserID(id)
        setUserNameLogin(userName)
        setIsAdmin(isAdmin)
        setIsSupervisor(isSupervisor)
        setIsManager(isManager)
        //saveAuth(auth_key, userType, userName)
        setUserName(name)
        setNeedsRelog(false)
        setAdminMode(false)
        setUserClassName(userClassName)
        setBranchName(branchname)
        setPermLevels(currentPermLevels)
        setUserPermLevel(userPermLevel)
      },
      expireJWT: (jwt) => {
        setJwt(jwt)
      },
      updateAuthGlobal: (user_name, user_token, user_type) => {
        updateAuth(user_name, user_token, user_type)
        setUserToken(user_token);
        setUserType(user_type)
        setUserNameLogin(user_name)
      },
      signOut: () => {
        setUserToken(null);
        setJwt(null);
        clearStorage();
        setInitialState(null)
        ClearProfile();
      },
      setDate: (date) => {
        setDateGlobal(date)
      },
      forceUpdate: () => {
        tryForceUpdate()
      },
      wifiState: {
        wifiIcon: wifiIcon,
        wifiColour: wifiColour
      }
    }
  }, [jwt, userToken, authNFC, userType, userName, dateGlobal, userID, userNameLogin, initialState, needsRelog, deviceId, isAdmin, isSupervisor, isManager, adminMode, updateError, updateError2, userClassName, branchName, userPermLevel, familiarName, permLevels, wifiIcon, wifiColour, updateAuth]);


  const clearStorage = async () => {
    try {
      await AsyncStorage.clear()
    } catch (e) {
      alert('Failed to clear session storage')
    }
  }

  {/* const saveAuth = async (auth_key, userType, userName) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, auth_key)
      await AsyncStorage.setItem(USER_TYPE_STORAGE_KEY, userType)
      await AsyncStorage.setItem(USER_STORAGE_KEY, userName)
    } catch (e) {
      alert('Failed to save session storage')
    }
  }
*/}

  const Auth = async () => {
    /*try {
      const user_token = await AsyncStorage.getItem(AUTH_STORAGE_KEY)
      const user_name = await AsyncStorage.getItem(USER_STORAGE_KEY)
      const user_type = await AsyncStorage.getItem(USER_TYPE_STORAGE_KEY)
      if (user_token !== null && user_name !== null && user_type !== null) {
        updateAuth(user_name, user_token, user_type)
      }
      else {*/
    setUserToken('')
    setJwt('')
    setUserType('')
    //setUserNameState('')
    //setUserTypeState('')
    setIsLoading(false)
    /*  }
    } catch (e) {
      alert('Failed to fetch session storage')
    }*/
  }

  const updateAuth = React.useCallback((user, userToken, userType) => {
    setUserToken(null);
    setJwt(null);
    let data = {
      method: 'POST',
      mode: "cors", // no-cors, cors, *same-origin *=default
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "username": user,
        "auth_key": userToken,
        "updateAuth": true,
        "user_type": userType,
        "deviceID": deviceId
      })
    };
    console.log(data)
    return fetch('https://api-veen-e.ewipro.com/v1/authenticate/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        signInLocal(responseData.auth_key, responseData.jwt, responseData.token.data.user_type, responseData.username, responseData.namesurname, responseData.user_id, responseData.token.data.administrator,responseData.token.data.supervisor, responseData.token.data.manager, responseData.token.data.user_class_name, responseData.token.data.branchName, responseData.token.privilegesStructure, responseData.token.data.userClass);
      })
      .catch((error) => {
        alert("Unable to log in - " + error.toString());
      });
  }, [deviceId])

  React.useEffect(() => {
    getUpdate()
    
    Auth()

  }, [getUpdate]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      deleteCache()
      getUpdate()
    }, 60000);
    return () => clearInterval(interval);
  }, [getUpdate]);


  if (visible) {
    return (
      <PaperProvider theme={theme}>
        <ScreenContainer>
          <Portal>
            <Dialog visible={visible} onDismiss={hideDialog}>
              <Dialog.Title>Alert</Dialog.Title>
              <Dialog.Content>
                <Paragraph>An Update is available, would you like the restart the app?</Paragraph>
              </Dialog.Content>
              <Dialog.Actions style={{ display: "flex", flexDirection: "column" }}>
                <Button onPress={doUpdate}>Update &amp; Restart App</Button>
                <Button onPress={hideDialog}>Remind Me Later</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </ScreenContainer>
      </PaperProvider>
    )
  }


  if (isLoading) {
    return (
      <PaperProvider theme={theme}>
        <Splash />
      </PaperProvider>
    )
  }


  return (
    <AuthContext.Provider value={authContext}>
      <PaperProvider theme={theme}>
        <StatusBar hidden={true} />
        <Navigation />
      </PaperProvider>
    </AuthContext.Provider>
  );
};