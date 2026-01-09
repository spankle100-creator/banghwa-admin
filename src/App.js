import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc, 
  writeBatch
} from 'firebase/firestore';
import { 
  Calendar, 
  Users, 
  Clock, 
  BookOpen, 
  MapPin, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  RefreshCw,
  Menu,
  X
} from 'lucide-react';

// --- Firebase Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyBA4mhI5t6JcXOw8TLoJUFD2D99wxQWyhI",
  authDomain: "banghwa-fef43.firebaseapp.com",
  projectId: "banghwa-fef43",
  storageBucket: "banghwa-fef43.firebasestorage.app",
  messagingSenderId: "610093915144",
  appId: "1:610093915144:web:7ac80e9cb51dfb6a3045bd",
  measurementId: "G-D05538N5SX"
};

// ✅ Firebase 초기화 (필수!)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Components ---
// 1. 공통 레이아웃 및 네비게이션
const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

// 2. 단순 조회용 컴포넌트
const StaticViewer = ({ title, description, placeholderColor = "bg-blue-100" }) => (
  <div className="p-6 h-full flex flex-col">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
    <div className={`flex-1 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-8 ${placeholderColor}`}>
      <div className="bg-white p-4 rounded-full shadow-sm mb-4">
        <BookOpen size={48} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title} 자료 화면</h3>
      <p className="text-gray-500 max-w-md">
        {description}<br/>
        실제 운영 시에는 이곳에 학교에서 제작한 <span className="font-bold text-blue-600">PDF 파일이나 이미지</span>를 삽입하여 보여줍니다.
      </p>
    </div>
  </div>
);

