// GUIA DE EDIÇÃO: Tipos TypeScript partilhados. TipoLancamento contém as opções; Gasto define os campos aceitos pelas telas e pela API.
// Opções válidas para classificar um lançamento financeiro.
export type TipoLancamento = 'entrada' | 'saida';

export type Gasto = {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  tipo?: TipoLancamento;
};