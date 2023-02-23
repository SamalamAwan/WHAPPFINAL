import React from "react";
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Image, ImageBackground } from "react-native";
import { ScreenContainer } from '../ScreenContainer'
import styles from '../styles'
import { Title, Surface, Text, Card, Paragraph, Avatar, Appbar, Snackbar, Button, useTheme, List, TextInput, Subheading, Headline, IconButton, FAB, Portal, Dialog, Modal, ActivityIndicator, Caption } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from "../context";
import { apiKey } from "../context";
import { useContext, useState, useRef } from "react";
import { BarcodeModal } from "./barcodeModal";
import { Dimensions } from 'react-native';
import { Splash } from './splash'
import { useFocusEffect } from '@react-navigation/native';
import { Profile } from "./profile";
import { AirbnbRating } from 'react-native-ratings';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;


const DNBanner = (props) => {
  const [note, setNote] = useState(props.props.note)
  const [courier, setCourier] = useState(props.props.courier)
  const [courierConsNo, setCourierConsNo] = useState(props.props.courierConsNo)
  const [date, setDate] = useState(props.props.date)
  const [label, setLabel] = useState(props.props.label)
  const [labelColour, setLabelColour] = useState(props.props.labelColour)
  const [packerName, setPackerName] = useState(props.props.packerName)
  const [driverName, setDriverName] = useState(props.props.driver.name)
  const { colors } = useTheme();
  React.useEffect(() => {
    setLabel(props.props.label)
    setLabelColour(props.props.labelColour)
    setDate(props.props.date)
    setCourier(props.props.courier)
    setNote(props.props.note)
    setPackerName(props.props.packerName)
    setDriverName(props.props.driver.name)
  }, [props])

  return (
    <Surface style={{ flexDirection: "row", justifyContent: "flex-start", padding: 15, width: windowWidth, backgroundColor: colors.notesBG, marginBottom: 1 }}>
      <View style={{ flex: 5 }}>
        <Subheading style={{ fontWeight: "bold", marginTop: 0, color: "#000000" }}>Notes</Subheading >
        <Paragraph style={{ color: "#000000" }}>{note}</Paragraph>
      </View>
      <View style={{ flex: 3, justifyContent: "space-between" }}>
        <Text style={{ textAlign: "right", fontSize: 15, color: labelColour, fontWeight: "bold" }}>{label}</Text>
        <Text style={{ textAlign: "right", fontSize: 9, color: colors.primary, fontWeight: "bold" }}>{packerName}</Text>
        <Text style={{ textAlign: "right", fontSize: 12, color: "#000000" }}>{courier}</Text >
        {driverName != "" && <Text style={{ textAlign: "right", fontSize: 9, color: "#000000" }}>{driverName}</Text >}
        {courierConsNo != null && <Text style={{ textAlign: "right", fontSize: 9, color: "#000000" }}>{courierConsNo}</Text >}

        <Text style={{ textAlign: "right", fontSize: 12, color: "#000000" }}>{date}</Text>
      </View>
    </Surface>
  )
}




