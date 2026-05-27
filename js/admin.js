// Admin.js — Ali Coffee Admin Panel

const orderItems = [];
let activeItemModal = null;

window.initAdminPanel = initAdminPanel;
window.loadAdminSection = loadAdminSection;
window.loadDashboard = loadDashboard;
window.editItem = editItem;
window.deleteItem = deleteItem;
window.saveItem = saveItem;
window.loadCashier = loadCashier;
window.loadSettings = loadSettings;
window.handleLogout = handleLogout;

document.addEventListener('DOMContentLoaded', function () {
    const LOGO_HINTS = [
        'assets/ali-cafe-logo-circular.png',
        'images/ali-cafe-logo-circular.png',
    ];
    let logoTry = 0;
    window.fallbackLogo = function (img) {
        if (!img || !(img instanceof HTMLImageElement)) return;
        img.addEventListener('error', function () {
            img.style.display = 'none';
            var fallback = document.createElement('div');
            fallback.className = 'logo-fallback-initials';
            fallback.textContent = 'AC';
            fallback.style.cssText = 'width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:serif;font-size:1.25rem;font-weight:700;color:#D4AF37;background:#1a1a1a;flex-shrink:0;';
            if (img.parentNode) img.parentNode.insertBefore(fallback, img);
        });
    };
    document.querySelectorAll('img.sidebar-brand-icon, img.logo').forEach(window.fallbackLogo);

    initAdminPanel();
    wireAdminLangButtons();
    initSidebar();

    if (window.auth) {
        auth.onAuthStateChanged(function (user) {
            if (!user) {
                window.location.href = 'login.html';
            }
        });
    }
});

function wireAdminLangButtons() {
    var lang = localStorage.getItem('selectedLang') || 'ku';
    document.documentElement.dir = (lang === 'ar' || lang === 'ku') ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.querySelectorAll('.admin-lang-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        btn.addEventListener('click', function () {
            var l = this.getAttribute('data-lang');
            localStorage.setItem('selectedLang', l);
            document.querySelectorAll('.admin-lang-btn').forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            document.documentElement.dir = (l === 'ar' || l === 'ku') ? 'rtl' : 'ltr';
            document.documentElement.lang = l;
            if (window.applyLanguageUI) applyLanguageUI(l);
        });
    });
}

