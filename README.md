# Controle de Saída de Materiais e Emissão de Romaneio - GEL Engenharia

Aplicação web e PWA moderna, responsiva e de alta legibilidade desenvolvida para o controle de portaria e expedição de cargas nos canteiros de obras da **GEL - Goetze Lobato Engenharia S.A.** (**UHE Estrela** e **PCH Taboca**).

---

## 🌐 Acesso Online & Instalação do Aplicativo

- 🔗 **Link de Acesso Direto**: **[https://eullon1234-creator.github.io/saida-portaria/](https://eullon1234-creator.github.io/saida-portaria/)**
- 📦 **Repositório GitHub**: **[https://github.com/eullon1234-creator/saida-portaria](https://github.com/eullon1234-creator/saida-portaria)**

---

## 📲 Como Baixar e Instalar o Aplicativo no Celular e Tablet

A aplicação foi desenvolvida no padrão **PWA (Progressive Web App)**, permitindo ser instalada diretamente na tela do seu dispositivo sem precisar de loja (Google Play / App Store) e com carregamento instantâneo:

### 🤖 No Celular ou Tablet Android (Chrome, Samsung Internet, Edge):
1. Abra o link **[https://eullon1234-creator.github.io/saida-portaria/](https://eullon1234-creator.github.io/saida-portaria/)**.
2. Toque no botão destacado **"📲 Baixar App"** na barra superior ou no aviso inferior.
3. Toque em **"Instalar Agora no Meu Dispositivo"** e confirme.
4. O ícone oficial da **Portaria GEL** será adicionado à sua tela de início e gaveta de aplicativos.

### 🍎 No iPhone ou iPad (Safari):
1. Abra o link no navegador **Safari**.
2. Toque no botão de **Compartilhar** (ícone de quadrado com a seta para cima na barra inferior).
3. Role para baixo e selecione **"Adicionar à Tela de Início"** (ícone de quadrado com o sinal +).
4. Toque em **"Adicionar"** no canto superior direito.

### 💻 No Computador (Google Chrome / Edge):
1. Acesse o link no Chrome ou Edge.
2. Clique no ícone de download/instalação no canto direito da barra de endereços (ou no botão **"Baixar App"**).
3. O app abrirá em uma janela exclusiva, limpa e sem barras de navegação.

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

---

## 🚀 Como Publicar / Atualizar no GitHub Pages

Para atualizar a versão publicada no GitHub Pages:
```bash
npm run deploy
```
*(Ou envie um push para a branch `main` e o GitHub Actions fará o build e deploy automaticamente).*
