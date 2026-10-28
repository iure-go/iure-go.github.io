import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import {
  buscarGastos,
  buscarOrcamento,
} from '../services/storage';
import { Gasto } from '../types/gasto';

type Periodo = 'dia' | 'semana' | 'mes' | 'ano';

const PERIODOS: { id: Periodo; titulo: string }[] = [
  { id: 'dia', titulo: 'Dia' },
  { id: 'semana', titulo: 'Semana' },
  { id: 'mes', titulo: 'Mês' },
  { id: 'ano', titulo: 'Ano' },
];

function intervaloDoPeriodo(periodo: Periodo, deslocamento: number) {
  const inicio = new Date();

  inicio.setHours(0, 0, 0, 0);

  if (periodo === 'dia') {
    inicio.setDate(inicio.getDate() + deslocamento);
  }

  if (periodo === 'semana') {
    inicio.setDate(inicio.getDate() + deslocamento * 7);

    const diasDesdeSegunda = (inicio.getDay() + 6) % 7;
    inicio.setDate(inicio.getDate() - diasDesdeSegunda);
  }

  if (periodo === 'mes') {
    inicio.setDate(1);
    inicio.setMonth(inicio.getMonth() + deslocamento);
  }

  if (periodo === 'ano') {
    inicio.setMonth(0, 1);
    inicio.setFullYear(inicio.getFullYear() + deslocamento);
  }

  const fim = new Date(inicio);

  if (periodo === 'dia') {
    fim.setDate(fim.getDate() + 1);
  }

  if (periodo === 'semana') {
    fim.setDate(fim.getDate() + 7);
  }

  if (periodo === 'mes') {
    fim.setMonth(fim.getMonth() + 1);
  }

  if (periodo === 'ano') {
    fim.setFullYear(fim.getFullYear() + 1);
  }

  fim.setMilliseconds(fim.getMilliseconds() - 1);

  return { inicio, fim };
}

