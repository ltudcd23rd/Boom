(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();


    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 0) {
            $('.navbar').addClass('position-fixed bg-dark shadow-sm');
        } else {
            $('.navbar').removeClass('position-fixed bg-dark shadow-sm');
        }
    });


    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Testimonials carousel
    /*$('.testimonial-carousel').owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        loop: true,
        nav: false,
        dots: true,
        items: 1,
        dotsData: true,
    });*/


})(jQuery);

/* ========= Custom Cursor: Spaceship with Smoke Trail ========= */

(function () {
    const ship = document.getElementById("cursor-ship");
    if (!ship) return;

    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let prevAngle = 0;
    let isHoveringInteractable = false;

    const TRAIL_INTERVAL = 80; // 稍微調快頻率增加流暢度

    // 移動事件
    window.addEventListener("mousemove", function (e) {
        const x = e.clientX;
        const y = e.clientY;

        // 顯示太空船
        ship.style.opacity = "1";

        // 計算方向角度
        const dx = x - lastX;
        const dy = y - lastY;
        let angle = prevAngle;

        if (dx !== 0 || dy !== 0) {
            angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
            prevAngle = angle;
        }

        // 核心修正：根據 hover 狀態決定縮放倍率與額外旋轉
        // 這樣 JS 更新位置時就不會蓋掉 CSS 的加速效果
        const currentScale = isHoveringInteractable ? 1.5 : 1;
        const boostRotation = isHoveringInteractable ? 15 : 0;
        const finalAngle = angle + boostRotation;

        // 統一座標與中心點：translate(位置) -> translate(中心補償) -> scale -> rotate
        ship.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${currentScale}) rotate(${finalAngle}deg)`;

        // 產生煙霧：座標與太空船位置完全一致
        const now = performance.now();
        if (now - lastTime > TRAIL_INTERVAL) {
            createTrail(x, y);
            lastTime = now;
        }

        lastX = x;
        lastY = y;
    });

    // 滑出視窗時隱藏
    window.addEventListener("mouseleave", function () {
        ship.style.opacity = "0";
    });

    // Hover 監聽邏輯：改為更新布林值
    const interactableTargets = 'a, button, .btn, .nav-link, .team-item, [role="button"]';

    $(document).on('mouseenter', interactableTargets, function () {
        isHoveringInteractable = true;
        // 增加發光濾鏡模擬噴射感
        ship.style.filter = "drop-shadow(0 0 15px var(--bs-primary))";
    }).on('mouseleave', interactableTargets, function () {
        isHoveringInteractable = false;
        ship.style.filter = "none";
    });

    // 產生雲霧拖尾
    function createTrail(x, y) {
        const el = document.createElement("div");
        el.className = "cursor-trail";

        // 設定 left/top 配合 CSS 的 translate(-50%, -50%)
        el.style.left = x + "px";
        el.style.top = y + "px";

        const angle = Math.random() * 360;
        el.style.setProperty("--trail-rot", angle + "deg");

        // 如果在加速狀態，尾跡也稍微放大
        const baseScale = isHoveringInteractable ? 1.0 : 0.4;
        const scale = baseScale + Math.random() * 1.2;
        el.style.setProperty("--trail-scale", scale);

        document.body.appendChild(el);

        el.addEventListener("animationend", function () {
            el.remove();
        });
    }
})();

(function ($) {
    "use strict";

    $(document).ready(function () {
        // 1. 初始化 WOW.js (如果有的話)
        if (typeof WOW !== 'undefined') {
            new WOW().init();
        }

        // 2. 執行動態生成作品卡片
        generateProjectGallery();

        // 3. 綁定篩選按鈕點擊事件 (使用事件委賴)
        // 這樣即使按鈕是動態生成的也能運作
        $(document).on('click', '.custom-filter .nav-link', function (e) {
            e.preventDefault(); // 防止網址加上 #

            // 切換按鈕 active 樣式
            $('.custom-filter .nav-link').removeClass('active');
            $(this).addClass('active');

            // 取得篩選值 (例如 .animation 或 *)
            const filterValue = $(this).attr('data-filter');

            // 執行篩選動畫
            const $projects = $('.project-item');
            if (filterValue === '*') {
                $projects.hide().fadeIn(400);
            } else {
                $projects.hide();
                // 確保選擇器正確，例如 .animation
                $(filterValue).fadeIn(400);
            }
        });
    });

    // 全域變數控制
    let currentPage = 1;
    const itemsPerPage = 8;
    let currentFilter = '*'; // 預設全部

    function generateProjectGallery() {
        if (!window.PROJECTS_DATA) return;

        // --- 第一步：篩選資料 (Filter) ---
        // 將 Object 轉為 Array 方便處理
        const allProjects = Object.keys(window.PROJECTS_DATA).map(key => ({
            id: key,
            ...window.PROJECTS_DATA[key]
        }));

        // 根據標籤過濾
        const filteredProjects = allProjects.filter(p => {
            if (currentFilter === '*') return true;
            // 移除點號進行比對 (例如將 .animation 轉為 animation)
            const targetCategory = currentFilter.replace('.', '').toLowerCase();
            return p.category.toLowerCase() === targetCategory;
        });

        // --- 第二步：計算分頁 (Pagination) ---
        const totalItems = filteredProjects.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // 安全檢查：若切換標籤後總頁數變少，強制回第 1 頁
        if (currentPage > totalPages) currentPage = 1;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

        // --- 第三步：渲染作品 (Render Items) ---
        let html = '';
        let delay = 0.1;

        if (paginatedProjects.length === 0) {
            html = '<div class="col-12 text-center text-white-50 py-5">此分類暫無作品</div>';
        } else {
            paginatedProjects.forEach((project) => {
                const catClass = project.category.toLowerCase();
                html += `
                <div class="col-lg-3 col-md-4 col-6 project-item ${catClass} wow fadeInUp" data-wow-delay="${delay}s">
    <a href="project.html?id=${project.id}" class="team-link text-decoration-none">
        <div class="team-item">
            <div class="team-body overflow-hidden">
                <img class="img-fluid" src="${project.poster}" alt="${project.title}">
            </div>
        </div>
    </a>
</div>`;
                delay = (delay >= 0.4) ? 0.1 : delay + 0.1;
            });
        }

        $('#project-container').html(html);

        // --- 第四步：渲染分頁按鈕 (Render Buttons) ---
        renderPagination(totalPages);
    }

// 分頁按鈕生成
    function renderPagination(totalPages) {
        const $pagination = $('#pagination-container');
        if (totalPages <= 1) {
            $pagination.empty();
            return;
        }

        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>`;
        }
        $pagination.html(html);
    }

// --- 事件綁定 ---
    $(document).ready(function () {
        // 1. 標籤篩選按鈕
        $(document).on('click', '.custom-filter a', function (e) {
            e.preventDefault();
            $('.custom-filter a').removeClass('active');
            $(this).addClass('active');

            currentFilter = $(this).attr('data-filter');
            currentPage = 1; // 重點：切換標籤必須回到第一頁
            generateProjectGallery();
        });

        // 2. 分頁數字按鈕
        $(document).on('click', '.page-link', function (e) {
            e.preventDefault();
            const targetPage = $(this).data('page');
            if (targetPage === currentPage) return;

            currentPage = targetPage;
            generateProjectGallery();

            // 捲動回作品頂部
            $('html, body').animate({
                scrollTop: $("#work").offset().top + 300
            }, 500);
        });

        // 初始執行
        generateProjectGallery();
    });
})(jQuery);

