import React, { Component } from "react";
// import Button from '@mui/material/Button';
// import Box from '@mui/material/Box';
// import ButtonGroup from '@mui/material/ButtonGroup';
import kycImg from "../src/assets/kyc.jpg";
import verifImg from "../src/assets/verif.png"


import KycBlockChain from "./contracts/KycBlockChain.json";
import getWeb3 from "./getWeb3";
import "./App.css";
const crypto = require("crypto-browserify");

const GetAllBankAccounts = (props) => {   
  if (parseInt(props.bankcount) > 0) {
    return (
      <div>
        {props.banks.map((bank) => (
          <p key={bank.key}>{bank.address}</p>
        ))}
      </div>
    );
  } else {
    return (
      <div>
        <p>There are no verified Bank Accounts in this network!</p>
      </div>
    );
  }
};

const GetAllBankRequests = (props) => {
  return (
    <div>
      {props.bankrequests.map((request) => (
        <p key={request.key}>
          {request.name} - {request.address}
        </p>
      ))}
    </div>
  );
};
//------tab navigation starts here--------
const hideAll = () => {
  document.getElementsByClassName("new-customer")[0].style.display = "none";
  document.getElementsByClassName("existing-customer")[0].style.display =
    "none";
  document.getElementsByClassName("existing-customer")[1].style.display =
    "none";
  document.getElementsByClassName("new-bank")[0].style.display = "none";
  document.getElementsByClassName("existing-bank")[0].style.display = "none";
  document.getElementsByClassName("existing-bank")[1].style.display = "none";
  let elements = document.querySelectorAll(".active-button");
  for (var i = 0; i < elements.length; i++) {
    elements[i].classList.remove("active-button");
  }
};
const show = (target) => {
  hideAll();
  document.getElementById(`${target}-button`).classList.add("active-button");
  if (target === "new-customer") {
    document.getElementsByClassName("new-customer")[0].style.display = "block";
  }
  if (target === "existing-customer") {
    document.getElementsByClassName("existing-customer")[0].style.display =
      "block";
    document.getElementsByClassName("existing-customer")[1].style.display =
      "block";
  }
  if (target === "existing-bank") {
    document.getElementsByClassName("existing-bank")[0].style.display = "block";
    document.getElementsByClassName("existing-bank")[1].style.display = "block";
  }
  if (target === "new-bank") {
    document.getElementsByClassName("new-bank")[0].style.display = "block";
  }
};
//------tab navigation ends here--------

