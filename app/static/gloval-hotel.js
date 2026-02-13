// Lucide 아이콘 초기화
lucide.createIcons();

/* ================= 목적지 데이터 및 모달 로직 ================= */
const regionsData = {
    '일본': ['도쿄', '오사카', '후쿠오카', '삿포로', '오키나와', '나고야', '교토', '고베'],
    '동남아': ['방콕', '다낭', '나트랑', '세부', '발리', '싱가포르', '푸껫', '코타키나발루', '마닐라'],
    '홍콩/마카오/중국': ['홍콩', '마카오', '상하이', '베이징', '칭다오', '광저우'],
    '남태평양': ['괌', '사이판', '시드니', '오클랜드', '멜버른', '골드코스트'],
    '미주': ['하와이', '뉴욕', '로스앤젤레스', '라스베이거스', '샌프란시스코', '밴쿠버'],
    '유럽': ['파리', '런던', '로마', '바르셀로나', '프라하', '인터라켄', '베네치아', '피렌체'],
    '중동/아프리카': ['두바이', '카이로', '케이프타운', '아부다비']
};

const regionTabs = document.getElementById('regionTabs');
const cityGrid = document.getElementById('cityGrid');
const regionTitle = document.getElementById('selectedRegionTitle');
const destInput = document.getElementById('destInput');

// 지역 탭 렌더링
function initDestinations() {
    let isFirst = true;
    for (const region in regionsData) {
        const btn = document.createElement('button');
        btn.className = `dest-tab ${isFirst ? 'active' : ''}`;
        btn.textContent = region;
        btn.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.dest-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            renderCities(region);
        };
        regionTabs.appendChild(btn);
        
        if (isFirst) {
            renderCities(region);
            isFirst = false;
        }
    }
}

// 선택된 지역의 도시 렌더링
function renderCities(region) {
    regionTitle.textContent = `${region} 주요 도시`;
    cityGrid.innerHTML = '';
    regionsData[region].forEach(city => {
        const btn = document.createElement('button');
        btn.className = 'city-btn';
        btn.textContent = city;
        btn.onclick = (e) => {
            e.stopPropagation();
            destInput.value = `${city}, ${region}`;
            closeAllPopovers();
        };
        cityGrid.appendChild(btn);
    });
}
initDestinations();

/* ================= 날짜 초기화 (오늘/내일) ================= */
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const checkinInput = document.getElementById('checkinDate');
const checkoutInput = document.getElementById('checkoutDate');

if (checkinInput && checkoutInput) {
    checkinInput.valueAsDate = today;
    checkoutInput.valueAsDate = tomorrow;
}

/* ================= 인원 및 객실 로직 ================= */
let guests = { adult: 2, child: 0, room: 1 };

function updateGuest(type, change) {
    // 이벤트 전파 방지 (HTML의 onclick에서 처리하지 않고 여기서 처리할 경우 필요, 현재는 inline 호출이라 event 객체가 전역일 수 있음)
    if(window.event) window.event.stopPropagation();
    
    let newVal = guests[type] + change;
    
    // 제한 로직
    if (type === 'adult' && newVal < 1) newVal = 1;
    if (type === 'child' && newVal < 0) newVal = 0;
    if (type === 'room' && newVal < 1) newVal = 1;

    guests[type] = newVal;
    
    // UI 업데이트
    const valElem = document.getElementById(`val${capitalize(type)}`);
    if(valElem) valElem.textContent = newVal;
    
    const guestInput = document.getElementById('guestInput');
    if(guestInput) guestInput.value = `성인 ${guests.adult}명, 아동 ${guests.child}명, 객실 ${guests.room}개`;
    
    // 버튼 비활성화 상태 업데이트
    const btnAdultMinus = document.getElementById('btnAdultMinus');
    const btnChildMinus = document.getElementById('btnChildMinus');
    const btnRoomMinus = document.getElementById('btnRoomMinus');

    if(btnAdultMinus) btnAdultMinus.disabled = guests.adult <= 1;
    if(btnChildMinus) btnChildMinus.disabled = guests.child <= 0;
    if(btnRoomMinus) btnRoomMinus.disabled = guests.room <= 1;
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ================= Popover 제어 로직 ================= */
function openPopover(id) {
    closeAllPopovers(); // 다른 팝업 닫기
    const popover = document.getElementById(id);
    const overlay = document.getElementById('widgetOverlay');
    if(popover) popover.classList.add('active');
    if(overlay) overlay.classList.add('active');
}

function closeAllPopovers() {
    document.querySelectorAll('.popover').forEach(p => p.classList.remove('active'));
    const overlay = document.getElementById('widgetOverlay');
    if(overlay) overlay.classList.remove('active');
}