import { Mail, Phone } from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-gray-200 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Content */}
        <div className="grid md:grid-cols-5 gap-12 mb-2 pl-6">
          {/* Brand & Contact Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-4xl font-bold text-white">TenantFlow</h2>
            </div>

            <p className="text-gray-400 text-base mb-6 max-w-sm">
              Streamline your team workflow and collaboration with our
              all-in-one platform designed for modern teams.
            </p>

            {/* Contact Section */}
            <div className="mb-8">
              <h4 className="font-semibold text-white mb-4 uppercase text-xs">
                Our Contacts
              </h4>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <a
                  href="mailto:support@tenantflow.com"
                  className="text-gray-300 hover:text-white transition"
                >
                  support@tenantflow.com
                </a>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Contact: Support Team
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-10 gap-12 ml-10">
            <div className="md:col-span-4">
              <h4 className="font-semibold text-white mb-6 uppercase text-sm">
                Quick Links
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition text-sm"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition text-sm"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition text-sm"
                  >
                    Process
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition text-sm"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Our Products */}
            <div className="md:col-span-4">
              <h4 className="font-semibold text-white mb-6 uppercase text-sm">
                Our Features
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition text-sm"
                  >
                    Projects
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition text-sm"
                  >
                    Tasks
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition text-sm"
                  >
                    Teams
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition text-sm"
                  >
                    Analytics
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition text-sm"
                  >
                    Collaboration
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-6 mt-2">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pl-6">
            <p className="text-gray-500 text-base">
              &copy; {currentYear} TenantFlow. All rights reserved.
            </p>
            <div className="flex gap-6 pr-6">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition text-base"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition text-base"
              >
                Terms of Service
              </a>
            </div>
          </div>
          <p className="text-gray-600 text-base mt-2 pl-6">
            Made with &hearts; by TenantFlow Team
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
