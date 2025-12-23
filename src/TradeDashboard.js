import React from "react";
import { DockviewReact } from "dockview";
import "dockview/dist/styles/dockview.css";

// Import Components
import TradeSearch from "./TradeSearch";
import TradeDisplay from "./TradeDisplay";
import { WatchlistProvider } from "./WatchlistContext";

// Define Panel Wrappers (Simple wrappers for Dockview)
const TopPanel = () => <div style={{ height:"100%", background:"#464058ff", overflow:"hidden" }}><TradeSearch /></div>;
const ListPanel = () => <div style={{ height:"100%", background:"#464058ff", overflow:"hidden" }}><TradeDisplay /></div>;

const components = {
  top_panel: TopPanel,
  list_panel: ListPanel,
};

export default function TradeDashboard() {
  const onReady = (event) => {
    const api = event.api;

    // 1. Add Top Panel (Search/Login)
    api.addPanel({
      id: "p_top",
      component: "top_panel",
      title: "Connection & Search",
      size: 100, 
    });

    // 2. Add List Panel (Watchlist) BELOW the top panel
    api.addPanel({
      id: "p_list",
      component: "list_panel",
      title: "My Watchlist",
      position: { referencePanel: "p_top", direction: "below" }
    });
  };

  return (
    <WatchlistProvider>
      <div style={{ height: "100vh", width: "100vw", background: "#464058ff" }}>
        <DockviewReact 
            components={components} 
            onReady={onReady} 
            className="dockview-theme-dark" 
        />
      </div>
    </WatchlistProvider>
  );
}