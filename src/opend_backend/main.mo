import Cycles "mo:base/ExperimentalCycles";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Array "mo:base/Array";
import Bool "mo:base/Bool";
import Iter "mo:base/Iter";
import NFTActorClass "../NFT/nft";

actor OpenD {
  private type Listing = {
    itemOwner : Principal;
    itemPrice : Nat;
  };
  
  var mapOfNFTs = HashMap.HashMap<Principal, NFTActorClass.NFT>(1, Principal.equal, Principal.hash);
  var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);
  var mapOfListings = HashMap.HashMap<Principal, Listing>(1, Principal.equal, Principal.hash);
  

  public shared(msg) func mint(imgName : Text, imgData : [Nat8]) : async Principal {    
    let owner : Principal = msg.caller;
    Cycles.add<system>(10_000_000_000_000);
    Debug.print("new cycle balance");
    Debug.print(debug_show(Cycles.balance()));
    let newNFT = await NFTActorClass.NFT(imgName, owner, imgData);

    let newNFTPrincipal = await newNFT.getCanisterId();

    mapOfNFTs.put(newNFTPrincipal, newNFT);
    addToOwnershipMap(owner, newNFTPrincipal);

    Debug.print(debug_show(mapOfNFTs.size()));
    return newNFTPrincipal;
  };

  private func addToOwnershipMap(owner : Principal, nftId : Principal) {
    var ownedNFTs : List.List<Principal> = switch(mapOfOwners.get(owner)) { 
      case null List.nil<Principal>();
      case (?result) result;
    };
    ownedNFTs := List.push(nftId, ownedNFTs);
    mapOfOwners.put(owner, ownedNFTs);
  };

  public query func getNFTsByUser(user : Principal) : async [Principal] {
    var ownedNFTs : List.List<Principal> = switch(mapOfOwners.get(user)) { 
      case null List.nil<Principal>();
      case (?result) result;
    };
    return List.toArray<Principal>(ownedNFTs);
  };

  public query func getNFTsListed() : async [Principal] {
    let ids = Iter.toArray(mapOfListings.keys());
    return ids;
  };

  public shared(msg) func listItem(id : Principal, price : Nat) : async Text {
    //find the item
    var item : NFTActorClass.NFT = switch(mapOfNFTs.get(id)) {
      case(?value) { value };
      case(null) { return "NFT not found." };
    };
    //find the owner to check if privileges are okay
    let owner : Principal = await item.getOwner();
    if(Principal.equal(owner, msg.caller)) {
      //create new listing
      let newListing : Listing = {
        itemOwner = owner;
        itemPrice = price;
      };
      mapOfListings.put(id, newListing);
      return "Success";
    } else {
      return "You don't own this NFT.";
    };
  };

  public query func getOpenDCanisterID() : async Principal {
    return Principal.fromActor(OpenD);
  };

  public query func isListed(id : Principal) : async Bool {
    if(mapOfListings.get(id) == null){
      return false;
    } else {
      return true;
    };
  };

  public query func getOriginalOwner(id : Principal) : async Principal {
    let listing : Listing = switch(mapOfListings.get(id)) {
      case null return Principal.fromText("");
      case (?value) value ;
    };
    return listing.itemOwner;
  };

  public query func getListedNFTPrice(id : Principal) : async Nat {
    let listing : Listing = switch(mapOfListings.get(id)) {
      case null return 0;
      case (?value) value ;
    };
    return listing.itemPrice;
  };

  public shared(msg) func completePurchase(id : Principal, ownerId : Principal, newOwnerId : Principal) : async Text {
    //find the item
    var item : NFTActorClass.NFT = switch(mapOfNFTs.get(id)) {
      case(?value) { value };
      case(null) { return "NFT not found." };
    };

    let transferResult = await item.changeOwner(newOwnerId);
    if(transferResult == "Success"){
      //delete from listings map
      mapOfListings.delete(id);
      //delete from prevOwner list
      var ownedNFTs : List.List<Principal> = switch(mapOfOwners.get(ownerId)) { 
        case null List.nil<Principal>();
        case (?result) result;
      };
      ownedNFTs := List.filter(ownedNFTs, func(listItemId : Principal) : Bool {
        return listItemId != id;
      });
      //add to the new owner
      addToOwnershipMap(newOwnerId, id);
      return "Success";
    } else {
      return "Error";
    };
  };

};
