import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { StatusBar, View, Image, ImageBackground, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { Splash } from '../screens/splash'
import { HomeScreen } from '../screens/home'
import { SignIn } from '../screens/signIn'
import { Profile } from '../screens/profile'
import { QualityControl } from '../screens/QualityControl'
import { Collections } from '../screens/collections';
import { Deliveries } from '../screens/deliveries';
import { JobsScreen } from '../screens/jobs'
import { CameraScreen } from '../screens/camera'
import { BarcodeScreen } from '../screens/barcode'
import { InventoryHomeScreen } from '../screens/inventoryHome'
import { ReportsHomeScreen } from '../screens/reportsHome'
import { FindItemScreen } from '../screens/findItem';
import { OutgoingItemsScreen } from '../screens/outgoingItems';
import { DeliveryNoteScreen } from '../screens/deliveryNotes'
import { ItemsScreen } from '../screens/items'
import { AssignBarcodeScreen } from '../screens/assignBarcode'
import { ReportsScreen } from '../screens/reports'
import { MyShiftScreen } from '../screens/myShift'
import { ConstructionScreen } from '../screens/construction'
import styles from '../styles'
import { useContext, useRef, useState, useEffect } from 'react';
import { AuthContext } from '../context';
import { IconButton, useTheme, Text, Headline, Subheading, Caption, Title, Avatar, Modal, Portal, TextInput, Button, ActivityIndicator } from 'react-native-paper'
import { CardStyleInterpolators } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Dimensions, AppState } from 'react-native';
import { Feedback } from '../screens/feedback';
import * as Battery from 'expo-battery';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { HolidayScreen } from '../screens/holiday';
import { Delivery } from '../screens/delivery';
import { CourierCollectionScreen } from '../screens/CourierCollections';
import { StockTakeFindScreen } from '../screens/stockTakeFind';
import { StockTakeItemScreen } from '../screens/StockTakeItem';
import { ManagerHomeScreen } from '../screens/managerHome';
import { DamageFindScreen } from '../screens/DamageFind';
import { DamageItemScreen } from '../screens/DamageItem';
import { CameraDamageScreen } from '../screens/cameraDamage';
import { UserDetailsScreen } from '../screens/userDetails';
import { StockTakeHomeScreen } from '../screens/stockTakeHome';
import { StockTakeMissingScreen } from '../screens/stockMissing';






