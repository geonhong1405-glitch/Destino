document.addEventListener('DOMContentLoaded', () => {
    const sliderWrapper = document.querySelector('.event-slider-wrapper');
    const sliderTrack = document.querySelector('.grid-33'); // 슬라이드 트랙 역할
    const slides = document.querySelectorAll('.event-c');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');

    let currentIndex = 0;
    let slideWidth = 0;
    let gap = 20; // CSS의 gap과 동일하게 설정
    let visibleItems = 3; // 기본 3개 보임

    // 초기화 및 반응형 처리
    function updateSliderDimensions() {
        const containerWidth = sliderWrapper.clientWidth;
        
        // 화면 크기에 따른 보이는 아이템 개수 설정 (CSS 미디어 쿼리와 일치)
        if (window.innerWidth <= 600) {
            visibleItems = 1;
        } else if (window.innerWidth <= 992) {
            visibleItems = 2;
        } else {
            visibleItems = 3;
        }

        // 슬라이드 하나의 너비 계산: (전체폭 - (갭 * (보이는개수-1))) / 보이는개수
        // *버튼 영역 확보를 위해 CSS에서 wrapper에 padding이 있다고 가정하거나, 계산에 보정치를 둡니다.
        // 여기서는 grid-3가 wrapper 꽉 차게 있다고 가정합니다.
        
        // grid-3의 너비 기준으로 계산
        const trackWidth = sliderTrack.clientWidth;
        slideWidth = (trackWidth - (gap * (visibleItems - 1))) / visibleItems;

        // 슬라이드들에게 너비 강제 적용 (flex-basis)
        slides.forEach(slide => {
            slide.style.flex = `0 0 ${slideWidth}px`;
            slide.style.maxWidth = `${slideWidth}px`; // 더 커지지 않게 고정
        });

        // 위치 재조정
        updateSlidePosition();
    }

    function updateSlidePosition() {
        // 이동 거리 = 인덱스 * (슬라이드너비 + 갭)
        const moveAmount = currentIndex * (slideWidth + gap);
        sliderTrack.style.transform = `translateX(-${moveAmount}px)`;
        
        // 버튼 활성화/비활성화 상태 관리
        prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';

        const maxIndex = slides.length - visibleItems;
        nextBtn.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
        nextBtn.style.pointerEvents = currentIndex >= maxIndex ? 'none' : 'auto';
    }

    // 다음 버튼 클릭
    nextBtn.addEventListener('click', () => {
        const maxIndex = slides.length - visibleItems;
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateSlidePosition();
        }
    });

    // 이전 버튼 클릭
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlidePosition();
        }
    });

    // 창 크기 변경 시 사이즈 재계산
    window.addEventListener('resize', () => {
        updateSliderDimensions();
    });

    // 초기 실행
    updateSliderDimensions();
});