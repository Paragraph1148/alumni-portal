import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useAuth } from "./AuthContext";
import { toast } from "sonner@2.0.3";
import { Badge } from "./ui/badge";
import {
  User,
  Briefcase,
  MapPin,
  GraduationCap,
  X,
  Plus,
  Image,
} from "lucide-react";

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const commonIndustries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Marketing",
  "Engineering",
  "Consulting",
  "Entrepreneurship",
  "Research",
  "Non-profit",
  "Government",
  "Manufacturing",
  "Retail",
  "Real Estate",
  "Entertainment",
];

export function UserProfile({ open, onOpenChange }: UserProfileProps) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [company, setCompany] = useState(user?.company || "");
  const [position, setPosition] = useState(user?.position || "");
  const [location, setLocation] = useState(user?.location || "");
  const [classYear, setClassYear] = useState(user?.class || "");
  const [major, setMajor] = useState(user?.major || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [industries, setIndustries] = useState<string[]>(
    user?.industries || []
  );
  const [newIndustry, setNewIndustry] = useState("");
  const [loading, setLoading] = useState(false);

  // Update form fields when user data changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setCompany(user.company || "");
      setPosition(user.position || "");
      setLocation(user.location || "");
      setClassYear(user.class || "");
      setMajor(user.major || "");
      setAvatar(user.avatar || "");
      setIndustries(user.industries || []);
    }
  }, [user]);

  const addIndustry = () => {
    if (newIndustry.trim() && !industries.includes(newIndustry.trim())) {
      setIndustries([...industries, newIndustry.trim()]);
      setNewIndustry("");
    }
  };

  const removeIndustry = (industryToRemove: string) => {
    setIndustries(
      industries.filter((industry) => industry !== industryToRemove)
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIndustry();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        name,
        company,
        position,
        location,
        class: classYear,
        major,
        avatar:
          avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        industries,
      });
      toast.success("Profile updated successfully!");
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent("profileUpdated"));
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
          <DialogDescription>
            Update your profile information to help other alumni connect with
            you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info Header */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            <div className="relative">
              {avatar ? (
                <img
                  src={avatar}
                  alt={user?.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3>{user?.name}</h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
              <Badge
                className="mt-1"
                variant={user?.role === "admin" ? "default" : "secondary"}
              >
                {user?.role === "admin"
                  ? "Admin"
                  : user?.role === "moderator"
                  ? "Moderator"
                  : "Member"}
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  <User className="inline h-4 w-4 mr-1" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (read-only)</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="class">
                  <GraduationCap className="inline h-4 w-4 mr-1" />
                  Class Year
                </Label>
                <Input
                  id="class"
                  value={classYear}
                  onChange={(e) => setClassYear(e.target.value)}
                  placeholder="2018"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="major">Major</Label>
                <Input
                  id="major"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="Computer Science"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">
                  <Briefcase className="inline h-4 w-4 mr-1" />
                  Company
                </Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Google"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="inline h-4 w-4 mr-1" />
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">
                <Image className="inline h-4 w-4 mr-1" />
                Avatar URL
              </Label>
              <Input
                id="avatar"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="text-xs text-gray-500">
                Leave empty to use a generated avatar based on your name
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="industries">Industries</Label>

              {/* Selected Industries */}
              {industries.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {industries.map((industry) => (
                    <Badge
                      key={industry}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {industry}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeIndustry(industry)}
                      />
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add Industry Input */}
              <div className="flex gap-2">
                <Input
                  id="industries"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add an industry..."
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addIndustry}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Common Industries Suggestions */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Common industries:</p>
                <div className="flex flex-wrap gap-2">
                  {commonIndustries
                    .filter((industry) => !industries.includes(industry))
                    .map((industry) => (
                      <Badge
                        key={industry}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          if (!industries.includes(industry)) {
                            setIndustries([...industries, industry]);
                          }
                        }}
                      >
                        {industry}
                        <Plus className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
