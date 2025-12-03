/* ------------------------------------------
   CONFIG
------------------------------------------- */

const SANITY_PROJECT_ID = "b1x0r10m"; 
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "2025-01-01";

// WRITE TOKEN (store safely later, but for testing allow temporarily)
const SANITY_WRITE_TOKEN = ""; 
// NOTE: If you want write support (add/delete from website) we move token to Netlify serverless functions.
// For now, read-only mode will work perfectly.

/* ------------------------------------------
   BUILD SANITY QUERY URL
------------------------------------------- */
function sanityQuery(groq) {
    return `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodeURIComponent(
        groq
    )}`;
}

/* ------------------------------------------
   PORTFOLIO MANAGER (REST API)
------------------------------------------- */

const PortfolioManager = {
    portfolioItems: [],

    async init() {
        await this.loadProjects();
        this.renderPortfolio();
        this.setupFilters();
        this.loadAdminList();
    },

    /* ------------------------------------------
       FETCH PROJECTS FROM SANITY (READ-ONLY)
    ------------------------------------------- */
    async loadProjects() {
        const query = `*[_type=="project"]|order(_createdAt desc){
            _id,
            title,
            category,
            "imageUrl": image.asset->url,
            description,
            link
        }`;

        try {
            const res = await fetch(sanityQuery(query));
            const json = await res.json();

            const categoryMap = {
                "motion graphics": "motion",
                "motion": "motion",
                "character animation": "character",
                "character": "character",
                "ui animation": "ui",
                "ui": "ui",
                "branding": "branding",
                "brand animation": "branding"
            };

            this.portfolioItems = (json.result || []).map(item => {
                const rawCat = (item.category || "").toString().toLowerCase().trim();
                const normalizedCategory = categoryMap[rawCat] || rawCat || "motion";

                return {
                    id: item._id,
                    title: item.title,
                    category: normalizedCategory,
                    image: item.imageUrl,
                    description: item.description,
                    link: item.link
                };
            });
        } catch (err) {
            console.error("SANITY FETCH ERROR:", err);
        }
    },

    /* ------------------------------------------
       RENDER PORTFOLIO GRID
    ------------------------------------------- */
    renderPortfolio(filter = "all") {
        const grid = document.getElementById("portfolioGrid");
        grid.innerHTML = "";

        const items = filter === "all"
            ? this.portfolioItems
            : this.portfolioItems.filter(i => i.category === filter);

        items.forEach(item => {
            const div = document.createElement("div");
            div.className = "portfolio-item";

            div.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="portfolio-img">
                <div class="portfolio-overlay">
                    <h3>${item.title}</h3>
                    <p>${item.description || ""}</p>
                    ${item.link ? `<a href="${item.link}" target="_blank" class="portfolio-link">View Project <i class="fas fa-arrow-right"></i></a>` : ""}
                </div>
            `;

            grid.appendChild(div);
        });
    },

    /* ------------------------------------------
       PORTFOLIO FILTER BUTTONS
    ------------------------------------------- */
    setupFilters() {
        const filterBtns = document.querySelectorAll(".filter-btn");

        filterBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                filterBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                const filter = btn.dataset.filter;
                this.renderPortfolio(filter);
            });
        });
    },

    /* ------------------------------------------
       ADMIN PANEL LIST
    ------------------------------------------- */
    loadAdminList() {
        const list = document.getElementById("portfolioList");
        const count = document.getElementById("projectCount");

        list.innerHTML = "";
        count.innerText = this.portfolioItems.length;

        this.portfolioItems.forEach(item => {
            const div = document.createElement("div");
            div.className = "admin-item";

            div.innerHTML = `
                <img src="${item.image}" />
                <div class="admin-info">
                    <h4>${item.title}</h4>
                    <p>${item.category}</p>
                </div>
                <button class="btn btn-small btn-danger delete-btn" data-id="${item.id}">
                    Delete
                </button>
            `;

            list.appendChild(div);
        });
    },
};

/* -----------------------------------------------------
   CONTACT FORM (EMAILJS)
------------------------------------------------------ */

(function() {
    emailjs.init("od5mVyj8w0nPv4Jq3");

    document.getElementById("contactForm").addEventListener("submit", function(e) {
        e.preventDefault();

        const btn = document.getElementById("submitBtn");
        btn.innerText = "Sending...";

        const templateParams = {
            from_name: document.getElementById("name").value,
            from_email: document.getElementById("email").value,
            subject: document.getElementById("subject").value,
            message: document.getElementById("message").value
        };

        emailjs.send("service_dpcfeyl", "template_2bb830h", templateParams)
        .then(() => {
            btn.innerText = "Message Sent";
            document.getElementById("contactForm").reset();
        })
        .catch(() => {
            btn.innerText = "Error";
        })
        .finally(() => {
            setTimeout(() => (btn.innerText = "Send Message"), 2000);
        });
    });
})();

/* -----------------------------------------------------
   ADMIN PANEL TOGGLE + PASSWORD
------------------------------------------------------ */

let adminPassword = localStorage.getItem("adminPassword") || "admin123";

// Open login modal when admin button is clicked
// Open login modal when admin button is clicked
document.getElementById("adminToggle").addEventListener("click", () => {
    document.getElementById("loginModal").style.display = "flex";
});


// close login modal
document.getElementById("loginClose").addEventListener("click", () => {
    document.getElementById("loginModal").style.display = "none";
});

// login
document.getElementById("loginForm").addEventListener("submit", e => {
    e.preventDefault();
    const pass = document.getElementById("adminPassword").value;

    if (pass === adminPassword) {
        document.getElementById("loginModal").style.display = "none";
    
        window.open("https://taupe-longma-8a28d7.netlify.app/structure", "_blank");
    }
    else {
        alert("Incorrect Password!");
    }
});

// close admin panel
document.getElementById("adminClose").addEventListener("click", () => {
    document.getElementById("adminPanel").classList.remove("active");
});

/* -----------------------------------------------------
   NAVIGATION, SCROLL EFFECTS & BACK TO TOP
------------------------------------------------------ */

function setupNavigation() {
    const header = document.getElementById("header");
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");
    const links = navLinks.querySelectorAll("a[href^='#']");
    const backToTop = document.getElementById("backToTop");
    const revealEls = document.querySelectorAll(".reveal");

    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }

    // Smooth scroll and close mobile menu
    links.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const targetId = link.getAttribute("href").substring(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                const offset = header ? header.offsetHeight : 0;
                const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: "smooth" });
            }
            navLinks.classList.remove("active");
        });
    });

    // Scroll + reveal handler
    function handleScroll() {
        const scrollY = window.scrollY || window.pageYOffset;

        // Header background
        if (header) {
            if (scrollY > 10) header.classList.add("scrolled");
            else header.classList.remove("scrolled");
        }

        // Back to top button
        if (backToTop) {
            if (scrollY > 350) backToTop.classList.add("visible");
            else backToTop.classList.remove("visible");
        }

        // Reveal sections
        revealEls.forEach(el => {
            const rect = el.getBoundingClientRect();
            const triggerPoint = window.innerHeight * 0.85;
            if (rect.top < triggerPoint) {
                el.classList.add("visible");
            }
        });
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // initial

    // Back to top click
    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
}

/* -----------------------------------------------------
   INIT EVERYTHING
------------------------------------------------------ */

window.addEventListener("DOMContentLoaded", () => {
    PortfolioManager.init();
    setupNavigation();
});
