import React, { createContext, useContext, useState, useEffect, useRef } from "react";

// 1. Create the Context
const WatchlistContext = createContext();

// 2. The Provider Component
export function WatchlistProvider({ children }) {
  const [marketData, setMarketData] = useState({});
  const [status, setStatus] = useState("Disconnected");
  
  // Load Credentials from Local Storage
  const [credentials, setCredentials] = useState(() => {
    const saved = localStorage.getItem("td_credentials");
    try { return saved ? JSON.parse(saved) : null; } catch (e) { return null; }
  });

  const ws = useRef(null);
  const idToNameMap = useRef({}); 

  // --- WEBSOCKET LOGIC ---
  useEffect(() => {
    // If logged out, clean up
    if (!credentials) {
        if (ws.current) ws.current.close();
        setStatus("Disconnected");
        setMarketData({}); 
        return;
    }

    const dsymbolList = ["NIFTY 50", "GOLD-I", "SENSEX1_BSE"]; 

    setStatus("Connecting...");
    const { user, pass } = credentials;
    const wsUrl = `wss://push.truedata.in:8082?user=${user}&password=${pass}`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => { 
        setStatus("Connected (Ready)");
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
             ws.current.send(JSON.stringify({ method: "addsymbol", symbols: dsymbolList }));
        }
    }
    
    ws.current.onclose = () => setStatus("Disconnected");
    ws.current.onerror = () => setStatus("Connection Error");

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.message === "TrueData Real Time Data Service") {
          if (msg.success) setStatus("Connected (Ready)");
      } 
      else if (msg.symbollist) {
        msg.symbollist.forEach((item) => {
          if (!Array.isArray(item)) return;
          const symName = item[0]; const symID = item[1];   
          if (symName.includes("Invalid")) return;
          idToNameMap.current[symID] = symName;
          
          setMarketData((prev) => ({
            ...prev,
            [symName]: {
              name: item[0], id: item[1], time: item[2], ltp: item[3], ltq: item[4], atp: item[5], 
              volume: item[6], open: item[7], high: item[8], low: item[9], close: item[10], 
              color: "transparent"
            }
          }));
        });
      } 
      else if (msg.trade) {
        if (!Array.isArray(msg.trade) || msg.trade.length < 5) return;
        const trade = msg.trade;
        const rawKey = trade[0];
        const realName = idToNameMap.current[rawKey] || rawKey;

        setMarketData((prev) => {
            const oldData = prev[realName];
            const newLTP = parseFloat(trade[2]);
            const oldLTP = oldData ? parseFloat(oldData.ltp) : newLTP;
            let newColor = oldData?.color || "transparent"; 
            if (newLTP > oldLTP) newColor = "#a7f2a7"; // Green
            else if (newLTP < oldLTP) newColor = "#ff6b6b"; // Red

            return {
              ...prev,
              [realName]: {
                ...oldData, name: realName, id: rawKey,
                time: trade[1], ltp: trade[2], ltq: trade[3], atp: trade[4], volume: trade[5],
                open: trade[6], high: trade[7], low: trade[8], close: trade[9],
                color: newColor
              }
            };
        });
      }
    };

    return () => { if (ws.current) ws.current.close(); };
  }, [credentials]);

  // --- ACTIONS ---
  const handleLogin = (user, pass) => {
      if (user && pass) {
          const newCreds = { user, pass };
          localStorage.setItem("td_credentials", JSON.stringify(newCreds));
          setCredentials(newCreds);
      } else {
          localStorage.removeItem("td_credentials");
          setCredentials(null);
          setMarketData({});
      }
  };

  const handleAddSymbol = (symbol) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ method: "addsymbol", symbols: [symbol.toUpperCase()] }));
    }
  };

  const handleRemoveSymbol = (symName, symID) => {
    // 1. Send Unsubscribe to Server
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const symbolsToRemove = [];
        if (symName) symbolsToRemove.push(symName);
        if (symID) symbolsToRemove.push(symID);
        ws.current.send(JSON.stringify({ method: "removesymbol", symbols: symbolsToRemove }));
    }
    // 2. Remove from Local Table State
    setMarketData((prev) => {
        const newData = {};
        Object.keys(prev).forEach((key) => {
            const row = prev[key];
            const isMatch = (symName && row.name === symName) || (symID && row.id === symID);
            if (!isMatch) newData[key] = row;
        });
        return newData;
    });
  };

  return (
    <WatchlistContext.Provider value={{ 
        status, credentials, marketData, 
        handleLogin, handleAddSymbol, handleRemoveSymbol 
    }}>
      {children}
    </WatchlistContext.Provider>
  );
}

// 3. Helper Hook (useWatchlist)
export const useWatchlist = () => useContext(WatchlistContext);