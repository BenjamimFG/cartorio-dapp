// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Cartorio is Ownable {
    constructor() Ownable() {}

    struct Casa {
        uint256 id;
        string uf;
        string cidade;
        string rua;
        string numero;
        string complemento;
        uint256 n_suites;
        uint256 n_quartos;
        uint256 n_banheiros;
        uint256 n_vagas;
        uint256 area;
        uint256 construido_em;
        uint256 donos;
        address owner;
    }

    struct CasaVenda {
        uint256 id;
        address payable seller;
        address buyer;
        uint256 price;
        bool sold;
    }

    uint256 total_casas = 0;
    mapping(uint256 => Casa) casas;

    uint256[] public ids_casas_venda;
    mapping(uint256 => CasaVenda) public casas_venda;

    event CasaVendida(address previous_owner, address new_owner, uint256 valor);

    modifier dono_da_casa(uint256 _id_casa) {
        require(_id_casa <= total_casas, "Id da casa invalido");
        Casa memory _casa = casas[_id_casa];
        require(
            _msgSender() == _casa.owner,
            "Somente o dono da casa pode realizar esta acao"
        );
        _;
    }

    function get_total_casas_venda() public view returns (uint256) {
        return ids_casas_venda.length;
    }

    function get_ids_casas_venda() public view returns (uint256[] memory) {
        return ids_casas_venda;
    }

    function get_casas() public view returns (Casa[] memory) {
        uint256 total_results = 0;
        Casa[] memory _casas = new Casa[](total_casas);
        for (uint256 i = 1; i <= total_casas; i++) {
            Casa memory _casa = casas[i];
            if (_casa.owner == _msgSender()) {
                _casas[total_results] = _casa;
                total_results++;
            }
        }

        if (total_results == total_casas) {
            return _casas;
        }

        Casa[] memory _result = new Casa[](total_results);

        for (uint256 i = 0; i < total_results; i++) {
            _result[i] = _casas[i];
        }

        return _result;
    }

    function nova_casa(
        string memory _uf,
        string memory _cidade,
        string memory _rua,
        string memory _numero,
        string memory _complemento,
        uint256 _n_suites,
        uint256 _n_quartos,
        uint256 _n_banheiros,
        uint256 _n_vagas,
        uint256 _area,
        address _first_owner
    ) public onlyOwner {
        total_casas++;
        Casa memory _casa = Casa(
            total_casas,
            _uf,
            _cidade,
            _rua,
            _numero,
            _complemento,
            _n_suites,
            _n_quartos,
            _n_banheiros,
            _n_vagas,
            _area,
            block.timestamp,
            1,
            _first_owner
        );
        casas[total_casas] = _casa;
    }

    function vender_casa(uint256 _id_casa, uint256 valor)
        public
        dono_da_casa(_id_casa)
    {
        require(casas_venda[_id_casa].id == 0, "Casa ja esta a venda");
        ids_casas_venda.push(_id_casa);
        casas_venda[_id_casa] = CasaVenda(
            _id_casa,
            payable(_msgSender()),
            address(0),
            valor,
            false
        );
    }

    function cancelar_venda(uint256 _id_casa) public dono_da_casa(_id_casa) {
        remover_venda(_id_casa);
    }

    function remover_venda(uint256 _id_casa) private {
        uint256 idx = 0;
        bool found = false;
        uint256 total_casas_venda = ids_casas_venda.length;

        for (uint256 i = 0; i < total_casas_venda; i++) {
            if (ids_casas_venda[i] == _id_casa) {
                idx = i;
                found = true;
                break;
            }
        }

        require(found == true, "Casa nao esta a venda");

        ids_casas_venda[idx] = ids_casas_venda[total_casas_venda - 1];
        ids_casas_venda.pop();
        delete casas_venda[_id_casa];
    }

    function comprar_casa(uint256 _id_casa) public payable {
        CasaVenda memory _venda = casas_venda[_id_casa];
        require(_venda.id > 0, "Esta casa nao esta a venda");
        require(
            _msgSender() != _venda.seller,
            "Comprador deve ser diferente do vendedor"
        );
        require(
            msg.value == _venda.price,
            "Valor pago diferente do valor da venda"
        );

        _venda.buyer = _msgSender();
        _venda.sold = true;

        casas_venda[_id_casa] = _venda;

        // transferir casa
        Casa memory _casa = casas[_id_casa];

        _casa.donos++;
        _casa.owner = _msgSender();

        casas[_id_casa] = _casa;

        transferir_fundos_para_vendedor(_id_casa, _msgSender());
    }

    function transferir_fundos_para_vendedor(
        uint256 _id_casa,
        address _new_owner
    ) private {
        CasaVenda memory _venda = casas_venda[_id_casa];
        require(
            _venda.sold == true,
            "Erro: A venda nao foi marcadaa como concluida"
        );
        Casa memory _casa = casas[_id_casa];
        require(
            _casa.owner == _new_owner,
            "Erro: O dono da casa nao foi alterado para comprador"
        );

        _venda.seller.transfer(_venda.price);

        remover_venda(_id_casa);
    }
}
