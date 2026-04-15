import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Upload, AlertCircle, TrendingUp, Package, ShoppingBag, DollarSign, CreditCard, Wallet, Filter, Sparkles, Loader2, Bot, Receipt, Box, Table, Megaphone, Target, BarChart2, ListOrdered, MapPin, ChevronUp, ChevronDown, Zap, Navigation, ShieldAlert, PenTool, Share2, History, Clock, CloudUpload, CloudDownload, Lock } from 'lucide-react';

// --- FIREBASE INTEGRATION ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// ----------------------------------------------------------------------------------
// CẤU HÌNH FIREBASE CHO GITHUB (QUAN TRỌNG: ĐIỀN MÃ CỦA BẠN VÀO ĐÂY)
// ----------------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAhXrjCjqXz0M5vm-cs2_NozUihXam5tUI",
  authDomain: "shopee-analytics-db.firebaseapp.com",
  projectId: "shopee-analytics-db",
  storageBucket: "shopee-analytics-db.firebasestorage.app",
  messagingSenderId: "631013395938",
  appId: "1:631013395938:web:5b9ee982c6348e178dfdbb"
};


// CẤU HÌNH ĐĂNG NHẬP GOOGLE
const provider = new GoogleAuthProvider();
const ALLOWED_EMAILS = ["thoitrangvanco@gmail.com", "changkho1508@gmail.com"];

let app, auth, db, appId;
try {
  // Logic kiểm tra cấu hình: Ưu tiên envConfig từ môi trường Canvas, sau đó đến GITHUB_FIREBASE_CONFIG
  const envConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : GITHUB_FIREBASE_CONFIG;
  
  if (envConfig && envConfig.apiKey) {
      app = initializeApp(envConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      appId = typeof __app_id !== 'undefined' ? __app_id : 'shopee-analytics-standalone';
  }
} catch (e) {
  console.error("Firebase init error:", e);
}

// Chèn Font Inter trực tiếp vào App
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  * { font-family: 'Inter', sans-serif; }
  
  input::-webkit-calendar-picker-indicator {
    opacity: 100;
    cursor: pointer;
  }

  .ai-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .ai-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .ai-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 20px;
  }
