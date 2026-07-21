/* =============================================================
   Julie's Garden — SITE NAV (single source of truth)
   Every page includes this script. It renders:
     1. the "Posts" list into <ul id="posts-list">, grouped by year
     2. two dropdown sections (Garden Profiles, Articles and
        Reference Materials) which it inserts into the sidebar
   Adding a post/garden/article is a one-line edit below — no
   page markup needs to change.
   ============================================================= */
(function () {
  // ---- Posts: newest first -------------------------------------
  var POSTS = [
    { slug: "2024-02-01-february",          date: "February 2024",          year: 2024, title: "Spring 2024: Don’t Panic" },

    { slug: "2023-01-02-january-part-2",     date: "January 2023 · Part 2", year: 2023, title: "Pollinator Projects and Workshops for 2023 (Part 2)" },
    { slug: "2023-01-01-january",            date: "January 2023",           year: 2023, title: "Garden Projects and Consulting Services" },

    { slug: "2022-02-01-february",           date: "February 2022",          year: 2022, title: "A Few Garden Reflections" },
    { slug: "2022-01-02-january-part-2",     date: "January 2022 · Part 2", year: 2022, title: "Clouded Sulphur Recovery: A Wild Collection (Part 2)" },
    { slug: "2022-01-01-january",            date: "January 2022",           year: 2022, title: "Monarchs Everywhere! And a Plant List for 2022" },

    { slug: "2021-12-01-december",           date: "December 2021",          year: 2021, title: "The Pollinator Garden at Quaker’s Corners" },
    { slug: "2021-06-01-june",               date: "June 2021",              year: 2021, title: "Summer Begins" },
    { slug: "2021-04-01-april",              date: "April 2021",             year: 2021, title: "Earth Day 2021" },
    { slug: "2021-03-01-march",              date: "March 2021",             year: 2021, title: "Host Plants for Butterflies and Moths" },
    { slug: "2021-02-03-february-part-3",    date: "February 2021 · Part 3", year: 2021, title: "Smothering Grass to Make Pollinator Gardens (Part 3)" },
    { slug: "2021-02-02-february-part-2",    date: "February 2021 · Part 2", year: 2021, title: "Lessons Learned: A Quick List (Part 2)" },
    { slug: "2021-02-01-february",           date: "February 2021",          year: 2021, title: "Plants for 2021" },

    { slug: "2020-07-01-july",               date: "July 2020",              year: 2020, title: "Asclepias: Syriaca, Incarnata, and Tuberosa" },
    { slug: "2020-03-01-march",              date: "March 2020",             year: 2020, title: "Going Native" },

    { slug: "2019-12-01-winter",             date: "Winter 2019",            year: 2019, title: "Winter Features" },
    { slug: "2019-10-01-october",            date: "October 2019",           year: 2019, title: "The End Is Just the Beginning" },
    { slug: "2019-09-01-september",          date: "September 2019",         year: 2019, title: "September 2019 Blooms" },
    { slug: "2019-08-15-end-of-august",      date: "End of August 2019",     year: 2019, title: "Late August and Still Optimistic" },
    { slug: "2019-08-01-august",             date: "August 2019",            year: 2019, title: "Bee Balm and Echinacea" },
    { slug: "2019-07-01-july",               date: "July 2019",              year: 2019, title: "Visiting Pollinators" },
    { slug: "2019-06-01-early-summer",       date: "Early Summer 2019",      year: 2019, title: "Early Summer 2019 Blooms" },
    { slug: "2019-05-01-spring-in-the-garden", date: "Spring 2019",          year: 2019, title: "Spring in the garden" }
  ];

  // ---- Garden profiles: each links to its own page --------------
  var GARDENS = [
    { slug: "quinlan-covered-bridge", title: "The Butterfly Garden at Quinlan Covered Bridge" },
    { slug: "quakers-corners",        title: "The Butterfly Garden at Quaker’s Corners" },
    { slug: "rotax-and-roscoe",       title: "The Pollinator Garden at Rotax and Roscoe" },
    { slug: "guinea-road",            title: "Guinea Road Garden" },
    { slug: "fairwinds-farm",         title: "Fairwinds Farm" }
  ];

  // ---- Articles & reference: open in a new window ---------------
  // `local: true` means the file lives in this repo and needs the path prefix.
  var ARTICLES = [
    { title: "Gardening for Pollinators Master Gardener Booklet", href: "assets/docs/gardening-for-pollinators-master-gardener-booklet.pdf", local: true },
    { title: "The Citizen Newspaper", href: "https://www.vtcng.com/thecitizenvt/news/vermonters-help-state-s-pollinators-by-growing-native-crops-in-gardens/article_e93e848a-5a9b-11ef-8327-7fe24027a087.html" },
    { title: "Vermont Daily Chronicle", href: "https://vermontdailychronicle.com/citizen-science-key-to-preserving-monarch-butterflies-grand-migration-experts-say/" },
    { title: "Charlotte News", href: "https://www.charlottenewsvt.org/2024/11/28/julia-parker-dickinson-has-created-a-path-for-pollinators/" },
    { title: "Planting for Pollinators Presentation", href: "https://www.uvm.edu/d10-files/documents/2024-10/PollinatorGarden_JuliaParkerDickerson.pdf" },
    { title: "Class listing: North Branch Biodiversity University", href: "https://vnlavt.org/2025/05/04/north-branch-nature-center-biodiversity-university-course/" }
  ];

  // ---- Where are we? -------------------------------------------
  var path = window.location.pathname;
  var inPosts = path.indexOf("/posts/") !== -1;
  var inGardens = path.indexOf("/gardens/") !== -1;
  var prefix = (inPosts || inGardens) ? "../" : "";   // one folder deep
  var file = path.substring(path.lastIndexOf("/") + 1);
  var isHome = !inPosts && !inGardens && (file === "" || file === "index.html");
  var slugHere = file.replace(/\.html$/, "");

  // The home page mirrors the newest post, so highlight it there.
  var currentPost = inPosts ? slugHere : (isHome ? POSTS[0].slug : "");
  var currentGarden = inGardens ? slugHere : "";

  var homeHref = prefix + "index.html";

  // ---- 1. Posts list -------------------------------------------
  var list = document.getElementById("posts-list");
  if (list) {
    var frag = document.createDocumentFragment();
    var lastYear = null;
    POSTS.forEach(function (p) {
      if (p.year !== lastYear) {
        var y = document.createElement("li");
        y.className = "posts__year";
        y.setAttribute("aria-hidden", "true");
        y.textContent = p.year;
        frag.appendChild(y);
        lastYear = p.year;
      }
      var active = p.slug === currentPost;
      var li = document.createElement("li");
      li.className = "posts__item";
      if (active) li.setAttribute("aria-current", "page");
      var a = document.createElement("a");
      a.className = "posts__link";
      a.href = (active && isHome) ? homeHref : prefix + "posts/" + p.slug + ".html";
      var d = document.createElement("span");
      d.className = "posts__date";
      d.textContent = p.date;
      var t = document.createElement("span");
      t.className = "posts__title";
      t.textContent = p.title;
      a.appendChild(d); a.appendChild(t); li.appendChild(a);
      frag.appendChild(li);
    });
    list.innerHTML = "";
    list.appendChild(frag);
  }

  // ---- 2. Dropdown sections ------------------------------------
  function buildSection(label, items) {
    var details = document.createElement("details");
    details.className = "section";
    var summary = document.createElement("summary");
    summary.className = "section__summary";
    summary.textContent = label;          // no quotation marks in the label
    details.appendChild(summary);

    var ul = document.createElement("ul");
    ul.className = "section__list";
    items.forEach(function (it) {
      var li = document.createElement("li");
      li.className = "section__item";
      if (it.current) li.setAttribute("aria-current", "page");
      var a = document.createElement("a");
      a.className = "section__link";
      a.href = it.href;
      a.textContent = it.title;           // the name itself carries the link
      if (it.external) {
        a.target = "_blank";              // open in an additional window
        a.rel = "noopener noreferrer";
      }
      li.appendChild(a);
      ul.appendChild(li);
    });
    details.appendChild(ul);
    return details;
  }

  var sidebar = document.querySelector(".sidebar");
  var postsNav = sidebar && sidebar.querySelector('nav[aria-label="Posts"]');
  if (sidebar && postsNav) {
    var sections = document.createElement("nav");
    sections.className = "sections";
    sections.setAttribute("aria-label", "Sections");

    var gardenItems = GARDENS.map(function (g) {
      return {
        title: g.title,
        href: prefix + "gardens/" + g.slug + ".html",
        current: g.slug === currentGarden
      };
    });
    var gardenSection = buildSection("Garden Profiles", gardenItems);
    if (currentGarden) gardenSection.open = true;   // reveal the active garden
    sections.appendChild(gardenSection);

    var articleItems = ARTICLES.map(function (a) {
      return {
        title: a.title,
        href: a.local ? prefix + a.href : a.href,
        external: true
      };
    });
    sections.appendChild(buildSection("Articles and Reference Materials", articleItems));

    // Sit above the (long) post archive so the menus stay reachable.
    postsNav.parentNode.insertBefore(sections, postsNav);
  }
})();
