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
const AssignIcon = () => {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name="feature-search" size={50} color={colors.homeIcon} />
  );
}


const OutgoingIcon = () => {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name="clipboard-check-multiple" size={50} color={colors.homeIcon} />
  );
}

const DamageIcon = () => {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name="heart-broken" size={50} color={colors.homeIcon} />
  );
}

const StockTakeIcon = () => {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name="clipboard-check" size={50} color={colors.homeIcon} />
  );
}

export const InventoryHomeScreen = ({ navigation }) => {
  return (
    <ScreenContainer style={styles.HomeScreen}>
      <ScrollView contentContainerStyle={styles.HomeScreenScroll}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Find Item')}><HomeIcon Title="Assign Barcodes" subText="Assign Barcodes to products" Icon={<AssignIcon />}/></TouchableOpacity>
      <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Reports Home')}><HomeIcon Title="Reports" subText="Reports" Icon={<OutgoingIcon />}/></TouchableOpacity>
      <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Damage Report')}><HomeIcon Title="Damage Report" subText="Reports" Icon={<DamageIcon />}/></TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  )
};