const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
export default function Navigation(props) {
    // eslint-disable-next-line no-unused-vars
    const [visible, setVisible] = React.useState(false);
    const appState = useRef(AppState.currentState);
    const { setAppState, Profile, setRelog } = React.useContext(AuthContext)

    // useEffect(() => {
    //     AppState.addEventListener("change", _handleAppStateChange);
    //     return () => {
    //         AppState.removeEventListener("change", _handleAppStateChange);
    //     };
    // }, [Profile, _handleAppStateChange]);

    const _handleAppStateChange = React.useCallback((nextAppState) => {
        if (
            appState.current.match(/inactive|background/) &&
            nextAppState === "active"
        ) {
            if (Profile.jwt) {
                setRelog(true)
            }
        }

        appState.current = nextAppState;
    }, [Profile.jwt, setRelog])






    const hideModal = () => { setVisible(false), setNeedsRelog(false), setVisible2(false) };
    const containerStyle = { backgroundColor: 'white', padding: 5, margin: 10, width: windowWidth - 20, height: windowHeight - 40, display: "flex" };



    const { signIn, updateAuthGlobal } = React.useContext(AuthContext);
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setuserType] = useState('2');
    const [errorOutput, setError] = useState('');
    const [QR, setQR] = useState('');
    const { colors } = useTheme();

    const [visible2, setVisible2] = React.useState(false);

    const [isLoading, setIsLoading] = React.useState(false);
    const ref_input = useRef();
    const showModal2 = () => setVisible2(true);
    const hideModal2 = () => setVisible2(false);
    const containerStyle2 = { backgroundColor: 'white', padding: 5, margin: 10, display: "flex", height: 300 };

    React.useEffect(() => {
        if (Profile.needsRelog && !visible2) {
            const interval = setInterval(() => {
                ref_input.current.focus()
            }, 100);
            return () => clearInterval(interval);
        }
    }, [visible2, Profile])

    const sendQR = (QR) => {
        let data = (QR.split("-"))
        if (data[0].toLowerCase() == Profile.userToken.toLowerCase()) {
            setRelog(false)
        }
        else {
            updateAuthGlobal(data[2], data[0], userType)
            setRelog(false)
            setAppState(null)
        }
        setIsLoading(false)
        hideModal2()
        setUserName('');
        setPassword('');
    }

    const getAuth = () => {

        let data = {
            method: 'POST',
            mode: "cors", // no-cors, cors, *same-origin *=default
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "username": userName, "password": password, "updateAuth": false, "user_type": userType })
        };

        return fetch('https://api-veen-e.ewipro.com/v1/authenticate/', data)
            .then((response) => {
                if (!response.ok) throw new Error(response.status);
                else return response.json();
            })
            .then((responseData) => {
                if (userName.toLowerCase() == Profile.userName.toLowerCase()) {
                    setRelog(false)
                    setUserName('');
                    setPassword('');
                } else {
                    signIn(responseData.auth_key, responseData.jwt, responseData.token.data.user_type, responseData.username, responseData.namesurname, responseData.user_id, responseData.token.data.administrator, responseData.token.data.supervisor, responseData.token.data.manager,responseData.token.data.user_class_name);
                    setRelog(false)
                    setUserName('');
                    setPassword('');
                }
            })
            .catch((error) => {
                setError("Unable to log in," + error.toString());
            });
    }



    if (Profile.needsRelog && Profile.jwt) {

        return (
            <Portal>
                <Modal dismissable={false} visible={Profile.needsRelog} onDismiss={hideModal} contentContainerStyle={containerStyle}>
                    <ImageBackground source={require('../assets/loginBG.png')} style={styles.BGimage}>
                        <Portal>
                            <Modal visible={visible2} onDismiss={hideModal2} contentContainerStyle={containerStyle2}>
                                <KeyboardAvoidingView contentContainerStyle={styles.loginContainer} behavior={"padding"} keyboardVerticalOffset={60}>
                                    <View style={styles.loginWrapper}>
                                        <TextInput
                                            mode="flat"
                                            style={[styles.logInInput, { marginTop: 10 }]}
                                            placeholder="Username"
                                            placeholderTextColor="#CECECE"
                                            onChangeText={text2 => setUserName(text2)}
                                            value={userName} />
                                        <TextInput
                                            mode="flat"
                                            style={styles.logInInput}
                                            secureTextEntry
                                            placeholder="Password"
                                            placeholderTextColor="#CECECE"
                                            onChangeText={text3 => setPassword(text3)}
                                            value={password} />

                                        <Button mode="contained" style={styles.logInButton} labelStyle={{ color: "#FFFFFF", textAlignVertical: "center" }} onPress={() => getAuth()}>LOGIN</Button>
                                        <Button mode="outlined" style={styles.logInButton} labelStyle={{ color: colors.primary, textAlignVertical: "center" }} onPress={() => hideModal2()}>USE CARD</Button>
                                        <TouchableOpacity>
                                            <Text style={styles.errorText} >{errorOutput} </Text>
                                        </TouchableOpacity>
                                    </View>
                                </KeyboardAvoidingView>
                            </Modal>
                        </Portal>
                        <IconButton
                            icon="card-bulleted-off"
                            style={{ backgroundColor: colors.primary, position: "absolute", top: 0, margin: 20, right: 0, padding: 0, width: 50, height: 50, zIndex: 9999999 }}
                            color={"#FFFFFF"}
                            size={30}
                            onPress={() => showModal2()}
                        />
                        <Headline style={{ textAlign: "center", fontWeight: 'bold', color: "black" }}>Inactivty Detected</Headline>
                        <Subheading>Please log in again</Subheading>
                        <View style={{
                            flexDirection: 'row',
                            position: 'relative',
                            height: 50,
                            paddingHorizontal: 50,
                            marginVertical: 10
                        }}>
                            <TouchableOpacity
                                style={userType == 2 ? [styles.toggleButton, styles.toggleButtonActive] : styles.toggleButton}
                                onPress={() => setuserType("2")}>
                                <Text style={userType == 2 ? [styles.toggleButtonText, styles.toggleButtonTextActive] : styles.toggleButtonText}>
                                    Packer
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={userType == 1 ? [styles.toggleButton, styles.toggleButtonActive] : styles.toggleButton}
                                onPress={() => setuserType("1")}>
                                <Text style={userType == 1 ? [styles.toggleButtonText, styles.toggleButtonTextActive] : styles.toggleButtonText}>
                                    Manager
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {!isLoading &&
                            <View style={{ alignSelf: "center", alignContent: "center", display: "flex" }}><Subheading>Scan user QR Code now</Subheading>
                                <MaterialCommunityIcons style={{ alignSelf: "center" }} name="qrcode-scan" size={50} color="#0078D7" />
                            </View>}
                        {isLoading &&
                            <ActivityIndicator animating={true} size="large" />
                        }
                        <TextInput
                            style={{ width: 0, height: 0 }}
                            autoFocus={true}
                            clearTextOnFocus={true}
                            placeholder="Barcode"
                            placeholderTextColor="#003f5c"
                            onChangeText={(text) => sendQR(text)}
                            value={QR}
                            ref={ref_input}
                            showSoftInputOnFocus={false} />

                    </ImageBackground>
                </Modal>
            </Portal>
        )
    }

    return (
        <NavigationContainer
            initialState={Profile.state}
            onStateChange={(state) => { //console.log(state),
                setAppState(state)
            }}
        >
            <StatusBar />
            <RootNavigator props={props} />
        </NavigationContainer>
    );
}



