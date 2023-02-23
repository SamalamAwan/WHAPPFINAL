import { DefaultTheme } from 'react-native-paper';
import React from 'react';
import { Dimensions, Image } from 'react-native';

const headerHeight = 113;
const windowWidth = Dimensions.get('window').width;
//console.log(test)
export const lightTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#0078d7',
        darkenedPrimary: '#002a4d',
        lightenedPrimary: '#33a3ff',
        accent: '#fedb00',
        white: '#fff',
        homeIcon: "#0078D7",
        AccordionText: "#000",
        accordionBG: "#f6f6f6",
        notesBG: "#fff",
    },
    cards: {
        card: {
            backgroundColor: "#fff",
            margin: 10,
            flexDirection: "row",
            padding: 0,
        },
        title: {
            fontSize: 14,
        },
        subTitle: {
            color: "#666"
        },
        cardsItems: {
            backgroundColor: "#fff",
            margin: 5,
            flexDirection: "row",
            padding: 0,
        },
        cardsItemsThin: {
            backgroundColor: "#fff",
            margin: 2,
            flexDirection: "row",
            padding: 0,
            minHeight: 40
        },
        itemTitle: {
            fontSize: 12,
            color: '#666',
        },
        itemSubtitle: {
            fontSize: 18,
            color: '#000',
        },
    },
    container: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: headerHeight,
        minWidth: windowWidth,
    },
    containerNoTopMargin: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 0,
        minWidth: windowWidth,
    },
    containerHalfTopMargin: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: headerHeight / 2,
        minWidth: windowWidth,
    },
    containerFlexStart: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: headerHeight,
        minWidth: windowWidth,
    },
    containerStretch: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        marginTop: headerHeight,
        minWidth: windowWidth,
    },
    homeShortcut: {
        Surface: {
            display: "flex",
            marginVertical: 5,
            minWidth: "45%",
            height: 135,
            elevation: 5,
            borderRadius: 5,
            flexDirection: "column",
            justifyContent: "flex-start",
            alignContent: "center",
            paddingVertical: 5,
            flexWrap: "nowrap",
            alignItems: "center",
            paddingTop: 20,
            backgroundColor: "#fff",
        },
        SurfaceItem: {
            display: "flex",
            flex: 1,
            justifyContent: "flex-start",
            alignItems: "center",
        },
        bottom: {
            position: 'absolute',
            bottom: 10,
            width: "100%",
        },
        homeIconTitle: {
            color: "#707070",
            fontSize: 14,
            textAlign: "center",
            padding: 5,
        },
    },
    header: {
        headerStyle: { height: headerHeight, },
        headerStyleSmall: { height: headerHeight / 2, },
        headerTitleStyle: { fontWeight: 'bold', },
        headerTintColor: '#fff',
        background: () => ( <
            Image resizeMode = "cover"
            style = {
                { height: headerHeight, width: windowWidth }
            }
            source = { require('./assets/headerbg.png') }
            />
        ),
        backgroundSmall: () => ( <
            Image resizeMode = "cover"
            style = {
                { height: headerHeight / 2, width: windowWidth }
            }
            source = { require('./assets/headerbgsmall.png') }
            />
        ),
    }
};
export const darkTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#0078d7',
        accent: '#fedb00',
        white: '#fff',
        homeIcon: "#fedb00",
        AccordionText: "#fff",
        accordionBG: "#00355c",
        notesBG: "#00355c"
    },
    cards: {
        card: {
            backgroundColor: "#333",
            margin: 10,
            flexDirection: "row",
            padding: 0,
        },
        title: {
            fontSize: 14,
            color: "#fff",
        },

        subTitle: {
            color: "#ddd"
        },
        cardsItems: {
            backgroundColor: "#333",
            margin: 5,
            flexDirection: "row",
            padding: 0,
        },
        itemTitle: {
            fontSize: 12,
            color: '#ddd',
        },
        itemSubtitle: {
            fontSize: 18,
            color: '#fff',
        },
        itemTitle2: {
            flex: 1,
            fontSize: 12,
            color: '#ddd',
        },
        itemSubtitle2: {
            flex: 1,
            fontSize: 18,
            color: '#fff',
        },
    },
    container: {
        flex: 1,
        backgroundColor: '#001728',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: headerHeight,
        minWidth: windowWidth,
    },
    containerNoTopMargin: {
        flex: 1,
        backgroundColor: '#001728',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 0,
        minWidth: windowWidth,
    },
    containerHalfTopMargin: {
        flex: 1,
        backgroundColor: '#001728',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: headerHeight / 2,
        minWidth: windowWidth,
    },
    containerFlexStart: {
        flex: 1,
        backgroundColor: '#001728',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: headerHeight,
        minWidth: windowWidth,
    },
    homeShortcut: {
        Surface: {
            display: "flex",
            marginVertical: 5,
            minWidth: "45%",
            maxWidth: "45%",
            height: 135,
            elevation: 5,
            borderRadius: 5,
            flexDirection: "column",
            justifyContent: "flex-start",
            alignContent: "center",
            paddingVertical: 5,
            flexWrap: "nowrap",
            alignItems: "center",
            paddingTop: 20,
            backgroundColor: "#0078d7",
        },
        SurfaceItem: {
            display: "flex",
            flex: 1,
            justifyContent: "flex-start",
            alignItems: "center",
        },
        bottom: {
            position: 'absolute',
            bottom: 10,
            width: "100%",
        },
        homeIconTitle: {
            color: "#fff",
            fontSize: 16,
        },
    },
    header: {
        headerStyle: { height: headerHeight, },
        headerTitleStyle: { fontWeight: 'bold', },
        headerTintColor: '#fff',
        background: () => ( <
            Image resizeMode = "cover"
            style = {
                { height: headerHeight, width: windowWidth }
            }
            source = { require('./assets/headerbg.png') }
            />
        ),
        backgroundSmall: () => ( <
            Image resizeMode = "cover"
            style = {
                { height: headerHeight / 2, width: windowWidth }
            }
            source = { require('./assets/headerbgsmall.png') }
            />
        ),
    }
};

export default lightTheme;