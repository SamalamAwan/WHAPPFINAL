import React from "react";
import {useTheme,Headline, Surface, Text} from 'react-native-paper';
import { ScreenContainer } from '../ScreenContainer'
import { Dimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';
const windowWidth = Dimensions.get('window').width;

export const HolidayScreen = () => {

  let today = moment();
  let customDatesStyles = [{
    date: today,
    style: {borderColor:"#ffffff", borderWidth:1},
    textStyle: {color: 'white'}, // sets the font color
    containerStyle: [], // extra styling for day container
    allowDisabled: true, // allow custom style to apply to disabled dates
  }];


  const { colors } = useTheme();

  const [selectedStartDate, setSelectedStartDate] = React.useState(null)
  const [selectedEndDate, setSelectedEndDate] = React.useState(null)
  const minDate = moment().add(1,'days'); // Tomorrow
  const onDateChange = (date, type) => {
    console.log(date, type)
      if (type === 'END_DATE') {
        setSelectedEndDate(date)
      } else {
        setSelectedStartDate(date)
        setSelectedEndDate(date)
      }
    }


    return (
      <ScreenContainer flexstart halfmargin>
        <LinearGradient
          // Background Linear Gradient
          colors={["#e0e0e0", "#FFFFFF", "#e0e0e0"]}>
               <View style={{ display: "flex", width: windowWidth, alignSelf: "center", alignContent:"center", justifyContent:"flex-start", flexDirection: "column", height:"100%" }}>

<CalendarPicker
          startFromMonday={true}
          allowRangeSelection={true}
          showDayStragglers={true}
          dayShape="square"
          minDate={minDate}
          customDatesStyles={customDatesStyles}
          todayBackgroundColor="#000"
          selectedStartDate={selectedStartDate}
          selectedEndDate={selectedEndDate}
          selectedDayColor="#7300e6"
          selectedDayTextColor="#FFFFFF"
          textStyle={{color:"#000"}}
          onDateChange={(date, type) => onDateChange(date, type)}
        />


    
</View>
        </LinearGradient>
      </ScreenContainer>
    );
};