const DeliveryNoteTitle = (JobID, icon, style) => {
    return (
        <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", height: 113, paddingTop: 30, }}>
            <Avatar.Icon size={38} icon={icon} iconColor="white" style={[style, { marginRight: 15 }]} />
            <Title style={{ textAlign: 'left', color: '#fff', display: "flex", }}>Job #{JobID}</Title>

        </View>)
}

const DeliveryTitle = (company, plate, author) => {
    return (
        <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: 113, paddingTop: 30, }}>
            <Title style={{ textAlign: 'center', color: '#fff'}}>{company}</Title>
       </View>)
}



const HomeIcon = (navigation) => {
    return (
        <IconButton icon="apps" animated style={styles.menuIcon} size={36} iconColor="white" onPress={() => navigation.props.navigate('Home')} />
    );
}
const burgerOptions = ({ navigation }) => (
    {
        headerShown: true,
        headerLeft: () => <HomeIcon props={navigation} />,
    })


const FeedbackTitle = () => {
    return (
        <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: 113, }}>
            <Title style={{ textAlign: 'left', color: '#fff', display: "flex", marginTop: 40, }}>Feedback</Title>
            {/* <Subheading style={{ textAlign: 'left', color: '#fff', display:"flex" }}>{Profile.date}</Subheading> */}
        </View>)
}


const FeedbackOptions = ({ navigation }) => (
    {
        headerShown: true,
        headerLeft: () => <HomeIcon props={navigation} />,
        headerTitle: FeedbackTitle,
    })




const jobsTitle = () => {
    const { Profile } = React.useContext(AuthContext);
    const headerHeight = 113;
    return (
        <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: 113, }}>
            <Title style={{ textAlign: 'left', color: '#fff', display: "flex", marginTop: 40, }}>Jobs</Title>
            {/* <Subheading style={{ textAlign: 'left', color: '#fff', display:"flex" }}>{Profile.date}</Subheading> */}
        </View>)
}


const inventoryTitle = () => {
    const { Profile } = React.useContext(AuthContext);
    const headerHeight = 113;
    return (
        <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: 113, }}>
            <Title style={{ textAlign: 'left', color: '#fff', display: "flex", marginTop: 40, }}>Supervisors</Title>
            {/* <Subheading style={{ textAlign: 'left', color: '#fff', display:"flex" }}>{Profile.date}</Subheading> */}
        </View>)
}

const ManagerTitle = () => {
    const { Profile } = React.useContext(AuthContext);
    const headerHeight = 113;
    return (
        <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: 113, }}>
            <Title style={{ textAlign: 'left', color: '#fff', display: "flex", marginTop: 40, }}>Managers</Title>
            {/* <Subheading style={{ textAlign: 'left', color: '#fff', display:"flex" }}>{Profile.date}</Subheading> */}
        </View>)
}


const reportsTitle = () => {
    const { Profile } = React.useContext(AuthContext);
    const headerHeight = 113;
    return (
        <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: 113, }}>
            <Title style={{ textAlign: 'left', color: '#fff', display: "flex", marginTop: 40, }}>Reports</Title>
            {/* <Subheading style={{ textAlign: 'left', color: '#fff', display:"flex" }}>{Profile.date}</Subheading> */}
        </View>)
}
const damagesTitle = () => {
    const { Profile } = React.useContext(AuthContext);
    const headerHeight = 113;
    return (
        <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: 113, }}>
            <Title style={{ textAlign: 'left', color: '#fff', display: "flex", marginTop: 40, }}>Damage Report</Title>
            {/* <Subheading style={{ textAlign: 'left', color: '#fff', display:"flex" }}>{Profile.date}</Subheading> */}
        </View>)
}

