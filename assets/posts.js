/* =============================================================
   Julie's Garden — POST INDEX (single source of truth)
   Every page includes this script; it renders the sidebar
   "Posts" list (grouped by year, newest first) into
   <ul id="posts-list">. Add a new post by adding ONE entry
   to the POSTS array below — no need to edit every page.
   ============================================================= */
(function () {
  // Newest first. dateISO drives ordering only through this hand-sorted order.
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

  var list = document.getElementById("posts-list");
  if (!list) return;

  var path = window.location.pathname;
  var inPosts = path.indexOf("/posts/") !== -1;
  var file = path.substring(path.lastIndexOf("/") + 1);
  var isHome = !inPosts && (file === "" || file === "index.html");
  // The home page mirrors the newest post, so highlight it there.
  var currentSlug = inPosts ? file.replace(/\.html$/, "") : (isHome ? POSTS[0].slug : "");

  var homeHref = inPosts ? "../index.html" : "index.html";
  function hrefFor(slug) {
    return inPosts ? slug + ".html" : "posts/" + slug + ".html";
  }

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
    var active = p.slug === currentSlug;
    var li = document.createElement("li");
    li.className = "posts__item";
    if (active) li.setAttribute("aria-current", "page");
    var a = document.createElement("a");
    a.className = "posts__link";
    a.href = (active && isHome) ? homeHref : hrefFor(p.slug);
    var d = document.createElement("span");
    d.className = "posts__date";
    d.textContent = p.date;
    var t = document.createElement("span");
    t.className = "posts__title";
    t.textContent = p.title;
    a.appendChild(d);
    a.appendChild(t);
    li.appendChild(a);
    frag.appendChild(li);
  });
  list.innerHTML = "";
  list.appendChild(frag);
})();
