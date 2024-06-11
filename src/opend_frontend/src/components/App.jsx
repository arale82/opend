import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "/logo.png";
import homeImage from "/home-img.png";
import { BrowserRouter, Link, Route, Routes, Outlet } from "react-router-dom";
import Minter from "./Minter";
import Gallery from "./Gallery";
import { opend_backend } from "../../../declarations/opend_backend";
import CURRENT_USER_ID from "../main";
import Footer from "./Footer";

function App() {
  const NFTID = "br5f7-7uaaa-aaaaa-qaaca-cai";

  const [userGallery, setUserGallery] = useState("");
  const [listedGallery, setListedGallery] = useState("");

  async function getNFTs(){
    const arrayNfts = await opend_backend.getNFTsByUser(CURRENT_USER_ID);
    setUserGallery(<Gallery title="My NFTs" nftIds={arrayNfts} role="collection" key="collection" />);

    const arrayListedNfts = await opend_backend.getNFTsListed();
    setListedGallery(<Gallery title="Discover" nftIds={arrayListedNfts} role="discover" key="discover" />);
  }

  useEffect(() => {
    getNFTs();
  },[]);

  return (
    <div className="App">
      <BrowserRouter forceRefresh={true}>

        <Routes forceRefresh={true}>
          <Route path="/" element={<Layout />}>
            <Route index element={<img className="bottom-space" src={homeImage} />} />
            <Route path="/discover" element={listedGallery} />
            <Route path="/minter" element={<Minter />} />
            <Route path="/collection" element={userGallery} />

            {<Route path="*" element={<NoMatch />} />}
          </Route>
        </Routes>
      </BrowserRouter>

      <Footer />
    </div>
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

export default App;
