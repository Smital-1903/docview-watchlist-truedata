import React, { useState, useRef } from "react";
import axios from "axios";
import { useWatchlist } from "./WatchlistContext";

export default function TradeDisplay() {
  // Get Data & Unsubscribe function from Context
  const { marketData, handleRemoveSymbol , status, handleAddSymbol, credentials} = useWatchlist();
  const formatPrice = (price) => parseFloat(price).toFixed(2);

  // Local State for inputs
  const [inputText, setInputText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimeout = useRef(null);

  // Search API Logic
  const fetchSuggestions = async (query) => {
    if (!query || !credentials) return;
    const { user, pass } = credentials;
    const url = `https://api.truedata.in/getAllSymbols?user=${user}&password=${pass}&segment=all&search=${query.toUpperCase()}`;

    try {
        const res = await axios.get(url);
        const allRecords = res.data.Records || [];
        const top10 = allRecords.slice(0, 10);
        const parsedData = top10.map(item => {
            if (Array.isArray(item)) {
                return { id: item[0], symbol: item[1], name: item[2] };
            } else {
                return { id: item.Symbol_ID, symbol: item.Symbol, name: item.Name || item.Description };
            }
        });
        setSuggestions(parsedData);
        setShowDropdown(true);
    } catch (err) { console.error(err); }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const selectSuggestion = (symbol) => {
      handleAddSymbol(symbol); 
      setInputText("");
      setShowDropdown(false);
  }

  return (
    <div>
      <div style={{ padding: "10px", background:"#464058ff", height: "100%"  }}>
      {/* 2. Search Row */}
      <div style={{ position: "relative", width: "100%" }}>
        <input 
            type="text" 
            value={inputText} 
            onChange={handleInputChange} 
            disabled={!credentials} 
            placeholder={credentials ? "Add Symbol (e.g. RELIANCE)" : "Connect to search..."} 
            style={{ padding: "8px", width: "100%" ,color:"wheat", background:"#464058ff"}} 
        />
        
        {/* Dropdown Results */}
        {showDropdown && suggestions.length > 0 && (
            <ul style={{ position: "absolute", top: "100%", left: 0, width: "100%", color:"wheat", background:"#464058ff", border: "1px solid #ccc", listStyle: "none", padding: 0, zIndex: 1000, margin: 0 }}>
                {suggestions.map((item, idx) => (
                    <li key={idx} onClick={() => selectSuggestion(item.symbol)} style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid #eee" }}>
                        <b>{item.symbol}</b> <span style={{fontSize:"11px", color:"#666"}}>{item.name}</span>
                    </li>
                ))}
            </ul>
        )}
      </div>
    </div>
    <div style={{ height: "100%", overflow: "auto", background:"#464058ff"}}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize:"13px", fontFamily: "Arial" }}>
          <thead style={{ background: "#0a0a0aff", color: "white", position: "sticky", top: 0 }}>
            
          </thead>
          <tbody>
            {Object.values(marketData).length === 0 ? (
              <tr><td colSpan="3" style={{textAlign:"center", padding:"20px", color:"#888"}}>Watchlist Empty</td></tr>
            ) : (
              Object.values(marketData).map((data) => {
                const prevClose = parseFloat(data.close) || parseFloat(data.open); 
                const ltp = parseFloat(data.ltp);
                const change = ltp - prevClose;
                const changePercent = ((change / prevClose) * 100).toFixed(2);
                
                const isPositive = change >= 0;
                return (
                    <tr key={data.id || data.name} style={{ borderBottom: "1px solid #eee" }}>
                      
                      {/* LEFT SIDE: Symbol Info (Wrapped in TD) */}
                      <td style={{ padding: "8px" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ color: "#b7c8f5ff", fontSize: "14px", fontWeight: "bold" }}>
                                {data.name}
                            </span>
                            <span style={{ color: "#c5c8d4ff", fontSize: "11px", marginTop: "4px" }}>
                                {data.volume || 0} Vol
                            </span>
                        </div>
                      </td>

                      {/* RIGHT SIDE: Price Info (Wrapped in TD) */}
                      <td style={{ padding: "8px", textAlign: "right" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                            <div style={{ color: isPositive ? "#0fd45eff" : "#F23645", fontSize: "15px", fontWeight: "500" }}>
                                {formatPrice(ltp)}
                            </div>
                            <div style={{ color: isPositive ? "#0fd45eff" : "#F23645", fontSize: "11px", marginTop: "4px" }}>
                                {change > 0 ? "+" : ""}{change.toFixed(2)} ({changePercent}%)
                            </div>
                        </div>
                      </td>

                      {/* UNSUBSCRIBE BUTTON */}
                      <td style={{ padding: "8px", textAlign: "center", width: "40px" }}>
                        <button 
                            onClick={() => handleRemoveSymbol(data.name, data.id)} 
                            style={{ background: "#ff4d4d", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize:"11px" }}>
                           X
                        </button>
                      </td>
                    </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
      
  );
}