const closedJobsTitle = () => {
    const { Profile } = React.useContext(AuthContext);
    const headerHeight = 113;
    return (
        <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: 113, }}>
            <Title style={{ textAlign: 'left', color: '#fff', display: "flex", marginTop: 40, }}>Closed Jobs</Title>
            {/* <Subheading style={{ textAlign: 'left', color: '#fff', display:"flex" }}>{Profile.date}</Subheading> */}
        </View>
        )
}
const outgoingItemsTitle = () => {
    const { Profile } = React.useContext(AuthContext);
    const headerHeight = 113;
    return (
        <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: 113, }}>
            <Title style={{ textAlign: 'left', color: '#fff', display: "flex", marginTop: 40, }}>Outgoing Items</Title>
            {/* <Subheading style={{ textAlign: 'left', color: '#fff', display:"flex" }}>{Profile.date}</Subheading> */}
        </View>)
}

const CourierCollectionTitle = () => {
    const headerHeight = 113;
    return (
        <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: 113, }}>
            <Title style={{ textAlign: 'left', color: '#fff', display: "flex", marginTop: 60, }}>Courier Collections</Title>
        </View>)
}

const jobScreenHeaderOptions = ({ navigation }) => (
    {
        headerShown: true,
        headerLeft: () => <HomeIcon props={navigation} />,
        headerTitle: jobsTitle,
    })


    const StockTakeBackIcon = ({navigation, route}) => {
        return (
            <IconButton icon="arrow-left" animated style={styles.menuIcon} size={20} iconColor="white" onPress={() => navigation.reset({
                index: 1,
                routes: [
                    {name: 'Stock Take Home' },
                ],
                })} />
        );
    }
    const DamageBackIcon = ({navigation, route}) => {
        return (
            <IconButton icon="arrow-left" animated style={styles.menuIcon} size={20} iconColor="white" onPress={() => navigation.reset({
                index: 1,
                routes: [
                    {name: 'Damage Report' },
                ],
                })} />
        );
    }
    const stockTakeItemScreenHeaderOptions = ({ navigation, route }) => (
        {
            headerShown: true,
            headerLeft: () => <StockTakeBackIcon navigation={navigation} route={route}/>,
            headerBackVisible:false,
            animationEnabled:false
        })
        const damageItemScreenHeaderOptions = ({ navigation, route }) => (
            {
                headerShown: true,
                headerLeft: () => <DamageBackIcon navigation={navigation} route={route}/>,
                headerBackVisible:false,
                animationEnabled:false
            })


const closedJobsScreenHeaderOptions = ({ navigation }) => (
    {
        headerShown: false,
        headerLeft: () => <HomeIcon props={navigation} />,
        headerTitle: closedJobsTitle,
    })

const outgoingItemsScreenHeaderOptions = ({ navigation }) => (
    {
        headerShown: true,
        headerLeft: () => <HomeIcon props={navigation} />,
        headerTitle: outgoingItemsTitle,
    })

    const courierCollectionScreenHeaderOptions = ({ navigation }) => (
        {
            headerShown: true,
            headerLeft: () => <HomeIcon props={navigation} />,
            headerTitle: CourierCollectionTitle,
        })

const inventoryScreenHeaderOptions = ({ navigation }) => (
    {
        headerShown: true,
        headerLeft: () => <HomeIcon props={navigation} />,
        headerTitle: inventoryTitle,
    })

    const ManagerScreenHeaderOptions = ({ navigation }) => (
        {
            headerShown: true,
            headerLeft: () => <HomeIcon props={navigation} />,
            headerTitle: ManagerTitle,
        })


const reportsScreenHeaderOptions = ({ navigation }) => (
    {
        headerShown: true,
        //headerLeft: () => <HomeIcon props={navigation} />,
        headerTitle: reportsTitle,
    })

    const damagesScreenHeaderOptions = ({ navigation }) => (
        {
            headerShown: true,
            //headerLeft: () => <HomeIcon props={navigation} />,
            headerTitle: damagesTitle,
        })


const barcodeTitle = () => {
    const headerHeight = 113;
    return (
        <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: 113, }}>
            <Title style={{ textAlign: 'left', color: '#fff', display: "flex", marginTop: 40, }}>Product</Title>
            {/* <Subheading style={{ textAlign: 'left', color: '#fff', display:"flex" }}>{Profile.date}</Subheading> */}
        </View>)
}

const barcodeScreenHeaderOptions = ({ navigation }) => (
    {
        headerShown: true,
        headerTitle: barcodeTitle,
    })