`;

// --- MOCK DATA ---
const MOCK_DATA = [
  { orderId: 'O1', date: '2026-04-01', sku: 'AVC18', variant: 'Xám Đậm, 3XL', qty: 5, revenue: 573900, dealPrice: 114780, shopDiscount: 15000, shopeeDiscount: 20000, platformFee: 45000, orderStatus: 'Hoàn thành', returnStatus: '', location: 'Hà Nội' },
  { orderId: 'O2', date: '2026-04-01', sku: 'AVC18', variant: 'Đen, L', qty: 3, revenue: 344340, dealPrice: 114780, shopDiscount: 0, shopeeDiscount: 15000, platformFee: 25000, orderStatus: 'Đã hủy', returnStatus: '', location: 'Hà Nội' },
  { orderId: 'O3', date: '2026-04-01', sku: 'AVC-HN', variant: 'Xanh Navy, XL', qty: 4, revenue: 450000, dealPrice: 112500, shopDiscount: 10000, shopeeDiscount: 0, platformFee: 35000, orderStatus: 'Hoàn thành', returnStatus: '', location: 'Vĩnh Phúc' },
  { orderId: 'O4', date: '2026-04-02', sku: 'AVC18', variant: 'Xám Đậm, 3XL', qty: 2, revenue: 229560, dealPrice: 114780, shopDiscount: 5000, shopeeDiscount: 10000, platformFee: 15000, orderStatus: 'Hoàn thành', returnStatus: 'Đã Chấp Thuận Yêu Cầu', location: 'TP. Hồ Chí Minh' },
  { orderId: 'O5', date: '2026-04-02', sku: 'AVC-HN', variant: 'Trắng, M', qty: 6, revenue: 670000, dealPrice: 111666, shopDiscount: 20000, shopeeDiscount: 25000, platformFee: 50000, orderStatus: 'Hoàn thành', returnStatus: '', location: 'Đà Nẵng' },
  { orderId: 'O6', date: '2026-04-03', sku: 'AVC19', variant: 'Xám Nhạt, 2XL', qty: 8, revenue: 880000, dealPrice: 110000, shopDiscount: 0, shopeeDiscount: 30000, platformFee: 65000, orderStatus: 'Hoàn thành', returnStatus: 'Hoàn tất trả hàng', location: 'Hà Nội' },
  { orderId: 'O7', date: '2026-04-04', sku: 'AVC18', variant: 'Đen, L', qty: 10, revenue: 1147800, dealPrice: 114780, shopDiscount: 35000, shopeeDiscount: 40000, platformFee: 85000, orderStatus: 'Hoàn thành', returnStatus: '', location: 'Hải Phòng' },
  { orderId: 'O8', date: '2026-04-05', sku: 'AVC19', variant: 'Xám Nhạt, 2XL', qty: 5, revenue: 550000, dealPrice: 110000, shopDiscount: 15000, shopeeDiscount: 0, platformFee: 40000, orderStatus: 'Hoàn thành', returnStatus: 'Yêu cầu chờ xử lý', location: 'TP. Hồ Chí Minh' },
  { orderId: 'O9', date: '2026-04-05', sku: 'AVC-HN', variant: 'Xanh Navy, XL', qty: 7, revenue: 780000, dealPrice: 111428, shopDiscount: 25000, shopeeDiscount: 15000, platformFee: 60000, orderStatus: 'Đã hủy', returnStatus: '', location: 'Bắc Ninh' },
];

const MOCK_COST_MAP = {
  'AVNTL': 92000, 'AVNC2': 97500, 'AVC18': 79000, 'AV3M': 75000, 'AVN1': 59000, 
  'AVGL': 99000, 'AVGL2': 87000, 'AVGT': 95000, 'AVCW': 107000, 'BL1': 29000, 
  'AATB': 57000, 'AVAT': 30000, 'AVCT': 40000, 'AVPL': 37000, 'AVPT': 55000, 
  'PLV2': 75000, '2AGN': 31000, 'RHDL': 216000, 'QDR5': 80000, 'QNK': 60000, 
  'AVBT': 73000, 'RHBT2': 80000, 'AVSC': 11500, 'AVSC2': 14000, 'AVSD': 13500, 
  'AVSD2': 14000, 'AVC-HN': 65000, 'AVC19': 85000
};

const MOCK_PRODUCT_INFO = {
  '22339740609': { sku: 'AVC18', name: 'Áo chống nắng nam 2 lớp AVANCOMAN cao cấp có lưới tản nhiệt và phối viền tay' },
  '31724': { sku: 'AVNTL', name: 'Áo chống nắng 2 lớp thun lạnh' },
  '24176171083': { sku: 'AV3M', name: 'Combo quần sịp nam thun lạnh thông hơi' }
};

const MOCK_SKU_DETAILS = {
  'AVC18': 'Áo chống nắng 2 lớp viền tay 2023',
  'AVC-HN': 'Áo chống nắng 2 lớp HN',
  'AVC19': 'Áo chống nắng 2 lớp 2024'
};

const BRAND_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16', '#14b8a6', '#6366f1'];

// --- COMPONENT PLOTLY WRAPPER ---
const PlotlyChart = ({ data, layout, config, style, onRender }) => {
  const divRef = useRef(null);
  useEffect(() => {
    if (window.Plotly && divRef.current) {
      window.Plotly.react(divRef.current, data, layout, config).then(() => {
        if(onRender) onRender();
      });
    }
  }, [data, layout, config]);
  return <div ref={divRef} style={{ width: '100%', height: '100%', ...style }} />;
};

export default function App() {
  // --- BẢO MẬT & ĐÁM MÂY STATES ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // --- APP STATES ---
  const [data, setData] = useState(MOCK_DATA);
  const [costMap, setCostMap] = useState(MOCK_COST_MAP);
  const [productInfoMap, setProductInfoMap] = useState(MOCK_PRODUCT_INFO); 
  const [skuDetailsMap, setSkuDetailsMap] = useState(MOCK_SKU_DETAILS); 
  
  const [adSpend, setAdSpend] = useState(0);
  const [adList, setAdList] = useState([]);
  
  const [selectedSKU, setSelectedSKU] = useState('AVC18');
  const [excludeCancelled, setExcludeCancelled] = useState(false); 
  const [selectedReturnStatus, setSelectedReturnStatus] = useState('Tất cả');
  
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [isProcessingCost, setIsProcessingCost] = useState(false);
  const [isProcessingAd, setIsProcessingAd] = useState(false);
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // AI States
  const [aiInsights, setAiInsights] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState('');
  const [activeAiTab, setActiveAiTab] = useState('overview'); 
  const [aiHistory, setAiHistory] = useState([]);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);

  // SKU Row AI States
  const [skuAiData, setSkuAiData] = useState({});
  const [expandedSku, setExpandedSku] = useState(null);
  const [activeSkuTab, setActiveSkuTab] = useState('finance'); 
  
  const [locationAi, setLocationAi] = useState({ loading: false, text: '', error: '' });
  const [variantAi, setVariantAi] = useState({ loading: false, text: '', error: '' }); 

  const [isLibsLoaded, setIsLibsLoaded] = useState(false);
  
  const [tableSort, setTableSort] = useState({ key: 'revenue', direction: 'desc' });
  const [adTableSort, setAdTableSort] = useState({ key: 'cost', direction: 'desc' });

  // --- FIREBASE INITIALIZATION ---
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email && ALLOWED_EMAILS.includes(user.email)) {
        setAuthUser(user);
        setIsAuthenticated(true);
      } else {
        setAuthUser(null);
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Tải các CDN cần thiết
  useEffect(() => {
    let mounted = true;
    const loadLibs = async () => {
      const loadScript = (src, globalVar) => {
        return new Promise((resolve) => {
          if (window[globalVar]) { resolve(); return; }
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.onload = resolve;
          document.body.appendChild(script);
        });
      };
      await Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', 'XLSX'),
        loadScript('https://cdn.plot.ly/plotly-2.32.0.min.js', 'Plotly')
      ]);
      if (mounted) setIsLibsLoaded(true);
    };
    loadLibs();
    return () => { mounted = false; };
  }, []);

  // --- CHỨC NĂNG ĐĂNG NHẬP GOOGLE ---
  const handleGoogleLogin = async () => {
    if (!auth) {
      setLoginError("Lỗi: Firebase chưa được khởi tạo. Hãy kiểm tra biến GITHUB_FIREBASE_CONFIG ở dòng 14.");
      return;
    }

    try {
      setLoginError("");
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;
      
      if (ALLOWED_EMAILS.includes(userEmail)) {
        setAuthUser(result.user);
        setIsAuthenticated(true);
      } else {
        await signOut(auth);
        setLoginError(`Email ${userEmail} không có quyền truy cập hệ thống!`);
      }
    } catch (error) {
      setLoginError("Lỗi đăng nhập: " + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setAuthUser(null);
    setIsAuthenticated(false);
  };

  // --- CLOUD SYNC ---
  const handleSaveCloud = async () => {
    if (!db || !authUser) {
        setError('Chưa kết nối được Firebase hoặc chưa đăng nhập.');
        return;
    }
    setIsSyncing(true); setError(''); setSuccessMsg('');
    try {
        const docRef = doc(db, "users", authUser.email, "shopee_data", "analytics");
        await setDoc(docRef, {
            data: JSON.stringify(data),
            costMap: JSON.stringify(costMap),
            productInfoMap: JSON.stringify(productInfoMap),
            skuDetailsMap: JSON.stringify(skuDetailsMap),
            adSpend,
            adList: JSON.stringify(adList),
            aiHistory: JSON.stringify(aiHistory),
            updatedAt: new Date().toISOString(),
            userEmail: authUser.email
        });
        setSuccessMsg('Đã đồng bộ toàn bộ dữ liệu & lịch sử lên Đám mây thành công!');
    } catch (err) {
        setError('Lỗi lưu mây: ' + err.message);
    }
    setIsSyncing(false);
  };

  const handleLoadCloud = async () => {
    if (!db || !authUser) {
        setError('Chưa kết nối được Firebase hoặc chưa đăng nhập.');
        return;
    }
    setIsSyncing(true); setError(''); setSuccessMsg('');
    try {
        const docRef = doc(db, "users", authUser.email, "shopee_data", "analytics");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            const cData = snap.data();
            if(cData.data) setData(JSON.parse(cData.data));
            if(cData.costMap) setCostMap(JSON.parse(cData.costMap));
            if(cData.productInfoMap) setProductInfoMap(JSON.parse(cData.productInfoMap));
            if(cData.skuDetailsMap) setSkuDetailsMap(JSON.parse(cData.skuDetailsMap));
            if(cData.adSpend !== undefined) setAdSpend(cData.adSpend);
            if(cData.adList) setAdList(JSON.parse(cData.adList));
            if(cData.aiHistory) setAiHistory(JSON.parse(cData.aiHistory));
            setSuccessMsg(`Đã tải dữ liệu từ Đám mây! Bản lưu cuối: ${new Date(cData.updatedAt).toLocaleString('vi-VN')}`);
        } else {
            setError('Không tìm thấy bản lưu nào trên Đám mây cho tài khoản này.');
        }
    } catch (err) {
        setError('Lỗi tải mây: ' + err.message);
    }
    setIsSyncing(false);
  };

  // --- HÀM FORMAT ---
  const formatVND = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(value || 0);
  const formatSmartVND = (value) => {
    if (!value || isNaN(value)) return '0 ₫';
    const absVal = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    if (absVal >= 1e9) return `${sign}${(absVal / 1e9).toFixed(2).replace(/\.00$/, '')} tỷ ₫`;
    if (absVal >= 1e6) return `${sign}${(absVal / 1e6).toFixed(2).replace(/\.00$/, '')} tr ₫`;
    if (absVal >= 1e3) return `${sign}${(absVal / 1e3).toFixed(0)}k ₫`;
    return `${sign}${absVal.toLocaleString('vi-VN')} ₫`;
  };
  const parseNumSafe = (str) => {
    if (!str || str === '-') return 0;
    const val = parseFloat(str.toString().replace(/,/g, ''));
    return isNaN(val) ? 0 : val;
  };

  // --- BỘ PHÂN TÍCH CSV ---
  const parseCSVText = (text) => {
    const result = [];
    let row = []; let current = ''; let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') { current += '"'; i++; } else { inQuotes = !inQuotes; }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim()); current = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && text[i + 1] === '\n') i++; 
        row.push(current.trim()); if (row.length > 1 || row[0] !== '') result.push(row);
        row = []; current = '';
      } else { current += char; }
    }
    if (current || row.length > 0) { row.push(current.trim()); if (row.length > 1 || row[0] !== '') result.push(row); }
    return result;
  };

  const readFile = (file, callback, setProcessingState) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let text = '';
        if (file.name.toLowerCase().match(/\.(xlsx|xls)$/)) {
          if (!window.XLSX) throw new Error('Thư viện Excel đang tải, vui lòng thử lại.');
          const dataBuffer = new Uint8Array(e.target.result);
          const workbook = window.XLSX.read(dataBuffer, { type: 'array' });
          text = window.XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
        } else { text = e.target.result; }
        callback(text);
      } catch (err) { setError('Lỗi định dạng file: ' + err.message); if(setProcessingState) setProcessingState(false); }
    };
    if (file.name.toLowerCase().match(/\.(xlsx|xls)$/)) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  };

  const addToHistory = (title, text, type = 'general') => {
    setAiHistory(prev => [{
      id: Date.now(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
      title,
      text,
      type
    }, ...prev]);
  };

  const handleOrderFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsProcessingOrder(true); setError(''); setSuccessMsg('');
    readFile(file, (text) => {
      try {
        const parsedRows = parseCSVText(text);
        if (parsedRows.length < 2) throw new Error('Dữ liệu trống.');
        const headers = parsedRows[0].map(h => h.replace(/^\uFEFF/, '').trim().toLowerCase());
        
        const orderIdIdx = headers.findIndex(h => h.includes('mã đơn hàng'));
        const dateIdx = headers.findIndex(h => h.includes('ngày đặt hàng'));
        const skuIdx = headers.findIndex(h => h.includes('sku sản phẩm'));
        const variantIdx = headers.findIndex(h => h.includes('tên phân loại hàng'));
        const qtyIdx = headers.findIndex(h => h.includes('số lượng') && !h.includes('hoàn trả'));
        const revenueIdx = headers.findIndex(h => h.includes('tổng số tiền người mua thanh toán'));
        const dealPriceIdx = headers.findIndex(h => h === 'giá ưu đãi' || h.includes('giá ưu đãi')); 
        const shopDiscountIdx = headers.findIndex(h => h === 'mã giảm giá của shop' || h.includes('mã giảm giá của shop'));
        const shopeeDiscountIdx = headers.findIndex(h => h === 'mã giảm giá của shopee' || h.includes('mã giảm giá của shopee'));
        const orderStatusIdx = headers.findIndex(h => h.includes('trạng thái đơn hàng'));
        const returnStatusIdx = headers.findIndex(h => h.includes('trạng thái trả hàng/hoàn tiền'));
        const fixedFeeIdx = headers.findIndex(h => h.includes('phí cố định'));
        const serviceFeeIdx = headers.findIndex(h => h.includes('phí dịch vụ'));
        const paymentFeeIdx = headers.findIndex(h => h.includes('phí thanh toán'));
        const addressIdx = headers.findIndex(h => h === 'địa chỉ nhận hàng' || h.includes('địa chỉ'));

        if (dateIdx === -1 || skuIdx === -1 || revenueIdx === -1) throw new Error(`Thiếu cột. Hiện có: ${headers.slice(0,3).join(', ')}`);

        const result = [];
        for (let i = 1; i < parsedRows.length; i++) {
          const row = parsedRows[i];
          if (row.length < Math.max(dateIdx, skuIdx, qtyIdx, revenueIdx)) continue;
          
          let variantText = row[variantIdx] || '';
          if (variantText.includes(' - ')) variantText = variantText.split(' - ').slice(1).join(' - ');
          if (variantText.includes(':')) variantText = variantText.split(':')[0];
          variantText = variantText.replace(/\s*\([^)]*\)/g, '').trim();
          
          let location = 'Khác';
          if (addressIdx > -1 && row[addressIdx]) {
            const parts = row[addressIdx].split(',');
            let lastPart = parts[parts.length - 1].trim();
            lastPart = lastPart.replace(/\*/g, '').trim(); 
            if (lastPart) location = lastPart;
          }
          
          const qty = parseFloat(row[qtyIdx] || 0);
          const revenue = parseFloat(row[revenueIdx] || 0);
          const dealPrice = dealPriceIdx > -1 ? parseNumSafe(row[dealPriceIdx]) : (qty > 0 ? revenue / qty : 0);

          const fixedFee = fixedFeeIdx > -1 ? parseFloat(row[fixedFeeIdx] || 0) : 0;
          const serviceFee = serviceFeeIdx > -1 ? parseFloat(row[serviceFeeIdx] || 0) : 0;
          const paymentFee = paymentFeeIdx > -1 ? parseFloat(row[paymentFeeIdx] || 0) : 0;
          const platformFee = Math.abs(isNaN(fixedFee) ? 0 : fixedFee) + Math.abs(isNaN(serviceFee) ? 0 : serviceFee) + Math.abs(isNaN(paymentFee) ? 0 : paymentFee);

          const shopDiscount = shopDiscountIdx > -1 ? Math.abs(parseNumSafe(row[shopDiscountIdx])) : 0;
          const shopeeDiscount = shopeeDiscountIdx > -1 ? Math.abs(parseNumSafe(row[shopeeDiscountIdx])) : 0;

          if (qty > 0 && !isNaN(revenue)) {
            result.push({ 
              orderId: orderIdIdx > -1 ? row[orderIdIdx] : `UNK-${i}`, 
              date: (row[dateIdx] || '').split(' ')[0], 
              sku: row[skuIdx] || 'No-SKU', 
              variant: variantText || 'Mặc định', 
              qty, revenue, dealPrice, platformFee,
              shopDiscount, shopeeDiscount, location,
              orderStatus: orderStatusIdx > -1 ? row[orderStatusIdx] : '', 
              returnStatus: returnStatusIdx > -1 ? row[returnStatusIdx] : ''
            });
          }
        }
        if (result.length > 0) {
          setData(result);
          setSelectedSKU([...new Set(result.map(r=>r.sku))][0] || '');
          setSuccessMsg(`Đã tải thành công ${result.length} đơn hàng!`);
        } else throw new Error('Không tìm thấy dữ liệu.');
      } catch (err) { setError('Lỗi Đơn hàng: ' + err.message); } 
      finally { setIsProcessingOrder(false); }
    }, setIsProcessingOrder);
    event.target.value = '';
  };

  const handleCostFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsProcessingCost(true); setError(''); setSuccessMsg('');
    readFile(file, (text) => {
      try {
        const parsedRows = parseCSVText(text);
        const headers = parsedRows[0].map(h => h.replace(/^\uFEFF/, '').trim().toLowerCase());
        const skuIdx = headers.findIndex(h => h.includes('sku'));
        const costIdx = headers.findIndex(h => h.includes('giá vốn'));
        const prodNameIdx = headers.findIndex(h => h.includes('tên sản phẩm'));
        const productIdIdx = headers.findIndex(h => h === 'mã sản phẩm');

        if (skuIdx === -1 || costIdx === -1) throw new Error("Không tìm thấy cột 'SKU' hoặc 'Giá Vốn'.");

        const newCostMap = { ...costMap };
        const newProductInfoMap = { ...productInfoMap };
        const newSkuDetailsMap = { ...skuDetailsMap }; 
        let count = 0;
        
        for (let i = 1; i < parsedRows.length; i++) {
          const row = parsedRows[i];
          const sku = row[skuIdx]?.trim();
          const costVal = parseInt((row[costIdx] || '0').replace(/[^\d]/g, ''), 10);
          const prodId = productIdIdx > -1 ? row[productIdIdx]?.trim() : null;
          const prodName = prodNameIdx > -1 ? row[prodNameIdx]?.trim() : null;

          if (sku && !isNaN(costVal)) { newCostMap[sku] = costVal; count++; }
          if (prodId && sku) newProductInfoMap[prodId] = { sku, name: prodName || '' };
          if (sku && prodName) newSkuDetailsMap[sku] = prodName;
        }
        
        setCostMap(newCostMap); setProductInfoMap(newProductInfoMap); setSkuDetailsMap(newSkuDetailsMap);
        setSuccessMsg(`Đã cập nhật dữ liệu cho ${count} SKU!`);
      } catch (err) { setError('Lỗi Giá Vốn: ' + err.message); } 
      finally { setIsProcessingCost(false); }
    }, setIsProcessingCost);
    event.target.value = '';
  };

  const handleAdFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsProcessingAd(true); setError(''); setSuccessMsg('');
    readFile(file, (text) => {
      try {
        const parsedRows = parseCSVText(text);
        let headerIdx = parsedRows.findIndex(r => r.some(c => c.toLowerCase().trim().includes('chi phí')));
        if (headerIdx === -1) throw new Error('Không tìm thấy tiêu đề chuẩn trong file Quảng cáo.');

        const headers = parsedRows[headerIdx].map(h => h.replace(/^\uFEFF/, '').trim().toLowerCase());
        const costColIdx = headers.findIndex(h => h === 'chi phí' || h === 'cost');
        const rawNameIdx = headers.findIndex(h => h.includes('tên dịch vụ hiển thị') || h.includes('tên sản phẩm'));
        const revColIdx = headers.findIndex(h => h === 'doanh số' || h === 'doanh thu');
        const productIdIdx = headers.findIndex(h => h === 'mã sản phẩm'); 

        if (costColIdx === -1) throw new Error('Không tìm thấy cột "Chi phí".');

        let totalAds = 0; const campaigns = [];
        for (let i = headerIdx + 1; i < parsedRows.length; i++) {
          const row = parsedRows[i];
          if (row.length <= costColIdx) continue;
          let costVal = parseNumSafe(row[costColIdx]);
          if (costVal > 0) {
            totalAds += costVal;
            campaigns.push({ 
              rawName: rawNameIdx > -1 ? row[rawNameIdx] : `CĐ ${i}`, 
              productId: productIdIdx > -1 ? row[productIdIdx]?.trim() : null, 
              cost: costVal, revenue: parseNumSafe(row[revColIdx]) 
            });
          }
        }
        setAdList(campaigns); setAdSpend(totalAds);
        setSuccessMsg(`Đã phân tích ${campaigns.length} chiến dịch Quảng cáo!`);
      } catch (err) { setError('Lỗi Quảng Cáo: ' + err.message); } 
      finally { setIsProcessingAd(false); }
    }, setIsProcessingAd);
    event.target.value = '';
  };

  // --- LỌC DỮ LIỆU & KPI ---
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (excludeCancelled && item.orderStatus?.toLowerCase() === 'đã hủy') return false;
      if (selectedReturnStatus !== 'Tất cả' && item.returnStatus !== selectedReturnStatus) {
        if (selectedReturnStatus !== 'Bình thường (Không hoàn trả)' || item.returnStatus !== '') return false;
      }
      return true;
    });
  }, [data, excludeCancelled, selectedReturnStatus]);

  const kpis = useMemo(() => {
    let rev = 0, qty = 0, platformFee = 0, cogs = 0, shopDiscount = 0; const orders = new Set();
    filteredData.forEach(d => { 
      rev += d.revenue; qty += d.qty; platformFee += d.platformFee;
      shopDiscount += (d.shopDiscount || 0); 
      cogs += (d.qty * (costMap[d.sku] || 0));
      orders.add(d.orderId); 
    });
    const totalCost = platformFee + cogs + adSpend + shopDiscount;
    return { 
      totalRev: rev, totalPlatformFee: platformFee, totalCogs: cogs, totalShopDiscount: shopDiscount,             
      totalCost, totalProfit: rev - totalCost, totalQty: qty, totalOrders: orders.size
    };
  }, [filteredData, costMap, adSpend]);

  const uniqueSKUs = useMemo(() => [...new Set(data.map(d => d.sku))], [data]);
  const uniqueReturnStatuses = useMemo(() => [...new Set(data.map(d => d.returnStatus).filter(s => s && s.trim() !== ''))], [data]);

  const skuRevenueTableData = useMemo(() => {
    const map = {};
    filteredData.forEach(d => {
      if (!map[d.sku]) map[d.sku] = { sku: d.sku, name: skuDetailsMap[d.sku] || 'N/A', revenue: 0, platformFee: 0, cogs: 0, adSpend: 0, profit: 0, qty: 0, shopDiscount: 0 };
      map[d.sku].revenue += d.revenue; map[d.sku].platformFee += d.platformFee;
      map[d.sku].cogs += (d.qty * (costMap[d.sku] || 0)); map[d.sku].qty += d.qty;
      map[d.sku].shopDiscount += (d.shopDiscount || 0);
    });
    // Phân bổ chi phí Ads (đơn giản hóa)
    return Object.values(map).map(row => {
      row.profit = row.revenue - (row.cogs + row.platformFee + row.adSpend + row.shopDiscount);
      return row;
    }).sort((a, b) => b.revenue - a.revenue);
  }, [filteredData, skuDetailsMap, costMap]);

  // --- BIỂU ĐỒ ---
  const financeChartData = useMemo(() => {
    const items = [
      { name: 'Lợi nhuận', value: kpis.totalProfit > 0 ? kpis.totalProfit : 0, color: '#10b981' },
      { name: 'Giá vốn', value: kpis.totalCogs, color: '#f59e0b' },
      { name: 'Phí sàn', value: kpis.totalPlatformFee, color: '#ef4444' },
      { name: 'Marketing', value: adSpend, color: '#8b5cf6' }
    ].filter(i => i.value > 0);
    return {
      data: [{ type: 'pie', labels: items.map(i => i.name), values: items.map(i => i.value), marker: { colors: items.map(i => i.color) }, hole: 0.6 }],
      layout: { paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', margin: { t: 20, b: 20, l: 20, r: 20 }, showlegend: true, legend: { orientation: 'h', y: -0.1 } }
    };
  }, [kpis, adSpend]);

  if (!isLibsLoaded) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-sans"><Loader2 className="animate-spin mr-2" /> Đang khởi động hệ thống...</div>;

  // --- MÀN HÌNH ĐĂNG NHẬP ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <style dangerouslySetInnerHTML={{ __html: fontStyles }} />
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><Lock size={32} /></div>
          <h1 className="text-2xl font-black text-slate-800 mb-2">Shopee Analytics</h1>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">Hệ thống phân tích cấp cao dành cho Email nội bộ được ủy quyền.</p>
          <button onClick={handleGoogleLogin} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all">
            <svg className="w-6 h-6 bg-white rounded-full p-1" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Đăng nhập bằng Google
          </button>
          {loginError && <div className="mt-6 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">{loginError}</div>}
        </div>
      </div>
    );
  }

  // --- UI CHÍNH ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <style dangerouslySetInnerHTML={{ __html: fontStyles }} />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3"><BarChart2 className="text-blue-600" size={32} /> Shopee Analytics</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Sử dụng: <span className="text-indigo-600 font-bold">{authUser?.email}</span></p>
        </div>
        
        <div className="flex flex-wrap gap-2">
            <div className="relative group">
              <input type="file" accept=".csv, .xlsx, .xls" onChange={handleOrderFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
              <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl shadow-sm font-medium transition-all group-hover:scale-[1.02]">{isProcessingOrder ? '...' : 'Đơn Hàng'}</button>
            </div>
            <div className="relative group">
              <input type="file" accept=".csv, .xlsx, .xls" onChange={handleCostFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
              <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-xl shadow-sm font-semibold transition-all group-hover:scale-[1.02]">{isProcessingCost ? '...' : 'Giá Vốn'}</button>
            </div>
            <div className="relative group">
              <input type="file" accept=".csv, .xlsx, .xls" onChange={handleAdFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
              <button className="flex items-center gap-2 bg-purple-50 border border-purple-300 text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-xl shadow-sm font-bold transition-all group-hover:scale-[1.02]">{isProcessingAd ? '...' : 'Quảng Cáo'}</button>
            </div>
            <button onClick={handleSaveCloud} disabled={isSyncing} className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 px-4 py-2 rounded-xl shadow-sm font-bold disabled:opacity-50">
               {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />} Lưu Mây
            </button>
            <button onClick={handleLoadCloud} disabled={isSyncing} className="flex items-center gap-2 bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl shadow-sm font-bold disabled:opacity-50">
               {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <CloudDownload size={16} />} Tải Mây
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl shadow-sm font-bold">Thoát</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3"><AlertCircle size={20} /> <span className="font-medium text-sm">{error}</span></div>}
        {successMsg && <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-xl flex items-center gap-3"><Sparkles size={20} /> <span className="font-medium text-sm">{successMsg}</span></div>}

        {/* KPI METRICS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tổng Doanh Thu', val: formatSmartVND(kpis.totalRev), icon: <DollarSign size={20} className="text-blue-600"/>, bg: 'bg-blue-50 border-blue-100' },
            { label: 'Lợi Nhuận Ròng', val: formatSmartVND(kpis.totalProfit), icon: <Wallet size={20} className="text-emerald-600"/>, bg: 'bg-emerald-50 border-emerald-200 shadow-sm' },
            { label: 'Phí Sàn Shopee', val: formatSmartVND(kpis.totalPlatformFee), icon: <Receipt size={20} className="text-rose-600"/>, bg: 'bg-rose-50 border-rose-100' },
            { label: 'Quảng Cáo', val: formatSmartVND(adSpend), icon: <Megaphone size={20} className="text-purple-600"/>, bg: 'bg-purple-50 border-purple-100' },
          ].map((kpi, idx) => (
            <div key={idx} className={`p-5 rounded-2xl border flex flex-col gap-3 transition-all hover:shadow-md ${kpi.bg}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">{kpi.icon}</div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{kpi.label}</span>
              </div>
              <span className={`text-2xl font-black tracking-tight text-slate-800`}>{kpi.val}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Cơ cấu Tài chính</h2>
            <div className="h-[300px] w-full"><PlotlyChart data={financeChartData.data} layout={financeChartData.layout} config={{ displayModeBar: false }}/></div>
          </div>
          
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Top Sản phẩm Bán chạy nhất</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-y border-slate-100">
                    <th className="p-3 font-semibold">SKU</th>
                    <th className="p-3 font-semibold">Doanh thu</th>
                    <th className="p-3 font-semibold">Phí sàn</th>
                    <th className="p-3 font-semibold">Giá vốn</th>
                    <th className="p-3 font-semibold text-right">Lợi nhuận</th>
                  </tr>
                </thead>
                <tbody>
                  {skuRevenueTableData.slice(0, 8).map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="p-3 font-bold text-indigo-600">{row.sku}</td>
                      <td className="p-3 font-medium">{formatSmartVND(row.revenue)}</td>
                      <td className="p-3 text-rose-600 font-medium">{formatSmartVND(row.platformFee)}</td>
                      <td className="p-3 text-slate-600 font-medium">{formatSmartVND(row.cogs)}</td>
                      <td className={`p-3 text-right font-bold ${row.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatSmartVND(row.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
