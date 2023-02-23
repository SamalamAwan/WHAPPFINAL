import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { ScreenContainer } from '../ScreenContainer'
import styles from '../styles'
import { Title, Surface, Text, useTheme, Badge, Button } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from "../context";
import { apiKey } from "../context";

const HomeIcon = (props) => {
  const { homeShortcut } = useTheme();
  return (
    <Surface style={homeShortcut.Surface}>
      <View style={homeShortcut.SurfaceItem}>{props.Icon}
      </View>
      <View style={homeShortcut.SurfaceItem}>
        <Title style={homeShortcut.homeIconTitle}>{props.Title}</Title>
      </View>
    </Surface>

  )
}

const StockTakeIcon = () => {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name="clipboard-check" size={50} color={colors.homeIcon} />
  );
}
const StockTakeMissingIcon = () => {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name="clipboard-alert" size={50} color={colors.homeIcon} />
  );
}

export const StockTakeHomeScreen = ({ navigation }) => {
  return (
    <ScreenContainer style={styles.HomeScreen}>
      <ScrollView contentContainerStyle={styles.HomeScreenScroll}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Stock Take Find')}><HomeIcon Title="Stock Take Find Item" subText="Stock Take" Icon={<StockTakeIcon />}/></TouchableOpacity>
      <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Stock Take Missing')}><HomeIcon Title="Missing Stock Take" subText="Stock Take" Icon={<StockTakeMissingIcon />}/></TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  )
};


