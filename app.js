// ============================================================
// نظام التقييم والقبول - المنطق الكامل (Supabase + دعم لغتين)
// ============================================================

// ---------------- STATE ----------------
let selectedBranch = '';
let selectedRole = '';
let currentStudent = null;
let currentUserProfile = null;
let charts = {};
let currentLang = localStorage.getItem('lang') || 'ar';

const nationalities = {
    arab: [['saudi','🇸🇦 سعودي','🇸🇦 Saudi'],['egyptian','🇪🇬 مصري','🇪🇬 Egyptian'],['jordanian','🇯🇴 أردني','🇯🇴 Jordanian'],
        ['syrian','🇸🇾 سوري','🇸🇾 Syrian'],['lebanese','🇱🇧 لبناني','🇱🇧 Lebanese'],['iraqi','🇮🇶 عراقي','🇮🇶 Iraqi'],
        ['yemeni','🇾🇪 يمني','🇾🇪 Yemeni'],['palestinian','🇵🇸 فلسطيني','🇵🇸 Palestinian'],['sudanese','🇸🇩 سوداني','🇸🇩 Sudanese'],
        ['moroccan','🇲🇦 مغربي','🇲🇦 Moroccan'],['algerian','🇩🇿 جزائري','🇩🇿 Algerian'],['tunisian','🇹🇳 تونسي','🇹🇳 Tunisian']],
    foreign: [['american','🇺🇸 أمريكي','🇺🇸 American'],['british','🇬🇧 بريطاني','🇬🇧 British'],['indian','🇮🇳 هندي','🇮🇳 Indian'],
        ['pakistani','🇵🇰 باكستاني','🇵🇰 Pakistani'],['filipino','🇵🇭 فلبيني','🇵🇭 Filipino'],['turkish','🇹🇷 تركي','🇹🇷 Turkish'],
        ['french','🇫🇷 فرنسي','🇫🇷 French'],['chinese','🇨🇳 صيني','🇨🇳 Chinese'],['canadian','🇨🇦 كندي','🇨🇦 Canadian']]
};

const BRANCH_INFO = {
    ajyal: {
        logo: 'https://cdn.phototourl.com/free/2026-07-14-d44ffda0-bbf4-44eb-99a9-650f628bd4ad.png',
        name: { ar: 'مدارس أجيال المعرفة', en: 'Ajyal Al Maarefah Schools' },
        sub: { ar: 'من Kg II إلى Grade 12', en: 'From KG2 to Grade 12' },
        est: { ar: 'تأسست 1985', en: 'Established 1985' }
    },
    kids: {
        logo: 'https://cdn.phototourl.com/free/2026-07-14-ce64c35e-2cbf-475c-bfb7-3fde4e32b4b9.png',
        name: { ar: 'بوابة الطفل', en: "Kids' Gateway School" },
        sub: { ar: 'من Kg II إلى Grade 6', en: 'From KG2 to Grade 6' },
        est: { ar: 'تأسست 1985', en: 'Established 1985' }
    }
};

// ============================================================
// TRANSLATIONS (British English)
// ============================================================
const translations = {
    ar: {
        loaderText:'جاري التحضير...', splashTitle1:'منصة', splashTitle2:'التقييم الإلكتروني', splashTitle3:'مدارس أجيال المعرفة - بوابة الطفل',
        splashSub:'المنصة التعليمية الموحدة', branchTitle:'اختر الفرع', branchSub:'يرجى تحديد الفرع التعليمي المناسب',
        branchAjyalName:'أجيال المعرفة', branchAjyalDesc:'من Kg II إلى Grade 12', branchKidsName:'بوابة الطفل', branchKidsDesc:'من Kg II إلى Grade 6',
        next:'التالي', back:'رجوع', roleTitle:'اختر صلاحية الدخول', branchLabel:'الفرع:',
        roleStudent:'طالب', roleTeacher:'معلم', roleRegistrar:'مسؤول قبول', roleAdmin:'مدير النظام',
        loginTitle:'تسجيل الدخول', loginSub:'أدخل بيانات حسابك الوظيفي', emailLabel:'البريد الإلكتروني', passwordLabel:'كلمة المرور', loginBtn:'تسجيل الدخول',
        registerTitle:'تسجيل طالب', registerSub:'أدخل بيانات الطالب للتسجيل',
        fullNameLabel:'الاسم الكامل', fullNamePh:'أدخل الاسم رباعياً', idLabel:'رقم الهوية (10 أرقام)', phoneLabel:'رقم الجوال (966+10 أرقام)',
        birthdateLabel:'تاريخ الميلاد', genderLabel:'الجنس', chooseOpt:'-- اختر --', genderMale:'👨 ذكر', genderFemale:'👩 أنثى',
        typeLabel:'التصنيف', typeArab:'🌍 عربي', typeForeign:'🌍 أجنبي', nationalityLabel:'الجنسية',
        sectionLabel:'قسم الفرع (بنين / بنات)', sectionBoys:'👦 بنين', sectionGirls:'👧 بنات', gradeLabel:'المرحلة الدراسية',
        g_kg2:'🎈 KG2', g_g1:'📚 الصف الأول', g_g2:'📚 الصف الثاني', g_g3:'📚 الصف الثالث', g_g4:'📚 الصف الرابع',
        g_g5:'📚 الصف الخامس', g_g6:'📚 الصف السادس', g_g7:'📚 الصف السابع', g_g8:'📚 الصف الثامن', g_g9:'📚 الصف التاسع',
        g_g10:'📚 الصف العاشر', g_g11:'📚 الصف الحادي عشر', g_g12:'📚 الصف الثاني عشر', g_g13:'📚 الثالث الثانوي',
        registerBtn:'تسجيل الطالب', subjectsTitle:'📢 ستختبر في المواد التالية:',
        waitingTitle:'⏳ بانتظار موافقة مسؤول القبول', waitingDesc:'تم تسجيل بياناتك بنجاح! احتفظ برقم هويتك ورمزك السري للتحقق من حالتك لاحقاً.',
        idLabelShort:'رقم الهوية', idPh:'أدخل رقم هويتك', secretCodeLabel:'الرمز السري', secretCodePh:'الرمز السري الذي استلمته', checkStatusBtn:'التحقق من الحالة',
        teacherDashTitle:'لوحة المعلم', welcome:'مرحباً،', logout:'تسجيل الخروج',
        statTotalStudents:'إجمالي الطلاب', statWaitingCorrection:'بانتظار التصحيح', statDone:'تم تصحيحها', statAutoGraded:'🟢 مصححة تلقائياً',
        pendingPapersTitle:'أوراق كتابية بانتظار التصحيح', thStudent:'الطالب', thSubject:'المادة', thStatus:'الحالة', thAction:'إجراء',
        recommendationsTitle:'توصيات للطلاب', registrarDashTitle:'لوحة مسؤول القبول',
        statNewRequests:'طلبات جديدة', statAccepted:'تم القبول', statRejected:'تم الرفض', statAvg:'متوسط الدرجات',
        requestsTitle:'طلبات التسجيل', leaderboardTitle:'لوحة المتصدرين', adminDashTitle:'لوحة مدير النظام', pdfReportBtn:'تقرير PDF',
        statTotalStaff:'إجمالي الموظفين', statBranches:'الفروع', statsTitle:'الإحصائيات', byGrade:'حسب المرحلة', byBranch:'حسب الفرع', byStatus:'حسب الحالة',
        questionMgmtTitle:'إدارة الأسئلة', questionMgmtSub:'أضف أسئلة الاختبار (اختياري) للمادة والمرحلة المطلوبة',
        subjEnglish:'📘 إنجليزي', subjMath:'📗 رياضيات', subjArabic:'📙 عربي',
        g_g1_short:'الأول', g_g2_short:'الثاني', g_g3_short:'الثالث', g_g4_short:'الرابع', g_g5_short:'الخامس', g_g6_short:'السادس',
        g_g7_short:'السابع', g_g8_short:'الثامن', g_g9_short:'التاسع', g_g10_short:'العاشر', g_g11_short:'الحادي عشر', g_g12_short:'الثاني عشر', g_g13_short:'الثالث الثانوي',
        qTextPh:'نص السؤال', qOptionsPh:'الخيارات مفصولة بفاصلة , مثال: أ,ب,ج', qCorrectPh:'فهرس الإجابة الصحيحة (0 = أول خيار)', qMarksPh:'عدد الدرجات',
        addQuestionBtn:'إضافة السؤال', recentRequestsTitle:'آخر طلبات التسجيل', thName:'الاسم', thBranch:'الفرع',
        staffMgmtTitle:'إدارة حسابات الموظفين', staffMgmtSub:'أضف حساب دخول جديد لمعلم أو مسؤول قبول أو مدير نظام',
        staffNamePh:'الاسم الكامل', staffEmailPh:'البريد الإلكتروني', staffPasswordPh:'كلمة المرور (6 أحرف على الأقل)', createStaffBtn:'إنشاء الحساب',
        sectionPersonal:'البيانات الأساسية', sectionContact:'بيانات التواصل', sectionAcademic:'البيانات الأكاديمية',
        searchPh:'ابحث بالاسم أو رقم الهوية...', allSubjects:'كل المواد', allGrades:'كل المراحل',
        stepBranch:'الفرع', stepRole:'الصلاحية', stepDetails:'البيانات',
        chatTitle:'مساعد المنصة', chatWelcome:'👋 أهلاً! اختر سؤال من الأسفل وبجاوبك فوراً.',
        questionMgmtTitleReview:'مراجعة بنك الأسئلة', questionMgmtSubReview:'عرض للمراجعة فقط — الإضافة والتعديل من صلاحية مسؤول القبول',
        checkExistingStatusLink:'تحقق من حالة طلب سابق',
        roleLabel:'الدور الوظيفي', subjectLabel:'المادة', questionTextLabel:'نص السؤال', optionsLabel:'الخيارات',
        optionsHint:'افصل كل خيار بفاصلة — مثال: التفاحة,البرتقالة,الموزة',
        correctIndexLabel:'الإجابة الصحيحة', correctIndexHint:'0 = الخيار الأول، 1 = الثاني، وهكذا', marksFieldLabel:'عدد الدرجات',
        activityLogTitle:'سجل النشاط', activityLogSub:'آخر 50 عملية تمت من قبل الموظفين',
        exportCsvBtn:'تصدير Excel/CSV', bySubjectPerf:'متوسط الأداء حسب المادة',
        bulkImportTitle:'استيراد أسئلة بالجملة', bulkImportSub:'ملف JSON يحتوي مصفوفة أسئلة بنفس صيغة قاعدة البيانات',
        bulkImportBtn:'استيراد الملف', staffBranchLabel:'الفرع المخصص له (اختياري)',
        staffBranchHint:'إذا حددت فرعاً، الموظف بيشوف طلاب هذا الفرع فقط', allBranches:'كل الفروع',
        allNationalityTypes:'كل التصنيفات', bulkApproveBtn:'قبول المحدد', bulkRejectBtn:'رفض المحدد',
        systemSettingsTitle:'إعدادات النظام العامة', timeEnglishLabel:'وقت مادة الإنجليزي (دقيقة)',
        timeMathLabel:'وقت مادة الرياضيات (دقيقة)', timeArabicLabel:'وقت مادة العربي (دقيقة)',
        passThresholdLabel:'درجة النجاح (%)', saveSettingsBtn:'حفظ الإعدادات', exportQuestionsBtn:'تصدير بنك الأسئلة (نسخة احتياطية)'
    },
    en: {
        loaderText:'Preparing...', splashTitle1:'The', splashTitle2:'Electronic Assessment Platform', splashTitle3:"Ajyal Al Maarefah Schools - Kids' Gateway",
        splashSub:'The Unified Education Platform', branchTitle:'Choose a Branch', branchSub:'Please select the appropriate school branch',
        branchAjyalName:'Ajyal Al Maarefah', branchAjyalDesc:'From KG2 to Grade 12', branchKidsName:"Kids' Gateway", branchKidsDesc:'From KG2 to Grade 6',
        next:'Next', back:'Back', roleTitle:'Choose Access Role', branchLabel:'Branch:',
        roleStudent:'Student', roleTeacher:'Teacher', roleRegistrar:'Admissions Officer', roleAdmin:'System Administrator',
        loginTitle:'Sign In', loginSub:'Enter your staff account details', emailLabel:'Email Address', passwordLabel:'Password', loginBtn:'Sign In',
        registerTitle:'Student Registration', registerSub:'Enter the student details to register',
        fullNameLabel:'Full Name', fullNamePh:'Enter full name (4 parts)', idLabel:'National ID (10 digits)', phoneLabel:'Mobile Number (966+10 digits)',
        birthdateLabel:'Date of Birth', genderLabel:'Gender', chooseOpt:'-- Select --', genderMale:'👨 Male', genderFemale:'👩 Female',
        typeLabel:'Category', typeArab:'🌍 Arab', typeForeign:'🌍 Foreign', nationalityLabel:'Nationality',
        sectionLabel:'Section (Boys / Girls)', sectionBoys:'👦 Boys', sectionGirls:'👧 Girls', gradeLabel:'Grade Level',
        g_kg2:'🎈 KG2', g_g1:'📚 Grade 1', g_g2:'📚 Grade 2', g_g3:'📚 Grade 3', g_g4:'📚 Grade 4',
        g_g5:'📚 Grade 5', g_g6:'📚 Grade 6', g_g7:'📚 Grade 7', g_g8:'📚 Grade 8', g_g9:'📚 Grade 9',
        g_g10:'📚 Grade 10', g_g11:'📚 Grade 11', g_g12:'📚 Grade 12', g_g13:'📚 Grade 13',
        registerBtn:'Register Student', subjectsTitle:'📢 You will be assessed in the following subjects:',
        waitingTitle:'⏳ Awaiting Admissions Approval', waitingDesc:'Your details were registered successfully! Keep your ID number and secret code to check your status later.',
        idLabelShort:'National ID', idPh:'Enter your national ID', secretCodeLabel:'Secret Code', secretCodePh:'The secret code you received', checkStatusBtn:'Check Status',
        teacherDashTitle:'Teacher Dashboard', welcome:'Welcome,', logout:'Sign Out',
        statTotalStudents:'Total Students', statWaitingCorrection:'Awaiting Marking', statDone:'Marked', statAutoGraded:'🟢 Auto-graded',
        pendingPapersTitle:'Written Papers Awaiting Marking', thStudent:'Student', thSubject:'Subject', thStatus:'Status', thAction:'Action',
        recommendationsTitle:'Student Recommendations', registrarDashTitle:'Admissions Officer Dashboard',
        statNewRequests:'New Requests', statAccepted:'Accepted', statRejected:'Rejected', statAvg:'Average Score',
        requestsTitle:'Registration Requests', leaderboardTitle:'Leaderboard', adminDashTitle:'System Administrator Dashboard', pdfReportBtn:'PDF Report',
        statTotalStaff:'Total Staff', statBranches:'Branches', statsTitle:'Statistics', byGrade:'By Grade', byBranch:'By Branch', byStatus:'By Status',
        questionMgmtTitle:'Question Management', questionMgmtSub:'Add exam questions (multiple choice) for the required subject and grade',
        subjEnglish:'📘 English', subjMath:'📗 Mathematics', subjArabic:'📙 Arabic',
        g_g1_short:'Grade 1', g_g2_short:'Grade 2', g_g3_short:'Grade 3', g_g4_short:'Grade 4', g_g5_short:'Grade 5', g_g6_short:'Grade 6',
        g_g7_short:'Grade 7', g_g8_short:'Grade 8', g_g9_short:'Grade 9', g_g10_short:'Grade 10', g_g11_short:'Grade 11', g_g12_short:'Grade 12', g_g13_short:'Grade 13',
        qTextPh:'Question text', qOptionsPh:'Options separated by commas, e.g. A,B,C', qCorrectPh:'Index of correct answer (0 = first option)', qMarksPh:'Number of marks',
        addQuestionBtn:'Add Question', recentRequestsTitle:'Recent Registration Requests', thName:'Name', thBranch:'Branch',
        staffMgmtTitle:'Staff Account Management', staffMgmtSub:'Add a new login account for a teacher, admissions officer, or system administrator',
        staffNamePh:'Full name', staffEmailPh:'Email address', staffPasswordPh:'Password (at least 6 characters)', createStaffBtn:'Create Account',
        sectionPersonal:'Personal Details', sectionContact:'Contact Details', sectionAcademic:'Academic Details',
        searchPh:'Search by name or ID...', allSubjects:'All Subjects', allGrades:'All Grades',
        stepBranch:'Branch', stepRole:'Role', stepDetails:'Details',
        chatTitle:'Platform Assistant', chatWelcome:'👋 Hi! Pick a question below and I\'ll answer instantly.',
        questionMgmtTitleReview:'Question Bank Review', questionMgmtSubReview:'Read-only view — additions and edits are managed by the admissions officer',
        checkExistingStatusLink:'Check a previous application status',
        roleLabel:'Job Role', subjectLabel:'Subject', questionTextLabel:'Question Text', optionsLabel:'Options',
        optionsHint:'Separate each option with a comma — e.g. Apple,Orange,Banana',
        correctIndexLabel:'Correct Answer', correctIndexHint:'0 = first option, 1 = second, and so on', marksFieldLabel:'Number of Marks',
        activityLogTitle:'Activity Log', activityLogSub:'Last 50 actions taken by staff',
        exportCsvBtn:'Export Excel/CSV', bySubjectPerf:'Average Performance by Subject',
        bulkImportTitle:'Bulk Import Questions', bulkImportSub:'A JSON file containing an array of questions in the same database format',
        bulkImportBtn:'Import File', staffBranchLabel:'Assigned Branch (optional)',
        staffBranchHint:'If you set a branch, the staff member will only see that branch\'s students', allBranches:'All Branches',
        allNationalityTypes:'All Categories', bulkApproveBtn:'Approve Selected', bulkRejectBtn:'Reject Selected',
        systemSettingsTitle:'General System Settings', timeEnglishLabel:'English Subject Time (minutes)',
        timeMathLabel:'Math Subject Time (minutes)', timeArabicLabel:'Arabic Subject Time (minutes)',
        passThresholdLabel:'Pass Threshold (%)', saveSettingsBtn:'Save Settings', exportQuestionsBtn:'Export Question Bank (Backup)'
    }
};

