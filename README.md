# Controle de Saída de Materiais e Emissão de Romaneio - GEL Engenharia

Aplicação web moderna, responsiva e de alta legibilidade desenvolvida para o controle de portaria e expedição de cargas nos canteiros de obras da **GEL - Goetze Lobato Engenharia S.A.** (**UHE Estrela** e **PCH Taboca**).

---

## 🌐 Acesso Online (GitHub Pages)

- 🔗 **Link de Acesso Direto**: **[https://eullon1234-creator.github.io/saida-portaria/](https://eullon1234-creator.github.io/saida-portaria/)**
- 📦 **Repositório GitHub**: **[https://github.com/eullon1234-creator/saida-portaria](https://github.com/eullon1234-creator/saida-portaria)**

---

## 🚀 Principais Funcionalidades

1. **Seletor Obrigatório de Origem (Unidade Emissora)**:
   - Destaque no topo para seleção entre **UHE Estrela** e **PCH Taboca**.
   - O romaneio gerado exibe a origem em destaque inconfundível.

2. **Formulário Dinâmico com Alto Contraste**:
   - Otimizado para telas sob luz solar direta em portarias e canteiros.
   - Botões e inputs grandes para toque ágil em celular e tablet.
   - **Vínculo Automático Placa ⇄ Motorista**: ao digitar a placa (formato Mercosul ou antigo), o sistema autocompleta o motorista e empresa cadastrados. Se for novo, salva o vínculo automaticamente no banco.
   - Adição e remoção rápida de múltiplos itens com atalhos de unidade (`un`, `kg`, `m³`, `sc`, `barra`, `ton`, etc.).

3. **Impressão em 2 Vias na Mesma Folha (A4)**:
   - Atende à exigência de **duas vias repetidas** na mesma folha:
     - **1ª Via**: Arquivo da Portaria / Obra (Controle Interno)
     - **2ª Via**: Acompanha a Carga / Motorista
   - Contém a **logomarca oficial da GEL Engenharia** nas duas vias.
   - Linha pontilhada de corte central com ícone de tesoura.
   - Espaços para **Assinatura do Conferente/Portaria** e **Assinatura do Motorista**.

4. **Integração com Firebase Firestore + Modo Local (Offline First)**:
   - **Coleção `veiculos_motoristas`**: Cadastro com `id`, `placa`, `nome_motorista`, `empresa_padrao`, `atualizado_em`.
   - **Coleção `romaneios_saida`**: `numero_romaneio`, `origem`, `empresa`, `destino`, `motorista`, `placa`, `itens`, `data_hora`.
   - Integrado diretamente ao projeto Firebase `saida-portaria`.

---

## 💻 Como Rodar o Projeto Localmente

No terminal da pasta do projeto:
```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento (acessível no celular via Wi-Fi)
npm run dev -- --host
```

Acesse no navegador:
- No computador: [http://localhost:5173](http://localhost:5173)
- No celular ou tablet na mesma rede: `http://<IP_DO_PC>:5173`

---

## 🚀 Como Publicar / Atualizar no GitHub Pages

Para atualizar a versão publicada no GitHub Pages:
```bash
npm run deploy
```
*(Ou envie um push para a branch `main` e o GitHub Actions fará o build e deploy automaticamente).*

---

## 🖨️ Dica para Impressão Perfeita em PDF ou Papel
Ao clicar em **"Imprimir / Salvar PDF"**:
1. Destino: Selecione a impressora da portaria ou "Salvar como PDF".
2. Layout: **Retrato (Portrait)**.
3. Margens: **Padrão ou Mínimas**.
4. Gráficos de segundo plano: **Marcado** (para imprimir a logo e bordas com fidelidade).
As duas vias sairão perfeitamente diagramadas na mesma folha A4 com a linha de corte ao meio!
