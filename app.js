// ============================================================
// نظام التقييم والقبول - المنطق الرئيسي (متصل بقاعدة بيانات Supabase)
// ============================================================

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
(function(){
    const saved = localStorage.getItem('theme');
    if(saved==='dark'){
        document.documentElement.setAttribute('data-theme','dark');
        window.addEventListener('DOMContentLoaded', ()=>{
            const btn = document.getElementById('themeToggle');
            if(btn) btn.innerHTML = '<i class="fas fa-sun"></i>';
        });
    }
})();

// ---------------- SPLASH ----------------
function createSplashParticles(){
    const container = document.getElementById('splashParticles');
    if(!container) return;
    for(let i=0;i<22;i++){
        const p = document.createElement('div');
        p.className='p';
        p.style.left = Math.random()*100+'%';
        const size = Math.random()*6+3;
        p.style.width = size+'px'; p.style.height = size+'px';
        p.style.animationDelay = (Math.random()*6)+'s';
        p.style.animationDuration = (5+Math.random()*4)+'s';
        container.appendChild(p);
    }
}
window.addEventListener('DOMContentLoaded', () => {
    createSplashParticles();
    setTimeout(() => {
        const splash = document.getElementById('pageSplash');
        const branch = document.getElementById('pageBranch');
        if (!splash || !branch) return;
        splash.style.transition = 'opacity .5s ease';
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.classList.remove('active');
            branch.classList.add('active');
        }, 500);
    }, 3400);
});

// ---------------- STATE ----------------
let selectedBranch = '';
let selectedRole = '';
let currentStudent = null; // { id, secret_code, name, status, ... }
let currentUserProfile = null; // { id, name, role }
let charts = {};

const nationalities = {
    arab: [['saudi','🇸🇦 سعودي'],['egyptian','🇪🇬 مصري'],['jordanian','🇯🇴 أردني'],['syrian','🇸🇾 سوري'],
        ['lebanese','🇱🇧 لبناني'],['iraqi','🇮🇶 عراقي'],['yemeni','🇾🇪 يمني'],['palestinian','🇵🇸 فلسطيني'],
        ['sudanese','🇸🇩 سوداني'],['moroccan','🇲🇦 مغربي'],['algerian','🇩🇿 جزائري'],['tunisian','🇹🇳 تونسي']],
    foreign: [['american','🇺🇸 أمريكي'],['british','🇬🇧 بريطاني'],['indian','🇮🇳 هندي'],['pakistani','🇵🇰 باكستاني'],
        ['filipino','🇵🇭 فلبيني'],['turkish','🇹🇷 تركي'],['french','🇫🇷 فرنسي'],['chinese','🇨🇳 صيني'],['canadian','🇨🇦 كندي']]
};

