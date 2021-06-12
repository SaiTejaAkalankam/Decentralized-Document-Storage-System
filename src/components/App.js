import React, { Component } from 'react';
import Image from '../abis/Image.json'

import './App.css';
const ipfsClient = require('ipfs-api')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
var Web3 = require('web3');
var mapp;
var num;
var filename;
var f;
var index = -1;
var CryptoJS = require("crypto-js");
var bytes;
var str = ' ';
var acc;
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
    const accounts = await web3.eth.getAccounts()
    acc = accounts;
    this.setState({ account: accounts[0] })
    console.log(accounts[0])
    const networkId = await web3.eth.net.getId()
    const networkData = Image.networks[networkId]
    if(networkData) {
      const contract = new web3.eth.Contract(Image.abi, networkData.address)
      this.setState({ contract })
      mapp = await this.state.contract.methods.getHashes(acc[0]).call()
       num= await this.state.contract.methods.getNum(acc[0]).call()
       f = await this.state.contract.methods.getFiles(acc[0]).call()
    } 
    else {
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
      account: null,
      d : {}
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
      if(this.state.buffer){
        const file = await ipfs.add(this.state.buffer)
        var imageHash = file[0]["hash"]
        this.getlistfunc()
        var iname=document.getElementById("iname").value;
        var pass1=document.getElementById("pass1").value;
        imageHash = CryptoJS.AES.encrypt(imageHash, pass1).toString();
        this.state.contract.methods.set(imageHash,iname,this.state.account).send({from: this.state.account}).then((r)=>{
        this.setState({imageHash: imageHash}) })  
        await this.loadBlockchainData();
        }
  }

  getlistfunc()  {
      console.log("getlist worked")
      document.getElementById("mydiv").innerHTML = "" ;
      for(var i =0;i<num;i++){
        document.getElementById("mydiv").innerHTML += "Name : "+ f [ i ] +"<br>"+ "Account : "+ acc[0] +"<br>"+"Hash Value : "  + mapp[i]  +"<hr></hr>";
      }
  }

  getFile = async (event)=> {
      event.preventDefault()
      filename = document.getElementById("filename").value;
      var pass2=document.getElementById("pass2").value;
      for( var i =0;i<num;i++) {     
        if( f[i] == filename ){
               index = i;
               break;
          } 
       }
      if( index ==-1) {
        window.alert("Unknown FileName");
      }
      else{
        var s = mapp[index];
        bytes  = CryptoJS.AES.decrypt(s, pass2);
        s = bytes.toString(CryptoJS.enc.Utf8);
        str = "https://ipfs.infura.io/ipfs/" + s;
        var l = filename.link(str);
        document.getElementById("genlink").innerHTML = l;
      }
  }

  getSharedFile  = async (event)=> {
      event.preventDefault()
      var ehash = document.getElementById("eHash").value;
      var pass3=document.getElementById("pass3").value;
      bytes  = CryptoJS.AES.decrypt(ehash, pass3);
      ehash = bytes.toString(CryptoJS.enc.Utf8);
      console.log("decrypted hash :",ehash);
      var str = "https://ipfs.infura.io/ipfs/" + ehash;
      var sharedlink = 'Hash link'
      var l = sharedlink.link(str);
      document.getElementById("gensharedlink").innerHTML = l;
  }

  render() {
    return (
    <div>

      <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-light">
        <a class="navbar-brand" href="">Decentralised document strorage using IPFS</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarText">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item">
              <a class="nav-link" href="#getFile">Get your document</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#getsharedFile">Get shared document</a>
            </li>
          </ul>
          <a class="navbar-text" href="#mydocs">
            My documents
          </a>
        </div>
      </nav>

      <section id="hero" class="d-flex align-items-center">
        <div className="container-fluid">
          <div class="row">
            <div class="col-lg-12 d-flex flex-column justify-content-center pt-4 pt-lg-0 order-2 order-lg-1">
            <h1>Welcome</h1>
            <h2>A Secure blockchain based document storage on IPFS system </h2>
            <div class="d-flex justify-content-center justify-content-lg-start">
              <a href="#click" class="btn-get-started scrollto">Get Started</a>
            </div>
            </div>
          </div>
        <br></br>
          <div class="row">
            <div class="col-md-4 mb-5">
                <img src="https://cdn.filestackcontent.com/hJVZnLd0QeSKIxmzwdM0" width="110"></img>
                <h4 class="my-4 font-weight-bold">BLOCKCHAIN</h4>
                <p class="white-text">Blockchain seems complicated, and it definitely can be, but its core concept is really quite simple. A blockchain is a type of database.</p>
            </div>
            <div class="col-md-4 mb-1">
              <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" width="100"></img>
                <h4 class="my-4 font-weight-bold">ETHEREUM</h4>
                <p class="white-text">An Ethereum account contains ether balance, nounce, contract code hash and storage root. Each transaction contains a signature which is used to identify the sender, recipient and amount of ether. </p>
            </div>
            <div class="col-md-4 mb-1">
              <img src="https://upload.wikimedia.org/wikipedia/commons/1/18/Ipfs-logo-1024-ice-text.png" width="90"></img>
                <h4 class="my-4 font-weight-bold">IPFS</h4>
                <p class="white-text">The IPFS is a peer-to-peer distributed file system that uses a DHT (a distributed form of hash table) to track who owns what data. Additionally, it is a new model of sharing files in a distributed fashion.</p>
            </div>
          </div>

        </div>
      </section>
        
      <section id="click">
        <br/><br/><br/><br/>
        <div className="card text-center">
          <div className="card-header">
          Upload your Document
          </div>
          <div class="card-body">
            <h5 class="card-title">Account Name</h5> <p id ="accname">{this.state.account} </p>
            <p class="card-text">The document will get encrypted and stored it on to the IPFS</p>
            <form>
                  <input type ="text" class="form-control" placeholder ="File name" id= "iname" required></input>
                  &nbsp;
                  <input type ="password" class="form-control" placeholder ="Password" id= "pass1" required></input>
                    <br></br>
                  <input class="btn" type="file"  onChange={this.captureFile}></input>
                  <input type="submit" class="btn btn-primary" value="Upload" onClick={this.onSubmitClick}></input>
                  
            </form>           
          </div>    
        </div>
      </section>
          
      <section id="getFile">
      <br></br><br></br><br></br>
        <div class="card text-center">
          <div class="card-header">
          View your Document
          </div>
          <div class="card-body">
            <p class="card-text">Write the exact name to get link</p>
            <form>
                  <input type="text" id = "filename" class="form-control" placeholder="Enter file name"></input> &nbsp;&nbsp;&nbsp;
                  &nbsp;
                  <input type ="password"class="form-control" placeholder ="Password" id= "pass2" width="50px"></input>
                  <br></br>
                  <input type="submit" class="btn btn-primary" onClick={this.getFile}></input>
                    <div id ="genlink">
                    </div>
            </form>
          </div>
        </div>
      </section>

      <section id="mydocs">
        <br/><br/><br/><br/>
        <div class="card text-center" >
          <div class="card-header">
          Your Documents
          </div>
          <div class="card-body"> 
          <a href="#click" class="btn btn-success">Upload another document</a>
          &nbsp;&nbsp;&nbsp;
            <input type="submit" class="btn btn-primary" value = "View Document history" onClick={this.getlistfunc}></input>
          </div>
          <div class="card-body" id="cardd">
            <div id ="mydiv">
            </div>           
          </div>
        </div>
      </section>

      <section id="getsharedFile">
        <br></br><br></br><br></br>
        <div class="card text-center">
          <div class="card-header">
          Get shared Document
          </div>
          <div class="card-body">
            <p class="card-text">Write the shared encrypted hash along with password</p>
            <form>
                  <input type="text" id = "eHash" class="form-control" placeholder="Enter encrypted-hash"></input> &nbsp;&nbsp;&nbsp;
                  &nbsp;
                  <input type ="password"class="form-control" placeholder ="Password" id= "pass3" width="50px"></input>
                  <br></br>
                  <input type="submit" class="btn btn-primary" onClick={this.getSharedFile}></input>
                    <div id ="gensharedlink">
                    </div>
            </form>
          </div>
        </div>
      </section>
          
    </div>
    );
  }
}

export default App;
 