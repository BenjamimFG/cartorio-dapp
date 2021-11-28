const app = {
  account: null,
  cartorio_contrato: null,
  cartorio: null,
  is_owner: false,
  loading: true,
  imoveis: [],
  ids_casas_venda: [],
  imoveis_venda: new Map(),
};

function finishLoading() {
  return new Promise((res, rej) => {
    setInterval(() => {
      if (!app.loading) {
        res();
      }
    }, 100);
  });
}

async function connectWallet() {
  if (window.ethereum) {
    return ethereum.request({ method: "eth_requestAccounts" });
  } else {
    alert("Por favor instale o metamask.");
    return false;
  }
}

async function loadAccount(accounts) {
  if (accounts && accounts.length > 0) {
    app.account = accounts[0];
    document.querySelector("#menu > #user").innerHTML = app.account;
  }
}

async function loadContract() {
  const cartorio = await getJSON("Cartorio.json");
  app.cartorio_contrato = TruffleContract(cartorio);
  app.cartorio_contrato.setProvider(window.ethereum);

  app.cartorio = await app.cartorio_contrato.deployed();
}

connectWallet().then(
  async (accounts) => {
    await loadAccount(accounts);
    await loadContract();

    app.cartorio.is_owner({ from: app.account }).then((is_owner) => {
      if (is_owner) {
        app.is_owner = true;
        document.querySelector(
          "#menu > #user"
        ).innerHTML = `(admin) ${app.account}`;

        document
          .querySelector(".menu-item#cadastrar")
          .classList.remove("hidden");
      }

      app.loading = false;
    });
  },
  (err) => {
    console.error(err);
    alert("Desulpe, ocorreu um erro.");
  }
);

function getJSON(url, qs_params) {
  function buildQueryString(params) {
    return Object.entries(params)
      .map((d) => `${d[0]}=${d[1]}`)
      .join("&");
  }

  return new Promise((resolve, reject) => {
    const qs = qs_params ? "?" + buildQueryString(qs_params) : "";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${url}${qs}`);

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 400) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        resolve(xhr.responseText);
      }
    };
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send();
  });
}
