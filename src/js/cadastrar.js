finishLoading().then(() => {
  if (!app.is_owner) {
    window.location = "/imoveis.html";
  }
});

function get_form_data() {
  const data = {};
  const fields = [
    "rua",
    "numero",
    "complemento",
    "cidade",
    "uf",
    "suites",
    "quartos",
    "banheiros",
    "vagas",
    "area",
    "primeiro_dono",
  ];

  for (const f of fields) {
    data[f] = document.querySelector(`#${f}`).value;
  }

  return data;
}

function clear_form_data() {
  const fields = [
    "rua",
    "numero",
    "complemento",
    "cidade",
    "uf",
    "suites",
    "quartos",
    "banheiros",
    "vagas",
    "area",
    "primeiro_dono",
  ];

  for (const field of fields) {
    document.querySelector(`#${field}`).value = "";
  }
}

async function cadastrar() {
  const form = get_form_data();
  const required = [
    "rua",
    "numero",
    "cidade",
    "uf",
    "suites",
    "quartos",
    "banheiros",
    "vagas",
    "area",
    "primeiro_dono",
  ];

  for (const field of required) {
    if (
      form[field] === null ||
      form[field] === "" ||
      form[field] === undefined
    ) {
      alert(`Campo ${field.toLocaleUpperCase()} é obrigatório.`);
      return;
    }
  }

  await app.cartorio.nova_casa(
    form.uf,
    form.cidade,
    form.rua,
    form.numero,
    form.complemento,
    Number.parseInt(form.suites),
    Number.parseInt(form.quartos),
    Number.parseInt(form.banheiros),
    Number.parseInt(form.vagas),
    Number.parseInt(form.area),
    form.primeiro_dono,
    { from: app.account }
  );

  clear_form_data();
}