// 3. 학년별 위원회 조직
const CommitteeOrg = ({ user }) => {
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);

  const committeeTypes = [
    { key: 'insa', label: '인사자문' },
    { key: 'eval', label: '학교평가' },
    { key: 'art', label: '예체능' },
    { key: 'equip', label: '기자재' },
  ];

  useEffect(() => {
    if (!user) return;
    // ✅ 경로 단순화
    const q = collection(db, 'committees');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (data.length === 0) {
        initCommitteeData();
      } else {
        data.sort((a, b) => a.order - b.order);
        setCommittees(data);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching committees:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const initCommitteeData = async () => {
    const batch = writeBatch(db);
    const grades = [
      { order: 1, grade: '1학년' },
      { order: 2, grade: '2학년' },
      { order: 3, grade: '3학년' },
      { order: 4, grade: '4학년' },
      { order: 5, grade: '5학년' },
      { order: 6, grade: '6학년' },
      { order: 7, grade: '교과' },
    ];

    grades.forEach(item => {
      const docRef = doc(collection(db, 'committees'));
      batch.set(docRef, { ...item, insa: '', eval: '', art: '', equip: '' });
    });
    await batch.commit();
  };

  const handleUpdate = async (id, field, value) => {
    try {
      const docRef = doc(db, 'committees', id);
      await updateDoc(docRef, { [field]: value });
    } catch (e) {
      console.error("Update failed", e);
      alert("저장에 실패했습니다.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">학년별 위원회 조직</h2>
      <p className="mb-4 text-gray-600 text-sm">표 안의 내용을 입력하고 바깥을 클릭하면 자동 저장됩니다.</p>
      
      {loading ? (
        <div className="text-center py-10">로딩중...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 font-bold border-r w-32 text-center">구분</th>
                {committeeTypes.map(type => (
                  <th key={type.key} className="px-6 py-4 font-bold border-r last:border-r-0 text-center">
                    {type.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {committees.map((item) => (
                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-center text-gray-900 border-r bg-gray-50">
                    {item.grade}
                  </td>
                  {committeeTypes.map(type => (
                    <td key={type.key} className="p-0 border-r last:border-r-0">
                      <input
                        type="text"
                        className="w-full h-full px-4 py-4 bg-transparent focus:bg-blue-50 focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:outline-none text-center"
                        defaultValue={item[type.key] || ''}
                        onBlur={(e) => handleUpdate(item.id, type.key, e.target.value)}
                        placeholder="입력"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 4. 협력강사 시간표
const InstructorSchedule = ({ user }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [viewMode, setViewMode] = useState('calendar');
  const [loading, setLoading] = useState(false);
  const [inputTitle, setInputTitle] = useState('');
  const [inputDate, setInputDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDay, setSelectedDay] = useState('1');
  const [moveSourceDate, setMoveSourceDate] = useState('');
  const [moveTargetDate, setMoveTargetDate] = useState('');
  const [moveTitle, setMoveTitle] = useState('');

  useEffect(() => {
    if (!user) return;
    // ✅ 경로 단순화
    const q = collection(db, 'schedules');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setEvents(data);
    });
    return () => unsubscribe();
  }, [user]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleSingleAdd = async () => {
    if (!inputTitle || !inputDate) return alert('강의명과 날짜를 입력해주세요.');
    setLoading(true);
    try {
      await addDoc(collection(db, 'schedules'), {
        title: inputTitle, date: inputDate, createdAt: new Date().toISOString()
      });
      alert('등록되었습니다.');
      setInputTitle(''); setInputDate('');
    } catch (e) { alert('오류가 발생했습니다.'); }
    setLoading(false);
  };

  const handleBulkAdd = async () => {
    if (!inputTitle || !startDate || !endDate) return alert('모든 정보를 입력해주세요.');
    setLoading(true);
    const batch = writeBatch(db);
    const start = new Date(startDate);
    const end = new Date(endDate);
    let current = new Date(start);
    let count = 0;
    const targetDay = parseInt(selectedDay);

    while (current <= end) {
      if (current.getDay() === targetDay) {
        const docRef = doc(collection(db, 'schedules'));
        batch.set(docRef, { title: inputTitle, date: formatDate(current), createdAt: new Date().toISOString() });
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    try {
      await batch.commit();
      alert(`총 ${count}건의 수업이 일괄 등록되었습니다.`);
    } catch (e) { alert('일괄 등록 중 오류가 발생했습니다.'); }
    setLoading(false);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('이 일정을 삭제하시겠습니까?')) return;
    try { await deleteDoc(doc(db, 'schedules', id)); } catch (e) { alert('삭제 실패'); }
  };

  const handleBulkDelete = async () => {
    if (!inputTitle || !startDate || !endDate) return alert('삭제할 조건을 입력해주세요.');
    if (!window.confirm('정말 일괄 삭제하시겠습니까?')) return;
    setLoading(true);
    const toDelete = events.filter(ev => ev.title === inputTitle && ev.date >= startDate && ev.date <= endDate);
    const batch = writeBatch(db);
    toDelete.forEach(ev => batch.delete(doc(db, 'schedules', ev.id)));
    try {
      await batch.commit();
      alert(`${toDelete.length}건이 삭제되었습니다.`);
    } catch (e) { alert('삭제 중 오류 발생'); }
    setLoading(false);
  };

  const handleMoveClass = async () => {
    if (!moveTitle || !moveSourceDate || !moveTargetDate) return alert('모든 정보를 입력해주세요.');
    setLoading(true);
    const targets = events.filter(ev => ev.date === moveSourceDate && ev.title === moveTitle);
    if (targets.length === 0) { alert('해당 수업이 없습니다.'); setLoading(false); return; }
    const batch = writeBatch(db);
    targets.forEach(ev => batch.update(doc(db, 'schedules', ev.id), { date: moveTargetDate }));
    try {
      await batch.commit();
      alert('수업 일정이 변경되었습니다.');
      setMoveTitle(''); setMoveSourceDate(''); setMoveTargetDate('');
    } catch (e) { alert('변경 실패'); }
    setLoading(false);
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(currentDate);
    const monthStr = currentDate.toLocaleString('ko-KR', { month: 'long', year: 'numeric' });
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
          <h3 className="text-xl font-bold">{monthStr}</h3>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2 text-center font-bold text-gray-500 text-sm">
          <div className="text-red-500">일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div className="text-blue-500">토</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (!day) return <div key={idx} className="h-24 bg-gray-50/50"></div>;
            const dayStr = formatDate(day);
            const dayEvents = events.filter(e => e.date === dayStr);
            const isToday = dayStr === formatDate(new Date());
            return (
              <div key={idx} className={`min-h-24 border border-gray-100 p-1 ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
                <div className={`text-xs font-semibold mb-1 ${day.getDay() === 0 ? 'text-red-500' : day.getDay() === 6 ? 'text-blue-500' : 'text-gray-700'}`}>{day.getDate()}</div>
                <div className="space-y-1">
                  {dayEvents.map(ev => (
                    <div key={ev.id} className="text-xs bg-indigo-100 text-indigo-800 p-1 rounded group relative cursor-pointer">
                      <span className="truncate block">{ev.title}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id); }} className="absolute top-0 right-0 hidden group-hover:block bg-red-500 text-white p-0.5 rounded-bl text-[10px]">×</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">협력강사 시간표</h2>
        <div className="flex bg-gray-100 p-1 rounded-lg text-sm">
          {[
            { id: 'calendar', label: '달력 조회', icon: Calendar },
            { id: 'input', label: '수업 입력', icon: Plus },
            { id: 'delete', label: '수업 삭제', icon: Trash2 },
            { id: 'move', label: '수업 변경', icon: RefreshCw },
          ].map(m => (
            <button key={m.id} onClick={() => setViewMode(m.id)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md ${viewMode === m.id ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-gray-500'}`}>
              <m.icon size={14} /><span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'calendar' && renderCalendar()}

      {viewMode === 'input' && (
        <div className="bg-white p-6 rounded-xl shadow border space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-4">개별 입력</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1"><label className="block text-sm font-medium mb-1">강의명</label><input type="text" value={inputTitle} onChange={e => setInputTitle(e.target.value)} className="w-full p-2 border rounded" placeholder="예: 국악수업" /></div>
              <div><label className="block text-sm font-medium mb-1">날짜</label><input type="date" value={inputDate} onChange={e => setInputDate(e.target.value)} className="w-full p-2 border rounded" /></div>
              <button onClick={handleSingleAdd} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{loading ? '저장 중' : '등록'}</button>
            </div>
          </div>
          <hr />
          <div>
            <h3 className="text-lg font-bold mb-4">일괄 입력</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div><label className="block text-sm font-medium mb-1">강의명</label><input type="text" value={inputTitle} onChange={e => setInputTitle(e.target.value)} className="w-full p-2 border rounded" /></div>
              <div><label className="block text-sm font-medium mb-1">시작일</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded" /></div>
              <div><label className="block text-sm font-medium mb-1">종료일</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded" /></div>
              <div><label className="block text-sm font-medium mb-1">요일</label>
                <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="w-full p-2 border rounded">
                  <option value="1">월요일</option><option value="2">화요일</option><option value="3">수요일</option><option value="4">목요일</option><option value="5">금요일</option>
                </select>
              </div>
            </div>
            <button onClick={handleBulkAdd} disabled={loading} className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">해당 기간 요일 일괄 등록</button>
          </div>
        </div>
      )}

      {viewMode === 'delete' && (
        <div className="bg-white p-6 rounded-xl shadow border">
          <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center"><Trash2 className="mr-2" size={20}/> 조건부 일괄 삭제</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div><label className="block text-sm font-medium mb-1">강의명</label><input type="text" value={inputTitle} onChange={e => setInputTitle(e.target.value)} className="w-full p-2 border rounded" /></div>
            <div><label className="block text-sm font-medium mb-1">시작</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded" /></div>
            <div><label className="block text-sm font-medium mb-1">종료</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded" /></div>
          </div>
          <button onClick={handleBulkDelete} disabled={loading} className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">조건에 맞는 수업 일괄 삭제</button>
        </div>
      )}

      {viewMode === 'move' && (
        <div className="bg-white p-6 rounded-xl shadow border">
          <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center"><RefreshCw className="mr-2" size={20}/> 수업 날짜 변경</h3>
          <div className="space-y-4 max-w-lg mx-auto bg-gray-50 p-6 rounded-lg">
            <div><label className="block text-sm font-medium mb-1">강의명</label><input type="text" value={moveTitle} onChange={e => setMoveTitle(e.target.value)} className="w-full p-2 border rounded" /></div>
            <div className="flex items-center gap-4">
              <div className="flex-1"><label className="block text-sm font-medium mb-1">현재 날짜</label><input type="date" value={moveSourceDate} onChange={e => setMoveSourceDate(e.target.value)} className="w-full p-2 border rounded" /></div>
              <div className="pt-6">➜</div>
              <div className="flex-1"><label className="block text-sm font-medium mb-1">이동할 날짜</label><input type="date" value={moveTargetDate} onChange={e => setMoveTargetDate(e.target.value)} className="w-full p-2 border rounded" /></div>
            </div>
            <button onClick={handleMoveClass} disabled={loading} className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:opacity-50">수업 이동 실행</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // ✅ 단순화된 인증
    signInAnonymously(auth).catch(console.error);
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const menuItems = [
    { id: 'duty', label: '학급구성 및 업무분장', icon: Users, type: 'static', desc: '학급 담임 선생님 명단 및 학교 업무 분장표입니다.' },
    { id: 'committee', label: '학년별 위원회 조직', icon: Users, type: 'committee' },
    { id: 'special', label: '특별실 시간표', icon: MapPin, type: 'static', desc: '과학실, 컴퓨터실 등 특별실 시간표입니다.' },
    { id: 'afterschool', label: '방과후 시간표', icon: Clock, type: 'static', desc: '방과후 학교 프로그램 시간표입니다.' },
    { id: 'classroom', label: '교실정보', icon: BookOpen, type: 'static', desc: '각 교실의 위치, 전화번호 등 배치도입니다.' },
    { id: 'coop', label: '협력강사 시간표', icon: Calendar, type: 'schedule' },
  ];

  const renderContent = () => {
    if (!user) return <div className="flex h-screen items-center justify-center">로그인 중...</div>;
    const activeItem = menuItems.find(item => item.id === activeTab);
    
    if (!activeItem && activeTab === 'home') {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">서울방화초등학교</h1>
          <p className="text-xl text-gray-600 mb-8">선생님들을 위한 학사 정보 공유 시스템입니다.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full">
            {menuItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl flex flex-col items-center text-center border">
                <div className="bg-blue-100 p-4 rounded-full mb-4 text-blue-600"><item.icon size={32} /></div>
                <h3 className="font-bold text-lg text-gray-800">{item.label}</h3>
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (activeItem?.type === 'static') return <StaticViewer title={activeItem.label} description={activeItem.desc} />;
    if (activeItem?.type === 'committee') return <CommitteeOrg user={user} />;
    if (activeItem?.type === 'schedule') return <InstructorSchedule user={user} />;
    return null;
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <div className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-800 cursor-pointer" onClick={() => setActiveTab('home')}>서울방화초</h1>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <SidebarItem icon={Settings} label="메인 홈" active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setIsSidebarOpen(false); }} />
          <div className="h-4"></div>
          {menuItems.map(item => (
            <SidebarItem key={item.id} icon={item.icon} label={item.label} active={activeTab === item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} />
          ))}
        </nav>
        <div className="p-4 border-t text-xs text-gray-400 text-center">Teacher Assistant System<br/>v1.0</div>
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)}><Menu size={24} className="text-gray-600" /></button>
          <span className="font-bold text-gray-800">{menuItems.find(i => i.id === activeTab)?.label || '서울방화초등학교'}</span>
          <div className="w-6"></div>
        </div>
        <main className="flex-1 overflow-auto bg-gray-50">{renderContent()}</main>
      </div>
    </div>
  );
};

export default App;
