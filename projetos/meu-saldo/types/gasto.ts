export type TipoLancamento = 'entrada' | 'saida';

export type Gasto = {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  tipo?: TipoLancamento;
};