export interface ConsentForm {
  PatientID: number;
  FormID: string;
  Title: string;
  Content: string;
  Status: 'Pending' | 'Signed';
  SignedDate?: string;
  Signature?: string;
}
