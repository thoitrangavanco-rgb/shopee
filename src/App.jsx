import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Upload, AlertCircle, TrendingUp, Package, ShoppingBag, DollarSign, CreditCard, Wallet, Filter, Sparkles, Loader2, Bot, Receipt, Box, Table, Megaphone, Target, BarChart2, ListOrdered, MapPin, ChevronUp, ChevronDown, Zap, Navigation, ShieldAlert, PenTool, Share2, History, Clock, CloudUpload, CloudDownload, Lock } from 'lucide-react';

// --- FIREBASE INTEGRATION ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// ----------------------------------------------------------------------------------
// CẤU HÌNH FIREBASE CHO GITHUB (CHẠY ĐỘC LẬP)
// Nếu bạn host trên GitHub Pages, hãy thay thế object null bằng cấu hình Firebase của bạn.
// VD: { apiKey: "AIza...", authDomain: "...", projectId: "..." }
// ----------------------------------------------------------------------------------
// Cấu hình Firebase của ứng dụng web của bạn
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhXrjCjqXz0M5vm-cs2_NozUihXam5tUI",
  authDomain: "shopee-analytics-db.firebaseapp.com",
  projectId: "shopee-analytics-db",
  storageBucket: "shopee-analytics-db.firebasestorage.app",
  messagingSenderId: "631013395938",
  appId: "1:631013395938:web:3891993cc39c78378dfdbb"
};

