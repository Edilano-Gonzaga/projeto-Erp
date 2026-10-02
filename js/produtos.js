const btnNovoProduto = document.querySelector('.produtos-topo .btn-primario');
const modalFundo = document.querySelector('.modal-fundo');
const btnFechar = document.querySelector('.btn-fechar');
const btnCancelar = document.querySelector('.modal-botoes .btn-secundario');
const form = document.querySelector('.modal form');
const gradeProdutos = document.querySelector('.grade-produtos');
const campoBusca = document.getElementById('busca');

let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
let logs = JSON.parse(localStorage.getItem('logs_exclusao')) || [];

function abrirModal(){ modalFundo.style.display = 'flex'; }
function fecharModal(){ 
    modalFundo.style.display = 'none'; 
    form.reset(); 
    document.getElementById('edit-id').value = '';
    document.getElementById('modal-titulo').innerText = 'Novo Produto';
}

function renderizarProdutos(lista = produtos){
    if(lista.length === 0){
        const estaBuscando = campoBusca.value.trim() !== '';
        const msg = estaBuscando ? `Nenhum resultado para "${campoBusca.value}"` : 'Nenhum produto cadastrado ainda';
        gradeProdutos.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px;">${msg}</td></tr>`;
        return;
    }
    gradeProdutos.innerHTML = '';
    lista.forEach(p => {
        const classeBaixo = parseInt(p.qtd) <= parseInt(p.minimo) ? 'estoque-baixo' : '';
        gradeProdutos.innerHTML += `
            <tr>
                <td><strong>${p.nome}</strong></td>
                <td>${p.codigo}</td>
                <td>R$ ${parseFloat(p.preco).toFixed(2)}</td>
                <td class="${classeBaixo}">${p.qtd}</td>
                <td>${p.unidade}</td>
                <td>${p.minimo}</td>
                <td>
                    <button class="btn-acao btn-editar" onclick="editarProduto(${p.id})">Editar</button>
                    <button class="btn-acao btn-excluir" onclick="excluirProduto(${p.id})">Excluir</button>
                </td>
            </tr>
        `;
    });
}

function salvarProduto(event){
    event.preventDefault();
    const idEdicao = document.getElementById('edit-id').value;

    const dados = {
        id: idEdicao ? parseInt(idEdicao) : Date.now(),
        nome: document.getElementById('nome').value.trim(),
        codigo: document.getElementById('codigo').value.trim(),
        preco: document.getElementById('preco').value,
        qtd: document.getElementById('qtd').value,
        unidade: document.getElementById('unidade').value,
        minimo: document.getElementById('minimo').value,
    };

    if(idEdicao){
        const index = produtos.findIndex(prod => prod.id == idEdicao);
        produtos[index] = dados;
    } else {
        produtos.push(dados);
    }

    localStorage.setItem('produtos', JSON.stringify(produtos));
    aplicarFiltro();
    fecharModal();
}

window.editarProduto = function(id){
    const produto = produtos.find(p => p.id === id);
    document.getElementById('nome').value = produto.nome;
    document.getElementById('codigo').value = produto.codigo;
    document.getElementById('preco').value = produto.preco;
    document.getElementById('qtd').value = produto.qtd;
    document.getElementById('unidade').value = produto.unidade;
    document.getElementById('minimo').value = produto.minimo;
    document.getElementById('edit-id').value = produto.id;
    document.getElementById('modal-titulo').innerText = 'Editar Produto';
    abrirModal();
}

window.excluirProduto = function(id){
    const produto = produtos.find(p => p.id === id);
    const motivo = prompt(`Você está excluindo "${produto.nome}".\nDigite o motivo / justificativa (obrigatório):`);

    if(!motivo || motivo.trim() === ''){
        alert('Exclusão cancelada. Justificativa é obrigatória!');
        return;
    }

    logs.push({
        produto: produto.nome,
        codigo: produto.codigo,
        motivo: motivo,
        data: new Date().toLocaleString()
    });
    localStorage.setItem('logs_exclusao', JSON.stringify(logs));

    produtos = produtos.filter(p => p.id !== id);
    localStorage.setItem('produtos', JSON.stringify(produtos));
    aplicarFiltro();
}

