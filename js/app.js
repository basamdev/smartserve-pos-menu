// App.js — Ali Coffee Premium Menu
// Handles: i18n, theme, category filtering, product detail modal, video player

window.openMenu = function (lang) {
    localStorage.setItem('selectedLang', lang);
    window.location.href = 'menu.html?lang=' + lang;
};

document.addEventListener('DOMContentLoaded', function () {
    try {
        const savedLang = localStorage.getItem('selectedLang') || 'ku';
        setActiveLanguage(savedLang);
        applyLanguageUI(savedLang);
        setupThemeToggle();

        if (window.location.pathname.includes('menu.html')) {
            loadMenuItems();
            setupLanguageButtons();
        }
    } catch (e) {
        console.error('Init error:', e);
    }
});

/* ========================================
   i18n
   ======================================== */

const i18n = {
    ku: {
        menuTitle: 'مێنووی ئێمە',
        loadingMenu: 'داگرتنی مێنوو...',
        noItems: 'هیچ شتێک نییە لە مێنوودا.',
        noCategoryItems: 'هیچ شتێک نییە لەم بەشەدا.',
        errorLoadingMenu: 'هەڵە لە داگرتنی مێنوودا.',
        noCategories: 'هیچ بەشێک نییە.',
        pageTitle: 'عەلی کافێ | مێنوو',
        dashboard: 'داشبۆرد',
        manageItems: 'بەڕێوەبردنی ئایتمەکان',
        manageCategories: 'بەڕێوەبردنی بەشەکان',
        reports: 'ڕاپۆرتەکان',
        cashier: 'کاشێر',
        settings: 'ڕێکخستنەکان',
        logout: 'دەرچوون',
        admin: 'بەڕێوەبەر',
        ku: 'کوردی',
        ar: 'عەرەبی',
        en: 'ئینگلیزی',
        coffee: 'قاوە',
        tea: 'چای',
        dessert: 'شیرینی',
        coldDrinks: 'خواردنەوەی سارد',
        shisha: 'نێرگیلە',
        specialDrinks: 'خواردنەوەی تایبەت',
        viewDetails: 'بینینی زیاتر',
        todaySales: 'فرۆشتنی ئەمڕۆ',
        monthlySales: 'فرۆشتنی ئەم مانگە',
        totalOrders: 'کۆی هەموو داواکارییەکان',
        bestSelling: 'باشترین فرۆشراو',
        selectMonth: 'مانگ هەڵبژێرە',
        dailySales: 'فرۆشتنی ڕۆژانە',
        noSalesData: 'هیچ داتای فرۆشتن نییە',
        january: 'کانوونی دووەم',
        february: 'شوبات',
        march: 'ئازار',
        april: 'نیسان',
        may: 'ئایار',
        june: 'حوزەیران',
        july: 'تەمووز',
        august: 'ئاب',
        september: 'ئەیلوول',
        october: 'تشرینی یەکەم',
        november: 'تشرینی دووەم',
        december: 'کانونی یەکەم',
        week: 'هەفتە',
        totalSales: 'کۆی هەموو فرۆشتن',
        weeklySales: 'فرۆشتنی ئەم هەفتەیە',
        recentSales: 'نوێترین فرۆشتنەکان',
        time: 'کات',
        items: 'ئایتم',
        total: 'کۆی گشتی',
        noSalesYet: 'هیچ فرۆشتنێک نییە تا ئێستا',
        noSalesData: 'هیچ داتایەکی فرۆشتن بەردەست نییە',
        addNewItem: '+ زیادکردنی ئایتمی نوێ',
        searchItems: 'گەڕان بۆ ئایتم...',
        allCategories: 'هەموو بەشەکان',
        select: 'هەڵبژێرە',
        kurdishName: 'ناو بە کوردی',
        arabicName: 'ناو بە عەرەبی',
        englishName: 'ناو بە ئینگلیزی',
        kurdishDesc: 'وەسف بە کوردی',
        arabicDesc: 'وەسف بە عەرەبی',
        englishDesc: 'وەسف بە ئینگلیزی',
        imageURL: 'بەستەری وێنە',
        price: 'نرخ (IQD)',
        category: 'بەش',
        available: 'بەردەستە',
        saveItem: 'پاشەکەوتکردن',
        cancel: 'پاشگەزبوونەوە',
        edit: 'دەستکاری',
        delete: 'سڕینەوە',
        deleteConfirm: 'دڵنیایت لە سڕینەوەی ئەم ئایتمە؟',
        fillAll: 'تکایە هەموو خانەکان پڕ بکەرەوە',
        itemSaved: 'ئایتم پاشەکەوت کرا!',
        itemError: 'هەڵە: ',
        categoriesList: 'بەشەکانی سیستەم:',
        noItemsFound: 'هیچ ئایتمێک نەدۆزرایەوە',
        weeklySales: 'فرۆشتنی ئەم هەفتەیە',
        totalSales: 'کۆی گشتی فرۆشتن',
        currentOrder: 'داواکاریی ئێستا',
        clear: 'خاوێنکردنەوە',
        payNow: '💳 پارەدان',
        addFirst: 'تکایە سەرەتا ئایتم زیاد بکە',
        paymentSuccess: 'پارەدان سەرکەوتوو بوو! کۆی گشتی: ',
        noItemsAdded: 'هیچ ئایتمێک زیاد نەکراوە.\nکلیک لەسەر ئایتم بکە بۆ زیادکردن.',
        cafeName: 'ناوی کافێ',
        currency: 'دراو',
        saveSettings: 'پاشەکەوتکردن',
        settingsSaved: 'ڕێکخستنەکان پاشەکەوت کران!',
        yes: 'بەڵێ',
        no: 'نەخێر',
        sectionNotFound: 'بەش نەدۆزرایەوە',
        errorLoading: 'هەڵە لە بارکردن: ',
        loading: 'بارکردن...',
        errorLoadingSection: 'هەڵە لە بارکردنی بەش ',
        errorPrefix: 'هەڵە: ',
        unnamed: 'بێ ناو',
        editItem: 'دەستکاری ئایتم',
        addNewItem: '+ زیادکردنی ئایتمی نوێ',
        sold: 'دانە',
        itemsCount: ' ئایتم',
        unknown: 'نەناسراو',
        siteName: 'عەلی کافێ',
    },
    ar: {
        menuTitle: 'قائمتنا',
        loadingMenu: 'جارٍ تحميل القائمة...',
        noItems: 'لا توجد عناصر في القائمة.',
        noCategoryItems: 'لا توجد عناصر في هذا القسم.',
        errorLoadingMenu: 'حدث خطأ أثناء تحميل القائمة.',
        noCategories: 'لا توجد أقسام.',
        pageTitle: 'علي كافيه | القائمة',
        dashboard: 'لوحة التحكم',
        manageItems: 'إدارة العناصر',
        manageCategories: 'إدارة الفئات',
        reports: 'التقارير',
        cashier: 'الصندوق',
        settings: 'الإعدادات',
        logout: 'تسجيل الخروج',
        admin: 'المشرف',
        ku: 'كوردي',
        ar: 'عربي',
        en: 'English',
        coffee: 'قهوة',
        tea: 'شاي',
        dessert: 'حلوى',
        coldDrinks: 'مشروبات باردة',
        shisha: 'نرگیلة',
        specialDrinks: 'مشروبات خاصة',
        viewDetails: 'عرض التفاصيل',
        todaySales: 'مبيعات اليوم',
        monthlySales: 'مبيعات الشهر',
        totalOrders: 'إجمالي الطلبات',
        bestSelling: 'الأكثر مبيعاً',
        selectMonth: 'اختر الشهر',
        dailySales: 'المبيعات اليومية',
        noSalesData: 'لا توجد بيانات مبيعات',
        january: 'كانون الثاني',
        february: 'شباط',
        march: 'آذار',
        april: 'نيسان',
        may: 'آيار',
        june: 'حزيران',
        july: 'تموز',
        august: 'آب',
        september: 'أيلول',
        october: 'تشرين الأول',
        november: 'تشرين الثاني',
        december: 'كانون الأول',
        week: 'أسبوع',
        totalSales: 'إجمالي المبيعات',
        weeklySales: 'مبيعات الأسبوع',
        recentSales: 'المبيعات الأخيرة',
        time: 'الوقت',
        items: 'عناصر',
        total: 'الإجمالي',
        noSalesYet: 'لا توجد مبيعات بعد',
        noSalesData: 'لا توجد بيانات مبيعات',
        addNewItem: '+ إضافة عنصر جديد',
        searchItems: 'البحث عن عناصر...',
        allCategories: 'جميع الفئات',
        select: 'اختر',
        kurdishName: 'الاسم الكردي',
        arabicName: 'الاسم العربي',
        englishName: 'الاسم الإنجليزي',
        kurdishDesc: 'الوصف الكردي',
        arabicDesc: 'الوصف العربي',
        englishDesc: 'الوصف الإنجليزي',
        imageURL: 'رابط الصورة',
        price: 'السعر (IQD)',
        category: 'الفئة',
        available: 'متاح',
        saveItem: 'حفظ',
        cancel: 'إلغاء',
        edit: 'تعديل',
        delete: 'حذف',
        deleteConfirm: 'هل أنت متأكد من حذف هذا العنصر؟',
        fillAll: 'يرجى ملء جميع الحقول المطلوبة',
        itemSaved: 'تم حفظ العنصر!',
        itemError: 'خطأ: ',
        categoriesList: 'فئات النظام:',
        noItemsFound: 'لم يتم العثور على عناصر',
        weeklySales: 'مبيعات الأسبوع',
        totalSales: 'إجمالي المبيعات',
        currentOrder: 'الطلب الحالي',
        clear: 'مسح',
        payNow: '💳 ادفع الآن',
        addFirst: 'يرجى إضافة عناصر أولاً',
        paymentSuccess: 'تم الدفع بنجاح! الإجمالي: ',
        noItemsAdded: 'لم تتم إضافة أي عناصر.\nاضغط على العناصر لإضافتها.',
        cafeName: 'اسم المقهى',
        currency: 'العملة',
        saveSettings: 'حفظ الإعدادات',
        settingsSaved: 'تم حفظ الإعدادات!',
        yes: 'نعم',
        no: 'لا',
        sectionNotFound: 'القسم غير موجود',
        errorLoading: 'خطأ في التحميل: ',
        loading: 'جارٍ التحميل...',
        errorLoadingSection: 'خطأ في تحميل القسم ',
        errorPrefix: 'خطأ: ',
        unnamed: 'بلا اسم',
        editItem: 'تعديل العنصر',
        addNewItem: '+ إضافة عنصر جديد',
        sold: 'قطعة',
        itemsCount: ' عناصر',
        unknown: 'غير معروف',
        siteName: 'علي كافيه',
    },
    en: {
        menuTitle: 'Our Menu',
        loadingMenu: 'Loading menu items...',
        noItems: 'No menu items found.',
        noCategoryItems: 'No items in this category.',
        errorLoadingMenu: 'Error loading menu.',
        noCategories: 'No categories.',
        pageTitle: 'Ali Coffee | Menu',
        dashboard: 'Dashboard',
        manageItems: 'Manage Items',
        manageCategories: 'Manage Categories',
        reports: 'Reports',
        cashier: 'Cashier',
        settings: 'Settings',
        logout: 'Logout',
        admin: 'Admin',
        ku: 'Kurdish',
        ar: 'Arabic',
        en: 'English',
        coffee: 'Coffee',
        tea: 'Tea',
        dessert: 'Dessert',
        coldDrinks: 'Cold Drinks',
        shisha: 'Shisha',
        specialDrinks: 'Special Drinks',
        viewDetails: 'View',
        todaySales: 'Today Sales',
        monthlySales: 'Monthly Sales',
        totalOrders: 'Total Orders',
        bestSelling: 'Best Selling',
        selectMonth: 'Select Month',
        dailySales: 'Daily Sales',
        noSalesData: 'No sales data',
        january: 'January',
        february: 'February',
        march: 'March',
        april: 'April',
        may: 'May',
        june: 'June',
        july: 'July',
        august: 'August',
        september: 'September',
        october: 'October',
        november: 'November',
        december: 'December',
        week: 'Week',
        totalSales: 'Total Sales',
        weeklySales: 'Weekly Sales',
        recentSales: 'Recent Sales',
        time: 'Time',
        items: 'Items',
        total: 'Total',
        noSalesYet: 'No sales yet',
        noSalesData: 'No sales data',
        addNewItem: '+ Add New Item',
        searchItems: 'Search items...',
        allCategories: 'All Categories',
        select: 'Select',
        kurdishName: 'Kurdish Name',
        arabicName: 'Arabic Name',
        englishName: 'English Name',
        kurdishDesc: 'Kurdish Description',
        arabicDesc: 'Arabic Description',
        englishDesc: 'English Description',
        imageURL: 'Image URL',
        price: 'Price (IQD)',
        category: 'Category',
        available: 'Available',
        saveItem: 'Save Item',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        deleteConfirm: 'Are you sure you want to delete this item?',
        fillAll: 'Please fill in all required fields',
        itemSaved: 'Item saved!',
        itemError: 'Error: ',
        categoriesList: 'System categories:',
        noItemsFound: 'No items found',
        weeklySales: 'Weekly Sales',
        totalSales: 'Total Sales',
        currentOrder: 'Current Order',
        clear: 'Clear',
        payNow: '💳 Pay Now',
        addFirst: 'Please add items first',
        paymentSuccess: 'Payment successful! Total: ',
        noItemsAdded: 'No items added yet.\nTap items to add them.',
        cafeName: 'Cafe Name',
        currency: 'Currency',
        saveSettings: 'Save Settings',
        settingsSaved: 'Settings saved!',
        yes: 'Yes',
        no: 'No',
        sectionNotFound: 'Section not found',
        errorLoading: 'Error loading: ',
        searchPlaceholder: 'Search menu...',
        noSearchResults: 'No items found for',
        favorites: 'Favorites',
        addToFavorites: 'Add to favorites',
        removeFromFavorites: 'Removed from favorites',
        rated: 'Rated',
        stars: 'stars',
        itemAddedToCart: 'Added to cart',
        viewCart: 'View Cart',
        cart: 'Cart',
        cartEmpty: 'Cart is empty',
        quantity: 'Qty',
        checkout: 'Checkout',
        orderPlaced: 'Order placed successfully! Total: ',
        orderError: 'Error placing order: ',
        loading: 'Loading...',
        errorLoadingSection: 'Error loading section ',
        errorPrefix: 'Error: ',
        sectionNotFound: 'Section not found',
        unnamed: 'Unnamed',
        editItem: 'Edit Item',
        addNewItem: 'Add New Item',
        sold: 'sold',
        itemsCount: ' items',
        unknown: 'unknown',
        siteName: 'Ali Coffee',
    }
};

