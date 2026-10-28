import { Stack } from 'expo-router';

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