function formatarReal(valor: number) {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

function tituloDoPeriodo(periodo: Periodo, inicio: Date) {
  if (periodo === 'dia') {
    return inicio.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
  }

  if (periodo === 'semana') {
    return `Desde ${inicio.toLocaleDateString('pt-BR')}`;
  }

  if (periodo === 'mes') {
    return inicio.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  }

  return inicio.getFullYear().toString();
}

function formatarPeriodo(
  periodo: Periodo,
  inicio: Date,
  fim: Date
) {
  if (periodo === 'dia') {
    return inicio.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  if (periodo === 'mes') {
    return inicio.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  }

  if (periodo === 'ano') {
    return inicio.getFullYear().toString();
  }

  return `${inicio.toLocaleDateString('pt-BR')} até ${fim.toLocaleDateString(
    'pt-BR'
  )}`;
}

export default function Inicio() {
  const [lancamentos, setLancamentos] = useState<Gasto[]>([]);
  const [limiteMensal, setLimiteMensal] = useState(0);
  const [periodo, setPeriodo] = useState<Periodo>('mes');
  const [deslocamento, setDeslocamento] = useState(0);

  useFocusEffect(
    useCallback(() => {
      async function carregarDados() {
        const [gastosSalvos, limiteSalvo] = await Promise.all([
          buscarGastos(),
          buscarOrcamento(),
        ]);

        setLancamentos(gastosSalvos);
        setLimiteMensal(limiteSalvo);
      }

      carregarDados();
    }, [])
  );

  const { inicio, fim } = intervaloDoPeriodo(periodo, deslocamento);

  const lancamentosDoPeriodo = lancamentos.filter((item) => {
    const data = new Date(item.data);

    return data >= inicio && data <= fim;
  });

  const entradas = lancamentosDoPeriodo.filter(
    (item) => item.tipo === 'entrada'
  );

  const saidas = lancamentosDoPeriodo.filter(
    (item) => item.tipo !== 'entrada'
  );

  const totalEntradas = entradas.reduce(
    (total, item) => total + item.valor,
    0
  );

  const totalSaidas = saidas.reduce(
    (total, item) => total + item.valor,
    0
  );

  const saldo = totalEntradas - totalSaidas;

  const gastosPorCategoria = saidas.reduce<Record<string, number>>(
    (total, item) => {
      total[item.categoria] = (total[item.categoria] || 0) + item.valor;
      return total;
    },
    {}
  );

  const categorias = Object.entries(gastosPorCategoria)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const maiorCategoria = Math.max(
    ...categorias.map((categoria) => categoria[1]),
    1
  );

  const recentes = [...lancamentosDoPeriodo]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  const percentualLimite =
    limiteMensal > 0
      ? Math.min((totalSaidas / limiteMensal) * 100, 100)
      : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
    >
      <View style={styles.topo}>
        <View>
          <Text style={styles.marca}>
            Meu<Text style={styles.verde}>Saldo</Text>
          </Text>

          <Text style={styles.periodoAtual}>
            {tituloDoPeriodo(periodo, inicio)}
          </Text>
        </View>

        <Pressable
          style={styles.botaoAdicionar}
          onPress={() => router.push('/novo-gasto')}
        >
          <Text style={styles.textoBotaoAdicionar}>+</Text>
        </Pressable>
      </View>

      <View style={styles.periodos}>
        {PERIODOS.map((item) => {
          const selecionado = periodo === item.id;

          return (
            <Pressable
              key={item.id}
              onPress={() => {
                setPeriodo(item.id);
                setDeslocamento(0);
              }}
              style={[
                styles.botaoPeriodo,
                selecionado && styles.botaoPeriodoSelecionado,
              ]}
            >
              <Text
                style={[
                  styles.textoPeriodo,
                  selecionado && styles.textoPeriodoSelecionado,
                ]}
              >
                {item.titulo}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.navegacaoData}>
        <Pressable
          style={styles.botaoSeta}
          onPress={() => setDeslocamento((valor) => valor - 1)}
        >
          <Text style={styles.textoSeta}>‹</Text>
        </Pressable>

        <Text style={styles.tituloNavegacao}>
          {formatarPeriodo(periodo, inicio, fim)}
        </Text>

        <Pressable
          style={[
            styles.botaoSeta,
            deslocamento === 0 && styles.botaoSetaDesabilitado,
          ]}
          disabled={deslocamento === 0}
          onPress={() => setDeslocamento((valor) => valor + 1)}
        >
          <Text style={styles.textoSeta}>›</Text>
        </Pressable>
      </View>

      <View style={styles.cardSaldo}>
        <Text style={styles.labelCard}>SALDO DO PERÍODO</Text>
        <Text style={styles.saldo}>{formatarReal(saldo)}</Text>

        <Text style={styles.textoCard}>
          {lancamentosDoPeriodo.length} lançamento(s)
        </Text>
      </View>

      <View style={styles.resumo}>
        <View style={styles.cardResumo}>
          <Text style={styles.labelResumo}>Entradas</Text>
          <Text style={styles.entrada}>
            {formatarReal(totalEntradas)}
          </Text>
        </View>

        <View style={styles.cardResumo}>
          <Text style={styles.labelResumo}>Saídas</Text>
          <Text style={styles.saida}>{formatarReal(totalSaidas)}</Text>
        </View>
      </View>

      {periodo === 'mes' && (
        <View style={styles.cardLimite}>
          <View style={styles.linhaLimite}>
            <Text style={styles.labelInfo}>Limite mensal</Text>

            <Pressable onPress={() => router.push('/orcamento')}>
              <Text style={styles.editar}>Editar</Text>
            </Pressable>
          </View>

          <Text style={styles.valorInfo}>
            {limiteMensal > 0
              ? `${formatarReal(totalSaidas)} de ${formatarReal(limiteMensal)}`
              : 'Defina seu limite mensal'}
          </Text>

          {limiteMensal > 0 && (
            <View style={styles.fundoBarra}>
              <View
                style={[
                  styles.barra,
                  {
                    width: `${percentualLimite}%`,
                    backgroundColor:
                      totalSaidas > limiteMensal ? '#C84D43' : '#176A44',
                  },
                ]}
              />
            </View>
          )}
        </View>
      )}

      <Text style={styles.tituloSecao}>Maiores gastos</Text>

      {categorias.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.textoVazio}>
            Nenhuma saída neste período.
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
                  { width: `${(valor / maiorCategoria) * 100}%` },
                ]}
              />
            </View>
          </View>
        ))
      )}

      <View style={styles.linhaSecao}>
        <Text style={styles.tituloSecao}>Recentes</Text>

        <Pressable onPress={() => router.push('/lancamentos')}>
          <Text style={styles.editar}>Ver todos</Text>
        </Pressable>
      </View>

      {recentes.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.textoVazio}>
            Nenhum lançamento neste período.
          </Text>
        </View>
      ) : (
        recentes.map((item) => {
          const entrada = item.tipo === 'entrada';

          return (
            <View key={item.id} style={styles.itemRecente}>
              <View>
                <Text style={styles.descricao}>{item.descricao}</Text>

                <Text style={styles.detalhes}>
                  {item.categoria} ·{' '}
                  {new Date(item.data).toLocaleDateString('pt-BR')}
                </Text>
              </View>

              <Text
                style={[
                  styles.valorRecente,
                  entrada ? styles.entrada : styles.saida,
                ]}
              >
                {entrada ? '+ ' : '- '}
                {formatarReal(item.valor)}
              </Text>
            </View>
          );
        })
      )}

      <Pressable
        style={styles.botaoSecundario}
        onPress={() => router.push('/relatorio')}
      >
        <Text style={styles.textoBotaoSecundario}>
          ABRIR RELATÓRIO MENSAL
        </Text>
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
    padding: 18,
    paddingTop: 22,
  },
  topo: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  marca: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  verde: {
    color: '#50D99A',
  },
  periodoAtual: {
    color: '#B8C8BE',
    fontSize: 13,
    marginTop: 18,
    textTransform: 'capitalize',
  },
  botaoAdicionar: {
    alignItems: 'center',
    backgroundColor: '#50D99A',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    width: 38,
  },
  textoBotaoAdicionar: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '400',
  },
  periodos: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  botaoPeriodo: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 9,
  },
  botaoPeriodoSelecionado: {
    backgroundColor: '#10442F',
  },
  textoPeriodo: {
    color: '#B8C8BE',
    fontSize: 13,
    fontWeight: 'bold',
  },
  textoPeriodoSelecionado: {
    color: '#50D99A',
  },
  cardSaldo: {
    backgroundColor: '#10442F',
    borderRadius: 16,
    marginTop: 16,
    padding: 22,
  },
  labelCard: {
    color: '#B8C8BE',
    fontSize: 13,
    fontWeight: 'bold',
  },
  saldo: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 8,
  },
  textoCard: {
    color: '#50D99A',
    fontSize: 15,
    marginTop: 8,
  },
  resumo: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cardResumo: {
    backgroundColor: 'transparent',
    borderColor: '#2A3D33',
    borderWidth: 1,
    borderRadius: 14,
    flex: 1,
    padding: 16,
  },
  labelResumo: {
    color: '#B8C8BE',
    fontSize: 14,
  },
  entrada: {
    color: '#50D99A',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6,
  },
  saida: {
    color: '#FF756D',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6,
  },
  cardLimite: {
    backgroundColor: 'transparent',
    borderColor: '#2A3D33',
    borderWidth: 1,
    borderRadius: 14,
    marginTop: 16,
    padding: 18,
  },
  linhaLimite: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelInfo: {
    color: '#B8C8BE',
    fontSize: 14,
  },
  valorInfo: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6,
  },
  editar: {
    color: '#50D99A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tituloSecao: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 28,
  },
  linhaSecao: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemCategoria: {
    backgroundColor: 'transparent',
    borderColor: '#2A3D33',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
    padding: 16,
  },
  linhaCategoria: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nomeCategoria: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  valorCategoria: {
    color: '#C84D43',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fundoBarra: {
    backgroundColor: '#263A30',
    borderRadius: 8,
    height: 8,
    marginTop: 12,
    overflow: 'hidden',
  },
  barra: {
    backgroundColor: '#50D99A',
    borderRadius: 8,
    height: '100%',
  },
  vazio: {
    backgroundColor: 'transparent',
    borderColor: '#2A3D33',
    borderWidth: 1,
    borderRadius: 12,
    padding: 18,
  },
  textoVazio: {
    color: '#B8C8BE',
    textAlign: 'center',
  },
  itemRecente: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomColor: '#2A3D33',
    borderBottomWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 16,
  },
  descricao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detalhes: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 5,
  },
  valorRecente: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  botaoSecundario: {
    alignItems: 'center',
    borderColor: '#50D99A',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 28,
    padding: 16,
  },
  textoBotaoSecundario: {
    color: '#50D99A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  navegacaoData: {
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 16,
  },
  botaoSeta: {
    alignItems: 'center',
    backgroundColor: '#1C3026',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  botaoSetaDesabilitado: {
    opacity: 0.35,
  },
  textoSeta: {
    color: '#50D99A',
    fontSize: 28,
    fontWeight: 'bold',
  },
  tituloNavegacao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
});
