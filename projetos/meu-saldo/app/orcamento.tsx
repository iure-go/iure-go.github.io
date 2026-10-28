import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

import { buscarOrcamento, salvarOrcamento } from '../services/storage';

export default function Orcamento() {
  const [valor, setValor] = useState('');

  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        const limite = await buscarOrcamento();

        if (limite > 0) {
          setValor(limite.toFixed(2).replace('.', ','));
        }
      }

      carregar();
    }, [])
  );

  async function salvar() {
    const limite = Number(valor.replace(',', '.'));

    if (Number.isNaN(limite) || limite <= 0) {
      Alert.alert('Atenção', 'Informe um limite mensal válido.');
      return;
    }

    await salvarOrcamento(limite);
    Alert.alert('Pronto', 'Limite mensal salvo.');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Limite mensal</Text>

      <Text style={styles.subtitulo}>
        Defina quanto pretende gastar por mês.
      </Text>

      <Text style={styles.label}>Valor máximo de gastos</Text>

      <TextInput
        value={valor}
        onChangeText={setValor}
        placeholder="Ex.: 2000,00"
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <Pressable style={styles.botao} onPress={salvar}>
        <Text style={styles.textoBotao}>SALVAR LIMITE</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F4',
    padding: 24,
  },
  titulo: {
    color: '#17211D',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subtitulo: {
    color: '#647067',
    fontSize: 16,
    marginBottom: 30,
    marginTop: 6,
  },
  label: {
    color: '#17211D',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D8E1DB',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    padding: 14,
  },
  botao: {
    alignItems: 'center',
    backgroundColor: '#176A44',
    borderRadius: 10,
    marginTop: 24,
    padding: 16,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});