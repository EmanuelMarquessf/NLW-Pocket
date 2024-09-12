const { select, input, checkbox } = require("@inquirer/prompts");
const fs = require("fs").promises

let mensagem = "";

let meta = {
  value: "Tomar 3l de agua por dia",
  checkbox: false,
};

let metas = [meta];

const carregarMetas = async () => {
  try{
    const dados = await fs.readFile("metas.json", "utf-8")
    metas = JSON.parse(dados)
  }
  catch(erro) {
    metas = []
  }
}

carregarMetas()

const cadastrarMetas = async () => {
  const meta = await input({ message: "Digite a meta:" });

  if (meta.length == 0) {
    mensagem = "A meta não pode ser vazia";
    return;
  }

  metas.push({ value: meta, checked: false });
  
  mensagem = "Meta cadastrada com sucesso!"
};

const salvarMetas = async () => {
  await fs.writeFile("metas.json", JSON.stringify(metas, null, 2))
}

const listarMeta = async () => {
  if(!metas){
    mensagem = "Não existem metas!"
    return
  }
  const respostas = await checkbox({
    message:
      "Use as setas para mudar de meta, espaco para marcar e o Enter para finalizar",
    choices: [...metas],
    instructions: false,
  });

  if (respostas.length == 0) {
    mensagem = "Nenhuma meta selecionada";
    return;
  }

  respostas.forEach((resposta) => {
    const meta = metas.find((m) => {
      return m.value == resposta;
    });

    meta.checked = true;
  });

  mensagem = "Meta(s) concluida(s)";
};

const metasRealizadas = async () => {
  if(!metas){
    mensagem = "Não existem metas!"
    return
  }
  const realizadas = metas.filter((meta) => {
    return meta.checked;
  });

  metas.forEach((m) => {
    m.checked = false;
  });

  if (realizadas.length == 0) {
    mensagem = "Não existem metas realizadas";
    return;
  }

  await select({
    message: "Metas realizadas: " + realizadas.length,
    choices: [...realizadas],
  });
};

const metasPendentes = async () => {
  if(!metas){
    mensagem = "Não existem metas!"
    return
  }

  const pendentes = metas.filter((meta) => {
    return !meta.checked;
  });

  metas.forEach((m) => {
    m.checked = true;
  });

  if (pendentes.length == 0) {
    mensagem ="Não existem metas pendentes";
    return;
  }

  await select({
    message: "Metas pendentes: " + pendentes.length,
    choices: [...pendentes],
  });
};

const deletarMetas = async () => {
  if(!metas){
    mensagem = "Não existem metas!"
    return
  }

  const metasDesmarcadas = metas.map((meta) => {
    return {value: meta.value, checked: false};
  })
  const itensADeletar = await checkbox({
    message:
      "Selecione um item para deletar",
    choices: [...metasDesmarcadas],
    instructions: false,
  });

  if(itensADeletar.length == 0){
    mensagem = 'Nenhum item para deletar'
    return
  }

  itensADeletar.forEach((item) => {
    metas.filter(() => {
      return meta.value != item
    })
  })

  mensagem = "Meta(s) deletada(s) com sucesso!"
}

const mostrarMensagem = () => {
  console.clear();

  if(mensagem != ""){
    console.log(mensagem)
    console.log("")
    mensagem = ""
  }
}

const start = async () => {
  await carregarMetas()
  while (true) {
    mostrarMensagem();
    await salvarMetas();

    const opcao = await select({
      message: "Menu >",
      choices: [
        {
          name: "Cadastrar meta",
          value: "cadastrar",
        },
        {
          name: "Listar metas",
          value: "listar",
        },
        {
          name: "Metas realizadas",
          value: "realizadas",
        },
        {
          name: "Metas pendentes",
          value: "pendentes",
        },
        {
          name: "Deletar abertas",
          value: "deletar",
        },
        {
          name: "Sair",
          value: "sair",
        },
      ],
    });

    switch (opcao) {
      case "cadastrar":
        await cadastrarMetas();
        break;
      case "listar":
        await listarMeta();
        break;
      case "realizadas":
        await metasRealizadas();
        break;
      case "pendentes":
        await metasPendentes();
        break;
      case "deletar":
        await deletarMetas();
        break;
      case "sair":
        console.log("Até a proxima")
        return;
    }
  }
};

start();