const Comment = ({ initialComment, jobID }) => {
  const { colors } = useTheme();
  const { Profile } = useContext(AuthContext);
  const [currentJob, setJob] = useState(jobID)
  const [comment, setComment] = useState(initialComment ? initialComment : '')

  const updateComment = (comment) => {
    let apikey = apiKey
    if (Profile.jwt != null) {
      let authGet = apikey + " " + Profile.jwt
      let data = {
        method: 'POST',
        mode: "cors", // no-cors, cors, *same-origin *=default
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authGet
        },
        body: JSON.stringify({ "action": "updatePackerJobComment", "consignmentID": currentJob, "comment": comment })
      };
      return fetch('https://api-veen-e.ewipro.com/v1/jobs/', data)
        .then((response) => {
          if (!response.ok) throw new Error(response.status);
          else return response.json();
        })
        .then((responseData) => {
          alert("Comment Updated.")
        })
        .catch((error) => {
          alert(error)
        });
    }
  }

  const [visible, setVisible] = React.useState(false);
  const onToggleSnackBar = () => setVisible(!visible);
  const onDismissSnackBar = () => setVisible(false);

  return (

    <KeyboardAvoidingView style={{ width: windowWidth - 10, padding: 20, margin: 5, backgroundColor: colors.accordionBG }} behavior={"padding"}>
      <Subheading style={{ alignSelf: "flex-start", color: "#000000" }}>Your comment</Subheading>
      <View style={{ display: "flex", flexDirection: "row" }}>
        <TextInput outlineColor={"#000000"} style={{ flex: 1 }} dense={true} label={"Comments"} mode={"outlined"} placeholder={"Type your comment here..."} multiline={true} value={comment} onChangeText={text => setComment(text)} />
        <IconButton
          icon="message-plus"
          style={{ backgroundColor: colors.primary }}
          color={"#FFFFFF"}
          iconColor={"#FFFFFF"}
          size={20}
          onPress={() => updateComment(comment)}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

const PhotoImage = (currentUrl) => {
  const [url, setUrl] = React.useState(currentUrl.props.url)
  return (
    <ImageBackground source={require('../assets/imageload.png')} style={styles.photoBGimage}>
      <Image style={{ width: 50, height: 50, margin: 2 }}
        resizeMode="cover"
        source={{
          uri: url,
        }} />
    </ImageBackground>
  )
}

const Photos = ({ navigation, jobID, sendJobIDforPhotos, sendPhotoToModal }) => {
  const { colors } = useTheme();
  const [photos, setPhotos] = React.useState(null)
  const [photosArray, setPhotosArray] = React.useState(null)
  const { Profile, updateAuthGlobal } = React.useContext(AuthContext);




  React.useEffect(() => {
    sendJobIDforPhotos(Profile.jwt, jobID).then((result) => setPhotosArray(result))
  }, [jobID, Profile, sendJobIDforPhotos])


  React.useEffect(() => {
    if (photosArray != null) {
      let photoArray = photosArray
      let photos = Object.keys(photoArray).map(key => (
        <TouchableOpacity key={key} onPress={() => sendPhotoToModal(photoArray[key].url)}>
          <PhotoImage key={key} props={photoArray[key]} />
        </TouchableOpacity>
      ))
      setPhotos(photos)
    }
  }, [photosArray])

  return (
    <View style={{ width: windowWidth, display: "flex", flexDirection: "row", flexWrap: "wrap", padding: 10, }}>
      {photos}
    </View>
  )
}





const BottomBar = ({ labelPDF, navigation, jobID, status, total, completed, needsScan, confirmDrop, dropLoading, isFromStockControl }) => {
  const { Profile } = React.useContext(AuthContext);
  const [visible, setVisible] = React.useState(false);
  const [showPrint, setShowPrint] = React.useState(needsScan && labelPDF)
  const [isLoading, setIsLoading] = React.useState(false);
  const {colors} = useTheme();
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: 'white', padding: 20 };

  const ref_input = useRef();
  const [Barcode, setBarcode] = useState('');

  const success = (data) => {
    setVisible(false)
    setIsLoading(false)
  }

  const printLabel = (barcode) => {
    setIsLoading(true)
    let barcodeInt = parseInt(barcode)
    let JobIDInt = parseInt(jobID)
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
        "action": "printLabel",
        "printerBarcode": barcodeInt,
        "documentID": JobIDInt
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/jobs/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        if (responseData.status == true) {
          if (responseData.data.jobStatus == "True") {
            alert("Print sent")
          }
          else {
            alert("Print Failed")
          }
        }
        else {
          alert("Print Failed")
        }
        success()
      })
      .catch((error) => {
        alert(error)
        success()
      });

  }

  return (
    <View style={[styles.bottom, { width: windowWidth }]}>
      {!isFromStockControl && <Appbar style={styles.bottom}>
        {showPrint && <View style={{ justifyContent: "flex-end"}}>
          <TouchableOpacity onPress={() => showModal()} style={{marginHorizontal:10}}>
            <Appbar.Action
              icon="printer-wireless"
              style={{ margin: 0, textAlign: "center", alignSelf: "center", justifyContent: "flex-end" }}
              iconColor={"#0078d7"}
            />
            <Caption style={{ color: "#333", textAlign: "center",marginTop:-5 }}>Print Label</Caption>
          </TouchableOpacity>
        </View>}
        <TouchableOpacity onPress={() => navigation.navigate('Camera', { jobID, isFromStockControl })} style={{marginHorizontal:10}}>
          <View style={{ justifyContent: "flex-end", marginHorizontal: 10 }}>
            <Appbar.Action
              style={{ margin: 0, textAlign: "center", alignSelf: "center", justifyContent: "flex-end" }}
              icon="camera-plus"
              iconColor={"#0078d7"}
            />
            <Caption style={{ color: "#333", textAlign: "center",marginTop:-5 }}>Add Photos</Caption>
          </View>
        </TouchableOpacity>
        <View style={{flex:1}}>
          <Text style={{ textAlign: "center", fontWeight:"bold", fontSize:26 }}>{total ? completed + "/" + total : 'No Items'}</Text>
          <Text style={{ textAlign: "center" }}>{total ? total == completed ? 'Complete the job.' : 'Complete' : ''}</Text>
        </View>
        <TouchableOpacity onPress={() => confirmDrop()} style={{marginHorizontal:10}}>
          <View style={{ justifyContent: "flex-end", marginHorizontal: 10 }}>
            {dropLoading && <ActivityIndicator animating={true} size="small" iconColor="white" />}
            {!dropLoading &&
              <Appbar.Action
                style={{ margin: 0, textAlign: "center", alignSelf: "center", justifyContent: "flex-end" }}
                icon="cancel"
                iconColor={"red"}
              />}
            <Caption style={{ color: "#333", textAlign: "center",marginTop:-5 }}>Drop Job</Caption>
          </View>
        </TouchableOpacity>
      </Appbar>}


      {isFromStockControl && <Appbar style={styles.bottom}>
        <TouchableOpacity onPress={() => navigation.navigate('Camera', { jobID, isFromStockControl })}>
          <View style={{ justifyContent: "flex-end", marginHorizontal: 10 }}>
            <Appbar.Action
              style={{ margin: 0, textAlign: "center", alignSelf: "center", justifyContent: "flex-end" }}
              icon="camera-plus"
              color="#000"
            />
            <Caption style={{ color: "#000", textAlign: "center" }}>STOCK CONTROL PHOTOS</Caption>
          </View>
        </TouchableOpacity>
      </Appbar>}



      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
          {!isLoading &&
            <View style={{ alignSelf: "center", alignContent: "center", display: "flex" }}><Subheading>Scan barcode located on printer now</Subheading>
              <MaterialCommunityIcons style={{ alignSelf: "center" }} name="barcode-scan" size={50} color="#0078D7" />
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
            onChangeText={(text) => printLabel(text)}
            value={Barcode}
            ref={ref_input}
            showSoftInputOnFocus={false} />
        </Modal>
      </Portal>
    </View>
  )
}