function initSidebar() {
    var sidebar = document.getElementById('adminSidebar');
    var hamburger = document.getElementById('sidebarHamburger');
    var closeBtn = document.getElementById('sidebarClose');
    var overlay = document.getElementById('sidebarOverlay');

    if (!sidebar) return;

    function openSidebar() {
        sidebar.classList.add('open');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', function (e) {
            e.stopPropagation();
            openSidebar();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            closeSidebar();
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function () {
            closeSidebar();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
}

function initAdminPanel() {
    var navButtons = document.querySelectorAll('.admin-nav-btn');
    navButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            navButtons.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            var section = this.getAttribute('data-section');
            loadAdminSection(section);
            var headerTitle = document.querySelector('.admin-header h1');
            if (headerTitle) {
                var label = this.querySelector('span:last-child');
                headerTitle.textContent = label ? label.textContent.trim() : this.textContent.trim();
            }
            var sidebar = document.getElementById('adminSidebar');
            var overlay = document.getElementById('sidebarOverlay');
            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    var defaultBtn = document.querySelector('.admin-nav-btn.active');
    if (defaultBtn) {
        loadAdminSection(defaultBtn.getAttribute('data-section'));
    }
}

function loadAdminSection(section) {
    var S = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;
    var adminContent = document.getElementById('adminContent');
    if (!adminContent) return;
    adminContent.innerHTML = '<div class="loading">' + S.loading + '</div>';

    try {
        if (section === 'dashboard') { loadDashboard(); }
        else if (section === 'items') { loadManageItems(); }
        else if (section === 'categories') { loadManageCategories(); }
        else if (section === 'reports') { loadSalesReports(); }
        else if (section === 'cashier') { loadCashier(); }
        else if (section === 'settings') { loadSettings(); }
        else if (section === 'logout') { handleLogout(); }
        else { adminContent.innerHTML = '<p>' + S.sectionNotFound + '</p>'; }
    } catch (error) {
        console.error(S.errorLoadingSection + section + ':', error);
        adminContent.innerHTML = '<p style="color:#C62828;padding:20px;">' + S.errorPrefix + error.message + '</p>';
    }
}

function toDisplayTime(ts) {
    if (!ts) return '\u2014';
    if (typeof ts.toDate === 'function') return ts.toDate().toLocaleTimeString();
    if (ts.seconds != null) return new Date(ts.seconds * 1000).toLocaleTimeString();
    if (ts._seconds != null) return new Date(ts._seconds * 1000).toLocaleTimeString();
    return String(ts);
}

/* ============ DASHBOARD ============ */

function getMonthName(monthIndex, strings) {
    var keys = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    return (monthIndex + 1) + ' — ' + (strings[keys[monthIndex]] || (monthIndex + 1));
}

function loadDashboard() {
    var S = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;
    var adminContent = document.getElementById('adminContent');
    var now = new Date();
    var currentMonth = now.getMonth();
    var monthsHtml = '';
    var mNames = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    for (var m = 0; m < 12; m++) {
        monthsHtml += '<option value="' + m + '"' + (m === currentMonth ? ' selected' : '') + '>' + (m + 1) + ' — ' + S[mNames[m]] + ' ' + now.getFullYear() + '</option>';
    }
    adminContent.innerHTML =
        '<div class="month-selector">' +
            '<label>' + S.selectMonth + '</label>' +
            '<select id="dashboardMonthSelect">' + monthsHtml + '</select>' +
        '</div>' +
        '<div class="admin-stats">' +
            '<div class="stat-card"><h3>' + S.todaySales + '</h3><div class="stat-value" id="todaySales">0 IQD</div></div>' +
            '<div class="stat-card"><h3>' + S.monthlySales + '</h3><div class="stat-value" id="monthlySales">0 IQD</div></div>' +
            '<div class="stat-card"><h3>' + S.totalOrders + '</h3><div class="stat-value" id="totalOrders">0</div></div>' +
            '<div class="stat-card"><h3>' + S.bestSelling + '</h3><div class="stat-value" id="bestSelling">-</div></div>' +
        '</div>' +
        '<div class="card">' +
            '<h2>' + S.dailySales + ' — <span id="dailySalesMonthLabel"></span></h2>' +
            '<div id="dailySalesContainer"><div class="loading">Loading...</div></div>' +
        '</div>' +
        '<div class="card" style="margin-top:20px;">' +
            '<h2>' + S.recentSales + '</h2>' +
            '<div id="recentSalesContainer"><div class="loading">Loading...</div></div>' +
        '</div>';
    var monthSelect = document.getElementById('dashboardMonthSelect');
    if (monthSelect) {
        monthSelect.addEventListener('change', function () {
            loadDashboardStats(parseInt(this.value, 10));
        });
    }
    loadDashboardStats(currentMonth);
    loadRecentSales();
}

function loadDashboardStats(month) {
    if (month === undefined || month === null) month = new Date().getMonth();
    var year = new Date().getFullYear();
    var S = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    var mStart = new Date(year, month, 1);
    var mEnd = new Date(year, month + 1, 1);

    document.getElementById('dailySalesMonthLabel').textContent = getMonthName(month, S);

    db.collection('sales').where('timestamp', '>=', today).where('timestamp', '<', tomorrow).get().then(function (snap) {
        var total = 0;
        snap.forEach(function (d) { total += (d.data().total || 0); });
        var el = document.getElementById('todaySales');
        if (el) el.textContent = total.toLocaleString() + ' IQD';
    }).catch(function () {});

    var monthlyTotal = 0;
    var orderCount = 0;
    var dayTotals = {};
    var itemCounts = {};

    db.collection('sales').where('timestamp', '>=', mStart).where('timestamp', '<', mEnd).get().then(function (snap) {
        snap.forEach(function (d) {
            var sale = d.data();
            monthlyTotal += (sale.total || 0);
            orderCount++;
            var ts = sale.timestamp;
            var saleDate;
            if (ts && typeof ts.toDate === 'function') saleDate = ts.toDate();
            else if (ts && ts.seconds) saleDate = new Date(ts.seconds * 1000);
            else saleDate = new Date(ts);
            var dayKey = saleDate.getDate();
            dayTotals[dayKey] = (dayTotals[dayKey] || 0) + (sale.total || 0);
            if (sale.items) {
                sale.items.forEach(function (it) {
                    var itemName = it.name || it['name_' + (localStorage.getItem('selectedLang') || 'ku')] || it.name_en || '—';
                    var qty = it.quantity || 1;
                    if (!itemCounts[itemName]) itemCounts[itemName] = 0;
                    itemCounts[itemName] += qty;
                });
            }
        });
        var elM = document.getElementById('monthlySales');
        if (elM) elM.textContent = monthlyTotal.toLocaleString() + ' IQD';
        var elO = document.getElementById('totalOrders');
        if (elO) elO.textContent = orderCount.toString();

        var bestName = '-';
        var bestQty = 0;
        Object.keys(itemCounts).forEach(function (name) {
            if (itemCounts[name] > bestQty) { bestQty = itemCounts[name]; bestName = name; }
        });
        var elB = document.getElementById('bestSelling');
        if (elB) {
            if (bestQty > 0) {
                elB.innerHTML = '<span class="best-item-name">' + bestName + '</span> <span class="best-item-qty">(' + bestQty + ' ' + S.sold + ')</span>';
            } else {
                elB.textContent = '-';
            }
        }

        var daysInM = new Date(year, month + 1, 0).getDate();
        var html = '<table class="daily-sales-table"><thead><tr><th>Day</th><th>' + S.total + ' (IQD)</th></tr></thead><tbody>';
        for (var d = 1; d <= daysInM; d++) {
            var dTotal = dayTotals[d] || 0;
            var cls = dTotal > 0 ? 'day-sales' : 'day-sales zero';
            var isToday = (d === today.getDate() && month === today.getMonth());
            html += '<tr' + (isToday ? ' style="background:rgba(212,175,55,0.06);"' : '') + '><td>' + (isToday ? '<strong style="color:var(--gold);">' + d + ' ★</strong>' : d) + '</td><td class="' + cls + '">' + dTotal.toLocaleString() + ' IQD</td></tr>';
        }
        html += '</tbody></table>';
        var container = document.getElementById('dailySalesContainer');
        if (container) container.innerHTML = html;
    }).catch(function () {
        var elM = document.getElementById('monthlySales');
        if (elM) elM.textContent = '0 IQD';
        var elO = document.getElementById('totalOrders');
        if (elO) elO.textContent = '0';
        var elB = document.getElementById('bestSelling');
        if (elB) elB.textContent = '-';
        var container = document.getElementById('dailySalesContainer');
        if (container) container.innerHTML = '';
    });
}

function loadRecentSales() {
    var S = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;
    var container = document.getElementById('recentSalesContainer');
    if (!container) return;

    db.collection('sales').orderBy('timestamp', 'desc').limit(5).get().then(function (snap) {
        if (snap.empty) {
            container.innerHTML = '<p style="color:#888;padding:16px;">' + S.noSalesYet + '</p>';
            return;
        }
        var html = '<div class="table-responsive"><table class="admin-table"><thead><tr><th>' + S.time + '</th><th>' + S.items + '</th><th>' + S.total + ' (IQD)</th></tr></thead><tbody>';
        snap.forEach(function (doc) {
            var sale = doc.data();
            var cnt = sale.items ? sale.items.reduce(function (s, i) { return s + (i.quantity || 1); }, 0) : 0;
            html += '<tr><td>' + toDisplayTime(sale.timestamp) + '</td><td>' + cnt + S.itemsCount + '</td><td>' + (sale.total || 0) + ' IQD</td></tr>';
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }).catch(function () {
        container.innerHTML = '<p style="color:#888;padding:16px;">' + S.noSalesData + '</p>';
    });
}

/* ============ MANAGE ITEMS ============ */

function loadManageItems() {
    var S = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;
    var adminContent = document.getElementById('adminContent');
    adminContent.innerHTML =
        '<div class="card">' +
            '<h2>' + S.manageItems + '</h2>' +
            '<button class="btn-primary" id="addItemBtn" style="margin-bottom:16px;">' + S.addNewItem + '</button>' +
            '<div class="form-group"><input type="text" id="itemSearch" placeholder="' + S.searchItems + '"></div>' +
            '<div class="form-group"><select id="categoryFilter"><option value="all">' + S.allCategories + '</option></select></div>' +
            '<div id="itemsList"><div class="loading">Loading...</div></div>' +
        '</div>' +
        '<div id="itemModal" class="modal-overlay">' +
            '<div class="modal">' +
                '<div class="modal-content">' +
                    '<span class="modal-close" id="modalClose">&times;</span>' +
                    '<h2 id="modalTitle">' + S.addNewItem + '</h2>' +
                    '<form id="itemForm">' +
                        '<div class="form-group"><label>' + S.kurdishName + '</label><input type="text" id="itemNameKu" required></div>' +
                        '<div class="form-group"><label>' + S.arabicName + '</label><input type="text" id="itemNameAr" required></div>' +
                        '<div class="form-group"><label>' + S.englishName + '</label><input type="text" id="itemNameEn" required></div>' +
                        '<div class="form-group"><label>' + S.kurdishDesc + '</label><textarea id="itemDescKu" rows="2"></textarea></div>' +
                        '<div class="form-group"><label>' + S.arabicDesc + '</label><textarea id="itemDescAr" rows="2"></textarea></div>' +
                        '<div class="form-group"><label>' + S.englishDesc + '</label><textarea id="itemDescEn" rows="2"></textarea></div>' +
                        '<div class="form-group"><label>' + S.imageURL + '</label><input type="url" id="itemImageURL" placeholder="https://..."><img id="itemImagePreview" style="display:none;margin-top:8px;max-height:120px;border-radius:8px;"></div>' +
                        '<div class="form-group"><label>' + S.price + '</label><input type="number" id="itemPrice" min="0" required></div>' +
                        '<div class="form-group"><label>' + S.category + '</label><select id="itemCategory" required>' +
                            '<option value="">' + S.select + '</option>' +
                            '<option value="Coffee">' + (S.coffee || 'Coffee') + '</option>' +
                            '<option value="Tea">' + (S.tea || 'Tea') + '</option>' +
                            '<option value="Cold Drinks">' + (S.coldDrinks || 'Cold Drinks') + '</option>' +
                            '<option value="Dessert">' + (S.dessert || 'Dessert') + '</option>' +
                            '<option value="Shisha">' + (S.shisha || 'Shisha') + '</option>' +
                            '<option value="Special Drinks">' + (S.specialDrinks || 'Special Drinks') + '</option>' +
                        '</select></div>' +
                        '<div class="form-group"><label><input type="checkbox" id="itemAvailable" checked> ' + S.available + '</label></div>' +
                        '<button type="submit" class="btn-primary">' + S.saveItem + '</button>' +
                        '<button type="button" class="btn-secondary" id="cancelItemBtn" style="margin-left:8px;">' + S.cancel + '</button>' +
                        '<input type="hidden" id="itemId" value="">' +
                    '</form>' +
                '</div>' +
            '</div>' +
        '</div>';
    loadItemsList();
    wireItemEvents();
}

function loadItemsList() {
     var S = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;
     var catMap = {Coffee: S.coffee, Tea: S.tea, 'Cold Drinks': S.coldDrinks, Dessert: S.dessert, Shisha: S.shisha, 'Special Drinks': S.specialDrinks};
     db.collection('menuItems').get().then(function (snap) {
         var cats = new Set();
         var docs = [];
         snap.forEach(function (d) { var data = d.data(); if (data.category && data.category !== 'Water') { cats.add(data.category); docs.push(d); } });
         var cf = document.getElementById('categoryFilter');
         if (cf) {
             cf.innerHTML = '<option value="all">' + S.allCategories + '</option>';
             cats.forEach(function (c) { cf.innerHTML += '<option value="' + c + '">' + (catMap[c] || c) + '</option>'; });
         }
         renderItemsList(docs);
    }).catch(function (e) {
        var el = document.getElementById('itemsList');
         if (el) el.innerHTML = '<p style="color:#C62828;">' + S.errorPrefix + e.message + '</p>';
    });
}

function renderItemsList(items) {
    var S = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;
    var list = document.getElementById('itemsList');
    if (!list) return;
    if (items.length === 0) { list.innerHTML = '<p>' + S.noItemsFound + '</p>'; return; }

    var lang = localStorage.getItem('selectedLang') || 'ku';
    var catMap = {Coffee: S.coffee, Tea: S.tea, 'Cold Drinks': S.coldDrinks, Dessert: S.dessert, Shisha: S.shisha, 'Special Drinks': S.specialDrinks};
    var html = '<div class="table-responsive"><table class="admin-table"><thead><tr><th>Image</th><th>Name</th><th>' + S.category + '</th><th>' + S.price + '</th><th>' + S.available + '</th><th>Actions</th></tr></thead><tbody>';
    items.forEach(function (doc) {
        var item = doc.data();
        var name = item['name_' + lang] || item.name_en || S.unnamed;
        var img = item.image || 'https://placehold.co/50x50?text=No+Image';
        var avail = item.available ? '<span style="color:#2E7D32;">' + S.yes + '</span>' : '<span style="color:#C62828;">' + S.no + '</span>';
        var catName = catMap[item.category] || item.category || '-';
        html += '<tr>' +
            '<td><img src="' + img + '" alt="' + name + '" width="48" height="48"></td>' +
            '<td>' + name + '</td>' +
            '<td>' + catName + '</td>' +
            '<td>' + (item.price || 0) + ' IQD</td>' +
            '<td>' + avail + '</td>' +
            '<td><button class="btn-primary btn-sm edit-item" data-id="' + doc.id + '">' + S.edit + '</button> ' +
            '<button class="btn-danger btn-sm delete-item" data-id="' + doc.id + '">' + S.delete + '</button></td>' +
        '</tr>';
    });
    html += '</tbody></table></div>';
    list.innerHTML = html;

    list.querySelectorAll('.edit-item').forEach(function (btn) {
        btn.addEventListener('click', function () { editItem(this.getAttribute('data-id')); });
    });
    list.querySelectorAll('.delete-item').forEach(function (btn) {
        btn.addEventListener('click', function () { deleteItem(this.getAttribute('data-id')); });
    });
}

function wireItemEvents() {
    var S = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;
    var addBtn = document.getElementById('addItemBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function () {
            document.getElementById('modalTitle').textContent = S.addNewItem;
            document.getElementById('itemForm').reset();
            document.getElementById('itemId').value = '';
            document.getElementById('itemAvailable').checked = true;
            var pr = document.getElementById('itemImagePreview');
            if (pr) pr.style.display = 'none';
            var modal = document.getElementById('itemModal');
            modal.classList.add('active');
            activeItemModal = modal;
        });
    }

    var closeBtn = document.getElementById('modalClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            document.getElementById('itemModal').classList.remove('active');
            activeItemModal = null;
        });
    }

    var cancelBtn = document.getElementById('cancelItemBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            document.getElementById('itemModal').classList.remove('active');
            activeItemModal = null;
        });
    }

    var form = document.getElementById('itemForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            saveItem();
        });
    }

    var imgInput = document.getElementById('itemImageURL');
    if (imgInput) {
        imgInput.addEventListener('input', function () {
            var pr = document.getElementById('itemImagePreview');
            if (!pr) return;
            var url = this.value.trim();
            if (url) { pr.src = url; pr.style.display = 'block'; }
            else { pr.style.display = 'none'; }
        });
    }

    var search = document.getElementById('itemSearch');
    var catFilter = document.getElementById('categoryFilter');
    if (search) {
        search.addEventListener('input', function () {
            applyItemFilter(search.value, catFilter ? catFilter.value : 'all');
        });
    }
    if (catFilter) {
        catFilter.addEventListener('change', function () {
            applyItemFilter(search ? search.value : '', catFilter.value);
        });
    }
}

