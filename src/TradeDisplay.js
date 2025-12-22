import React from "react";
import { useWatchlist } from "./WatchlistContext";

export default function TradeDisplay() {
  // Get Data & Unsubscribe function from Context
  const { marketData, handleRemoveSymbol } = useWatchlist();
  const formatPrice = (price) => parseFloat(price).toFixed(2);

  return (
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
  );
}