/* ========================================
   State
   ======================================== */

let cachedMenuItems = [];
let _activeCategory = null;
let _renderSerial = 0;
let _currentDetailItem = null;

/* ========================================
   Menu Loading
   ======================================== */

async function loadMenuItems() {
    if (loadMenuItems._inProgress) return;
    loadMenuItems._inProgress = true;

    const container = document.getElementById('menuGrid');
    const lang = localStorage.getItem('selectedLang') || 'ku';
    const strings = i18n[lang] || i18n.en;
     if (!container) return;

    container.innerHTML = `<div class="loading-menu">${strings.loadingMenu}</div>`;

    try {
         if (!window.db) throw new Error('Firebase database not initialized');

         const snapshot = await window.db.collection('menuItems').get();
          const items = [];
          snapshot.forEach(doc => {
              const data = { id: doc.id, ...doc.data() };
              if (data.category !== 'Water') items.push(data);
          });

          cachedMenuItems = items;
         console.log('Loaded items:', items.length);

          if (items.length === 0) {
              container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">☕</div><p>${strings.noItems}</p></div>`;
          }

          renderCategories(items);

          // Realtime listener
         if (loadMenuItems._unsubscribe) loadMenuItems._unsubscribe();
         loadMenuItems._unsubscribe = window.db.collection('menuItems').onSnapshot(
             liveSnap => {
                 const liveItems = [];
                 liveSnap.forEach(doc => {
                     const data = { id: doc.id, ...doc.data() };
                     if (data.category !== 'Water') liveItems.push(data);
                 });
                      cachedMenuItems = liveItems;
                      renderCategories(liveItems);
                      if (liveItems.length > 0 && _activeCategory) {
                          var filtered = liveItems.filter(i => i.category === _activeCategory);
                          renderMenuItems(filtered);
                          renderMenuCardsWithFeatures();
                      } else if (liveItems.length > 0) {
                          const grid = document.getElementById('menuGrid');
                          if (grid) grid.innerHTML = '';
                      }
             },
             err => console.warn('[realtime] error:', err.message)
         );

     } catch (error) {
         console.error('Error loading menu:', error);
         container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><p>${strings.errorLoadingMenu}</p><p style="font-size:0.8rem;margin-top:8px">${error.message}</p></div>`;
         renderCategories([]);
     } finally {
        loadMenuItems._inProgress = false;
    }
}

window.addEventListener('unload', function () {
    if (loadMenuItems._unsubscribe) loadMenuItems._unsubscribe();
});

function renderCategories(items) {
     const scroll = document.getElementById('categoryScroll');
     if (!scroll) return;

     const lang = localStorage.getItem('selectedLang') || 'ku';
     const strings = i18n[lang] || i18n.en;

     const categoryOrder = ['Coffee', 'Tea', 'Cold Drinks', 'Dessert', 'Shisha', 'Special Drinks'];
     const foundCategories = items.length > 0 ? new Set(items.map(i => i.category).filter(Boolean).filter(c => c !== 'Water')) : new Set(categoryOrder);
     const ordered = categoryOrder.filter(c => foundCategories.has(c));
     foundCategories.forEach(c => { if (!ordered.includes(c)) ordered.push(c); });

    const categoryIcons = {
        'Coffee': '<img class="cat-icon" src="https://cdn-icons-png.flaticon.com/128/924/924514.png" alt="Coffee">',
        'Tea': '<img class="cat-icon" src="https://cdn-icons-png.flaticon.com/128/1223/1223749.png" alt="Tea">',
        'Cold Drinks': '<img class="cat-icon" src="https://cdn-icons-png.flaticon.com/128/1113/1113278.png" alt="Cold Drinks">',
        'Dessert': '<img class="cat-icon" src="https://cdn-icons-png.flaticon.com/128/8346/8346809.png" alt="Dessert">',
          'Shisha': '<img class="cat-icon" src="https://cdn-icons-png.flaticon.com/128/10170/10170651.png" alt="Shisha">',
        'Special Drinks': '<img class="cat-icon" src="https://cdn-icons-png.flaticon.com/128/5473/5473500.png" alt="Special Drinks">',
    };

     let html = '';
     ordered.forEach(cat => {
         var key = cat.replace(/\s+/g, '');
         key = key.charAt(0).toLowerCase() + key.slice(1);
         var label = strings[key] || cat;
         var icon = categoryIcons[cat] || '<svg class="cat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/></svg>';
         html += `<button class="category-btn" data-category="${cat}">${icon}<span class="cat-label">${label}</span></button>`;
     });

     scroll.innerHTML = html;

     scroll.querySelectorAll('.category-btn').forEach(btn => {
         btn.addEventListener('click', () => {
             const cat = btn.getAttribute('data-category');
             switchCategory(cat);
         });
     });
 }

function switchCategory(category) {
    _activeCategory = category;
    document.body.classList.add('category-selected');

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === category);
    });

    const grid = document.getElementById('menuGrid');
    if (!grid) return;

    grid.classList.add('category-switching');

    setTimeout(() => {
        const items = cachedMenuItems.filter(i => i.category === category);
        renderMenuItems(items);
        renderMenuCardsWithFeatures();
        grid.classList.remove('category-switching');
    }, 200);
}

/* ========================================
   Menu Items Rendering
   ======================================== */

function renderMenuItems(items) {
    const container = document.getElementById('menuGrid');
    if (!container) return;

    _renderSerial++;
    const serial = _renderSerial;
    const lang = localStorage.getItem('selectedLang') || 'ku';
    const strings = i18n[lang] || i18n.en;

    container.innerHTML = '';

    if (!items || items.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">☕</div><p>${strings.noCategoryItems}</p></div>`;
        return;
    }

    const availableItems = items.filter(item => item.available !== false);

    availableItems.forEach(item => {
        const name = item[`name_${lang}`] || item.name_en || item.name_ar || item.name_ku || 'Unnamed Item';
        const description = item[`description_${lang}`] || item.description_en || item.description_ar || item.description_ku || '';
        const fallbackImage = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect fill=%231a1a1a width=%27400%27 height=%27300%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 font-size=%2740%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%23D4AF37%27%3E%E2%98%95%3C/text%3E%3C/svg%3E';
        const imageUrl = normalizeImageUrl(item.image) || fallbackImage;

        const card = document.createElement('div');
        card.className = 'menu-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('data-item-id', item.id);
        card.innerHTML = `
            <div class="menu-card-img-wrapper">
                <img src="${imageUrl}" alt="${name}" class="menu-card-img" loading="lazy"
                     onerror="this.onerror=null;this.src='${fallbackImage}';">
                <div class="menu-card-badge">${strings[item.category.replace(/\s+/g, '').charAt(0).toLowerCase() + item.category.replace(/\s+/g, '').slice(1)] || item.category || ''}</div>
            </div>
            <div class="menu-card-body">
                <h2 class="menu-card-title">${name}</h2>
                ${description ? `<p class="menu-card-desc">${description}</p>` : '<p class="menu-card-desc" style="opacity:0">—</p>'}
                <div class="menu-card-footer">
                    <div class="price-tag">
                        ${item.price ? item.price.toLocaleString() : '0'}
                        <span class="price-currency">IQD</span>
                    </div>
                    <span class="card-view-hint">→ ${strings.viewDetails}</span>
                </div>
            </div>
        `;

        // Open detail on click
        const openDetail = () => openProductDetail(item);
        card.addEventListener('click', openDetail);
        card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(); } });

        container.appendChild(card);
    });
}

