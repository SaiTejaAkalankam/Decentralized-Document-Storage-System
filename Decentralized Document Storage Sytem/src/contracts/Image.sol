pragma solidity >=0.4.24;
pragma experimental ABIEncoderV2;

contract Image{
  string imageHash;
  string fileName;

  struct Accounts{ 
  bool exists;
  FileNames fn;
  ImageHashes ih;
  }

  mapping(address=>Accounts)  addre;
  uint public no_of_acc;

  struct FileNames{ 
  uint nums;
  mapping(uint => string) file_names;
  }

  struct ImageHashes{
  uint no_of_img;
    mapping(uint => string) file_img;
  }

  FileNames fn;
  ImageHashes ih;

  function set(string memory _imageHash,string memory _filename,address a) public {
    imageHash = _imageHash;
    fileName = _filename;
    if( addre[a].exists==false){
     addre[a].exists=true;
     no_of_acc++;
    }
    addre[a].fn.file_names[addre[a].fn.nums++]=fileName;
    addre[a].ih.file_img[ addre[a].ih.no_of_img++]=imageHash;
  }

  function getNum(address a) public view returns (uint){
    return addre[a].ih.no_of_img;
  }

  function getFiles(address a) public view returns (string[ ] memory){
    string[ ] memory fileArray = new string[ ](addre[a].fn.nums);
    for( uint i =0; i< addre[a].fn.nums;i++){
      fileArray[ i ] = addre[a].fn.file_names[i];
    }
    return fileArray;
  }

  function getHashes(address a) public view returns (string[ ] memory){
    string[ ] memory imgArray = new string[ ](addre[a].ih.no_of_img);
    for( uint i =0; i< addre[a].ih.no_of_img;i++){
      imgArray[ i ] = addre[a].ih.file_img[ i ];
    }
   return imgArray;
  }
}