function t(key){ return (translations[currentLang] && translations[currentLang][key]) || translations.ar[key] || key; }

function applyTranslations(){
    document.querySelectorAll('[data-i18n]').forEach(el=>{
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
        const key = el.getAttribute('data-i18n-placeholder');
        el.setAttribute('placeholder', t(key));
    });
}

function toggleLang(){
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('lang', currentLang);
    setLangAttributes();
    applyTranslations();
    refreshDynamicText();
}

function setLangAttributes(){
    document.documentElement.setAttribute('lang', currentLang === 'ar' ? 'ar' : 'en');
    document.documentElement.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
    const btn = document.getElementById('langToggle');
    if(btn) btn.textContent = currentLang === 'ar' ? 'EN' : 'ع';
}

function refreshDynamicText(){
    if(document.getElementById('chatWindow')?.classList.contains('open')) renderChatQuickReplies();
    if(selectedBranch){
        const el = document.getElementById('selectedBranchDisplay');
        if(el) el.textContent = selectedBranch==='ajyal' ? t('branchAjyalName') : t('branchKidsName');
        if(document.getElementById('pageLogin')?.classList.contains('active')) updateSchoolLogo(selectedBranch);
    }
    if(document.getElementById('pageTeacherDashboard')?.classList.contains('active')) renderTeacherDashboard();
    if(document.getElementById('pageRegistrarDashboard')?.classList.contains('active')) renderRegistrarDashboard();
    if(document.getElementById('pageAdminDashboard')?.classList.contains('active')) renderAdminDashboard();
}

// ---------------- THEME ----------------
function toggleTheme(){
    const html = document.documentElement;
    const btn = document.getElementById('themeToggle');
    if(html.getAttribute('data-theme')==='dark'){
        html.removeAttribute('data-theme'); btn.innerHTML='<i class="fas fa-moon"></i>';
        localStorage.setItem('theme','light');
    } else {
        html.setAttribute('data-theme','dark'); btn.innerHTML='<i class="fas fa-sun"></i>';
        localStorage.setItem('theme','dark');
    }
}

// ---------------- TOAST ----------------
function showToast(message, type = 'info', duration = 4500){
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success:'fa-check-circle', error:'fa-exclamation-circle', warning:'fa-triangle-exclamation', info:'fa-circle-info' };
    toast.innerHTML = `<span><i class="fas ${icons[type]||icons.info}"></i></span><span>${message}</span>
        <button class="toast-close" onclick="this.closest('.toast').remove()"><i class="fas fa-xmark"></i></button>`;
    container.appendChild(toast);
    setTimeout(()=>toast.remove(), duration);
}
function closeModal(){ document.getElementById('modalOverlay').classList.remove('open'); }

// ---------------- SPLASH ----------------
window.addEventListener('DOMContentLoaded', () => {
    setLangAttributes();
    applyTranslations();
    const saved = localStorage.getItem('theme');
    if(saved==='dark'){ document.documentElement.setAttribute('data-theme','dark'); const b=document.getElementById('themeToggle'); if(b) b.innerHTML='<i class="fas fa-sun"></i>'; }

    setTimeout(() => {
        const splash = document.getElementById('pageSplash');
        const branch = document.getElementById('pageBranch');
        if(!splash || !branch) return;
        splash.style.transition = 'opacity .5s ease';
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.classList.remove('active');
            splash.style.display = 'none';
            branch.classList.add('active');
            updateStepIndicator(1);
        }, 500);
    }, 3200);
});

// ---------------- ACTIVITY LOG ----------------
async function logActivity(action, details){
    try{
        await sb.from('activity_log').insert({
            actor_id: currentUserProfile?.id || null,
            actor_name: currentUserProfile?.name || 'نظام',
            action, details: details || null
        });
    } catch(e){ /* تجاهل أخطاء التسجيل حتى لا توقف العملية الأساسية */ }
}
async function loadActivityLog(){
    const isAr = currentLang==='ar';
    const container = document.getElementById('activityLogList');
    if(!container) return;
    const { data, error } = await sb.from('activity_log').select('*').order('created_at',{ascending:false}).limit(50);
    if(error || !data || data.length===0){ container.innerHTML = `<div class="empty-state">${isAr?'لا يوجد نشاط مسجل بعد':'No activity logged yet'}</div>`; return; }
    container.innerHTML = data.map(a=>{
        const time = new Date(a.created_at).toLocaleString(isAr?'ar-SA':'en-GB');
        return `<div class="qa-list-item"><span>👤 <strong>${a.actor_name||'—'}</strong> — ${a.action}${a.details?' · '+a.details:''}</span><span style="font-size:11px;color:var(--muted);white-space:nowrap;">${time}</span></div>`;
    }).join('');
}