function applyItemFilter(searchTerm, cat) {
    db.collection('menuItems').get().then(function (snap) {
        var docs = snap.docs;
        if (searchTerm) {
            var lang = localStorage.getItem('selectedLang') || 'ku';
            var term = searchTerm.toLowerCase();
            docs = docs.filter(function (d) {
                var item = d.data();
                var name = (item['name_' + lang] || item.name_en || '').toLowerCase();
                return name.indexOf(term) !== -1;
            });
        }
        if (cat && cat !== 'all') {
            docs = docs.filter(function (d) { return d.data().category === cat; });
        }
        renderItemsList(docs);
    });
}

function saveItem() {
     var S = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;
     var nameKu = document.getElementById('itemNameKu').value.trim();
    var nameAr = document.getElementById('itemNameAr').value.trim();
    var nameEn = document.getElementById('itemNameEn').value.trim();
    var price = document.getElementById('itemPrice').value.trim();
    var category = document.getElementById('itemCategory').value;

    if (!nameKu || !nameAr || !nameEn || !price || !category) {
        alert(S.fillAll);
        return;
    }

    var imgUrl = document.getElementById('itemImageURL').value.trim();
    var placeholderImg = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect fill=%23e0e0e0 width=%27400%27 height=%27300%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 font-size=%2724%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%23999%27%3ENo+Image%3C/text%3E%3C/svg%3E';
    var finalImg = imgUrl || placeholderImg;

    var itemId = document.getElementById('itemId').value;
    var itemData = {
        name_ku: nameKu, name_ar: nameAr, name_en: nameEn,
        description_ku: document.getElementById('itemDescKu').value.trim(),
        description_ar: document.getElementById('itemDescAr').value.trim(),
        description_en: document.getElementById('itemDescEn').value.trim(),
        price: parseFloat(price) || 0,
        category: category,
        image: finalImg,
        available: document.getElementById('itemAvailable').checked,
        updated_at: firebase.firestore.FieldValue.serverTimestamp()
    };

    var promise;
    if (itemId) {
        promise = db.collection('menuItems').doc(itemId).update(itemData);
    } else {
        itemData.created_at = firebase.firestore.FieldValue.serverTimestamp();
        promise = db.collection('menuItems').add(itemData);
    }

    promise.then(function () {
        document.getElementById('itemModal').classList.remove('active');
        activeItemModal = null;
        loadItemsList();
        alert(S.itemSaved);
    }).catch(function (e) {
        alert(S.itemError + e.message);
    });
}

