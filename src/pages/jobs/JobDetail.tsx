import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Job } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Briefcase, MapPin, DollarSign, Clock, Building, Users, 
  ArrowLeft, CheckCircle 
} from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCandidate, user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    coverLetter: '',
    resumeUrl: user?.resumeUrl || '',
  });
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const response = await jobAPI.getJobById(id!);
      setJob(response.data);
    } catch (error) {
      console.error('Failed to fetch job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isCandidate) {
      alert('Only job seekers can apply for jobs');
      return;
    }

    setShowApplyModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!applyForm.resumeUrl) {
      alert('Please provide a resume URL');
      return;
    }

    setApplying(true);
    try {
      await applicationAPI.applyForJob({
        jobId: id,
        coverLetter: applyForm.coverLetter,
        resumeUrl: applyForm.resumeUrl,
      });
      setApplied(true);
      setShowApplyModal(false);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Job not found</h2>
          <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Button variant="ghost" onClick={() => navigate('/jobs')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        {applied && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center text-green-700">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Application submitted successfully!</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                    <CardDescription className="text-lg font-medium">
                      {job.employer.companyName || 'Company'}
                    </CardDescription>
                  </div>
                  {job.isFeatured && (
                    <span className="text-xs bg-primary text-white px-3 py-1 rounded">
                      Featured
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{job.jobType.replace('_', ' ')}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{job.salary}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Job Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Responsibilities</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{job.responsibilities}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Requirements</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{job.requirements}</p>
                </div>

                {job.skills.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 mb-6">
              <CardHeader>
                <CardTitle>Apply for this job</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full mb-4" 
                  onClick={handleApply}
                  disabled={applied}
                >
                  {applied ? 'Application Submitted' : 'Apply Now'}
                </Button>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{job._count?.applications || 0} applicants</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About the Company</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium">{job.employer.companyName}</div>
                    {job.employer.location && (
                      <div className="text-sm text-muted-foreground">{job.employer.location}</div>
                    )}
                  </div>
                  {job.employer.bio && (
                    <p className="text-sm text-muted-foreground">{job.employer.bio}</p>
                  )}
                  {job.employer.website && (
                    <a
                      href={job.employer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Visit website
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Apply Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>Apply for {job.title}</CardTitle>
                <CardDescription>Fill out the application form below</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resumeUrl">Resume URL *</Label>
                    <Input
                      id="resumeUrl"
                      placeholder="https://..."
                      value={applyForm.resumeUrl}
                      onChange={(e) => setApplyForm({ ...applyForm, resumeUrl: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload your resume to Google Drive, Dropbox, or similar and paste the public link
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                    <Textarea
                      id="coverLetter"
                      placeholder="Tell us why you're a great fit for this role..."
                      rows={6}
                      value={applyForm.coverLetter}
                      onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleSubmitApplication} 
                      disabled={applying}
                      className="flex-1"
                    >
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowApplyModal(false)}
                      disabled={applying}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
