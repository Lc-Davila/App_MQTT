import init from 'react_native_mqtt';
import { AsyncStorage } from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native'; 

// Escolhe o armazenamento certo dependendo de onde o app está rodando
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
    const { host, port, path, user, pass, clientId } = config;

    this.client = new Paho.MQTT.Client(host, port, path, clientId);

    this.client.onMessageArrived = (message) => {
      onMessage(message.destinationName, message.payloadString);
    };

    const options = {
      userName: user,
      password: pass,
      useSSL: true,
      onSuccess: onConnect,
      onFailure: onFailure,
      timeout: 3,
      keepAliveInterval: 60,
    };

    this.client.connect(options);
  }

  // Corrigido: Removido o ';' depois de (topic)
  subscribe(topic) {
    this.client.subscribe(topic);
  }

  // Corrigido: Removido o ';' depois de (topic, message)
  publish(topic, message) {
    const msg = new Paho.MQTT.Message(message);
    msg.destinationName = topic;
    this.client.send(msg);
  }
} // <-- Agora a classe fecha aqui no final de tudo, englobando todas as funções!
