import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../../services/api';
import type { Job, Application } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Briefcase, Plus, Eye, Trash2, Users, X } from 'lucide-react';

const EmployerDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedJobApplications, setSelectedJobApplications] = useState<Application[]>([]);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    location: '',
    salary: '',
    jobType: 'FULL_TIME',
    experienceLevel: '',
    industry: '',
    skills: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobAPI.getEmployerJobs();
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const jobData = {
        ...newJob,
        skills: newJob.skills.split(',').map(s => s.trim()).filter(s => s),
      };
      await jobAPI.createJob(jobData);
      setShowCreateModal(false);
      setNewJob({
        title: '',
        description: '',
        requirements: '',
        responsibilities: '',
        location: '',
        salary: '',
        jobType: 'FULL_TIME',
        experienceLevel: '',
        industry: '',
        skills: '',
      });
      fetchJobs();
    } catch (error) {
      alert('Failed to create job');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await jobAPI.deleteJob(id);
        fetchJobs();
      } catch (error) {
        alert('Failed to delete job');
      }
    }
  };

  const handleViewApplications = async (jobId: string) => {
    try {
      const response = await applicationAPI.getJobApplications(jobId);
      setSelectedJobApplications(response.data);
      setShowApplicationsModal(true);
    } catch (error) {
      alert('Failed to fetch applications');
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      await applicationAPI.updateApplicationStatus(applicationId, status);
      handleViewApplications(selectedJobApplications[0].jobId);
    } catch (error) {
      alert('Failed to update application status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Employer Dashboard</h1>
            <p className="text-muted-foreground">Manage your job postings and applications</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">{jobs.length}</div>
              <div className="text-sm text-muted-foreground">Active Jobs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">
                {jobs.reduce((acc, job) => acc + (job._count?.applications || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Applications</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold">
                {jobs.filter(j => j.isFeatured).length}
              </div>
              <div className="text-sm text-muted-foreground">Featured Jobs</div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">Loading your jobs...</div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">You haven't posted any jobs yet</p>
              <Button onClick={() => setShowCreateModal(true)}>Post Your First Job</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>
                        {job.location} • {job.jobType.replace('_', ' ')}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewApplications(job.id)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        {job._count?.applications || 0}
                      </Button>
                      <Link to={`/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {job.description}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Posted {new Date(job.postedDate).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Job Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <Card className="w-full max-w-2xl my-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Post a New Job</CardTitle>
                    <CardDescription>Fill in the details below</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateJob} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type *</Label>
                      <select
                        id="jobType"
                        value={newJob.jobType}
                        onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="CONTRACT">Contract</option>
                        <option value="INTERNSHIP">Internship</option>
                        <option value="REMOTE">Remote</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={newJob.location}
                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary</Label>
                      <Input
                        id="salary"
                        placeholder="e.g. $50,000 - $80,000"
                        value={newJob.salary}
                        onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry *</Label>
                      <Input
                        id="industry"
                        value={newJob.industry}
                        onChange={(e) => setNewJob({ ...newJob, industry: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level *</Label>
                    <Input
                      id="experienceLevel"
                      placeholder="e.g. Entry, Mid, Senior"
                      value={newJob.experienceLevel}
                      onChange={(e) => setNewJob({ ...newJob, experienceLevel: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsibilities">Responsibilities *</Label>
                    <Textarea
                      id="responsibilities"
                      rows={4}
                      value={newJob.responsibilities}
                      onChange={(e) => setNewJob({ ...newJob, responsibilities: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements *</Label>
                    <Textarea
                      id="requirements"
                      rows={4}
                      value={newJob.requirements}
                      onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Required Skills (comma separated)</Label>
                    <Input
                      id="skills"
                      placeholder="React, Node.js, TypeScript"
                      value={newJob.skills}
                      onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={creating} className="flex-1">
                      {creating ? 'Creating...' : 'Post Job'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                      disabled={creating}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Applications Modal */}
        {showApplicationsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <Card className="w-full max-w-4xl my-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Applications</CardTitle>
                    <CardDescription>
                      {selectedJobApplications.length} applicants
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApplicationsModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedJobApplications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No applications yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {selectedJobApplications.map((app) => (
                      <Card key={app.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {app.candidate?.firstName} {app.candidate?.lastName}
                              </CardTitle>
                              <CardDescription>{app.candidate?.email}</CardDescription>
                            </div>
                            <select
                              value={app.status}
                              onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)}
                              className="flex h-8 rounded-md border border-input bg-background px-2 py-1 text-sm"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="REVIEWED">Reviewed</option>
                              <option value="ACCEPTED">Accepted</option>
                              <option value="REJECTED">Rejected</option>
                            </select>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {app.coverLetter && (
                            <div className="mb-3">
                              <div className="text-sm font-medium mb-1">Cover Letter:</div>
                              <p className="text-sm text-muted-foreground">{app.coverLetter}</p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              View Resume
                            </a>
                            <span className="text-sm text-muted-foreground">
                              • Applied {new Date(app.appliedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
