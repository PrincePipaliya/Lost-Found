import { Mail, Info } from "lucide-react";

export default function AboutContact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* ABOUT SECTION */}
        <section className="bg-white rounded-xl shadow p-6 animate-fadeInUp">
          <div className="flex items-center gap-2 mb-3">
            <Info className="text-blue-600" />
            <h1 className="text-3xl font-extrabold">About weFOUNDit</h1>
          </div>

          <p className="text-gray-700 leading-relaxed">
            <strong>weFOUNDit</strong> is a community-driven Lost & Found platform
            designed to help people reunite with their lost belongings.
          </p>

          <p className="text-gray-600 mt-3">
            Users can post lost or found items, while admins verify and approve
            listings to keep the platform safe, reliable, and spam-free.
          </p>

          <p className="text-gray-600 mt-3">
            Our goal is simple: <strong>connect people, restore belongings, and build trust.</strong>
          </p>
        </section>

        {/* CONTACT SECTION */}
        <section className="bg-white rounded-xl shadow p-6 animate-fadeInUp">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="text-green-600" />
            <h2 className="text-2xl font-bold">Contact Us</h2>
          </div>

          <p className="text-gray-600 mb-4">
            Have questions, feedback, or need help? Reach out anytime.
          </p>

          <div className="space-y-3 text-gray-700">
            <p>
              📧 <strong>Email:</strong>{" "}
              <a
                href="mailto:support@wefoundit.com"
                className="text-blue-600 hover:underline"
              >
                support@wefoundit.com
              </a>
            </p>

            <p>📍 <strong>Location:</strong> India</p>

            <p>⏱ <strong>Support Hours:</strong> 9 AM – 6 PM (IST)</p>
          </div>
        </section>
      </div>
    </div>
  );
}