// ---------------- STANDALONE STATUS CHECK (لطالب راجع بجلسة جديدة) ----------------
function openStatusCheckModal(){
    const isAr = currentLang==='ar';
    const modal=document.getElementById('modalOverlay'), title=document.getElementById('modalTitle'), content=document.getElementById('modalContent');
    title.textContent = isAr ? '🔍 التحقق من حالة الطلب' : '🔍 Check Application Status';
    content.innerHTML = `
        <div class="form-group"><label>${isAr?'رقم الهوية':'National ID'}</label>
            <input type="text" id="standaloneCheckId" placeholder="${isAr?'أدخل رقم هويتك':'Enter your national ID'}" /></div>
        <div class="form-group"><label>${isAr?'الرمز السري':'Secret Code'}</label>
            <input type="text" id="standaloneCheckCode" placeholder="${isAr?'الرمز السري الذي استلمته':'The secret code you received'}" /></div>
        <div id="standaloneCheckResult" style="margin-top:8px;font-size:13px;font-weight:600;"></div>
        <div style="display:flex;gap:10px;margin-top:14px;">
            <button class="btn btn-primary" onclick="submitStandaloneCheck()" style="flex:1;">${isAr?'تحقق':'Check'}</button>
            <button class="btn btn-secondary" onclick="closeModal()" style="flex:1;">${isAr?'إغلاق':'Close'}</button>
        </div>`;
    modal.classList.add('open');
}
async function submitStandaloneCheck(){
    const isAr = currentLang==='ar';
    const nid = document.getElementById('standaloneCheckId').value.trim();
    const code = document.getElementById('standaloneCheckCode').value.trim();
    const resultEl = document.getElementById('standaloneCheckResult');
    if(!nid||!code){ resultEl.innerHTML = `<span style="color:var(--danger);">⚠️ ${isAr?'أدخل رقم الهوية والرمز السري':'Enter your ID and secret code'}</span>`; return; }

    resultEl.innerHTML = `<span class="spinner"></span> ${isAr?'جاري التحقق...':'Checking...'}`;
    const { data, error } = await sb.rpc('check_student_status', { p_national_id:nid, p_secret_code:code });
    if(error){ resultEl.innerHTML = `<span style="color:var(--danger);">⚠️ ${isAr?'لم يتم العثور على بيانات مطابقة':'No matching record found'}</span>`; return; }

    currentStudent = { id:data.id, secret_code:data.secret_code, national_id:nid };
    resultEl.innerHTML = `<span style="color:var(--success);">${getStatusLabel(data.status)}</span>`;

    if(data.status==='approved'){
        const msg = isAr ? '✅ تمت الموافقة على طلبك! هل تريد دخول الاختبار الآن؟' : '✅ Your request has been approved! Do you want to start the exam now?';
        if(confirm(msg)){ closeModal(); goToExam(data.id, data.secret_code); }
    } else if(data.status==='rejected'){
        const reasonTxt = data.rejection_reason ? `: ${data.rejection_reason}` : '';
        resultEl.innerHTML += `<div style="margin-top:6px;">${isAr?'سبب الرفض':'Rejection reason'}${reasonTxt}</div>`;
    }
}

