// SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

// contract EduChainCertificate is ERC721URIStorage, Ownable {
//     uint256 public nextTokenId = 1;

//     constructor(address initialOwner)
//         ERC721("EduChain Certificate", "EDCERT")
//         Ownable(initialOwner)
//     {}

//     function mintCertificate(address to, string memory metadataURI)
//         external
//         onlyOwner
//         returns (uint256)
//     {
//         uint256 tokenId = nextTokenId++;
//         _mint(to, tokenId);
//         _setTokenURI(tokenId, metadataURI);
//         return tokenId;
//     }
    
// }
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EduChainCertificate is ERC721URIStorage, Ownable {
    uint256 public nextTokenId = 1;

    // 🟦 THÊM mapping để lưu token theo từng user
    mapping(address => uint256[]) private _ownedCertificates;

    constructor(address initialOwner)
        ERC721("EduChain Certificate", "EDCERT")
        Ownable(initialOwner)
    {}

    function mintCertificate(address to, string memory metadataURI)
        external
        onlyOwner
        returns (uint256)
    {
        uint256 tokenId = nextTokenId++;

        // Mint NFT
        _mint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // 🟩 GHI LẠI tokenId vào danh sách sở hữu của user
        _ownedCertificates[to].push(tokenId);

        return tokenId;
    }

    // 🟦 HÀM GET TOKEN THEO USER — FE CẦN HÀM NÀY
    function getCertificatesOf(address owner)
        external
        view
        returns (uint256[] memory)
    {
        return _ownedCertificates[owner];
    }
}