// ---------------- TOAST ----------------
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success:'fa-check-circle', error:'fa-exclamation-circle', warning:'fa-triangle-exclamation', info:'fa-circle-info' };
    toast.innerHTML = `<span><i class="fas ${icons[type]||icons.info}"></i></span><span>${message}</span>
        <button class="toast-close" onclick="this.closest('.toast').remove()"><i class="fas fa-xmark"></i></button>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

function closeModal(){ document.getElementById('modalOverlay').classList.remove('open'); }

// ---------------- NAVIGATION ----------------
function selectBranch(branch){
    selectedBranch = branch;
    document.querySelectorAll('.branch-card').forEach(el=>el.classList.remove('active'));
    document.getElementById(branch==='ajyal'?'branchAjyal':'branchKids').classList.add('active');
    document.getElementById('btnBranchNext').disabled = false;
    const sectionGroup = document.getElementById('ajyalSectionGroup');
    if (branch==='ajyal') sectionGroup.classList.add('show'); else sectionGroup.classList.remove('show');
    updateGradeOptions(branch);
}
function goToRole(){
    if(!selectedBranch) return;
    document.getElementById('selectedBranchDisplay').textContent = selectedBranch==='ajyal'?'أجيال المعرفة':'بوابة الطفل';
    document.getElementById('pageBranch').classList.remove('active');
    document.getElementById('pageRole').classList.add('active');
}
function goToBranch(){
    document.getElementById('pageRole').classList.remove('active');
    document.getElementById('pageBranch').classList.add('active');
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
        return;
    }
    document.getElementById('pageRole').classList.remove('active');
    document.getElementById('pageLogin').classList.add('active');
}
function backToRoleFromForm(){
    document.getElementById('pageLogin').classList.remove('active');
    document.getElementById('pageStudentRegister').classList.remove('active');
    document.getElementById('pageRole').classList.add('active');
}
function logout(){
    sb.auth.signOut();
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    selectedBranch=''; selectedRole=''; currentUserProfile=null;
    document.querySelectorAll('.branch-card,.role-btn').forEach(el=>el.classList.remove('active'));
    document.getElementById('btnBranchNext').disabled=true;
    document.getElementById('btnRoleNext').disabled=true;
    document.getElementById('pageBranch').classList.add('active');
    showToast('👋 تم تسجيل الخروج', 'info');
}

// ---------------- STAFF LOGIN (Supabase Auth) ----------------
async function login(){
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const status = document.getElementById('loginStatus');
    status.style.display='block'; status.className='status-box loading';
    status.innerHTML = '<span class="spinner"></span> جاري التحقق...';

    if(!email || !password){
        status.className='status-box error'; status.innerHTML='❌ يرجى إدخال جميع البيانات';
        return;
    }

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if(error){
        status.className='status-box error'; status.innerHTML='❌ '+ (error.message || 'فشل تسجيل الدخول');
        showToast('⚠️ بيانات الدخول غير صحيحة', 'warning');
        return;
    }

    const { data: profile, error: pErr } = await sb.from('profiles').select('*').eq('id', data.user.id).single();
    if(pErr || !profile){
        status.className='status-box error'; status.innerHTML='❌ لا يوجد ملف موظف مرتبط بهذا الحساب';
        return;
    }
    currentUserProfile = profile;
    status.className='status-box success'; status.innerHTML='✅ مرحباً! جاري تحويلك...';

    document.getElementById('pageLogin').classList.remove('active');
    if(profile.role==='teacher'){
        document.getElementById('teacherNameDisplay').textContent = profile.name;
        await renderTeacherDashboard();
        document.getElementById('pageTeacherDashboard').classList.add('active');
    } else if(profile.role==='registrar'){
        document.getElementById('registrarNameDisplay').textContent = profile.name;
        await renderRegistrarDashboard();
        document.getElementById('pageRegistrarDashboard').classList.add('active');
    } else if(profile.role==='admin'){
        document.getElementById('adminNameDisplay').textContent = profile.name;
        await renderAdminDashboard();
        document.getElementById('pageAdminDashboard').classList.add('active');
    }
    showToast('✅ تم تسجيل الدخول بنجاح', 'success');
}

// ---------------- HELPERS ----------------
function getGradeLabel(code){
    const map = { kg2:'KG2', g1:'الأول', g2:'الثاني', g3:'الثالث', g4:'الرابع', g5:'الخامس', g6:'السادس',
        g7:'السابع', g8:'الثامن', g9:'التاسع', g10:'العاشر', g11:'الحادي عشر', g12:'الثاني عشر', g13:'الثالث الثانوي' };
    return map[code] || code;
}
function getSubjectLabel(sub){
    return { english:'📘 إنجليزي', math:'📗 رياضيات', arabic:'📙 عربي' }[sub] || sub;
}
function toggleNationalities(){
    const type = document.getElementById('studentNationalityType').value;
    const group = document.getElementById('nationalitySpecific');
    const select = document.getElementById('studentNationality');
    if(type==='arab' || type==='foreign'){
        group.classList.add('show');
        select.innerHTML = '<option value="">-- اختر --</option>';
        (nationalities[type]||[]).forEach(item=> select.innerHTML += `<option value="${item[0]}">${item[1]}</option>`);
    } else { group.classList.remove('show'); select.innerHTML='<option value="">-- اختر --</option>'; }
}
function calculateAge(){
    const birthdate = document.getElementById('studentBirthdate').value;
    const display = document.getElementById('ageDisplay');
    if(!birthdate){ display.textContent=''; display.className='age-display'; return; }
    const today = new Date(), birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if(m<0 || (m===0 && today.getDate()<birth.getDate())) age--;
    if(age>=3 && age<=18){ display.textContent=`✅ العمر: ${age} سنة`; display.className='age-display valid'; }
    else { display.textContent=`⚠️ العمر: ${age} سنة (غير مناسب)`; display.className='age-display invalid'; }
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

    status.style.display='block';
    if(!name||!id||!phone||!birthdate||!gender||!nationalityType||!grade){
        status.className='status-box error'; status.innerHTML='⚠️ يرجى تعبئة جميع الحقول المطلوبة'; return;
    }
    if(selectedBranch==='ajyal' && !ajyalSection){
        status.className='status-box error'; status.innerHTML='⚠️ يرجى اختيار قسم الفرع'; return;
    }
    if(id.length!==10){
        status.className='status-box error'; status.innerHTML='⚠️ رقم الهوية يجب أن يكون 10 أرقام'; return;
    }
    if(phone.length!==13 || !phone.startsWith('966')){
        status.className='status-box error'; status.innerHTML='⚠️ رقم الجوال يجب أن يبدأ بـ966 ويكون 13 رقم'; return;
    }
    const today=new Date(), birth=new Date(birthdate);
    let age = today.getFullYear()-birth.getFullYear();
    const m = today.getMonth()-birth.getMonth();
    if(m<0 || (m===0 && today.getDate()<birth.getDate())) age--;
    if(age<3||age>18){ status.className='status-box error'; status.innerHTML=`⚠️ العمر غير مناسب (${age})`; return; }

    status.className='status-box loading'; status.innerHTML='<span class="spinner"></span> جاري التسجيل...';

    const { data, error } = await sb.rpc('register_student', {
        p_name:name, p_national_id:id, p_phone:phone, p_birthdate:birthdate,
        p_gender:gender, p_nationality_type:nationalityType, p_nationality:nationality||null,
        p_grade:grade, p_branch:selectedBranch, p_ajyal_section:ajyalSection||null
    });

    if(error){
        status.className='status-box error';
        status.innerHTML = error.message.includes('DUPLICATE_ID') ? '⚠️ هذا الرقم مسجل مسبقاً' : '❌ حدث خطأ: '+error.message;
        showToast('⚠️ تعذر إتمام التسجيل', 'error');
        return;
    }

    currentStudent = { id: data.id, secret_code: data.secret_code, national_id: id };
    showToast(`✅ تم التسجيل! الرمز السري: ${data.secret_code} (احتفظ به)`, 'success', 8000);

    const isArab = nationalityType==='arab';
    const subjectsList = document.getElementById('subjectsList');
    subjectsList.innerHTML='';
    const subjects = [{name:'اللغة الإنجليزية',icon:'📘',cls:'english'},{name:'الرياضيات',icon:'📗',cls:'math'}];
    if(isArab) subjects.push({name:'اللغة العربية',icon:'📙',cls:'arabic'});
    subjects.forEach(s=>{
        const span=document.createElement('span');
        span.className='subject-tag'; span.textContent=`${s.icon} ${s.name}`;
        subjectsList.appendChild(span);
    });
    document.getElementById('subjectsMessage').classList.remove('hidden');
    document.getElementById('registerForm').style.display='none';
    document.getElementById('waitingMessage').classList.remove('hidden');
    document.getElementById('checkNationalId').value = id;
    document.getElementById('checkSecretCode').value = data.secret_code;
    status.style.display='none';
}

async function checkStudentStatus(){
    const nid = document.getElementById('checkNationalId').value.trim();
    const code = document.getElementById('checkSecretCode').value.trim();
    if(!nid||!code){ showToast('⚠️ أدخل رقم الهوية والرمز السري', 'warning'); return; }

    const { data, error } = await sb.rpc('check_student_status', { p_national_id:nid, p_secret_code:code });
    const badge = document.getElementById('studentStatusBadge');
    if(error){ showToast('⚠️ لم يتم العثور على بيانات مطابقة', 'error'); return; }

    currentStudent = { id:data.id, secret_code:data.secret_code, national_id:nid };

    if(data.status==='pending'){
        badge.textContent='🔄 قيد المراجعة'; badge.className='status-badge pending';
        showToast('⏳ لا تزال طلباتك قيد المراجعة', 'info');
    } else if(data.status==='approved'){
        badge.textContent='✅ تمت الموافقة!'; badge.className='status-badge approved';
        showToast('✅ تمت الموافقة على طلبك!', 'success');
        if(confirm('✅ تمت الموافقة على طلبك! هل تريد دخول الاختبار الآن؟')) goToExam(data.id, data.secret_code);
    } else if(data.status==='rejected'){
        badge.textContent='❌ مرفوض'; badge.className='status-badge rejected';
        showToast(`❌ تم رفض طلبك${data.rejection_reason?': '+data.rejection_reason:''}`, 'error');
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
    const { data: students, error } = await sb.from('students').select('*').order('created_at',{ascending:false});
    if(error){ showToast('❌ خطأ في جلب الطلاب: '+error.message,'error'); return; }

    document.getElementById('registrarStatPending').textContent = students.filter(s=>s.status==='pending').length;
    document.getElementById('registrarStatAccepted').textContent = students.filter(s=>s.status==='approved').length;
    document.getElementById('registrarStatRejected').textContent = students.filter(s=>s.status==='rejected').length;

    const { data: results } = await sb.from('exam_results').select('student_id, score, total').not('score','is',null);
    const avgByStudent = {};
    (results||[]).forEach(r=>{
        avgByStudent[r.student_id] = avgByStudent[r.student_id] || [];
        avgByStudent[r.student_id].push(r.score/r.total*10);
    });
    const allAvgs = Object.values(avgByStudent).map(arr=>arr.reduce((a,b)=>a+b,0)/arr.length);
    document.getElementById('registrarStatAvg').textContent = allAvgs.length ? (allAvgs.reduce((a,b)=>a+b,0)/allAvgs.length).toFixed(1) : 0;

    const list = document.getElementById('registrarRequestsList');
    list.innerHTML='';
    if(students.length===0){ list.innerHTML='<div class="empty-state">لا توجد طلبات حالياً</div>'; }
    else {
        students.forEach(s=>{
            const statusBadge = s.status==='pending' ? '<span class="badge-status pending">⏳ بانتظار</span>'
                : s.status==='approved' ? '<span class="badge-status accepted">✅ مقبول</span>'
                : '<span class="badge-status rejected">❌ مرفوض</span>';
            let actions='';
            if(s.status==='pending'){
                actions = `<div class="request-actions">
                    <button class="btn-sm approve" onclick="approveStudent('${s.id}')">✅ قبول</button>
                    <button class="btn-sm reject" onclick="rejectStudent('${s.id}')">❌ رفض</button></div>`;
            } else if(s.status==='approved'){
                actions = `<div class="request-actions">
                    <button class="btn-sm exam" onclick="goToExam('${s.id}','${s.secret_code}')">📝 دخول الاختبار</button>
                    <button class="btn-sm view-score" onclick="showStudentScores('${s.id}')">📊 عرض النتائج</button></div>`;
            } else {
                actions = `<span style="color:var(--danger);font-weight:700;">سبب الرفض: ${s.rejection_reason||'غير محدد'}</span>`;
            }
            const nationalityLabel = s.nationality_type==='arab' ? 'عربي' : 'أجنبي';
            list.innerHTML += `<div class="request-card">
                <div class="request-info">
                    <span>👤 ${s.name}</span><span>🆔 ${s.national_id}</span><span>📱 ${s.phone}</span>
                    <span>🌍 ${nationalityLabel}</span><span>📚 ${getGradeLabel(s.grade)}</span>
                    <span>🏫 ${s.branch==='ajyal'?'أجيال المعرفة':'بوابة الطفل'}</span>${statusBadge}
                </div>${actions}</div>`;
        });
    }
    await renderLeaderboard();
}

async function approveStudent(studentId){
    const { error } = await sb.from('students').update({
        status:'approved', approved_by: currentUserProfile?.id, approved_at: new Date().toISOString()
    }).eq('id', studentId);
    if(error){ showToast('❌ '+error.message,'error'); return; }
    showToast('✅ تم قبول الطالب', 'success');
    renderRegistrarDashboard();
}
async function rejectStudent(studentId){
    const reason = prompt('✏️ يرجى كتابة سبب الرفض:');
    if(reason===null) return;
    const { error } = await sb.from('students').update({ status:'rejected', rejection_reason: reason||'غير محدد' }).eq('id', studentId);
    if(error){ showToast('❌ '+error.message,'error'); return; }
    showToast('❌ تم رفض الطالب', 'error');
    renderRegistrarDashboard();
}

async function showStudentScores(studentId){
    const { data: student } = await sb.from('students').select('*').eq('id',studentId).single();
    const { data: results } = await sb.from('exam_results').select('*').eq('student_id',studentId);
    const modal=document.getElementById('modalOverlay'), title=document.getElementById('modalTitle'), content=document.getElementById('modalContent');
    title.textContent = `📊 درجات ${student?.name||''}`;
    if(!results || results.length===0){ content.innerHTML='<div class="empty-state">لا توجد نتائج بعد</div>'; modal.classList.add('open'); return; }

    let html = '<div style="background:var(--bg-input);border-radius:12px;padding:14px;">';
    let total=0, count=0;
    results.forEach(r=>{
        const scoreText = r.status==='waiting_correction' ? 'بانتظار التصحيح' : `${r.score} / ${r.total}`;
        if(r.status!=='waiting_correction' && r.score!=null){ total+=r.score/r.total*10; count++; }
        html += `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
            <span>${getSubjectLabel(r.subject)}</span><span style="font-weight:800;">${scoreText}</span></div>`;
    });
    const avg = count>0 ? (total/count).toFixed(1) : '--';
    html += `<div style="display:flex;justify-content:space-between;padding:10px 0;margin-top:8px;border-top:2px solid var(--primary);">
        <span style="font-weight:800;">المعدل (من 10)</span><span style="font-weight:900;font-size:20px;color:var(--primary);">${avg}</span></div></div>
        <button class="btn btn-secondary" onclick="closeModal()" style="margin-top:14px;width:100%;">إغلاق</button>`;
    content.innerHTML = html; modal.classList.add('open');
}

async function renderLeaderboard(){
    const container = document.getElementById('registrarLeaderboard');
    if(!container) return;
    const { data: results } = await sb.from('exam_results').select('student_id, score, total').not('score','is',null);
    const { data: students } = await sb.from('students').select('id,name,grade,branch');
    const byStudent = {};
    (results||[]).forEach(r=>{
        byStudent[r.student_id] = byStudent[r.student_id] || [];
        byStudent[r.student_id].push(r.score/r.total*10);
    });
    const rows = Object.entries(byStudent).map(([sid,arr])=>{
        const st = (students||[]).find(s=>s.id===sid);
        const avg = arr.reduce((a,b)=>a+b,0)/arr.length;
        return st ? { name:st.name, grade:st.grade, branch:st.branch, avg } : null;
    }).filter(Boolean).sort((a,b)=>b.avg-a.avg).slice(0,10);

    if(rows.length===0){ container.innerHTML='<div class="empty-state">لا توجد درجات لعرضها بعد</div>'; return; }
    let html='';
    rows.forEach((s,i)=>{
        const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1);
        html += `<div class="request-card"><div class="request-info">
            <span>${medal}</span><span>👤 ${s.name}</span><span>📚 ${getGradeLabel(s.grade)}</span>
            <span style="font-weight:900;color:var(--primary);">${s.avg.toFixed(1)} / 10</span></div></div>`;
    });
    container.innerHTML = html;
}

// ---------------- TEACHER DASHBOARD ----------------
async function renderTeacherDashboard(){
    const { data: results, error } = await sb.from('exam_results').select('*, students(name,grade)').order('created_at',{ascending:false});
    if(error){ showToast('❌ '+error.message,'error'); return; }

    const body = document.getElementById('teacherStudentsBody');
    body.innerHTML='';
    const waiting = (results||[]).filter(r=>r.status==='waiting_correction');
    const done = (results||[]).filter(r=>r.status==='corrected');

    document.getElementById('teacherStatStudents').textContent = new Set((results||[]).map(r=>r.student_id)).size;
    document.getElementById('teacherStatWaiting').textContent = waiting.length;
    document.getElementById('teacherStatDone').textContent = done.length;
    document.getElementById('teacherStatActive').textContent = (results||[]).filter(r=>r.status==='auto').length;

    if(waiting.length===0){ body.innerHTML='<tr><td colspan="4"><div class="empty-state">لا توجد أوراق بانتظار التصحيح 🎉</div></td></tr>'; }
    else {
        waiting.forEach(r=>{
            body.innerHTML += `<tr>
                <td>${r.students?.name||'--'}</td>
                <td>${getSubjectLabel(r.subject)}</td>
                <td><span class="badge-status waiting">⏳ بانتظار التصحيح</span></td>
                <td><div class="row-actions"><button class="btn-mini neutral" onclick="openCorrectionModal('${r.id}')">✏️ تصحيح</button></div></td>
            </tr>`;
        });
    }
    renderTeacherRecommendations(results||[]);
}

function renderTeacherRecommendations(results){
    const container = document.getElementById('teacherRecommendations');
    const corrected = results.filter(r=>r.status==='corrected' && r.score!=null);
    if(corrected.length===0){ container.innerHTML='<div class="empty-state">لا توجد توصيات حالياً</div>'; return; }
    let html='';
    corrected.forEach(r=>{
        const pct = r.score/r.total*100;
        if(pct<60){
            html += `<div class="request-card"><div class="request-info">
                <span>👤 ${r.students?.name||''}</span><span>📌 يحتاج تقوية في ${getSubjectLabel(r.subject)}</span></div></div>`;
        }
    });
    container.innerHTML = html || '<div class="empty-state">جميع الطلاب في المستوى المطلوب 🎉</div>';
}

async function openCorrectionModal(resultId){
    const { data: r } = await sb.from('exam_results').select('*, students(name)').eq('id',resultId).single();
    if(!r) return;
    const modal=document.getElementById('modalOverlay'), title=document.getElementById('modalTitle'), content=document.getElementById('modalContent');
    title.textContent = `✏️ تصحيح ${r.students?.name||''} - ${getSubjectLabel(r.subject)}`;

    let uploadsHtml = '';
    const uploads = r.written_uploads || {};
    Object.keys(uploads).forEach(qid=>{
        uploadsHtml += `<div style="margin-bottom:10px;"><p style="font-size:13px;font-weight:700;">سؤال ${qid}</p>
            <img src="${uploads[qid]}" style="max-width:100%;border-radius:10px;border:2px solid var(--border);" /></div>`;
    });

    content.innerHTML = `
        <div style="margin-bottom:14px;">${uploadsHtml || '<p class="page-sub">لا توجد صور مرفوعة لهذه المادة</p>'}</div>
        <div class="form-group"><label>الدرجة (من ${r.total})</label>
            <input type="number" id="correctionScore" min="0" max="${r.total}" placeholder="0 - ${r.total}" /></div>
        <div style="display:flex;gap:10px;margin-top:14px;">
            <button class="btn btn-primary" onclick="submitCorrection('${resultId}', ${r.total})" style="flex:1;">تأكيد</button>
            <button class="btn btn-secondary" onclick="closeModal()" style="flex:1;">إلغاء</button>
        </div>`;
    document.getElementById('modalOverlay').classList.add('open');
}

async function submitCorrection(resultId, total){
    const val = parseFloat(document.getElementById('correctionScore').value);
    if(isNaN(val) || val<0 || val>total){ showToast('⚠️ يرجى إدخال درجة صحيحة', 'warning'); return; }
    const { error } = await sb.from('exam_results').update({
        score: val, status:'corrected', corrected_by: currentUserProfile?.id, corrected_at: new Date().toISOString()
    }).eq('id', resultId);
    if(error){ showToast('❌ '+error.message,'error'); return; }
    closeModal();
    showToast('✅ تم حفظ التصحيح', 'success');
    renderTeacherDashboard();
}

// ---------------- ADMIN DASHBOARD ----------------
async function renderAdminDashboard(){
    const { data: students } = await sb.from('students').select('*');
    const { data: profiles } = await sb.from('profiles').select('*');
    const { data: results } = await sb.from('exam_results').select('score,total').not('score','is',null);

    document.getElementById('adminStatStudents').textContent = students?.length||0;
    document.getElementById('adminStatTeachers').textContent = profiles?.length||0;
    const avgs = (results||[]).map(r=>r.score/r.total*10);
    document.getElementById('adminStatAvg').textContent = avgs.length ? (avgs.reduce((a,b)=>a+b,0)/avgs.length).toFixed(1) : 0;

    const body = document.getElementById('adminRequestsBody');
    body.innerHTML='';
    const recent = [...(students||[])].reverse().slice(0,8);
    if(recent.length===0){ body.innerHTML='<tr><td colspan="4"><div class="empty-state">لا توجد طلبات</div></td></tr>'; }
    else recent.forEach(s=>{
        const badge = s.status==='pending' ? '<span class="badge-status pending">⏳ بانتظار</span>'
            : s.status==='approved' ? '<span class="badge-status accepted">✅ مقبول</span>'
            : '<span class="badge-status rejected">❌ مرفوض</span>';
        body.innerHTML += `<tr><td>${s.name}</td><td>${s.branch==='ajyal'?'أجيال المعرفة':'بوابة الطفل'}</td><td>${badge}</td>
            <td>${s.status==='approved'?`<button class="btn-mini view" onclick="showStudentScores('${s.id}')">📊 عرض</button>`:'--'}</td></tr>`;
    });

    createCharts(students||[]);
    loadQuestionsList();
}

function createCharts(students){
    const gradeMap={}; students.forEach(s=>gradeMap[s.grade]=(gradeMap[s.grade]||0)+1);
    const ctx1=document.getElementById('gradeChart').getContext('2d');
    if(charts.grade) charts.grade.destroy();
    charts.grade = new Chart(ctx1, { type:'bar', data:{ labels:Object.keys(gradeMap).map(getGradeLabel), datasets:[{data:Object.values(gradeMap), backgroundColor:'rgba(196,154,53,.6)'}] }, options:{plugins:{legend:{display:false}}} });

    const branchMap={}; students.forEach(s=>branchMap[s.branch]=(branchMap[s.branch]||0)+1);
    const ctx2=document.getElementById('branchChart').getContext('2d');
    if(charts.branch) charts.branch.destroy();
    charts.branch = new Chart(ctx2, { type:'doughnut', data:{ labels:Object.keys(branchMap).map(b=>b==='ajyal'?'أجيال المعرفة':'بوابة الطفل'), datasets:[{data:Object.values(branchMap), backgroundColor:['#C49A35','#2980b9']}] } });

    const statusMap={pending:0,approved:0,rejected:0}; students.forEach(s=>statusMap[s.status]++);
    const ctx3=document.getElementById('statusChart').getContext('2d');
    if(charts.status) charts.status.destroy();
    charts.status = new Chart(ctx3, { type:'pie', data:{ labels:['بانتظار','مقبول','مرفوض'], datasets:[{data:Object.values(statusMap), backgroundColor:['#C49A35','#2ECC71','#FF6B6B']}] } });
}

// ---------------- ADMIN: QUESTION MANAGEMENT ----------------
async function addQuestion(){
    const subject = document.getElementById('qSubject').value;
    const grade = document.getElementById('qGrade').value;
    const text = document.getElementById('qText').value.trim();
    const optionsRaw = document.getElementById('qOptions').value.trim();
    const correct = parseInt(document.getElementById('qCorrect').value);
    const marks = parseInt(document.getElementById('qMarks').value) || 1;

    if(!text || !optionsRaw || isNaN(correct)){ showToast('⚠️ يرجى تعبئة جميع حقول السؤال', 'warning'); return; }
    const options = optionsRaw.split(',').map(o=>o.trim()).filter(Boolean);
    if(correct<0 || correct>=options.length){ showToast('⚠️ فهرس الإجابة الصحيحة غير صالح', 'warning'); return; }

    const { error } = await sb.from('questions').insert({
        subject, grade, type:'mcq', question_text:text, options, correct_index:correct, marks
    });
    if(error){ showToast('❌ '+error.message,'error'); return; }
    showToast('✅ تمت إضافة السؤال', 'success');
    document.getElementById('qText').value=''; document.getElementById('qOptions').value=''; document.getElementById('qCorrect').value='';
    loadQuestionsList();
}

async function loadQuestionsList(){
    const container = document.getElementById('questionsList');
    if(!container) return;
    const { data: questions } = await sb.from('questions').select('*').order('created_at',{ascending:false}).limit(20);
    if(!questions || questions.length===0){ container.innerHTML='<div class="empty-state">لا توجد أسئلة مضافة بعد</div>'; return; }
    container.innerHTML = questions.map(q=>`
        <div class="qa-list-item">
            <span>${getSubjectLabel(q.subject)} · ${getGradeLabel(q.grade)} · ${q.question_text}</span>
            <button class="btn-mini reject" onclick="deleteQuestion('${q.id}')">حذف</button>
        </div>`).join('');
}
async function deleteQuestion(id){
    const { error } = await sb.from('questions').delete().eq('id', id);
    if(error){ showToast('❌ '+error.message,'error'); return; }
    showToast('🗑️ تم حذف السؤال', 'info');
    loadQuestionsList();
}

// ---------------- PDF REPORT ----------------
async function generatePDFReport(){
    const { data: students } = await sb.from('students').select('*');
    const reportHtml = `<div id="reportContent" style="font-family:'Tajawal',sans-serif;padding:24px;background:#fff;color:#222;direction:rtl;">
        <h1 style="color:#C49A35;text-align:center;">📊 تقرير نظام التقييم والقبول</h1>
        <p style="text-align:center;color:#888;">تم الإنشاء: ${new Date().toLocaleDateString('ar-SA')}</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:16px;">
            <thead><tr style="background:#C49A35;color:#fff;"><th style="padding:8px;">الاسم</th><th style="padding:8px;">الفرع</th><th style="padding:8px;">المرحلة</th><th style="padding:8px;">الحالة</th></tr></thead>
            <tbody>${(students||[]).map(s=>`<tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;">${s.name}</td><td style="padding:8px;">${s.branch==='ajyal'?'أجيال المعرفة':'بوابة الطفل'}</td>
                <td style="padding:8px;">${getGradeLabel(s.grade)}</td><td style="padding:8px;">${s.status}</td></tr>`).join('')}</tbody>
        </table></div>`;
    const tempDiv = document.createElement('div'); tempDiv.innerHTML = reportHtml; document.body.appendChild(tempDiv);
    html2pdf().set({ margin:1, filename:`تقرير_${Date.now()}.pdf`, jsPDF:{unit:'in',format:'a4'} })
        .from(document.getElementById('reportContent')).save().then(()=>{ tempDiv.remove(); showToast('📄 تم تحميل التقرير','success'); });
}

console.log('🚀 النظام متصل بقاعدة بيانات Supabase');
