export const site = {
  name: "Sidhartha Watsa",
  role: "Research Engineer",
  employer: "UC San Diego",
  location: "San Diego",
  email: "swatsa@ucsd.edu",
  url: "https://sidwat.github.io",
};

// `nav` also drives the sitemap and the 404 link list. The blog stays listed
// while it has no posts (Q9 default); the gallery stays out until it has content.
// Labels are the `nav.*` IDs in docs/design/copy.md.
export const nav = [
  { href: "/", label: "Home" },
  { href: "/experience", label: "Experience" },
  { href: "/publications", label: "Publications" },
  { href: "/projects", label: "Projects" },
  { href: "/teaching", label: "Teaching" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

// Generated 1:1 from docs/design/copy.md ("Shell: navigation and footer", the
// IDs not covered by `nav` above). Do not edit by hand: change the copy deck.
export const shellCopy = {
  "nav.aria": "Sections",
  "footer.elsewhere": "Elsewhere",
  "footer.touch": "Get in touch",
  "footer.write": "Write a message",
  "footer.copyright": "© {year} {name}",
} as const;

export const socials = [
  { href: "https://github.com/sidwat", label: "GitHub" },
  { href: "https://www.linkedin.com/in/sidhartha-watsa", label: "LinkedIn" },
  {
    href: "https://scholar.google.com/citations?user=HoIkFUgAAAAJ&hl=en",
    label: "Google Scholar",
  },
  { href: "https://orcid.org/0009-0003-3888-0736", label: "ORCID" },
];
