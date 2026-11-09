
let movimentacoes = JSON.parse(
    localStorage.getItem("caixa") || "[]"
);

const dinheiro = valor => valor.toLocaleString(
    "pt-BR",
    {
        style: "currency",
        currency: "BRL"
    }
);

document.getElementById("data").value =
    new Date().toLocaleDateString("en-CA");

document.getElementById("formCaixa").addEventListener(
    "submit", function(event) {

    event.preventDefault();

    const tipo = document.getElementById("tipo").value;
    const descricao = document.getElementById("descricao").value;
    const valor = Number(document.getElementById("valor").value);
    const data = document.getElementById("data").value;

    if (!descricao.trim() || !data || !Number.isFinite(valor) || valor <= 0) {
        alert("Preencha os dados corretamente!");
        return;
    }

    movimentacoes.push({
        id: Date.now(),
        tipo,
        descricao,
        valor,
        data
    });

    salvar();
    atualizar();

    this.reset();

    document.getElementById("data").value =
        new Date().toLocaleDateString("en-CA");
});

function salvar() {
    localStorage.setItem(
        "caixa",
        JSON.stringify(movimentacoes)
    );
}

function atualizar() {

    let vendas = 0;
    let gastos = 0;

    movimentacoes.forEach(item => {

        if (item.tipo === "venda") {
            vendas += item.valor;
        } else {
            gastos += item.valor;
        }

    });

    const saldo = vendas - gastos;
    const margem = vendas > 0 ? (saldo / vendas) * 100 : 0;

    document.getElementById("totalVendas").innerText =
        dinheiro(vendas);

    document.getElementById("totalGastos").innerText =
        dinheiro(gastos);

    document.getElementById("saldo").innerText =
        dinheiro(saldo);

    document.getElementById("saldo").style.color =
        saldo >= 0 ? "green" : "red";

    document.getElementById("margem").innerText =
        margem.toFixed(1) + "%";

    listar();
    analisar(vendas, gastos, saldo, margem);
}

function listar() {

    const lista = document.getElementById("listaCaixa");

    lista.innerHTML = "";

    movimentacoes.forEach(item => {

        const linha = document.createElement("tr");

        const descricao = document.createElement("td");
        descricao.textContent = item.descricao;

        const tipo = document.createElement("td");
        tipo.textContent = item.tipo === "venda" ? "Venda" : "Gasto";

        const valor = document.createElement("td");
        valor.textContent = dinheiro(item.valor);

        const data = document.createElement("td");
        data.textContent = item.data.split("-").reverse().join("/");

        const acao = document.createElement("td");
        const botao = document.createElement("button");

        botao.textContent = "Excluir";

        botao.onclick = function() {
            if (confirm("Deseja excluir esta movimentação?")) {
                movimentacoes = movimentacoes.filter(
                    x => x.id !== item.id
                );
                salvar();
                atualizar();
            }
        };

        acao.appendChild(botao);

        linha.append(descricao, tipo, valor, data, acao);

        lista.appendChild(linha);
    });
}

function analisar(vendas, gastos, saldo, margem) {

    const area = document.getElementById("recomendacoes");

    let mensagens = [];

    if (movimentacoes.length === 0) {
        area.innerText =
            "Registre suas movimentações para receber recomendações.";
        return;
    }

    if (saldo < 0) {
        mensagens.push(
            "⚠️ Você está gastando mais do que vende. Reduza despesas."
        );
    } else {
        mensagens.push(
            "✅ Seu caixa está positivo. Continue controlando os gastos."
        );
    }

    if (vendas > 0 && gastos / vendas > 0.8) {
        mensagens.push(
            "⚠️ Seus gastos representam mais de 80% das vendas. Revise seus custos."
        );
    }

    if (vendas > 0 && margem < 10) {
        mensagens.push(
            "⚠️ Sua margem está abaixo de 10%. Analise seus preços e custos."
        );
    }

    if (vendas === 0) {
        mensagens.push(
            "📌 Você ainda não registrou vendas neste controle."
        );
    }

    mensagens.push(
        "💡 Registre todas as movimentações para melhorar sua análise financeira."
    );

    area.innerHTML = mensagens.map(m => {
        const p = document.createElement("p");
        p.textContent = m;
        return p;
    }).reduce((fragmento, p) => {
        fragmento.appendChild(p);
        return fragmento;
    }, document.createDocumentFragment());

}

atualizar();
