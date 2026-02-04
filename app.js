// FitTrack Pro - Main JavaScript
// Common credentials
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = '123';

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('fittrack_logged_in');
    const currentPage = window.location.pathname;
    const protectedPages = ['dashboard.html', 'workouts.html', 'nutrition.html', 'goals.html'];

    if (protectedPages.some(page => currentPage.includes(page)) && !isLoggedIn) {
        window.location.href = 'index.html';
    }
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', function () {
    checkAuth();
    initCustomCursor();

    if (document.querySelector('.login-page')) {
        initLoginPage();
        initCursorReactiveBackground();
        initParallaxCard();
    } else if (document.querySelector('.dashboard-page')) {
        initDashboard();
        initInteractiveCards();
        initForms(); // Add this line
    }
});

// ... existing code ...


function initForms() {
    // Full Workout Form (workouts.html)
    const workoutForm = document.getElementById('fullWorkoutForm');
    if (workoutForm) {
        workoutForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');

            const type = document.getElementById('newWorkoutType').value;
            const duration = document.getElementById('workoutDuration').value;
            const calories = document.getElementById('workoutCalories').value;
            const date = 'Today'; // Simplification

            simulateSubmission(btn, () => {
                // Update List
                const list = document.getElementById('workoutHistoryList');
                if (list) {
                    const newItem = document.createElement('div');
                    newItem.className = 'workout-item';
                    newItem.style.animation = 'slideDown 0.3s ease-out';
                    newItem.innerHTML = `
                        <div class="workout-icon ${type}">
                            ${getWorkoutIcon(type)}
                        </div>
                        <div class="workout-details">
                            <h4 style="text-transform: capitalize;">${type}</h4>
                            <p>${date} • ${duration} min • ${calories} cal</p>
                        </div>
                    `;
                    list.insertBefore(newItem, list.firstChild);
                }

                // Update Stats
                updateStat('totalWorkouts', 1);
                updateStat('totalCalories', parseInt(calories));

                this.reset();
            });
        });
    }

    // Full Meal Form (nutrition.html)
    const mealForm = document.getElementById('fullMealForm');
    if (mealForm) {
        mealForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');

            const type = document.getElementById('nutritionMealType').value;
            const food = document.getElementById('nutritionFoodName').value;
            const calories = parseInt(document.getElementById('nutritionCalories').value);

            simulateSubmission(btn, () => {
                // Update List
                const list = document.getElementById('foodLogList');
                if (list) {
                    const newItem = document.createElement('div');
                    newItem.className = 'goal-item';
                    newItem.style.animation = 'slideDown 0.3s ease-out';
                    newItem.innerHTML = `
                        <div style="flex: 1;">
                            <strong style="text-transform: capitalize;">${type}</strong>
                            <span style="display:block; font-size:13px; color:var(--text-muted);">${food}</span>
                        </div>
                        <span>${calories} kcal</span>
                    `;
                    list.insertBefore(newItem, list.firstChild);
                }

                // Update Stats
                updateStat('consumedCalories', calories);
                // Update remaining (logic assumption: 2200 goal)
                const remainingStat = document.querySelector('.stat-card.workouts-card .stat-value');
                if (remainingStat) {
                    const current = parseInt(remainingStat.textContent.replace(/,/g, ''));
                    remainingStat.textContent = (current - calories).toLocaleString();
                }

                this.reset();
            });
        });
    }

    // New Goal Form (goals.html)
    const goalForm = document.getElementById('newGoalForm');
    if (goalForm) {
        goalForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');

            const type = document.getElementById('goalType').value;
            const target = document.getElementById('goalTarget').value;

            simulateSubmission(btn, () => {
                // Update List
                const list = document.getElementById('activeGoalsList');
                if (list) {
                    const newItem = document.createElement('div');
                    newItem.className = 'goal-item';
                    newItem.style.animation = 'slideDown 0.3s ease-out';
                    newItem.innerHTML = `
                        <span>${getGoalLabel(type)}: ${target}</span>
                        <div class="goal-progress">
                            <div style="width:0%"></div>
                        </div>
                        <span>0%</span>
                    `;
                    list.insertBefore(newItem, list.firstChild);
                }
                this.reset();
            });
        });
    }
}

