import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native'; // <-- Removido o import do 'expo' que quebrava
import MQTTService from './src/service/mqttService';
import StatusModal from './src/components/StatusModal';
import LightControl from './src/components/LightControl'; // <-- Corrigido o caminho (estava importando StatusModal de novo)
import Gauges from './src/components/Gauges';

const mqtt = new MQTTService();

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [temp, setTemp] = useState(0);
  const [hum, setHum] = useState(0);

  // CORRIGIDO: Adicionado aspas em textos e configurado para usar o process.env que arrumamos antes
  const mqttConfig = {
    host: process.env.EXPO_PUBLIC_MQTT_HOST || 'fe2ce9e9eed3484fbeebb904490f2cb3.s1.eu.hivemq.cloud',
    port: Number(process.env.EXPO_PUBLIC_MQTT_PORT) || 8883,
    user: process.env.EXPO_PUBLIC_MQTT_USER || 'lucas_martins',
    pass: process.env.EXPO_PUBLIC_MQTT_PASS || 'Goleiro1',
    clientId: 'RN_App_' + Math.random().toString(16).substr(2, 8),
  };

  useEffect(() => {
    startConnection();
  }, []);

  const startConnection = () => {
    setShowError(false);
    mqtt.connect(
      mqttConfig,
      (topic, message) => {
        if (topic === 'casa/temp') setTemp(parseFloat(message));
        if (topic === 'casa/umid') setHum(parseFloat(message));
        if (topic === 'casa/luz') setIsLightOn(message === "1");
      },
      () => {
        setIsConnected(true);
        mqtt.subscribe('casa/temp');
        mqtt.subscribe('casa/umid');
        mqtt.subscribe('casa/luz');
      },
      (err) => {
        setIsConnected(false);
        setShowError(true);
      }
    );
  };
  
  const toggleLight = () => {
    const newState = isLightOn ? "0" : "1";
    mqtt.publish('casa/luz', newState);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Smart Home IoT</Text>

      <LightControl isLightOn={isLightOn} onToggle={toggleLight} />

      <Gauges temp={temp} hum={hum} />

      <StatusModal
        visible={showError}
        onRetry={startConnection}
        onLater={() => setShowError(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121212',
    padding: 20, 
    alignItems: 'center'
  },
  header: { 
    color: '#FFF', 
    fontSize: 24,
    fontWeight: 'bold', 
    marginTop: 40,
    marginBottom: 20
  },
});