const DeliveryCard = (props) => {
  const [noteID, setNoteID] = useState(props.props.id)
  const [jobID, setJobID] = useState(props.jobID)
  const [jobDate, setJobDate] = useState(props.jobDate)
  const [tinted, setTinted] = useState(props.props.deliveryNoteTinted)
  const [tintingStarted, setTintingStarted] = useState(false)
  const [tinterName, setTinterName] = useState(props.tinter.name)
  const [isFromStockControl, setIsFromStockControl] = useState(props.isFromStockControl)
  const [itemsTotal, setItemsTotal] = useState();
  const [jobStatusColour, setJobStatusColour] = useState()
  const [itemsCompleteTotal, setItemsCompleteTotal] = useState();
  const { cards } = useTheme();
  const { Profile } = useContext(AuthContext)
  const [tintedColour, setTintedColour] = useState("white")
  const [canSee, setCanSee] = useState(false);

  React.useEffect(() => {
    let items = props.props.deliveryNotesLines
    let totalComplete = 0
    items.forEach(function (item) {
      item.pickedUp == "2" ? totalComplete++ : null;
    });
    setItemsCompleteTotal(totalComplete)
    if (props.props.deliveryNotesLines) {
      setItemsTotal(props.props.deliveryNotesLines.length)
    }
    switch (props.props.pickedUp) {
      case 0:
        setJobStatusColour("#fc0000")
        break;
      case 1:
        setJobStatusColour("#0078d7")
        break;
    }
    if (totalComplete == 0) {
      setJobStatusColour("red")
    }
    if (totalComplete == props.props.deliveryNotesLines.length) {
      setJobStatusColour("green")
    }
    else if (totalComplete > 0) {
      setJobStatusColour("orange")
    }

    let tintingStarted = false;
    if (props.props.deliveryNotesLines.find((e) => e.tinted)) {
      tintingStarted = true;
    } else {
      tintingStarted = false
    }
    setTintingStarted(tintingStarted)

  }, [props])




  const [visible, setVisible] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);
  const [tintingBarcode, setTintingBarcode] = React.useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: 'white', padding: 20 };

  const ref_input = useRef();
  const [Barcode, setBarcode] = useState('');

  const success = (data) => {
    setVisible(false)
    setIsLoading(false)
  }

  React.useEffect(() => {
    let deliveryNoteBarcode = noteID
    while (deliveryNoteBarcode.length < 10) {
      deliveryNoteBarcode = "0" + deliveryNoteBarcode
    }
    deliveryNoteBarcode = "11" + deliveryNoteBarcode;
    let code = deliveryNoteBarcode.split("");
    let i = 0;
    let codeOddsTotal = 0;
    let codeEvensTotal = 0;
    while (i < code.length) {
      let codeInt = parseInt(code[i])
      if (i % 2 == 1) {
        codeEvensTotal = codeEvensTotal + codeInt;
      }
      if (i % 2 == 0) {
        codeOddsTotal = codeOddsTotal + codeInt;
      }
      i++;
    }
    let codeTotal = codeOddsTotal + (codeEvensTotal * 3);
    let checksum = codeTotal % 10
    if (checksum != 0) {
      checksum = 10 - checksum
    }
    checksum = checksum.toString()
    deliveryNoteBarcode = deliveryNoteBarcode + checksum;
    setTintingBarcode(deliveryNoteBarcode)
  }, [noteID])



  React.useEffect(() => {
    if (tinted == false && !tintingStarted) {
      setTintedColour("red")
    }
    if (tinted == false && tintingStarted) {
      setTintedColour("orange")
    }
    if (tinted == true) {
      setTintedColour("green")
    }
  }, [tinted, tintingStarted])

  const testLabel = (barcode) => {
    setIsLoading(true)

    if (barcode == tintingBarcode) {
      alert("MATCH/////you scanned " + barcode + "////// Appside barcode : " + tintingBarcode)
    }
    else {
      alert("no match/////you scanned " + barcode + "////// Appside barcode : " + tintingBarcode)
    }

    success()
  }


  React.useEffect(() => {
    if (Profile.isSupervisor == "1" || Profile.isManager == "1" || Profile.adminMode){
      setCanSee(true)
    }
    else{
      setCanSee(false)
    }
  },[Profile.adminMode, Profile.isManager, Profile.isSupervisor])


  return (
    <View>
      <TouchableOpacity onPress={() => props.packer == Profile.id || Profile.adminMode || Profile.isSupervisor == "1" || Profile.isManager == "1" || isFromStockControl ? props.navigation.navigate('Items', { noteID, jobID, jobDate, tinted, tintingBarcode, isFromStockControl }) : null}>
      <Card style={cards.card}>
        <Card.Content style={[styles.cardsContent, { borderLeftColor: jobStatusColour }]}>
          <View style={{ flexDirection: "row", minWidth:"100%" }}>
            <Card.Title style={{ flex: 3 }} title={"Delivery Note #" + noteID} subtitleStyle={cards.subTitle} titleStyle={cards.title} subtitle={canSee ? itemsCompleteTotal + "/" + itemsTotal + " items complete" : ""} />
            <View style={{ marginHorizontal: 10, justifyContent: "center", alignItems: "center" }}>
              {tinted != null && tinterName != null && tinterName != "" && <Text style={{ fontSize: 10, color: tintedColour }}>{tinterName}</Text>}
              <MaterialCommunityIcons style={{ alignSelf: "flex-end", display: "flex" }} name="palette" size={35} color={tintedColour} />
            </View>
          </View>
          {/* <Card.Actions>
          <Button onPress={showModal}>Press (shows barcode and if you scan will alert if match)</Button>
        </Card.Actions>  */}

        </Card.Content>
      </Card>
      </TouchableOpacity> 
      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
          {!isLoading &&
            <View style={{ alignSelf: "center", alignContent: "center", display: "flex" }}><Subheading>Sams generated barcode: {tintingBarcode}</Subheading>
              <MaterialCommunityIcons style={{ alignSelf: "center" }} name="barcode-scan" size={50} color="#0078D7" />
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
            onChangeText={(text) => testLabel(text)}
            value={Barcode}
            ref={ref_input}
            showSoftInputOnFocus={false} />
        </Modal>
      </Portal>
    </View>
  )
};



