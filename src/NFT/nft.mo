import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Nat8 "mo:base/Nat8";
import Text "mo:base/Text";

actor class NFT (name : Text, owner : Principal, content : [Nat8]) = this {

  private let imgName = name;
  //owner will change when NFT gets sold
  private var nftOwner = owner;
  private let imageBytes = content;

  public query func getName() : async Text {
    return imgName;
  };

  public query func getOwner() : async Principal {
    return nftOwner;
  };

  public query func getAsset() : async [Nat8] {
    return imageBytes;
  };

  public query func getCanisterId() : async Principal {
    return Principal.fromActor(this);
  };

  public shared(msg) func changeOwner(newOwner : Principal) : async Text {
    if(msg.caller == nftOwner){
      nftOwner := newOwner;
      return "Success";
    } else {
      return "Error: not initiated by NFT Owner.";
    };
  };
  
};