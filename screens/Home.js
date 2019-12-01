import React from "react";
import { Platform, StyleSheet, Dimensions, ScrollView } from "react-native";
import { Block, theme, Text } from "galio-framework";
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

import { Card, Button } from "../components";
import articles from "../constants/articles";

import ArInput from "../components/Input";
import ArButton from "../components/Button";

const { width } = Dimensions.get("screen");

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.client = null;
    this.state = {
      host: null,
      roomName: null,

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

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    // high accuracy needed otherwise android emulator returns incorrect locations
    let location = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
    this.setState({ location });
  };

  positionCallback(position) {
    this.setState({
      location: position
    });

    this.state.isConnected && this.client.send(JSON.stringify({
      message: this.state.name,
      lat: this.state.location.coords.latitude,
      lon: this.state.location.coords.longitude,
    }));
  }

  async componentDidMount() {

    // setup GPS location
    this._getLocationAsync();
    let { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    } else {
      // add watcher to location update
      //https://docs.expo.io/versions/latest/sdk/location/#locationaccuracy
      await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 300, distanceInterval: 5 },
          this.positionCallback
      )
    }
  }

  onSubmit = () => {
    const address = 'wss://' + this.state.host + '/ws/live/' + this.state.roomName + '/';
    this.client = new WebSocket(address);

    this.client.onopen = () => {
      console.log('Websocket Client Connected');
    };

    this.client.onclose = () => {
      console.log('Websocket Closed Successfully');
      this.setState({isConnected: false});
    };

    this.client.onerror = () => {
      console.log('Websocket Closed Unexpectedly');
      this.setState({isConnected: false});
    };

    this.setState({ isConnected: true });
  };

  handleChange = (name, value) => {
    this.setState({ [name]: value })
  };

  renderPosition = () => {
    return (
      <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.articles}
      >
        <Block center>
          <Block left>
            <Text style={styles.instructions}>Timestamp: {this.state.location.timestamp}</Text>
            <Text style={styles.instructions}>Speed: {this.state.location.coords.speed}</Text>
            <Text style={styles.instructions}>Heading: {this.state.location.coords.heading}</Text>
            <Text style={styles.instructions}>Accuracy: {this.state.location.coords.accuracy}</Text>
            <Text style={styles.instructions}>Altitude: {this.state.location.coords.altitude}</Text>
            <Text style={styles.instructions}>Longitude: {this.state.location.coords.longitude}</Text>
            <Text style={styles.instructions}>Latitude: {this.state.location.coords.latitude}</Text>
          </Block>
          <Block>
            <ArButton round size="small" onPress={() => {this.client.close(1000)}}>Disconnect</ArButton>
          </Block>
        </Block>
      </ScrollView>
    )
  };

  renderSetup = () => {
    return(
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.articles}
      >
        <Block center>
          <Text h4>UD IoT Live Map</Text>
        </Block>
        <Block center>
          <ArInput onChangeText={text => this.handleChange('host', text)} placeholder="Hostname" icon="home" family="Entypo" iconSize={16} />
          <ArInput onChangeText={text => this.handleChange('roomName', text)} placeholder="Room Name" icon="map" family="Foundation" iconSize={16} />
          <ArButton round size="small" onPress={this.onSubmit}>Submit</ArButton>
        </Block>
      </ScrollView>
    )
  };

  render() {
    if(!this.state.isConnected) {
      return(
        <Block flex center style={styles.home}>
          {this.renderSetup()}
        </Block>
      )
    }
    else {
      return (
        <Block flex center style={styles.home}>
          {this.renderPosition()}
        </Block>
      );
    }
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