function editItem(itemId) {
    var S = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;
    db.collection('menuItems').doc(itemId).get().then(function (doc) {
        if (!doc.exists) { alert(S.noItemsFound); return; }
        var item = doc.data();
        document.getElementById('itemId').value = itemId;
        document.getElementById('itemNameKu').value = item.name_ku || '';
        document.getElementById('itemNameAr').value = item.name_ar || '';
        document.getElementById('itemNameEn').value = item.name_en || '';
        document.getElementById('itemDescKu').value = item.description_ku || '';
        document.getElementById('itemDescAr').value = item.description_ar || '';
        document.getElementById('itemDescEn').value = item.description_en || '';
        document.getElementById('itemPrice').value = item.price || '';
        document.getElementById('itemCategory').value = item.category || '';
        document.getElementById('itemAvailable').checked = item.available !== false;
        if (item.image) {
            document.getElementById('itemImageURL').value = item.image;
            var pr = document.getElementById('itemImagePreview');
            if (pr) { pr.src = item.image; pr.style.display = 'block'; }
        }
        document.getElementById('modalTitle').textContent = S.editItem;
        var modal = document.getElementById('itemModal');
        modal.classList.add('active');
        activeItemModal = modal;
    }).catch(function (e) { alert(S.errorPrefix + e.message); });
}