const headerRight = () => {
    const { Profile, wifiState } = React.useContext(AuthContext);
    const [batteryLevel, setBatteryLevel] = useState()
    const [wifiIcon, setWifiIcon] = React.useState(false)
    const [wifiColour, setWifiColour] = React.useState(0)



    React.useEffect(() => {
        async () => {
            try {
                const batteryLevelAsync = await Battery.getBatteryLevelAsync();
                if (batteryLevelAsync) {
                    let simplifiedBattery = (batteryLevelAsync.toFixed(2))
                    simplifiedBattery = simplifiedBattery * 100
                    setBatteryLevel(simplifiedBattery)
                }
            } catch (e) {
                // handle or log error
            }
        }
    }, [])

    React.useEffect(() => {
        setWifiIcon(wifiState.wifiIcon)
        setWifiColour(wifiState.wifiColour)
    }, [wifiState])



    return (
        <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignContent: "flex-end", height: 113, marginRight: 10, }}>
            <Subheading style={{ textAlign: 'right', color: '#fff' }}>{Profile.name}</Subheading>
            <Caption style={{ textAlign: 'right', color: '#fff' }}>{Profile.familiarName}</Caption>
            {Profile.adminMode && <Caption style={{ textAlign: 'right', color: 'lime' }}>Admin mode on!</Caption>}
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                <MaterialCommunityIcons style={{ textAlign: 'right' }} name={wifiIcon} size={20} color={wifiColour} />
                {batteryLevel <= 10 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery-10" size={20} color={"#ff0000"} />
                }
                {batteryLevel <= 20 && batteryLevel > 10 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery-20" size={20} color={"#fa0000"} />
                }
                {batteryLevel <= 30 && batteryLevel > 20 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery-30" size={20} color={"#f94700"} />
                }
                {batteryLevel <= 40 && batteryLevel > 30 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery-40" size={20} color={"#f26c00"} />
                }
                {batteryLevel <= 50 && batteryLevel > 40 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery-50" size={20} color={"#e68a00"} />
                }
                {batteryLevel <= 60 && batteryLevel > 50 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery-60" size={20} color={"#d5a500"} />
                }
                {batteryLevel <= 70 && batteryLevel > 60 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery-70" size={20} color={"#bebe00"} />
                }
                {batteryLevel <= 80 && batteryLevel > 70 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery-80" size={20} color={"#a0d500"} />
                }
                {batteryLevel <= 90 && batteryLevel > 80 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery-90" size={20} color={"#75eb00"} />
                }
                {batteryLevel <= 100 && batteryLevel > 90 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery" size={20} color={"#00ff00"} />
                }
            </View>
        </View>
    )
}


const headerRightInline = () => {
    const { Profile, wifiState } = React.useContext(AuthContext);
    const headerHeight = 113;
    const [batteryLevel, setBatteryLevel] = useState()
    const [wifiIcon, setWifiIcon] = React.useState(false)
    const [wifiColour, setWifiColour] = React.useState(0)
    const getBatteryLevel = async () => {
        try {
            const batteryLevelAsync = await Battery.getBatteryLevelAsync();
            if (batteryLevelAsync) {
                let simplifiedBattery = (batteryLevelAsync.toFixed(2))
                simplifiedBattery = simplifiedBattery * 100
                setBatteryLevel(simplifiedBattery)
            }
        } catch (e) {
            // handle or log error
        }
    }


    React.useEffect(() => {
        getBatteryLevel();
    }, [])

    React.useEffect(() => {
        setWifiIcon(wifiState.wifiIcon)
        setWifiColour(wifiState.wifiColour)
    }, [wifiState])



    return (
        <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignContent: "flex-end", marginRight: 10, }}>
            {Profile.adminMode && <Caption style={{ textAlign: 'right', color: 'lime' }}>Admin mode on!</Caption>}
            <View style={{ display: "flex", flexDirection: "column" }}>
                <Subheading style={{ textAlign: 'right', color: '#fff' }}>{Profile.name}</Subheading>
                <Caption style={{ textAlign: 'right', color: '#fff' }}>{Profile.familiarName}</Caption>
            </View>

            <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center", marginLeft: 10 }}>
                <MaterialCommunityIcons style={{ textAlign: 'right' }} name={wifiIcon} size={20} color={wifiColour} />
                {batteryLevel <= 10 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery-10" size={20} color={"#ff0000"} />
                }
                {batteryLevel <= 20 && batteryLevel > 10 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery-20" size={20} color={"#fa0000"} />
                }
                {batteryLevel <= 30 && batteryLevel > 20 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery-30" size={20} color={"#f94700"} />
                }
                {batteryLevel <= 40 && batteryLevel > 30 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery-40" size={20} color={"#f26c00"} />
                }
                {batteryLevel <= 50 && batteryLevel > 40 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery-50" size={20} color={"#e68a00"} />
                }
                {batteryLevel <= 60 && batteryLevel > 50 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery-60" size={20} color={"#d5a500"} />
                }
                {batteryLevel <= 70 && batteryLevel > 60 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery-70" size={20} color={"#bebe00"} />
                }
                {batteryLevel <= 80 && batteryLevel > 70 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery-80" size={20} color={"#a0d500"} />
                }
                {batteryLevel <= 90 && batteryLevel > 80 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery-90" size={20} color={"#75eb00"} />
                }
                {batteryLevel <= 100 && batteryLevel > 90 &&
                    <MaterialCommunityIcons style={{ textAlign: 'right' }} name="battery" size={20} color={"#00ff00"} />
                }
            </View>
        </View>
    )
}

