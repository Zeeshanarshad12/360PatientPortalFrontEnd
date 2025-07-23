export async function getConsentForms() {
  return Promise.resolve([
    {
      FormID: '1',
      Title: 'Surgery Consent',
      Content: `
        <h2>Surgery Consent Form</h2>

        <p>
          I, <strong>{{patient_name}}</strong>, hereby authorize <strong>{{practice_name}}</strong> and its medical staff to perform the surgical procedure described to me by my provider.
        </p>

        <h3>Risks and Benefits</h3>
        <p>
          I understand the nature, purpose, benefits, and risks associated with the procedure, including but not limited to bleeding, infection, reaction to anesthesia, and other complications.
        </p>

        <h3>Alternative Treatments</h3>
        <p>
          I have been informed of alternative treatment options and the consequences of not receiving the proposed treatment.
        </p>

        <h3>Patient Rights</h3>
        <p>
          I understand I have the right to refuse treatment or withdraw consent at any time before the procedure.
        </p>

        <h3>Consent to Anesthesia</h3>
        <p>
          I also consent to the administration of anesthesia as deemed necessary by the medical staff.
        </p>

        <p style="margin-top: 2rem;">
          Patient Signature: <strong>{{patient_signature}}</strong>
        </p>
        <p>Date: <strong>{{current_date}}</strong></p>
      `,
      Status: 'Pending',
    },
    {
      FormID: '2',
      Title: 'Privacy Policy',
      Content: `
        <h2>Patient Privacy Policy</h2>

        <p>
          This notice describes how your medical information may be used and disclosed and how you can access this information.
        </p>

        <h3>Your Rights</h3>
        <ul>
          <li>You have the right to access your medical records.</li>
          <li>You can request amendments to your personal health information.</li>
          <li>You may request restrictions on how we share your information.</li>
        </ul>

        <h3>Our Responsibilities</h3>
        <p>
          We are required by law to maintain the privacy of your health information and provide you with this notice.
        </p>

        <h3>Data Sharing</h3>
        <p>
          Your information may be shared for treatment, payment, and healthcare operations. We may also share information as required by law.
        </p>

        <h3>Complaints</h3>
        <p>
          If you believe your rights have been violated, you may file a complaint with our privacy officer or the Department of Health and Human Services.
        </p>

        <p style="margin-top: 2rem;">
          Patient Signature: <strong>{{patient_signature}}</strong>
        </p>
        <p>Date: <strong>{{current_date}}</strong></p>
      `,
      Status: 'Signed',
      SignedDate: '2025-07-09',
    },
    {
      FormID: '3',
      Title: 'Office Policy',
      Content: `
        <h2>Office Policy</h2>

        <p>
          Welcome to <strong>{{practice_name}}</strong>. We are committed to providing you with quality care in a professional and respectful environment. Please take a moment to review our office policies below.
        </p>

        <h3>Appointments</h3>
        <ul>
          <li>Please arrive at least 10 minutes before your scheduled appointment time.</li>
          <li>If you need to cancel or reschedule, we request a 24-hour notice.</li>
          <li>Missed appointments without notice may result in a cancellation fee.</li>
        </ul>

        <h3>Insurance and Payments</h3>
        <ul>
          <li>We accept most major insurance plans. Please bring your insurance card and ID to each visit.</li>
          <li>Co-pays and outstanding balances are due at the time of service.</li>
          <li>We accept cash, debit/credit cards, and online payments.</li>
        </ul>

        <h3>Confidentiality</h3>
        <p>
          Your personal health information is kept confidential in accordance with HIPAA guidelines. We do not release information without your written consent unless required by law.
        </p>

        <h3>Electronic Communication</h3>
        <p>
          We may contact you via email, SMS, or phone for appointment reminders and updates. Please inform us of your communication preferences.
        </p>

        <h3>Prescription Refills</h3>
        <p>
          Please allow 48 hours for processing prescription refill requests. For controlled substances, a consultation may be required.
        </p>

        <h3>Behavior Policy</h3>
        <p>
          We maintain a zero-tolerance policy for abusive language or behavior toward staff or other patients. Violations may result in termination of care.
        </p>

        <h3>Questions?</h3>
        <p>
          If you have any questions or concerns about these policies, feel free to ask any of our front desk staff or contact us at <strong>{{practice_phone}}</strong>.
        </p>

        <p style="margin-top: 2rem;">Thank you for choosing <strong>{{practice_name}}</strong>!</p>
      `,
      Status: 'Signed',
      SignedDate: '2025-07-10',
    },
    {
  FormID: '4',
  Title: 'Medical Procedure',
  Content: `
    <p><strong>Patient Name:</strong> {{patient_name}}</p>
    <p><strong>Date of Birth:</strong> {{date_of_birth}}</p>
    <p><strong>Procedure:</strong> Laparoscopic Appendectomy</p>

    <p>
      I, {{patient_name}}, authorize Dr. John Doe and his/her associates to perform the
      medical procedure described above. I understand the nature of the procedure, risks,
      benefits, and available alternatives, which have been explained to me.
    </p>

    <p>
      I acknowledge that:
      <ul>
        <li>I have had the opportunity to ask questions.</li>
        <li>I understand the procedure and associated risks.</li>
        <li>I may withdraw my consent at any time before the procedure.</li>
      </ul>
    </p>

    <p>
      <strong>Risks discussed:</strong> bleeding, infection, anesthesia complications,
      possible need for open surgery, injury to surrounding organs.
    </p>

    <p>
      <strong>Alternatives:</strong> Antibiotic therapy, monitoring, or no treatment.
    </p>

    <p>
      I voluntarily give my consent for the procedure to be performed.
    </p>

    <p>
      <strong>Signature:</strong> {{patient_signature}}  
    </p>

    <p>
      <strong>Date:</strong> {{current_date}}
    </p>
  `,
  Status: 'Pending'
},
{
  FormID: '12',
  Title: 'Hospital Procedure',
  Content: `
    <p><strong>Patient Name:</strong> {{patient_name}}</p>
    <p><strong>Date of Birth:</strong> {{date_of_birth}}</p>
    <p><strong>Procedure:</strong> Laparoscopic Appendectomy</p>

    <p>
      I, {{patient_name}}, authorize Dr. John Doe and his/her associates to perform the
      medical procedure described above. I understand the nature of the procedure, risks,
      benefits, and available alternatives, which have been explained to me.
    </p>

    <p>
      I acknowledge that:
      <ul>
        <li>I have had the opportunity to ask questions.</li>
        <li>I understand the procedure and associated risks.</li>
        <li>I may withdraw my consent at any time before the procedure.</li>
      </ul>
    </p>

    <p>
      <strong>Risks discussed:</strong> bleeding, infection, anesthesia complications,
      possible need for open surgery, injury to surrounding organs.
    </p>

    <p>
      <strong>Alternatives:</strong> Antibiotic therapy, monitoring, or no treatment.
    </p>

    <p>
      I voluntarily give my consent for the procedure to be performed.
    </p>

    <p>
      <strong>Signature:</strong> {{patient_signature}}  
    </p>

    <p>
      <strong>Date:</strong> {{current_date}}
    </p>
  `,
  Status: 'Pending'
}
  ]);
}