function deleteItem(itemId) {
    var S = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;
    if (!confirm(S.deleteConfirm)) return;
    db.collection('menuItems').doc(itemId).delete().then(function () {
        loadItemsList();
    }).catch(function (e) { alert(S.errorPrefix + e.message); });
}

/* ============ CATEGORIES ============ */

function loadManageCategories() {
    var S = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;
    var adminContent = document.getElementById('adminContent');
    var cats = [
        {key: 'coffee', val: 'Coffee'},
        {key: 'tea', val: 'Tea'},
        {key: 'coldDrinks', val: 'Cold Drinks'},
        {key: 'dessert', val: 'Dessert'},
        {key: 'shisha', val: 'Shisha'},
        {key: 'specialDrinks', val: 'Special Drinks'}
    ];
    var catHtml = '';
    cats.forEach(function (c) { catHtml += '<li>' + (S[c.key] || c.val) + '</li>'; });
    adminContent.innerHTML =
        '<div class="card">' +
            '<h2>' + S.manageCategories + '</h2>' +
            '<p style="color:var(--text-secondary);margin-bottom:16px;">' + S.categoriesList + '</p>' +
            '<ul style="color:var(--text-primary);line-height:2;">' + catHtml + '</ul>' +
        '</div>';
}

/* ============ REPORTS ============ */

function loadSalesReports() {
    var S = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;
    var adminContent = document.getElementById('adminContent');
    var now = new Date();
    var currentMonth = now.getMonth();
    var monthsHtml = '';
    var mNames = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    for (var m = 0; m < 12; m++) {
        monthsHtml += '<option value="' + m + '"' + (m === currentMonth ? ' selected' : '') + '>' + (m + 1) + ' — ' + S[mNames[m]] + ' ' + now.getFullYear() + '</option>';
    }
    adminContent.innerHTML =
        '<div class="month-selector">' +
            '<label>' + S.selectMonth + '</label>' +
            '<select id="reportsMonthSelect">' + monthsHtml + '</select>' +
        '</div>' +
        '<div class="admin-stats">' +
            '<div class="stat-card"><h3>' + S.todaySales + '</h3><div class="stat-value" id="rToday">0 IQD</div></div>' +
            '<div class="stat-card"><h3>' + S.weeklySales + '</h3><div class="stat-value" id="rWeek">0 IQD</div></div>' +
            '<div class="stat-card"><h3>' + S.monthlySales + '</h3><div class="stat-value" id="rMonth">0 IQD</div></div>' +
            '<div class="stat-card"><h3>' + S.totalSales + '</h3><div class="stat-value" id="rTotal">0 IQD</div></div>' +
        '</div>' +
        '<div class="admin-stats" style="margin-top:16px;">' +
            '<div class="stat-card"><h3>' + S.bestSelling + '</h3><div class="stat-value" id="rBest" style="font-size:1.1rem;">-</div></div>' +
            '<div class="stat-card"><h3>' + S.totalOrders + '</h3><div class="stat-value" id="rOrders">0</div></div>' +
            '<div class="stat-card"><h3>' + S.dailySales + '</h3><div class="stat-value" id="rAvgDay">0 IQD</div></div>' +
            '<div class="stat-card"><h3>' + S.totalOrders + '/' + S.week + '</h3><div class="stat-value" id="rWeekOrders">0</div></div>' +
        '</div>' +
        '<div class="card" style="margin-top:20px;">' +
            '<h2>' + S.dailySales + ' — <span id="rDailyLabel"></span></h2>' +
            '<div id="rDailyContainer"><div class="loading">Loading...</div></div>' +
        '</div>';
    var monthSelect = document.getElementById('reportsMonthSelect');
    if (monthSelect) {
        monthSelect.addEventListener('change', function () {
            loadReportsStats(parseInt(this.value, 10));
        });
    }
    loadReportsStats(currentMonth);
}

