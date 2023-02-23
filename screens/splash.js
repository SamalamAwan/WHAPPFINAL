import React from "react";
import { ActivityIndicator } from 'react-native-paper';
import {ScreenContainer} from '../ScreenContainer'


export const Splash = () => (
    <ScreenContainer>
      <ActivityIndicator animating={true} size="large"/>
    </ScreenContainer>
  );

    