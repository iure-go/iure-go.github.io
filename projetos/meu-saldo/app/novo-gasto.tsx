import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { criarGasto } from '../services/storage';
import { Gasto, TipoLancamento } from '../types/gasto';

const CATEGORIAS = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer',
  'Outros',
];

export default function NovoGasto() {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('Outros');
  const [tipo, setTipo] = useState<TipoLancamento>('saida');
  const [data, setData] = useState(
    new Date().toISOString().slice(0, 10)
  );

  async function salvarLancamento() {
    const valorNumerico = Number(valor.replace(',', '.'));
    const dataSelecionada = new Date(`${data}T12:00:00`);

    if (!descricao || !valor || Number.isNaN(valorNumerico)) {
      Alert.alert('Atenção', 'Preencha uma descrição e um valor válido.');
      return;
    }

    const novoLancamento: Gasto = {
      id: '',
      descricao,
      valor: valorNumerico,
      categoria,
      data: dataSelecionada.toISOString(),
      tipo,
    };

    await criarGasto(novoLancamento);

    Alert.alert('Pronto', 'Lançamento salvo com sucesso!');
    router.back();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
    >
      <Text style={styles.titulo}>Novo lançamento</Text>
      <Text style={styles.subtitulo}>
        Registre uma entrada ou saída financeira.
      </Text>

      <Text style={styles.label}>Tipo</Text>

      <View style={styles.tipos}>
        <Pressable
          onPress={() => setTipo('saida')}
          style={[
            styles.botaoTipo,
            tipo === 'saida' && styles.botaoSaidaSelecionado,
          ]}
        >
          <Text
            style={[
              styles.textoTipo,
              tipo === 'saida' && styles.textoTipoSelecionado,
            ]}
          >
            Saída
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setTipo('entrada')}
          style={[
            styles.botaoTipo,
            tipo === 'entrada' && styles.botaoEntradaSelecionado,
          ]}
        >
          <Text
            style={[
              styles.textoTipo,
              tipo === 'entrada' && styles.textoTipoSelecionado,
            ]}
          >
            Entrada
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Ex.: Salário ou Mercado"
        placeholderTextColor="#94A29A"
        style={styles.input}
      />

      <Text style={styles.label}>Valor</Text>
      <TextInput
        value={valor}
        onChangeText={setValor}
        placeholder="Ex.: 142,80"
        placeholderTextColor="#94A29A"
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <Text style={styles.label}>Categoria</Text>

      <Text style={styles.label}>Data</Text>

<TextInput
  value={data}
  onChangeText={setData}
  placeholder="2026-09-12"
  placeholderTextColor="#94A29A"
  maxLength={10}
  style={styles.input}
/>

      <View style={styles.categorias}>
        {CATEGORIAS.map((item) => {
          const selecionada = categoria === item;

          return (
            <Pressable
              key={item}
              onPress={() => setCategoria(item)}
              style={[
                styles.botaoCategoria,
                selecionada && styles.botaoCategoriaSelecionada,
              ]}
            >
              <Text
                style={[
                  styles.textoCategoria,
                  selecionada && styles.textoCategoriaSelecionada,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.botaoSalvar} onPress={salvarLancamento}>
        <Text style={styles.textoBotaoSalvar}>SALVAR LANÇAMENTO</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14221B',
  },
  conteudo: {
    padding: 24,
    paddingTop: 28,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitulo: {
    fontSize: 16,
    color: '#B8C8BE',
    marginTop: 6,
    marginBottom: 28,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tipos: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  botaoTipo: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2A3D33',
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
  },
  botaoSaidaSelecionado: {
    backgroundColor: '#7E3F3A',
    borderColor: '#FF756D',
  },
  botaoEntradaSelecionado: {
    backgroundColor: '#10442F',
    borderColor: '#50D99A',
  },
  textoTipo: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  textoTipoSelecionado: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#1C3026',
    borderWidth: 1,
    borderColor: '#2A3D33',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 22,
  },
  categorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  botaoCategoria: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#50D99A',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  botaoCategoriaSelecionada: {
    backgroundColor: '#10442F',
  },
  textoCategoria: {
    color: '#50D99A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  textoCategoriaSelecionada: {
    color: '#FFFFFF',
  },
  botaoSalvar: {
    backgroundColor: '#50D99A',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  textoBotaoSalvar: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
