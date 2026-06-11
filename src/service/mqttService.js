import init from 'react_native_mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native'; 

// Escolhe o armazenamento correto baseado no ambiente de execução
const dispositivoStorage = Platform.OS === 'web' ? window.localStorage : AsyncStorage;

init({
  size: 10000,
  storageBackend: dispositivoStorage, 
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  sync: {},
});

export default class MQTTService {
  constructor() {
    this.client = null;
  } 

  connect(config, onMessage, onConnect, onFailure) {
    const { host, port, path = "", user, pass, clientId } = config;

    // Criamos o cliente Paho normalmente
    this.client = new Paho.MQTT.Client(host, port, path, clientId);

    this.client.onMessageArrived = (message) => {
      onMessage(message.destinationName, message.payloadString);
    };

    // CONFIGURAÇÃO COMPLETA DE SEGURANÇA PARA O HIVEMQ CLOUD
    const options = {
      userName: user,
      password: pass,
      useSSL: true,             // DIZ PARA O PAHO USAR WSS:// EM VEZ DE WS://
      mqttVersion: 4,           // Força o protocolo MQTT 3.1.1 (obrigatorio para o HiveMQ)
      onSuccess: onConnect,
      onFailure: onFailure,
      timeout: 10,              // 10 segundos de limite para dar tempo de autenticar na nuvem
      keepAliveInterval: 60,
    };

    this.client.connect(options);
  }

  subscribe(topic) {
    if (this.client && this.client.isConnected()) {
      this.client.subscribe(topic);
    }
  }

  publish(topic, message) {
    if (this.client && this.client.isConnected()) {
      const msg = new Paho.MQTT.Message(message);
      msg.destinationName = topic;
      this.client.send(msg);
    }
  }
}