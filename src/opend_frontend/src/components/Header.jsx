import React, { useEffect, useState } from "react";
import logo from "/logo.png";
import homeImage from "/home-img.png";
import { BrowserRouter, Link, Route, Routes, Outlet } from "react-router-dom";
import Minter from "./Minter";
import Gallery from "./Gallery";
import { opend_backend } from "../../../declarations/opend_backend";
import CURRENT_USER_ID from "../main";

function Header() {

  const [userGallery, setUserGallery] = useState();

  async function getNFTsByOwner(){
    const arrayNfts = await opend_backend.getNFTsByUser(CURRENT_USER_ID);
    setUserGallery(<Gallery title="Gallery" nftIds={arrayNfts} />);
  }

  useEffect(() => {
    getNFTsByOwner();
  },[]);

  return (
    <BrowserRouter forceRefresh={true}>

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<img className="bottom-space" src={homeImage} />} />
          <Route path="/discover" element={<h1>DIscover</h1>} />
          <Route path="/minter" element={<Minter />} />
          <Route path="/collection" element={userGallery} />

          {<Route path="*" element={<NoMatch />} />}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function Layout() {
  return (
    <div>
      {/* A "layout route" is a good place to put markup you want to
          share across all the pages on your site, like navigation. */}
      <div className="app-root-1">
        <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
          <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
            <div className="header-left-4"></div>
            <img className="header-logo-11" src={logo} />
            <div className="header-vertical-9"></div>
            <Link to="/"><h5 className="Typography-root header-logo-text">OpenD</h5></Link>
            <div className="header-empty-6"></div>
            <div className="header-space-8"></div>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/discover">Discover</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/minter">Minter</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/collection">My NFTs</Link>
            </button>
          </div>
        </header>
      </div>
      <Outlet />
    </div>
  );
}

function NoMatch () {
  return (<h1>Page not found</h1>);
}

export default Header;
