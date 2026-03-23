class GerenciadorFinancas {
    constructor() {
        this.transacoes = [];
        this.grafico = null;
        this.init();
    }

    init() {
        this.carregarTransacoes();
        this.atualizarSaldo();
        this.renderizarLista();
        this.criarGrafico();
        this.bindEvents();
    }

    bindEvents() {
        // Formulário
        document.getElementById('transacaoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarTransacao();
        });

        // Filtros
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.aplicarFiltro(e.target.dataset.filtro);
            });
        });

        // Limpar tudo
        document.getElementById('limparTudo').addEventListener('click', () => {
            if (confirm('Tem certeza que deseja limpar todas as transações?')) {
                this.limparTudo();
            }
        });
    }

    adicionarTransacao() {
        const descricao = document.getElementById('descricao').value;
        const valor = parseFloat(document.getElementById('valor').value);
        const tipo = document.querySelector('input[name="tipo"]:checked').value;

        const transacao = {
            id: Date.now(),
            descricao,
            valor,
            tipo,
            data: new Date().toLocaleDateString('pt-BR')
        };

        this.transacoes.push(transacao);
        this.salvarTransacoes();
        this.atualizarSaldo();
        this.renderizarLista();
        this.atualizarGrafico();

        // Limpar formulário
        document.getElementById('transacaoForm').reset();
        document.querySelector('input[name="tipo"]').checked = true;
    }

    atualizarSaldo() {
        const saldo = this.transacoes.reduce((acc, transacao) => {
            return transacao.tipo === 'ganho' ? acc + transacao.valor : acc - transacao.valor;
        }, 0);

        document.getElementById('saldo').textContent = `R$ ${saldo.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }

    renderizarLista(filtro = 'todos') {
        const lista = document.getElementById('listaTransacoes');
        
        if (this.transacoes.length === 0) {
            lista.innerHTML = '<p class="empty-state">Nenhuma transação cadastrada. Adicione a primeira!</p>';
            return;
        }

        let transacoesFiltradas = this.transacoes;
        
        if (filtro === 'ganhos') {
            transacoesFiltradas = this.transacoes.filter(t => t.tipo === 'ganho');
        } else if (filtro === 'despesas') {
            transacoesFiltradas = this.transacoes.filter(t => t.tipo === 'despesa');
        }

        lista.innerHTML = transacoesFiltradas
            .sort((a, b) => b.id - a.id)
            .map(transacao => `
                <div class="transacao-item">
                    <div>
                        <div class="transacao-descricao">${transacao.descricao}</div>
                        <div class="transacao-data">${transacao.data}</div>
                    </div>
                    <div class="transacao-valor ${transacao.tipo}">
                        ${transacao.tipo === 'ganho' ? '+' : '-'}\
                        R$ ${transacao.valor.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}
                    </div>
                </div>
            `).join('');
    }

    aplicarFiltro(filtro) {
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filtro === filtro);
        });
        this.renderizarLista(filtro);
    }

    criarGrafico() {
        const ctx = document.getElementById('graficoGastos').getContext('2d');
        
        this.grafico = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Ganhos', 'Despesas'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    atualizarGrafico() {
        const ganhos = this.transacoes
            .filter(t => t.tipo === 'ganho')
            .reduce((acc, t) => acc + t.valor, 0);
        
        const despesas = this.transacoes
            .filter(t => t.tipo === 'despesa')
            .reduce((acc, t) => acc + t.valor, 0);

        this.grafico.data.datasets[0].data = [ganhos, despesas];
        this.grafico.update();
    }

    salvarTransacoes() {
        localStorage.setItem('transacoes', JSON.stringify(this.transacoes));
    }

    carregarTransacoes() {
        const transacoes = localStorage.getItem('transacoes');
        if (transacoes) {
            this.transacoes = JSON.parse(transacoes);
        }
    }

    limparTudo() {
        this.transacoes = [];
        this.salvarTransacoes();
        this.atualizarSaldo();
        this.renderizarLista();
        this.atualizarGrafico();
    }
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    new GerenciadorFinancas();
});