// Helper Functions
function getWorkoutIcon(type) {
    const icons = {
        running: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
        cycling: '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-4 3 3h3"/>',
        strength: '<path d="M6.5 6.5L17.5 17.5M6.5 17.5L17.5 6.5M2 12h4M18 12h4M12 2v4M12 18v4"/>',
        yoga: '<circle cx="12" cy="5" r="3"/><path d="M12 8v8M8 16l4 4 4-4"/>',
        default: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>'
    };
    const path = icons[type] || icons.default;
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${path}</svg>`;
}

function getGoalLabel(type) {
    const labels = {
        weight: 'Lose Weight',
        running: 'Run Distance',
        workouts: 'Complete Workouts',
        water: 'Drink Water'
    };
    return labels[type] || 'Goal';
}

function updateStat(id, addValue) {
    const el = document.getElementById(id);
    if (el) {
        const current = parseInt(el.textContent.replace(/,/g, ''));
        el.textContent = (current + addValue).toLocaleString();
    }
}

function simulateSubmission(btn, callback) {
    const originalText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    setTimeout(() => {
        btn.textContent = 'Saved! ✓';
        btn.style.background = '#10b981';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
            callback();
        }, 500);
    }, 800);
}

// Custom Cursor
function initCustomCursor() {
    // Create custom cursor elements
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    const cursorTrail = document.createElement('div');
    cursorTrail.className = 'cursor-trail';

    document.body.appendChild(cursor);
    document.body.appendChild(cursorTrail);

    let mouseX = 0, mouseY = 0;
    let trailX = 0, trailY = 0;

    // Update cursor position
    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    // Smooth trail following
    function animateTrail() {
        trailX += (mouseX - trailX) * 0.15;
        trailY += (mouseY - trailY) * 0.15;

        cursorTrail.style.left = (trailX - 20) + 'px';
        cursorTrail.style.top = (trailY - 20) + 'px';

        requestAnimationFrame(animateTrail);
    }
    animateTrail();

    // Hover effects
    const hoverElements = 'button, a, input, .stat-card, .workout-item, .action-btn, .nav-item';
    document.addEventListener('mouseover', function (e) {
        if (e.target.closest(hoverElements)) {
            cursor.classList.add('hover');
        }
    });

    document.addEventListener('mouseout', function (e) {
        if (e.target.closest(hoverElements)) {
            cursor.classList.remove('hover');
        }
    });
}

// Cursor-Reactive Background for Login Page
function initCursorReactiveBackground() {
    const orbs = document.querySelectorAll('.gradient-orb');

    document.addEventListener('mousemove', function (e) {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 20;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;

            if (index === 0) {
                orb.style.transform = `translate(${x}px, ${y}px)`;
            } else if (index === 1) {
                orb.style.transform = `translate(${-x}px, ${-y}px)`;
            } else {
                orb.style.transform = `translate(${x}px, ${-y}px) translate(-50%, -50%)`;
            }
        });
    });
}

// Parallax Card Effect on Login Page
function initParallaxCard() {
    const card = document.querySelector('.login-card');
    if (!card) return;

    card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });

    card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
}

// Login Page Functions
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = document.getElementById('loginBtn');

    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            const eyeOpen = this.querySelector('.eye-open');
            const eyeClosed = this.querySelector('.eye-closed');

            if (eyeOpen && eyeClosed) {
                if (type === 'password') {
                    eyeOpen.style.display = 'block';
                    eyeClosed.style.display = 'none';
                } else {
                    eyeOpen.style.display = 'none';
                    eyeClosed.style.display = 'block';
                }
            }
        });
    }

    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            // Hide previous error
            if (errorMessage) {
                errorMessage.classList.remove('show');
            }

            // Add loading state
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;

            // Simulate login delay
            setTimeout(function () {
                if (username === VALID_USERNAME && password === VALID_PASSWORD) {
                    // Successful login
                    sessionStorage.setItem('fittrack_logged_in', 'true');
                    sessionStorage.setItem('fittrack_user', username);

                    // Add success animation
                    loginBtn.classList.remove('loading');
                    loginBtn.innerHTML = '<span class="btn-text">Success! ✓</span>';
                    loginBtn.style.background = 'linear-gradient(135deg, #10b981, #06b6d4)';

                    // Redirect to dashboard
                    setTimeout(function () {
                        window.location.href = 'dashboard.html';
                    }, 800);
                } else {
                    // Failed login
                    loginBtn.classList.remove('loading');
                    loginBtn.disabled = false;

                    if (errorMessage) {
                        errorMessage.classList.add('show');
                    }

                    // Shake inputs
                    usernameInput.style.animation = 'shake 0.4s';
                    passwordInput.style.animation = 'shake 0.4s';

                    setTimeout(function () {
                        usernameInput.style.animation = '';
                        passwordInput.style.animation = '';
                    }, 400);
                }
            }, 1500);
        });
    }

    // Clear error on input
    [usernameInput, passwordInput].forEach(function (input) {
        if (input) {
            input.addEventListener('input', function () {
                if (errorMessage) {
                    errorMessage.classList.remove('show');
                }
            });
        }
    });
}

// Dashboard Functions
function initDashboard() {
    // Set current date
    const currentDate = document.getElementById('currentDate');
    if (currentDate) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDate.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // Set username
    const userName = document.getElementById('userName');
    const savedUser = sessionStorage.getItem('fittrack_user');
    if (userName && savedUser) {
        userName.textContent = savedUser.charAt(0).toUpperCase() + savedUser.slice(1);
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            sessionStorage.removeItem('fittrack_logged_in');
            sessionStorage.removeItem('fittrack_user');
            window.location.href = 'index.html';
        });
    }

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function () {
            sidebar.classList.toggle('open');
        });
    }

    // Nav item clicks
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(function (item) {
        item.addEventListener('click', function (e) {
            // Only prevent default if it's an anchor link on the same page
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                navItems.forEach(function (nav) { nav.classList.remove('active'); });
                this.classList.add('active');
            }
            // For real page links, let the browser handle navigation

            // Close mobile menu
            if (sidebar) {
                sidebar.classList.remove('open');
            }
        });
    });

    // Initialize Modals
    initModals();

    // Animate stats on load
    animateStats();

    // Animate chart bars
    animateChartBars();
}

function animateStats() {
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(function (stat) {
        const finalValue = stat.textContent;
        const isNumber = /^[\d,]+$/.test(finalValue.replace(/,/g, ''));

        if (isNumber) {
            const numValue = parseInt(finalValue.replace(/,/g, ''));
            let current = 0;
            const increment = numValue / 30;
            const timer = setInterval(function () {
                current += increment;
                if (current >= numValue) {
                    current = numValue;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(current).toLocaleString();
            }, 50);
        }
    });
}

function animateChartBars() {
    const bars = document.querySelectorAll('.bar-fill');
    bars.forEach(function (bar, index) {
        const height = bar.parentElement.style.getPropertyValue('--height');
        bar.style.height = '0';
        setTimeout(function () {
            bar.style.height = height;
        }, index * 100);
    });
}

// Interactive Cards with Magnetic Effect
function initInteractiveCards() {
    const statCards = document.querySelectorAll('.stat-card');
    const chartCards = document.querySelectorAll('.chart-card');
    const workoutItems = document.querySelectorAll('.workout-item');

    // 3D tilt effect for stat cards
    statCards.forEach(card => {
        card.addEventListener('mousemove', function (e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;

            card.style.transform = `translateY(-8px) translateZ(20px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', function () {
            card.style.transform = '';
        });
    });

    // Hover effects for chart cards
    chartCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-4px) scale(1.01)';
            this.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });

    // Workout items hover effect
    workoutItems.forEach(item => {
        item.addEventListener('mouseenter', function () {
            this.style.transform = 'translateX(8px) scale(1.02)';
        });

        item.addEventListener('mouseleave', function () {
            this.style.transform = '';
        });
    });

    // Water glass click animation
    const waterGlasses = document.querySelectorAll('.water-glass');
    waterGlasses.forEach((glass, index) => {
        glass.addEventListener('click', function () {
            if (!this.classList.contains('filled')) {
                this.classList.add('filled');
                this.style.animation = 'bounce 0.5s ease';
                setTimeout(() => {
                    this.style.animation = '';
                }, 500);
            } else {
                this.classList.remove('filled');
            }
        });
    });
}

