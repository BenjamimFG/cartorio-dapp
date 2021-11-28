const modalVenda = document.getElementById("vendaModal");
modalVenda.addEventListener("show.bs.modal", function (event) {
  const btn = event.relatedTarget;
  const id = btn.getAttribute("data-bs-id-imovel");

  const venderBtn = document.getElementById("btn-venda");

  venderBtn.addEventListener("click", (e) => {
    const valorEth = document.getElementById("valor-venda").value;

    if (valorEth === null || valorEth === undefined || valorEth === "") {
      alert("Valor inválido. Por favor insira um número.");
      return;
    }

    venderImovel(Number.parseInt(id), valorEth).then(() =>
      window.location.reload()
    );
  });
});

const modalCancelar = document.getElementById("cancelarVendaModal");
modalCancelar.addEventListener("show.bs.modal", function (event) {
  const btn = event.relatedTarget;
  const id = btn.getAttribute("data-bs-id-imovel");
  console.log(id);

  const cancelarVendaBtn = document.getElementById("btn-cancelar-venda");

  cancelarVendaBtn.addEventListener("click", (e) => {
    cancelarVenda(Number.parseInt(id)).then(() => window.location.reload());
  });
});

function imovelTemplate({
  area,
  cidade,
  complemento,
  construido_em,
  donos,
  id,
  n_banheiros,
  n_quartos,
  n_suites,
  n_vagas,
  numero,
  rua,
  uf,
}) {
  const data = new Date(Number.parseInt(construido_em));
  return `
    <div class="shadow imovel-card">
      <img src="img/image_not_found.png" alt="image not found">
      <section class="imovel-info">
        <div>
          <div id="cidade-estado" style="font-weight: bold;">${cidade}, ${uf.toUpperCase()}</div>
          <div id="endereco">${rua}, ${numero}. ${complemento}</div>
        </div>
        <div class="imovel-info-icons">
          <span id="banheiros" data-bs-toggle="tooltip" data-bs-placement="top" title="Banheiros"><i class="fas fa-bath fa-fw"></i>${n_banheiros}</span>
          <span id="quartos" data-bs-toggle="tooltip" data-bs-placement="top" title="Quartos"><i class="fas fa-bed fa-fw"></i>${n_quartos}</span>
          <span id="suites" data-bs-toggle="tooltip" data-bs-placement="top" title="Suítes"><img class="suite-img" src="img/suite.png" alt="suítes">${n_suites}</span>
          <span id="vagas" data-bs-toggle="tooltip" data-bs-placement="top" title="Vagas"><i class="fas fa-car fa-fw"></i>${n_vagas}</span>
          <span id="donos" data-bs-toggle="tooltip" data-bs-placement="top" title="Donos Anteriores"><i class="fas fa-users fa-fw"></i>${donos}</span>
          <span id="area" data-bs-toggle="tooltip" data-bs-placement="top" title="Área"><i class="fas fa-ruler-combined fa-fw"></i>${area} m²</span>
          <span id="construido-em" data-bs-toggle="tooltip" data-bs-placement="top" title="Construído em"><i class="far fa-calendar-alt"></i>${String(
            data.getDate()
          ).padStart(2, "0")}/${String(data.getMonth() + 1).padStart(
    2,
    "0"
  )}/${data.getFullYear()}</span>
        </div>
      </section>
      <section class="imovel-buttons">
        ${
          app.ids_casas_venda.includes(Number.parseInt(id))
            ? `<button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#cancelarVendaModal" data-bs-id-imovel="${id}">Cancelar Venda</button>`
            : `<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#vendaModal" data-bs-id-imovel="${id}">Vender</button>`
        }
      </section>
    </div>
  `;
}

async function venderImovel(id, valorEth) {
  return app.cartorio.vender_casa(
    id,
    new Web3().utils.toWei(valorEth, "ether"),
    { from: app.account }
  );
}

async function cancelarVenda(id) {
  return app.cartorio.cancelar_venda(id, { from: app.account });
}

finishLoading().then(async () => {
  app.imoveis = await app.cartorio.get_casas({ from: app.account });
  app.ids_casas_venda = await app.cartorio.get_ids_casas_venda({
    from: app.account,
  });
  app.ids_casas_venda = app.ids_casas_venda.map((bn) => bn.toNumber());

  const imoveisDiv = document.getElementById("imoveis");
  imoveisDiv.innerHTML = "";

  for (const imovel of app.imoveis) {
    const template = imovelTemplate(imovel);

    imoveisDiv.innerHTML += template;
  }

  if (app.imoveis.length === 0) {
    imoveisDiv.innerHTML = "Você não possui nenhum imóvel";
  }

  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});
