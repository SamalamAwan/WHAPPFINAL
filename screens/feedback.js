import React from "react";
import { Button, TextInput } from 'react-native-paper';
import { KeyboardAvoidingView } from "react-native";
import {ScreenContainer} from '../ScreenContainer'
import { AuthContext, apiKey } from "../context";
import { Dimensions } from 'react-native';
const windowWidth = Dimensions.get('window').width;



export const Feedback = () => {
    const { Profile } = React.useContext(AuthContext);
  const [feedback, setFeedback] = React.useState('');

    const sendFeedback = (feedbackText) => {
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
          body: JSON.stringify({ "userID": Profile.id, "feedback": feedbackText })
        };
        return fetch('https://api-veen-e.ewipro.com/v1/feedback/', data)
          .then((response) => {
            if (!response.ok) throw new Error(response.status);
            else return response.json();
          })
          .then(() => {
            setFeedback('')
            alert("Feedback sent, Thank you!")
          })
          .catch((error) => {
            alert(error)
          });
      }
    }

    return (
      <ScreenContainer>
            <KeyboardAvoidingView style={{ width: windowWidth, flex:1, padding: 20, margin: 0, backgroundColor: "#F5F5F5" }} behavior={"padding"}>
            <TextInput label={"Feedback"} mode={"outlined"} placeholder={"Type your feedback here..."} multiline={true} numberOfLines={6}  value={feedback} onChangeText={text => setFeedback(text)} />
            <Button mode="contained" onPress={() => sendFeedback(feedback)} style={{margin:20}}>Submit</Button>
    </KeyboardAvoidingView>
      </ScreenContainer>
    );
  };