// Modal Functions
function initModals() {
    const modals = {
        'startWorkoutBtn': 'workoutModal',
        'logMealBtn': 'mealModal',
        'logWeightBtn': 'weightModal'
    };

    // Open Modals
    Object.keys(modals).forEach(btnId => {
        const btn = document.getElementById(btnId);
        const modalId = modals[btnId];
        const modal = document.getElementById(modalId);

        if (btn && modal) {
            btn.addEventListener('click', () => {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        }
    });

    // Close Modals (X button and Cancel button)
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    // Close on click outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Handle Forms
    const forms = ['workoutForm', 'mealForm', 'weightForm'];
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                // Simulate processing
                const btn = form.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                btn.textContent = 'Saving...';
                btn.disabled = true;

                setTimeout(() => {
                    btn.textContent = 'Saved! ✓';
                    btn.style.background = '#10b981';

                    setTimeout(() => {
                        const modal = form.closest('.modal');
                        closeModal(modal);

                        // Reset button
                        setTimeout(() => {
                            btn.textContent = originalText;
                            btn.style.background = '';
                            btn.disabled = false;
                            form.reset();

                            // Show toast/notification
                            alert('Entry saved successfully! 🎉');
                        }, 300);

                        // Update stats logic (simulation)
                        updateDashboardStats(formId);
                    }, 800);
                }, 1000);
            });
        }
    });

    // Water Button Logic
    const addWaterBtn = document.getElementById('addWaterBtn');
    if (addWaterBtn) {
        addWaterBtn.addEventListener('click', () => {
            const waterFill = document.querySelector('.water-fill');
            const waterInfo = document.querySelector('.water-info');

            if (waterFill && waterInfo) {
                const currentWidth = parseFloat(waterFill.style.width) || 0;
                if (currentWidth < 100) {
                    const newWidth = Math.min(currentWidth + 12.5, 100);
                    waterFill.style.width = newWidth + '%';

                    const glasses = Math.round(newWidth / 12.5);
                    waterInfo.textContent = `${glasses} of 8 glasses (${(glasses * 0.25).toFixed(2)}L / 2L)`;

                    // Animate button
                    addWaterBtn.classList.add('active');
                    setTimeout(() => addWaterBtn.classList.remove('active'), 200);
                } else {
                    alert('Daily water goal reached! 💧');
                }
            }
        });
    }
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}


