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

    // 控制拖尾生成頻率（毫秒）
    const TRAIL_INTERVAL = 100;

    // 追蹤游標方向用
    let prevAngle = 0;

    // 用於標記滑鼠是否處於可點擊元素上
    let isHoveringInteractable = false;

    // 移動事件
    window.addEventListener("mousemove", function (e) {
        const x = e.clientX;
        const y = e.clientY;

        // --- 修改點 A: 根據 Hover 狀態決定是否顯示太空船 ---
        // 只有當滑鼠移動，且「不是」在可點擊元素上時，才顯示太空船
        if (!isHoveringInteractable) {
            ship.style.opacity = "1";
        }

        // 算方向角度（讓太空船朝移動方向）
        const dx = x - lastX;
        const dy = y - lastY;
        let angle = prevAngle;

        if (dx !== 0 || dy !== 0) {
            // atan2 回傳弧度，轉成角度
            angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90; // +90 讓圖片朝上可視為「前方」
            prevAngle = angle;
        }

        // 更新太空船位置與旋轉
        ship.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;

        // --- 修改點 B: 只有在顯示太空船時才產生煙霧 ---
        const now = performance.now();
        if (!isHoveringInteractable && now - lastTime > TRAIL_INTERVAL) {
            createTrail(x, y);
            lastTime = now;
        }

        lastX = x;
        lastY = y;
    });

    // 滑出視窗時隱藏太空船
    window.addEventListener("mouseleave", function () {
        if (ship) {
            ship.style.opacity = "0";
        }
    });

    // --- 修改點 C: 加入 Hover 監聽邏輯 ---
    // 取得所有需要觸發手指 icon (且隱藏太空船) 的元素
    // 包含連結、按鈕、Bootstrap 的 .btn 類別、導覽列連結、以及動態生成的作品卡片 (.team-item)
    const interactableTargets = 'a, button, .btn, .nav-link, .team-item, [role="button"]';

    // 使用 jQuery 的事件委賴 (Event Delegation) 處理動態生成的元素
    // 這確保了透過 JS 生成的作品卡片也能正常觸發
    $(document).on('mouseenter', interactableTargets, function() {
        isHoveringInteractable = true;
        ship.style.opacity = "0"; // 立即隱藏太空船
    }).on('mouseleave', interactableTargets, function() {
        isHoveringInteractable = false;
        // 離開時，不要在這裡立即設為 1，讓 mousemove 函式去處理顯示，避免滑動時閃爍
    });


    // 產生雲霧拖尾
    function createTrail(x, y) {
        const el = document.createElement("div");
        el.className = "cursor-trail";
        el.style.left = x + "px";
        el.style.top = y + "px";

        // 隨機旋轉角度
        const angle = Math.random() * 360;
        el.style.setProperty("--trail-rot", angle + "deg");

        const scale = 0.4 + Math.random() * 1.4;
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
                <div class="col-lg-3 col-md-6 project-item ${catClass} wow fadeInUp" data-wow-delay="${delay}s">
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
    $(document).ready(function() {
        // 1. 標籤篩選按鈕
        $(document).on('click', '.custom-filter a', function(e) {
            e.preventDefault();
            $('.custom-filter a').removeClass('active');
            $(this).addClass('active');

            currentFilter = $(this).attr('data-filter');
            currentPage = 1; // 重點：切換標籤必須回到第一頁
            generateProjectGallery();
        });

        // 2. 分頁數字按鈕
        $(document).on('click', '.page-link', function(e) {
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