const PickUpJobFAB = ({ pickUpLoading, startPickUpJob }) => {
  const { Profile, updateAuthGlobal } = useContext(AuthContext)
  const [shiftActive, setShiftActive] = React.useState(false)
  const checkIfClockedIn = React.useCallback(() => {
    let apikey = apiKey
    let jwt = Profile.jwt
    let authGet = apikey + " " + jwt
    let userID = Profile.id
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
        if (responseData.shiftActive) {
          setShiftActive(true)
        }
        else {
          setShiftActive(false)
        }
      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  }, [Profile.id, Profile.jwt, Profile.userName, Profile.userToken, Profile.userType, updateAuthGlobal])

  React.useEffect(() => {
    checkIfClockedIn()
  }, [checkIfClockedIn])

  return (
    <FAB
      style={Profile.adminMode ? styles.fabRaised : styles.fab}
      loading={pickUpLoading}
      color="#fff"
      label="Pick Up Job"
      icon="check"
      onPress={() => shiftActive ? startPickUpJob() : alert("Please clock in first using the My Shift page.")}
    />
  )
}

const SignQCFAB = ({ signQCFABLoading, startSignQC }) => {
  return (
    <FAB
      style={styles.fabRaised}
      loading={signQCFABLoading}
      color="#fff"
      label="Sign QC"
      icon="check"
      onPress={() => startSignQC()}
    />
  )
}


const CompleteJobFAB = ({ completeLoading, confirmComplete, totalDeliveryNotes, deliveryNotesCompleteTotal, noPhotosProp }) => {
  const [incomplete, setIncomplete] = useState(true);
  const [noPhotos, setNoPhotos] = useState(true);
  React.useEffect(() => {
    if (totalDeliveryNotes == deliveryNotesCompleteTotal) {
      setIncomplete(false)
    }
    else {
      setIncomplete(true)
    }
  }, [totalDeliveryNotes, deliveryNotesCompleteTotal])

  
  React.useEffect(() => {
    if (noPhotosProp != null) {
      setNoPhotos(noPhotosProp)
    }
  }, [noPhotosProp])
  return (
    <FAB
      style={incomplete ? styles.fabRaisedOrange : styles.fabRaised}
      loading={completeLoading}
      color="#fff"
      label={incomplete ? "Complete Job (!)" : "Complete Job"}
      icon={incomplete ? "check-underline" : "check"}
      onPress={() => noPhotos ? alert("Please add photos first.") : confirmComplete()}
    />
  )
}


const DropJobFAB = ({ dropLoading, confirmDrop }) => {
  return (
    <FAB
      style={styles.fabRaisedX}
      loading={dropLoading}
      color="#fff"
      label={"Drop Job"}
      icon={"cancel"}
      onPress={confirmDrop}
    />
  )
}


const PickUpJobDialog = ({ visible, hideDialog, jobID }) => {
  const { Profile, updateAuthGlobal } = React.useContext(AuthContext)
  const pickUpJob = () => {
    hideDialog()
    let apikey = apiKey
    let jwt = Profile.jwt
    let userID = Profile.id
    let authGet = apikey + " " + jwt
    let data = {
      method: 'POST',
      mode: "cors", // no-cors, cors, *same-origin *=default
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authGet
      },
      body: JSON.stringify({
        "action": "pickUpJob",
        "consignmentID": jobID,
        "userID": userID,
        //"keyNumber": keynumber
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/jobs/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return hideDialog()
      })
      .catch((error) => {
        if (error.message == "401") {
          updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
        }
      });
  }

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog}>
        <Dialog.Title>Pick up job?</Dialog.Title>
        <Dialog.Actions>
          <Button onPress={hideDialog}>No</Button>
          <Button onPress={() => pickUpJob()}>Yes</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}

const CompleteJobDialog = ({ visible, hideDialog, completeJob, courierConsNo, note }) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [notes, setNotes] = React.useState(note)
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const { Profile } = useContext(AuthContext);
  const ref_input5 = useRef();
  const checkBarcode = (barcode) => {
    console.log("scanned " + barcode)
    console.log("API barcode " + courierConsNo)
    setIsLoading(true)
    if (barcode.indexOf(courierConsNo.trim()) > -1) {
      completeJob(barcode)
    }
    else {
      alert("Barcode mismatch, scanned '" + barcode + "', needs to contain '" + courierConsNo + "'")
    }
    hideDialog()
    setIsLoading(false)
  }

  React.useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        ref_input5.current.focus()
      }, 100);
      return () => clearInterval(interval);
    }
  }, [visible])



  const containerStyle = { backgroundColor: 'white', padding: 20 };
  return (
    <Portal>
      <Modal visible={visible} onDismiss={hideDialog} contentContainerStyle={containerStyle}>
        {!isLoading &&
          <View style={{ alignSelf: "center", alignContent: "center", display: "flex" }}>
            {notes != "" && <View><Subheading style={{color:"red", textAlign:"center"}}>CHECK NOTES ON JOB BEFORE SCANNING COURIER LABEL</Subheading><Subheading>Notes:</Subheading><View style={{borderWidth:2, borderColor:"red", padding:5}}><Text>{notes}</Text></View></View>}
            <Subheading style={{textAlign:"center"}}>Once you have checked and confirmed everything is correct, please scan courier label to complete the job.</Subheading>
            <MaterialCommunityIcons style={{ alignSelf: "center" }} name="barcode-scan" size={100} color="#0078D7" />
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
          onChangeText={(text) => checkBarcode(text)}
          value={barcode}
          ref={ref_input5}
          showSoftInputOnFocus={false} />
      </Modal>
    </Portal>
  )
}