// Khởi tạo Firebase
const app = initializeApp ( firebaseConfig );
let app, auth, db, appId;
try {
  const envConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : GITHUB_FIREBASE_CONFIG;
  const provider = new GoogleAuthProvider();
const ALLOWED_EMAILS = ["thoitrangvanco@gmail.com", "changkho1508@gmail.com"];
  if (envConfig) {
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

  /* Custom Scrollbar cho phần đọc AI */
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
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [firebaseUser, setFirebaseUser] = useState(null);
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
    const initAuth = async () => {
        try {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                await signInWithCustomToken(auth, __initial_auth_token);
            } else {
                await signInAnonymously(auth);
            }
        } catch (error) {
            console.error("Firebase Auth error", error);
        }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setFirebaseUser);
    return () => unsubscribe();
  }, []);

  // Tải các CDN cần thiết (XLSX, Plotly)
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

  useEffect(() => {
    setVariantAi({ loading: false, text: '', error: '' });
  }, [selectedSKU]);

  useEffect(() => {
    setActiveSkuTab('finance');
  }, [expandedSku]);

  // --- CHỨC NĂNG ĐĂNG NHẬP & CLOUD SYNC ---
  // Trạng thái lưu user hiện tại
  const [authUser, setAuthUser] = useState(null);
  const [loginError, setLoginError] = useState("");

  // Hàm xử lý Đăng nhập Google
  const handleGoogleLogin = async () => {
    try {
      setLoginError("");
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;
      
      // Kiểm tra xem email có nằm trong danh sách VIP không
      if (ALLOWED_EMAILS.includes(userEmail)) {
        setAuthUser(result.user); // Cho phép vào
        setIsAuthenticated(true);
      } else {
        // Nếu email lạ -> Đuổi ra ngay lập tức
        await signOut(auth);
        setLoginError(`Email ${userEmail} không có quyền truy cập hệ thống!`);
      }
    } catch (error) {
      setLoginError("Lỗi đăng nhập: " + error.message);
    }
  };

  // Hàm xử lý Đăng xuất
  const handleLogout = async () => {
    await signOut(auth);
    setAuthUser(null);
    setIsAuthenticated(false);
  };
  

  const handleSaveCloud = async () => {
    if (!db || !firebaseUser) {
        setError('Chưa kết nối được Firebase. Vui lòng kiểm tra cấu hình.');
        return;
    }
    setIsSyncing(true); setError(''); setSuccessMsg('');
    try {
      // Thay userEmail bằng authUser.email
const docRef = doc(db, "users", authUser.email, "shopee_data", "analytics");
        await setDoc(docRef, {
            data: JSON.stringify(data),
            costMap: JSON.stringify(costMap),
            productInfoMap: JSON.stringify(productInfoMap),
            skuDetailsMap: JSON.stringify(skuDetailsMap),
            adSpend,
            adList: JSON.stringify(adList),
            aiHistory: JSON.stringify(aiHistory),
            updatedAt: new Date().toISOString()
        });
        setSuccessMsg('Đã đồng bộ toàn bộ dữ liệu & lịch sử lên Đám mây thành công!');
    } catch (err) {
        setError('Lỗi lưu mây (Kích thước file có thể quá lớn): ' + err.message);
    }
    setIsSyncing(false);
  };

  const handleLoadCloud = async () => {
    if (!db || !firebaseUser) {
        setError('Chưa kết nối được Firebase.');
        return;
    }
    setIsSyncing(true); setError(''); setSuccessMsg('');
    try {
      // Thay userEmail bằng authUser.email
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
            setError('Không tìm thấy bản lưu nào trên Đám mây.');
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
          setSuccessMsg(`Đã tải thành công ${result.length} đơn hàng! Đã chuẩn hóa Màu/Size.`);
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

          if (sku && !isNaN(costVal)) { 
            newCostMap[sku] = costVal; count++; 
          }
          if (prodId && sku) {
            newProductInfoMap[prodId] = { sku, name: prodName || '' };
          }
          if (sku && prodName) {
            newSkuDetailsMap[sku] = prodName;
          }
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
        
        const rawNameIdx = headers.findIndex(h => h.includes('tên dịch vụ hiển thị') || h.includes('tên sản phẩm'));
        const costColIdx = headers.findIndex(h => h === 'chi phí' || h === 'cost');
        const revColIdx = headers.findIndex(h => h === 'doanh số' || h === 'doanh thu');
        const productIdIdx = headers.findIndex(h => h === 'mã sản phẩm'); 
        
        const viewsIdx = headers.findIndex(h => h === 'số lượt xem');
        const clicksIdx = headers.findIndex(h => h === 'số lượt click' || h === 'lượt click');
        const ctrIdx = headers.findIndex(h => h === 'tỷ lệ click');
        const convIdx = headers.findIndex(h => h === 'lượt chuyển đổi');
        const cpaIdx = headers.findIndex(h => h === 'chi phí cho mỗi lượt chuyển đổi');
        const roasIdx = headers.findIndex(h => h === 'roas');
        const acosIdx = headers.findIndex(h => h === 'acos');

        if (costColIdx === -1) throw new Error('Không tìm thấy cột "Chi phí" trong file Quảng Cáo.');

        let totalAds = 0; const campaigns = [];
        
        for (let i = headerIdx + 1; i < parsedRows.length; i++) {
          const row = parsedRows[i];
          if (row.length <= costColIdx) continue;
          
          let costVal = parseNumSafe(row[costColIdx]);
          if (costVal > 0) {
            totalAds += costVal;
            let rawName = rawNameIdx > -1 ? row[rawNameIdx] : `Chiến dịch ${i}`;
            let prodId = productIdIdx > -1 ? row[productIdIdx]?.trim() : null;
            let revVal = parseNumSafe(row[revColIdx]);
            
            campaigns.push({ 
              rawName, productId: prodId, cost: costVal, revenue: revVal,
              views: viewsIdx > -1 ? parseNumSafe(row[viewsIdx]) : 0,
              clicks: clicksIdx > -1 ? parseNumSafe(row[clicksIdx]) : 0,
              ctr: ctrIdx > -1 && row[ctrIdx] !== '-' ? row[ctrIdx] : '0%',
              conv: convIdx > -1 ? parseNumSafe(row[convIdx]) : 0,
              cpa: cpaIdx > -1 ? parseNumSafe(row[cpaIdx]) : 0,
              roas: roasIdx > -1 && row[roasIdx] !== '-' ? row[roasIdx] : '0',
              acos: acosIdx > -1 && row[acosIdx] !== '-' ? row[acosIdx] : '0%'
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

  const processedAdList = useMemo(() => {
    if (adList.length === 0) return [];
    return adList.map(ad => {
      let sku = 'N/A'; let name = ad.rawName; let displayName = ad.rawName;
      let chartLabel = ad.rawName.length > 15 ? ad.rawName.substring(0, 15) + '...' : ad.rawName;
      if (ad.productId && productInfoMap[ad.productId]) {
          const info = productInfoMap[ad.productId];
          sku = info.sku; name = info.name;
          displayName = `[${info.sku}] ${info.name}`; chartLabel = info.sku; 
      }
      return { ...ad, sku, name, displayName, chartLabel };
    });
  }, [adList, productInfoMap]);

  const handleTableSort = (key) => {
    setTableSort(prev => ({ key, direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' }));
  };

  const handleAdTableSort = (key) => {
    setAdTableSort(prev => ({ key, direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' }));
  };

  // --- BẢNG CHI TIẾT DOANH THU & LỢI NHUẬN ---
  const skuRevenueTableData = useMemo(() => {
    const map = {};
    filteredData.forEach(d => {
      if (!map[d.sku]) {
        map[d.sku] = { 
          sku: d.sku, name: skuDetailsMap[d.sku] || 'N/A (Cần tải file Giá Vốn)', 
          revenue: 0, shopDiscount: 0, shopeeDiscount: 0, platformFee: 0, cogs: 0, adSpend: 0, profit: 0, qty: 0, dealPriceTotal: 0
        };
      }
      map[d.sku].revenue += (d.revenue || 0); map[d.sku].shopDiscount += (d.shopDiscount || 0);
      map[d.sku].shopeeDiscount += (d.shopeeDiscount || 0); map[d.sku].platformFee += (d.platformFee || 0);
      map[d.sku].cogs += (d.qty * (costMap[d.sku] || 0)); map[d.sku].qty += (d.qty || 0);
      map[d.sku].dealPriceTotal += ((d.dealPrice || 0) * (d.qty || 0)); 
    });

    processedAdList.forEach(ad => {
      const targetSku = ad.sku !== 'N/A' ? ad.sku : (ad.productId ? `[ID: ${ad.productId}]` : 'Chưa phân bổ');
      if (!map[targetSku]) {
        map[targetSku] = { sku: targetSku, name: ad.name || ad.rawName || 'N/A', revenue: 0, shopDiscount: 0, shopeeDiscount: 0, platformFee: 0, cogs: 0, adSpend: 0, profit: 0, qty: 0, dealPriceTotal: 0 };
      }
      map[targetSku].adSpend += (ad.cost || 0);
    });

    return Object.values(map).filter(row => row.revenue > 0).map(row => {
        row.profit = row.revenue - (row.cogs + row.platformFee + row.adSpend + row.shopDiscount);
        row.avgPrice = row.qty > 0 ? row.dealPriceTotal / row.qty : 0; 
        return row;
      }).sort((a, b) => {
        if (tableSort.direction === 'asc') return a[tableSort.key] - b[tableSort.key];
        return b[tableSort.key] - a[tableSort.key];
      });
  }, [filteredData, skuDetailsMap, costMap, processedAdList, tableSort]);

  // --- BẢNG TOP 10 PHÂN LOẠI ---
  const top10VariantsTable = useMemo(() => {
    const skuAdSpendMap = {};
    processedAdList.forEach(ad => {
      const targetSku = ad.sku !== 'N/A' ? ad.sku : (ad.productId ? `[ID: ${ad.productId}]` : 'Chưa phân bổ');
      skuAdSpendMap[targetSku] = (skuAdSpendMap[targetSku] || 0) + (ad.cost || 0);
    });
    
    const skuRevMap = {};
    filteredData.forEach(d => { skuRevMap[d.sku] = (skuRevMap[d.sku] || 0) + d.revenue; });

    const varMap = {};
    filteredData.forEach(d => {
      const key = `${d.sku}_${d.variant}`;
      if(!varMap[key]) {
        varMap[key] = { sku: d.sku, variant: d.variant, name: skuDetailsMap[d.sku] || '', qty: 0, revenue: 0, cogs: 0, platformFee: 0, shopDiscount: 0 };
      }
      varMap[key].qty += d.qty;
      varMap[key].revenue += d.revenue;
      varMap[key].cogs += d.qty * (costMap[d.sku] || 0);
      varMap[key].platformFee += d.platformFee;
      varMap[key].shopDiscount += d.shopDiscount || 0;
    });

    return Object.values(varMap).map(v => {
      const skuRev = skuRevMap[v.sku] || 0;
      const skuAd = skuAdSpendMap[v.sku] || 0;
      const allocatedAdSpend = skuRev > 0 ? (v.revenue / skuRev) * skuAd : 0;
      v.profit = v.revenue - v.cogs - v.platformFee - v.shopDiscount - allocatedAdSpend;
      return v;
    }).sort((a, b) => b.qty - a.qty).slice(0, 10);
  }, [filteredData, skuDetailsMap, costMap, processedAdList]);

  const sortedAdTableList = useMemo(() => {
    return [...processedAdList].sort((a, b) => {
      let valA = a[adTableSort.key]; let valB = b[adTableSort.key];
      if (typeof valA === 'string' && !['sku', 'name'].includes(adTableSort.key)) { valA = parseFloat(valA.replace(/[%]/g, '').replace(/,/g, '')) || 0; }
      if (typeof valB === 'string' && !['sku', 'name'].includes(adTableSort.key)) { valB = parseFloat(valB.replace(/[%]/g, '').replace(/,/g, '')) || 0; }
      if (valA < valB) return adTableSort.direction === 'asc' ? -1 : 1;
      if (valA > valB) return adTableSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [processedAdList, adTableSort]);

  const SortIcon = ({ column, currentSort }) => {
    if (currentSort.key !== column) return <span className="inline-block ml-1 opacity-30 text-[10px]">↕</span>;
    return currentSort.direction === 'desc' ? <span className="inline-block ml-1 text-slate-800 text-[10px]">▼</span> : <span className="inline-block ml-1 text-slate-800 text-[10px]">▲</span>;
  };

  const selectedSkuStats = useMemo(() => {
    const specificData = filteredData.filter(d => d.sku === selectedSKU);
    let q = 0, r = 0;
    specificData.forEach(d => { q += d.qty; r += d.revenue; });
    return { name: skuDetailsMap[selectedSKU] || 'Chưa có thông tin tên SP', qty: q, revenue: r };
  }, [filteredData, selectedSKU, skuDetailsMap]);

  // --- DỮ LIỆU VẼ BIỂU ĐỒ PLOTLY ---
  const fontConfig = { family: 'Inter, sans-serif', size: 12, color: '#475569' };
  const baseLayout = { paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', margin: { t: 20, l: 40, r: 20, b: 40 }, font: fontConfig, showlegend: true, hovermode: 'closest', autosize: true };
  const baseConfig = { displayModeBar: false, responsive: true };

  const donutChartData = useMemo(() => {
    const revMap = {}; filteredData.forEach(d => { revMap[d.sku] = (revMap[d.sku] || 0) + d.revenue; });
    const sorted = Object.entries(revMap).sort((a, b) => b[1] - a[1]);
    let topItems = sorted.slice(0, 5);
    if (sorted.length > 5) topItems.push(['Khác', sorted.slice(5).reduce((s, i) => s + i[1], 0)]);
    const labels = topItems.map(i => i[0]); const values = topItems.map(i => i[1]); const texts = values.map(v => formatSmartVND(v)); 
    return {
      data: [{ type: 'pie', labels, values, hole: 0.5, marker: { colors: BRAND_COLORS, line: { color: '#ffffff', width: 2 } }, textinfo: 'label+percent', textposition: 'outside', customdata: texts, hovertemplate: "<b>%{label}</b><br>Doanh thu: <b style='color:#10b981'>%{customdata}</b><br>Chiếm: %{percent}<extra></extra>" }],
      layout: { ...baseLayout, margin: { t: 10, l: 10, r: 10, b: 10 }, legend: { orientation: 'h', y: -0.1 } }
    };
  }, [filteredData]);

  const locationChartData = useMemo(() => {
    const locMap = {}; const processedOrders = new Set();
    filteredData.forEach(d => {
      if (!processedOrders.has(d.orderId)) {
        const loc = d.location || 'Chưa rõ';
        locMap[loc] = (locMap[loc] || 0) + 1; 
        processedOrders.add(d.orderId);
      }
    });
    
    const sorted = Object.entries(locMap).sort((a, b) => b[1] - a[1]);
    const totalLocs = sorted.reduce((s, i) => s + i[1], 0);
    let topItems = sorted.slice(0, 8);
    let sumTop8 = topItems.reduce((s, i) => s + i[1], 0);
    if (sorted.length > 8) topItems.push(['Khác', totalLocs - sumTop8]);

    const labels = topItems.map(i => i[0]); const values = topItems.map(i => i[1]);
    return {
      data: [{ type: 'pie', labels, values, hole: 0.4, marker: { colors: BRAND_COLORS, line: { color: '#ffffff', width: 2 } }, textinfo: 'label+percent', textposition: 'outside', hovertemplate: "<b>%{label}</b><br>Số lượng: <b>%{value} đơn</b><br>Tỷ trọng: %{percent}<extra></extra>" }],
      layout: { ...baseLayout, margin: { t: 10, l: 10, r: 10, b: 10 }, legend: { orientation: 'h', y: -0.1 } }
    };
  }, [filteredData]);

  const trendChartData = useMemo(() => {
    const dateMap = {}; const allDates = new Set();
    const topSKUs = donutChartData.data[0]?.labels.filter(l => l !== 'Khác') || [];
    filteredData.forEach(d => {
      allDates.add(d.date);
      if (!dateMap[d.date]) dateMap[d.date] = {};
      const key = topSKUs.includes(d.sku) ? d.sku : 'Khác';
      dateMap[d.date][key] = (dateMap[d.date][key] || 0) + d.revenue;
    });
    const sortedDates = [...allDates].sort();
    const traces = [...topSKUs, 'Khác'].filter(sku => sortedDates.some(d => dateMap[d][sku])).map((sku, idx) => {
      const yValues = sortedDates.map(d => dateMap[d][sku] || 0);
      return { type: 'scatter', mode: 'lines+markers', name: sku, x: sortedDates, y: yValues, line: { shape: 'spline', smoothing: 1.3, width: 3, color: sku === 'Khác' ? '#cbd5e1' : BRAND_COLORS[idx % BRAND_COLORS.length] }, marker: { size: 6 }, customdata: yValues.map(v => formatSmartVND(v)), hovertemplate: "<b>%{x}</b><br>%{series.name}: <b style='color:#10b981'>%{customdata}</b><extra></extra>" };
    });
    return { data: traces, layout: { ...baseLayout, hovermode: 'x unified', xaxis: { showgrid: false, tickangle: -45, color: '#64748b' }, yaxis: { gridcolor: '#f1f5f9', zeroline: false, color: '#64748b', tickformat: '.2s' }, legend: { orientation: 'h', y: 1.1 } } };
  }, [filteredData, donutChartData]);

  const financeChartData = useMemo(() => {
    const profit = kpis.totalProfit > 0 ? kpis.totalProfit : 0; 
    const items = [
      { name: 'Lợi nhuận ròng', value: profit, color: '#10b981' },
      { name: 'Giá vốn', value: kpis.totalCogs, color: '#f59e0b' },
      { name: 'Phí sàn Shopee', value: kpis.totalPlatformFee, color: '#ef4444' },
      { name: 'Phí Quảng Cáo', value: adSpend, color: '#8b5cf6' },
      { name: 'Mã giảm Shop', value: kpis.totalShopDiscount, color: '#eab308' }
    ].filter(i => i.value > 0);
    return {
      data: [{ type: 'pie', labels: items.map(i => i.name), values: items.map(i => i.value), marker: { colors: items.map(i => i.color), line: { color: '#ffffff', width: 2 } }, hole: 0.6, textinfo: 'percent', textposition: 'inside', insidetextorientation: 'radial', customdata: items.map(i => formatSmartVND(i.value)), hovertemplate: "<b>%{label}</b><br>Số tiền: <b>%{customdata}</b><br>Tỷ trọng: %{percent}<extra></extra>" }],
      layout: { ...baseLayout, margin: { t: 0, l: 0, r: 0, b: 0 }, legend: { orientation: 'h', y: -0.1 } }
    };
  }, [kpis, adSpend]);

  const variantChartData = useMemo(() => {
    const specificData = filteredData.filter(d => d.sku === selectedSKU);
    const varMap = {}; specificData.forEach(d => { varMap[d.variant] = (varMap[d.variant] || 0) + d.qty; });
    const sorted = Object.entries(varMap).sort((a, b) => a[1] - b[1]); 
    return {
      data: [{ type: 'bar', orientation: 'h', y: sorted.map(i => i[0]), x: sorted.map(i => i[1]), marker: { color: '#3b82f6', borderRadius: 4 }, text: sorted.map(i => `${i[1]} SP`), textposition: 'auto', hovertemplate: "Phân loại: %{y}<br>Số lượng: <b>%{x}</b> SP<extra></extra>" }],
      layout: { ...baseLayout, margin: { t: 10, l: 120, r: 20, b: 40 }, xaxis: { gridcolor: '#f1f5f9' }, yaxis: { showgrid: false } }
    };
  }, [filteredData, selectedSKU]);

  const adCharts = useMemo(() => {
    if(processedAdList.length === 0) return null;
    const sortedByCost = [...processedAdList].sort((a,b) => b.cost - a.cost);
    const topAds = sortedByCost.slice(0, 5).reverse(); 
    const topAdsRevs = sortedByCost.slice(0, 10);
    const costBarData = {
      data: [{ type: 'bar', orientation: 'h', y: topAds.map(i => i.chartLabel), x: topAds.map(i => i.cost), marker: { color: topAds.map((_, i) => i === topAds.length - 1 ? '#7c3aed' : '#a78bfa') }, text: topAds.map(i => formatSmartVND(i.cost)), textposition: 'auto', customdata: topAds.map(i => i.displayName), hovertemplate: "<b>%{customdata}</b><br>Chi phí: <b>%{text}</b><extra></extra>" }],
      layout: { ...baseLayout, margin: { t: 10, l: 80, r: 20, b: 30 }, xaxis: { showgrid: true, gridcolor: '#f1f5f9' }, yaxis: { showgrid: false } }
    };
    const composedData = {
      data: [
        { type: 'bar', name: 'Doanh thu', x: topAdsRevs.map(i => i.chartLabel), y: topAdsRevs.map(i => i.revenue), marker: { color: '#10b981' }, customdata: topAdsRevs.map(i => ({ val: formatSmartVND(i.revenue), full: i.displayName })), hovertemplate: "<b>%{customdata.full}</b><br>Doanh thu: <b style='color:#10b981'>%{customdata.val}</b><extra></extra>" },
        { type: 'scatter', mode: 'lines+markers', name: 'Chi phí', x: topAdsRevs.map(i => i.chartLabel), y: topAdsRevs.map(i => i.cost), line: { color: '#ef4444', width: 3 }, marker: { size: 8 }, customdata: topAdsRevs.map(i => ({ val: formatSmartVND(i.cost), full: i.displayName })), hovertemplate: "<b>%{customdata.full}</b><br>Chi phí: <b style='color:#ef4444'>%{customdata.val}</b><extra></extra>" }
      ],
      layout: { ...baseLayout, margin: { t: 10, l: 40, r: 10, b: 60 }, hovermode: 'x unified', xaxis: { tickangle: 0 } }
    };
    return { costBarData, composedData };
  }, [processedAdList]);

  // --- CÁC HÀM GỌI GEMINI API CHO TỪNG KHU VỰC ---
  const callGeminiAPI = async (prompt) => {
    const apiKey = ""; 
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: "Bạn là chuyên gia phân tích thương mại điện tử cấp cao. Dùng tiếng Việt. Luôn trả lời trọng tâm, không dài dòng. Định dạng bảng hoặc danh sách markdown thật đẹp." }] }
    };
    let delay = 1000;
    for (let i = 0; i < 5; i++) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`HTTP Lỗi ${response.status}`);
        const result = await response.json();
        return result.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (error) {
        if (i === 4) throw error;
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; 
      }
    }
  };

  const renderTable = (rows, keyIndex, isDark = false) => {
    const cleanRows = rows.filter(r => !r.match(/^[\s|:-]+$/)); 
    if(cleanRows.length === 0) return null;
    
    const extractCells = (rowStr) => {
        const cells = rowStr.split('|');
        if(cells.length > 0 && cells[0].trim() === '') cells.shift();
        if(cells.length > 0 && cells[cells.length - 1].trim() === '') cells.pop();
        return cells.map(c => c.trim());
    };

    const headerCells = extractCells(cleanRows[0]);
    const bodyRows = cleanRows.slice(1).map(extractCells);

    return (
        <div key={`table-${keyIndex}`} className={`overflow-x-auto my-4 rounded-lg border shadow-sm ${isDark ? 'border-slate-700' : 'border-indigo-200'}`}>
            <table className="w-full text-left border-collapse text-sm">
                <thead className={isDark ? 'bg-slate-800 text-slate-200' : 'bg-indigo-50 text-indigo-900'}>
                    <tr>
                        {headerCells.map((c, i) => <th key={i} className={`p-3 border-b font-bold ${isDark ? 'border-slate-700' : 'border-indigo-100'}`}>{c}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {bodyRows.map((row, i) => (
                        <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-indigo-50/30'}`}>
                            {row.map((c, j) => <td key={j} className={`p-3 border-b font-medium ${isDark ? 'border-slate-700/50 text-slate-300' : 'border-indigo-100/50 text-slate-700'}`}>{c}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
  }

  const renderAItext = (text, isDark = false) => {
    if (!text) return null;
    const lines = text.split('\n');
    let inTable = false;
    let tableRows = [];
    const elements = [];

    lines.forEach((line, i) => {
      if (line.trim().startsWith('|')) {
        inTable = true;
        tableRows.push(line.trim());
      } else {
        if (inTable) {
          elements.push(renderTable(tableRows, i, isDark));
          inTable = false;
          tableRows = [];
        }
        if (line.startsWith('**') || line.startsWith('#')) elements.push(<strong key={i} className={`block mt-3 mb-1 font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{line.replace(/[*#]/g, '')}</strong>);
        else if (line.trim().startsWith('-') || line.trim().startsWith('*')) elements.push(<li key={i} className={`ml-4 list-disc my-0.5 ${isDark ? 'marker:text-indigo-400' : 'marker:text-indigo-500'}`}>{line.replace(/^[-*]\s*/, '')}</li>);
        else if (line.trim()) elements.push(<p key={i} className="my-1">{line}</p>);
      }
    });
    if (inTable) elements.push(renderTable(tableRows, 'end', isDark));
    return elements;
  };

  // --- AI ACTIONS ---

  const generateGlobalAI = async (tab) => {
    if (filteredData.length === 0) return setAiError('Vui lòng tải dữ liệu lên trước khi phân tích.');
    setIsAnalyzing(true); setAiError(''); setAiInsights(''); setActiveAiTab(tab);
    
    try {
      let prompt = ''; let title = '';
      if (tab === 'overview') {
        title = 'Cố vấn Tài Chính';
        const topSKUsList = [...skuRevenueTableData].slice(0, 3).map(item => item.name).join(', ');
        prompt = `Báo cáo Tài chính Shopee: Doanh Thu ${formatVND(kpis.totalRev)}, Phí Sàn ${formatVND(kpis.totalPlatformFee)}, Giá Vốn ${formatVND(kpis.totalCogs)}, Phí Ads ${formatVND(adSpend)}, Lợi Nhuận Ròng ${formatVND(kpis.totalProfit)}. Top 3 bán chạy: ${topSKUsList}. Đánh giá tỷ trọng chi phí và đưa ra 2 lời khuyên tối ưu lợi nhuận.`;
      } 
      else if (tab === 'marketing') {
        title = 'Kịch bản Sales & Khuyến mãi';
        const top3 = [...skuRevenueTableData].slice(0, 3).map(i => `${i.name} (Bán: ${i.qty})`).join(', ');
        const bottom3 = [...skuRevenueTableData].slice(-3).map(i => `${i.name} (Bán: ${i.qty})`).join(', ');
        prompt = `Top 3 bán chạy: ${top3}. Top 3 bán ế nhất: ${bottom3}. AOV: ${formatVND(kpis.totalRev / kpis.totalOrders)}. Gợi ý 2 kịch bản Combo/Khuyến mãi chéo để xả tồn và tăng AOV. Đặt tên chương trình thật hấp dẫn.`;
      }
      else if (tab === 'risks') {
        title = 'Quản trị Rủi ro (Hủy/Hoàn)';
        const totalOrders = data.length;
        const cancelled = data.filter(d => d.orderStatus?.toLowerCase() === 'đã hủy').length;
        const returns = data.filter(d => d.returnStatus && d.returnStatus !== '').length;
        prompt = `Tổng đơn hệ thống: ${totalOrders}. Số đơn Đã hủy: ${cancelled} (${((cancelled/totalOrders)*100).toFixed(1)}%). Số đơn Yêu cầu Hoàn trả: ${returns} (${((returns/totalOrders)*100).toFixed(1)}%). Đánh giá mức độ rủi ro hiện tại và đưa ra 3 quy trình chuẩn giúp shop giảm thiểu Hủy/Hoàn.`;
      }

      const text = await callGeminiAPI(prompt);
      if (text) {
        setAiInsights(text);
        addToHistory(title, text, tab);
      }
      else throw new Error("API trả về kết quả rỗng.");
    } catch (err) { setAiError('Lỗi phân tích AI: ' + err.message); } 
    finally { setIsAnalyzing(false); }
  };

  const handleAnalyzeSKU = async (row, mode = 'finance') => {
    if (expandedSku !== row.sku) { setExpandedSku(row.sku); setActiveSkuTab(mode); } 
    else if (activeSkuTab !== mode) { setActiveSkuTab(mode); } 
    else { setExpandedSku(null); return; }

    if (skuAiData[row.sku] && skuAiData[row.sku][mode] && !skuAiData[row.sku][mode].error) return;
    setSkuAiData(prev => ({ ...prev, [row.sku]: { ...prev[row.sku], [mode]: { loading: true } } }));

    let promptText = ''; let title = '';
    if (mode === 'finance') {
      title = `Phân tích Tài chính: ${row.sku}`;
      const margin = row.revenue > 0 ? ((row.profit / row.revenue) * 100).toFixed(1) : 0;
      promptText = `Phân tích tài chính cho: ${row.name} (SKU: ${row.sku}). Doanh thu: ${formatVND(row.revenue)}, Giá vốn: ${formatVND(row.cogs)}, Phí sàn: ${formatVND(row.platformFee)}, Phí Ads: ${formatVND(row.adSpend)}, Lợi nhuận Net: ${formatVND(row.profit)} (Biên LN: ${margin}%). Nhận xét 1 câu sức khỏe sinh lời và 1 đề xuất tối ưu.`;
    } else if (mode === 'seo') {
      title = `Tối ưu SEO: ${row.sku}`;
      promptText = `Đóng vai trò Chuyên gia SEO Shopee. Tôi đang bán sản phẩm: "${row.name}". Hãy viết: 1. Đề xuất 3 Tiêu đề chuẩn SEO (giật tít, chứa từ khóa tìm kiếm, dưới 120 ký tự). 2. Viết 4 điểm nhấn tính năng (Bullet points) thôi miên khách hàng cho phần Mô tả. 3. 10 Hashtag xu hướng hiệu quả.`;
    } else if (mode === 'social') {
      title = `Content MXH: ${row.sku}`;
      promptText = `Đóng vai trò Content Creator. Sản phẩm: "${row.name}". Hãy viết 1 bài đăng Facebook/TikTok thật thu hút, hài hước (dùng nhiều Emoji 🚀🔥😍) để chốt sale sản phẩm này. Cấu trúc: Tiêu đề tò mò -> Nỗi đau khách hàng -> Giải pháp từ sản phẩm -> Lời kêu gọi hành động (Call to action) kèm mã freeship.`;
    }

    try {
      const text = await callGeminiAPI(promptText);
      setSkuAiData(prev => ({ ...prev, [row.sku]: { ...prev[row.sku], [mode]: { loading: false, text, error: null } } }));
      addToHistory(title, text, 'sku');
    } catch (error) { setSkuAiData(prev => ({ ...prev, [row.sku]: { ...prev[row.sku], [mode]: { loading: false, error: error.message } } })); }
  };

  const handleAnalyzeLocation = async () => {
    setLocationAi({ loading: true, text: '', error: '' });
    const locMap = {}; filteredData.forEach(d => { locMap[d.location] = (locMap[d.location] || 0) + 1; });
    const topLocs = Object.entries(locMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(l => `${l[0]} (${l[1]} đơn)`).join(', ');
    const promptText = `Top 5 Tỉnh/Thành mua nhiều nhất: ${topLocs}. Phân tích tệp khách địa lý và đề xuất 2 cách cấu hình Shopee Ads/Freeship Xtra tối ưu khu vực.`;
    try {
      const text = await callGeminiAPI(promptText);
      setLocationAi({ loading: false, text, error: '' });
      addToHistory('Phân tích Vị trí Địa lý', text, 'location');
    } catch (error) { setLocationAi({ loading: false, text: '', error: error.message }); }
  };

  const handleAnalyzeVariants = async () => {
    setVariantAi({ loading: true, text: '', error: '' });
    const specificData = filteredData.filter(d => d.sku === selectedSKU);
    const varMap = {}; specificData.forEach(d => { varMap[d.variant] = (varMap[d.variant] || 0) + d.qty; });
    const variantsStr = Object.entries(varMap).map(([k, v]) => `${k}: ${v} cái`).join(', ');
    const promptText = `SKU "${selectedSKU}" đã bán: ${variantsStr}. Dựa vào dữ liệu trên, hãy tạo 1 BẢNG PIVOT MARKDOWN (hàng là Màu, cột là Size, ô giao nhau là số lượng cần nhập gấp 2 lần số đã bán). Nhớ render đúng định dạng Markdown Table. Kèm 1 câu giải thích ngắn.`;
    try {
      const text = await callGeminiAPI(promptText);
      setVariantAi({ loading: false, text, error: '' });
      addToHistory(`Kế hoạch Nhập hàng: ${selectedSKU}`, text, 'variant');
    } catch (error) { setVariantAi({ loading: false, text: '', error: error.message }); }
  };

  if (!isLibsLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans text-slate-500"><Loader2 className="animate-spin mr-2" /> Đang tải công cụ trực quan hóa dữ liệu...</div>;
  }

  // --- CỔNG ĐĂNG NHẬP ---
  if (!isAuthenticated) {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center z-50 p-4 font-sans">
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full flex flex-col items-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Lock size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Đăng Nhập Hệ Thống</h2>
                <p className="text-sm text-slate-500 mb-6 text-center leading-relaxed">Hệ thống phân tích Shopee Analytics nội bộ được mã hóa. Vui lòng nhập mật khẩu truy cập.</p>
                <input 
                    type="password" 
                    value={if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Shopee Analytics</h1>
          <p className="text-gray-500 mb-6">Đăng nhập bằng tài khoản nội bộ để tiếp tục</p>
          
          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Đăng nhập bằng Google
          </button>

          {loginError && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {loginError}
            </div>
          )}
        </div>
      </div>
    );
  }
} 
                    onChange={e => { setPasswordInput(e.target.value); setLoginError(''); }} 
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    className={`w-full px-4 py-3 rounded-xl border ${loginError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'} focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-center text-lg tracking-[0.5em] mb-2 font-bold text-slate-800`}
                    placeholder="••••••"
                />
                {loginError && <p className="text-red-500 text-xs font-bold mb-4 animate-in slide-in-from-top-1">{loginError}</p>}
                <button 
                    onClick={handleLogin}
                    className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all ${loginError ? 'mt-0' : 'mt-4'}`}
                >
                    Truy Cập Dashboard
                </button>
            </div>
        </div>
    );
  }

  // --- UI RENDER CHÍNH ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      <style dangerouslySetInnerHTML={{ __html: fontStyles }} />

      {/* HEADER ZONE VỚI CLOUD SYNC */}
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <BarChart2 className="text-blue-600" size={32} /> Shopee Analytics
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Bảng điều khiển Tài chính & AI Content thông minh</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex flex-wrap gap-2">
            <div className="relative group">
              <input type="file" accept=".csv, .xlsx, .xls" onChange={handleOrderFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
              <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-sm font-medium transition-all group-hover:scale-[1.02]">
                <Upload size={16} /> {isProcessingOrder ? 'Đang đọc...' : 'Đơn Hàng'}
              </button>
            </div>
            <div className="relative group">
              <input type="file" accept=".csv, .xlsx, .xls" onChange={handleCostFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
              <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-4 py-2.5 rounded-xl shadow-sm font-semibold transition-all group-hover:scale-[1.02]">
                <Box size={16} /> {isProcessingCost ? 'Đang ghép...' : 'Giá Vốn'}
              </button>
            </div>
            <div className="relative group">
              <input type="file" accept=".csv, .xlsx, .xls" onChange={handleAdFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
              <button className="flex items-center gap-2 bg-purple-50 border border-purple-300 text-purple-700 hover:bg-purple-100 px-4 py-2.5 rounded-xl shadow-sm font-bold transition-all group-hover:scale-[1.02]">
                <Megaphone size={16} /> {isProcessingAd ? 'Đang đọc...' : 'Quảng Cáo'}
              </button>
            </div>
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-300"></div>

          {/* NÚT CLOUD SYNC */}
          <div className="flex flex-wrap gap-2">
             <button onClick={handleSaveCloud} disabled={isSyncing} className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 px-4 py-2.5 rounded-xl shadow-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50">
                {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />} Lưu Mây
             </button>
             <button onClick={handleLoadCloud} disabled={isSyncing} className="flex items-center gap-2 bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100 px-4 py-2.5 rounded-xl shadow-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50">
                {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <CloudDownload size={16} />} Tải Mây
             </button>
          </div>
        </div>
      </div>

      {/* THÔNG BÁO */}
      <div className="max-w-7xl mx-auto">
        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3"><AlertCircle size={20} /> <span className="font-medium text-sm">{error}</span></div>}
        {successMsg && !error && <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-xl flex items-center gap-3"><Sparkles size={20} /> <span className="font-medium text-sm">{successMsg}</span></div>}
      </div>

      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* GLOBAL FILTERS */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-slate-700 font-semibold">
            <div className="p-2 bg-slate-100 rounded-lg"><Filter size={18} className="text-slate-500" /></div>
            BỘ LỌC DỮ LIỆU
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <label className="text-xs text-slate-500 font-medium">Đơn Hủy:</label>
              <select value={excludeCancelled ? 'exclude' : 'all'} onChange={(e) => setExcludeCancelled(e.target.value === 'exclude')} className="bg-transparent border-none text-sm font-bold text-slate-800 outline-none cursor-pointer">
                <option value="exclude">Bỏ qua đơn Hủy</option>
                <option value="all">Tính tất cả (Theo dõi Rủi ro)</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <label className="text-xs text-slate-500 font-medium">Trạng thái Hoàn trả:</label>
              <select value={selectedReturnStatus} onChange={(e) => setSelectedReturnStatus(e.target.value)} className="bg-transparent border-none text-sm font-bold text-slate-800 outline-none max-w-[200px] truncate cursor-pointer">
                <option value="Tất cả">Tất cả trạng thái</option>
                <option value="Bình thường (Không hoàn trả)">Bình thường (Không có yêu cầu)</option>
                {uniqueReturnStatuses.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* KPI METRICS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng Doanh Thu', val: formatSmartVND(kpis.totalRev), full: formatVND(kpis.totalRev), icon: <DollarSign size={20} className="text-blue-600"/>, bg: 'bg-blue-50 border-blue-100' },
            { label: 'Phí Sàn Shopee', val: formatSmartVND(kpis.totalPlatformFee), full: formatVND(kpis.totalPlatformFee), icon: <Receipt size={20} className="text-rose-600"/>, bg: 'bg-rose-50 border-rose-100' },
            { label: 'Giá Vốn Hàng Bán', val: formatSmartVND(kpis.totalCogs), full: formatVND(kpis.totalCogs), icon: <Box size={20} className="text-amber-600"/>, bg: 'bg-amber-50 border-amber-100' },
            { label: 'Chi Phí Marketing', val: formatSmartVND(adSpend), full: formatVND(adSpend), icon: <Megaphone size={20} className="text-purple-600"/>, bg: 'bg-purple-50 border-purple-100' },
            
            { label: 'Tổng Chi Phí Thực', val: formatSmartVND(kpis.totalCost), full: formatVND(kpis.totalCost), icon: <CreditCard size={20} className="text-slate-600"/>, bg: 'bg-slate-50 border-slate-200' },
            { label: 'LỢI NHUẬN RÒNG', val: formatSmartVND(kpis.totalProfit), full: formatVND(kpis.totalProfit), icon: <Wallet size={20} className="text-emerald-600"/>, bg: 'bg-emerald-50 border-emerald-200 shadow-sm' },
            { label: 'Tổng Đơn Hàng', val: formatNumber(kpis.totalOrders) + ' Đơn', full: formatNumber(kpis.totalOrders), icon: <ShoppingBag size={20} className="text-cyan-600"/>, bg: 'bg-cyan-50 border-cyan-100' },
            { label: 'Hiệu suất (ROAS)', val: adSpend > 0 ? (kpis.totalRev / adSpend).toFixed(2) + 'x' : 'N/A', full: 'Return On Ad Spend', icon: <TrendingUp size={20} className="text-teal-600"/>, bg: 'bg-teal-50 border-teal-100' }
          ].map((kpi, idx) => (
            <div key={idx} className={`p-5 rounded-2xl border flex flex-col gap-3 transition-all hover:-translate-y-1 hover:shadow-md ${kpi.bg} relative group`} title={kpi.full}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">{kpi.icon}</div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{kpi.label}</span>
              </div>
              <span className={`text-2xl font-black tracking-tight ${idx === 5 ? 'text-emerald-700' : 'text-slate-800'}`}>
                {kpi.val}
              </span>
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-1 px-3 rounded shadow-lg pointer-events-none whitespace-nowrap z-50">
                {kpi.full}
              </div>
            </div>
          ))}
        </div>

        {/* TRUNG TÂM AI GLOBAL */}
        <div className="bg-slate-900 p-1 rounded-2xl shadow-lg border border-slate-800 relative overflow-hidden flex flex-col md:flex-row">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-purple-900/20 pointer-events-none"></div>
          
          <div className="p-5 md:w-1/3 md:border-r border-slate-700/50 relative z-10 flex flex-col gap-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><Bot size={24} /></div>
              <div>
                <h2 className="text-lg font-bold text-white">Trung tâm Phân tích AI</h2>
                <p className="text-xs text-slate-400 font-medium">Báo cáo đa chiều với Gemini API</p>
              </div>
            </div>

            <button onClick={() => generateGlobalAI('overview')} disabled={isAnalyzing} className={`flex items-center gap-3 w-full p-2.5 rounded-xl font-semibold transition-all text-left text-sm ${activeAiTab === 'overview' && !isAnalyzing && aiInsights ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'} disabled:opacity-50`}>
              <Wallet size={16} /> ✨ Cố vấn Tài Chính
            </button>

            <button onClick={() => generateGlobalAI('marketing')} disabled={isAnalyzing} className={`flex items-center gap-3 w-full p-2.5 rounded-xl font-semibold transition-all text-left text-sm ${activeAiTab === 'marketing' && !isAnalyzing && aiInsights ? 'bg-fuchsia-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'} disabled:opacity-50`}>
              <Zap size={16} /> ✨ Kịch bản Khuyến mãi
            </button>

            <button onClick={() => generateGlobalAI('risks')} disabled={isAnalyzing} className={`flex items-center gap-3 w-full p-2.5 rounded-xl font-semibold transition-all text-left text-sm ${activeAiTab === 'risks' && !isAnalyzing && aiInsights ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'} disabled:opacity-50`}>
              <ShieldAlert size={16} /> ✨ Quản trị Hủy/Hoàn
            </button>
            
            <div className="h-[1px] bg-slate-700/50 my-1"></div>

            <button onClick={() => setActiveAiTab('history')} className={`flex items-center gap-3 w-full p-2.5 rounded-xl font-semibold transition-all text-left text-sm ${activeAiTab === 'history' ? 'bg-slate-700 text-white' : 'bg-transparent text-slate-400 hover:bg-slate-800'}`}>
              <History size={16} /> Lịch sử Phân tích
            </button>
          </div>

          <div className="p-6 md:w-2/3 relative z-10 min-h-[300px] flex flex-col">
            {isAnalyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center text-indigo-300">
                <Loader2 size={36} className="animate-spin mb-3" />
                <p className="font-medium">Gemini đang nghiên cứu dữ liệu gian hàng...</p>
              </div>
            ) : activeAiTab === 'history' ? (
              <div className="flex-1 flex flex-col">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><History size={18}/> Lịch sử truy vấn AI</h3>
                {aiHistory.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">Chưa có lịch sử phân tích nào.</div>
                ) : (
                  <div className="overflow-y-auto max-h-[300px] ai-scrollbar pr-2 flex flex-col gap-3">
                    {aiHistory.map(item => (
                      <div key={item.id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => setExpandedHistoryId(expandedHistoryId === item.id ? null : item.id)}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-indigo-300 font-bold text-sm flex items-center gap-2">
                            {expandedHistoryId === item.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                            {item.title}
                          </span>
                          <span className="text-slate-500 text-[11px] flex items-center gap-1"><Clock size={12}/> {item.time}</span>
                        </div>
                        {expandedHistoryId === item.id ? (
                          <div className="text-slate-200 text-xs leading-relaxed mt-3 border-t border-slate-700/50 pt-3">
                            {renderAItext(item.text, true)}
                          </div>
                        ) : (
                          <div className="text-slate-400 text-xs leading-relaxed line-clamp-2 overflow-hidden mt-1">
                             {item.text.replace(/[*#|]/g, '')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : aiError ? (
              <div className="bg-red-900/30 text-red-300 p-4 rounded-xl border border-red-800/50 font-medium">
                {aiError}
              </div>
            ) : aiInsights ? (
              <div className="flex-1 overflow-y-auto max-h-[350px] ai-scrollbar pr-4 text-slate-200 text-sm leading-relaxed">
                {renderAItext(aiInsights, true)}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                <Bot size={48} className="mb-4" />
                <p className="font-medium text-center max-w-sm">Chọn một trong các công cụ bên trái để AI tiến hành lập chiến lược tự động.</p>
              </div>
            )}
          </div>
        </div>

        {/* HÀNG 1: CƠ CẤU VÀ DÒNG CHẢY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col relative">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Cơ cấu Tài chính</h2>
            <p className="text-xs font-medium text-slate-400 mb-4">Phân bổ dòng tiền theo Tỷ trọng</p>
            <div className="h-[320px] w-full">
               <PlotlyChart data={financeChartData.data} layout={financeChartData.layout} config={baseConfig}/>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Dòng chảy Doanh thu</h2>
            <p className="text-xs font-medium text-slate-400 mb-4">Biến động doanh thu giữa các mặt hàng theo thời gian</p>
            <div className="h-[320px] w-full">
               <PlotlyChart data={trendChartData.data} layout={trendChartData.layout} config={baseConfig}/>
            </div>
          </div>
        </div>

        {/* HÀNG 2: BẢNG DOANH THU & LỢI NHUẬN SP (STUDIO AI ROW-LEVEL) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ListOrdered size={20} /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Chi tiết Doanh thu & Lợi nhuận theo Sản phẩm</h2>
              <p className="text-xs font-medium text-slate-500">Mở rộng dòng SKU để Gemini AI viết bài SEO, Tạo content Mạng xã hội cho sản phẩm đó</p>
            </div>
          </div>
          
          {skuRevenueTableData.length > 0 ? (
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-slate-500">
                    <th className="p-3 font-semibold whitespace-nowrap">SKU</th>
                    <th className="p-3 font-semibold min-w-[200px]">Tên sản phẩm</th>
                    <th className="p-3 font-semibold text-right whitespace-nowrap text-blue-700 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleTableSort('revenue')}>
                      Doanh thu <SortIcon column="revenue" currentSort={tableSort} />
                    </th>
                    <th className="p-3 font-semibold text-right whitespace-nowrap text-teal-700 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleTableSort('avgPrice')}>
                      Giá TB <SortIcon column="avgPrice" currentSort={tableSort} />
                    </th>
                    <th className="p-3 font-semibold text-right whitespace-nowrap text-rose-700 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleTableSort('platformFee')}>
                      Phí Shopee <SortIcon column="platformFee" currentSort={tableSort} />
                    </th>
                    <th className="p-3 font-semibold text-right whitespace-nowrap text-orange-800 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleTableSort('cogs')}>
                      Giá vốn <SortIcon column="cogs" currentSort={tableSort} />
                    </th>
                    <th className="p-3 font-semibold text-right whitespace-nowrap text-purple-700 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleTableSort('adSpend')}>
                      Phí Ads <SortIcon column="adSpend" currentSort={tableSort} />
                    </th>
                    <th className="p-3 font-semibold text-right whitespace-nowrap text-emerald-700 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleTableSort('profit')}>
                      Lợi nhuận ròng <SortIcon column="profit" currentSort={tableSort} />
                    </th>
                    <th className="p-3 font-semibold text-center whitespace-nowrap text-indigo-600">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {skuRevenueTableData.map((row, idx) => (
                    <React.Fragment key={idx}>
                      <tr className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${expandedSku === row.sku ? 'bg-indigo-50/50' : ''}`}>
                        <td className="p-3 font-bold text-indigo-600">{row.sku}</td>
                        <td className="p-3 text-slate-700 font-medium truncate max-w-[200px]" title={row.name}>{row.name}</td>
                        <td className="p-3 text-right font-bold text-blue-600">{formatVND(row.revenue)}</td>
                        <td className="p-3 text-right font-bold text-teal-600">{formatVND(row.avgPrice)}</td>
                        <td className="p-3 text-right font-medium text-rose-600">{formatVND(row.platformFee)}</td>
                        <td className="p-3 text-right font-medium text-orange-700">{formatVND(row.cogs)}</td>
                        <td className="p-3 text-right font-medium text-purple-600">{formatVND(row.adSpend)}</td>
                        <td className={`p-3 text-right font-bold ${row.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatVND(row.profit)}</td>
                        <td className="p-3 text-center">
                          <button onClick={() => handleAnalyzeSKU(row, 'finance')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1 mx-auto ${expandedSku === row.sku ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100'}`}>
                            {expandedSku === row.sku ? <ChevronUp size={14}/> : <Sparkles size={14} className="text-amber-500" />} 
                            {expandedSku === row.sku ? 'Đóng' : 'Studio AI'}
                          </button>
                        </td>
                      </tr>
                      {/* AI EXPANDED ROW (STUDIO) */}
                      {expandedSku === row.sku && (
                        <tr>
                          <td colSpan="9" className="p-0 border-b border-indigo-100">
                            <div className="bg-indigo-50/80 p-5 animate-in slide-in-from-top-2 duration-300 shadow-inner flex flex-col md:flex-row gap-6">
                              <div className="flex flex-col gap-2 w-full md:w-48 border-r border-indigo-200/50 pr-4">
                                <button onClick={() => handleAnalyzeSKU(row, 'finance')} className={`text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${activeSkuTab === 'finance' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-indigo-100'}`}>
                                  <Wallet size={14}/> Tài chính
                                </button>
                                <button onClick={() => handleAnalyzeSKU(row, 'seo')} className={`text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${activeSkuTab === 'seo' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-indigo-100'}`}>
                                  <PenTool size={14}/> Tối ưu SEO
                                </button>
                                <button onClick={() => handleAnalyzeSKU(row, 'social')} className={`text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${activeSkuTab === 'social' ? 'bg-fuchsia-600 text-white shadow-sm' : 'text-slate-600 hover:bg-indigo-100'}`}>
                                  <Share2 size={14}/> Bài đăng MXH
                                </button>
                              </div>
                              <div className="flex-1">
                                {skuAiData[row.sku]?.[activeSkuTab]?.loading ? (
                                  <div className="flex items-center gap-2 text-indigo-600 font-semibold py-6"><Loader2 size={18} className="animate-spin" /> Gemini đang soạn thảo nội dung...</div>
                                ) : skuAiData[row.sku]?.[activeSkuTab]?.error ? (
                                  <div className="text-red-600 font-medium py-2">{skuAiData[row.sku][activeSkuTab].error}</div>
                                ) : (
                                  <div className="text-sm text-slate-700 leading-relaxed max-h-[300px] overflow-y-auto ai-scrollbar pr-2">
                                    {renderAItext(skuAiData[row.sku]?.[activeSkuTab]?.text)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 font-medium">Chưa có dữ liệu để hiển thị bảng.</div>
          )}
        </div>

        {/* HÀNG 3: TOP SP, VỊ TRÍ (CÓ AI), BIẾN THỂ (CÓ PIVOT AI) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Top Sản Phẩm Mũi Nhọn</h2>
            <p className="text-xs font-medium text-slate-400 mb-4">Đóng góp doanh thu theo mã SKU</p>
            <div className="h-[320px] w-full">
               <PlotlyChart data={donutChartData.data} layout={donutChartData.layout} config={baseConfig}/>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-slate-800">Vị trí Khách hàng</h2>
                  <MapPin size={18} className="text-emerald-600" />
                </div>
                <p className="text-[11px] font-medium text-slate-400">Tối đa 8 khu vực dẫn đầu</p>
              </div>
              <button onClick={handleAnalyzeLocation} disabled={locationAi.loading} className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50" title="Phân tích Vận chuyển & Phân phối với AI">
                {locationAi.loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              </button>
            </div>

            {/* Khung hiển thị AI Location */}
            {locationAi.text && !locationAi.loading && (
              <div className="absolute top-[80px] left-4 right-4 bg-emerald-50 border border-emerald-200 p-4 rounded-xl z-20 shadow-lg text-xs leading-relaxed max-h-[260px] overflow-y-auto ai-scrollbar animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center mb-2 border-b border-emerald-200 pb-2">
                  <span className="font-bold text-emerald-800 flex items-center gap-1"><Bot size={14}/> Gợi ý Phân phối Khu vực</span>
                  <button onClick={() => setLocationAi({ ...locationAi, text: '' })} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
                </div>
                {renderAItext(locationAi.text)}
              </div>
            )}
            
            <div className="h-[300px] w-full relative z-10">
               <PlotlyChart data={locationChartData.data} layout={locationChartData.layout} config={baseConfig}/>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Phân loại Hàng</h2>
                <p className="text-[11px] font-medium text-slate-400">Tiêu thụ theo Size, Màu</p>
              </div>
              <div className="flex gap-2 items-center">
                <select value={selectedSKU} onChange={(e) => setSelectedSKU(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg py-1.5 px-2 outline-none cursor-pointer max-w-[85px] truncate">
                  {uniqueSKUs.map(sku => <option key={sku} value={sku}>{sku}</option>)}
                </select>
                <button onClick={handleAnalyzeVariants} disabled={variantAi.loading} className="p-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50" title="AI lập Bảng nhập hàng (Pivot)">
                  {variantAi.loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                </button>
              </div>
            </div>

            {/* Khung hiển thị AI Variant (Bảng Pivot) */}
            {variantAi.text && !variantAi.loading && (
              <div className="absolute top-[80px] left-4 right-4 bg-white border border-blue-200 p-4 rounded-xl z-20 shadow-2xl text-xs leading-relaxed max-h-[300px] overflow-y-auto ai-scrollbar animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center mb-2 border-b border-blue-200 pb-2">
                  <span className="font-bold text-blue-800 flex items-center gap-1"><Bot size={14}/> Kế hoạch Nhập hàng: {selectedSKU}</span>
                  <button onClick={() => setVariantAi({ ...variantAi, text: '' })} className="text-blue-600 hover:text-blue-900 font-bold bg-blue-50 rounded-full p-1">✕</button>
                </div>
                {renderAItext(variantAi.text)}
              </div>
            )}

            <div className="h-[300px] w-full relative z-10">
              <PlotlyChart data={variantChartData.data} layout={variantChartData.layout} config={baseConfig}/>
            </div>
          </div>
        </div>

        {/* BẢNG TOP 10 PHÂN LOẠI */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ListOrdered size={20} /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Top 10 Phân Loại Bán Chạy Nhất</h2>
              <p className="text-xs font-medium text-slate-500">Những biến thể (Màu/Size) đang đóng góp doanh số cao nhất toàn shop</p>
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1 border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <th className="p-3 font-semibold whitespace-nowrap w-12 text-center">#</th>
                  <th className="p-3 font-semibold whitespace-nowrap">SKU</th>
                  <th className="p-3 font-semibold min-w-[200px]">Tên sản phẩm</th>
                  <th className="p-3 font-semibold whitespace-nowrap">Phân loại (Màu / Size)</th>
                  <th className="p-3 font-semibold text-right whitespace-nowrap">Số lượng đã bán</th>
                  <th className="p-3 font-semibold text-right whitespace-nowrap">Lợi nhuận ròng</th>
                </tr>
              </thead>
              <tbody>
                {top10VariantsTable.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-400 text-center">{idx + 1}</td>
                    <td className="p-3 font-bold text-indigo-600">{row.sku}</td>
                    <td className="p-3 text-slate-700 font-medium truncate max-w-[250px]" title={row.name}>{row.name}</td>
                    <td className="p-3 font-bold text-slate-700">{row.variant}</td>
                    <td className="p-3 text-right font-bold text-blue-600">{formatNumber(row.qty)}</td>
                    <td className={`p-3 text-right font-bold ${row.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatSmartVND(row.profit)}</td>
                  </tr>
                ))}
                {top10VariantsTable.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-slate-400 font-medium">Chưa có dữ liệu.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* HÀNG 4: CHUYÊN TRANG QUẢNG CÁO */}
        {processedAdList.length > 0 && (
          <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-200 mt-4 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 text-white rounded-lg shadow-sm"><Target size={20} /></div>
              <div>
                <h2 className="text-xl font-bold text-purple-900">Phân tích Hiệu Quả Quảng Cáo (Shopee Ads)</h2>
                <p className="text-sm text-purple-700 font-medium">Theo dõi tương quan Chi phí - Doanh thu theo mã SKU</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100 flex flex-col">
                <h3 className="text-base font-bold text-slate-800 mb-2">🔥 Top Chiến dịch "Đốt tiền" nhiều nhất</h3>
                <div className="h-[320px] w-full"><PlotlyChart data={adCharts.costBarData.data} layout={adCharts.costBarData.layout} config={baseConfig}/></div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100 flex flex-col">
                <h3 className="text-base font-bold text-slate-800 mb-2">📈 Tương quan Chi phí vs Doanh thu</h3>
                <div className="h-[320px] w-full"><PlotlyChart data={adCharts.composedData.data} layout={adCharts.composedData.layout} config={baseConfig}/></div>
              </div>
            </div>

            {/* BẢNG CHI TIẾT QUẢNG CÁO CÓ SORT ĐỘNG */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Megaphone size={20} /></div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Chi tiết Phễu Quảng cáo</h2>
                    <p className="text-xs font-medium text-slate-500">Mức độ hiển thị, chuyển đổi và ACOS</p>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-500">
                      <th className="p-3 font-semibold whitespace-nowrap cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleAdTableSort('sku')}>
                        SKU <SortIcon column="sku" currentSort={adTableSort} />
                      </th>
                      <th className="p-3 font-semibold min-w-[200px] cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleAdTableSort('name')}>
                        Tên sản phẩm <SortIcon column="name" currentSort={adTableSort} />
                      </th>
                      <th className="p-3 font-semibold text-right whitespace-nowrap cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleAdTableSort('views')}>
                        Lượt xem <SortIcon column="views" currentSort={adTableSort} />
                      </th>
                      <th className="p-3 font-semibold text-right whitespace-nowrap cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleAdTableSort('clicks')}>
                        Lượt click <SortIcon column="clicks" currentSort={adTableSort} />
                      </th>
                      <th className="p-3 font-semibold text-right whitespace-nowrap cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleAdTableSort('ctr')}>
                        Tỷ lệ Click <SortIcon column="ctr" currentSort={adTableSort} />
                      </th>
                      <th className="p-3 font-semibold text-right whitespace-nowrap cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleAdTableSort('conv')}>
                        Chuyển đổi <SortIcon column="conv" currentSort={adTableSort} />
                      </th>
                      <th className="p-3 font-semibold text-right whitespace-nowrap cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleAdTableSort('cpa')}>
                        CP / CĐ <SortIcon column="cpa" currentSort={adTableSort} />
                      </th>
                      <th className="p-3 font-semibold text-right whitespace-nowrap text-emerald-700 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleAdTableSort('revenue')}>
                        Doanh số <SortIcon column="revenue" currentSort={adTableSort} />
                      </th>
                      <th className="p-3 font-semibold text-right whitespace-nowrap text-rose-700 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleAdTableSort('cost')}>
                        Chi phí <SortIcon column="cost" currentSort={adTableSort} />
                      </th>
                      <th className="p-3 font-semibold text-right whitespace-nowrap text-purple-700 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleAdTableSort('roas')}>
                        ROAS <SortIcon column="roas" currentSort={adTableSort} />
                      </th>
                      <th className="p-3 font-semibold text-right whitespace-nowrap cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleAdTableSort('acos')}>
                        ACOS <SortIcon column="acos" currentSort={adTableSort} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAdTableList.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-indigo-600">{row.sku}</td>
                        <td className="p-3 text-slate-700 font-medium truncate max-w-[250px]" title={row.name}>{row.name}</td>
                        <td className="p-3 text-right font-medium">{formatNumber(row.views)}</td>
                        <td className="p-3 text-right font-medium">{formatNumber(row.clicks)}</td>
                        <td className="p-3 text-right text-slate-600 font-medium">{row.ctr}</td>
                        <td className="p-3 text-right font-bold text-blue-600">{formatNumber(row.conv)}</td>
                        <td className="p-3 text-right font-medium text-amber-600">{formatVND(row.cpa)}</td>
                        <td className="p-3 text-right font-bold text-emerald-600">{formatVND(row.revenue)}</td>
                        <td className="p-3 text-right font-bold text-rose-600">{formatVND(row.cost)}</td>
                        <td className="p-3 text-right font-bold text-purple-600">{row.roas}</td>
                        <td className="p-3 text-right text-slate-600 font-medium">{row.acos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
