const Cartorio = artifacts.require("Cartorio");

module.exports = function (deployer) {
  deployer.deploy(Cartorio);
};
