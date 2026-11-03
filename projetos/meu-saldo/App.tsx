// GUIA DE EDIÇÃO: Ponto de entrada Expo gerado pelo template. As telas reais estão em app/ e são roteadas pelo Expo Router.
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

// Este é o componente inicial do template; as telas de produto ficam nas rotas da pasta app/.
export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