// ---------------- STEP INDICATOR ----------------
function updateStepIndicator(step){
    const el = document.getElementById('stepIndicator');
    if(!el) return;
    if(step===0){ el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    [1,2,3].forEach(n=>{
        const stepEl = document.getElementById('step'+n);
        stepEl.classList.remove('active','done');
        if(n<step) stepEl.classList.add('done');
        else if(n===step) stepEl.classList.add('active');
    });
}

// ---------------- NAVIGATION ----------------
function selectBranch(branch){
    selectedBranch = branch;
    document.querySelectorAll('.branch-card').forEach(el=>el.classList.remove('active'));
    document.getElementById(branch==='ajyal'?'branchAjyal':'branchKids').classList.add('active');
    document.getElementById('btnBranchNext').disabled = false;
    const sectionGroup = document.getElementById('ajyalSectionGroup');
    if(branch==='ajyal') sectionGroup.classList.add('show'); else sectionGroup.classList.remove('show');
    updateGradeOptions(branch);
}
function goToRole(){
    if(!selectedBranch) return;
    document.getElementById('selectedBranchDisplay').textContent = selectedBranch==='ajyal' ? t('branchAjyalName') : t('branchKidsName');
    document.getElementById('pageBranch').classList.remove('active');
    document.getElementById('pageRole').classList.add('active');
    updateStepIndicator(2);
}
function goToBranch(){
    document.getElementById('pageRole').classList.remove('active');
    document.getElementById('pageBranch').classList.add('active');
    updateStepIndicator(1);
}
function updateGradeOptions(branch){
    const select = document.getElementById('studentGrade');
    select.querySelectorAll('option').forEach(opt=>{
        opt.style.display='';
        if(branch==='kids' && ['g7','g8','g9','g10','g11','g12','g13'].includes(opt.value)) opt.style.display='none';
    });
    select.value='';
}
function selectRole(role){
    selectedRole = role;
    document.querySelectorAll('.role-btn').forEach(el=>el.classList.remove('active'));
    const map = { student:'roleStudent', teacher:'roleTeacher', registrar:'roleRegistrar', admin:'roleAdmin' };
    document.getElementById(map[role]).classList.add('active');
    document.getElementById('btnRoleNext').disabled = false;
}
function goToNextPage(){
    if(!selectedRole) return;
    if(selectedRole==='student'){
        document.getElementById('pageRole').classList.remove('active');
        document.getElementById('pageStudentRegister').classList.add('active');
        document.getElementById('registerForm').style.display='block';
        document.getElementById('waitingMessage').classList.add('hidden');
        updateStepIndicator(3);
        return;
    }
    updateSchoolLogo(selectedBranch);
    document.getElementById('pageRole').classList.remove('active');
    document.getElementById('pageLogin').classList.add('active');
    updateStepIndicator(3);
}
function backToRoleFromForm(){
    document.getElementById('pageLogin').classList.remove('active');
    document.getElementById('pageStudentRegister').classList.remove('active');
    document.getElementById('pageRole').classList.add('active');
    updateStepIndicator(2);
}
let _studentsRealtimeChannel = null;
function subscribeToNewStudents(){
    if(_studentsRealtimeChannel) return;
    const isAr = currentLang==='ar';
    _studentsRealtimeChannel = sb.channel('new-students')
        .on('postgres_changes', { event:'INSERT', schema:'public', table:'students' }, (payload)=>{
            const name = payload.new?.name || '';
            showToast(isAr ? `🔔 طالب جديد سجّل: ${name}` : `🔔 New student registered: ${name}`, 'info', 8000);
            if(document.getElementById('pageRegistrarDashboard')?.classList.contains('active')) renderRegistrarDashboard();
        })
        .subscribe();
}
function unsubscribeFromNewStudents(){
    if(_studentsRealtimeChannel){ sb.removeChannel(_studentsRealtimeChannel); _studentsRealtimeChannel = null; }
}

function logout(){
    sb.auth.signOut();
    unsubscribeFromNewStudents();
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    selectedBranch=''; selectedRole=''; currentUserProfile=null;
    document.querySelectorAll('.branch-card,.role-btn').forEach(el=>el.classList.remove('active'));
    document.getElementById('btnBranchNext').disabled=true;
    document.getElementById('btnRoleNext').disabled=true;
    document.getElementById('pageBranch').classList.add('active');
    updateStepIndicator(1);
    showToast(currentLang==='ar' ? '👋 تم تسجيل الخروج' : '👋 Signed out successfully', 'info');
}
function updateSchoolLogo(branch){
    const info = BRANCH_INFO[branch];
    const img = document.getElementById('schoolLogoImg');
    const name = document.getElementById('schoolNameDisplay');
    const sub = document.getElementById('schoolSubDisplay');
    const est = document.getElementById('schoolEstDisplay');
    if(!info){ if(img) img.src=''; if(name) name.textContent=''; if(sub) sub.textContent=''; if(est) est.textContent=''; return; }
    if(img) img.src = info.logo;
    if(name) name.textContent = info.name[currentLang];
    if(sub) sub.textContent = info.sub[currentLang];
    if(est) est.textContent = info.est[currentLang];
}

// ---------------- STAFF LOGIN ----------------
async function login(){
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const status = document.getElementById('loginStatus');
    const btn = document.getElementById('loginBtn');

    if(!email || !password){
        status.innerHTML = `<span style="color:var(--danger);">${currentLang==='ar'?'❌ يرجى إدخال جميع البيانات':'❌ Please enter all fields'}</span>`;
        return;
    }
    btn.disabled = true;
    status.innerHTML = `<span class="spinner"></span> ${currentLang==='ar'?'جاري التحقق...':'Verifying...'}`;

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if(error){
        btn.disabled = false;
        status.innerHTML = `<span style="color:var(--danger);">❌ ${currentLang==='ar'?'بيانات الدخول غير صحيحة':'Invalid login credentials'}</span>`;
        return;
    }

    const { data: profile, error: pErr } = await sb.from('profiles').select('*').eq('id', data.user.id).single();
    btn.disabled = false;
    if(pErr || !profile){
        status.innerHTML = `<span style="color:var(--danger);">❌ ${currentLang==='ar'?'لا يوجد ملف موظف مرتبط بهذا الحساب':'No staff profile linked to this account'}</span>`;
        await sb.auth.signOut();
        return;
    }
    currentUserProfile = profile;
    status.innerHTML = `<span style="color:var(--success);">✅ ${currentLang==='ar'?'مرحباً! جاري تحويلك...':'Welcome! Redirecting...'}</span>`;

    document.getElementById('pageLogin').classList.remove('active');
    updateStepIndicator(0);
    if(profile.role==='teacher'){
        document.getElementById('teacherNameDisplay').textContent = profile.name;
        await renderTeacherDashboard();
        document.getElementById('pageTeacherDashboard').classList.add('active');
    } else if(profile.role==='registrar'){
        document.getElementById('registrarNameDisplay').textContent = profile.name;
        await renderRegistrarDashboard();
        document.getElementById('pageRegistrarDashboard').classList.add('active');
        subscribeToNewStudents();
    } else if(profile.role==='admin'){
        document.getElementById('adminNameDisplay').textContent = profile.name;
        await renderAdminDashboard();
        document.getElementById('pageAdminDashboard').classList.add('active');
    }
    showToast(currentLang==='ar' ? '✅ تم تسجيل الدخول بنجاح' : '✅ Signed in successfully', 'success');
}

// ---------------- HELPERS ----------------
const GRADE_KEYS = { kg2:'g_kg2', g1:'g_g1', g2:'g_g2', g3:'g_g3', g4:'g_g4', g5:'g_g5', g6:'g_g6', g7:'g_g7', g8:'g_g8', g9:'g_g9', g10:'g_g10', g11:'g_g11', g12:'g_g12', g13:'g_g13' };
function getGradeLabel(code){ return t(GRADE_KEYS[code] || code).replace(/^[^\wأ-ي]+/u,'').trim(); }
function getSubjectLabel(sub){ return { english:t('subjEnglish'), math:t('subjMath'), arabic:t('subjArabic') }[sub] || sub; }
function getBranchLabel(b){ return b==='ajyal' ? t('branchAjyalName') : t('branchKidsName'); }
function getStatusLabel(status){
    const map = {
        pending: currentLang==='ar' ? '⏳ بانتظار' : '⏳ Pending',
        approved: currentLang==='ar' ? '✅ مقبول' : '✅ Approved',
        rejected: currentLang==='ar' ? '❌ مرفوض' : '❌ Rejected',
        waiting_correction: currentLang==='ar' ? '⏳ بانتظار التصحيح' : '⏳ Awaiting marking',
        corrected: currentLang==='ar' ? '✅ تم التصحيح' : '✅ Marked',
        auto: currentLang==='ar' ? '🟢 تلقائي' : '🟢 Auto-graded'
    };
    return map[status] || status;
}

function toggleNationalities(){
    const type = document.getElementById('studentNationalityType').value;
    const group = document.getElementById('nationalitySpecific');
    const select = document.getElementById('studentNationality');
    if(type==='arab' || type==='foreign'){
        group.classList.add('show');
        select.innerHTML = `<option value="">${t('chooseOpt')}</option>`;
        (nationalities[type]||[]).forEach(item=>{
            const label = currentLang==='ar' ? item[1] : item[2];
            select.innerHTML += `<option value="${item[0]}">${label}</option>`;
        });
    } else { group.classList.remove('show'); select.innerHTML = `<option value="">${t('chooseOpt')}</option>`; }
}
function calculateAge(){
    const birthdate = document.getElementById('studentBirthdate').value;
    const display = document.getElementById('ageDisplay');
    if(!birthdate){ display.textContent=''; display.className='age-display'; return; }
    const today = new Date(), birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if(m<0 || (m===0 && today.getDate()<birth.getDate())) age--;
    if(age>=3 && age<=18){
        display.textContent = currentLang==='ar' ? `✅ العمر: ${age} سنة` : `✅ Age: ${age} years`;
        display.className='age-display valid';
    } else {
        display.textContent = currentLang==='ar' ? `⚠️ العمر: ${age} سنة (غير مناسب)` : `⚠️ Age: ${age} years (not eligible)`;
        display.className='age-display invalid';
    }
}

// ---------------- STUDENT REGISTRATION (RPC) ----------------
async function registerStudent(){
    const name = document.getElementById('studentName').value.trim();
    const id = document.getElementById('studentId').value.trim();
    const phone = document.getElementById('studentPhone').value.trim();
    const birthdate = document.getElementById('studentBirthdate').value;
    const gender = document.getElementById('studentGender').value;
    const nationalityType = document.getElementById('studentNationalityType').value;
    const nationality = document.getElementById('studentNationality').value;
    const grade = document.getElementById('studentGrade').value;
    const ajyalSection = document.getElementById('ajyalSection').value;
    const status = document.getElementById('studentStatus');
    const btn = document.getElementById('registerBtn');
    const isAr = currentLang==='ar';

    if(!name||!id||!phone||!birthdate||!gender||!nationalityType||!grade){
        status.innerHTML = `<span style="color:var(--danger);">⚠️ ${isAr?'يرجى تعبئة جميع الحقول المطلوبة':'Please fill in all required fields'}</span>`; return;
    }
    if(selectedBranch==='ajyal' && !ajyalSection){
        status.innerHTML = `<span style="color:var(--danger);">⚠️ ${isAr?'يرجى اختيار قسم الفرع':'Please select the section'}</span>`; return;
    }
    if(id.length!==10){
        status.innerHTML = `<span style="color:var(--danger);">⚠️ ${isAr?'رقم الهوية يجب أن يكون 10 أرقام':'National ID must be 10 digits'}</span>`; return;
    }
    if(phone.length!==13 || !phone.startsWith('966')){
        status.innerHTML = `<span style="color:var(--danger);">⚠️ ${isAr?'رقم الجوال يجب أن يبدأ بـ966 ويكون 13 رقم':'Mobile number must start with 966 and be 13 digits'}</span>`; return;
    }
    const today=new Date(), birth=new Date(birthdate);
    let age = today.getFullYear()-birth.getFullYear();
    const m = today.getMonth()-birth.getMonth();
    if(m<0 || (m===0 && today.getDate()<birth.getDate())) age--;
    if(age<3||age>18){ status.innerHTML = `<span style="color:var(--danger);">⚠️ ${isAr?'العمر غير مناسب':'Age not eligible'} (${age})</span>`; return; }

    btn.disabled = true;
    status.innerHTML = `<span class="spinner"></span> ${isAr?'جاري التسجيل...':'Registering...'}`;

    const { data, error } = await sb.rpc('register_student', {
        p_name:name, p_national_id:id, p_phone:phone, p_birthdate:birthdate,
        p_gender:gender, p_nationality_type:nationalityType, p_nationality:nationality||null,
        p_grade:grade, p_branch:selectedBranch, p_ajyal_section:ajyalSection||null
    });
    btn.disabled = false;

    if(error){
        status.innerHTML = `<span style="color:var(--danger);">⚠️ ${error.message.includes('DUPLICATE_ID') ? (isAr?'هذا الرقم مسجل مسبقاً':'This ID is already registered') : (isAr?'حدث خطأ':'An error occurred')}</span>`;
        showToast(isAr?'⚠️ تعذر إتمام التسجيل':'⚠️ Registration failed', 'error');
        return;
    }

    currentStudent = { id: data.id, secret_code: data.secret_code, national_id: id };
    showToast(`✅ ${isAr?'تم التسجيل! الرمز السري':'Registered! Secret code'}: ${data.secret_code}`, 'success', 9000);

    const isArab = nationalityType==='arab';
    const subjectsList = document.getElementById('subjectsList');
    subjectsList.innerHTML='';
    const subjects = [{icon:'📘', key:'subjEnglish'},{icon:'📗', key:'subjMath'}];
    if(isArab) subjects.push({icon:'📙', key:'subjArabic'});
    subjects.forEach(s=>{
        const span=document.createElement('span');
        span.className='subject-tag'; span.textContent = t(s.key);
        subjectsList.appendChild(span);
    });
    document.getElementById('subjectsMessage').classList.remove('hidden');
    document.getElementById('registerForm').style.display='none';
    document.getElementById('waitingMessage').classList.remove('hidden');
    document.getElementById('checkNationalId').value = id;
    document.getElementById('checkSecretCode').value = data.secret_code;
    document.getElementById('studentStatusBadge').textContent = getStatusLabel('pending');
    status.innerHTML='';
}

async function checkStudentStatus(){
    const isAr = currentLang==='ar';
    const nid = document.getElementById('checkNationalId').value.trim();
    const code = document.getElementById('checkSecretCode').value.trim();
    if(!nid||!code){ showToast(isAr?'⚠️ أدخل رقم الهوية والرمز السري':'⚠️ Enter your national ID and secret code', 'warning'); return; }

    const { data, error } = await sb.rpc('check_student_status', { p_national_id:nid, p_secret_code:code });
    const badge = document.getElementById('studentStatusBadge');
    if(error){ showToast(isAr?'⚠️ لم يتم العثور على بيانات مطابقة':'⚠️ No matching record found', 'error'); return; }

    currentStudent = { id:data.id, secret_code:data.secret_code, national_id:nid };
    badge.textContent = getStatusLabel(data.status);
    badge.className = 'status-badge ' + (data.status==='approved'?'approved':data.status==='rejected'?'rejected':'pending');

    if(data.status==='pending'){
        showToast(isAr?'⏳ لا تزال طلباتك قيد المراجعة':'⏳ Your request is still under review', 'info');
    } else if(data.status==='approved'){
        showToast(isAr?'✅ تمت الموافقة على طلبك!':'✅ Your request has been approved!', 'success');
        const msg = isAr ? '✅ تمت الموافقة على طلبك! هل تريد دخول الاختبار الآن؟' : '✅ Your request has been approved! Do you want to start the exam now?';
        if(confirm(msg)) goToExam(data.id, data.secret_code);
    } else if(data.status==='rejected'){
        const reasonTxt = data.rejection_reason ? `: ${data.rejection_reason}` : '';
        showToast(`❌ ${isAr?'تم رفض طلبك':'Your request was rejected'}${reasonTxt}`, 'error');
    }
}

// ---------------- EXAM HANDOFF ----------------
function goToExam(studentId, secretCode){
    sessionStorage.setItem('examStudentId', studentId);
    sessionStorage.setItem('examSecretCode', secretCode);
    showExamLoader(()=> window.location.href='exam.html');
}
function showExamLoader(callback){
    const loader=document.getElementById('examLoader'), bar=document.getElementById('loaderBar');
    loader.classList.add('open'); bar.style.width='0%';
    let progress=0;
    const interval=setInterval(()=>{
        progress += Math.random()*15+5;
        if(progress>=100){ progress=100; clearInterval(interval); setTimeout(()=>{ loader.classList.remove('open'); callback&&callback(); }, 400); }
        bar.style.width=Math.min(progress,100)+'%';
    }, 150);
}

// ---------------- REGISTRAR DASHBOARD ----------------
async function renderRegistrarDashboard(){
    const isAr = currentLang==='ar';
    let query = sb.from('students').select('*').order('created_at',{ascending:false});
    if(currentUserProfile?.branch) query = query.eq('branch', currentUserProfile.branch);
    const { data: students, error } = await query;
    if(error){ showToast('❌ '+error.message,'error'); return; }
    window._registrarStudentsCache = students;

    document.getElementById('registrarStatPending').textContent = students.filter(s=>s.status==='pending').length;
    document.getElementById('registrarStatAccepted').textContent = students.filter(s=>s.status==='approved').length;
    document.getElementById('registrarStatRejected').textContent = students.filter(s=>s.status==='rejected').length;

    const { data: results } = await sb.from('exam_results').select('student_id, score, total').not('score','is',null);
    const avgByStudent = {};
    (results||[]).forEach(r=>{ avgByStudent[r.student_id] = avgByStudent[r.student_id] || []; avgByStudent[r.student_id].push(r.score/r.total*10); });
    const allAvgs = Object.values(avgByStudent).map(arr=>arr.reduce((a,b)=>a+b,0)/arr.length);
    document.getElementById('registrarStatAvg').textContent = allAvgs.length ? (allAvgs.reduce((a,b)=>a+b,0)/allAvgs.length).toFixed(1) : 0;

    filterRegistrarList();
    await renderLeaderboard();
    loadQuestionsList('registrar');
}

let _bulkSelectedIds = new Set();
function filterRegistrarList(){
    const isAr = currentLang==='ar';
    const students = window._registrarStudentsCache || [];
    const list = document.getElementById('registrarRequestsList');
    list.innerHTML='';
    const searchEl = document.getElementById('registrarSearch');
    const query = (searchEl?.value||'').trim().toLowerCase();
    const gradeFilter = document.getElementById('registrarGradeFilter')?.value || '';
    const nationalityFilter = document.getElementById('registrarNationalityFilter')?.value || '';

    let filteredStudents = query ? students.filter(s=>s.name.toLowerCase().includes(query) || s.national_id.includes(query)) : students;
    if(gradeFilter) filteredStudents = filteredStudents.filter(s=>s.grade===gradeFilter);
    if(nationalityFilter) filteredStudents = filteredStudents.filter(s=>s.nationality_type===nationalityFilter);

    if(filteredStudents.length===0){ list.innerHTML = `<div class="empty-state">${isAr?(query?'لا توجد نتائج مطابقة':'لا توجد طلبات حالياً'):(query?'No matching results':'No requests yet')}</div>`; }
    else {
        filteredStudents.forEach(s=>{
            const statusBadge = `<span class="badge-status ${s.status==='pending'?'pending':s.status==='approved'?'accepted':'rejected'}">${getStatusLabel(s.status)}</span>`;
            let actions='';
            let checkbox = '';
            if(s.status==='pending'){
                checkbox = `<input type="checkbox" class="bulk-select-cb" data-id="${s.id}" onchange="toggleBulkSelect('${s.id}', this.checked)" ${_bulkSelectedIds.has(s.id)?'checked':''} style="width:18px;height:18px;margin-left:8px;" />`;
                actions = `<div class="request-actions">
                    <button class="btn-sm approve" onclick="approveStudent('${s.id}')">✅ ${isAr?'قبول':'Approve'}</button>
                    <button class="btn-sm reject" onclick="rejectStudent('${s.id}')">❌ ${isAr?'رفض':'Reject'}</button></div>`;
            } else if(s.status==='approved'){
                actions = `<div class="request-actions">
                    <button class="btn-sm exam" onclick="goToExam('${s.id}','${s.secret_code}')">📝 ${isAr?'دخول الاختبار':'Start Exam'}</button>
                    <button class="btn-sm view-score" onclick="showStudentScores('${s.id}')">📊 ${isAr?'عرض النتائج':'View Results'}</button></div>`;
            } else {
                actions = `<span style="color:var(--danger);font-weight:700;">${isAr?'سبب الرفض':'Rejection reason'}: ${s.rejection_reason||(isAr?'غير محدد':'Not specified')}</span>`;
            }
            const nationalityLabel = s.nationality_type==='arab' ? (isAr?'عربي':'Arab') : (isAr?'أجنبي':'Foreign');
            list.innerHTML += `<div class="request-card">
                <div class="request-info">
                    ${checkbox}<span>👤 ${s.name}</span><span>🆔 ${s.national_id}</span><span>📱 ${s.phone}</span>
                    <span>🌍 ${nationalityLabel}</span><span>📚 ${getGradeLabel(s.grade)}</span>
                    <span>🏫 ${getBranchLabel(s.branch)}</span>${statusBadge}
                </div>${actions}</div>`;
        });
    }
    updateBulkActionsBar();
}
function toggleBulkSelect(id, checked){
    if(checked) _bulkSelectedIds.add(id); else _bulkSelectedIds.delete(id);
    updateBulkActionsBar();
}
function updateBulkActionsBar(){
    const isAr = currentLang==='ar';
    const bar = document.getElementById('bulkActionsBar');
    const countEl = document.getElementById('bulkSelectedCount');
    if(_bulkSelectedIds.size>0){
        bar.classList.remove('hidden');
        countEl.textContent = isAr ? `✅ ${_bulkSelectedIds.size} محدد` : `✅ ${_bulkSelectedIds.size} selected`;
    } else {
        bar.classList.add('hidden');
    }
}
async function bulkApprove(){
    const isAr = currentLang==='ar';
    const ids = Array.from(_bulkSelectedIds);
    if(ids.length===0) return;
    if(!confirm(isAr?`متأكد تبي تقبل ${ids.length} طالب؟`:`Approve ${ids.length} students?`)) return;
    const { error } = await sb.from('students').update({
        status:'approved', approved_by: currentUserProfile?.id, approved_at: new Date().toISOString()
    }).in('id', ids);
    if(error){ showToast('❌ '+error.message,'error'); return; }
    logActivity(isAr?'قبول جماعي':'Bulk approved', `${ids.length} ${isAr?'طالب':'students'}`);
    showToast(isAr?'✅ تم قبول الطلاب المحددين':'✅ Selected students approved', 'success');
    _bulkSelectedIds.clear();
    renderRegistrarDashboard();
}
async function bulkReject(){
    const isAr = currentLang==='ar';
    const ids = Array.from(_bulkSelectedIds);
    if(ids.length===0) return;
    const reason = prompt(isAr?'✏️ سبب الرفض لكل الطلاب المحددين:':'✏️ Rejection reason for all selected students:');
    if(reason===null) return;
    const { error } = await sb.from('students').update({ status:'rejected', rejection_reason: reason||(isAr?'غير محدد':'Not specified') }).in('id', ids);
    if(error){ showToast('❌ '+error.message,'error'); return; }
    logActivity(isAr?'رفض جماعي':'Bulk rejected', `${ids.length} ${isAr?'طالب':'students'}`);
    showToast(isAr?'❌ تم رفض الطلاب المحددين':'❌ Selected students rejected', 'error');
    _bulkSelectedIds.clear();
    renderRegistrarDashboard();
}

async function approveStudent(studentId){
    const { error } = await sb.from('students').update({
        status:'approved', approved_by: currentUserProfile?.id, approved_at: new Date().toISOString()
    }).eq('id', studentId);
    if(error){ showToast('❌ '+error.message,'error'); return; }
    const st = (window._registrarStudentsCache||[]).find(s=>s.id===studentId);
    logActivity(currentLang==='ar'?'قبل طالب':'Approved student', st?.name || studentId);
    showToast(currentLang==='ar'?'✅ تم قبول الطالب':'✅ Student approved', 'success');
    renderRegistrarDashboard();
}
async function rejectStudent(studentId){
    const isAr = currentLang==='ar';
    const reason = prompt(isAr?'✏️ يرجى كتابة سبب الرفض:':'✏️ Please write the rejection reason:');
    if(reason===null) return;
    const { error } = await sb.from('students').update({ status:'rejected', rejection_reason: reason || (isAr?'غير محدد':'Not specified') }).eq('id', studentId);
    if(error){ showToast('❌ '+error.message,'error'); return; }
    const st = (window._registrarStudentsCache||[]).find(s=>s.id===studentId);
    logActivity(isAr?'رفض طالب':'Rejected student', st?.name || studentId);
    showToast(isAr?'❌ تم رفض الطالب':'❌ Student rejected', 'error');
    renderRegistrarDashboard();
}
async function showStudentScores(studentId){
    const isAr = currentLang==='ar';
    const { data: student } = await sb.from('students').select('*').eq('id',studentId).single();
    const { data: results } = await sb.from('exam_results').select('*').eq('student_id',studentId);
    const modal=document.getElementById('modalOverlay'), title=document.getElementById('modalTitle'), content=document.getElementById('modalContent');
    title.textContent = `📊 ${isAr?'درجات':'Scores for'} ${student?.name||''}`;
    if(!results || results.length===0){ content.innerHTML = `<div class="empty-state">${isAr?'لا توجد نتائج بعد':'No results yet'}</div>`; modal.classList.add('open'); return; }

    let html = '<div style="background:var(--bg);border-radius:12px;padding:14px;">';
    let total=0, count=0;
    results.forEach(r=>{
        const scoreText = r.status==='waiting_correction' ? getStatusLabel('waiting_correction') : `${r.score} / ${r.total}`;
        if(r.status!=='waiting_correction' && r.score!=null){ total+=r.score/r.total*10; count++; }
        html += `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
            <span>${getSubjectLabel(r.subject)}</span><span style="font-weight:800;">${scoreText}</span></div>`;
    });
    const avg = count>0 ? (total/count).toFixed(1) : '--';
    html += `<div style="display:flex;justify-content:space-between;padding:10px 0;margin-top:8px;border-top:2px solid var(--gold-solid);">
        <span style="font-weight:800;">${isAr?'المعدل (من 10)':'Average (out of 10)'}</span><span style="font-weight:900;font-size:20px;color:var(--gold-solid);">${avg}</span></div></div>
        <button class="btn btn-secondary" onclick="closeModal()" style="margin-top:14px;width:100%;">${isAr?'إغلاق':'Close'}</button>`;
    content.innerHTML = html; modal.classList.add('open');
}
async function renderLeaderboard(){
    const isAr = currentLang==='ar';
    const container = document.getElementById('registrarLeaderboard');
    if(!container) return;
    const { data: results } = await sb.from('exam_results').select('student_id, score, total').not('score','is',null);
    const { data: students } = await sb.from('students').select('id,name,grade,branch');
    const byStudent = {};
    (results||[]).forEach(r=>{ byStudent[r.student_id] = byStudent[r.student_id] || []; byStudent[r.student_id].push(r.score/r.total*10); });
    const rows = Object.entries(byStudent).map(([sid,arr])=>{
        const st = (students||[]).find(s=>s.id===sid);
        const avg = arr.reduce((a,b)=>a+b,0)/arr.length;
        return st ? { name:st.name, grade:st.grade, branch:st.branch, avg } : null;
    }).filter(Boolean).sort((a,b)=>b.avg-a.avg).slice(0,10);

    if(rows.length===0){ container.innerHTML = `<div class="empty-state">${isAr?'لا توجد درجات لعرضها بعد':'No scores to display yet'}</div>`; return; }
    let html='';
    rows.forEach((s,i)=>{
        const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1);
        html += `<div class="request-card"><div class="request-info">
            <span>${medal}</span><span>👤 ${s.name}</span><span>📚 ${getGradeLabel(s.grade)}</span>
            <span style="font-weight:900;color:var(--gold-solid);">${s.avg.toFixed(1)} / 10</span></div></div>`;
    });
    container.innerHTML = html;
}

