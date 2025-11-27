/* script.js - Sanity + EmailJS integrated (for projectId b1x0r10m) */

// Sanity client (UMD must be included in index.html)
const client = sanityClient({
  projectId: 'b1x0r10m',   // <-- your Sanity project id
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: true
});

// set this to your local studio while developing, or deployed Studio URL
const STUDIO_URL = 'http://localhost:3333';

class PortfolioManager {
  constructor() {
    this.portfolioItems = [];
    this.init();
  }

  async init() {
    await this.loadFromSanity();
    this.renderPortfolio();
    this.setupEventListeners();
    this.updateProjectCount();
    this.initPortfolioFiltering();
    this.setupMisc();
  }

  async loadFromSanity() {
    const query = `*[_type == "project"] | order(_createdAt desc){
      _id, title, category,
      "imageUrl": image.asset->url,
      description, link
    }`;
    try {
      const res = await client.fetch(query);
      this.portfolioItems = (res || []).map(r => ({
        id: r._id,
        title: r.title || '',
        category: r.category || 'motion',
        image: r.imageUrl || '',
        description: r.description || '',
        link: r.link || '#'
      }));
    } catch (e) {
      console.error('Sanity fetch failed', e);
      this.portfolioItems = [];
    }
  }

  updateProjectCount() {
    const el = document.getElementById('projectCount');
    if (el) el.textContent = this.portfolioItems.length;
  }

  renderPortfolio() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;
    if (!this.portfolioItems.length) {
      grid.innerHTML = `<p style="text-align:center;color:rgba(245,245,247,0.7)">No projects yet</p>`;
      return;
    }
    grid.innerHTML = this.portfolioItems.map(item => `
      <div class="portfolio-item" data-category="${this.escapeHtml(item.category)}">
        <img src="${this.escapeHtml(item.image)}" alt="${this.escapeHtml(item.title)}" class="portfolio-img">
        <div class="portfolio-overlay">
          <h3>${this.escapeHtml(item.title)}</h3>
          <p>${this.escapeHtml(item.description)}</p>
          <a href="${item.link || '#'}" class="portfolio-link" ${item.link && item.link !== '#' ? 'target="_blank" rel="noopener"' : ''}>
            View Project <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    `).join('');
    this.initPortfolioFiltering();
  }

  escapeHtml(str=''){ return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

  initPortfolioFiltering(){
    const filterButtons = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.portfolio-item');
    if (!filterButtons.length) return;
    // replace to avoid duplicate listeners
    filterButtons.forEach(b => b.replaceWith(b.cloneNode(true)));
    const updated = document.querySelectorAll('.filter-btn');
    updated.forEach(button => {
      button.addEventListener('click', function(){
        updated.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const f = this.dataset.filter;
        items.forEach(item => item.style.display = (f === 'all' || item.dataset.category === f) ? 'block' : 'none');
      });
    });
  }

  setupEventListeners(){
    const adminToggle = document.getElementById('adminToggle');
    if (adminToggle) adminToggle.addEventListener('click', () => window.open(STUDIO_URL, '_blank'));
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e){
        const id = this.getAttribute('href');
        if (!id || id === '#') return;
        e.preventDefault();
        const target = document.querySelector(id);
        if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      });
    });
  }

  setupMisc(){
    // header scroll
    window.addEventListener('scroll', () => {
      const header = document.getElementById('header');
      if (!header) return;
      header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // animate on scroll
    const animateOnScroll = () => {
      document.querySelectorAll('.about-content, .portfolio-item, .contact-content').forEach(el => {
        const top = el.getBoundingClientRect().top;
        if (top < window.innerHeight / 1.3) { el.style.opacity='1'; el.style.transform='translateY(0)'; }
      });
    };
    document.querySelectorAll('.about-content, .portfolio-item, .contact-content').forEach(el => {
      el.style.opacity='0'; el.style.transform='translateY(20px)'; el.style.transition='opacity 0.5s ease, transform 0.5s ease';
    });
    window.addEventListener('scroll', animateOnScroll);
    window.addEventListener('load', animateOnScroll);
    animateOnScroll();
  }
}

const portfolioManager = new PortfolioManager();

/* ---------------- EmailJS contact form (keeps your keys) ---------------- */
(function(){ try{ if (emailjs) emailjs.init("afMMAgYDmuBwYdDQN"); }catch(e){console.warn('EmailJS init failed',e);} })();

const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const submitBtn = document.getElementById('submitBtn');

function showMessage(message,type){ if(!formMessage) return; formMessage.innerHTML = (type==='success'?`<i class="fas fa-check-circle"></i> ${message}`:`<i class="fas fa-exclamation-circle"></i> ${message}`); formMessage.className=`form-status ${type}`; formMessage.style.display='block'; if(type==='success') setTimeout(()=>formMessage.style.display='none',5000); }

if(contactForm){
  contactForm.addEventListener('submit', function(e){
    e.preventDefault();
    const name=document.getElementById('name').value, email=document.getElementById('email').value, subject=document.getElementById('subject').value, message=document.getElementById('message').value;
    if(!name||!email||!message){ showMessage("Please fill in all required fields.","error"); return; }
    const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/; if(!emailRegex.test(email)){ showMessage("Please enter a valid email address.","error"); return; }
    submitBtn.disabled=true; submitBtn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Sending...';
    emailjs.send("service_dpcfeyl","template_2bb830h",{ from_name:name, from_email:email, subject:subject||"No Subject", message:message, to_email:"mohanssapkale@gmail.com", reply_to:email })
    .then(()=>{ showMessage("Thank you for your message! I will get back to you soon.","success"); contactForm.reset(); submitBtn.disabled=false; submitBtn.innerHTML='Send Message'; }, ()=>{ showMessage("Sorry, there was an error. Please try again later or email me directly.","error"); submitBtn.disabled=false; submitBtn.innerHTML='Send Message'; });
  });
}

if(formMessage) formMessage.addEventListener('click', function(){ this.style.display='none'; });
