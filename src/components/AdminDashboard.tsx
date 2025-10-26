import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useAuth } from "./AuthContext";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";
import {
  Calendar,
  Briefcase,
  Newspaper,
  Users,
  Trash2,
  Edit,
  Plus,
  X,
} from "lucide-react";

interface AdminDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EventForm {
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  category: string;
  image: string;
  status: string;
}

interface JobForm {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  postedBy: string;
  tags: string[];
}

interface NewsForm {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
}

export function AdminDashboard({ open, onOpenChange }: AdminDashboardProps) {
  const { user, isModerator } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form dialogs state
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [newsDialogOpen, setNewsDialogOpen] = useState(false);

  // Editing state
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [editingNews, setEditingNews] = useState<any>(null);

  // Form data
  const [eventForm, setEventForm] = useState<EventForm>({
    title: "",
    date: "",
    time: "",
    location: "",
    attendees: 0,
    category: "Networking",
    image: "",
    status: "upcoming",
  });

  const [jobForm, setJobForm] = useState<JobForm>({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    salary: "",
    posted: "Today",
    postedBy: "",
    tags: [],
  });

  const [newsForm, setNewsForm] = useState<NewsForm>({
    title: "",
    excerpt: "",
    category: "Announcement",
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    readTime: "3 min read",
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (open && isModerator()) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("Loading admin data...");
      const sessionData = localStorage.getItem("alumni_session");
      if (!sessionData) return;

      const session = JSON.parse(sessionData);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d96042de/admin/data`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "X-Session-Token": session.token,
          },
        }
      );
      console.log("Load data response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Loaded data:", data);
        setEvents(data.events || []);
        setJobs(data.jobs || []);
        setNews(data.news || []);
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to load admin data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (type: string, id: string) => {
    try {
      console.log("Deleting:", type, id);

      const sessionData = localStorage.getItem("alumni_session");
      if (!sessionData) return;

      const session = JSON.parse(sessionData);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d96042de/admin/${type}/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "X-Session-Token": session.token,
          },
        }
      );
      console.log("Delete response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Delete response data:", result);

        toast.success("Item deleted successfully");
        loadData();
      } else {
        const error = await response.json();
        console.log("Delete error:", error);
        toast.error("Failed to delete item");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleCreateEvent = async () => {
    try {
      const sessionData = localStorage.getItem("alumni_session");
      if (!sessionData) return;

      const session = JSON.parse(sessionData);
      const url = editingEvent
        ? `https://${projectId}.supabase.co/functions/v1/make-server-d96042de/admin/events/${editingEvent.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-d96042de/admin/events`;

      const response = await fetch(url, {
        method: editingEvent ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
          "X-Session-Token": session.token,
        },
        body: JSON.stringify(eventForm),
      });

      if (response.ok) {
        toast.success(
          editingEvent
            ? "Event updated successfully"
            : "Event created successfully"
        );
        setEventDialogOpen(false);
        setEditingEvent(null);
        setEventForm({
          title: "",
          date: "",
          time: "",
          location: "",
          attendees: 0,
          category: "Networking",
          image: "",
          status: "upcoming",
        });
        loadData();
      } else {
        toast.error("Failed to save event");
      }
    } catch (error) {
      console.error("Event save error:", error);
      toast.error("Failed to save event");
    }
  };

  const handleCreateJob = async () => {
    try {
      const sessionData = localStorage.getItem("alumni_session");
      if (!sessionData) return;

      const session = JSON.parse(sessionData);
      const url = editingJob
        ? `https://${projectId}.supabase.co/functions/v1/make-server-d96042de/admin/jobs/${editingJob.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-d96042de/admin/jobs`;

      const response = await fetch(url, {
        method: editingJob ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
          "X-Session-Token": session.token,
        },
        body: JSON.stringify(jobForm),
      });

      if (response.ok) {
        toast.success(
          editingJob ? "Job updated successfully" : "Job created successfully"
        );
        setJobDialogOpen(false);
        setEditingJob(null);
        setJobForm({
          title: "",
          company: "",
          location: "",
          type: "Full-time",
          salary: "",
          posted: "Today",
          postedBy: "",
          tags: [],
        });
        loadData();
      } else {
        toast.error("Failed to save job");
      }
    } catch (error) {
      console.error("Job save error:", error);
      toast.error("Failed to save job");
    }
  };

  const handleCreateNews = async () => {
    try {
      const sessionData = localStorage.getItem("alumni_session");
      if (!sessionData) return;

      const session = JSON.parse(sessionData);
      const url = editingNews
        ? `https://${projectId}.supabase.co/functions/v1/make-server-d96042de/admin/news/${editingNews.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-d96042de/admin/news`;

      const response = await fetch(url, {
        method: editingNews ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
          "X-Session-Token": session.token,
        },
        body: JSON.stringify(newsForm),
      });

      if (response.ok) {
        toast.success(
          editingNews
            ? "News article updated successfully"
            : "News article created successfully"
        );
        setNewsDialogOpen(false);
        setEditingNews(null);
        setNewsForm({
          title: "",
          excerpt: "",
          category: "Announcement",
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          readTime: "3 min read",
        });
        loadData();
      } else {
        toast.error("Failed to save news article");
      }
    } catch (error) {
      console.error("News save error:", error);
      toast.error("Failed to save news article");
    }
  };

  const openEventEdit = (event: any) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title || "",
      date: event.date || "",
      time: event.time || "",
      location: event.location || "",
      attendees: event.attendees || 0,
      category: event.category || "Networking",
      image: event.image || "",
      status: event.status || "upcoming",
    });
    setEventDialogOpen(true);
  };

  const openJobEdit = (job: any) => {
    setEditingJob(job);
    setJobForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      type: job.type || "Full-time",
      salary: job.salary || "",
      posted: job.posted || "Today",
      postedBy: job.postedBy || "",
      tags: job.tags || [],
    });
    setJobDialogOpen(true);
  };

  const openNewsEdit = (article: any) => {
    setEditingNews(article);
    setNewsForm({
      title: article.title || "",
      excerpt: article.excerpt || "",
      category: article.category || "Announcement",
      date: article.date || "",
      readTime: article.readTime || "3 min read",
    });
    setNewsDialogOpen(true);
  };

  const addTag = () => {
    if (tagInput.trim() && !jobForm.tags.includes(tagInput.trim())) {
      setJobForm({ ...jobForm, tags: [...jobForm.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setJobForm({ ...jobForm, tags: jobForm.tags.filter((t) => t !== tag) });
  };

  if (!isModerator()) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Admin Dashboard</DialogTitle>
            <DialogDescription>
              Manage events, jobs, news articles, and users
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm">Total Events</CardTitle>
                    <Calendar className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl">{events.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm">Active Jobs</CardTitle>
                    <Briefcase className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl">{jobs.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm">News Articles</CardTitle>
                    <Newspaper className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl">{news.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl">{users.length}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3>Manage Events</h3>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingEvent(null);
                    setEventForm({
                      title: "",
                      date: "",
                      time: "",
                      location: "",
                      attendees: 0,
                      category: "Networking",
                      image: "",
                      status: "upcoming",
                    });
                    setEventDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
              <div className="space-y-2">
                {events.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No events found
                  </p>
                ) : (
                  events.map((event) => (
                    <Card key={event.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <h4>{event.title}</h4>
                          <p className="text-sm text-gray-600">{event.date}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEventEdit(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteItem("events", event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="jobs" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3>Manage Jobs</h3>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingJob(null);
                    setJobForm({
                      title: "",
                      company: "",
                      location: "",
                      type: "Full-time",
                      salary: "",
                      posted: "Today",
                      postedBy: "",
                      tags: [],
                    });
                    setJobDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Job
                </Button>
              </div>
              <div className="space-y-2">
                {jobs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No jobs found
                  </p>
                ) : (
                  jobs.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <h4>{job.title}</h4>
                          <p className="text-sm text-gray-600">{job.company}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openJobEdit(job)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteItem("jobs", job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="news" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3>Manage News</h3>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingNews(null);
                    setNewsForm({
                      title: "",
                      excerpt: "",
                      category: "Announcement",
                      date: new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }),
                      readTime: "3 min read",
                    });
                    setNewsDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Article
                </Button>
              </div>
              <div className="space-y-2">
                {news.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No news articles found
                  </p>
                ) : (
                  news.map((article) => (
                    <Card key={article.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <h4>{article.title}</h4>
                          <p className="text-sm text-gray-600">
                            {article.date}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openNewsEdit(article)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteItem("news", article.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <h3>Manage Users</h3>
              <div className="space-y-2">
                {users.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No users found
                  </p>
                ) : (
                  users.map((u) => (
                    <Card key={u.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <h4>{u.name}</h4>
                          <p className="text-sm text-gray-600">{u.email}</p>
                        </div>
                        <Badge
                          variant={u.role === "admin" ? "default" : "secondary"}
                        >
                          {u.role}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Event Form Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Event" : "Create Event"}
            </DialogTitle>
            <DialogDescription>
              {editingEvent
                ? "Update event details"
                : "Add a new event to the calendar"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                value={eventForm.title}
                onChange={(e) =>
                  setEventForm({ ...eventForm, title: e.target.value })
                }
                placeholder="Event title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-date">Date</Label>
                <Input
                  id="event-date"
                  value={eventForm.date}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, date: e.target.value })
                  }
                  placeholder="November 15, 2025"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-time">Time</Label>
                <Input
                  id="event-time"
                  value={eventForm.time}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, time: e.target.value })
                  }
                  placeholder="6:00 PM - 11:00 PM"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                value={eventForm.location}
                onChange={(e) =>
                  setEventForm({ ...eventForm, location: e.target.value })
                }
                placeholder="Grand Hotel Ballroom"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-attendees">Attendees</Label>
                <Input
                  id="event-attendees"
                  type="number"
                  value={eventForm.attendees}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      attendees: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="250"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-category">Category</Label>
                <Select
                  value={eventForm.category}
                  onValueChange={(value) =>
                    setEventForm({ ...eventForm, category: value })
                  }
                >
                  <SelectTrigger id="event-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Networking">Networking</SelectItem>
                    <SelectItem value="Professional Development">
                      Professional Development
                    </SelectItem>
                    <SelectItem value="Reunion">Reunion</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                    <SelectItem value="Career">Career</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-image">Image URL</Label>
              <Input
                id="event-image"
                value={eventForm.image}
                onChange={(e) =>
                  setEventForm({ ...eventForm, image: e.target.value })
                }
                placeholder="https://images.unsplash.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-status">Status</Label>
              <Select
                value={eventForm.status}
                onValueChange={(value) =>
                  setEventForm({ ...eventForm, status: value })
                }
              >
                <SelectTrigger id="event-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEventDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateEvent}>
                {editingEvent ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Form Dialog */}
      <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? "Edit Job" : "Create Job"}</DialogTitle>
            <DialogDescription>
              {editingJob
                ? "Update job posting details"
                : "Post a new job opportunity"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-title">Title</Label>
              <Input
                id="job-title"
                value={jobForm.title}
                onChange={(e) =>
                  setJobForm({ ...jobForm, title: e.target.value })
                }
                placeholder="Senior Product Manager"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-company">Company</Label>
                <Input
                  id="job-company"
                  value={jobForm.company}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, company: e.target.value })
                  }
                  placeholder="TechCorp Inc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-location">Location</Label>
                <Input
                  id="job-location"
                  value={jobForm.location}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, location: e.target.value })
                  }
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-type">Type</Label>
                <Select
                  value={jobForm.type}
                  onValueChange={(value) =>
                    setJobForm({ ...jobForm, type: value })
                  }
                >
                  <SelectTrigger id="job-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-salary">Salary</Label>
                <Input
                  id="job-salary"
                  value={jobForm.salary}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, salary: e.target.value })
                  }
                  placeholder="$150K - $200K"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-postedBy">Posted By</Label>
              <Input
                id="job-postedBy"
                value={jobForm.postedBy}
                onChange={(e) =>
                  setJobForm({ ...jobForm, postedBy: e.target.value })
                }
                placeholder="Sarah Johnson '18"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="job-tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                  placeholder="Add a tag"
                />
                <Button type="button" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {jobForm.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setJobDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateJob}>
                {editingJob ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* News Form Dialog */}
      <Dialog open={newsDialogOpen} onOpenChange={setNewsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNews ? "Edit News Article" : "Create News Article"}
            </DialogTitle>
            <DialogDescription>
              {editingNews
                ? "Update news article content"
                : "Publish a new news article"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="news-title">Title</Label>
              <Input
                id="news-title"
                value={newsForm.title}
                onChange={(e) =>
                  setNewsForm({ ...newsForm, title: e.target.value })
                }
                placeholder="Article title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="news-excerpt">Excerpt</Label>
              <Textarea
                id="news-excerpt"
                value={newsForm.excerpt}
                onChange={(e) =>
                  setNewsForm({ ...newsForm, excerpt: e.target.value })
                }
                placeholder="Brief description of the article"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="news-category">Category</Label>
                <Select
                  value={newsForm.category}
                  onValueChange={(value) =>
                    setNewsForm({ ...newsForm, category: value })
                  }
                >
                  <SelectTrigger id="news-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Announcement">Announcement</SelectItem>
                    <SelectItem value="Events">Events</SelectItem>
                    <SelectItem value="Programs">Programs</SelectItem>
                    <SelectItem value="Spotlight">Spotlight</SelectItem>
                    <SelectItem value="Insights">Insights</SelectItem>
                    <SelectItem value="Giving">Giving</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="news-readTime">Read Time</Label>
                <Input
                  id="news-readTime"
                  value={newsForm.readTime}
                  onChange={(e) =>
                    setNewsForm({ ...newsForm, readTime: e.target.value })
                  }
                  placeholder="3 min read"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="news-date">Date</Label>
              <Input
                id="news-date"
                value={newsForm.date}
                onChange={(e) =>
                  setNewsForm({ ...newsForm, date: e.target.value })
                }
                placeholder="October 20, 2025"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setNewsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateNews}>
                {editingNews ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
