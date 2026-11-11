import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Project connection values provided by the project owner.
// Supabase publishable keys are designed to be used in browser apps.
// Never place a Supabase secret/service-role key in this file.
const SUPABASE_URL = "https://hdxhymgktqzehfrrfjeb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_8Rbd084KMKNiWh2DUkdJBw_2KEqR-Kj";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (id) => document.getElementById(id);
let currentUser = null;
let authMode = "signup";
let jobsCache = [];
let businessesCache = [];

function toast(message) {
  const el = $("toast"); el.textContent = message; el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 4500);
}
function openModal(id){$(id).classList.remove("hidden")}
function closeModal(id){$(id).classList.add("hidden")}
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>closeModal(b.dataset.close)));
$("menuBtn").addEventListener("click",()=> $("nav").classList.toggle("open"));
$("nav").querySelectorAll("a").forEach(a=>a.addEventListener("click",()=> $("nav").classList.remove("open")));

function setAuthMode(mode){
 authMode=mode; const signup=mode==="signup";
 $("authTitle").textContent=signup?"Create your account":"Welcome back";
 $("authSubtitle").textContent=signup?"Join YouthTech Connect Uganda.":"Log in to your YouthTech Connect account.";
 $("fullName").required=signup; $("district").required=signup; $("interest").required=signup;
 $("fullName").parentElement.classList.toggle("hidden",!signup);
 $("districtLabel").classList.toggle("hidden",!signup); $("interestLabel").classList.toggle("hidden",!signup);
 $("authSubmit").textContent=signup?"Create account":"Log in";
 $("switchAuth").textContent=signup?"Log in":"Create an account";
 $("switchAuth").parentElement.firstChild.textContent=signup?"Already have an account? ":"New here? ";
 $("password").autocomplete=signup?"new-password":"current-password";
}
$("signupBtn").onclick=$("heroJoin").onclick=()=>{setAuthMode("signup");openModal("authModal")};
$("loginBtn").onclick=$("applyLogin").onclick=()=>{setAuthMode("login");openModal("authModal")};
$("switchAuth").onclick=()=>setAuthMode(authMode==="signup"?"login":"signup");
$("logoutBtn").onclick=async()=>{const {error}=await supabase.auth.signOut();if(error)toast(error.message);else toast("You have logged out.")};

async function updateSession(){
 const {data:{session}}=await supabase.auth.getSession(); currentUser=session?.user||null;
 $("loginBtn").classList.toggle("hidden",!!currentUser);$("signupBtn").classList.toggle("hidden",!!currentUser);
 $("logoutBtn").classList.toggle("hidden",!currentUser);
 if(currentUser){$("heroJoin").textContent="Account active";$("applyLogin").textContent="Signed in";}else{$("heroJoin").textContent="Create free account";$("applyLogin").textContent="Sign in to apply";}
}
supabase.auth.onAuthStateChange((_event,session)=>{currentUser=session?.user||null;updateSession();});
await updateSession();

$("authForm").addEventListener("submit",async(e)=>{
 e.preventDefault(); const email=$("email").value.trim();const password=$("password").value;
 $("authSubmit").disabled=true;
 try{
  if(authMode==="signup"){
   const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:$("fullName").value.trim(),district:$("district").value.trim(),interest:$("interest").value}}});
   if(error)throw error;
   if(data.session){toast("Account created and signed in.");}else{toast("Account created. Check your email to confirm, then log in.");}
  }else{
   const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;toast("Logged in successfully.");
  }
  closeModal("authModal");$("authForm").reset();await updateSession();
 }catch(err){toast(err.message||"Authentication failed.");}
 finally{$("authSubmit").disabled=false;}
});

async function loadJobs(){
 const {data,error}=await supabase.from("jobs").select("id,title,company,location,job_type,description,apply_url,created_at").eq("is_active",true).order("created_at",{ascending:false}).limit(100);
 jobsCache=data||[];
 const grid=$("jobsGrid");
 if(error){grid.innerHTML=`<div class="empty">Could not load opportunities. Please check the Supabase setup SQL and connection. <small>${escapeHtml(error.message)}</small></div>`;return;}
 renderJobs();
}
function renderJobs(){
 const q=$("jobSearch").value.toLowerCase(), type=$("jobType").value;
 const found=jobsCache.filter(j=>(!type||j.job_type===type)&&[j.title,j.company,j.location,j.description].join(" ").toLowerCase().includes(q));
 $("jobsGrid").innerHTML=found.length?found.map(j=>`<article class="job-card"><span class="pill">${escapeHtml(j.job_type||"Opportunity")}</span><h3>${escapeHtml(j.title)}</h3><b>${escapeHtml(j.company||"Organization")}</b><p class="job-meta">📍 ${escapeHtml(j.location||"Uganda")}</p><p>${escapeHtml((j.description||"").slice(0,220))}</p><button class="btn apply-btn" data-id="${j.id}">Apply / view details</button></article>`).join(""):`<div class="empty">No matching opportunities yet. Check back soon.</div>`;
 document.querySelectorAll(".apply-btn").forEach(btn=>btn.onclick=()=>applyForJob(btn.dataset.id));
}
$("jobSearch").addEventListener("input",renderJobs);$("jobType").addEventListener("change",renderJobs);
async function applyForJob(id){
 if(!currentUser){setAuthMode("login");openModal("authModal");toast("Please log in to apply.");return;}
 const job=jobsCache.find(j=>j.id===id);if(!job)return;
 if(job.apply_url){window.open(job.apply_url,"_blank","noopener");return;}
 const {error}=await supabase.from("applications").insert({job_id:id,user_id:currentUser.id});
 if(error){toast(error.message.includes("duplicate")?"You have already applied.":error.message);}else toast("Application submitted.");
}
async function loadBusinesses(){
 const {data,error}=await supabase.from("businesses").select("id,name,category,district,email,description,created_at").eq("is_approved",true).order("created_at",{ascending:false}).limit(100);
 businessesCache=data||[];const grid=$("businessGrid");
 if(error){grid.innerHTML=`<div class="empty">Businesses will appear after database setup. ${escapeHtml(error.message)}</div>`;return;}
 grid.innerHTML=businessesCache.length?businessesCache.map(b=>`<article class="business-card"><span class="pill">${escapeHtml(b.category||"Local business")}</span><h3>${escapeHtml(b.name)}</h3><p class="job-meta">${escapeHtml(b.district||"Uganda")}</p><p>${escapeHtml(b.description||"")}</p><a href="mailto:${encodeURIComponent(b.email)}">${escapeHtml(b.email)}</a></article>`).join(""):`<div class="empty">No approved businesses listed yet. Local businesses can submit a profile.</div>`;
}
$("businessBtn").onclick=()=>{if(!currentUser){setAuthMode("login");openModal("authModal");toast("Please log in first.");}else openModal("businessModal");};
$("businessForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!currentUser){toast("Please sign in first.");return;}
 const {error}=await supabase.from("businesses").insert({owner_id:currentUser.id,name:$("bizName").value.trim(),category:$("bizCategory").value.trim(),district:$("bizDistrict").value.trim(),email:$("bizEmail").value.trim(),description:$("bizDescription").value.trim(),is_approved:false});
 if(error)toast(error.message);else{toast("Business submitted for admin review.");closeModal("businessModal");e.target.reset();}
});
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
await Promise.all([loadJobs(),loadBusinesses()]);
