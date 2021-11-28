const compraModal = document.getElementById("compraModal");
compraModal.addEventListener("show.bs.modal", function (event) {
  const btn = event.relatedTarget;
  const id = btn.getAttribute("data-bs-id-imovel");
  const valor = app.imoveis_venda.get(Number.parseInt(id)).price.toString();

  document.getElementById("valor-modal").innerHTML = new Web3().utils.fromWei(
    valor,
    "ether"
  );

  const comprarBtn = document.getElementById("btn-comprar");

  comprarBtn.addEventListener("click", (e) => {
    comprarImovel(Number.parseInt(id), valor).then(
      () => (window.location = "/imoveis.html")
    );
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
        <div><i class="fab fa-ethereum fa-fw" style="margin-right: 5px;"></i>${new Web3().utils.fromWei(
          app.imoveis_venda.get(Number.parseInt(id)).price.toString(),
          "ether"
        )} ETH</div>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#compraModal" data-bs-id-imovel="${id}" ${
    app.imoveis_venda.get(Number.parseInt(id)).seller.toUpperCase() ==
    app.account.toUpperCase()
      ? "disabled"
      : "enabled"
  }>Comprar</button>
      </section>
    </div>
  `;
}

async function comprarImovel(id, valor) {
  return app.cartorio.comprar_casa(id, { from: app.account, value: valor });
}

finishLoading().then(async () => {
  app.ids_casas_venda = await app.cartorio.get_ids_casas_venda({
    from: app.account,
  });
  app.ids_casas_venda = app.ids_casas_venda.map((bn) => bn.toNumber());
  for (const id of app.ids_casas_venda) {
    app.imoveis_venda.set(id, await app.cartorio.casas_venda(id));
  }
  app.imoveis = await app.cartorio.get_casas_venda({ from: app.account });

  const imoveisDiv = document.getElementById("imoveis");
  imoveisDiv.innerHTML = "";

  for (const imovel of app.imoveis) {
    const template = imovelTemplate(imovel);

    imoveisDiv.innerHTML += template;
  }

  if (app.imoveis.length === 0) {
    imoveisDiv.innerHTML = "Nenhum imóvel a venda";
  }

  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});