/* ========================================
   Product Detail Modal
   ======================================== */

function openProductDetail(item) {
    _currentDetailItem = item;
    const lang = localStorage.getItem('selectedLang') || 'ku';
    const name = item[`name_${lang}`] || item.name_en || item.name_ar || item.name_ku || 'Unnamed Item';
    const description = item[`description_${lang}`] || item.description_en || item.description_ar || item.description_ku || '';
    const fallbackImage = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect fill=%231a1a1a width=%27400%27 height=%27300%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 font-size=%2740%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%23D4AF37%27%3E%E2%98%95%3C/text%3E%3C/svg%3E';
    const imageUrl = normalizeImageUrl(item.image) || fallbackImage;

    // Populate detail panel
    const imgEl = document.getElementById('detailImage');
    if (imgEl) imgEl.src = imageUrl;

    const catEl = document.getElementById('detailCategory');
    if (catEl) catEl.textContent = item.category || '';

    const titleEl = document.getElementById('detailTitle');
    if (titleEl) titleEl.textContent = name;

    const descEl = document.getElementById('detailDesc');
    if (descEl) descEl.textContent = description;

    const priceEl = document.getElementById('detailPrice');
    if (priceEl) priceEl.textContent = item.price ? item.price.toLocaleString() : '0';

    // Video button
    const videoBtn = document.getElementById('videoPlayBtn');
    if (videoBtn) {
        if (item.video) {
            videoBtn.style.display = 'flex';
            videoBtn.onclick = () => openVideoModal(item.video);
        } else {
            videoBtn.style.display = 'none';
        }
    }

    // Show overlay
    const overlay = document.getElementById('detailOverlay');
    if (overlay) {
        overlay.classList.add('open');
        document.body.classList.add('detail-open');
    }
}

