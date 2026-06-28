document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. МИНИМАЛИСТИЧНЫЙ КУРСОР-ТОЧКА
    // ==========================================
    const dot = document.querySelector(".custom-cursor-dot");

    if (dot && window.innerWidth > 768) {
        document.addEventListener("mousemove", (e) => {
            dot.style.opacity = "1";
            dot.style.left = `${e.clientX}px`;
            dot.style.top = `${e.clientY}px`;
        });
        document.addEventListener("mouseleave", () => {
            dot.style.opacity = "0";
        });
    }

    // ==========================================
    // 2. БЕЗОПАСНАЯ АНИМАЦИЯ СКРОЛЛА (REVEAL)
    // ==========================================
    const revealTargets = document.querySelectorAll(".scroll-reveal");
    
    revealTargets.forEach(target => target.classList.add("js-prep"));

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("scroll-reveal-active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });
    
    revealTargets.forEach(target => revealObserver.observe(target));

    // ==========================================
    // 3. ФИЛЬТРАЦИЯ КЕЙСОВ ПОРТФОЛИО
    // ==========================================
    const filterButtons = document.querySelectorAll(".filter-btn");
    const portfolioCards = document.querySelectorAll(".portfolio-item-card");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const filterValue = button.getAttribute("data-filter");
            portfolioCards.forEach(card => {
                const cat = card.getAttribute("data-category");
                if (filterValue === "all" || cat === filterValue) {
                    card.classList.remove("hide");
                } else {
                    card.classList.add("hide");
                }
            });
        });
    });

    // ==========================================
    // 4. ДИНАМИЧЕСКИЙ КАЛЬКУЛЯТОР ЦЕН И АНИМАЦИЯ
    // ==========================================
    const tiles = document.querySelectorAll(".selector-tile");
    const checkTg = document.getElementById("addon-tg");
    const checkAnim = document.getElementById("addon-anim");
    const priceDisplay = document.getElementById("live-price-display");
    const tgText = document.getElementById("tg-addon-price-text");
    const animText = document.getElementById("anim-addon-price-text");

    let currentType = "landing"; 
    let currentTypeName = "Лендинг / Промо";

    tiles.forEach(tile => {
        tile.addEventListener("click", (e) => {
            if (e.target.classList.contains("tile-example-link")) return;

            tiles.forEach(t => t.classList.remove("active"));
            tile.classList.add("active");
            
            currentType = tile.getAttribute("data-type");
            currentTypeName = tile.querySelector("h4").textContent;
            
            calculateTotal();
        });
    });

    if (checkTg) checkTg.addEventListener("change", calculateTotal);
    if (checkAnim) checkAnim.addEventListener("change", calculateTotal);

    function calculateTotal() {
        let basePrice = 750;
        
        if (currentType === "landing") {
            basePrice = 750;
            if (tgText) tgText.textContent = "+200 ₽";
            if (animText) animText.textContent = "+150 ₽";
            if (checkTg) checkTg.disabled = false;
            if (checkAnim) checkAnim.disabled = false;
            if (checkTg && checkTg.checked) basePrice += 200;
            if (checkAnim && checkAnim.checked) basePrice += 150;

        } else if (currentType === "store") {
            basePrice = 1250;
            if (tgText) tgText.textContent = "Включено";
            if (animText) animText.textContent = "Включено";
            if (checkTg) { checkTg.checked = true; checkTg.disabled = true; }
            if (checkAnim) { checkAnim.checked = true; checkAnim.disabled = true; }

        } else if (currentType === "service") {
            basePrice = 800;
            if (tgText) tgText.textContent = "+200 ₽";
            if (animText) animText.textContent = "+100 ₽";
            if (checkTg) checkTg.disabled = false;
            if (checkAnim) checkAnim.disabled = false;
            if (checkTg && checkTg.checked) basePrice += 200;
            if (checkAnim && checkAnim.checked) basePrice += 100;
        }
        
        if (priceDisplay) {
            priceDisplay.textContent = basePrice;
            const counterParent = priceDisplay.parentElement;
            counterParent.classList.remove("pulse-price");
            void counterParent.offsetWidth; 
            counterParent.classList.add("pulse-price");
        }
    }

    calculateTotal();

    // ==========================================
    // 5. ЗАЩИЩЕННАЯ ОТПРАВКА В TELEGRAM API
    // ==========================================
    const feedbackForm = document.getElementById("portfolio-interactive-form") || document.querySelector("form");
    const successUI = document.getElementById("form-success-state");
    const submitButton = document.getElementById("form-submit-trigger") || (feedbackForm ? feedbackForm.querySelector("button[type='submit']") : null);
    const spinner = submitButton ? submitButton.querySelector(".spinner") : null;
    const btnText = submitButton ? submitButton.querySelector(".btn-text") : null;

    // ФИКС: Гарантированно прячем окно успеха при загрузке страницы, используя рабочий класс .hidden
    if (successUI) {
        successUI.classList.add("hidden");
    }

    // Безопасное навешивание "input" для динамического снятия классов ошибок
    const setupInputReset = (id, selector) => {
        const el = document.getElementById(id) || (feedbackForm ? feedbackForm.querySelector(selector) : null);
        if (el) {
            el.addEventListener("input", () => {
                el.classList.remove("invalid");
                const errorLabel = el.parentElement ? el.parentElement.querySelector(".custom-error-label") : null;
                if (errorLabel) errorLabel.style.display = "none";
            });
        }
    };
    setupInputReset("client_name", "[name='name'], input[type='text']");
    setupInputReset("client_contact", "[name='contact'], input[type='tel']");

    if (feedbackForm) {
        feedbackForm.addEventListener("submit", async (e) => {
            e.preventDefault(); // Намертво блокируем обновление страницы

            const nameInput = document.getElementById("client_name") || feedbackForm.querySelector("[name='name']") || feedbackForm.querySelector("input[type='text']");
            const contactInput = document.getElementById("client_contact") || feedbackForm.querySelector("[name='contact']");
            const commentInput = document.getElementById("client_task") || feedbackForm.querySelector("textarea");

            let hasErrors = false;

            // Валидация поля Имени
            if (nameInput) {
                const value = nameInput.value.trim();
                const errorLabel = nameInput.parentElement ? nameInput.parentElement.querySelector(".custom-error-label") : null;
                if (value === "") {
                    hasErrors = true;
                    nameInput.classList.add("invalid");
                    if (errorLabel) {
                        errorLabel.textContent = "Пожалуйста, введите ваше имя";
                        errorLabel.style.display = "block";
                    }
                }
            }

            // Валидация поля Контакта
            if (contactInput) {
                const value = contactInput.value.trim();
                const errorLabel = contactInput.parentElement ? contactInput.parentElement.querySelector(".custom-error-label") : null;
                if (value === "") {
                    hasErrors = true;
                    contactInput.classList.add("invalid");
                    if (errorLabel) {
                        errorLabel.textContent = "Укажите контакт (Telegram или телефон) для связи";
                        errorLabel.style.display = "block";
                    }
                }
            }

            if (hasErrors) return;

            // Включаем лоадер на кнопке
            if (submitButton) {
                if (btnText) btnText.textContent = "Отправка спецификации ТЗ...";
                if (spinner) spinner.classList.remove("hidden");
                submitButton.style.pointerEvents = "none";
            }

            const clientNameVal = nameInput ? nameInput.value.trim() : "Не удалось определить";
            const clientContactVal = contactInput ? contactInput.value.trim() : "Не удалось определить";
            const clientCommentVal = commentInput ? commentInput.value.trim() : "Не указаны";
            const totalPriceVal = priceDisplay ? priceDisplay.textContent : "0";

            let options = [];
            if (currentType === "store") {
                options.push("Telegram API (Включено)", "UI-Анимации (Включено)");
            } else {
                if (checkTg && checkTg.checked) options.push("Telegram API");
                if (checkAnim && checkAnim.checked) options.push("UI-Анимации");
            }
            const optionsText = options.length > 0 ? options.join(", ") : "Нет";

            // Раскодирование токена бота
            const tokenCodes = [
                56, 54, 54, 49, 50, 56, 52, 49, 51, 54, 58, 65, 65, 71, 65, 120, 
                68, 110, 79, 78, 82, 57, 118, 49, 57, 106, 110, 66, 102, 80, 86, 
                114, 85, 73, 107, 117, 65, 71, 73, 66, 105, 84, 54, 71, 117, 107
            ];
            
            const BOT_TOKEN = String.fromCharCode(...tokenCodes);
            const CHAT_ID = "5415190532"; 

            const textMessage = `
📝 СФОРМИРОВАНО НОВОЕ ТЗ
──────────────────
👤 Имя клиента: ${clientNameVal}
📞 Связь: ${clientContactVal}

🖥️ Спецификация сайта: ${currentTypeName}
⚙️ Выбранные опции: ${optionsText}
💬 Пожелания: ${clientCommentVal}

💵 Итоговая стоимость: ${totalPriceVal} ₽
──────────────────
📊 Заявка собрана через форму на сайте.
            `.trim();

            try {
                const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: CHAT_ID,
                        text: textMessage
                    })
                });

                if (response.ok) {
                    // ФИКС: Красивая подмена формы на окно успеха с использованием реального класса .hidden
                    feedbackForm.style.opacity = "0";
                    setTimeout(() => {
                        feedbackForm.classList.add("hidden");
                        if (successUI) successUI.classList.remove("hidden");
                    }, 250);
                } else {
                    throw new Error(`Server status: ${response.status}`);
                }

            } catch (error) {
                console.error("Ошибка отправки в Telegram:", error);
                if (submitButton) {
                    if (btnText) btnText.textContent = "Ошибка сети. Повторить?";
                    if (spinner) spinner.classList.add("hidden");
                    submitButton.style.pointerEvents = "auto";
                }
            }
        });
    }
});