(function ($) {
    "use strict";

    $(document).ready(function () {
        // 篩選按鈕點擊事件
        $('.custom-filter .btn').on('click', function (e) {
            e.preventDefault(); // 防止跳轉

            $('.custom-filter .btn').removeClass('active');
            $(this).addClass('active');

            const filterValue = $(this).attr('data-filter');

            if (filterValue === '*') {
                $('.project-item').hide().fadeIn(400);
            } else {
                $('.project-item').hide();
                // 確保選擇器正確，例如 .animation
                $(filterValue).fadeIn(400);
            }
        });
    });

})(jQuery);

// 動態切換組別内容
(function ($) {
    "use strict";

    $(document).ready(function () {
        // 初始化 WOW.js 載入動畫
        if (typeof WOW !== 'undefined') {
            new WOW().init();
        }

        // 執行動態頁面渲染
        renderProjectPage();
    });

    function renderProjectPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const pid = urlParams.get('id');

        if (!pid || !window.PROJECTS_DATA) return;

        const data = window.PROJECTS_DATA[pid];

        if (data) {
            // 1. 替換基本資訊
            $('#proj-title').text(data.title);
            $('#proj-category').text(data.category);
            $('#proj-desc').text(data.description);
            $('#proj-poster').attr('src', data.poster);
            $('#proj-video').attr('src', data.videoUrl);

            // 2. 動態處理社交媒體按鈕
            let linksHtml = '';
            if (data.links && data.links.length > 0) {
                data.links.forEach(link => {
                    linksHtml += `
                    <div class="col-auto mb-2">
                        <a href="${link.url}" target="_blank" class="btn btn-outline-primary border-2 py-3 px-4">
                            ${link.label}
                        </a>
                    </div>`;
                });
            }
            $('#links-container').html(linksHtml);

            // 3. 動態生成成員卡片
            let html = '';
            data.members.forEach(m => {
                html += `
                    <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
                        <div class="testimonial-item text-center d-flex flex-column align-items-center">
                            <img src="${m.img}" class="img-fluid rounded-circle mb-4" style="width: 150px; height: 150px; object-fit: cover;" alt="${m.name}">
                            <h5 class="text-uppercase mb-1">${m.name}</h5>
                            <span class="text-primary">${m.role}</span>
                        </div>
                    </div>`;
            });
            const $container = $('#member-container');
            if ($container.length) $container.html(html);

            // --- 4. 核心修改：處理左右切換按鈕 ---
            const projectKeys = Object.keys(window.PROJECTS_DATA); // 取得所有 ID 陣列
            const currentIndex = projectKeys.indexOf(pid);

            if (currentIndex !== -1) {
                // 計算上一組與下一組的索引（循環模式）
                const prevIndex = (currentIndex - 1 + projectKeys.length) % projectKeys.length;
                const nextIndex = (currentIndex + 1) % projectKeys.length;

                const prevId = projectKeys[prevIndex];
                const nextId = projectKeys[nextIndex];

                // 更新 HTML 中的按鈕 href
                $('#prev-project').attr('href', `project.html?id=${prevId}`);
                $('#next-project').attr('next-id', nextId); // 供 JS 跳轉或備用
                $('#next-project').attr('href', `project.html?id=${nextId}`);
            }

            // 更新網頁標題
            document.title = `${data.title} - KaBoom`;
        } else {
            console.error("Project ID not found.");
            $('#proj-desc').text("查無此作品資訊。");
        }
    }

})(jQuery);

