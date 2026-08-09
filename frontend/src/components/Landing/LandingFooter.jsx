import { Link } from "react-router-dom";

const footerLinks = [
  "About",
  "Help Center",
  "Terms of Service",
  "Privacy Policy",
  "Cookie Policy",
  "Accessibility",
  "Ads info",
  "Blog",
  "Status",
  "Careers",
  "Brand Resources",
  "Advertising",
  "Marketing",
  "Twitter for Business",
  "Developers",
  "Directory",
  "Settings",
];

function LandingFooter() {
  return (
    <footer className="w-full bg-white dark:bg-black py-4 px-6 border-t border-gray-200 dark:border-gray-800">
      <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
        {footerLinks.map((link) => (
          <Link key={link} to="#" className="hover:underline">
            {link}
          </Link>
        ))}
        <span>&copy; {new Date().getFullYear()} Chatter Corp.</span>
      </nav>
    </footer>
  );
}

export default LandingFooter;