const ConfirmCompleteDialog = ({ visible, hideDialog, startCompleteJob }) => {
  const containerStyle = { backgroundColor: 'white', padding: 20 };
  return (
    <Portal>
      <Modal visible={visible} onDismiss={hideDialog} contentContainerStyle={containerStyle}>
        <Headline>Complete Job?</Headline>
        <Button onPress={() => startCompleteJob()}>Yes</Button>
        <Button onPress={() => hideDialog()}>No</Button>
      </Modal>
    </Portal>
  )
}

const ConfirmSignQCDialog = ({ visible, hideDialog, startCompleteQC }) => {
  const containerStyle = { backgroundColor: 'white', padding: 20 };
  const [currentRating, setCurrentRating] = useState(3);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog}>
        <Dialog.Title style={{ marginBottom: 30 }}>How is the job?</Dialog.Title>
        <AirbnbRating
          count={5}
          reviews={["Terrible", "Unsatisfactory", "OK", "Good", "Perfect!"]}
          defaultRating={currentRating}
          size={40}
          onFinishRating={(rating) => setCurrentRating(rating)}
        />
        <Dialog.Actions style={{ marginTop: 30 }}>
          <Button onPress={() => hideDialog()}>Cancel</Button>
          <Button onPress={() => startCompleteQC(currentRating)}>Complete</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}


const ConfirmDropDialog = ({ visible, hideDialog, finishDropJob }) => {
  const containerStyle = { backgroundColor: 'white', padding: 20 };
  return (
    <Portal>
      <Modal visible={visible} onDismiss={hideDialog} contentContainerStyle={containerStyle}>
        <Headline>Drop Job?</Headline>
        <Button onPress={() => finishDropJob()}>Yes</Button>
        <Button onPress={() => hideDialog()}>No</Button>
      </Modal>
    </Portal>
  )
}

const ManagerDialog = ({ visible, hideDialog, setConfirmCompleteJobDialogVisible, setManagerScanned }) => {
  const containerStyle = { backgroundColor: 'white', padding: 20 };
  const { Profile } = useContext(AuthContext)
  const [QR, setQR] = useState('');
  const ref_input = useRef();
  const [isLoading, setIsLoading] = React.useState(false)


  const checkIfManager = (authstring) => {
    setIsLoading(true)
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
          setIsLoading(false)
          hideDialog()
          alert("Manager scanned!")
          setConfirmCompleteJobDialogVisible(true)
        }
        else {
          setIsLoading(false)
          hideDialog()
          alert("User is not a manager")
        }
      })
      .catch((error) => {
        alert("Unable to log in - " + error.toString());
        setIsLoading(false)
        hideDialog()
        alert("User is not a manager")
      });

  }

  React.useEffect(() => {
    if (visible) {
      const interval2 = setInterval(() => {
        ref_input.current.focus()
      }, 100);
      return () => clearInterval(interval2);
    }
  }, [visible])


  return (
    <Portal>
      <Modal visible={visible} onDismiss={hideDialog} contentContainerStyle={containerStyle}>
        {!isLoading &&
          <View style={{ alignSelf: "center", alignContent: "center", display: "flex" }}><Subheading>Scan manager badge</Subheading>
            <MaterialCommunityIcons style={{ alignSelf: "center" }} name="barcode-scan" size={50} color="#0078D7" />
          </View>}
        {isLoading &&
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
  )
}
const ManagerDropDialog = ({ visible, hideDialog, setConfirmDropJobDialogVisible, setManagerDropScanned, setDropLoading }) => {
  const containerStyle = { backgroundColor: 'white', padding: 20 };
  const { Profile } = useContext(AuthContext)
  const [QR, setQR] = useState('');
  const ref_input = useRef();
  const [isLoading, setIsLoading] = React.useState(false)


  const checkIfManager = (authstring) => {
    setIsLoading(true)
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
        if (responseData.token.data.manager == "1" || responseData.token.data.supervisor == "1") {
          setManagerDropScanned(true)
          setIsLoading(false)
          hideDialog()
          alert("Authorised!")
          setConfirmDropJobDialogVisible(true)
          setDropLoading(false)
        }
        else {
          setIsLoading(false)
          hideDialog()
          alert("User is not a manager or supervisor")
        }
        setDropLoading(false)
      })
      .catch((error) => {
        alert("Unable to Auth - " + error.toString());
        setIsLoading(false)
        hideDialog()
        setDropLoading(false)
      });

  }

  React.useEffect(() => {
    if (visible) {
      const interval2 = setInterval(() => {
        ref_input.current.focus()
      }, 100);
      return () => clearInterval(interval2);
    }
  }, [visible])


  return (
    <Portal>
      <Modal visible={visible} onDismiss={hideDialog} contentContainerStyle={containerStyle}>
        {!isLoading &&
          <View style={{ alignSelf: "center", alignContent: "center", display: "flex" }}><Subheading>Scan Manager or Supervisor badge</Subheading>
            <MaterialCommunityIcons style={{ alignSelf: "center" }} name="barcode-scan" size={50} color="#0078D7" />
          </View>}
        {isLoading &&
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
  )
}