function updateDashboardStats(formId) {
    // Simulate updating stats based on form submission
    if (formId === 'workoutForm') {
        const workoutsVal = document.getElementById('workoutsValue');
        if (workoutsVal) {
            workoutsVal.textContent = parseInt(workoutsVal.textContent) + 1;
        }

        const activeMin = document.getElementById('activeMinutes');
        const durationInput = document.getElementById('duration');
        if (activeMin && durationInput) {
            activeMin.textContent = parseInt(activeMin.textContent) + parseInt(durationInput.value);
        }

        // Add to Recent Workouts List on Dashboard
        const list = document.querySelector('.chart-card .workouts-list');
        const typeSelect = document.getElementById('workoutType');
        if (list && typeSelect && durationInput) {
            const type = typeSelect.value;
            const newItem = document.createElement('div');
            newItem.className = 'workout-item';
            newItem.style.animation = 'slideDown 0.3s ease-out';
            newItem.innerHTML = `
                <div class="workout-icon ${type}">
                    ${getWorkoutIcon(type)}
                </div>
                <div class="workout-details">
                    <h4 style="text-transform: capitalize;">${type}</h4>
                    <p>Just now • ${durationInput.value} min • -- cal</p>
                </div>
            `;
            list.insertBefore(newItem, list.firstChild);
        }

    } else if (formId === 'mealForm') {
        const caloriesVal = document.getElementById('caloriesValue');
        const caloriesInput = document.getElementById('calories');
        if (caloriesVal && caloriesInput) {
            const current = parseInt(caloriesVal.textContent.replace(/,/g, ''));
            caloriesVal.textContent = (current + parseInt(caloriesInput.value)).toLocaleString();
        }
    }
}