function closeProductDetail() {
    const overlay = document.getElementById('detailOverlay');
    if (overlay) {
        overlay.classList.remove('open');
        document.body.classList.remove('detail-open');
    }
    _currentDetailItem = null;
}

/* ========================================
   Video Modal
   ======================================== */

function openVideoModal(videoUrl) {
    const overlay = document.getElementById('videoOverlay');
    const videoEl = document.getElementById('detailVideo');
    if (!overlay || !videoEl) return;

    videoEl.src = videoEl.src = videoUrl;
    videoEl.play().catch(() => {});
    overlay.classList.add('open');
}

function closeVideoModal() {
    const overlay = document.getElementById('videoOverlay');
    const videoEl = document.getElementById('detailVideo');
    if (overlay) overlay.classList.remove('open');
    if (videoEl) {
        videoEl.pause();
        videoEl.src = '';
    }
}

/* ========================================
   Event Wiring (menu page)
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {
    // Detail close
    const detailBackdrop = document.getElementById('detailBackdrop');
    const detailClose = document.getElementById('detailClose');
    if (detailBackdrop) detailBackdrop.addEventListener('click', closeProductDetail);
    if (detailClose) detailClose.addEventListener('click', closeProductDetail);

    // Video close
    const videoOverlay = document.getElementById('videoOverlay');
    const videoClose = document.getElementById('videoClose');
    if (videoOverlay) videoOverlay.addEventListener('click', function (e) { if (e.target === this) closeVideoModal(); });
    if (videoClose) videoClose.addEventListener('click', closeVideoModal);

    // Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const videoOverlay = document.getElementById('videoOverlay');
            if (videoOverlay && videoOverlay.classList.contains('open')) {
                closeVideoModal();
            } else {
                closeProductDetail();
            }
        }
    });

    registerServiceWorker();
});

/* ========================================
   Language
   ======================================== */