const PhotoDisplayer = ({ visible, hidePhotoViewer, photo }) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const hide = () =>{
    setIsLoading(true)
    hidePhotoViewer();
  }

  React.useEffect(()=>{
    (photo != '' ? setIsLoading(false) : null)
  },[photo])

  return (
    <Portal>
   
        <Modal visible={visible} onDismiss={hidePhotoViewer} style={{ width: windowWidth - 20, height: windowHeight - 80, backgroundColor: "#efefef", margin: 10, marginBottom: 0, borderWidth: 5, borderColor: colors.primary }}>
                {isLoading &&
        <ActivityIndicator animating={true} size="large" />
      }
          {!isLoading &&   <View style={{ width: windowWidth - 30, height: windowHeight, marginTop: 30 }}>
            <ReactNativeZoomableView
              maxZoom={90} 
              bindToBorders={true}
            >
              <Image
                style={{ width: windowWidth, minHeight: windowHeight - 100, resizeMode: 'contain' }}
                source={(photo != '') ? {
                  uri: photo,
                } : require('../assets/imageload.png')} />
            </ReactNativeZoomableView>
          </View>}
          <View>
            <Button mode="contained" style={{backgroundColor:colors.notification}} onPress={() => hide()}>CLOSE</Button>
          </View>
        </Modal>

    </Portal>
  )
}