document.addEventListener('DOMContentLoaded', function () {
    // 1. 定義你的圖片路徑清單 (請根據實際檔名修改)
    const imagePool = [
        'img/portrait-1.png',
        'img/portrait-2.png',
        'img/gamepad.png',
        'img/alien.png',
        'img/alien-2.png',
        'img/alien-3.png'
    ];

    const particles = document.querySelectorAll('.smoke-particle');

    particles.forEach((particle) => {
        // 2. 從陣列中隨機挑選一張圖
        const randomImg = imagePool[Math.floor(Math.random() * imagePool.length)];

        // 3. 套用背景圖
        particle.style.backgroundImage = `url('${randomImg}')`;

        // 4. 隨機微調左側位置與動畫時長，增加亂序感
        const randomLeft = Math.floor(Math.random() * 90) + 5; // 5% - 95%
        const randomDuration = 3 + Math.random() * 3; // 3s - 6s

        particle.style.left = `${randomLeft}%`;
        particle.style.animationDuration = `${randomDuration}s`;
    });
});

// 獲取太空船元素
const cursorShip = document.getElementById('cursor-ship');

// 定義需要觸發加速反應的目標元素
const interactiveElements = document.querySelectorAll('a, button, .project-item, .btn, .nav-link');

interactiveElements.forEach(el => {
    // 當滑鼠移入：加上加速類別
    el.addEventListener('mouseenter', () => {
        cursorShip.classList.add('cursor-boost');
    });

    // 當滑鼠移出：移除加速類別
    el.addEventListener('mouseleave', () => {
        cursorShip.classList.remove('cursor-boost');
    });
});