function setActiveLanguage(lang) {
    localStorage.setItem('selectedLang', lang);

    if (window.location.pathname.includes('menu.html')) {
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.pushState({ path: url.href }, '', url.href);
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    document.documentElement.dir = (lang === 'ar' || lang === 'ku') ? 'rtl' : 'ltr';
}

function applyLanguageUI(lang) {
    var strings = i18n[lang] || i18n.en;
    document.title = strings.pageTitle;

    document.querySelectorAll('[data-i18n]').forEach(function (element) {
        var key = element.getAttribute('data-i18n');
        if (strings[key]) element.textContent = strings[key];
    });

    if (window.location.pathname.includes('admin.html')) {
        updateAdminPanelText(strings);
        var activeSection = document.querySelector('.admin-nav-btn.active');
        if (activeSection) {
            var section = activeSection.getAttribute('data-section');
            loadAdminSection(section);
        }
    }

    if (cachedMenuItems.length > 0) {
        renderCategories(cachedMenuItems);
        if (_activeCategory && _activeCategory !== null) {
            renderMenuItems(cachedMenuItems.filter(function (i) { return i.category === _activeCategory; }));
        }
    }

    if (_currentDetailItem) {
        openProductDetail(_currentDetailItem);
    }
}

function updateAdminPanelText(strings) {
    var navMap = {
        dashboard: strings.dashboard,
        items: strings.manageItems,
        categories: strings.manageCategories,
        reports: strings.reports,
        cashier: strings.cashier,
        settings: strings.settings,
        logout: strings.logout
    };
    var activeBtn = document.querySelector('.admin-nav-btn.active');
    var adminHeader = document.querySelector('.admin-header h1');
    if (adminHeader && activeBtn) {
        var activeSection = activeBtn.getAttribute('data-section');
        if (navMap[activeSection]) adminHeader.textContent = navMap[activeSection];
    }
    document.querySelectorAll('.admin-nav-btn').forEach(function (item) {
        var section = item.getAttribute('data-section');
        if (navMap[section]) {
            var label = item.querySelector('span:last-child');
            if (label) label.textContent = navMap[section];
        }
    });
}

function setupLanguageButtons() {
    document.querySelectorAll('.lang-btn').forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.getAttribute('data-lang');
            setActiveLanguage(lang);
            applyLanguageUI(lang);
        });
    });
}

