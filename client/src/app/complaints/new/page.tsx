import ComplaintForm from '@/components/complaints/ComplaintForm';

export const metadata = {
  title: 'Submit Complaint | AI Grievance Intelligence System',
  description: 'File a new complaint with AI-powered automatic categorization and routing',
};

export default function NewComplaintPage() {
  return (
    <div className="py-4 animate-fade-in">
      <ComplaintForm />
    </div>
  );
}