// ---------------- TEACHER DASHBOARD ----------------
async function renderTeacherDashboard(){
    const isAr = currentLang==='ar';
    let query = sb.from('exam_results').select('*, students!inner(name,grade,branch)').order('created_at',{ascending:false});
    if(currentUserProfile?.branch) query = query.eq('students.branch', currentUserProfile.branch);
    const { data: results, error } = await query;
    if(error){ showToast('❌ '+error.message,'error'); return; }
    window._teacherResultsCache = results || [];

    const waiting = (results||[]).filter(r=>r.status==='waiting_correction');
    const done = (results||[]).filter(r=>r.status==='corrected');

    document.getElementById('teacherStatStudents').textContent = new Set((results||[]).map(r=>r.student_id)).size;
    document.getElementById('teacherStatWaiting').textContent = waiting.length;
    document.getElementById('teacherStatDone').textContent = done.length;
    document.getElementById('teacherStatActive').textContent = (results||[]).filter(r=>r.status==='auto').length;

    renderTeacherTable();
    renderTeacherRecommendations(results||[]);
}
let _teacherActiveTab = 'waiting';
function switchTeacherTab(tab){
    _teacherActiveTab = tab;
    document.getElementById('teacherTabWaiting').classList.toggle('active', tab==='waiting');
    document.getElementById('teacherTabDone').classList.toggle('active', tab==='done');
    renderTeacherTable();
}
function renderTeacherTable(){
    const isAr = currentLang==='ar';
    let results = window._teacherResultsCache || [];
    const gradeFilter = document.getElementById('teacherGradeFilter')?.value || '';
    if(gradeFilter) results = results.filter(r=>r.students?.grade===gradeFilter);
    const body = document.getElementById('teacherStudentsBody');
    body.innerHTML = '';
    if(_teacherActiveTab==='waiting'){
        const waiting = results.filter(r=>r.status==='waiting_correction');
        if(waiting.length===0){ body.innerHTML = `<tr><td colspan="4"><div class="empty-state">${isAr?'لا توجد أوراق بانتظار التصحيح 🎉':'No papers awaiting marking 🎉'}</div></td></tr>`; }
        else waiting.forEach(r=>{
            body.innerHTML += `<tr>
                <td>${r.students?.name||'--'}</td>
                <td>${getSubjectLabel(r.subject)}</td>
                <td><span class="badge-status waiting">${getStatusLabel('waiting_correction')}</span></td>
                <td><div class="row-actions"><button class="btn-mini neutral" onclick="openCorrectionModal('${r.id}')">✏️ ${isAr?'تصحيح':'Mark'}</button></div></td>
            </tr>`;
        });
    } else {
        const done = results.filter(r=>r.status==='corrected');
        if(done.length===0){ body.innerHTML = `<tr><td colspan="4"><div class="empty-state">${isAr?'لا توجد أوراق مصححة بعد':'No marked papers yet'}</div></td></tr>`; }
        else done.forEach(r=>{
            body.innerHTML += `<tr>
                <td>${r.students?.name||'--'}</td>
                <td>${getSubjectLabel(r.subject)}</td>
                <td><span class="badge-status corrected">${r.score} / ${r.total}</span></td>
                <td><div class="row-actions"><button class="btn-mini neutral" onclick="openCorrectionModal('${r.id}')">✏️ ${isAr?'تعديل':'Edit'}</button></div></td>
            </tr>`;
        });
    }
}
function renderTeacherRecommendations(results){
    const isAr = currentLang==='ar';
    const container = document.getElementById('teacherRecommendations');
    const corrected = results.filter(r=>r.status==='corrected' && r.score!=null);
    if(corrected.length===0){ container.innerHTML = `<div class="empty-state">${isAr?'لا توجد توصيات حالياً':'No recommendations yet'}</div>`; return; }
    let html='';
    corrected.forEach(r=>{
        const pct = r.score/r.total*100;
        if(pct<60){
            html += `<div class="request-card"><div class="request-info">
                <span>👤 ${r.students?.name||''}</span><span>📌 ${isAr?'يحتاج تقوية في':'Needs support in'} ${getSubjectLabel(r.subject)}</span></div></div>`;
        }
    });
    container.innerHTML = html || `<div class="empty-state">${isAr?'جميع الطلاب في المستوى المطلوب 🎉':'All students are at the required level 🎉'}</div>`;
}
async function openCorrectionModal(resultId){
    const isAr = currentLang==='ar';
    const { data: r } = await sb.from('exam_results').select('*, students(name)').eq('id',resultId).single();
    if(!r) return;
    const modal=document.getElementById('modalOverlay'), title=document.getElementById('modalTitle'), content=document.getElementById('modalContent');
    title.textContent = `✏️ ${isAr?'تصحيح':'Marking'} ${r.students?.name||''} - ${getSubjectLabel(r.subject)}`;

    let uploadsHtml = '';
    const uploads = r.written_uploads || {};
    Object.keys(uploads).forEach(qid=>{
        uploadsHtml += `<div style="margin-bottom:10px;"><p style="font-size:13px;font-weight:700;">${isAr?'سؤال':'Question'} ${qid}</p>
            <img src="${uploads[qid]}" onclick="openImageZoom('${uploads[qid].replace(/'/g,"")}')" style="max-width:100%;border-radius:10px;border:1px solid var(--border);cursor:zoom-in;" />
            <p style="font-size:11px;color:var(--muted);margin-top:2px;">${isAr?'اضغط على الصورة للتكبير':'Click image to zoom'}</p></div>`;
    });

    content.innerHTML = `
        <div style="margin-bottom:14px;">${uploadsHtml || `<p class="page-sub">${isAr?'لا توجد صور مرفوعة لهذه المادة':'No uploaded images for this subject'}</p>`}</div>
        <div class="form-group"><label>${isAr?'الدرجة (من':'Score (out of'} ${r.total})</label>
            <input type="number" id="correctionScore" min="0" max="${r.total}" placeholder="0 - ${r.total}" /></div>
        <div class="form-group"><label>${isAr?'ملاحظة للطالب (اختياري)':'Note for student (optional)'}</label>
            <textarea id="correctionNote" rows="3" placeholder="${isAr?'مثال: راجع قواعد الجمع، خط اليد يحتاج تحسين...':'e.g. Review addition rules, handwriting needs improvement...'}" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--border);font-family:inherit;">${r.teacher_note||''}</textarea></div>
        <div style="display:flex;gap:10px;margin-top:14px;">
            <button class="btn btn-primary" onclick="submitCorrection('${resultId}', ${r.total})" style="flex:1;">${isAr?'تأكيد':'Confirm'}</button>
            <button class="btn btn-secondary" onclick="closeModal()" style="flex:1;">${isAr?'إلغاء':'Cancel'}</button>
        </div>`;
    document.getElementById('modalOverlay').classList.add('open');
}
function openImageZoom(url){
    const w = window.open('', '_blank');
    w.document.write(`<title>${currentLang==='ar'?'تكبير الصورة':'Image Zoom'}</title><body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh;"><img src="${url}" style="max-width:100%;max-height:100vh;" /></body>`);
}
async function submitCorrection(resultId, total){
    const isAr = currentLang==='ar';
    const val = parseFloat(document.getElementById('correctionScore').value);
    const note = document.getElementById('correctionNote').value.trim();
    if(isNaN(val) || val<0 || val>total){ showToast(isAr?'⚠️ يرجى إدخال درجة صحيحة':'⚠️ Please enter a valid score', 'warning'); return; }
    const { error } = await sb.from('exam_results').update({
        score: val, status:'corrected', corrected_by: currentUserProfile?.id, corrected_at: new Date().toISOString(),
        teacher_note: note || null
    }).eq('id', resultId);
    if(error){ showToast('❌ '+error.message,'error'); return; }
    logActivity(isAr?'صحّح ورقة اختبار':'Marked an exam paper', `${val}/${total}`);
    closeModal();
    showToast(isAr?'✅ تم حفظ التصحيح':'✅ Marking saved', 'success');
    renderTeacherDashboard();
}

