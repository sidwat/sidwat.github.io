export const site = {
  name: "Sidhartha Watsa",
  role: "Research Engineer",
  employer: "UC San Diego",
  location: "San Diego",
  email: "sidhartha2182000@gmail.com",
  url: "https://sidwat.github.io",
};

// Blog and gallery have routes but no content, so they stay out of the nav
// rather than sending anyone to a dead end. Add them back when they have
// something in them.
export const nav = [
  { href: "/", label: "Home" },
  { href: "/experience", label: "Experience" },
  { href: "/publications", label: "Publications" },
  { href: "/projects", label: "Projects" },
  { href: "/cv", label: "CV" },
];

export const socials = [
  { href: "https://github.com/sidwat", label: "GitHub" },
  { href: "https://www.linkedin.com/in/sidhartha-watsa", label: "LinkedIn" },
  {
    href: "https://scholar.google.com/citations?user=HoIkFUgAAAAJ&hl=en",
    label: "Google Scholar",
  },
  { href: "https://orcid.org/0009-0003-3888-0736", label: "ORCID" },
];