const headerLeftLogo = () => {
    const headerHeight = 113;
    const windowWidth = Dimensions.get('window').width;
    return (
        <Image
            style={{ height: headerHeight - 60, width: 200 }}
            source={require('../assets/logo-ewistore-main.png')}
            resizeMode={"contain"}
        />
    )
}



const RootStack = createStackNavigator();
function RootNavigator() {

    const [isLoading, setIsLoading] = React.useState(false);
    const { Profile } = useContext(AuthContext)



    return (
        <RootStack.Navigator screenOptions={{headerMode:false}}>
            {(isLoading) ? (
                <RootStack.Screen
                    name="Splash"
                    component={Splash}
                    options={{
                        animationEnabled: true,
                        headerShown: false
                    }}
                />
            ) :
                (Profile.userToken && Profile.jwt) ? (
                    <RootStack.Screen
                        name="App"
                        component={HomeStackScreen}
                        options={{
                            animationEnabled: true
                        }}
                    />
                ) : (
                    <RootStack.Screen
                        name="Auth"
                        component={AuthStackScreen}
                        options={{
                            animationEnabled: false,
                            headerShown: false
                        }}
                    />
                )
            }

        </RootStack.Navigator>
    );
}

const AuthStack = createStackNavigator();
const AuthStackScreen = () => (
    <AuthStack.Navigator>
        <AuthStack.Screen
            name="SignIn"
            component={SignIn}
            options={{ headerShown: false }}
        />
    </AuthStack.Navigator>
);



const ShiftTabs = createMaterialBottomTabNavigator();
const MyShiftTabs = () => {
    const { colors } = useTheme();
    
const theme = useTheme();
theme.colors.secondaryContainer = "transperent"

    return (
        <ShiftTabs.Navigator screenOptions={{
            unmountOnBlur: true,
        }}
            initialRouteName="My Shift"
            activeColor={"#FFFFFF"}
            inactiveColor={"#ccc"}
            compact={false}
            barStyle={{ backgroundColor: colors.primary, height:70 }}
            shifting={true}
        >
            <ShiftTabs.Screen name="My Shift" component={MyShiftScreen}
                options={{
                    tabBarLabel: 'My Shift',
                    
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account-clock" color={color} size={22}/>
                    ),
                    tabBarColor: colors.primary
                }}
            />
            <ShiftTabs.Screen name="Schedule" component={ConstructionScreen}
                options={{
                    tabBarLabel: 'Schedule',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="calendar-month" color={color} size={22} />
                    ),
                    tabBarColor: "orange"
                }}
            />
            <ShiftTabs.Screen name="Time Off" component={HolidayScreen}
                options={{
                    tabBarLabel: 'Time Off',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="airplane-takeoff" color={color} size={22}/>
                    ),
                    tabBarColor: "green"
                }}
            />
        </ShiftTabs.Navigator>
    );
}


const DeliveriesStack = createStackNavigator();
const DeliveriesStackScreen = () => {
    const { header } = useTheme();
    return (
        <DeliveriesStack.Navigator initialRouteName="Deliveries" screenOptions={{
            headerShown: true,
            headerTransparent: true,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            animationEnabled: true,
            headerStyle: header.headerStyle,
            headerTintColor: header.headerTintColor,
            headerTitleStyle: header.headerTitleStyle,
            headerBackground: header.background,
            headerRight: headerRight,
        }}>
            <DeliveriesStack.Screen name="Deliveries" component={Deliveries}/>
            <DeliveriesStack.Screen name="Delivery" component={Delivery}  options={
                ({ route }) => ({
                    title: DeliveryTitle(route.params.company, route.params.plate, route.params.author),
                })
            }/>
        </DeliveriesStack.Navigator>
    )
};



