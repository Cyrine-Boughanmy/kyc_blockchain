// const path = require("path");

// module.exports = {
//   // See <http://truffleframework.com/docs/advanced/configuration>
//   // to customize your Truffle configuration!
//   contracts_build_directory: path.join(__dirname, "client/src/contracts"),
//   networks: {
//     develop: {
//       port: 8545
//     }
//   }
// };


module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "5777",    // Any network (default: none)
     
    },
  },

  compilers: {
    solc: {
      version: "0.8.17",    // Fetch exact version from solc-bin (default: truffle's version)
      
    }
  }
}
