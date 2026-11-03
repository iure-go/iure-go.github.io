// GUIA DE EDIÇÃO: Rota de fallback para caminhos não reconhecidos. Altere o Redirect se desejar outro destino.
import { Redirect } from 'expo-router';

// Destino para caminhos que não correspondem a uma tela cadastrada.
export default function NotFound() {
  return <Redirect href="/" />;
}
