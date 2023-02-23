import React from "react";
import {useTheme,Headline, Surface} from 'react-native-paper';
import { ScreenContainer } from '../ScreenContainer'
import { Dimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
const windowWidth = Dimensions.get('window').width;

export const ConstructionScreen = () => {


  const { colors } = useTheme();




    return (
      <ScreenContainer flexstart halfmargin>
        <LinearGradient
          // Background Linear Gradient
          colors={[colors.primary, colors.darkenedPrimary]}>
               <View style={{ display: "flex", width: windowWidth, alignSelf: "center", alignContent:"center", justifyContent:"center", flexDirection: "column", height:"100%" }}>
              
<Headline style={{color:"white", textAlign:"center"}}>Page under construction!</Headline>

    
        </View>
        </LinearGradient>
      </ScreenContainer>
    );
};