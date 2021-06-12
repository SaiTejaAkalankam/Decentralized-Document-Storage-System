import React, { Component } from 'react';
// import Web3 from "web3";
import Image from '../abis/Image.json'



import './App.css';
const ipfsClient = require('ipfs-api')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
var Web3 = require('web3');


class App extends Component {

async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

async loadWeb3() {
  

    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
}

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Image.networks[networkId]
    if(networkData) {
      const contract = new web3.eth.Contract(Image.abi, networkData.address)
      this.setState({ contract })
      const imageHash = await contract.methods.get().call()
      this.setState({ imageHash })
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }


  constructor(props){
    super(props);
    this.state = {
      imageHash: '',
      contract: null,
      web3: null,
      buffer: null,
      account: null

    }; 

  }
  captureFile = (event)=>{
    event.preventDefault();
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () =>{
      this.setState({buffer: Buffer.from(reader.result)})
    }
  }
  onSubmitClick = async (event)=>{
      event.preventDefault()
      console.log("Submitting File");
      if(this.state.buffer){
        const file = await ipfs.add(this.state.buffer)
        const imageHash = file[0]["hash"]
        // console.log(imageHash);
        this.state.contract.methods.set(imageHash).send({from: this.state.account}).then((r)=>{
          this.setState({imageHash: imageHash})
        })
      }
    }
render() {
    return (
    <div>
        <nav className="navbar navbar-dark fixed-top flex-md p-0 shadow">
            <p className = "title">
            Decentralised Document Storage using IPFS 
            </p>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-md-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                  <div className ="container">
                  <img className = "photo" src={`https://ipfs.infura.io/ipfs/${this.state.imageHash}`}  alt="Display Document" />
                  </div>
                <div className="container-form">
                <h2>Change File</h2>
                <form>
                  <input type="file" onChange={this.captureFile}></input>
                  <input type="submit" onClick={this.onSubmitClick}></input>
                </form>
                </div>
                <div>
                  <p>
            
                  {/* {this.state.account} */}
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
}
}