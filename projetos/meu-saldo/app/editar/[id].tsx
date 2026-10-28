import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { atualizarGasto, buscarGastos } from '../../services/storage';
import { Gasto, TipoLancamento } from '../../types/gasto';

const CATEGORIAS = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer',
  'Outros',
];

export default function EditarLancamento() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('Outros');
  const [tipo, setTipo] = useState<TipoLancamento>('saida');
  const [data, setData] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const gastos = await buscarGastos();
      const gasto = gastos.find((item) => item.id === id);

      if (!gasto) {
        Alert.alert('Erro', 'Lançamento não encontrado.');
        router.back();
        return;
      }

      setDescricao(gasto.descricao);
      setValor(gasto.valor.toFixed(2).replace('.', ','));
      setCategoria(gasto.categoria);
      setTipo(gasto.tipo || 'saida');
      setData(new Date(gasto.data).toISOString().slice(0, 10));
      setCarregando(false);
    }

    carregar();
  }, [id]);

  async function salvarEdicao() {
    const valorNumerico = Number(valor.replace(',', '.'));
    const dataSelecionada = new Date(`${data}T12:00:00`);

    if (
  !descricao ||
  !valor ||
  Number.isNaN(valorNumerico) ||
  Number.isNaN(dataSelecionada.getTime())
) {
  Alert.alert(
    'Atenção',
    'Preencha descrição, valor e uma data válida.'
  );
  return;
}

    const gastoAtualizado: Gasto = {
    id,
    descricao,
    valor: valorNumerico,
    categoria,
    tipo,
    data: dataSelecionada.toISOString(),
  };

    await atualizarGasto(gastoAtualizado);

    Alert.alert('Pronto', 'Lançamento atualizado!');
    router.back();
  }

  if (carregando) {
    return (
      <View style={styles.carregando}>
        <Text>Carregando lançamento...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      <Text style={styles.titulo}>Editar lançamento</Text>

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.tipos}>
        {(['saida', 'entrada'] as TipoLancamento[]).map((item) => {
          const selecionado = tipo === item;

          return (
            <Pressable
              key={item}
              onPress={() => setTipo(item)}
              style={[
                styles.botaoTipo,
                selecionado &&
                  (item === 'entrada'
                    ? styles.entradaSelecionada
                    : styles.saidaSelecionada),
              ]}
            >
              <Text
                style={[
                  styles.textoTipo,
                  selecionado && styles.textoSelecionado,
                ]}
              >
                {item === 'entrada' ? 'Entrada' : 'Saída'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        value={descricao}
        onChangeText={setDescricao}
        style={styles.input}
      />

      <Text style={styles.label}>Valor</Text>
      <TextInput
        value={valor}
        onChangeText={setValor}
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <Text style={styles.label}>Data</Text>

<TextInput
  value={data}
  onChangeText={setData}
  placeholder="2026-09-12"
  maxLength={10}
  style={styles.input}
/>

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.categorias}>
        {CATEGORIAS.map((item) => {
          const selecionada = categoria === item;

          return (
            <Pressable
              key={item}
              onPress={() => setCategoria(item)}
              style={[
                styles.botaoCategoria,
                selecionada && styles.categoriaSelecionada,
              ]}
            >
              <Text
                style={[
                  styles.textoCategoria,
                  selecionada && styles.textoSelecionado,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.botaoSalvar} onPress={salvarEdicao}>
        <Text style={styles.textoSalvar}>SALVAR ALTERAÇÕES</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F4' },
  conteudo: { padding: 24 },
  carregando: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titulo: {
    color: '#17211D',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 28,
  },
  label: {
    color: '#17211D',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipos: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  botaoTipo: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D8E1DB',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    padding: 13,
  },
  entradaSelecionada: { backgroundColor: '#176A44', borderColor: '#176A44' },
  saidaSelecionada: { backgroundColor: '#C84D43', borderColor: '#C84D43' },
  textoTipo: { color: '#17211D', fontSize: 15, fontWeight: 'bold' },
  textoSelecionado: { color: '#FFFFFF' },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D8E1DB',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 22,
    padding: 14,
  },
  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  botaoCategoria: {
    backgroundColor: '#FFFFFF',
    borderColor: '#176A44',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  categoriaSelecionada: { backgroundColor: '#176A44' },
  textoCategoria: { color: '#176A44', fontSize: 14, fontWeight: 'bold' },
  botaoSalvar: {
    alignItems: 'center',
    backgroundColor: '#176A44',
    borderRadius: 10,
    marginTop: 32,
    padding: 16,
  },
  textoSalvar: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
});