const JobStack = createStackNavigator();
const JobStackScreen = () => {
    const { header } = useTheme();
    return (
        <JobStack.Navigator initialRouteName="Jobs" screenOptions={{
            headerShown: true,
            headerTransparent: true,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            animationEnabled: true,
            headerStyle: header.headerStyle,
            headerTintColor: header.headerTintColor,
            headerTitleStyle: header.headerTitleStyle,
            headerBackground: header.background,
            headerRight: headerRight,
        }}>
            <JobStack.Screen name="Jobs" component={JobsScreen} options={jobScreenHeaderOptions} />
            <JobStack.Screen name="Delivery Notes" component={DeliveryNoteScreen} options={
                ({ route }) => ({
                    title: DeliveryNoteTitle(route.params.jobID, route.params.icon, route.params.style),
                })
            }
            />
            <JobStack.Screen name="Items" component={ItemsScreen} />
            <JobStack.Screen name="Barcode" component={BarcodeScreen} options={barcodeScreenHeaderOptions} />
            <JobStack.Screen name="Camera" component={CameraScreen} />
        </JobStack.Navigator>
    )
};


const HomeStack = createStackNavigator();
const HomeStackScreen = () => {
    const { header } = useTheme();
    return (
        <HomeStack.Navigator initialRouteName="Home" screenOptions={{
            headerShown: false,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            animationEnabled: true,
            headerTransparent: true,
            headerStyle: header.headerStyle,
            headerTintColor: header.headerTintColor,
            headerTitleStyle: header.headerTitleStyle,
            headerBackground: header.background,
            headerRight: headerRight,
            headerLeft: headerLeftLogo,
            title: "",
        }} >
            <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: true, }} />
            <HomeStack.Screen name="JobStack" component={JobStackScreen} />
            <HomeStack.Screen name="Supervisors" component={InventoryStackScreen} />
            <HomeStack.Screen name="Managers" component={ManagerStackScreen} />
            <HomeStack.Screen name="Profile" component={Profile} options={burgerOptions} />
            <HomeStack.Screen name="Quality Control" component={QualityControl} options={burgerOptions} />
            <HomeStack.Screen name="Collections" component={Collections} options={burgerOptions} />
            <HomeStack.Screen name="DeliveriesStack" component={DeliveriesStackScreen} />
            <HomeStack.Screen name="Courier Collection" component={CourierCollectionScreen} options={courierCollectionScreenHeaderOptions} />
            <HomeStack.Screen name="Feedback" component={Feedback} options={FeedbackOptions} />
            <HomeStack.Screen name="My Shift Tabs" component={MyShiftTabs} options={
                ({ navigation }) => ({
                    headerShown: true,
                    headerLeft: () => <HomeIcon props={navigation} />,
                    headerStyle: header.headerStyleSmall,
                    headerBackground: header.backgroundSmall,
                    headerRight: headerRightInline,
                })
            } />
            <HomeStack.Screen name="User Details" component={UserDetailsScreen} options={
                ({ navigation }) => ({
                    headerShown: true,
                    headerLeft: () => <HomeIcon props={navigation} />,
                    headerStyle: header.headerStyleSmall,
                    headerBackground: header.backgroundSmall,
                    headerRight: headerRightInline,
                })
            }  />
        </HomeStack.Navigator>
    )
};


const StockTakeStack = createStackNavigator();
const StockTakeStackScreen = () => {
    const { header } = useTheme();
    return (
        <StockTakeStack.Navigator initialRouteName="Stock Take Home" screenOptions={{
            headerShown: false,
            headerTransparent: true,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            animationEnabled: true,
            headerStyle: header.headerStyle,
            headerTintColor: header.headerTintColor,
            headerTitleStyle: header.headerTitleStyle,
            headerBackground: header.background,
            headerRight: headerRight,
        }} >
            <StockTakeStack.Screen name="Stock Take Home" component={StockTakeHomeScreen} options={{ headerShown: true,animationEnabled:false }} />
            <StockTakeStack.Screen name="Stock Take Find" component={StockTakeFindScreen} options={{ headerShown: true,animationEnabled:false }} />
            <StockTakeStack.Screen name="Stock Take Item" component={StockTakeItemScreen} options={stockTakeItemScreenHeaderOptions}   />
            <StockTakeStack.Screen name="Stock Take Missing" component={StockTakeMissingScreen} options={{ headerShown: true,animationEnabled:false }} />            
        </StockTakeStack.Navigator>
    )
};

