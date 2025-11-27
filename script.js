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

            this.portfolioItems = json.result.map(item => ({
                id: item._id,
                title: item.title,
                category: item.category,
                image: item.imageUrl,
                description: item.description,
                link: item.link
            }));
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
                <img src="${item.image}" alt="${item.title}">
                <div class="portfolio-info">
                    <h4>${item.title}</h4>
                    <p>${item.category}</p>
                    <a href="${item.link}" target="_blank" class="btn btn-small">View</a>
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
            name: document.getElementById("name").value,
            reply_to: document.getElementById("email").value,
            subject: document.getElementById("subject").value,
            message: document.getElementById("message").value
        };

        emailjs.send("service_g4um9o9", "template_1hx7p2i", templateParams)
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
   INIT EVERYTHING
------------------------------------------------------ */

window.addEventListener("DOMContentLoaded", () => {
    PortfolioManager.init();
});
