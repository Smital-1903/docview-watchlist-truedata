import React, { useState, useRef } from "react";
import axios from "axios";
import { useWatchlist } from "./WatchlistContext";

export default function TradeSearch() {
  // Get functions from Context
  const { status, handleLogin, credentials } = useWatchlist();

  // Local State for inputs
  const [userInput, setUserInput] = useState("");
  const [passInput, setPassInput] = useState("");


  // Connection Handler
  const handleConnectClick = () => {
    if (credentials) {
        handleLogin(null, null); 
        setUserInput("");
        setPassInput("");
    } else {
        handleLogin(userInput, passInput); 
    }
  };
  return (
    <div style={{ padding: "10px", background:"#464058ff", height: "100%"  }}>
      {/* 1. Login Row */}

        <div style={{ display: "flex", gap: "10px", marginBottom: "15px", alignItems: "center" }}>
          <input 
            type="text" placeholder="User ID" 
            value={userInput} onChange={(e) => setUserInput(e.target.value)}
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", color:"wheat", background:"#464058ff"}}
          />
          <input 
            type="password" placeholder="Password" 
            value={passInput} onChange={(e) => setPassInput(e.target.value)}
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", color:"wheat", background:"#464058ff"}}
          />
          <button 
            onClick={handleConnectClick}
            style={{ padding: "8px 15px", background: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Connect
          </button>
           <button 
            onClick={handleConnectClick}
            style={{ padding: "8px 15px", background: "#d13216ff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", textAlign:"right"}}>
            Disconnect
          </button>
          
          <b style={{ marginLeft: "10px", color: status.includes("Connected") ? "green" : "red" }}>
            {status}
          </b>
      </div>

      {/* 2. Search Row */}
      {/* <div style={{ position: "relative", width: "100%" }}>
        <input 
            type="text" 
            value={inputText} 
            onChange={handleInputChange} 
            disabled={!credentials} 
            placeholder={credentials ? "Add Symbol (e.g. RELIANCE)" : "Connect to search..."} 
            style={{ padding: "8px", width: "100%" ,color:"wheat", background:"#464058ff"}} 
        /> */}
        
        {/* Dropdown Results */}
        {/* {showDropdown && suggestions.length > 0 && (
            <ul style={{ position: "absolute", top: "100%", left: 0, width: "100%", color:"wheat", background:"#464058ff", border: "1px solid #ccc", listStyle: "none", padding: 0, zIndex: 1000, margin: 0 }}>
                {suggestions.map((item, idx) => (
                    <li key={idx} onClick={() => selectSuggestion(item.symbol)} style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid #eee" }}>
                        <b>{item.symbol}</b> <span style={{fontSize:"11px", color:"#666"}}>{item.name}</span>
                    </li>
                ))}
            </ul>
        )}
      </div> */}
    </div>
  );
}