function loadReportsStats(month) {
    if (month === undefined || month === null) month = new Date().getMonth();
    var year = new Date().getFullYear();
    var S = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    var mStart = new Date(year, month, 1);
    var mEnd = new Date(year, month + 1, 1);

    document.getElementById('rDailyLabel').textContent = getMonthName(month, S);

    db.collection('sales').where('timestamp', '>=', today).where('timestamp', '<', tomorrow).get().then(function (s) {
        var t = 0; s.forEach(function (d) { t += d.data().total || 0; });
        var el = document.getElementById('rToday'); if (el) el.textContent = t.toLocaleString() + ' IQD';
    }).catch(function () {});

    var wStart = new Date(today); wStart.setDate(today.getDate() - 6);
    var weekOrders = 0;
    db.collection('sales').where('timestamp', '>=', wStart).where('timestamp', '<', tomorrow).get().then(function (s) {
        var t = 0; s.forEach(function (d) { t += d.data().total || 0; weekOrders++; });
        var el = document.getElementById('rWeek'); if (el) el.textContent = t.toLocaleString() + ' IQD';
        var elWO = document.getElementById('rWeekOrders'); if (elWO) elWO.textContent = weekOrders.toString();
    }).catch(function () {});

    var monthlyTotal = 0;
    var monthOrderCount = 0;
    var allTimeTotal = 0;
    var dayTotals = {};
    var itemCounts = {};

    db.collection('sales').where('timestamp', '>=', mStart).where('timestamp', '<', mEnd).get().then(function (snap) {
        snap.forEach(function (d) {
            var sale = d.data();
            monthlyTotal += (sale.total || 0);
            monthOrderCount++;
            var ts = sale.timestamp;
            var saleDate;
            if (ts && typeof ts.toDate === 'function') saleDate = ts.toDate();
            else if (ts && ts.seconds) saleDate = new Date(ts.seconds * 1000);
            else saleDate = new Date(ts);
            var dayKey = saleDate.getDate();
            dayTotals[dayKey] = (dayTotals[dayKey] || 0) + (sale.total || 0);
            if (sale.items) {
                sale.items.forEach(function (it) {
                    var itemName = it.name || it['name_' + (localStorage.getItem('selectedLang') || 'ku')] || it.name_en || '—';
                    var qty = it.quantity || 1;
                    if (!itemCounts[itemName]) itemCounts[itemName] = 0;
                    itemCounts[itemName] += qty;
                });
            }
        });
        var elM = document.getElementById('rMonth');
        if (elM) elM.textContent = monthlyTotal.toLocaleString() + ' IQD';
        var elO = document.getElementById('rOrders');
        if (elO) elO.textContent = monthOrderCount.toString();

        var daysWithSales = Object.keys(dayTotals).length;
        var avgDay = daysWithSales > 0 ? Math.round(monthlyTotal / daysWithSales) : 0;
        var elAvg = document.getElementById('rAvgDay');
        if (elAvg) elAvg.textContent = avgDay.toLocaleString() + ' IQD';

        var bestName = '-';
        var bestQty = 0;
        Object.keys(itemCounts).forEach(function (name) {
            if (itemCounts[name] > bestQty) { bestQty = itemCounts[name]; bestName = name; }
        });
        var elB = document.getElementById('rBest');
        if (elB) {
            if (bestQty > 0) {
                elB.innerHTML = '<span class="best-item-name">' + bestName + '</span> <span class="best-item-qty">(' + bestQty + ' ' + S.sold + ')</span>';
            } else {
                elB.textContent = '-';
            }
        }

        var daysInM = new Date(year, month + 1, 0).getDate();
        var html = '<table class="daily-sales-table"><thead><tr><th>Day</th><th>' + S.total + ' (IQD)</th></tr></thead><tbody>';
        for (var d = 1; d <= daysInM; d++) {
            var dTotal = dayTotals[d] || 0;
            var cls = dTotal > 0 ? 'day-sales' : 'day-sales zero';
            var isToday = (d === today.getDate() && month === today.getMonth());
            html += '<tr' + (isToday ? ' style="background:rgba(212,175,55,0.06);"' : '') + '><td>' + (isToday ? '<strong style="color:var(--gold);">' + d + ' ★</strong>' : d) + '</td><td class="' + cls + '">' + dTotal.toLocaleString() + ' IQD</td></tr>';
        }
        html += '</tbody></table>';
        var container = document.getElementById('rDailyContainer');
        if (container) container.innerHTML = html;
    }).catch(function () {
        var elM = document.getElementById('rMonth'); if (elM) elM.textContent = '0 IQD';
        var elO = document.getElementById('rOrders'); if (elO) elO.textContent = '0';
        var elB = document.getElementById('rBest'); if (elB) elB.textContent = '-';
        var container = document.getElementById('rDailyContainer'); if (container) container.innerHTML = '';
    });

    db.collection('sales').get().then(function (s) {
        var t = 0; s.forEach(function (d) { t += d.data().total || 0; });
        var el = document.getElementById('rTotal'); if (el) el.textContent = t.toLocaleString() + ' IQD';
    }).catch(function () {});
}

/* ============ CASHIER ============ */