// ---------------- ADMIN DASHBOARD ----------------
async function renderAdminDashboard(){
    const { data: students } = await sb.from('students').select('*');
    const { data: profiles } = await sb.from('profiles').select('*');
    const { data: results } = await sb.from('exam_results').select('subject,score,total').not('score','is',null);

    document.getElementById('adminStatStudents').textContent = students?.length||0;
    document.getElementById('adminStatTeachers').textContent = profiles?.length||0;
    const avgs = (results||[]).map(r=>r.score/r.total*10);
    document.getElementById('adminStatAvg').textContent = avgs.length ? (avgs.reduce((a,b)=>a+b,0)/avgs.length).toFixed(1) : 0;

    window._adminStudentsCache = students || [];
    filterAdminList();

    createCharts(students||[], results||[]);
    loadQuestionsList();
    loadStaffList();
    loadActivityLog();
    loadSettingsIntoForm();
}
function filterAdminList(){
    const isAr = currentLang==='ar';
    const students = window._adminStudentsCache || [];
    const body = document.getElementById('adminRequestsBody');
    body.innerHTML='';
    const searchEl = document.getElementById('adminSearch');
    const query = (searchEl?.value||'').trim().toLowerCase();
    const filtered = query ? students.filter(s=>s.name.toLowerCase().includes(query) || s.national_id.includes(query)) : students;
    const recent = [...filtered].reverse().slice(0, query ? 50 : 8);
    if(recent.length===0){ body.innerHTML = `<tr><td colspan="4"><div class="empty-state">${isAr?(query?'لا توجد نتائج مطابقة':'لا توجد طلبات'):(query?'No matching results':'No requests')}</div></td></tr>`; }
    else recent.forEach(s=>{
        const badge = `<span class="badge-status ${s.status==='pending'?'pending':s.status==='approved'?'accepted':'rejected'}">${getStatusLabel(s.status)}</span>`;
        body.innerHTML += `<tr><td>${s.name}</td><td>${getBranchLabel(s.branch)}</td><td>${badge}</td>
            <td>${s.status==='approved'?`<button class="btn-mini view" onclick="showStudentScores('${s.id}')">📊 ${isAr?'عرض':'View'}</button>`:'--'}</td></tr>`;
    });
}
function createCharts(students, results){
    const isAr = currentLang==='ar';
    const gradeMap={}; students.forEach(s=>gradeMap[s.grade]=(gradeMap[s.grade]||0)+1);
    const ctx1=document.getElementById('gradeChart').getContext('2d');
    if(charts.grade) charts.grade.destroy();
    charts.grade = new Chart(ctx1, { type:'bar', data:{ labels:Object.keys(gradeMap).map(getGradeLabel), datasets:[{data:Object.values(gradeMap), backgroundColor:'rgba(43,69,112,.55)'}] }, options:{plugins:{legend:{display:false}}} });

    const branchMap={}; students.forEach(s=>branchMap[s.branch]=(branchMap[s.branch]||0)+1);
    const ctx2=document.getElementById('branchChart').getContext('2d');
    if(charts.branch) charts.branch.destroy();
    charts.branch = new Chart(ctx2, { type:'doughnut', data:{ labels:Object.keys(branchMap).map(getBranchLabel), datasets:[{data:Object.values(branchMap), backgroundColor:['#2B4570','#D64545']}] } });

    const statusMap={pending:0,approved:0,rejected:0}; students.forEach(s=>statusMap[s.status]++);
    const ctx3=document.getElementById('statusChart').getContext('2d');
    if(charts.status) charts.status.destroy();
    charts.status = new Chart(ctx3, { type:'pie', data:{ labels:[getStatusLabel('pending'),getStatusLabel('approved'),getStatusLabel('rejected')], datasets:[{data:Object.values(statusMap), backgroundColor:['#D64545','#2F9E63','#7A8378']}] } });

    const subjMap = {};
    (results||[]).forEach(r=>{
        subjMap[r.subject] = subjMap[r.subject] || [];
        subjMap[r.subject].push(r.score/r.total*10);
    });
    const subjLabels = Object.keys(subjMap).map(getSubjectLabel);
    const subjAvgs = Object.values(subjMap).map(arr=>+(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1));
    const ctx4=document.getElementById('subjectPerfChart').getContext('2d');
    if(charts.subjectPerf) charts.subjectPerf.destroy();
    charts.subjectPerf = new Chart(ctx4, { type:'bar', data:{ labels: subjLabels.length?subjLabels:[isAr?'لا يوجد':'None'], datasets:[{ label: isAr?'المعدل من 10':'Average out of 10', data: subjAvgs.length?subjAvgs:[0], backgroundColor:'rgba(214,69,69,.55)' }] }, options:{ plugins:{legend:{display:false}}, scales:{ y:{ min:0, max:10 } } } });
}

