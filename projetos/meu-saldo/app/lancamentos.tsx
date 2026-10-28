import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { buscarGastos, removerGasto as removerGastoNaApi } from '../services/storage';
import { Gasto } from '../types/gasto';

type Filtro = 'todos' | 'entrada' | 'saida';

function formatarData(data: string) {
  return new Date(data).toLocaleDateString('pt-BR');
}

export default function Lancamentos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todas');

  useFocusEffect(
    useCallback(() => {
      async function carregarGastos() {
        setGastos(await buscarGastos());
      }

      carregarGastos();
    }, [])
  );

  const categorias = [
    'Todas',
    ...Array.from(new Set(gastos.map((gasto) => gasto.categoria))).sort(),
  ];

  const gastosFiltrados = [...gastos]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .filter((gasto) => {
      const tipoCorreto =
        filtro === 'todos' ||
        (filtro === 'entrada'
          ? gasto.tipo === 'entrada'
          : gasto.tipo !== 'entrada');

      const categoriaCorreta =
        categoriaSelecionada === 'Todas' ||
        gasto.categoria === categoriaSelecionada;

      return tipoCorreto && categoriaCorreta;
    });

  async function removerGasto(id: string) {
    await removerGastoNaApi(id);
    setGastos((atuais) => atuais.filter((gasto) => gasto.id !== id));
  }

  function confirmarRemocao(id: string) {
    if (Platform.OS === 'web') {
      if (window.confirm('Deseja remover este lançamento?')) {
        void removerGasto(id);
      }
      return;
    }

    Alert.alert('Remover lançamento', 'Deseja remover este lançamento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          void removerGasto(id);
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={gastosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View style={styles.cabecalho}>
            <Text style={styles.titulo}>Seus lançamentos</Text>

            <Text style={styles.subtitulo}>
              {gastosFiltrados.length} lançamento(s) exibido(s)
            </Text>

            <View style={styles.filtros}>
              {(['todos', 'entrada', 'saida'] as Filtro[]).map((item) => {
                const selecionado = filtro === item;
                const texto =
                  item === 'todos'
                    ? 'Todos'
                    : item === 'entrada'
                      ? 'Entradas'
                      : 'Saídas';

                return (
                  <Pressable
                    key={item}
                    onPress={() => setFiltro(item)}
                    style={[
                      styles.botaoFiltro,
                      selecionado && styles.botaoFiltroSelecionado,
                    ]}
                  >
                    <Text
                      style={[
                        styles.textoFiltro,
                        selecionado && styles.textoFiltroSelecionado,
                      ]}
                    >
                      {texto}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categorias}
            >
              {categorias.map((categoria) => {
                const selecionada = categoriaSelecionada === categoria;

                return (
                  <Pressable
                    key={categoria}
                    onPress={() => setCategoriaSelecionada(categoria)}
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
                      {categoria}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Text style={styles.textoVazio}>
              Nenhum lançamento encontrado.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const ehEntrada = item.tipo === 'entrada';

          return (
            <View style={styles.item}>
              <View style={styles.informacoes}>
                <Text style={styles.descricao}>{item.descricao}</Text>

                <Text style={styles.detalhes}>
                  {ehEntrada ? 'Entrada' : 'Saída'} · {item.categoria} ·{' '}
                  {formatarData(item.data)}
                </Text>
              </View>

              <View style={styles.direita}>
                <Text
                  style={[
                    styles.valor,
                    ehEntrada ? styles.entrada : styles.saida,
                  ]}
                >
                  {ehEntrada ? '+ ' : '- '}
                  R$ {item.valor.toFixed(2).replace('.', ',')}
                </Text>

                <Pressable
                    onPress={() =>
                        router.push({
                        pathname: '/editar/[id]',
                        params: { id: item.id },
                        })
                    }
                    >
                    <Text style={styles.editar}>Editar</Text>
                </Pressable>

                <Pressable onPress={() => confirmarRemocao(item.id)}>
                  <Text style={styles.remover}>Remover</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F4',
  },
  lista: {
    padding: 20,
  },
  cabecalho: {
    marginBottom: 18,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#17211D',
  },
  subtitulo: {
    fontSize: 15,
    color: '#647067',
    marginTop: 4,
  },
  filtros: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  botaoFiltro: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#176A44',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  botaoFiltroSelecionado: {
    backgroundColor: '#176A44',
  },
  textoFiltro: {
    color: '#176A44',
    fontSize: 14,
    fontWeight: 'bold',
  },
  textoFiltroSelecionado: {
    color: '#FFFFFF',
  },
  categorias: {
    gap: 8,
    paddingTop: 12,
  },
  botaoCategoria: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D8E1DB',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  botaoCategoriaSelecionada: {
    backgroundColor: '#17211D',
    borderColor: '#17211D',
  },
  textoCategoria: {
    color: '#647067',
    fontSize: 14,
  },
  textoCategoriaSelecionada: {
    color: '#FFFFFF',
  },
  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  informacoes: {
    flex: 1,
  },
  descricao: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#17211D',
  },
  detalhes: {
    color: '#647067',
    marginTop: 6,
  },
  direita: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  valor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  entrada: {
    color: '#176A44',
  },
  saida: {
    color: '#C84D43',
  },
  remover: {
    color: '#C84D43',
    fontSize: 13,
    marginTop: 10,
  },
  vazio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  textoVazio: {
    color: '#647067',
    textAlign: 'center',
  },
  editar: {
    color: '#176A44',
    fontSize: 13,
    marginTop: 10,
  },
});
