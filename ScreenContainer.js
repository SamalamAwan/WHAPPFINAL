/* eslint-disable react/prop-types */
import React from "react";
import { View } from "react-native";
import { useTheme } from 'react-native-paper';


export const ScreenContainer = ({ children, nomargin, halfmargin, flexstart, stretch }) => {
    const {container, containerNoTopMargin,containerHalfTopMargin, containerFlexStart, containerStretch} = useTheme();
    return (
    <View style={stretch ? containerStretch : halfmargin ? containerHalfTopMargin : nomargin ? containerNoTopMargin : flexstart ? containerFlexStart : container}>{children}</View>
    )
    
};