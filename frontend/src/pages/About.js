import {
  Search,
  ShieldCheck,
  Users,
  Smartphone,
  Database,
  Server,
  LayoutDashboard
} from "lucide-react";

export default function About() {

  const features = [
    {
      icon: Search,
      title: "Lost & Found Listings",
      desc: "Users can easily post lost or found items with images and details so others can help return them."
    },
    {
      icon: Users,
      title: "User Accounts",
      desc: "Create an account to manage your posts, track items, and communicate with others."
    },
    {
      icon: ShieldCheck,
      title: "Secure System",
      desc: "Authentication, rate limiting, and security protections help keep the platform safe."
    },
    {
      icon: LayoutDashboard,
      title: "Personal Dashboard",
      desc: "Each user has a dashboard to view items and manage their lost or found posts."
    }
  ];

  const techStack = [
    {
      icon: Smartphone,
      name: "React",
      desc: "Frontend interface built using React and modern UI components."
    },
    {
      icon: Server,
      name: "Node.js + Express",
      desc: "Backend API handles authentication, items, and data processing."
    },
    {
      icon: Database,
      name: "MongoDB",
      desc: "Database used to store users, lost items, and found items."
    }
  ];

  return (

    <div className="min-h-screen bg-gray-50">

      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">

          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            About weFOUNDit
          </h1>

          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            weFOUNDit is a modern Lost & Found platform designed to help people
            reconnect with their lost belongings through a secure and easy-to-use system.
          </p>

        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-14">

        <h2 className="text-3xl font-bold mb-4">
          Our Mission
        </h2>

        <p className="text-gray-700 leading-relaxed">
          Losing personal belongings can be stressful and frustrating.
          Our mission is to create a platform where people can easily report
          lost items, post found items, and connect with others to return them.
          By combining modern web technologies with a simple interface,
          we aim to make recovering lost items faster and easier.
        </p>

      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">

        <h2 className="text-3xl font-bold text-center mb-10">
          Key Features
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {features.map((feature, index) => {

            const Icon = feature.icon;

            return (

              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
              >

                <Icon className="text-blue-600 mb-3" size={28} />

                <h3 className="font-semibold text-lg mb-2">
                  {feature.title}
                </h3>

                <p className="text-gray-600 text-sm">
                  {feature.desc}
                </p>

              </div>

            );

          })}

        </div>

      </section>

      <section className="bg-white py-16">

        <div className="max-w-5xl mx-auto px-6">

          <h2 className="text-3xl font-bold text-center mb-10">
            Technology Stack
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            {techStack.map((tech, index) => {

              const Icon = tech.icon;

              return (

                <div
                  key={index}
                  className="border p-6 rounded-xl text-center hover:shadow-md transition"
                >

                  <Icon className="mx-auto text-indigo-600 mb-3" size={30} />

                  <h3 className="font-semibold text-lg mb-2">
                    {tech.name}
                  </h3>

                  <p className="text-gray-600 text-sm">
                    {tech.desc}
                  </p>

                </div>

              );

            })}

          </div>

        </div>

      </section>

      <section className="py-12 text-center text-gray-500 text-sm">

        <p>
          © {new Date().getFullYear()} weFOUNDit — Lost & Found Platform
        </p>

      </section>

    </div>

  );

}