// ---------------- ADMIN: QUESTION MANAGEMENT ----------------
const QBANK_CONFIG = {
    admin: { subjectSel:'qListSubject', gradeSel:'qListGrade', summary:'questionsListSummary', container:'questionsList', editable:false },
    registrar: { subjectSel:'regQListSubject', gradeSel:'regQListGrade', summary:'regQuestionsListSummary', container:'regQuestionsList', editable:true }
};
async function addQuestion(){
    const isAr = currentLang==='ar';
    const subject = document.getElementById('regQSubject').value;
    const grade = document.getElementById('regQGrade').value;
    const text = document.getElementById('regQText').value.trim();
    const optionsRaw = document.getElementById('regQOptions').value.trim();
    const correct = parseInt(document.getElementById('regQCorrect').value);
    const marks = parseInt(document.getElementById('regQMarks').value) || 1;

    if(!text || !optionsRaw || isNaN(correct)){ showToast(isAr?'⚠️ يرجى تعبئة جميع حقول السؤال':'⚠️ Please fill in all question fields', 'warning'); return; }
    const options = optionsRaw.split(',').map(o=>o.trim()).filter(Boolean);
    if(correct<0 || correct>=options.length){ showToast(isAr?'⚠️ فهرس الإجابة الصحيحة غير صالح':'⚠️ Invalid correct answer index', 'warning'); return; }

    const { error } = await sb.from('questions').insert({ subject, grade, type:'mcq', question_text:text, options, correct_index:correct, marks });
    if(error){ showToast('❌ '+error.message,'error'); return; }
    logActivity(isAr?'أضاف سؤال':'Added a question', `${getSubjectLabel(subject)} · ${getGradeLabel(grade)}`);
    showToast(isAr?'✅ تمت إضافة السؤال':'✅ Question added', 'success');
    document.getElementById('regQText').value=''; document.getElementById('regQOptions').value=''; document.getElementById('regQCorrect').value='';
    loadQuestionsList('registrar');
}
async function loadQuestionsList(mode){
    mode = mode || 'admin';
    const cfg = QBANK_CONFIG[mode];
    const isAr = currentLang==='ar';
    const container = document.getElementById(cfg.container);
    const summary = document.getElementById(cfg.summary);
    if(!container) return;
    const subjectFilter = document.getElementById(cfg.subjectSel)?.value || '';
    const gradeFilter = document.getElementById(cfg.gradeSel)?.value || '';

    let query = sb.from('questions').select('*').order('subject').order('grade').order('order_index');
    if(subjectFilter) query = query.eq('subject', subjectFilter);
    if(gradeFilter) query = query.eq('grade', gradeFilter);
    const { data: questions } = await query;

    if(!questions || questions.length===0){ container.innerHTML = `<div class="empty-state">${isAr?'لا توجد أسئلة مطابقة':'No matching questions'}</div>`; if(summary) summary.textContent=''; return; }

    if(summary){
        const totalMarks = questions.reduce((s,q)=>s+(q.marks||0),0);
        summary.textContent = isAr ? `📋 ${questions.length} سؤال · ${totalMarks} درجة` : `📋 ${questions.length} questions · ${totalMarks} marks`;
    }

    container.innerHTML = questions.map(q=>`
        <div class="qa-list-item">
            <span>${getSubjectLabel(q.subject)} · ${getGradeLabel(q.grade)} · ${q.question_text.slice(0,50)}${q.question_text.length>50?'…':''}</span>
            <span style="display:flex;gap:6px;align-items:center;white-space:nowrap;">
                <span class="badge-status waiting" style="font-family:var(--font-mono);">${q.marks}${isAr?' د':' pts'}</span>
                ${cfg.editable ? `
                <button class="btn-mini neutral" onclick="editQuestionMarks('${q.id}', ${q.marks})">${isAr?'✏️ تعديل':'✏️ Edit'}</button>
                <button class="btn-mini reject" onclick="deleteQuestion('${q.id}')">${isAr?'حذف':'Delete'}</button>` : ''}
            </span>
        </div>`).join('');
}
function editQuestionMarks(id, currentMarks){
    const isAr = currentLang==='ar';
    const modal=document.getElementById('modalOverlay'), title=document.getElementById('modalTitle'), content=document.getElementById('modalContent');
    title.textContent = isAr ? '✏️ تعديل درجة السؤال' : '✏️ Edit Question Marks';
    content.innerHTML = `
        <div class="form-group"><label>${isAr?'عدد الدرجات':'Number of marks'}</label>
            <input type="number" id="editMarksInput" min="0" step="0.5" value="${currentMarks}" /></div>
        <div style="display:flex;gap:10px;margin-top:14px;">
            <button class="btn btn-primary" onclick="saveQuestionMarks('${id}')" style="flex:1;">${isAr?'حفظ':'Save'}</button>
            <button class="btn btn-secondary" onclick="closeModal()" style="flex:1;">${isAr?'إلغاء':'Cancel'}</button>
        </div>`;
    modal.classList.add('open');
}
async function saveQuestionMarks(id){
    const isAr = currentLang==='ar';
    const val = parseFloat(document.getElementById('editMarksInput').value);
    if(isNaN(val) || val<0){ showToast(isAr?'⚠️ قيمة غير صحيحة':'⚠️ Invalid value', 'warning'); return; }
    const { error } = await sb.from('questions').update({ marks: val }).eq('id', id);
    if(error){ showToast('❌ '+error.message, 'error'); return; }
    closeModal();
    showToast(isAr?'✅ تم تحديث الدرجة':'✅ Marks updated', 'success');
    loadQuestionsList('registrar');
}
async function deleteQuestion(id){
    const isAr = currentLang==='ar';
    if(!confirm(isAr?'متأكد تبي تحذف هذا السؤال؟':'Are you sure you want to delete this question?')) return;
    const { error } = await sb.from('questions').delete().eq('id', id);
    if(error){ showToast('❌ '+error.message,'error'); return; }
    logActivity(isAr?'حذف سؤال':'Deleted a question', '');
    showToast(isAr?'🗑️ تم حذف السؤال':'🗑️ Question deleted', 'info');
    loadQuestionsList('registrar');
}

// ---------------- CHAT BOT (أسئلة ثابتة) ----------------
const chatFAQ = [
    { key:'howRegister',
      q:{ar:'📝 كيف أسجّل طالب؟', en:'📝 How do I register a student?'},
      a:{ar:'من الصفحة الرئيسية: اختر الفرع ← اختر "طالب" ← عبّي البيانات المطلوبة ← احفظ الرمز السري اللي بيظهر لك بعد التسجيل، بتحتاجه للتحقق من حالتك لاحقاً.',
         en:'From the home page: choose the branch → choose "Student" → fill in the required details → save the secret code shown after registering, you will need it to check your status later.'} },
    { key:'checkStatus',
      q:{ar:'🔄 كيف أتحقق من حالة طلبي؟', en:'🔄 How do I check my request status?'},
      a:{ar:'بعد التسجيل بتظهر لك شاشة "بانتظار الموافقة" فيها حقول لرقم الهوية والرمز السري — عبّيها واضغط "التحقق من الحالة" لمعرفة إذا انقبل طلبك.',
         en:'After registering you will see a "waiting for approval" screen with fields for your ID and secret code — fill them and press "Check Status" to see if your request was approved.'} },
    { key:'lostCode',
      q:{ar:'❓ ضيّعت الرمز السري، وش أسوي؟', en:"❓ I lost my secret code, what do I do?"},
      a:{ar:'تواصل مع مسؤول القبول بالمدرسة مباشرة وهو يقدر يوصلك ببياناتك من لوحته.',
         en:'Contact the school\'s admissions officer directly — they can look up your details from their dashboard.'} },
    { key:'roles',
      q:{ar:'👥 وش الفرق بين الأدوار؟', en:'👥 What is the difference between the roles?'},
      a:{ar:'👨‍🎓 الطالب: يسجّل ويدخل الاختبار بعد القبول.<br>👔 مسؤول القبول: يقبل/يرفض الطلبات ويتابع النتائج.<br>👨‍🏫 المعلم: يصحح الأسئلة الكتابية.<br>🛡️ مدير النظام: يدير الأسئلة والموظفين والإحصائيات.',
         en:'👨‍🎓 Student: registers and takes the exam after approval.<br>👔 Admissions officer: approves/rejects requests and tracks results.<br>👨‍🏫 Teacher: marks written answers.<br>🛡️ System admin: manages questions, staff, and statistics.'} },
    { key:'examHow',
      q:{ar:'📋 كيف يشتغل الاختبار؟', en:'📋 How does the exam work?'},
      a:{ar:'بعد الموافقة على طلبك، تدخل الاختبار وتنتقل تلقائياً بين المواد (إنجليزي، رياضيات، عربي). الأسئلة الاختيارية تتصحح فوراً، والكتابية يصححها المعلم.',
         en:'After your request is approved, you take the exam and move automatically between subjects (English, Math, Arabic). Multiple-choice questions are graded instantly, written ones are marked by the teacher.'} },
    { key:'contact',
      q:{ar:'📞 كيف أتواصل مع الدعم؟', en:'📞 How do I contact support?'},
      a:{ar:'تواصل مع إدارة المدرسة مباشرة عبر أرقامها الرسمية، أو مع مسؤول القبول لأي استفسار متعلق بطلبك.',
         en:'Contact the school administration directly through its official numbers, or the admissions officer for any query related to your request.'} }
];
function toggleChat(){
    const win = document.getElementById('chatWindow');
    win.classList.toggle('open');
    if(win.classList.contains('open')) renderChatQuickReplies();
}
function renderChatQuickReplies(){
    const container = document.getElementById('chatQuick');
    container.innerHTML = '';
    chatFAQ.forEach(item=>{
        const btn = document.createElement('button');
        btn.textContent = item.q[currentLang];
        btn.onclick = ()=> askChatQuestion(item.key);
        container.appendChild(btn);
    });
}
function askChatQuestion(key){
    const item = chatFAQ.find(i=>i.key===key);
    if(!item) return;
    const body = document.getElementById('chatBody');
    body.innerHTML += `<div class="chat-msg user"><div class="bubble">${item.q[currentLang]}</div></div>`;
    body.innerHTML += `<div class="chat-msg bot"><div class="bubble">${item.a[currentLang]}</div></div>`;
    body.scrollTop = body.scrollHeight;
}

// ---------------- ADMIN TABS ----------------
function switchAdminTab(tabId){
    document.querySelectorAll('#pageAdminDashboard .admin-tab').forEach(el=>el.classList.remove('active'));
    document.querySelectorAll('#pageAdminDashboard .admin-tab-btn').forEach(el=>el.classList.remove('active'));
    document.getElementById(tabId)?.classList.add('active');
    document.querySelector(`#pageAdminDashboard .admin-tab-btn[data-tab="${tabId}"]`)?.classList.add('active');
}
function switchRegistrarTab(tabId){
    document.querySelectorAll('#pageRegistrarDashboard .admin-tab').forEach(el=>el.classList.remove('active'));
    document.querySelectorAll('#pageRegistrarDashboard .admin-tab-btn').forEach(el=>el.classList.remove('active'));
    document.getElementById(tabId)?.classList.add('active');
    document.querySelector(`#pageRegistrarDashboard .admin-tab-btn[data-tab="${tabId}"]`)?.classList.add('active');
}

// ---------------- ADMIN: SYSTEM SETTINGS ----------------
async function loadSettingsIntoForm(){
    const { data } = await sb.from('settings').select('*');
    if(!data) return;
    const map = {}; data.forEach(r=>map[r.key]=r.value);
    if(document.getElementById('settingTimeEnglish')) document.getElementById('settingTimeEnglish').value = map.time_english || 25;
    if(document.getElementById('settingTimeMath')) document.getElementById('settingTimeMath').value = map.time_math || 20;
    if(document.getElementById('settingTimeArabic')) document.getElementById('settingTimeArabic').value = map.time_arabic || 20;
    if(document.getElementById('settingPassThreshold')) document.getElementById('settingPassThreshold').value = map.pass_threshold || 60;
}
async function saveSettings(){
    const isAr = currentLang==='ar';
    const status = document.getElementById('settingsStatus');
    const values = {
        time_english: document.getElementById('settingTimeEnglish').value,
        time_math: document.getElementById('settingTimeMath').value,
        time_arabic: document.getElementById('settingTimeArabic').value,
        pass_threshold: document.getElementById('settingPassThreshold').value
    };
    status.innerHTML = `<span class="spinner"></span> ${isAr?'جاري الحفظ...':'Saving...'}`;
    for(const [key, value] of Object.entries(values)){
        const { error } = await sb.from('settings').upsert({ key, value: String(value) });
        if(error){ status.innerHTML = `<span style="color:var(--danger);">❌ ${error.message}</span>`; return; }
    }
    logActivity(isAr?'حدّث إعدادات النظام':'Updated system settings', '');
    status.innerHTML = `<span style="color:var(--success);">✅ ${isAr?'تم حفظ الإعدادات':'Settings saved'}</span>`;
    showToast(isAr?'✅ تم حفظ الإعدادات بنجاح':'✅ Settings saved successfully', 'success');
}
async function exportQuestionBankJSON(){
    const isAr = currentLang==='ar';
    const { data: questions, error } = await sb.from('questions').select('subject,grade,type,question_text,options,correct_index,marks,image_url,instructions,match_items,match_options,sort_items,correct_order,order_index');
    if(error || !questions){ showToast('❌ '+(error?.message||''), 'error'); return; }
    const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `question_bank_backup_${Date.now()}.json`;
    link.click();
    logActivity(isAr?'صدّر نسخة احتياطية من بنك الأسئلة':'Exported question bank backup', `${questions.length} ${isAr?'سؤال':'questions'}`);
    showToast(isAr?'✅ تم تصدير بنك الأسئلة':'✅ Question bank exported', 'success');
}