function loadCashier() {
    orderItems.length = 0;
    var S = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;
    var adminContent = document.getElementById('adminContent');
    var orderCountBadge = '<span class="cashier-order-count" id="cashierOrderCount">0</span>';
    adminContent.innerHTML =
        '<div class="cashier-layout">' +
            '<div class="cashier-products">' +
                '<div class="cashier-category-bar" id="cashierCatBar"></div>' +
                '<div class="cashier-grid" id="cashierGrid"><div class="loading">Loading...</div></div>' +
            '</div>' +
            '<div class="cashier-order" id="cashierOrderPanel">' +
                '<div class="cashier-order-header">' +
                    '<h3>' + S.currentOrder + orderCountBadge + '</h3>' +
                    '<div class="cashier-order-header-actions">' +
                        '<button class="btn-clear-order" id="clearOrderBtn">' + S.clear + '</button>' +
                        '<button class="cashier-order-toggle" id="cashierOrderToggle" aria-label="Toggle order">▲</button>' +
                    '</div>' +
                '</div>' +
                '<div class="cashier-order-items" id="cashierOrderItems">' +
                    '<div class="cashier-empty">' + S.noItemsAdded + '</div>' +
                '</div>' +
                '<div class="cashier-order-footer">' +
                    '<div class="cashier-total-row"><span>' + S.total + '</span><span class="cashier-total-amount" id="cashierTotal">0 IQD</span></div>' +
                    '<button class="btn-pay" id="payBtn">' + S.payNow + '</button>' +
                '</div>' +
            '</div>' +
        '</div>';

    loadCashierItems();
    wireCashierEvents();
    wireCashierOrderToggle();
}

function wireCashierOrderToggle() {
    var toggle = document.getElementById('cashierOrderToggle');
    var panel = document.getElementById('cashierOrderPanel');
    if (!toggle || !panel) return;
    var collapsed = false;
    toggle.addEventListener('click', function () {
        collapsed = !collapsed;
        panel.classList.toggle('collapsed', collapsed);
        toggle.textContent = collapsed ? '▼' : '▲';
    });
    if (window.innerWidth <= 768) {
        collapsed = true;
        panel.classList.add('collapsed');
        toggle.textContent = '▼';
    }
}

function loadCashierItems() {
     db.collection('menuItems').where('available', '==', true).get().then(function (snap) {
         var items = [];
         snap.forEach(function (d) { var data = d.data(); if (data.category !== 'Water') items.push({ id: d.id, v: data }); });

         var grid = document.getElementById('cashierGrid');
        var catBar = document.getElementById('cashierCatBar');
        if (!grid || !catBar) return;

        var lang = localStorage.getItem('selectedLang') || 'ku';
        var catOrder = ['Coffee', 'Tea', 'Cold Drinks', 'Dessert', 'Shisha', 'Special Drinks'];
        var grouped = {};
        items.forEach(function (it) {
            var c = it.v.category || 'Other';
            if (!grouped[c]) grouped[c] = [];
            grouped[c].push(it);
        });
        var ordered = catOrder.filter(function (c) { return grouped[c]; });
        Object.keys(grouped).forEach(function (c) { if (ordered.indexOf(c) === -1) ordered.push(c); });

        var S2 = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;
        var catMap2 = {Coffee: S2.coffee, Tea: S2.tea, 'Cold Drinks': S2.coldDrinks, Dessert: S2.dessert, Shisha: S2.shisha, 'Special Drinks': S2.specialDrinks};
        var categoryIcons = {
            'Coffee': '<img class="cashier-cat-icon" src="https://cdn-icons-png.flaticon.com/128/924/924514.png" alt="Coffee">',
            'Tea': '<img class="cashier-cat-icon" src="https://cdn-icons-png.flaticon.com/128/1223/1223749.png" alt="Tea">',
            'Cold Drinks': '<img class="cashier-cat-icon" src="https://cdn-icons-png.flaticon.com/128/1113/1113278.png" alt="Cold Drinks">',
            'Dessert': '<img class="cashier-cat-icon" src="https://cdn-icons-png.flaticon.com/128/8346/8346809.png" alt="Dessert">',
            'Shisha': '<img class="cashier-cat-icon" src="https://cdn-icons-png.flaticon.com/128/10170/10170651.png" alt="Shisha">',
            'Special Drinks': '<img class="cashier-cat-icon" src="https://cdn-icons-png.flaticon.com/128/5473/5473500.png" alt="Special Drinks">',
        };
        var catHtml = '<button class="cashier-cat-btn active" data-cat="all"><span class="cashier-cat-label">' + S2.allCategories + '</span></button>';
        ordered.forEach(function (c) {
            var icon = categoryIcons[c] || '';
            var label = catMap2[c] || c;
            catHtml += '<button class="cashier-cat-btn" data-cat="' + c + '">' + icon + '<span class="cashier-cat-label">' + label + '</span></button>';
        });
        catBar.innerHTML = catHtml;

        function renderGrid(filterCat) {
            var filtered = filterCat === 'all' ? items : items.filter(function (it) { return it.v.category === filterCat; });
            if (filtered.length === 0) { grid.innerHTML = '<div class="cashier-empty">' + S2.noCategoryItems + '</div>'; return; }
            var html = '';
            filtered.forEach(function (it) {
                 var name = it.v['name_' + lang] || it.v.name_en || S.unnamed;
                var price = it.v.price || 0;
                var img = it.v.image || '';
                html += '<div class="cashier-item-card" data-id="' + it.id + '" data-name="' + name + '" data-price="' + price + '">' +
                    '<div class="cashier-item-img-wrap">' + (img ? '<img src="' + img + '" alt="' + name + '" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=cashier-item-noimg>☕</div>\'">' : '<div class="cashier-item-noimg">☕</div>') + '</div>' +
                    '<div class="cashier-item-info"><div class="cashier-item-name">' + name + '</div><div class="cashier-item-price">' + price.toLocaleString() + ' <span>IQD</span></div></div>' +
                    '<div class="cashier-item-add">+</div>' +
                '</div>';
            });
            grid.innerHTML = html;
            grid.querySelectorAll('.cashier-item-card').forEach(function (card) {
                card.addEventListener('click', function () {
                    addToOrder(this.getAttribute('data-id'), this.getAttribute('data-name'), parseFloat(this.getAttribute('data-price')));
                });
            });
        }

        renderGrid('all');

        catBar.querySelectorAll('.cashier-cat-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                catBar.querySelectorAll('.cashier-cat-btn').forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');
                renderGrid(this.getAttribute('data-cat'));
            });
        });
    }).catch(function (e) {
        var grid = document.getElementById('cashierGrid');
         if (grid) grid.innerHTML = '<div class="cashier-empty">' + S.errorPrefix + e.message + '</div>';
    });
}

