import { Gasto } from '../types/gasto';

// Configure EXPO_PUBLIC_API_URL for the device where the API is running.
// Android emulator: http://10.0.2.2:8080/api
// iOS simulator: http://localhost:8080/api
// Physical device: http://<computer-lan-ip>:8080/api
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api';
const PERFIL_ID = process.env.EXPO_PUBLIC_PERFIL_ID ?? 'iure';

async function requisicao<T>(rota: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(`${API_URL}${rota}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Perfil-Id': PERFIL_ID,
      ...init?.headers,
    },
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text();
    throw new Error(detalhe || `Falha na API (${resposta.status}).`);
  }

  if (resposta.status === 204) return undefined as T;
  return resposta.json() as Promise<T>;
}

export async function buscarGastos(): Promise<Gasto[]> {
  return requisicao<Gasto[]>('/lancamentos');
}

export async function criarGasto(gasto: Gasto): Promise<Gasto> {
  const { id: _id, ...novoGasto } = gasto;
  return requisicao<Gasto>('/lancamentos', {
    method: 'POST',
    body: JSON.stringify(novoGasto),
  });
}

export async function atualizarGasto(gasto: Gasto): Promise<Gasto> {
  return requisicao<Gasto>(`/lancamentos/${encodeURIComponent(gasto.id)}`, {
    method: 'PUT',
    body: JSON.stringify(gasto),
  });
}

export async function removerGasto(id: string): Promise<void> {
  await requisicao<void>(`/lancamentos/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function buscarOrcamento(): Promise<number> {
  const mes = new Date().toISOString().slice(0, 7);
  const orcamento = await requisicao<{ valor: number }>(`/orcamento?mes=${mes}`);
  return orcamento.valor;
}

export async function salvarOrcamento(valor: number): Promise<void> {
  const mes = new Date().toISOString().slice(0, 7);
  await requisicao<{ valor: number }>(`/orcamento?mes=${mes}`, {
    method: 'PUT',
    body: JSON.stringify({ valor }),
  });
}