// ---------------- ADMIN: STAFF MANAGEMENT ----------------
async function createStaffUser(){
    const isAr = currentLang==='ar';
    const name = document.getElementById('staffName').value.trim();
    const email = document.getElementById('staffEmail').value.trim();
    const password = document.getElementById('staffPassword').value;
    const role = document.getElementById('staffRole').value;
    const branch = document.getElementById('staffBranch').value;
    const status = document.getElementById('staffMgmtStatus');
    const btn = document.getElementById('createStaffBtn');

    if(!name || !email || !password){
        status.innerHTML = `<span style="color:var(--danger);">⚠️ ${isAr?'يرجى تعبئة جميع الحقول':'Please fill in all fields'}</span>`; return;
    }
    if(password.length < 6){
        status.innerHTML = `<span style="color:var(--danger);">⚠️ ${isAr?'كلمة المرور يجب أن تكون 6 أحرف على الأقل':'Password must be at least 6 characters'}</span>`; return;
    }

    btn.disabled = true;
    status.innerHTML = `<span class="spinner"></span> ${isAr?'جاري الإنشاء...':'Creating...'}`;

    const { data, error } = await sb.functions.invoke('create-staff-user', {
        body: { name, email, password, role, branch: branch || null }
    });
    btn.disabled = false;

    if(error || data?.error){
        const msg = data?.error || error.message || '';
        let friendly = isAr ? 'حدث خطأ أثناء الإنشاء' : 'An error occurred while creating the account';
        if(msg.includes('NOT_ADMIN')) friendly = isAr ? '⚠️ فقط مدير النظام يقدر يضيف حسابات' : '⚠️ Only a system administrator can add accounts';
        else if(msg.includes('already been registered') || msg.includes('email_exists')) friendly = isAr ? '⚠️ هذا البريد مسجل مسبقاً' : '⚠️ This email is already registered';
        status.innerHTML = `<span style="color:var(--danger);">❌ ${friendly}</span>`;
        showToast('❌ ' + friendly, 'error');
        return;
    }

    status.innerHTML = `<span style="color:var(--success);">✅ ${isAr?'تم إنشاء الحساب بنجاح':'Account created successfully'}</span>`;
    logActivity(isAr?'أنشأ حساب موظف':'Created a staff account', `${name} (${role})`);
    showToast(isAr?'✅ تم إنشاء حساب الموظف بنجاح':'✅ Staff account created successfully', 'success');
    document.getElementById('staffName').value='';
    document.getElementById('staffEmail').value='';
    document.getElementById('staffPassword').value='';
    document.getElementById('staffBranch').value='';
    loadStaffList();
}

async function loadStaffList(){
    const isAr = currentLang==='ar';
    const container = document.getElementById('staffList');
    if(!container) return;
    const { data: profiles, error } = await sb.from('profiles').select('*').order('created_at',{ascending:false});
    if(error){ container.innerHTML = `<div class="empty-state">${error.message}</div>`; return; }
    if(!profiles || profiles.length===0){ container.innerHTML = `<div class="empty-state">${isAr?'لا يوجد موظفون بعد':'No staff members yet'}</div>`; return; }
    const roleLabel = r => r==='admin'?t('roleAdmin'): r==='teacher'?t('roleTeacher'): t('roleRegistrar');
    container.innerHTML = profiles.map(p=>`
        <div class="qa-list-item">
            <span>👤 ${p.name} — <strong>${roleLabel(p.role)}</strong>${p.branch?` · ${getBranchLabel(p.branch)}`:''}</span>
            ${p.id!==currentUserProfile?.id ? `<button class="btn-mini reject" onclick="deleteStaffUser('${p.id}','${p.name.replace(/'/g,"")}')">${isAr?'حذف':'Delete'}</button>` : `<span style="font-size:11px;color:var(--muted);">${isAr?'(أنت)':'(you)'}</span>`}
        </div>`).join('');
}
async function deleteStaffUser(userId, name){
    const isAr = currentLang==='ar';
    if(!confirm(isAr?`متأكد تبي تحذف حساب "${name}"؟ هذا الإجراء لا يمكن التراجع عنه.`:`Are you sure you want to delete "${name}"'s account? This cannot be undone.`)) return;
    const { data, error } = await sb.functions.invoke('delete-staff-user', { body: { userId } });
    if(error || data?.error){
        const msg = data?.error || error.message || '';
        showToast('❌ ' + (msg.includes('NOT_ADMIN') ? (isAr?'فقط مدير النظام يقدر يحذف حسابات':'Only a system administrator can delete accounts') : (isAr?'تعذر حذف الحساب':'Could not delete account')), 'error');
        return;
    }
    logActivity(isAr?'حذف حساب موظف':'Deleted a staff account', name);
    showToast(isAr?'🗑️ تم حذف الحساب':'🗑️ Account deleted', 'info');
    loadStaffList();
}

async function exportStudentsCSV(){
    const isAr = currentLang==='ar';
    const { data: students } = await sb.from('students').select('*').order('created_at',{ascending:false});
    const { data: results } = await sb.from('exam_results').select('student_id, subject, score, total');
    if(!students || students.length===0){ showToast(isAr?'⚠️ لا توجد بيانات للتصدير':'⚠️ No data to export', 'warning'); return; }

    const scoresByStudent = {};
    (results||[]).forEach(r=>{
        scoresByStudent[r.student_id] = scoresByStudent[r.student_id] || [];
        if(r.score!=null) scoresByStudent[r.student_id].push(r.score/r.total*10);
    });

    const headers = isAr
        ? ['الاسم','رقم الهوية','الجوال','الفرع','المرحلة','الجنسية','الحالة','المعدل من 10','تاريخ التسجيل']
        : ['Name','National ID','Phone','Branch','Grade','Nationality Type','Status','Average /10','Registered At'];

    const rows = students.map(s=>{
        const arr = scoresByStudent[s.id] || [];
        const avg = arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : '';
        return [
            s.name, s.national_id, s.phone, getBranchLabel(s.branch), getGradeLabel(s.grade),
            s.nationality_type==='arab'?(isAr?'عربي':'Arab'):(isAr?'أجنبي':'Foreign'),
            getStatusLabel(s.status), avg, new Date(s.created_at).toLocaleDateString(isAr?'ar-SA':'en-GB')
        ];
    });

    const csvContent = [headers, ...rows].map(row =>
        row.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')
    ).join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `students_export_${Date.now()}.csv`;
    link.click();
    logActivity(isAr?'صدّر بيانات الطلاب':'Exported student data', `${students.length} ${isAr?'طالب':'students'}`);
    showToast(isAr?'✅ تم تصدير الملف':'✅ File exported', 'success');
}

async function bulkImportQuestions(){
    const isAr = currentLang==='ar';
    const fileInput = document.getElementById('bulkImportFile');
    const status = document.getElementById('bulkImportStatus');
    const file = fileInput.files[0];
    if(!file){ status.innerHTML = `<span style="color:var(--danger);">⚠️ ${isAr?'اختر ملف أولاً':'Choose a file first'}</span>`; return; }

    status.innerHTML = `<span class="spinner"></span> ${isAr?'جاري القراءة...':'Reading...'}`;
    try{
        const text = await file.text();
        const parsed = JSON.parse(text);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        if(items.length===0){ status.innerHTML = `<span style="color:var(--danger);">⚠️ ${isAr?'الملف فارغ':'File is empty'}</span>`; return; }

        const validTypes = ['mcq','written','match','sort'];
        for(const item of items){
            if(!item.subject || !item.grade || !validTypes.includes(item.type) || !item.question_text){
                status.innerHTML = `<span style="color:var(--danger);">⚠️ ${isAr?'صيغة غير صحيحة في أحد الأسئلة (تأكد من subject, grade, type, question_text)':'Invalid format in one of the questions (check subject, grade, type, question_text)'}</span>`;
                return;
            }
        }

        status.innerHTML = `<span class="spinner"></span> ${isAr?'جاري الاستيراد...':'Importing...'}`;
        const { error } = await sb.from('questions').insert(items);
        if(error){ status.innerHTML = `<span style="color:var(--danger);">❌ ${error.message}</span>`; return; }

        logActivity(isAr?'استورد أسئلة بالجملة':'Bulk imported questions', `${items.length} ${isAr?'سؤال':'questions'}`);
        status.innerHTML = `<span style="color:var(--success);">✅ ${isAr?`تم استيراد ${items.length} سؤال بنجاح`:`Successfully imported ${items.length} questions`}</span>`;
        showToast(isAr?'✅ تم الاستيراد بنجاح':'✅ Import successful', 'success');
        fileInput.value = '';
        loadQuestionsList('registrar');
    } catch(e){
        status.innerHTML = `<span style="color:var(--danger);">❌ ${isAr?'الملف مو JSON صحيح':'File is not valid JSON'}</span>`;
    }
}

// ---------------- PDF REPORT ----------------
async function generatePDFReport(){
    const isAr = currentLang==='ar';
    const { data: students } = await sb.from('students').select('*');
    const reportHtml = `<div id="reportContent" style="font-family:'Alexandria',sans-serif;padding:24px;background:#fff;color:#222;direction:${isAr?'rtl':'ltr'};">
        <h1 style="color:#2B4570;text-align:center;">📊 ${isAr?'تقرير نظام التقييم والقبول':'Admission System Report'}</h1>
        <p style="text-align:center;color:#888;">${isAr?'تم الإنشاء':'Generated'}: ${new Date().toLocaleDateString(isAr?'ar-SA':'en-GB')}</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:16px;">
            <thead><tr style="background:#2B4570;color:#fff;"><th style="padding:8px;">${isAr?'الاسم':'Name'}</th><th style="padding:8px;">${isAr?'الفرع':'Branch'}</th><th style="padding:8px;">${isAr?'المرحلة':'Grade'}</th><th style="padding:8px;">${isAr?'الحالة':'Status'}</th></tr></thead>
            <tbody>${(students||[]).map(s=>`<tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;">${s.name}</td><td style="padding:8px;">${getBranchLabel(s.branch)}</td>
                <td style="padding:8px;">${getGradeLabel(s.grade)}</td><td style="padding:8px;">${getStatusLabel(s.status)}</td></tr>`).join('')}</tbody>
        </table></div>`;
    const tempDiv = document.createElement('div'); tempDiv.innerHTML = reportHtml; document.body.appendChild(tempDiv);
    html2pdf().set({ margin:1, filename:`report_${Date.now()}.pdf`, jsPDF:{unit:'in',format:'a4'} })
        .from(document.getElementById('reportContent')).save().then(()=>{ tempDiv.remove(); showToast(isAr?'📄 تم تحميل التقرير':'📄 Report downloaded','success'); });
}

console.log('🚀 النظام متصل بقاعدة بيانات Supabase | Bilingual AR/EN ready');
