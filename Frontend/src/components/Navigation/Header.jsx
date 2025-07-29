import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, db } from "../../Firebase"; // <-- ADDED db import
import { doc, getDoc } from "firebase/firestore"; // <-- ADDED Firestore functions

const navigation = [
  { name: "Home", to: "/" },
  { name: "Participate", to: "/participate" },
  { name: "Practice", to: "/practice" },
];
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
export default function Header() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUser(docSnap.data().username || user.email);
          } else {
            setUser(user.email);
          }
        } catch (err) {
          console.error("Failed to fetch username:", err);
          setUser(user.email);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-20 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <span className="flex items-center text-3xl font-extrabold right-20 dark:text-white">
                    <Link to="/">CodeHat</Link>
                  </span>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.to}
                        className={classNames(
                          location.pathname === item.to
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                          "rounded-md px-3 py-2 text-base font-medium"
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex">
                          <span className="sr-only">Open user menu</span>
                          <span className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-base font-medium">
                            Online Compilers
                          </span>
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/pythoncompiler"
                                className={classNames(
                                  active ? "bg-gray-300" : "",
                                  "block px-4 py-2 text-sm text-gray-800"
                                )}
                              >
                                Python
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <span
                                title="Coming Soon"
                                className={classNames(
                                  "block px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                                )}
                              >
                                Java (Coming Soon)
                              </span>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <span
                                title="Coming Soon"
                                className={classNames(
                                  "block px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                                )}
                              >
                                C++ (Coming Soon)
                              </span>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <Link
                  to="#"
                  className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  title="Work in Progress..."
                >
                  <span className="sr-only">Search</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </Link>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src="https://img.freepik.com/free-icon/google-contacts_318-559965.jpg"
                        alt=""
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {user ? (
                          <>
                            <span className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-700 truncate max-w-[12rem] transition-colors duration-150">
                            <span role="img" aria-label="Hat" className="mr-1">🎩</span> Welcome, {user}
                            </span>

                            <Link
                              to="/userprofile"
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black transition-colors duration-150"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5.121 17.804A11.955 11.955 0 0112 15c2.485 0 4.779.755 6.879 2.047M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              Your Profile
                            </Link>

                            <button
                            onClick={() => auth.signOut()}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700 flex items-center gap-2 transition-colors duration-150">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 002 2h3a2 2 0 002-2V7a2 2 0 00-2-2h-3a2 2 0 00-2 2v1"
                              />
                            </svg>
                            Logout
                          </button>

                          </>
                        ) : (
                          <Link
  to="/login"
  className="w-full block text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black rounded-md transition-colors duration-150"
>
  Login
</Link>

                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className={classNames(
                    location.pathname === item.to
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <Menu as="div" className="relative">
                <div>
                  <Menu.Button className="flex">
                    <span className="sr-only">Open user menu</span>
                    <span className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-base font-medium">
                      Online Compliers
                    </span>
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/pythoncompiler"
                          className={classNames(
                            active ? "bg-gray-300" : "",
                            "block px-4 py-2 text-sm text-gray-800"
                          )}
                        >
                          Python
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <span
                          title="Coming Soon"
                          className={classNames(
                            "block px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                          )}
                        >
                          Java (Coming Soon)
                        </span>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <span
                          title="Coming Soon"
                          className={classNames(
                            "block px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                          )}
                        >
                          C++ (Coming Soon)
                        </span>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
