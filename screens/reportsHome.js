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

const OutgoingIcon = () => {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name="clipboard-check-multiple" size={50} color={colors.homeIcon} />
  );
}

export const ReportsHomeScreen = ({ navigation }) => {
  return (
    <ScreenContainer style={styles.HomeScreen}>
      <ScrollView contentContainerStyle={styles.HomeScreenScroll}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Outgoing Items')}><HomeIcon Title="Outgoing Items" subText="Outgoing Items" Icon={<OutgoingIcon />}/></TouchableOpacity>
      <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Closed Jobs')}><HomeIcon Title="Closed Jobs" subText="Reports" Icon={<OutgoingIcon />}/></TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  )
};


