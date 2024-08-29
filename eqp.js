document.addEventListener('DOMContentLoaded', function() {
    let equipamentoCount = 1;

    // Função para avançar para o próximo campo com Enter
    function avancarParaProximoCampo(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Previne o envio do formulário

            const formElements = Array.from(event.target.form.elements);
            const index = formElements.indexOf(event.target);
            const nextElement = formElements[index + 1];

            if (nextElement) {
                nextElement.focus(); // Muda o foco para o próximo elemento
            }
        }
    }

    // Aplicar o evento de teclado a todos os campos de entrada do formulário
    function aplicarEventoEnter(element) {
        element.addEventListener('keydown', avancarParaProximoCampo);
    }

    // Aplica o evento Enter nos campos já existentes
    const formFields = document.querySelectorAll('#form-preencher input, #form-preencher textarea');
    formFields.forEach(aplicarEventoEnter);

    // Adicionar equipamento
    document.getElementById('addEquipamento').addEventListener('click', function() {
        if (equipamentoCount < 10) {
            equipamentoCount++;

            const container = document.getElementById('equipamentos-container');
            const novoEquipamento = document.createElement('div');
            novoEquipamento.classList.add('equipamento');
            novoEquipamento.id = `equipamento${equipamentoCount}`;

            novoEquipamento.innerHTML = `
                <label for="cd${equipamentoCount}">Código ${equipamentoCount}</label>
                <input type="text" id="cd${equipamentoCount}" name="cd${equipamentoCount}" class="codigo" data-eqp="${equipamentoCount}">

                <label for="eqp${equipamentoCount}">Equipamento</label>
                <input type="text" id="eqp${equipamentoCount}" name="eqp${equipamentoCount}">

                <label for="tip${equipamentoCount}">Unidade</label>
                <input type="text" id="tip${equipamentoCount}" name="tip${equipamentoCount}">

                <label for="valor${equipamentoCount}">Valor Unitário</label>
                <input type="number" step="0.01" id="valor${equipamentoCount}" name="valor${equipamentoCount}">

                <hr></hr>
            `;

            container.appendChild(novoEquipamento);

            // Adiciona o evento de busca ao novo campo de código
            document.getElementById(`cd${equipamentoCount}`).addEventListener('blur', buscarEquipamento);

            // Aplica o evento Enter nos novos campos criados
            const newFields = novoEquipamento.querySelectorAll('input');
            newFields.forEach(aplicarEventoEnter);
        }
    });

    // Remover o último equipamento
    document.getElementById('removeEquipamento').addEventListener('click', function() {
        if (equipamentoCount > 1) {
            const container = document.getElementById('equipamentos-container');
            const lastEquipamento = document.getElementById(`equipamento${equipamentoCount}`);
            container.removeChild(lastEquipamento);
            equipamentoCount--;
        } else {
            alert('Você deve manter ao menos um equipamento.');
        }
    });

    // Função para preencher campos vazios
    function preencherCamposVazios(substitutions) {
        for (let i = 1; i <= 10; i++) {
            substitutions[`cd${i}`] = substitutions[`cd${i}`] || '';
            substitutions[`eqp${i}`] = substitutions[`eqp${i}`] || '';
            substitutions[`tip${i}`] = substitutions[`tip${i}`] || '';
            substitutions[`valor${i}`] = substitutions[`valor${i}`] || '';
        }
    }

    function formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function formatarData(data) {
        const meses = [
            "janeiro", "fevereiro", "março", "abril", "maio", "junho",
            "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
        ];
    
        // Ajuste o horário para evitar o deslocamento
        data.setHours(data.getHours() + data.getTimezoneOffset() / 60);
    
        const dia = data.getDate();
        const mes = meses[data.getMonth()];
        const ano = data.getFullYear();

        return `${dia} de ${mes} de ${ano}`;
    }

    

    // Evento para buscar equipamento ao perder o foco (blur) do campo de código
    function buscarEquipamento() {
        const codigo = this.value;
        const eqpIndex = this.dataset.eqp;
    
        if (codigo) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `buscar_equipamento.php?codigo=${encodeURIComponent(codigo)}`, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            const response = JSON.parse(xhr.responseText);
    
                            if (response) {
                                document.getElementById(`eqp${eqpIndex}`).value = response.descricao || '';
                                document.getElementById(`valor${eqpIndex}`).value = response.valor || '';
                                document.getElementById(`tip${eqpIndex}`).value = response.unidade || '';
                            } else {
                                alert('Equipamento não encontrado.');
                            }
                        } catch (e) {
                            console.error('Erro ao parsear JSON:', e);
                            console.error('Resposta do servidor:', xhr.responseText);
                            alert('Erro ao buscar o equipamento. A resposta do servidor não está no formato esperado.');
                        }
                    } else {
                        console.error('Erro na requisição:', xhr.statusText);
                        alert('Erro ao buscar o equipamento. Verifique sua conexão ou entre em contato com o suporte.');
                    }
                }
            };
            xhr.send();
        }
    }
    

    // Adiciona o evento ao primeiro campo de código
    document.getElementById('cd1').addEventListener('blur', buscarEquipamento);

    // Submissão do formulário
    document.getElementById('form-preencher').addEventListener('submit', function(event) {
        event.preventDefault();

        let substitutions = {};
        substitutions['razSocial'] = document.getElementById('razSocial').value || '';
        substitutions['comodatario'] = document.getElementById('comodatario').value || '';

        const dataInput = document.getElementById('data').value;
        const data = dataInput ? new Date(dataInput) : null;
        substitutions['data'] = data ? formatarData(data) : '';

        for (let i = 1; i <= equipamentoCount; i++) {
            substitutions[`cd${i}`] = document.getElementById(`cd${i}`).value || '';
            substitutions[`eqp${i}`] = document.getElementById(`eqp${i}`).value || '';
            substitutions[`tip${i}`] = document.getElementById(`tip${i}`).value || '';
            const valorInput = document.getElementById(`valor${i}`).value;
            const valor = valorInput ? parseFloat(valorInput) : 0;
            substitutions[`valor${i}`] = valor ? formatarMoeda(valor) : '';
            }

        // Preencher os campos vazios até 10
        preencherCamposVazios(substitutions);

        fetch('../assets/Model.docx')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar o arquivo: ' + response.statusText);
                }
                return response.arrayBuffer();
            })
            .then(buffer => {
                let zip = new PizZip(buffer);
                let doc = new window.docxtemplater().loadZip(zip);
                let razSocial = document.getElementById('razSocial').value || 'Documento';

                doc.setData(substitutions);

                try {
                    doc.render();
                } catch (error) {
                    console.error('Erro ao renderizar o documento:', error);
                    return;
                }

                let out = doc.getZip().generate({
                    type: 'blob',
                    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                });

                let downloadLink = document.getElementById('downloadLink');
                downloadLink.href = URL.createObjectURL(out);
                downloadLink.download = 'Comodato_'+razSocial+'.docx';
                downloadLink.style.display = 'block';
                downloadLink.click();
            })
            .catch(error => {
                console.error('Erro ao processar o arquivo:', error);
            });
    });
});
