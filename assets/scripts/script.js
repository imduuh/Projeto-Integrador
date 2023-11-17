let carrinho = JSON.parse(localStorage.getItem('carrinho')) || {};

function addToCart(nomeProduto, preco, quantidade, button) {
    if (carrinho[nomeProduto]) {
        carrinho[nomeProduto].quantidade += quantidade;
        carrinho[nomeProduto].preco += preco * quantidade;
    } else {
        carrinho[nomeProduto] = {
            preco: preco * quantidade,
            quantidade
        };
    }
    salvarCarrinhoNoLocalStorage();
    console.log(`"${nomeProduto}" adicionado ao carrinho.`);
    mostrarCarrinho();
}

function modifyItem(nomeProduto, novaQuantidade) {
    if (novaQuantidade === 0) {
        delete carrinho[nomeProduto];
        console.log(`"${nomeProduto}" removido do carrinho.`);
    } else {
        if (carrinho[nomeProduto]) {
            const precoUnitario = carrinho[nomeProduto].preco / carrinho[nomeProduto].quantidade;
            carrinho[nomeProduto].quantidade = novaQuantidade;
            carrinho[nomeProduto].preco = precoUnitario * novaQuantidade;
            console.log(`"${nomeProduto}" atualizado no carrinho.`);
        } else {
            console.log(`"${nomeProduto}" não encontrado no carrinho.`);
        }
    }
    salvarCarrinhoNoLocalStorage();
    mostrarCarrinho();
    
}

function salvarCarrinhoNoLocalStorage() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function mostrarCarrinho() {
    const cartTableBody = document.querySelector('.cartItems tbody');
    let total = 0;

    cartTableBody.innerHTML = '';

    for (const produto in carrinho) {
        const item = carrinho[produto];
        const newRow = document.createElement('tr');
        newRow.classList.add('cartItem');

        newRow.innerHTML = `
            <td class="productName">${produto}</td>
            <td class="quantity">
                <div class="quantityControls">
                    <button class="decrementButton">-</button>
                    <span class="quantityValue">${item.quantidade}</span>
                    <button class="incrementButton">+</button>
                </div>
            </td>
            <td class="totalPrice">R$ ${(item.preco).toFixed(2)}</td>
        `;

        cartTableBody.appendChild(newRow);

        const incrementButton = newRow.querySelector('.incrementButton');
        const decrementButton = newRow.querySelector('.decrementButton');
        const quantityValue = newRow.querySelector('.quantityValue');
        const totalPrice = newRow.querySelector('.totalPrice');

        incrementButton.addEventListener('click', () => {
            addToCart(produto, item.preco / item.quantidade, 1);
        });

        decrementButton.addEventListener('click', () => {
            modifyItem(produto, item.quantidade - 1);
        });

        total += item.preco;
    }

    const totalAmount = document.getElementById('totalAmount');
    totalAmount.textContent = `R$ ${total.toFixed(2)}`;
}

function buscarCEP() {
    const cep = document.getElementById('cep').value.replace(/\D/g, '');
    if (cep.length !== 8) {
        alert('CEP inválido');
        return;
    }
    
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                alert('CEP não encontrado');
                return;
            }
            preencherCampos(data);
        })
        .catch(error => {
            console.error('Erro ao buscar CEP:', error);
        });
}

function preencherCampos(data) {
    document.getElementById('street').value = data.logradouro;
    document.getElementById('neighborhood').value = data.bairro;
    document.getElementById('city').value = data.localidade;
    document.getElementById('state').value = data.uf;
}

document.getElementById('cep').addEventListener('input', function() {
    const cep = this.value.replace(/\D/g, '');
    if (cep.length === 8) {
        buscarCEP(cep);
    }
});

function validarFormulario(event) {
    const nome = document.getElementById('fullName').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const telefone = document.getElementById('phone').value.trim();
    const cep = document.getElementById('cep').value.trim();
    const rua = document.getElementById('street').value.trim();
    const bairro = document.getElementById('neighborhood').value.trim();
    const estado = document.getElementById('state').value.trim();
    const cidade = document.getElementById('city').value.trim();
    const complemento = document.getElementById('complement').value.trim();

    const pagamentos = document.getElementsByName('payments');
    let pagamentoSelecionado = '';

    for (const pagamento of pagamentos) {
        if (pagamento.checked) {
            pagamentoSelecionado = pagamento.value;
            break;
        }
    }

    if (!nome || !cpf || !telefone || !cep || !pagamentoSelecionado) {
        event.preventDefault(); // Evita o envio do formulário se campos estiverem vazios
        alert('Por favor, preencha todos os campos obrigatórios.');
    } else {

        let mensagem = `Olá, *${nome}*.\nRecebemos seu pedido!\n\n`
        for (const produto in carrinho) {
            mensagem += `${carrinho[produto].quantidade}x *${produto}*`
        }

        mensagem += `\n\n*Endereço:*\n${rua}, ${complemento}, ${bairro}, ${cidade} - ${estado}\n\n*Pagamento por:* ${pagamentoSelecionado}`

        const linkRedirecionamento = `https://api.whatsapp.com/send?phone=5514997040810&text=${encodeURIComponent(mensagem)}`;
        window.open(linkRedirecionamento, '_blank');

        const dadosCompra = {
            meioPagamento: pagamentoSelecionado,
            nome,
            cpf,
            telefone,
            cep,
            rua,
            bairro,
            estado,
            cidade
        };

        console.log('Dados da compra:', dadosCompra);

        carrinho = {};
        salvarCarrinhoNoLocalStorage();
    }
}

document.getElementById('userInfoForm').addEventListener('submit', validarFormulario);

window.onload = function() {
    mostrarCarrinho();
};
