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
    $('.testimonial-carousel').owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        loop: true,
        nav: false,
        dots: true,
        items: 1,
        dotsData: true,
    });

    
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

    // 移動事件
    window.addEventListener("mousemove", function (e) {
        const x = e.clientX;
        const y = e.clientY;

        // 顯示太空船
        ship.style.opacity = "1";

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

        const now = performance.now();
        if (now - lastTime > TRAIL_INTERVAL) {
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

    // 產生雲霧拖尾
    function createTrail(x, y) {
        const el = document.createElement("div");
        el.className = "cursor-trail";
        el.style.left = x + "px";
        el.style.top = y + "px";

        // 隨機旋轉角度
        const angle = Math.random() * 360;
        el.style.setProperty("--trail-rot", angle + "deg");

        // 如果還想加一點隨機大小，可以用 scale 變數一樣用 CSS 變數的方式
        // 例如再加一個 --trail-scale，然後在 CSS 的 transform 用它：
        // transform: translate(-50%, -50%) rotate(var(--trail-rot)) scale(var(--trail-scale));
        // 這裡示範：
        const scale = 0.4 + Math.random() * 1.4;
        el.style.setProperty("--trail-scale", scale);

        document.body.appendChild(el);

        el.addEventListener("animationend", function () {
            el.remove();
        });
    }

})();


