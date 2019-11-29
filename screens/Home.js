import React from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import { Block, theme, Text } from "galio-framework";

import Geolocation from 'react-native-geolocation-service';

import { Card, Button } from "../components";
import articles from "../constants/articles";
const { width } = Dimensions.get("screen");

const group_name = 'test';
const client = new WebSocket('ws://10.0.2.2:8088/ws/vehicles/' + group_name + '/');

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'noname',
      isConnected: false,
      location: {
        timestamp: null,
        coords: {
          speed: null,
          heading: null,
          accuracy: null,
          altitude: null,
          longitude: null,
          latitude: null,
        }
      }
    };
    this.positionCallback = this.positionCallback.bind(this)
  }

  positionCallback(position) {
    this.setState({
      location: position
    });

    this.state.isConnected && client.send(JSON.stringify({
      message: this.state.name,
      lat: this.state.location.coords.latitude,
      lon: this.state.location.coords.longitude,
    }));
  }

  UNSAFE_componentWillMount() {
    client.onopen = () => {
      console.log('Websocket Client Connected');
      this.setState({
        isConnected: true
      })
    };

    client.onclose = () => {
      console.log('Websocket closed unexpectedly');
      this.setState({
        isConnected: false
      })
    };

    try {
      const granted = PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (true) {
        Geolocation.getCurrentPosition(
            this.positionCallback,
            (error) => {
              // See error code charts below.
              console.log(error.code, error.message);
            },
            { distanceFilter: 20, enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
        Geolocation.watchPosition(
            this.positionCallback,
            (error) => {
              console.log(error.code, error.message);
            },
            { distanceFilter: 20, enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      }
    } catch (err) {
      console.warn(err);
    }
  }

  /*
  renderArticles = () => {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.articles}
      >
        <Text>Hello!</Text>
      </ScrollView>
    );
  };
  */

  renderPosition = () => {
    return (
      <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.articles}
      >
        <Text style={styles.instructions}>Timestamp: {this.state.location.timestamp}</Text>
        <Text style={styles.instructions}>Speed: {this.state.location.coords.speed}</Text>
        <Text style={styles.instructions}>Heading: {this.state.location.coords.heading}</Text>
        <Text style={styles.instructions}>Accuracy: {this.state.location.coords.accuracy}</Text>
        <Text style={styles.instructions}>Altitude: {this.state.location.coords.altitude}</Text>
        <Text style={styles.instructions}>Longitude: {this.state.location.coords.longitude}</Text>
        <Text style={styles.instructions}>Latitude: {this.state.location.coords.latitude}</Text>
      </ScrollView>
    )
  };

  render() {
    return (
      <Block flex center style={styles.home}>
        {this.renderPosition()}
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    width: width
  },
  articles: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
    paddingHorizontal: 2,

  }
});

export default Home;
