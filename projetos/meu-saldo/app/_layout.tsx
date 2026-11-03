// GUIA DE EDIÇÃO: Navegação Expo Router. Cada Stack.Screen declara rota e título; ajuste opções nesta configuração.
import { Stack } from 'expo-router';

// Configure aqui as rotas empilhadas e os títulos que aparecem na navegação.
export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Meu Saldo' }} />
      <Stack.Screen name="lancamentos" options={{ title: 'Lançamentos' }} />
      <Stack.Screen name="novo-gasto" options={{ title: 'Novo gasto' }} />
      <Stack.Screen name="relatorio" options={{ title: 'Relatório mensal' }} />
      <Stack.Screen name="editar/[id]" options={{ title: 'Editar lançamento' }}/>
      <Stack.Screen name="orcamento" options={{ title: 'Limite mensal' }} />
    </Stack>
  );
}