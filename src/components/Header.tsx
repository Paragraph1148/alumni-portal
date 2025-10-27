import { useState } from "react";
import { Button } from "./ui/button";
import {
  Bell,
  Menu,
  Search,
  User,
  LogOut,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { Input } from "./ui/input";
import { useSearch } from "./SearchContext";
import { useAuth } from "./AuthContext";
import { LoginDialog } from "./LoginDialog";
import { UserProfile } from "./UserProfile";
import { AdminDashboard } from "./AdminDashboard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Header() {
  const { searchQuery, setSearchQuery } = useSearch();
  const { user, logout, isModerator } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Scroll to directory section when user searches
    if (value) {
      const directorySection = document.getElementById("directory");
      if (directorySection) {
        directorySection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleMobileSearch = (value: string) => {
    setSearchQuery(value);
    setMobileMenuOpen(false); // Close menu after search
    // Scroll to directory section when user searches
    if (value) {
      const directorySection = document.getElementById("directory");
      if (directorySection) {
        directorySection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleMobileNavClick = () => {
    setMobileMenuOpen(false); // Close menu after navigation
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="w-full max-w-screen-2xl mx-auto flex h-16 items-center justify-between px-4 md:px-8 lg:px-12">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600" />
            <span className="font-semibold">Alumni Portal</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#directory"
              className="text-sm hover:text-blue-600 transition-colors"
            >
              Directory
            </a>
            <a
              href="#events"
              className="text-sm hover:text-blue-600 transition-colors"
            >
              Events
            </a>
            <a
              href="#jobs"
              className="text-sm hover:text-blue-600 transition-colors"
            >
              Jobs
            </a>
            <a
              href="#news"
              className="text-sm hover:text-blue-600 transition-colors"
            >
              News
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search alumni..."
              className="w-64"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {user && (
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                {isModerator() && (
                  <DropdownMenuItem onClick={() => setAdminOpen(true)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => setLoginOpen(true)}
              className="hidden md:flex"
            >
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Overlay - Fixed to cover entire screen */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel - Now covers full height and width */}
          <div className="relative flex-1 flex flex-col bg-white">
            {/* Header - Fixed height */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content - Scrollable area that takes remaining space */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Mobile Search */}
              <div className="flex items-center gap-2 mb-6">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search alumni..."
                  value={searchQuery}
                  onChange={(e) => handleMobileSearch(e.target.value)}
                  className="flex-1"
                />
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col space-y-3 mb-6">
                <a
                  href="#directory"
                  className="text-lg py-4 px-4 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors border border-gray-100"
                  onClick={handleMobileNavClick}
                >
                  Directory
                </a>
                <a
                  href="#events"
                  className="text-lg py-4 px-4 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors border border-gray-100"
                  onClick={handleMobileNavClick}
                >
                  Events
                </a>
                <a
                  href="#jobs"
                  className="text-lg py-4 px-4 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors border border-gray-100"
                  onClick={handleMobileNavClick}
                >
                  Jobs
                </a>
                <a
                  href="#news"
                  className="text-lg py-4 px-4 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors border border-gray-100"
                  onClick={handleMobileNavClick}
                >
                  News
                </a>
              </nav>

              {/* Mobile Authentication Section */}
              {user ? (
                <div className="border-t pt-4">
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <Button
                      variant="ghost"
                      className="justify-start py-4 text-base"
                      onClick={() => {
                        setProfileOpen(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Settings className="h-5 w-5 mr-3" />
                      My Profile
                    </Button>
                    {isModerator() && (
                      <Button
                        variant="ghost"
                        className="justify-start py-4 text-base"
                        onClick={() => {
                          setAdminOpen(true);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Shield className="h-5 w-5 mr-3" />
                        Admin Dashboard
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="justify-start py-4 text-base text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Logout
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setLoginOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-6 text-base"
                >
                  <User className="h-5 w-5 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <UserProfile open={profileOpen} onOpenChange={setProfileOpen} />
      <AdminDashboard open={adminOpen} onOpenChange={setAdminOpen} />
    </header>
  );
}