//setting state values
class App extends Component {
  state = {
    web3: null,
    account: null,
    contract: null,
    name: null,
    cin: null,
    pan: null,
    getdata: null,
    data_hash: null,
    b_name: null,
    bank_verify: null,
    entity: null,
    allaccounts: null,
    allbanks: [],
    bank_count: 0,
    status: null,
    requestAddress: null,
    bankrequests: [],
    cinVerify: null,
    panVerify: null,
    verified: null,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = KycBlockChain.networks[networkId];
      const instance = new web3.eth.Contract(
        KycBlockChain.abi,
        deployedNetwork && deployedNetwork.address
      );
      console.log(deployedNetwork.address , networkId , instance);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3,
        account: accounts[0],
        contract: instance,
        allaccounts: accounts,
      });
      this.whoami();
      this.numbanks();
      this.onAccountChanged();
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
    show("new-customer");
  };

  myNameChangeHandler = (event) => {
    this.setState({ name: event.target.value });
  };
  myCinChangeHandler = (event) => {
    this.setState({ cin: event.target.value });
  };
  myPanChangeHandler = (event) => {
    this.setState({ pan: event.target.value });
  };

  myBankNameChangeHandler = (event) => {
    this.setState({ bname: event.target.value });
  };

  myDataChangeHandler = (event) => {
    this.setState({ getdata: event.target.value });
  };

  myData1ChangeHandler = (event) => {
    this.setState({ cinVerify: event.target.value });
  };

  myData2ChangeHandler = (event) => {
    this.setState({ panVerify: event.target.value });
  };

  myVBankChangeHandler = (event) => {
    this.setState({ bank_verify: event.target.value });
  };

  requestAddressChange = (event) => {
    this.setState({ requestAddress: event.target.value });
  };

  onAccountChanged = () => {
    window.ethereum.on("accountsChanged", () => {
      window.location.reload();
    });
  };

  whoami = async () => {
    var { contract } = this.state;
    const cus = await contract.methods
      .isCus()
      .call({ from: this.state.account });
    const org = await contract.methods
      .isOrg()
      .call({ from: this.state.account });

    var who = cus ? "Customer" : org ? "Bank" : "None";
    this.setState({ entity: who });
  };

  createmycustomer = async () => {
    var { contract } = this.state;
    await contract.methods
      .newCustomer(
        this.state.name,
        crypto
          .createHash("sha1")
          .update(this.state.cin + this.state.pan)
          .digest("hex"),
        this.state.bank_verify
      )
      .send({ from: this.state.account })
      .then(() => {
        window.alert("You successfully made an account!");
        window.location.reload();
      });
  };

  createmybank = async () => {
    var { contract } = this.state;

    await contract.methods
      .newOrganisation(this.state.bname)
      .send({ from: this.state.account })
      .then(() => {
        window.alert("You are now a verified Bank Entity!");
        window.location.reload();
      });
  };

  verifykycfromcustomer = async () => {
    var { contract } = this.state;
    const response = await contract.methods
      .viewCustomerData(this.state.getdata)
      .call({ from: this.state.account });

    this.setState({ data_hash: response });

    const dhash = crypto
      .createHash("sha1")
      .update(this.state.cinVerify + this.state.panVerify)
      .digest("hex");

    if (dhash === this.state.data_hash) {
      this.setState({ verified: "Success" });
    } else {
      this.setState({ verified: "Fail" });
    }
  };

  get = async () => {
    var { contract } = this.state;
    var access = await contract.methods
      .isOrg()
      .call({ from: this.state.account });
    if (access) {
      this.verifykycfromcustomer();
    } else {
      window.alert("You are not a verified Bank!");
    }
  };

  create_customer = async (e) => {
    e.preventDefault();
    var { contract } = this.state;
    var access = await contract.methods
      .isCus()
      .call({ from: this.state.account });

    if (!access) {
      this.createmycustomer();
      this.whoami();
    } else {
      window.alert("You already have an account!");
    }
  };

  create_bank = async (e) => {
    e.preventDefault();
    var { contract } = this.state;
    var access = await contract.methods
      .isOrg()
      .call({ from: this.state.account });

    var ifcustomer = await contract.methods
      .isCus()
      .call({ from: this.state.account });

    if (!access && !ifcustomer) {
      this.createmybank();
      this.whoami();
    } else if (ifcustomer) {
      window.alert("Customer entities cannot be a bank!");
    } else {
      window.alert("You are already a bank!");
    }
  };

  modify_data = async (e) => {
    e.preventDefault();
    var { contract } = this.state;
    var confirm = await contract.methods
      .isCus()
      .call({ from: this.state.account });
    if (confirm) {
      await contract.methods
        .modifyCustomerData(
          this.state.name,
          crypto
            .createHash("sha1")
            .update(this.state.name + this.state.cin + this.state.pan)
            .digest("hex"),
          this.state.bank_verify
        )
        .send({ from: this.state.account })
        .then(() => {
          window.alert("Data Changed!");
          window.location.reload();
        });
    } else {
      window.alert("You are not permitted to use this function!");
    }
  };

  numbanks = async () => {
    var { contract } = this.state;
    var len = await contract.methods.bankslength().call();
    this.setState({ bank_count: len });
    var banks = [];
    if (parseInt(this.state.bank_count) > 0) {
      for (var i = 0; i < len; i++) {
        banks.push({
          key: i,
          address: await contract.methods.Banks(i).call(),
        });
      }
    }

    this.setState({ allbanks: banks });
  };

  getmystatus = async () => {
    var { contract } = this.state;
    var status = await contract.methods
      .checkStatus()
      .call({ from: this.state.account });

    if (status === "0") {
      this.setState({ status: "Accepted" });
    } else if (status === "1") {
      this.setState({ status: "Rejected" });
    } else if (status === "2") {
      this.setState({ status: "Pending" });
    } else {
      this.setState({ status: "Undefined" });
    }
  };

  viewRequests = async () => {
    var { contract } = this.state;
    var reqs = await contract.methods.viewRequests().call({
      from: this.state.account,
    });
    var all_reqs = [];
    var i = 0;
    for (const req in reqs) {
      all_reqs.push({
        key: i,
        address: reqs[req],
        name: await contract.methods.viewName(reqs[req]).call(),
      });
      i++;
    }
    this.setState({ bankrequests: all_reqs });
  };

  accept = async () => {
    var { contract } = this.state;
    await contract.methods
      .changeStatusToAccepted(this.state.requestAddress)
      .send({ from: this.state.account })
      .then(
        () => {
          window.alert("Status Changed!");
          window.location.reload();
        },
        () => {
          window.alert("You are not authorized!");
        }
      );
  };

  reject = async () => {
    var { contract } = this.state;
    await contract.methods
      .changeStatusToRejected(this.state.requestAddress)
      .send({ from: this.state.account })
      .then(
        () => {
          window.alert("Status Changed!");
          window.location.reload();
        },
        () => {
          window.alert("You are not authorized!");
        }
      );
  };




  
  render() {
    if (!this.state.web3) {
      return <div style={{backgroundColor:"#eef5db",color:"#fe5f55", fontFamily:"Arimo" , fontSize : "20px", fontWeight :"900"}}>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div className='home__hero-section darkBg'>
        <div className='container'>
        <div
            className='row home__hero-row'
            style={{
              display: 'flex',
              flexDirection: 'row'
            }}
          >
          <div className='col'>
            <div className='home__hero-text-wrapper'>
        <h2 className='heading '>Current Account is a {this.state.entity} entity
        
            <img src={verifImg} alt="verif"  />
            
        </h2>
        <h3 className='home__hero-subtitle '
                    style={{
                      padding:"15px"
                    }}>{this.state.account}</h3>
       
   </div>
        <div >

        {/* <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& > *': {
          m: 1,
        },
      }}
    >
      <ButtonGroup size="large" aria-label="large button group">
      <Button onClick={() => {
              show("new-customer");
            }}
            id="new-customer-button">New customer</Button>
            <Button onClick={() => {
              show("existing-customer");
            }}
            id="existing-customer-button"
          >
            Existing customer</Button>
            <Button onClick={() => {
              show("new-bank");
            }}
            id="new-bank-button"
          >
            New Organisation</Button>
            <Button onClick={() => {
              show("existing-bank");
            }}
            id="existing-bank-button"
          >
            View Organisation internal access</Button>
      </ButtonGroup>

    </Box> */}
    
    <fieldset style={{
          padding:"15px"
        }}>
          <button
          style = {{
            cursor:" pointer",
            height: "40px",
            /* margin-left: 4,0px; */
            fontSize: "12px",
            padding: "4px 18px",
            margin: "5px",
            backgroundColor: "aliceblue",
            transition: "all 0.4s ease-out",
            border: "none",
          }}
            onClick={() => {
              show("new-customer");
            }}
            id="new-customer-button"
          >
            New customer
          </button>
          <button
          style = {{
            cursor:" pointer",
            height: "40px",
            /* margin-left: 4,0px; */
            fontSize: "12px",
            padding: "4px 18px",
            margin: "5px",
            backgroundColor: "aliceblue",
            transition: "all 0.4s ease-out",
            border: "none",
          }}
            onClick={() => {
              show("existing-customer");
            }}
            id="existing-customer-button"
          >
            Existing customer
          </button>
          <button
          style = {{
            cursor:" pointer",
            height: "40px",
            /* margin-left: 4,0px; */
            fontSize: "12px",
            padding: "4px 18px",
            margin: "5px",
            backgroundColor: "aliceblue",
            transition: "all 0.4s ease-out",
            border: "none",
          }}
            onClick={() => {
              show("new-bank");
            }}
            id="new-bank-button"
          >
            New Organisation
          </button>
          <button
          style = {{
            cursor:" pointer",
            height: "40px",
            /* margin-left: 4,0px; */
            fontSize: "12px",
            padding: "4px 18px",
            margin: "5px",
            backgroundColor: "aliceblue",
            transition: "all 0.4s ease-out",
            border: "none",
          }}
            onClick={() => {
              show("existing-bank");
            }}
            id="existing-bank-button"
          >
            View Organisation internal access
          </button>
          </fieldset>
        </div>

      

        <div className="new-customer form-top-padding">
          <form action="." method="" onSubmit={this.create_customer}>
            
            <fieldset style={{
          padding:"15px"
        }}>
                <div className='home__hero-text-wrapper'>
                 
                <strong style={{color:"#97d8c4", fontFamily:"Arimo" , fontSize : "20px", fontWeight :"900"}}>Customer Registration Form (New customers only)</strong>
                </div>

              <p>
                <label>Your Name </label>
                <input type="text" onChange={this.myNameChangeHandler} />
              </p>

              <p>
                <label>Your ID </label>
                <input type="text" onChange={this.myCinChangeHandler} />
              </p>

              <p>
                <label>Your Pan : Permanent Account Number </label>
                <input type="text" onChange={this.myPanChangeHandler} />
              </p>

              <p>
                <label>
                  Organisation Address you want to verify your data with{" "}
                </label>
                <input type="text" onChange={this.myVBankChangeHandler} />
              </p>
              <p>
                <input type="submit" name="submit" value="Create Customer" />
              </p>
            </fieldset>
          </form>
        </div>

        <div className="new-bank">
          <form action="." method="" onSubmit={this.create_bank}>
          <fieldset style={{
          padding:"15px"
        }}>
            <div >
                <strong style={{color:"#97d8c4", fontFamily:"Arimo" , fontSize : "20px", fontWeight :"900"}}>Organisation registration form (New organisations only)</strong>
                </div>
              <p>
                <label>Organisation Name </label>
                <input type="text" onChange={this.myBankNameChangeHandler} />
              </p>
              <p>
                <input type="submit" name="submit" value="Create bank" />
              </p>
              </fieldset>
          </form>
        </div>

        <div className="existing-customer">
          <form action="." method="" onSubmit={this.modify_data}>
          <fieldset style={{
          padding:"15px"
        }}>
              
            <div >
                <strong style={{color:"#97d8c4", fontFamily:"Arimo" , fontSize : "20px", fontWeight :"900"}}>Update existing customer data (existing customers only)</strong>
             </div>
              
              <p>
                <label>New Name </label>
                <input type="text" onChange={this.myNameChangeHandler} />
              </p>
              <p>
                <label>New ID </label>
                <input type="text" onChange={this.myCinChangeHandler} />
              </p>
              <p>
                <label>New Pan : Permanent Account Number </label>
                <input type="text" onChange={this.myPanChangeHandler} />
              </p>
              <p>
                <label>New Organisation Verify </label>
                <input type="text" onChange={this.myVBankChangeHandler} />
              </p>
              <p>
                <input type="submit" name="submit" value="Change Data" />
              </p>
            </fieldset>
          </form>
        </div>
        <br />
        <div className="existing-bank">
          <fieldset style={{
          padding:"15px"
        }}>
          <div>
          
                <strong style={{color:"#97d8c4", fontFamily:"Arimo" , fontSize : "20px", fontWeight :"900"}}>Requests</strong>
             </div>
            <p>
              <button onClick={this.viewRequests}>View user Requests</button>
            </p>
            <GetAllBankRequests bankrequests={this.state.bankrequests} />
            <div >
            <p>
              <label>Request Address </label>
              <input type="text" onChange={this.requestAddressChange} />
            </p>

            <p>
              <button onClick={this.accept} className="accept-button">
                Accept Request
              </button>

              <button onClick={this.reject} className="reject-button">
                Reject Request
              </button>
            </p>
           
            </div>
         </fieldset>
        </div>

        <div className="existing-bank">
          <br />
          <div>
          <fieldset style={{
          padding:"15px"
        }}>
            <label>
              <strong style={{color:"#97d8c4", fontFamily:"Arimo" , fontSize : "20px", fontWeight :"900"}}>Verify Customer Data</strong>
            </label>
            <p>
              <label>Address </label>
              <input type="text" onChange={this.myDataChangeHandler} />
            </p>
            <p>
              <label>ID </label>
              <input type="text" onChange={this.myData1ChangeHandler} />
            </p>
            <p>
              <label> Pan : Permanent Account Number </label>
              <input type="text" onChange={this.myData2ChangeHandler} />
            </p>
            <button onClick={this.get}>Verify</button>
            <p>Verification : {this.state.verified}</p>
            </fieldset>
          </div>
        </div>

        <div className="existing-customer">
          <br />
          <div>
          <fieldset style={{
          padding:"15px"
        }}>
            <label>
              <strong style={{color:"#97d8c4", fontFamily:"Arimo" , fontSize : "20px", fontWeight :"900"}}>View Customer Status</strong>
            </label>
            <p>
              <button onClick={this.getmystatus}>Get Customer Status</button>
            </p>
            <p>Customer Status is: {this.state.status}</p>
            </fieldset>
          </div>
        </div>
        </div>
        <div className='col'>
        <div className='home__hero-text-wrapper'>
          <div className="form-top-padding">
        <fieldset style={{
          padding:"15px",
          marginRight: "64px"
        }}>
          <div>
            <strong  style={{color:"#fe5f55", fontFamily:"Arimo" , fontSize : "20px", fontWeight :"900"}}>
            Verified Organisation Addresses
            </strong>
            </div>
          <GetAllBankAccounts
            bankcount={this.state.bank_count}
            banks={this.state.allbanks}
          />
       </fieldset>
        </div>
        </div>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
       

        <div className='home__hero-img-wrapper'>
            <img src={kycImg} alt="kyc" className='home__hero-img' />
            </div>
            
            {/* <div className='home__hero-img-wrapper'>
            <img src={kyc2Img} alt="kyc2" className='home__hero-img' />
            </div> */}
            
          </div>
        </div>
        </div>
      </div>
    );
  }
}

export default App;