window.limparTudo = function(){
    if(confirm('Tem certeza? Isso vai apagar TODOS os produtos!')){
        const motivo = prompt('Justificativa para limpar tudo:');
        if(!motivo) return;
        produtos = [];
        localStorage.setItem('produtos', JSON.stringify(produtos));
        campoBusca.value = '';
        renderizarProdutos();
    }
}

function aplicarFiltro(){
    const texto = campoBusca.value.toLowerCase().trim();
    if(texto === ''){
        renderizarProdutos(produtos);
        return;
    }
    const filtrados = produtos.filter(p => 
        p.nome.toLowerCase().includes(texto) || 
        p.codigo.toLowerCase().includes(texto)
    );
    renderizarProdutos(filtrados);
}

btnNovoProduto.addEventListener('click', abrirModal);
btnFechar.addEventListener('click', fecharModal);
btnCancelar.addEventListener('click', fecharModal);
form.addEventListener('submit', salvarProduto);
modalFundo.addEventListener('click', (e) => { if(e.target === modalFundo) fecharModal(); });
campoBusca.addEventListener('input', aplicarFiltro);

renderizarProdutos();

/*
================ LEGENDA DIDÁTICA - produtos.js ================

AÇÃO 1 - PEGAR ELEMENTOS DA TELA (DOM):
- document.querySelector('.produtos-topo .btn-primario'): Pega o botão "+ Novo Produto". querySelector usa seletor CSS
- getElementById('busca'): Pega o input de busca, mais rápido que querySelector quando tem id
- gradeProdutos = .grade-produtos: É o tbody onde vamos jogar as linhas da tabela
- form = .modal form: Pega o formulário dentro do modal
- Esses const são pontes entre HTML e JS

AÇÃO 2 - MEMÓRIA DO NAVEGADOR (localStorage):
- let produtos = JSON.parse(localStorage.getItem('produtos')) || []: Tenta pegar produtos salvos, se não tem, começa com array vazio []
- JSON.parse: Transforma texto salvo em objeto de novo, porque localStorage só guarda texto
- let logs = ... logs_exclusao: Segunda gaveta, guarda auditoria de quem excluiu o que
- Isso faz seu sistema funcionar sem backend, dados ficam no navegador

AÇÃO 3 - MODAL - ABRIR E FECHAR:
- abrirModal(): Muda display de none para flex, aí o CSS centraliza e mostra o fundo escuro
- fecharModal(): Volta pra none (esconde), form.reset() limpa os inputs, edit-id.value='' limpa ID de edição
- innerText 'Novo Produto': Reseta título, porque quando edita muda pra 'Editar Produto'

AÇÃO 4 - RENDERIZAR TABELA - CORAÇÃO DO SISTEMA:
- function renderizarProdutos(lista = produtos): Parâmetro padrão, se não passar lista, usa todos os produtos
- if(lista.length===0): Se lista vazia, mostra mensagem no meio da tabela com colspan=7 ocupando tudo
- estaBuscando = campoBusca.value.trim() !== '': Truque de UX, se está buscando mostra "Nenhum resultado para X" senão "Nenhum produto cadastrado"
- gradeProdutos.innerHTML = '': Limpa tabela antes de preencher, senão duplica
- forEach(p => ...): Loop em cada produto
- classeBaixo = parseInt(p.qtd) <= parseInt(p.minimo) ? 'estoque-baixo' : '': Se quantidade menor que mínimo, aplica classe vermelha que criamos no CSS
- innerHTML += `<tr>...`: Cria linha com template string. parseFloat(p.preco).toFixed(2) garante 2 casas decimais R$ 7.50
- onclick="editarProduto(${p.id})": Botão chama função global passando ID

AÇÃO 5 - SALVAR - CADASTRAR E EDITAR (MESMA FUNÇÃO - REGRA DE PLENO):
- event.preventDefault(): Impede form de recarregar a página, comportamento padrão
- idEdicao = getElementById('edit-id').value: Se tem valor, é edição, se vazio é cadastro novo
- dados = { id: idEdicao ? parseInt : Date.now() ... }: Se editando usa mesmo ID, se novo cria ID com data atual (único)
- .trim(): Remove espaço do começo e fim que usuário digita sem querer
- if(idEdicao) findIndex: Procura posição do produto no array e substitui, não duplica (regra de pleno)
- else produtos.push: Se novo, adiciona no final
- localStorage.setItem('produtos', JSON.stringify(produtos)): Salva de volta, JSON.stringify transforma objeto em texto
- aplicarFiltro(): Em vez de renderizarProdutos() direto, reaplica filtro pra não quebrar busca
- fecharModal(): Fecha janela

AÇÃO 6 - EDITAR - JOGAR DADOS NO MODAL:
- window.editarProduto = function: window. torna global pra HTML conseguir chamar no onclick
- produtos.find(p => p.id === id): Acha produto pelo ID
- document.getElementById('nome').value = produto.nome: Preenche cada input com dado atual
- edit-id.value = produto.id: Guarda ID no hidden, é ele que diz pro salvar que é edição
- modal-titulo innerText 'Editar Produto': Muda título pra usuário saber que está editando
- abrirModal(): Abre modal já preenchido

AÇÃO 7 - EXCLUIR COM AUDITORIA (DIFERENCIAL PRO RECRUTADOR):
- const produto = find...: Acha produto
- prompt(`Você está excluindo... Digite motivo`): Pede justificativa obrigatória, isso é auditoria de sistema real
- if(!motivo || trim === '') return: Se não digitar motivo, cancela exclusão
- logs.push({produto, codigo, motivo, data: new Date().toLocaleString()}): Guarda log com data e hora
- localStorage.setItem('logs_exclusao'): Salva log separado
- produtos.filter(p => p.id !== id): Cria novo array sem o produto excluído, imutabilidade
- localStorage + aplicarFiltro: Salva e atualiza tela

AÇÃO 8 - LIMPAR TUDO:
- confirm('Tem certeza?'): Dupla confirmação, evita apagar sem querer
- prompt('Justificativa'): Também pede motivo, mesmo padrão
- produtos = []: Zera array
- campoBusca.value = '': Limpa busca também, senão ficaria filtrando lista vazia
- renderizarProdutos(): Mostra mensagem de vazio

AÇÃO 9 - BUSCA POR NOME OU CÓDIGO - O QUE VOCÊ PEDIU:
- function aplicarFiltro(): Função central, toda renderização passa por ela agora
- texto = campoBusca.value.toLowerCase().trim(): Deixa minúsculo e sem espaços, busca fica case-insensitive
- if(texto === '') renderiza tudo e return: Se busca vazia, mostra tudo
- filtrados = produtos.filter(p => nome.includes(texto) || codigo.includes(texto)): Filtra se nome OU código contém texto digitado
- renderizarProdutos(filtrados): Renderiza só os que bateram

AÇÃO 10 - EVENT LISTENERS - OUVIR CLICKS E DIGITAÇÃO:
- btnNovoProduto.addEventListener('click', abrirModal): Clicou em + Novo Produto -> abre modal
- btnFechar e btnCancelar -> fecharModal: X e Cancelar fecham
- form.addEventListener('submit', salvarProduto): Enter ou botão Salvar -> salva
- modalFundo.addEventListener('click', e => if(e.target===modalFundo) fechar): Se clicar no fundo escuro fora do modal, fecha. Se clicar dentro do modal não fecha
- campoBusca.addEventListener('input', aplicarFiltro): A cada letra digitada filtra em tempo real, sem precisar botão Buscar
- renderizarProdutos() no final: Quando página carrega, já mostra produtos salvos

FLUXO COMPLETO: Página carrega -> renderizarProdutos pega do localStorage -> usuário digita na busca -> input dispara aplicarFiltro -> filtra e renderiza -> clica Novo -> abrirModal -> preenche -> submit -> salvarProduto -> salva localStorage -> aplicarFiltro -> fecha modal
*/