export const DeliveryNoteScreen = ({ navigation, route }) => {

  const [isFromStockControl, setIsFromStockControl] = useState(route.params.isFromStockControl)
  const [deliveryNotes, setDeliveryNotes] = React.useState(null);
  const [note, setNote] = useState('')
  const [comment, setComment] = useState('')
  const [courier, setCourier] = useState('')
  const [courierConsNo, setCourierConsNo] = useState('')
  const [date, setDate] = useState('')
  const [noPhotos, setNoPhotos] = useState(true)
  const [label, setLabel] = useState('')
  const [packer, setPacker] = useState('')
  const [driver, setDriver] = useState(null)
  const [packerName, setPackerName] = useState('')
  const [tinter, setTinter] = useState(null)
  const [labelColour, setLabelColour] = useState('')
  const [jobStatus, setJobStatus] = useState(null)
  const [jobType, setJobType] = useState('')
  const [cards, setCards] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [totalDeliveryNotes, setTotalDeliveryNotes] = React.useState()
  const [deliveryNotesCompleteTotal, setDeliveryNotesCompleteTotal] = React.useState()
  const [unfinished, setUnfinished] = React.useState(false)
  const [labelPDF, setLabelPDF] = React.useState();

  const [photoForViewer, setPhotoForViewer] = React.useState('');

  const [photoDisplayVisible, setPhotoDisplayVisible] = React.useState(false)
  const hidePhotoViewer = () => {
    setPhotoDisplayVisible(false);
  }


  const { Profile, expireJWT, updateAuthGlobal } = useContext(AuthContext);
  const { colors } = useTheme();

  const [pickUpLoading, setPickUpLoading] = React.useState(false)
  const [completeLoading, setCompleteLoading] = React.useState(false)
  const [dropLoading, setDropLoading] = React.useState(false)
  const [signQCFABLoading, setSignQCFABLoading] = React.useState(false)


  const [pickUpConfirmDialogVisible, setPickUpConfirmDialogVisible] = React.useState(false)
  const [completeJobDialogVisible, setCompleteJobDialogVisible] = React.useState(false)

  const [confirmDropJobDialogVisible, setConfirmDropJobDialogVisible] = React.useState(false)

  const [confirmQCDialogVisible, setConfirmQCDialogVisible] = React.useState(false)

  const [managerDialogVisible, setManagerDialogVisible] = React.useState(false)
  const [managerScanned, setManagerScanned] = React.useState(false)

  const [managerDropDialogVisible, setManagerDropDialogVisible] = React.useState(false)
  const [managerDropScanned, setManagerDropScanned] = React.useState(false)

  const [confirmCompleteJobDialogVisible, setConfirmCompleteJobDialogVisible] = React.useState(false)
  const [scanBeforeComplete, setScanBeforeComplete] = React.useState()


  const hideDialog = () => {
    setPickUpConfirmDialogVisible(false);
    setPickUpLoading(false)
    sendJwtAndDateAndJobIDForDeliveryNotes(Profile.jwt, jobID)
  }

  const hideDialog2 = () => {
    setCompleteJobDialogVisible(false);
    setCompleteLoading(false)
    //navigate back
  }

  const hideDialog5 = () => {
    setConfirmDropJobDialogVisible(false);
    setDropLoading(false)
    //navigate back
  }

  const hideDialog3 = () => {
    setConfirmCompleteJobDialogVisible(false);
    setCompleteLoading(false)
  }

  const hideDialog4 = () => {
    setManagerDialogVisible(false);
    setCompleteLoading(false)
  }

  const hideDialog6 = () => {
    setManagerDropDialogVisible(false);
  }

  const hideDialogQC = () => {
    setConfirmQCDialogVisible(false);
    setSignQCFABLoading(false)
  }


  const startPickUpJob = () => {
    setPickUpConfirmDialogVisible(true);
    setPickUpLoading(true)
  }

  const startCompleteJob = () => {
    setConfirmCompleteJobDialogVisible(false);
    if (Profile.adminMode) {
      completeJob((""))
    }
    else if (scanBeforeComplete) {
      setCompleteJobDialogVisible(true);
    }
    else {
      completeJob("")
    }
  }

  const startSignQC = () => {
    setSignQCFABLoading(true)
    confirmSignQC()
  }

  const startCompleteQC = (currentRating) => {
    let JobIDInt = parseInt(jobID)
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
        "action": "qcSignJob",
        "consignmentID": JobIDInt,
        "rate": currentRating
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/jobs/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        if (responseData.status == true) {
          alert("Success!")
          setConfirmQCDialogVisible(false)
          setSignQCFABLoading(false)
        }
      })
      .catch((error) => {
        alert(error)
      });

  }

  const finishDropJob = () => {
    setConfirmDropJobDialogVisible(false);
    dropJob();
  }

  const startDropJob = () => {
    setConfirmDropJobDialogVisible(false);
    setDropLoading(true)
  }

  const completeJob = (barcodeScanned) => {
    let userIDInt = parseInt(Profile.id)
    let JobIDInt = parseInt(jobID)
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
        "action": "jobPacked",
        "consignmentID": JobIDInt,
        "userID": userIDInt,
        "scannedBarcode":barcodeScanned,
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/jobs/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        if (responseData.status == true) {
          alert("Job Completed!")
          setCompleteLoading(false)
          setIsLoading(true)
          sendJwtAndDateAndJobIDForDeliveryNotes(jwt, JobIDInt)
        }
      })
      .catch((error) => {
        alert(error)
      });
  }

  const dropJob = () => {
    let JobIDInt = parseInt(jobID)
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
        "action": "dropTheJob",
        "consignmentID": JobIDInt
      })
    };
    return fetch('https://api-veen-e.ewipro.com/v1/jobs/', data)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then((responseData) => {
        if (responseData.status == true) {
          alert("Job has been dropped!")
          setDropLoading(false)
          setIsLoading(true)
          sendJwtAndDateAndJobIDForDeliveryNotes(jwt, JobIDInt)
        }
      })
      .catch((error) => {
        alert(error)
      });
  }


  const confirmComplete = () => {
    if (unfinished && !managerScanned && !Profile.adminMode && jobType != "2") {
      setManagerDialogVisible(true)
    } else {
      setConfirmCompleteJobDialogVisible(true)
    }
    setCompleteLoading(true)
  }

  const confirmDrop = () => {
    if (!managerDropScanned && !Profile.adminMode) {
      setManagerDropDialogVisible(true)
    } else {
      setConfirmDropJobDialogVisible(true)
    }
    setDropLoading(true)
  }

  const confirmSignQC = () => {
    setConfirmQCDialogVisible(true)
    setSignQCFABLoading(true)
  }


  const [jobDate, setJobDate] = React.useState(route.params.jobDate)
  const [jobID, setJobID] = React.useState(route.params.jobID)

  const [expanded, setExpanded] = React.useState(true);
  const handlePress = () => setExpanded(!expanded);

  const [expanded2, setExpanded2] = React.useState(false);
  const handlePress2 = () => setExpanded2(!expanded2);

  const [expanded3, setExpanded3] = React.useState(true);
  const handlePress3 = () => setExpanded3(!expanded3);

  React.useEffect(() => {
    sendJwtAndDateAndJobIDForDeliveryNotes(Profile.jwt, jobID)
    sendJobIDforPhotos(Profile.jwt, jobID)
  }, [Profile, jobID])


  const sendJwtAndDateAndJobIDForDeliveryNotes = (jwt, jobId) => {
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
          "action": "getJobDetails",
          "consignmentID": jobId
        })
      };
      return fetch('https://api-veen-e.ewipro.com/v1/jobs/', data)
        .then((response) => {
          if (!response.ok) throw new Error(response.status);
          else return response.json();
        })
        .then((responseData) => {
          let currentJob = (responseData.consigments[0].consigment[0]);
          currentJob.labelPDF == false ? setScanBeforeComplete(false) : setScanBeforeComplete(true);
          setPacker(currentJob.packer.id)
          setPackerName(currentJob.packer.name)
          setTinter(currentJob.tinter)
          setDeliveryNotes(currentJob.deliveryNotes)
          setDriver(currentJob.driver)
          if (currentJob.deliveryNotes) {
            setTotalDeliveryNotes(currentJob.deliveryNotes.length)
            let items = currentJob.deliveryNotes
            let totalComplete = 0
            let unfinishedDNs = 0;
            items.forEach(function (item) {
              let notCompleted = item.deliveryNotesLines.find((n) => n.pickedUp == 0)
              if (notCompleted == null) {
                totalComplete++
              }
              let unfinishedItems = item.deliveryNotesLines.find((n) => (n.pickedUp == 0 || n.pickedUpQty < n.productQty))
              if (unfinishedItems != null) {
                unfinishedDNs++
              }
            });
            if (unfinishedDNs > 0) {
              setUnfinished(true)
            }
            else {
              setUnfinished(false)
            }
            setDeliveryNotesCompleteTotal(totalComplete)
          }
          setCourier(currentJob.shippingMethodName)
          setCourierConsNo(currentJob.courierConsNo)
          setNote(currentJob.comment)
          setComment(currentJob.driverComment)
          setDate(currentJob.date)
          setLabelPDF(currentJob.labelPDF)
          setJobStatus(currentJob.status)
          setJobType(currentJob.consignmentType)
          setLabel(currentJob.statusDetails.label)
          setLabelColour(currentJob.statusDetails.borderColor)
          setIsLoading(false)
        }
        )
        .catch((error) => {
          if (error.message == "401") {
            updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
          }
          console.log(error)
        });
    }
  }

  const sendJobIDforPhotos = (jwt, jobId) => {
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
          "action": "getJobPhotos",
          "consignmentID": jobId
        })
      };
      return fetch('https://api-veen-e.ewipro.com/v1/jobs/', data)
        .then((response) => {
          if (!response.ok) throw new Error(response.status);
          else return response.json();
        })
        .then((responseData) => {
          if (responseData.photos.length != 0) {
            setNoPhotos(false)
            return responseData.photos
          }
          else {
            setNoPhotos(true)
            return false
          }
        })
        .catch((error) => {
          if (error.message == "401") {
            updateAuthGlobal(Profile.userName, Profile.userToken, Profile.userType)
          }
        });
    }
  }

  const sendPhotoToModal = (photo) => {
    setPhotoForViewer(photo)
    setPhotoDisplayVisible(true);
  }


  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true)
      sendJobIDforPhotos(Profile.jwt, jobID)
      sendJwtAndDateAndJobIDForDeliveryNotes(Profile.jwt, jobID)
    }, [])
  );


  React.useEffect(() => {
    let noteList = deliveryNotes;
    if (noteList != null) {
      let cards = Object.keys(noteList).map(key => (
        <DeliveryCard key={key} props={noteList[key]} jobID={jobID} jobDate={jobDate} navigation={navigation} packer={packer} tinter={tinter} isFromStockControl={isFromStockControl} />
      ))
      setCards(cards)
    }
  }, [deliveryNotes]);


  React.useEffect(() => {
    setIsFromStockControl(route.params.isFromStockControl)
  }, [route.params.isFromStockControl])

  if (isLoading) {
    return (
      <Splash />
    )
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.NotesScreenScroll}>
        <DNBanner props={{ note, courier, date, label, labelColour, courierConsNo, packerName, driver }} />
        <List.Accordion
          title={"Delivery Notes"} titleStyle={{ color: "#000000" }} style={{ width: windowWidth, backgroundColor: colors.accordionBG }} expanded={expanded} onPress={handlePress}>
          {cards}
          {!cards && <View style={{ margin: 20 }}><Subheading style={{ color: "#000000", textAlign: "center" }}>No Delivery Notes in this Job</Subheading><Button mode="contained" style={styles.refreshButton} labelStyle={{ color: "#FFFFFF", textAlignVertical: "center" }} onPress={() => sendJwtAndDateAndJobIDForDeliveryNotes(Profile.jwt, jobID)}>Refresh</Button></View>}
        </List.Accordion>
        {jobStatus != -2 && <List.Accordion
          title={"Photos"} titleStyle={{ color: "#000000" }} style={{ width: windowWidth, backgroundColor: colors.accordionBG }} expanded={expanded2} onPress={handlePress2} >
          <Photos navigation={navigation} jobID={jobID} sendJobIDforPhotos={sendJobIDforPhotos} sendPhotoToModal={sendPhotoToModal} />
        </List.Accordion>}
        {jobStatus != -2 && <Comment initialComment={comment} jobID={jobID} />}
      </ScrollView>



      {!isFromStockControl && (jobStatus == -2 || Profile.adminMode) && <PickUpJobFAB startPickUpJob={startPickUpJob} pickUpLoading={pickUpLoading} />}

      {!isFromStockControl && jobStatus == -1 && (packer == Profile.id || Profile.adminMode || Profile.isSupervisor == "1" || Profile.isManager == "1") && <CompleteJobFAB confirmComplete={confirmComplete} completeLoading={completeLoading} totalDeliveryNotes={totalDeliveryNotes} deliveryNotesCompleteTotal={deliveryNotesCompleteTotal} noPhotosProp={noPhotos} />}

      {((jobStatus == -1 && packer == Profile.id) || Profile.adminMode || isFromStockControl) && <BottomBar labelPDF={labelPDF} navigation={navigation} jobID={jobID} status={jobStatus} total={totalDeliveryNotes} completed={deliveryNotesCompleteTotal} needsScan={scanBeforeComplete} confirmDrop={confirmDrop} dropLoading={dropLoading} isFromStockControl={isFromStockControl} />}

      {isFromStockControl && <SignQCFAB startSignQC={startSignQC} signQCFABLoading={signQCFABLoading} />}

      <PhotoDisplayer visible={photoDisplayVisible} hidePhotoViewer={hidePhotoViewer} photo={photoForViewer} />
      <PickUpJobDialog visible={pickUpConfirmDialogVisible} hideDialog={hideDialog} jobID={jobID} />
      <CompleteJobDialog visible={completeJobDialogVisible} hideDialog={hideDialog2} completeJob={completeJob} courierConsNo={courierConsNo} note={note} />
      <ConfirmDropDialog visible={confirmDropJobDialogVisible} hideDialog={hideDialog5} finishDropJob={finishDropJob} />
      <ConfirmCompleteDialog visible={confirmCompleteJobDialogVisible} hideDialog={hideDialog3} startCompleteJob={startCompleteJob} />
      <ManagerDialog visible={managerDialogVisible} hideDialog={hideDialog4} setConfirmCompleteJobDialogVisible={setConfirmCompleteJobDialogVisible} setManagerScanned={setManagerScanned} />
      <ManagerDropDialog visible={managerDropDialogVisible} hideDialog={hideDialog6} setConfirmDropJobDialogVisible={setConfirmDropJobDialogVisible} setManagerDropScanned={setManagerDropScanned} setDropLoading={setDropLoading} />
      <ConfirmSignQCDialog visible={confirmQCDialogVisible} hideDialog={hideDialogQC} setSignQCFABLoading={setSignQCFABLoading} startCompleteQC={startCompleteQC} />
    </ScreenContainer>

  );
};

