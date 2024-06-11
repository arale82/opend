import React, { useEffect, useState } from "react";
//import logo from "../../public/logo.png";
import { HttpAgent, Actor } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { opend_backend } from "../../../declarations/opend_backend";
import CURRENT_USER_ID from "../main";
import PriceLabel from "./PriceLabel";
import { createActor, idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory, token_backend } from "../../../declarations/token_backend";

function Item(props) {
  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [img, setImg] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [showError, setShowError] = useState();
  const [blur, setBlur] = useState();
  const [showListed, setShowListed] = useState();
  const [priceLabel, setPriceLabel] = useState();
  const [isLoaderHidden, setLoaderHidden] = useState(true);
  const [isVisible, setVisible] = useState(true);

  const id = props.id;
  const localHost = "http://localhost:3001/";
  const agent = new HttpAgent({host : localHost});
  //only locally
  agent.fetchRootKey();

  let NFTActor;

  async function loadNft(){
    NFTActor = Actor.createActor(idlFactory, {
      agent,
      canisterId : id,
    });

    const name = await NFTActor.getName();
    setName(name);
    const owner = await NFTActor.getOwner();
    setOwner(owner.toText());
    const imageData = await NFTActor.getAsset();
    const imageContent = new Uint8Array(imageData);
    const image = URL.createObjectURL(new Blob([imageContent.buffer], { type: "img/png" }));
    setImg(image);

    if(props.role == "collection"){
      const isListed = await opend_backend.isListed(props.id);
      if(isListed) {
        setOwner("OpenD");
        setBlur({filter: "blur(4px)"});
        setShowListed("Listed");
      } else {
        setButton(<Button handleClick={handleSellButton} text="Sell" />);
      }
    } else if(props.role == "discover"){
      //check originalOwner to show/not the BUY button.
      const originalOwner = await opend_backend.getOriginalOwner(props.id);
      if(originalOwner.toText() != CURRENT_USER_ID.toText()) {
        setButton(<Button handleClick={handleBuy} text="Buy" />);
      }
      const sellPrice = await opend_backend.getListedNFTPrice(props.id);
      setPriceLabel(<PriceLabel sellPrice={sellPrice.toLocaleString()} />);
    }
  }

  let priceValue;
  function handleSellButton() {
    setPriceInput(<input
      placeholder="Price in ARAL"
      type="number"
      className="price-input"
      value={priceValue}
      onChange={(e) => priceValue = e.target.value}
    />);
    setButton(<Button handleClick={sellItem} text="Confirm" />);
  }

  async function sellItem(){
    setLoaderHidden(false);
    setBlur({filter: "blur(4px)"});
    const listingResult = await opend_backend.listItem(id, parseInt(priceValue));
    if(listingResult == "Success"){
      const newOwner = await opend_backend.getOpenDCanisterID();
      const sellResult = await NFTActor.changeOwner(newOwner);
      if(sellResult == "Success") {
        setPriceInput();
        setButton();
        setOwner("OpenD");
        setShowListed("Listed");
      } else {
        setShowError("ERROR:"+sellResult);
        setBlur();
        setPriceInput();
        setButton(<Button handleClick={handleSellButton} text="Sell" />);
      }
    } else {
      setShowError("ERROR:"+listingResult);
      setBlur();
      setPriceInput();
      setButton(<Button handleClick={handleSellButton} text="Sell" />);
    }
    setLoaderHidden(true);
  }

  async function handleBuy(){
    setLoaderHidden(false);
    const tokenActor = await Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId : Principal.fromText("bkyz2-fmaaa-aaaaa-qaaaq-cai"),
    });

    const sellerId = await opend_backend.getOriginalOwner(props.id);
    const itemPrice = await opend_backend.getListedNFTPrice(props.id);

    //transfer the money first
    const transferResult = await tokenActor.transfer(sellerId, parseInt(itemPrice));
    if(transferResult == "Success"){
      //transfer the ownership
      const purchaseResult = await opend_backend.completePurchase(props.id, sellerId, CURRENT_USER_ID);
      //hide the item once sold.
      setVisible(false);
    } else {
      console.log("ERROR: "+transferResult);
    }
    setLoaderHidden(true);
  }

  useEffect(() => {
    loadNft();
  }, []);
  
  return (
    <div style={{display: isVisible ? "inline" : "none"}} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={img}
          style={blur}
        />
        <div className="lds-ellipsis" hidden={isLoaderHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> {showListed}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          <p><span className="purple-text">{showError}</span></p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