function wireCashierEvents() {
    var S = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;
    var payBtn = document.getElementById('payBtn');
    if (payBtn) {
        payBtn.addEventListener('click', function () {
            if (orderItems.length === 0) { alert(S.addFirst); return; }
            var total = orderItems.reduce(function (s, i) { return s + i.price * i.quantity; }, 0);
            db.collection('sales').add({
                items: orderItems.map(function (i) { return { name: i.name, price: i.price, quantity: i.quantity }; }),
                total: total,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                 cashier: (window.auth && auth.currentUser) ? auth.currentUser.email : S.unknown
            }).then(function () {
                alert(S.paymentSuccess + total.toLocaleString() + ' IQD');
                orderItems.length = 0;
                updateOrderDisplay();
            }).catch(function (e) { alert(S.itemError + e.message); });
        });
    }

    var clearBtn = document.getElementById('clearOrderBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (orderItems.length === 0) return;
            orderItems.length = 0;
            updateOrderDisplay();
        });
    }
}

function addToOrder(id, name, price) {
    var existing = orderItems.find(function (i) { return i.id === id; });
    if (existing) { existing.quantity += 1; }
    else { orderItems.push({ id: id, name: name, price: price, quantity: 1 }); }
    updateOrderDisplay();
}

function updateOrderDisplay() {
    var S = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;
    var container = document.getElementById('cashierOrderItems');
    var totalEl = document.getElementById('cashierTotal');
    var countEl = document.getElementById('cashierOrderCount');
    if (!container) return;

    var totalQty = 0;
    if (countEl) {
        orderItems.forEach(function (i) { totalQty += i.quantity; });
        countEl.textContent = totalQty;
        countEl.style.display = totalQty > 0 ? '' : 'none';
    }

    if (orderItems.length === 0) {
        container.innerHTML = '<div class="cashier-empty">' + S.noItemsAdded + '</div>';
        if (totalEl) totalEl.textContent = '0 IQD';
        return;
    }

    var html = '';
    var total = 0;
    orderItems.forEach(function (item, idx) {
        var sub = item.price * item.quantity;
        total += sub;
        html += '<div class="cashier-order-item">' +
            '<div class="cashier-order-item-name">' + item.name + '</div>' +
            '<div class="cashier-order-item-price">' + item.price.toLocaleString() + ' IQD</div>' +
            '<div class="cashier-qty-control">' +
                '<button class="cashier-qty-btn minus" data-idx="' + idx + '">\u2212</button>' +
                '<span class="cashier-qty-val">' + item.quantity + '</span>' +
                '<button class="cashier-qty-btn plus" data-idx="' + idx + '">+</button>' +
            '</div>' +
            '<div class="cashier-order-item-subtotal">' + sub.toLocaleString() + '</div>' +
            '<button class="cashier-remove-btn" data-idx="' + idx + '">\u2715</button>' +
        '</div>';
    });
    container.innerHTML = html;
    if (totalEl) totalEl.textContent = total.toLocaleString() + ' IQD';

    container.querySelectorAll('.cashier-qty-btn.minus').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var i = parseInt(this.getAttribute('data-idx'));
            orderItems[i].quantity--;
            if (orderItems[i].quantity <= 0) orderItems.splice(i, 1);
            updateOrderDisplay();
        });
    });
    container.querySelectorAll('.cashier-qty-btn.plus').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var i = parseInt(this.getAttribute('data-idx'));
            orderItems[i].quantity++;
            updateOrderDisplay();
        });
    });
    container.querySelectorAll('.cashier-remove-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            orderItems.splice(parseInt(this.getAttribute('data-idx')), 1);
            updateOrderDisplay();
        });
    });
}

/* ============ SETTINGS ============ */

function loadSettings() {
    var S = i18n[localStorage.getItem('selectedLang') || 'ku'] || i18n.en;
    var adminContent = document.getElementById('adminContent');
    adminContent.innerHTML =
        '<div class="card">' +
            '<h2>' + S.settings + '</h2>' +
            '<div class="form-group"><label>' + S.cafeName + '</label><input type="text" id="cafeName" value="' + S.siteName + '"></div>' +
            '<div class="form-group"><label>' + S.currency + '</label><input type="text" value="IQD" readonly></div>' +
            '<button class="btn-primary" id="saveSettingsBtn">' + S.saveSettings + '</button>' +
        '</div>';

    var saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function () { alert(S.settingsSaved); });
    }
}

/* ============ LOGOUT ============ */

function handleLogout() {
    if (window.auth) {
        auth.signOut().then(function () {
            window.location.href = 'login.html';
        }).catch(function () {
            window.location.href = 'login.html';
        });
    } else {
        window.location.href = 'login.html';
    }
}
