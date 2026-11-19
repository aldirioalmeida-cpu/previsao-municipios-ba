# Previsão do tempo por município — Bahia

Gera duas vezes por dia o arquivo `previsao.json` com a previsão de 10 dias do modelo
**ECMWF IFS 0,25°** (via [Open-Meteo](https://open-meteo.com/)) para os 417 municípios da Bahia.
A página do INEMA lê esse arquivo pelo jsDelivr (`cdn.jsdelivr.net`, domínio já liberado no ba.gov.br).

## Arquivos

| Arquivo | Função |
|---|---|
| `dados/municipios_ba.csv` | Nome e coordenadas (IBGE) dos 417 municípios |
| `gerar_previsao.py` | Baixa a previsão e grava `previsao.json` (só biblioteca padrão do Python) |
| `.github/workflows/atualizar-previsao.yml` | Roda o gerador às 06:30 e 18:30 (horário da Bahia) e limpa o cache do jsDelivr |
| `previsao.json` | Arquivo lido pela página (atualizado automaticamente) |
| `pagina/previsao-por-cidades.html` | Código para colar no Corpo da página do Drupal (formato "HTML completo") |

## Como colocar no ar

1. Crie um repositório **público** no GitHub (ex.: `previsao-municipios-ba`).
   O jsDelivr só serve arquivos de repositórios públicos.
2. Envie todos os arquivos desta pasta (inclusive a pasta `.github`) em **Add file → Upload files**.
   Se a pasta `.github` não subir pelo navegador, crie o arquivo em **Add file → Create new file**
   com o nome `.github/workflows/atualizar-previsao.yml` e cole o conteúdo.
3. Em **Settings → Actions → General → Workflow permissions**, marque **Read and write permissions**.
4. Em **Actions → Atualizar previsão → Run workflow**, rode uma vez para testar.
5. Confira se o arquivo abre em
   `https://cdn.jsdelivr.net/gh/<USUARIO>/<REPOSITORIO>@main/previsao.json`.
6. Na página do Drupal, troque `USUARIO/REPOSITORIO` na linha `var URL_JSON = ...` pelo seu usuário/repositório.

## Observações

- O GitHub desativa tarefas agendadas de repositórios sem atividade por 60 dias. Como o próprio
  workflow faz commits todo dia, isso não deve acontecer, mas se parar, reative em **Actions**.
- Se o Open-Meteo falhar, o gerador não grava nada e a página continua mostrando a última previsão
  válida (a data de atualização aparece no rodapé da página).
- O Open-Meteo é gratuito para uso não comercial; o volume aqui (~420 pontos, 2× ao dia) fica muito
  abaixo do limite diário.