/* ========================================
   Theme
   ======================================== */

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const adminThemeToggle = document.getElementById('adminThemeToggle');

    const savedTheme = localStorage.getItem('theme') || 'dark';

    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }

    const handleToggle = () => {
        const isLight = document.body.classList.toggle('light-mode');
        const newTheme = isLight ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
    };

    if (themeToggle) themeToggle.addEventListener('click', handleToggle);
    if (adminThemeToggle) adminThemeToggle.addEventListener('click', handleToggle);
}

/* ========================================
    Menu Features: Favorites & Ratings
    ======================================== */

var MENU_FEATURES = {
    getFavorites() {
        try { return JSON.parse(localStorage.getItem('menu_favorites') || '[]'); } catch(e) { return []; }
    },

    toggleFav(id) {
        var favs = this.getFavorites();
        var idx = favs.indexOf(id);
        if (idx > -1) { favs.splice(idx, 1); } else { favs.push(id); }
        localStorage.setItem('menu_favorites', JSON.stringify(favs));
        return idx === -1;
    },

    isFav(id) { return this.getFavorites().indexOf(id) > -1; },

    getRating(itemId) {
        try { var r = JSON.parse(localStorage.getItem('menu_ratings') || '{}'); return r[itemId] || 0; } catch(e) { return 0; }
    },

    setRating(itemId, stars) {
        try { var r = JSON.parse(localStorage.getItem('menu_ratings') || '{}'); r[itemId] = stars; localStorage.setItem('menu_ratings', JSON.stringify(r)); } catch(e) {}
    }
};

