import React, { useState } from 'react';
import './App.css';
import backgroundLogo from './imagemdefundo.webp';

const currencyLogos = {
  USD: "https://flagcdn.com/w160/us.png",
  BRL: "https://flagcdn.com/w160/br.png",
  EUR: "https://flagcdn.com/w160/eu.png",
  GBP: "https://flagcdn.com/w160/gb.png", 
  BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=024"
};

const currencies = [
  { code: 'USD', label: 'Dólar Americano', flag: '🇺🇸' },
  { code: 'BRL', label: 'Real Brasileiro', flag: '🇧🇷' },
  { code: 'EUR', label: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', label: 'Libra Esterlina', flag: '🇬🇧' },
  { code: 'BTC', label: 'Bitcoin', flag: '₿' },
];

function App() {
  const [displayAmount, setDisplayAmount] = useState("");
  const [numericAmount, setNumericAmount] = useState(0);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('BRL');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isRotating, setIsRotating] = useState(false);
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);

  const triggerVibration = (pattern = 10) => {
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(pattern);
  };

  const handleSwap = () => {
    triggerVibration(15);
    setIsRotating(true);
    setFrom(to);
    setTo(from);
    setResult(null);
    setTimeout(() => setIsRotating(false), 500);
  };

  const handleMask = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    const floatValue = parseFloat(value) / 100;
    if (!floatValue) { setDisplayAmount(""); setNumericAmount(0); return; }
    const formatted = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(floatValue);
    setDisplayAmount(formatted);
    setNumericAmount(floatValue);
  };

  const handleConvert = async () => {
    if (numericAmount <= 0) return;
    triggerVibration([30, 50, 30]);
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/convert?from=${from}&to=${to}&amount=${numericAmount}`);
      const data = await response.json();
      const formattedResult = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: to === 'BTC' ? 8 : 2,
        maximumFractionDigits: to === 'BTC' ? 8 : 2,
      }).format(Number(data.result));
      setResult(formattedResult);
      setHistory(prev => [{ text: `${displayAmount} ${from} → ${formattedResult} ${to}`, id: Date.now() }, ...prev].slice(0, 3));
    } catch (error) { alert("Erro no servidor!"); }
    setLoading(false);
  };

  const CustomSelect = ({ value, onChange, isOpen, setIsOpen, label }) => (
    <div className="select-container">
      <label className="label">{label}</label>
      <div className={`custom-select ${isOpen ? 'active' : ''}`} onClick={() => { setIsOpen(!isOpen); triggerVibration(5); }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <img src={currencyLogos[value]} alt={value} style={{width: '24px', borderRadius: '50%'}} />
          <span style={{color: '#fff', fontWeight: 'bold'}}>{value}</span>
        </div>
        <span style={{color: '#28a745', fontSize: '12px'}}>▼</span>
      </div>
      {isOpen && (
        <>
          <div className="overlay" onClick={() => setIsOpen(false)} />
          <div className="dropdown-list">
            {currencies.map((curr) => (
              <div key={curr.code} className="dropdown-item" onClick={() => { onChange(curr.code); setIsOpen(false); }}>
                <span>{curr.flag}</span> {curr.code}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="container" style={{ backgroundImage: `radial-gradient(circle at center, rgba(0,0,0,0.6), rgba(0,0,0,0.95)), url(${backgroundLogo})` }}>
      <div className="card">
        <h1 className="title">Conversor de Moedas</h1>
        
        <div className="input-wrapper">
          <span className="currency-prefix">{from === 'BTC' ? '₿' : '$'}</span>
          <input className="input-field" type="text" value={displayAmount} onChange={handleMask} placeholder="0,00" />
        </div>

        <div className="selection-row">
          <CustomSelect label="De" value={from} onChange={setFrom} isOpen={showFromList} setIsOpen={setShowFromList} />
          <button onClick={handleSwap} className={`swap-button ${isRotating ? 'rotating' : ''}`}>⇄</button>
          <CustomSelect label="Para" value={to} onChange={setTo} isOpen={showToList} setIsOpen={setShowToList} />
        </div>

        <button onClick={handleConvert} className="convert-button" disabled={loading || numericAmount === 0}>
          <span className="button-front">{loading ? "Calculando..." : "Converter Agora"}</span>
        </button>

        {result && (
          <div className="result-container fade-in">
             <h2 style={{color: '#fff', margin: 0}}>{to} {result}</h2>
          </div>
        )}
        {history.length > 0 && (
          <footer className="history-container">
          <p className="history-title">Histórico</p>
        {history.map((h) => (
          <div key={h.id} className="history-item">
          <span className="history-dot"></span> {h.text}
          </div>
        ))}
  </footer>
)}
      </div>
    </div>
  );
}

export default App;