(function () {
    let bubbleInterval = null;
    const exhibitionSection = document.getElementById('game');

    if (!exhibitionSection) return;

    // 建立觀察器：控制進入區域才開始產生
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!bubbleInterval) {
                    // 每 0.8 秒產生一個
                    bubbleInterval = setInterval(() => {
                        createAbsoluteBubble();
                    }, 800);
                }
            } else {
                if (bubbleInterval) {
                    clearInterval(bubbleInterval);
                    bubbleInterval = null;
                }
            }
        });
    }, {
        threshold: 0.1
    });

    observer.observe(exhibitionSection);

    function createAbsoluteBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'comic-bubble-dynamic';

        // --- 核心邏輯：判斷是否過載 ---
        if (window.isSystemOverloaded) {
            // 狀態 A：系統崩潰，產生外星人圖片
            const img = document.createElement('img');
            img.src = 'img/alien-2.png';
            img.style.width = '60px'; // 調整適合的大小
            img.style.height = 'auto';
            img.style.display = 'block';
            bubble.appendChild(img);

            // 變更氣泡樣式強化過載感
            bubble.style.background = '#ff0055';
            bubble.style.boxShadow = '5px 5px 0px #000';
        } else {
            // 狀態 B：正常狀態，產生隨機文字
            const messages = ["BOOM!", "導彈發射!", "靈感偵測!", "英雄登場!", "作業做不完!!", "作業被偷啦!!", "燒掉!!", "咻——", "設計中...", "OMG!", "真假!?", "不來看一下嗎?", "外星人入侵!?"];
            const text = document.createElement('span');
            text.className = 'bubble-text-dynamic';
            text.innerText = messages[Math.floor(Math.random() * messages.length)];
            bubble.appendChild(text);
        }

        // --- 定位計算 ---
        // 1. 左右兩側隨機分配 (避開中間內容)
        const isLeft = Math.random() > 0.5;
        const xPercent = isLeft ? (Math.random() * 20 + 5) : (Math.random() * 20 + 75);

        // 2. 取得 #game 區塊相對於整個頁面的座標
        const rect = exhibitionSection.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // 3. 在區塊高度範圍內隨機生成 Y 軸座標
        const randomY = Math.random() * (rect.height - 100) + 50;
        const absoluteY = rect.top + scrollTop + randomY;

        // 4. 隨機旋轉角度
        const rot = (Math.random() * 20 - 10);

        // --- 套用樣式 ---
        bubble.style.setProperty('--bubble-rot', rot + 'deg');
        bubble.style.left = xPercent + '%';
        bubble.style.top = absoluteY + 'px';
        bubble.style.position = 'absolute'; // 確保為絕對定位

        document.body.appendChild(bubble);

        // --- 動畫處理 ---
        void bubble.offsetHeight; // 強制重繪觸發 CSS Transition
        bubble.classList.add('bubble-visible');

        // 2.5 秒後執行消失動畫並移除元素
        setTimeout(() => {
            bubble.classList.remove('bubble-visible');
            bubble.classList.add('bubble-fade-out');
            setTimeout(() => {
                if (bubble.parentNode) bubble.remove();
            }, 500);
        }, 2500);
    }
})();

// 1. 點擊音效函式 (確保放在全域)
function playClickSound(frequency = 440, type = 'sine') {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
        console.log("AudioContext blocked");
    }
}


(function () {
    let score = 0;
    let isGlitched = false;
    const core = document.getElementById('inspiration-core');
    const scoreText = document.getElementById('inspiration-score');

    if (!core) return;
    window.isSystemOverloaded = false; // 新增全域旗標

    core.addEventListener('click', function(e) {
        if (window.isSystemOverloaded) return;

        score += 10;
        if (score > 100) score = 100;
        if (scoreText) scoreText.innerText = score;

        playClickSound(200 + score * 5, 'square');

        // --- 核心修正：動態變色邏輯 ---
        const hue = 200 - (score * 2); // 隨數值從藍變紅
        core.style.transform = `scale(${1 + score/200})`;

        // 確保設定的是 background 或 CSS 變數，而不是 filter
        core.style.setProperty('--core-color', `hsl(${hue}, 100%, 60%)`);
        core.style.boxShadow = `0 0 ${20 + score/2}px hsl(${hue}, 100%, 60%)`;
        // 移除這行（如果原本在那裡）：core.style.filter = "none";

        if (score === 100) {
            window.isSystemOverloaded = true; // 設定過載狀態
            triggerOverload();
        }
    });

    function triggerOverload() {
        isGlitched = true;
        document.body.classList.add('screen-shake');

        setTimeout(() => {
            document.body.classList.remove('screen-shake');

            createGlobalGlitchLayer();
            createFixedWarning();

            // --- 修正：只有在過載後才套用灰色濾鏡 ---
            if (core) {
                core.style.filter = "grayscale(1) brightness(0.3)";
                core.style.boxShadow = "none"; // 關閉發光效果
            }
        }, 3000);
    }

    function createGlobalGlitchLayer() {
        if (document.querySelector('.global-glitch-overlay')) return;
        const glitchLayer = document.createElement('div');
        glitchLayer.className = 'global-glitch-overlay';
        document.body.appendChild(glitchLayer);
    }

    function createFixedWarning() {
        if (document.querySelector('.glitch-overlay-mask')) return;
        const mask = document.createElement('div');
        mask.className = 'glitch-overlay-mask';
        mask.innerHTML = `
        <div class="glitch-warning-text">
            中計了！<br>
            這是外星人的陰謀！<br>
            快重新加載頁面！
        </div>
        <div style="color:white; opacity:0.5; margin-top:20px; font-size:0.9rem;">
            ( 威脅已鎖定視窗中心，滑動無法擺脫 )
        </div>
    `;
        document.body.appendChild(mask);
    }
})();