function renderMenuCardsWithFeatures() {
    var cards = document.querySelectorAll('.menu-card');
    cards.forEach(function(card) {
        var imgWrapper = card.querySelector('.menu-card-img-wrapper');
        if (!imgWrapper || card.querySelector('.menu-card-actions')) return;

        var actions = document.createElement('div');
        actions.className = 'menu-card-actions';

        var itemId = card.getAttribute('data-item-id') || '';

        var favBtn = document.createElement('button');
        favBtn.className = 'menu-fav-btn';
        favBtn.innerHTML = '<svg class="fav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
        if (itemId && MENU_FEATURES.isFav(itemId)) {
            favBtn.innerHTML = '<svg class="fav-icon fav-filled" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
            favBtn.classList.add('active');
        }
        favBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (itemId) {
                var added = MENU_FEATURES.toggleFav(itemId);
                if (added) {
                    this.innerHTML = '<svg class="fav-icon fav-filled" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
                } else {
                    this.innerHTML = '<svg class="fav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
                }
                this.classList.toggle('active', added);
            }
        });

        var rating = itemId ? MENU_FEATURES.getRating(itemId) : 0;
        var ratingHtml = '<div class="menu-rating" data-item-id="' + itemId + '">';
        for (var s = 1; s <= 5; s++) {
            ratingHtml += '<span class="star' + (s <= rating ? ' active' : '') + '" data-stars="' + s + '">★</span>';
        }
        ratingHtml += '</div>';

        actions.innerHTML = ratingHtml;
        actions.insertBefore(favBtn, actions.firstChild);
        imgWrapper.appendChild(actions);

        var starContainer = actions.querySelector('.menu-rating');
        if (starContainer) {
            starContainer.querySelectorAll('.star').forEach(function(star) {
                star.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var sid = starContainer.getAttribute('data-item-id');
                    var stars = parseInt(star.getAttribute('data-stars'));
                    if (sid) {
                        MENU_FEATURES.setRating(sid, stars);
                        starContainer.querySelectorAll('.star').forEach(function(st, idx) {
                            st.classList.toggle('active', idx < stars);
                        });
                    }
                });
            });
        }
    });
}

/* ========================================
   PWA Service Worker Registration
   ======================================== */

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(function() {});
    }
}

/* ========================================
   Utilities
   ======================================== */

function normalizeImageUrl(url) {
    if (!url) return null;
    try {
        new URL(url);
        return url;
    } catch (e) {
        return null;
    }
}
