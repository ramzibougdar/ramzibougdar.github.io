/* ==========================================================================
   pdf.js — CV Ramzi Bougdar
   Code used by the downloadable PDF only, loaded by js/main.js in ?pdf mode, never by the
   site: the packing of the interest tags and the plain ATS document (window.CV_PDF). Uses
   the helpers of js/main.js (create, text, period, T).
   ========================================================================== */

/**
 * PDF only: orders the tags of a list so that the rows are as full as possible (little empty
 * space on the right): fewest rows, then the most even rows; fullest rows first, tags keep
 * their order inside a row. Measured with css/pdf.css applied to the screen for a moment
 * (scripts never see the print layout): the window must be A4 wide (794 px, README).
 * @param {HTMLElement} list
 */
function packTags(list) {
  if (!list || list.children.length > 14) return;
  var sheets = document.querySelectorAll('link[rel="stylesheet"][href$="pdf.css"]');
  sheets.forEach(function (l) { l.media = 'all'; });
  var items = Array.prototype.slice.call(list.children);
  var widths = items.map(function (li) { return li.getBoundingClientRect().width; });
  var row = list.getBoundingClientRect().width;
  var gap = parseFloat(getComputedStyle(list).columnGap) * row / list.clientWidth || 0;
  sheets.forEach(function (l) { l.media = 'print'; });
  var n = items.length, full = (1 << n) - 1;
  // Empty space left on a row holding the tags of a subset (-1: does not fit)
  var space = [];
  for (var sub = 1; sub <= full; sub++) {
    var used = -gap;
    for (var i = 0; i < n; i++) if (sub & 1 << i) used += widths[i] + gap;
    space[sub] = used <= row + .5 ? Math.max(0, row - used) : -1;
  }
  // For the tags of mask: [rows, sum of squared empty spaces, first row]; plain[] counts every
  // row, short[] leaves out one row (the last one, which may stay short)
  var plain = [[0, 0, 0]], short = [[0, 0, 0]], lastRow = [];
  function better(a, b) { return a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]); }
  for (var mask = 1; mask <= full; mask++) {
    var low = mask & -mask, rest = mask ^ low;
    plain[mask] = short[mask] = [Infinity, Infinity, 0];
    // Every row that holds the first remaining tag
    for (var part = rest; ; part = (part - 1) & rest) {
      var first = part | low, after = mask ^ first;
      if (space[first] >= 0) {
        var sq = space[first] * space[first];
        var p = [plain[after][0] + 1, plain[after][1] + sq, first];
        if (better(p, plain[mask])) plain[mask] = p;
        var k = [short[after][0] + 1, short[after][1] + sq, first];
        if (better(k, short[mask])) { short[mask] = k; lastRow[mask] = 0; }
        var e = [plain[after][0] + 1, plain[after][1], first];
        if (better(e, short[mask])) { short[mask] = e; lastRow[mask] = first; }
      }
      if (!part) break;
    }
  }
  // The full rows (most even), then the short row
  var rows = [], kept = 0, left = full;
  while (left && !kept) {
    kept = lastRow[left];
    rows.push(short[left][2]);
    left ^= short[left][2];
  }
  for (; left; left ^= plain[left][2]) rows.push(plain[left][2]);
  rows.sort(function (x, y) { return (x === kept) - (y === kept) || space[x] - space[y]; }).forEach(function (r) {
    items.forEach(function (li, i) { if (r & 1 << i) list.appendChild(li); });
  });
}

/**
 * ATS version (?ats): replaces the page with a plain one-column document that applicant
 * tracking systems read in order: header, summary, skills, experience with every mission,
 * client assignments, education, languages, interests. Section titles are the page's own.
 * @param {Object} cv localized CV
 */
function renderAts(cv) {
  var main = document.querySelector('main');
  if (!main) return;
  var heading = function (id, fallback) { var h = document.getElementById('title-' + id); return h ? h.textContent : fallback; };
  var line = function (parts) { return parts.filter(Boolean).join(' | '); };
  var short = function (url) { return typeof url === 'string' ? url.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '') : null; };
  var c = cv.contact || {};
  var p = cv.profile;
  var nodes = window.CV_CALC.timelineNodes(cv);
  // French typography puts a space before the colon
  var colon = document.documentElement.lang === 'fr' ? ' : ' : ': ';
  var section = function (title, content) { return create('section', null, [create('h2', null, title)].concat(content)); };
  var jobs = function (list) {
    return list.map(function (n) {
      return create('div', { className: 'ats__employer' }, n.positions.map(function (pos) {
        var type = pos.type === 'internship' ? ' (' + window.CV_CALC.TYPE_LABELS[pos.type] + ')' : '';
        return create('div', { className: 'ats__job' }, [
          create('h3', null, [pos.title + type + ' | ', n.employer.employer]),
          create('p', { className: 'ats__meta' }, period(pos.start, pos.end).concat(pos.via ? [' | ' + T.missionFor + pos.via] : [])),
          pos.description ? create('p', null, text(pos.description)) : null,
          pos.missions && pos.missions.length ? create('ul', null, pos.missions.map(function (m) { return create('li', null, text(m)); })) : null
        ]);
      }));
    });
  };
  var doc = create('article', { className: 'ats' }, [
    create('h1', null, p.name),
    create('p', { className: 'ats__title' }, p.title),
    create('p', null, line([p.location, c.email, c.phone])),
    create('p', null, line([short(c.linkedin), short(c.github), short(c.instagram), short(c.tiktok)])),
    section(heading('about', ''), (p.pdfSummary || p.summary || []).map(function (s) { return create('p', null, text(s)); })),
    section(heading('skills', T.skills), create('ul', null, (cv.skills || []).map(function (g) {
      return create('li', null, [create('strong', null, g.category + colon), g.items.join(', ')]);
    }))),
    section(heading('experience', ''), jobs(nodes.filter(function (n) { return !n.clientMission; }))),
    section(heading('missions', ''), jobs(nodes.filter(function (n) { return n.clientMission; }))),
    section(heading('education', ''), (cv.education || []).map(function (e) {
      return create('div', { className: 'ats__job' }, [
        create('h3', null, [text(e.degree), ' | ', e.school]),
        create('p', { className: 'ats__meta' }, line([e.start + ' – ' + e.end, e.field]))
      ]);
    })),
    section(heading('languages', ''), create('p', null, (cv.languages || []).map(function (l) {
      return l.language + ' (' + l.level + ')';
    }).join(', '))),
    section(T.hobbies, create('p', null, (cv.hobbies || []).map(function (h) { return typeof h === 'string' ? h : h.label; }).join(', ')))
  ]);
  main.replaceChildren(doc);
}

window.CV_PDF = { packTags: packTags, renderAts: renderAts };
