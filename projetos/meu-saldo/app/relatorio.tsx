import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { buscarGastos } from '../services/storage';
import { Gasto } from '../types/gasto';

function formatarReal(valor: number) {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

export default function Relatorio() {
  const [lancamentos, setLancamentos] = useState<Gasto[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        setLancamentos(await buscarGastos());
      }

      carregar();
    }, [])
  );

  const hoje = new Date();

  const lancamentosDoMes = lancamentos.filter((item) => {
    const data = new Date(item.data);

    return (
      data.getMonth() === hoje.getMonth() &&
      data.getFullYear() === hoje.getFullYear()
    );
  });

  const entradas = lancamentosDoMes
    .filter((item) => item.tipo === 'entrada')
    .reduce((total, item) => total + item.valor, 0);

  const saidas = lancamentosDoMes
    .filter((item) => item.tipo !== 'entrada')
    .reduce((total, item) => total + item.valor, 0);

  const saldo = entradas - saidas;

  const porCategoria = lancamentosDoMes
    .filter((item) => item.tipo !== 'entrada')
    .reduce<Record<string, number>>((total, item) => {
      total[item.categoria] = (total[item.categoria] || 0) + item.valor;
      return total;
    }, {});

  const categorias = Object.entries(porCategoria).sort(
    (a, b) => b[1] - a[1]
  );

  const maiorValor = Math.max(...categorias.map((item) => item[1]), 1);

  const tituloMes = hoje.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      <Text style={styles.titulo}>Relatório mensal</Text>
      <Text style={styles.subtitulo}>{tituloMes}</Text>

      <View style={styles.cardSaldo}>
        <Text style={styles.labelCard}>SALDO DO MÊS</Text>
        <Text style={styles.saldo}>{formatarReal(saldo)}</Text>
      </View>

      <View style={styles.resumo}>
        <View style={styles.cardResumo}>
          <Text style={styles.labelResumo}>Entradas</Text>
          <Text style={styles.entrada}>{formatarReal(entradas)}</Text>
        </View>

        <View style={styles.cardResumo}>
          <Text style={styles.labelResumo}>Saídas</Text>
          <Text style={styles.saida}>{formatarReal(saidas)}</Text>
        </View>
      </View>

      <Text style={styles.tituloSecao}>Gastos por categoria</Text>

      {categorias.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.textoVazio}>
            Nenhuma saída registrada neste mês.
          </Text>
        </View>
      ) : (
        categorias.map(([categoria, valor]) => (
          <View key={categoria} style={styles.itemCategoria}>
            <View style={styles.linhaCategoria}>
              <Text style={styles.nomeCategoria}>{categoria}</Text>
              <Text style={styles.valorCategoria}>{formatarReal(valor)}</Text>
            </View>

            <View style={styles.fundoBarra}>
              <View
                style={[
                  styles.barra,
                  { width: `${(valor / maiorValor) * 100}%` },
                ]}
              />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F4',
  },
  conteudo: {
    padding: 24,
  },
  titulo: {
    color: '#17211D',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: '#647067',
    fontSize: 16,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  cardSaldo: {
    backgroundColor: '#176A44',
    borderRadius: 16,
    marginTop: 24,
    padding: 22,
  },
  labelCard: {
    color: '#D9F4E5',
    fontSize: 13,
    fontWeight: 'bold',
  },
  saldo: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
  resumo: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cardResumo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flex: 1,
    padding: 16,
  },
  labelResumo: {
    color: '#647067',
    fontSize: 14,
  },
  entrada: {
    color: '#176A44',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6,
  },
  saida: {
    color: '#C84D43',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6,
  },
  tituloSecao: {
    color: '#17211D',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 14,
  },
  itemCategoria: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    padding: 16,
  },
  linhaCategoria: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nomeCategoria: {
    color: '#17211D',
    fontSize: 16,
    fontWeight: 'bold',
  },
  valorCategoria: {
    color: '#C84D43',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fundoBarra: {
    backgroundColor: '#E2EAE5',
    borderRadius: 8,
    height: 8,
    marginTop: 12,
    overflow: 'hidden',
  },
  barra: {
    backgroundColor: '#176A44',
    borderRadius: 8,
    height: '100%',
  },
  vazio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
  },
  textoVazio: {
    color: '#647067',
    textAlign: 'center',
  },
});