const ManagerStack = createStackNavigator();
const ManagerStackScreen = () => {
    const { header } = useTheme();
    return (
        <ManagerStack.Navigator initialRouteName="Manager" screenOptions={{
            headerShown: true,
            headerTransparent: true,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            animationEnabled: true,
            headerStyle: header.headerStyle,
            headerTintColor: header.headerTintColor,
            headerTitleStyle: header.headerTitleStyle,
            headerBackground: header.background,
            headerRight: headerRight,
        }} >
            <ManagerStack.Screen name="Manager" component={ManagerHomeScreen} options={ManagerScreenHeaderOptions} />
            <ManagerStack.Screen name="Stock Take" component={StockTakeStackScreen} options={{ headerShown: false}} />
        </ManagerStack.Navigator>
    )
};

const InventoryStack = createStackNavigator();
const InventoryStackScreen = () => {
    const { header } = useTheme();
    return (
        <InventoryStack.Navigator initialRouteName="Home" screenOptions={{
            headerShown: true,
            headerTransparent: true,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            animationEnabled: true,
            headerStyle: header.headerStyle,
            headerTintColor: header.headerTintColor,
            headerTitleStyle: header.headerTitleStyle,
            headerBackground: header.background,
            headerRight: headerRight,
        }} >
            <InventoryStack.Screen name="Inventory" component={InventoryHomeScreen} options={inventoryScreenHeaderOptions} />
            <InventoryStack.Screen name="Find Item" component={FindItemScreen} options={{ headerShown: true, }} />
            <InventoryStack.Screen name="Assign Barcode" component={AssignBarcodeScreen} options={{ headerShown: true, }} />
            <InventoryStack.Screen name="Stock Take Find" component={StockTakeFindScreen} options={{ headerShown: true,animationEnabled:false }} />
            <InventoryStack.Screen name="Stock Take Item" component={StockTakeItemScreen} options={stockTakeItemScreenHeaderOptions}
            />
            <InventoryStack.Screen name="Reports Home" component={ReportsStackScreen} options={reportsScreenHeaderOptions} />
            <InventoryStack.Screen name="Damage Report" component={DamageFindScreen} options={damagesScreenHeaderOptions} />
            <InventoryStack.Screen name="Damage Item" component={DamageItemScreen} options={damageItemScreenHeaderOptions} />
            <InventoryStack.Screen name="Damage Camera" component={CameraDamageScreen} options={damagesScreenHeaderOptions} />
        </InventoryStack.Navigator>
    )
};

const ReportsStack = createStackNavigator();
const ReportsStackScreen = () => {
    const { header } = useTheme();
    return (
        <ReportsStack.Navigator initialRouteName="Reports Menu" screenOptions={{
            headerShown: true,
            headerTransparent: true,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            animationEnabled: true,
            headerStyle: header.headerStyle,
            headerTintColor: header.headerTintColor,
            headerTitleStyle: header.headerTitleStyle,
            headerBackground: header.background,
            headerRight: headerRight,
        }}>
            <ReportsStack.Screen name="Reports Menu" component={ReportsHomeScreen} options={reportsScreenHeaderOptions} />
            <ReportsStack.Screen name="Closed Jobs" component={ClosedJobStackScreen} options={closedJobsScreenHeaderOptions} />
            <ReportsStack.Screen name="Outgoing Items" component={OutgoingItemsScreen} options={outgoingItemsScreenHeaderOptions} />
        </ReportsStack.Navigator>
    )
};

const ClosedJobStack = createStackNavigator();
const ClosedJobStackScreen = () => {
    const { header } = useTheme();
    return (
        <ClosedJobStack.Navigator initialRouteName="Reports" screenOptions={{
            headerShown: true,
            headerTransparent: true,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            animationEnabled: true,
            headerStyle: header.headerStyle,
            headerTintColor: header.headerTintColor,
            headerTitleStyle: header.headerTitleStyle,
            headerBackground: header.background,
            headerRight: headerRight,
        }}>
            <ClosedJobStack.Screen name="Reports" component={ReportsScreen} options={closedJobsScreenHeaderOptions} />
        </ClosedJobStack.Navigator>
    )
};

const OutgoingItemsStack = createStackNavigator();
const OutgoingItemsStackScreen = () => {
    const { header } = useTheme();
    return (
        <OutgoingItemsStack.Navigator initialRouteName="Reports" screenOptions={{
            headerShown: true,
            headerTransparent: true,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            animationEnabled: true,
            headerStyle: header.headerStyle,
            headerTintColor: header.headerTintColor,
            headerTitleStyle: header.headerTitleStyle,
            headerBackground: header.background,
            headerRight: headerRight,
        }}>
            <OutgoingItemsStack.Screen name="Outgoing Items" component={OutgoingItemsScreen} options={outgoingItemsScreenHeaderOptions} />
        </OutgoingItemsStack.Navigator>
    )
};